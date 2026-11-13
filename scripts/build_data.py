#!/usr/bin/env python3
"""Merge species-kb/*.json into data/species.json for the static site."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "species-kb"
OUT = ROOT / "data" / "species.json"


def flatten(doc):
    row = {"id": doc["id"], "scientificName": doc["scientificName"]}
    for project in doc["projects"].values():
        for key, value in project.items():
            if key != "id" and key not in row:
                row[key] = value
    return row


def main():
    rows = [flatten(json.loads(p.read_text(encoding="utf-8"))) for p in sorted(SRC.glob("*.json"))]
    rows.sort(key=lambda r: r["scientificName"].lower())
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps(rows, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {len(rows)} species to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
