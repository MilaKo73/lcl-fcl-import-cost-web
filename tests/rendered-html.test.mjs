import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("웹 셸이 해운 수입 대시보드를 노출한다", async () => {
  const [page, layout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /해운 수입 비용·경로 시뮬레이터/);
  assert.match(page, /src="\/dashboard\.html"/);
  assert.match(page, /title="LCL FCL 수입 물류비 계산 대시보드"/);
  assert.doesNotMatch(page + layout, /codex-preview|SkeletonPreview/);
});

test("대시보드가 핵심 견적 입력과 조건을 포함한다", async () => {
  const dashboard = await readFile(
    new URL("../public/dashboard.html", import.meta.url),
    "utf8",
  );

  assert.match(dashboard, /LCL/);
  assert.match(dashboard, /FCL/);
  assert.match(dashboard, /인코텀즈/);
  assert.match(dashboard, /HS CODE/);
  assert.match(dashboard, /안전운임/);
  assert.match(dashboard, /EXW/);
  assert.match(dashboard, /픽업지/);
});
