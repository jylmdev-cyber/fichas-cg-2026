#!/usr/bin/env python3
"""Valida data/fichas.json y genera data/fichas.js (lo usa el sitio) y data/fichas.csv (descarga).

Uso (desde la raíz del repositorio):
    python3 tools/build_data.py

Ejecútalo cada vez que edites data/fichas.json. Solo usa la biblioteca estándar de Python 3.8+.
"""
from __future__ import annotations

import csv
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "fichas.json"
OUT_JS = ROOT / "data" / "fichas.js"
OUT_CSV = ROOT / "data" / "fichas.csv"

REQUIRED = [
    "n", "nombre", "tipo", "ambito", "definicion", "construccion", "umbral", "logro",
    "calculo", "frecuencia", "fuente", "resp_tec", "resp_info", "notas", "pagina", "pagina_fin",
]
TIPOS = {"Indicador de desempeño", "Indicador de resultado", "Compromiso de mejora"}


def validate(fichas: list[dict]) -> list[str]:
    errors: list[str] = []
    seen: set[str] = set()
    for i, f in enumerate(fichas):
        ref = f"ficha[{i}] n={f.get('n', '?')}"
        for key in REQUIRED:
            if key not in f:
                errors.append(f"{ref}: falta el campo '{key}'")
        n = str(f.get("n", ""))
        if n in seen:
            errors.append(f"{ref}: número duplicado")
        seen.add(n)
        if f.get("tipo") not in TIPOS:
            errors.append(f"{ref}: tipo no reconocido '{f.get('tipo')}'")
        has_frac = "num" in f and "den" in f
        if not (has_frac or "formula" in f or "criterios" in f):
            errors.append(f"{ref}: requiere num/den, formula o criterios")
        if "num" in f and "den" not in f or "den" in f and "num" not in f:
            errors.append(f"{ref}: num y den deben ir juntos")
        for block in f.get("construccion", []):
            if not (isinstance(block, list) and len(block) == 2 and isinstance(block[1], list)):
                errors.append(f"{ref}: 'construccion' debe ser [[titulo, [items]], ...]")
                break
        for row in f.get("criterios", []):
            if not (isinstance(row, list) and len(row) == 2):
                errors.append(f"{ref}: cada criterio debe ser [texto, valor]")
                break
        if not isinstance(f.get("notas", []), list):
            errors.append(f"{ref}: 'notas' debe ser una lista")
        p, q = f.get("pagina"), f.get("pagina_fin")
        if not (isinstance(p, int) and isinstance(q, int) and 1 <= p <= q):
            errors.append(f"{ref}: páginas inválidas ({p}–{q})")
    return errors


def formula_text(f: dict) -> str:
    if "num" in f:
        pre = (f.get("pre") or "").strip()
        post = f.get("post", "× 100")
        s = f"{pre} ({f['num']}) / ({f['den']})".strip()
        return f"{s} {post}".strip()
    if "formula" in f:
        return f["formula"]
    rows = "; ".join(f"{t} [{v}]" if v else t for t, v in f["criterios"])
    return f"{f.get('criterios_titulo', 'Criterios')}: {rows}"


def main() -> int:
    fichas = json.loads(SRC.read_text(encoding="utf-8"))
    errors = validate(fichas)
    if errors:
        print("Errores en data/fichas.json:", *errors, sep="\n  - ")
        return 1

    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    payload = json.dumps(fichas, ensure_ascii=False, separators=(",", ":"))
    OUT_JS.write_text(
        "/* Generado por tools/build_data.py a partir de data/fichas.json. No editar a mano. */\n"
        f"window.FICHAS_META={{generado:\"{stamp}\",total:{len(fichas)}}};\n"
        f"window.FICHAS={payload};\n",
        encoding="utf-8",
    )

    cols = [
        ("N.°", lambda f: f["n"]),
        ("Nombre", lambda f: f["nombre"]),
        ("Tipo", lambda f: f["tipo"]),
        ("Ámbito de evaluación", lambda f: f["ambito"]),
        ("Definición", lambda f: f["definicion"]),
        ("Fórmula / criterios", formula_text),
        ("Construcción", lambda f: " | ".join(f"{h}: " + " · ".join(items) for h, items in f["construccion"])),
        ("Valor umbral", lambda f: f["umbral"]),
        ("Logro esperado", lambda f: f["logro"]),
        ("Cálculo de cumplimiento", lambda f: f["calculo"]),
        ("Frecuencia de medición", lambda f: f["frecuencia"]),
        ("Fuente de datos", lambda f: f["fuente"]),
        ("Responsable técnico", lambda f: f["resp_tec"]),
        ("Responsable de información", lambda f: f["resp_info"]),
        ("Notas", lambda f: " | ".join(f["notas"])),
        ("Páginas en el Anexo I", lambda f: f"{f['pagina']}–{f['pagina_fin']}"),
    ]
    with OUT_CSV.open("w", encoding="utf-8-sig", newline="") as fh:
        w = csv.writer(fh, delimiter=";", quoting=csv.QUOTE_MINIMAL)
        w.writerow([c for c, _ in cols])
        for f in fichas:
            w.writerow([str(fn(f)).replace("\n", " ") for _, fn in cols])

    print(f"OK: {len(fichas)} fichas → {OUT_JS.relative_to(ROOT)}, {OUT_CSV.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
