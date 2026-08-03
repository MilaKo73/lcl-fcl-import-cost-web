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
  for (const term of ["LCL", "FCL", "인코텀즈", "HS CODE", "안전위탁운임", "FCL 운임 8월 선사3.xlsx", "202608 안전운임제.xlsx", "터미널 확인 필요", "40GP/HQ"]) {
    assert.match(dashboard, new RegExp(term));
  }
  assert.doesNotMatch(dashboard, /CBM별 예상 총 물류비용/);
});

test("40GP와 40HQ를 하나의 규격으로 취급한다", async () => {
  const dashboard = await readFile(new URL("../public/dashboard.html", import.meta.url), "utf8");
  assert.match(dashboard, /<option value="40GP\/HQ">40GP\/HQ<\/option>/);
  assert.match(dashboard, /40GP\/HQ는 동일 규격으로 취급/);
  assert.doesNotMatch(dashboard, /<option value="40FT">40FT<\/option><option value="40HQ">/);
});

test("운임 조건 없이 POL은 자동 추천하고 POD는 사용자가 선택한다", async () => {
  const dashboard = await readFile(new URL("../public/dashboard.html", import.meta.url), "utf8");
  assert.doesNotMatch(dashboard, /<label for="term">운임 조건<\/label>/);
  assert.match(dashboard, /<label for="pod">국내 도착항\(POD\) \*<\/label>/);
  assert.match(dashboard, /부산항 · KRPUS/);
  assert.match(dashboard, /인천항 · KRINC/);
  assert.match(dashboard, /출발지 인접 POL 자동 추천/);
  assert.match(dashboard, /r\.pol===org\.pol&&r\.podCode===podCode/);
});

test("희망 출항일 입력 항목을 노출하지 않는다", async () => {
  const dashboard = await readFile(new URL("../public/dashboard.html", import.meta.url), "utf8");
  assert.doesNotMatch(dashboard, /희망 출항일/);
  assert.doesNotMatch(dashboard, /id="date"/);
});

test("Open Exchange Rates를 서버 경유로 적용하고 App ID를 노출하지 않는다", async () => {
  const [dashboard, worker] = await Promise.all([
    readFile(new URL("../public/dashboard.html", import.meta.url), "utf8"),
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
  ]);
  assert.match(worker, /OPEN_EXCHANGE_RATES_APP_ID/);
  assert.match(worker, /openexchangerates\.org\/api\/latest\.json/);
  assert.match(worker, /api\/exchange-rate/);
  assert.match(dashboard, /fetch\('\/api\/exchange-rate'\)/);
  assert.match(dashboard, /1 USD =/);
  assert.doesNotMatch(worker, /app_id\s*[:=]\s*["'][0-9a-f]{32}["']/i);
});

test("대시보드 전반에 블루 컬러 팔레트를 적용한다", async () => {
  const [dashboard, globals] = await Promise.all([
    readFile(new URL("../public/dashboard.html", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(dashboard, /--teal:#2563eb/);
  assert.match(dashboard, /--teal2:#e8f0ff/);
  assert.match(globals, /--accent: #2563eb/);
  assert.match(globals, /--accent-soft: #e8f0ff/);
});

test("인코텀즈 옆에 자동 POL과 선택 POD를 표시한다", async () => {
  const dashboard = await readFile(new URL("../public/dashboard.html", import.meta.url), "utf8");
  const incotermIndex = dashboard.indexOf('id="incoterm"');
  const polIndex = dashboard.indexOf('id="pol-display"');
  const podIndex = dashboard.indexOf('id="pod"');
  assert.ok(incotermIndex < polIndex && polIndex < podIndex);
  assert.match(dashboard, /id="pol-display"[^>]*readonly/);
  assert.match(dashboard, /\$\('pol-display'\)\.value=org\.pol/);
});

test("통합견적과 해외 파트너 관리 메뉴를 제공하고 관할 파트너를 추천한다", async () => {
  const dashboard = await readFile(new URL("../public/dashboard.html", import.meta.url), "utf8");
  assert.match(dashboard, /해상비용 통합견적 조건/);
  assert.match(dashboard, /해외 파트너 정보 관리/);
  assert.match(dashboard, /id="partner-view"/);
  assert.match(dashboard, /const partnerDB=/);
  assert.match(dashboard, /Shanghai Blue Logistics/);
  assert.match(dashboard, /Shenzhen Gateway Partners/);
  assert.match(dashboard, /function partnerForOrigin/);
  assert.match(dashboard, /추천 파트너:/);
  assert.match(dashboard, /관세청 항구 DB 연결 완료/);
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

test("LCL은 DB 부재로 모든 운송료를 별도 확인 처리한다", async () => {
  const dashboard = await readFile(new URL("../public/dashboard.html", import.meta.url), "utf8");
  assert.match(dashboard, /LCL 운임 DB가 등록되지 않아/);
  assert.match(dashboard, /LCL 운송료 별도 확인/);
  assert.match(dashboard, /LCL 운임 DB 없음/);
  assert.doesNotMatch(dashboard, /rt\*118|가상 CFS 비용/);
});
