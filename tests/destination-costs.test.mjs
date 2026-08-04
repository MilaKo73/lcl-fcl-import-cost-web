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
  assert.match(dashboard, /도착지 비용 합계/);
  assert.match(dashboard, /W\/M\(RT\) 기준/);
});
