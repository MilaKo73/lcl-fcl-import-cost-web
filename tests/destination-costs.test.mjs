import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Busan and Incheon destination costs are selected by POD", async () => {
  const [dashboard, raw] = await Promise.all([
    readFile(new URL("../public/dashboard.html", import.meta.url), "utf8"),
    readFile(new URL("../public/data/destination-costs-202608.json", import.meta.url), "utf8"),
  ]);
  const data = JSON.parse(raw);
  assert.equal(data.ports.KRPUS["20FT"].THC, 150000);
  assert.equal(data.ports.KRINC["20FT"].WFG, 4200);
  assert.equal(data.ports.KRPUS["40GP/HQ"].WFG, 8858);
  assert.equal(data.ports.KRINC["40GP/HQ"].WFG, 8400);
  assert.equal(data.ports.KRPUS.LCL.CFS, 8000);
  assert.match(dashboard, /destination-costs-202608\.json/);
  assert.match(dashboard, /function destinationRows/);
  assert.match(dashboard, /도착지 비용 KRW 합계/);
  assert.match(dashboard, /도착지 부대비용 \+ 국내 컨테이너 운송료/);
  assert.match(dashboard, /\['최종 물류비','전체 구간'/);
  assert.match(dashboard, /usdCostTotal\*exchangeRate\+krwDestinationTotal/);
  assert.match(dashboard, /해상운임 \+ 선적지 별도비용의 KRW 환산액 \+ 도착지 비용 전체/);
  assert.doesNotMatch(dashboard, /id="kpi-inland"/);
  assert.doesNotMatch(dashboard, /\['국내운송료 합계'/);
  assert.ok(dashboard.indexOf("<h3>비용 테이블</h3>") < dashboard.indexOf("<h3>추천 경로 요약</h3>"));
  assert.ok(dashboard.indexOf("<h3>비용 테이블</h3>") < dashboard.indexOf("출발지 관할 파트너 추천"));
  assert.match(dashboard, /W\/M\(RT\) 기준/);
});
