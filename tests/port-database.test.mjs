import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("customs worldwide port database is connected", async () => {
  const [dashboard, rawPortData] = await Promise.all([
    readFile(new URL("../public/dashboard.html", import.meta.url), "utf8"),
    readFile(new URL("../public/data/customs-port-codes-202608.json", import.meta.url), "utf8"),
  ]);
  const portData = JSON.parse(rawPortData);
  assert.equal(portData.count, 27491);
  assert.equal(portData.countryCount, 248);
  assert.equal(portData.ports.length, 27491);
  assert.ok(portData.ports.some((port) => port.code === "CNSHA"));
  assert.match(dashboard, /port-country-filter/);
  assert.match(dashboard, /customs-port-codes-202608\.json/);
  assert.match(dashboard, /loadPortCatalog/);
  assert.match(dashboard, /관세청 항구 DB 연결 완료/);
});
