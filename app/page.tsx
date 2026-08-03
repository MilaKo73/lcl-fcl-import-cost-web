"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [frameHeight, setFrameHeight] = useState(2400);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    let observer: ResizeObserver | null = null;
    const resize = () => {
      const doc = frame.contentDocument?.documentElement;
      if (doc) setFrameHeight(Math.max(900, doc.scrollHeight + 24));
    };
    const loaded = () => {
      resize();
      const doc = frame.contentDocument?.documentElement;
      if (doc) {
        observer = new ResizeObserver(resize);
        observer.observe(doc);
      }
    };
    frame.addEventListener("load", loaded);
    return () => {
      frame.removeEventListener("load", loaded);
      observer?.disconnect();
    };
  }, []);

  return (
    <main className="site-shell">
      <header className="site-header">
        <div>
          <p className="eyebrow">IMPORT COST PLANNER</p>
          <h1>해상 수입물류 비용 산정 테이블</h1>
          <p className="site-description">
            LCL/FCL 기본 견적과 FCL 해상운임·국내 안전위탁운임 DB를 한 화면에서 비교합니다.
          </p>
        </div>
        <span className="sample-badge">가상 DB · Excel 연동 예정</span>
      </header>
      <section className="dashboard-surface" aria-label="해상 수입물류 비용 대시보드">
        <iframe ref={frameRef} className="dashboard-frame" src="/dashboard.html" title="해상 수입물류 비용 산정 대시보드" style={{ height: `${frameHeight}px` }} />
      </section>
      <footer>표시 운임과 세율은 기능 검증용 예시입니다. 실제 계약·수입신고 전 최신 운임표와 고시를 확인하세요.</footer>
    </main>
  );
}
