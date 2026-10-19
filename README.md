# Catálogo de Fichas Técnicas · Convenios de Gestión 2026

Sitio web estático con las **52 fichas técnicas** (N.° 01 a 48, incluidas 37.1 a 37.5) del *Anexo I: Listado de indicadores de desempeño (ID), compromisos de mejora de los servicios (CM) y fichas técnicas del Año 2026* (MINSA, diciembre 2025).

Está listo para publicarse en **GitHub Pages**. No necesita servidor, base de datos ni compilación.

## Qué incluye

| Función | Detalle |
|---|---|
| Catálogo | Tarjetas o tabla, con búsqueda sin tildes en todo el texto de la ficha (nombre, códigos CIE/CPMS, fuentes, notas…) |
| Filtros | Tipo (ID / IR / CM), frecuencia de medición, responsable técnico y fuente de datos; orden por N.° o por nombre |
| Ficha | Identificación, fórmula (numerador / denominador) o criterios, construcción, metas, cálculo de cumplimiento, frecuencia, fuente, responsables y notas |
| Compartir | Enlace propio por ficha (`#/ficha/05`) y por búsqueda (`#/?q=anemia&tipo=ID`), código QR en pantalla, QR descargable en PNG, WhatsApp y menú nativo del celular |
| Documento fuente | Botón «Ver en el Anexo I» que abre el PDF oficial en la página de cada ficha |
| Impresión | Hoja A4 por ficha con su enlace y QR |
| Descargas | PDF oficial, CSV (Excel) y JSON |
| Otros | Tema claro / oscuro, diseño adaptable a celular, atajos de teclado (`/` busca; `←` `→` cambian de ficha) |

## Publicar en GitHub Pages (5 minutos)

1. En GitHub, crea un repositorio **público** llamado `fichas-cg-2026`. Puedes usar otro nombre (ver paso 5).
2. Sube **el contenido** de esta carpeta a la raíz del repositorio (no la carpeta en sí). Incluye el archivo oculto `.nojekyll`.
   - Desde la web: *Add file → Upload files* y arrastra todo.
   - Desde la terminal:
     ```bash
     cd fichas-cg-2026
     git init -b main
     git add .
     git commit -m "Catálogo de fichas técnicas CG 2026"
     git remote add origin https://github.com/jylmdev-cyber/fichas-cg-2026.git
     git push -u origin main
     ```
3. En el repositorio entra a **Settings → Pages**. En *Build and deployment* elige **Deploy from a branch**, rama `main`, carpeta `/ (root)` y pulsa **Save**.
4. En 1–2 minutos el sitio queda en `https://jylmdev-cyber.github.io/fichas-cg-2026/`. GitHub muestra el enlace en la misma pantalla.
5. Si usaste otro usuario o nombre de repositorio, actualiza la vista previa para redes sociales:
   ```bash
   python3 tools/configurar_url.py --url https://USUARIO.github.io/REPOSITORIO/
   ```
   Luego sube el `index.html` modificado.

Los QR se generan con la dirección desde la que se abre el sitio, así que funcionan con cualquier nombre de repositorio o dominio propio.

## Ver en local

Haz doble clic en `index.html`; funciona sin servidor. Para probarlo como en GitHub Pages:

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Actualizar el contenido

La única fuente de datos es `data/fichas.json`. Después de editarla, ejecuta:

```bash
python3 tools/build_data.py
```

El script valida la estructura y regenera `data/fichas.js` (lo que lee el sitio) y `data/fichas.csv`. Después sube los tres archivos.

Campos de cada ficha:

| Campo | Contenido |
|---|---|
| `n` | Número de la ficha (`"01"`, `"37.1"`) |
| `nombre`, `tipo`, `ambito`, `definicion` | Identificación |
| `num` + `den` | Numerador y denominador. Opcionales: `pre` (p. ej. `"1 −"`) y `post` (por defecto `"× 100"`; `""` lo omite) |
| `formula` | Fórmula en texto, cuando no es una fracción simple |
| `criterios` + `criterios_titulo` | Lista `[criterio, valor]` para los compromisos de mejora; `valor_label` cambia el título de la columna |
| `construccion` | Lista `[título, [elementos]]` |
| `umbral`, `logro`, `calculo`, `frecuencia`, `fuente`, `resp_tec`, `resp_info` | Metas, medición y responsables |
| `notas` | Lista de notas |
| `pagina`, `pagina_fin` | Páginas de la ficha en el PDF del Anexo I |

## Estructura

```
fichas-cg-2026/
├── index.html                 Página única (rutas con #)
├── 404.html                   Página de error de GitHub Pages
├── manifest.webmanifest       Instalación en el celular
├── .nojekyll                  Publica los archivos tal cual en GitHub Pages
├── assets/
│   ├── css/styles.css
│   ├── js/app.js              Lógica del catálogo
│   ├── js/vendor/qrcode.js    Generador QR (MIT, Kazuhiko Arase)
│   └── img/                   Favicon, íconos y vista previa para redes (og-image.png)
├── data/
│   ├── fichas.json            Fuente de datos (editar aquí)
│   ├── fichas.js              Generado
│   └── fichas.csv             Generado (separador ;, UTF-8 con BOM para Excel)
├── docs/
│   └── anexo-i-fichas-tecnicas-cg-2026.pdf
└── tools/
    ├── build_data.py          Valida y regenera los datos
    └── configurar_url.py      Ajusta las URL de vista previa
```

## Notas

- El catálogo resume el contenido de cada ficha **sin agregar información**. Ante cualquier diferencia, prevalece el documento oficial del MINSA.
- Los filtros de frecuencia, responsable técnico y fuente de datos se obtienen del texto de cada ficha.
- Todo se sirve desde el propio repositorio: no hay CDN, analítica ni cookies. Solo se guardan en el navegador el tema y la vista preferidos.
- Bibliotecas de terceros: `assets/js/vendor/qrcode.js`, QR Code Generator for JavaScript © 2009 Kazuhiko Arase, licencia MIT. «QR Code» es marca registrada de DENSO WAVE INCORPORATED.

---
OITE · Red de Salud San Miguel – DIRESA Cajamarca
