/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  OPEN_EXCHANGE_RATES_APP_ID?: string;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/exchange-rate") {
      if (!env.OPEN_EXCHANGE_RATES_APP_ID) {
        return Response.json({ error: "환율 API 설정이 필요합니다." }, { status: 503 });
      }

      try {
        const apiUrl = new URL("https://openexchangerates.org/api/latest.json");
        apiUrl.searchParams.set("app_id", env.OPEN_EXCHANGE_RATES_APP_ID);
        apiUrl.searchParams.set("symbols", "KRW");
        const response = await fetch(apiUrl, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`Exchange API ${response.status}`);
        const data = await response.json() as { base?: string; timestamp?: number; rates?: { KRW?: number } };
        const rate = data.rates?.KRW;
        if (!rate || !Number.isFinite(rate)) throw new Error("Invalid KRW rate");
        return Response.json(
          { base: data.base ?? "USD", quote: "KRW", rate, timestamp: data.timestamp ?? null },
          { headers: { "Cache-Control": "public, max-age=900, stale-while-revalidate=3600" } },
        );
      } catch {
        return Response.json({ error: "최신 환율을 불러오지 못했습니다." }, { status: 502 });
      }
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
