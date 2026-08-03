import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("real overseas partner workbook data is connected", async () => {
  const [dashboard, raw] = await Promise.all([
    readFile(new URL("../public/dashboard.html", import.meta.url), "utf8"),
    readFile(new URL("../public/data/partners-202608.json", import.meta.url), "utf8"),
  ]);
  const data = JSON.parse(raw);
  assert.equal(data.count, 408);
  assert.equal(data.countryCount, 90);
  assert.equal(data.matchedPortCount, 359);
  assert.equal(data.unmatchedCountries.length, 0);
  assert.ok(data.partners.some((partner) => partner.partner.includes("Korchina") && partner.city === "Shanghai"));
  assert.ok(data.partners.some((partner) => partner.partner.includes("Taewoong") && partner.city === "Shenzhen"));
  assert.match(dashboard, /partners-202608\.json/);
  assert.match(dashboard, /partner-country-count/);
  assert.match(dashboard, /partnerForOrigin/);
});
