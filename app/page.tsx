"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [frameHeight, setFrameHeight] = useState(2200);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    let observer: ResizeObserver | null = null;

    const resize = () => {
      const documentElement = frame.contentDocument?.documentElement;
      if (!documentElement) return;
      setFrameHeight(Math.max(900, documentElement.scrollHeight + 24));
    };

    const handleLoad = () => {
      resize();
      const documentElement = frame.contentDocument?.documentElement;
      if (!documentElement) return;
      observer = new ResizeObserver(resize);
      observer.observe(documentElement);
    };

    frame.addEventListener("load", handleLoad);
    return () => {
      frame.removeEventListener("load", handleLoad);
      observer?.disconnect();
    };
  }, []);

  return (
    <main className="site-shell">
      <header className="site-header">
        <div>
          <p className="eyebrow">IMPORT COST PLANNER</p>
          <h1>해운 수입 비용·경로 시뮬레이터</h1>
          <p className="site-description">
            LCL/FCL, 인코텀즈, HS CODE, 선적항 및 국내 안전운임을 한 번에
            검토합니다.
          </p>
        </div>
        <span className="sample-badge">가상 요율 데이터</span>
      </header>

      <section className="dashboard-surface" aria-label="수입 물류비 대시보드">
        <iframe
          ref={frameRef}
          className="dashboard-frame"
          src="/dashboard.html"
          title="LCL FCL 수입 물류비 계산 대시보드"
          style={{ height: `${frameHeight}px` }}
        />
      </section>

      <footer>
        본 서비스의 운임·세율·주소 데이터는 기능 확인용 예시입니다. 실제
        계약과 수입신고 전 최신 고시 및 전문가 확인이 필요합니다.
      </footer>
    </main>
  );
}
