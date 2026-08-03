import json
import re
import sys
from pathlib import Path

import openpyxl


SOURCE = Path(sys.argv[1])
PORTS = Path(sys.argv[2])
OUTPUT = Path(sys.argv[3])


def clean(value):
    return " ".join(str(value or "").replace("\r", " ").replace("\n", " ").split())


def norm(value):
    return re.sub(r"[^a-z0-9]", "", clean(value).lower())


COUNTRY_ALIASES = {
    "Albania":"AL","Australia":"AU","Austria":"AT","Azerbaijan":"AZ","Bahrain":"BH",
    "Bangladesh":"BD","Belgium":"BE","Bhutan":"BT","Bolivia":"BO","Brazil":"BR","Brunei":"BN",
    "Cambodia":"KH","Canada":"CA","Chile":"CL","China":"CN","CHINA":"CN","Colombia":"CO",
    "Czech":"CZ","Czech Republic":"CZ","Denmark":"DK","Dominican Republic":"DO","Ecuador":"EC",
    "Egypt":"EG","El Salvador":"SV","Estonia":"EE","Finland":"FI","France":"FR","Georgia":"GE",
    "Germany":"DE","GERMANY":"DE","Ghana":"GH","Greece":"GR","Guam":"GU","Hong Kong":"HK",
    "Hungary":"HU","India":"IN","Indonesia":"ID","Iran":"IR","Israel":"IL","Italy":"IT","Japan":"JP",
    "Jordan":"JO","KUWAIT":"KW","Korea":"KR","South Korea":"KR","Laos":"LA","Latvia":"LV",
    "Lebanon":"LB","Lithuania":"LT","Macao":"MO","Malaysia":"MY","Mauritius":"MU","Mexico":"MX",
    "Moldova":"MD","Mongolia":"MN","Myanmar":"MM","Netherlands":"NL","New Zealand":"NZ",
    "Nicaragua":"NI","Norway":"NO","Oman":"OM","Pakistan":"PK","Panama":"PA","Paraguay":"PY",
    "Peru":"PE","Philippines":"PH","Poland":"PL","Portugal":"PT","Qatar":"QA","Russia":"RU",
    "Saipan":"MP","Saudi Arabia":"SA","Senegal":"SN","Serbia":"RS","Singapore":"SG","Slovakia":"SK",
    "Slovenia":"SI","South Africa":"ZA","Spain":"ES","Sri Lanka":"LK","Sweden":"SE",
    "Switzerlands":"CH","Syria":"SY","Taiwan":"TW","TAIWAN":"TW","Thailand":"TH","Tunis":"TN",
    "Turkey":"TR","Turkmenistan":"TM","UAE":"AE","U.A.E":"AE","UAE/OMAN":"AE","Ukraine":"UA",
    "United Arab Emirates":"AE","United Arab Emirates (UAE)":"AE","United Kingdom":"GB","United States":"US",
    "Uzbekistan":"UZ","Vietnam":"VN","YEMEN":"YE",
}


def country_code(name):
    return COUNTRY_ALIASES.get(name, "")


port_data = json.loads(PORTS.read_text(encoding="utf-8"))
ports_by_country = {}
for port in port_data["ports"]:
    ports_by_country.setdefault(port["country"], []).append(port)

workbook = openpyxl.load_workbook(SOURCE, read_only=True, data_only=True)
sheet = workbook["해외파트너"]
records = []
unmatched_countries = set()

for row_number, row in enumerate(sheet.iter_rows(min_row=7, values_only=True), start=7):
    partner, region, country, city, work_code, settlement_code, email, address, phone, brochure, contract = row[:11]
    if not clean(partner) or not clean(country):
        continue
    country_name, city_name = clean(country), clean(city)
    iso2 = country_code(country_name)
    if not iso2:
        unmatched_countries.add(country_name)
    city_key = norm(city_name)
    candidates = []
    if iso2 and city_key:
        for port in ports_by_country.get(iso2, []):
            port_key = norm(port["name"])
            if city_key == port_key or city_key in port_key or port_key in city_key:
                candidates.append(port)
    candidates.sort(key=lambda p: (len(norm(p["name"])), p["name"], p["code"]))
    best = candidates[0] if candidates else None
    records.append({
        "partner": clean(partner), "region": clean(region), "country": country_name,
        "countryCode": iso2, "city": city_name, "workCode": clean(work_code),
        "settlementCode": clean(settlement_code), "email": clean(email),
        "address": clean(address), "phone": clean(phone), "brochure": clean(brochure),
        "contract": clean(contract), "portName": best["name"] if best else "",
        "portCode": best["code"] if best else "", "portMatch": "city-name" if best else "needs-review",
        "sourceRow": row_number,
    })

payload = {
    "source": SOURCE.name, "asOf": "2026-08", "count": len(records),
    "countryCount": len({r["countryCode"] for r in records if r["countryCode"]}),
    "matchedPortCount": sum(1 for r in records if r["portCode"]),
    "unmatchedCountries": sorted(unmatched_countries), "partners": records,
}
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(json.dumps({k: payload[k] for k in ("count", "countryCount", "matchedPortCount", "unmatchedCountries")}, ensure_ascii=False))
