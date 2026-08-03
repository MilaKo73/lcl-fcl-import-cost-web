import json
import sys
from pathlib import Path

import openpyxl


source = Path(sys.argv[1])
output = Path(sys.argv[2])
workbook = openpyxl.load_workbook(source, read_only=True, data_only=True)
sheet = workbook["항구부호목록"]

ports = []
seen = set()
duplicates = 0
for code, name, country in sheet.iter_rows(min_row=2, values_only=True):
    code = str(code or "").strip().upper()
    name = str(name or "").strip()
    country = str(country or "").strip().upper()
    if not code or not name or len(country) != 2:
        continue
    if code in seen:
        duplicates += 1
        continue
    seen.add(code)
    ports.append({"code": code, "name": name, "country": country})

ports.sort(key=lambda row: (row["country"], row["name"], row["code"]))
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(
    json.dumps(
        {
            "source": source.name,
            "asOf": "2026-08",
            "count": len(ports),
            "countryCount": len({row["country"] for row in ports}),
            "ports": ports,
        },
        ensure_ascii=False,
        separators=(",", ":"),
    ),
    encoding="utf-8",
)
print(json.dumps({"ports": len(ports), "countries": len({row['country'] for row in ports}), "duplicates": duplicates}, ensure_ascii=False))
