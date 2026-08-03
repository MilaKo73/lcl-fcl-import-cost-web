import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("웹 셸이 해상 수입물류 대시보드를 노출한다", async () => {
  const [page, layout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /해상 수입물류 비용 산정 테이블/);
  assert.match(page, /src="\/dashboard\.html"/);
  assert.match(page, /title="해상 수입물류 비용 산정 대시보드"/);
});

test("대시보드가 기존 기능과 신규 DB 규칙을 포함한다", async () => {
  const dashboard = await readFile(new URL("../public/dashboard.html", import.meta.url), "utf8");
  for (const term of ["LCL", "FCL", "인코텀즈", "HS CODE", "안전위탁운임", "FCL 운임 8월 선사3.xlsx", "202608 안전운임제.xlsx", "터미널 확인 필요", "40HQ"]) {
    assert.match(dashboard, new RegExp(term));
  }
  assert.doesNotMatch(dashboard, /CBM별 예상 총 물류비용/);
});

test("실제 3개 선사 운임과 계약번호 제외 규칙을 반영한다", async () => {
  const dashboard = await readFile(new URL("../public/dashboard.html", import.meta.url), "utf8");
  assert.match(dashboard, /실제 3개 선사 · 132개 운임 행/);
  assert.match(dashboard, /line:'CK'.*polCode:'CNSHA'.*podCode:'KRPUS'.*f20:150,f40:300/);
  assert.match(dashboard, /line:'KMTC'.*polCode:'CNSHA'.*podCode:'KRINC'.*f20:430,f40:860/);
  assert.match(dashboard, /line:'NAMSUNG'.*polCode:'CNSHK'.*podCode:'KRINC'.*f20:250,f40:500/);
  assert.doesNotMatch(dashboard, /SEO\d{4,}/);
  assert.doesNotMatch(dashboard, /SC NO/);
});

test("실제 202608 안전위탁운임 대표값을 반영한다", async () => {
  const dashboard = await readFile(new URL("../public/dashboard.html", import.meta.url), "utf8");
  assert.match(dashboard, /실제 14개 항만 시트/);
  assert.match(dashboard, /'부산신항':\{km:392,r20:930600,r40:1057600\}/);
  assert.match(dashboard, /'인천신항':\{km:55,r20:336800,r40:378000\}/);
  assert.match(dashboard, /202608 안전운임제/);
});
