#!/usr/bin/env python3
"""Ajusta las URL absolutas de index.html (canonical, og:url y og:image) a la dirección pública del sitio.

WhatsApp, Facebook y otras redes necesitan URL absolutas para mostrar la tarjeta de vista previa.

Uso:
    python3 tools/configurar_url.py --url https://USUARIO.github.io/REPOSITORIO/
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

INDEX = Path(__file__).resolve().parent.parent / "index.html"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--url", required=True, help="URL pública del sitio, p. ej. https://usuario.github.io/fichas-cg-2026/")
    base = ap.parse_args().url.strip()
    if not re.match(r"^https?://[^\s\"'<>]+$", base):
        print("La URL debe empezar con http:// o https:// y no contener espacios ni comillas.")
        return 1
    if not base.endswith("/"):
        base += "/"

    html = INDEX.read_text(encoding="utf-8")
    count = 0

    def fix(m: re.Match) -> str:
        nonlocal count
        tag = m.group(0)
        sub = re.search(r'data-site-url="([^"]*)"', tag)
        target = base + (sub.group(1) if sub else "")
        attr = "href" if tag.startswith("<link") else "content"
        count += 1
        return re.sub(rf'{attr}="[^"]*"', f'{attr}="{target}"', tag, count=1)

    html = re.sub(r"<(?:link|meta)\b[^>]*\bdata-site-url\b[^>]*>", fix, html)
    INDEX.write_text(html, encoding="utf-8")
    print(f"OK: {count} etiquetas actualizadas con {base}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
