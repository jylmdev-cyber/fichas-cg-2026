/* Catálogo de Fichas Técnicas CG 2026
   Sitio estático sin dependencias de compilación. Rutas por hash:
     #/                       catálogo (acepta ?q=&tipo=&freq=&resp=&fuente=&orden=&vista=)
     #/ficha/05               detalle de una ficha
     #/guia                   guía de lectura y descargas
   Los datos vienen de data/fichas.js (generado por tools/build_data.py). */
(function () {
  "use strict";

  var FICHAS = Array.isArray(window.FICHAS) ? window.FICHAS : [];
  var META = window.FICHAS_META || {};
  var PDF = "docs/anexo-i-fichas-tecnicas-cg-2026.pdf";
  var SITE = "Fichas Técnicas CG 2026";
  var app = document.getElementById("app");

  /* ---------- utilidades ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // Pliega tildes y mayúsculas conservando la longitud (permite resaltar en el texto original).
  function fold(s) {
    s = String(s == null ? "" : s);
    var out = "";
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i), d = c.normalize ? c.normalize("NFD").charAt(0) : c;
      var l = d.toLowerCase();
      out += l.length === 1 ? l : d;
    }
    return out;
  }
  function terms(q) { return fold(q).split(/\s+/).filter(function (t) { return t.length > 0; }); }
  function hl(text, ts) {
    text = String(text == null ? "" : text);
    if (!ts || !ts.length) return esc(text);
    var f = fold(text), ranges = [];
    ts.forEach(function (t) {
      var from = 0, i;
      while ((i = f.indexOf(t, from)) !== -1) { ranges.push([i, i + t.length]); from = i + t.length; }
    });
    if (!ranges.length) return esc(text);
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    var merged = [ranges[0]];
    for (var k = 1; k < ranges.length; k++) {
      var last = merged[merged.length - 1];
      if (ranges[k][0] <= last[1]) last[1] = Math.max(last[1], ranges[k][1]); else merged.push(ranges[k]);
    }
    var html = "", pos = 0;
    merged.forEach(function (r) {
      html += esc(text.slice(pos, r[0])) + "<mark>" + esc(text.slice(r[0], r[1])) + "</mark>";
      pos = r[1];
    });
    return html + esc(text.slice(pos));
  }
  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; }
    return null;
  }
  var toastTimer;
  function toast(msg) {
    var t = $("[data-toast]");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }

  /* ---------- íconos ---------- */
  var I = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    grid: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    rows: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8v4.5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    db: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="6" rx="7" ry="2.8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 6v12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    id: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3.5" width="16" height="17" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 8.5h8M8 12h8M8 15.5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    sigma: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 5H7l6 7-6 7h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m8 12.3 2.7 2.7L16.5 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    layers: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.5 8.5 4.5L12 12.5 3.5 8 12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16 12 20.5l8.5-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    target: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>',
    users: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8.5" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M15.5 5.6a3 3 0 0 1 0 5.8M17.5 14.3c1.7.6 2.7 2.2 3 4.7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    note: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8.5L19 8v12.5H6Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 3.5V8.5h5M9 13h7M9 16.5h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    qr: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 19h2M19 14h2" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    print: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8V3.5h10V8M7 17H4.5V9.5A1.5 1.5 0 0 1 6 8h12a1.5 1.5 0 0 1 1.5 1.5V17H17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M7 14h10v6.5H7z" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    pdf: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8.5L19 8v12.5H6Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 3.5V8.5h5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 15.5h1.6a1.4 1.4 0 0 0 0-2.8H9v5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6 8.5 12l6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /* ---------- clasificación derivada del texto de cada ficha ---------- */
  var TIPOS = [
    { k: "ID", label: "Indicador de desempeño", plural: "Indicadores de desempeño" },
    { k: "IR", label: "Indicador de resultado", plural: "Indicador de resultado" },
    { k: "CM", label: "Compromiso de mejora", plural: "Compromisos de mejora" }
  ];
  var TIPO_BY_LABEL = {};
  TIPOS.forEach(function (t) { TIPO_BY_LABEL[t.label] = t; });

  var FRECS = [
    ["Mensual", /mensual/i], ["Trimestral", /trimestral/i], ["Semestral", /semestral/i],
    ["Anual", /anual/i], ["Periódica", /peri[oó]dica/i]
  ];
  var ORGS = [
    ["DGIESP", /DGIESP/], ["DGOS", /DGOS/], ["DIGEP", /DIGEP/], ["OGTI", /OGTI/], ["DIGEMID", /DIGEMID/],
    ["CDC-MINSA", /CDC/], ["DIGTEL", /DIGTEL/], ["UFGCS", /UFGCS/]
  ];
  var FUENTES = [
    ["HIS-MINSA", /\bHIS\b/], ["Padrón nominal", /padr[oó]n nominal/i], ["CNV en línea", /\bCNV\b/],
    ["SIGTB", /SIGTB/], ["SIHCE", /SIHCE/], ["REFCON", /REFCON/], ["REUNIS", /REUNIS/], ["RENIEC", /RENIEC/],
    ["RENIPRESS", /RENIPRESS/], ["SEEM", /\bSEEM\b/], ["SETI-IPRESS", /SETI/], ["F500.2", /F500\.2/],
    ["Aplicativos CDC", /notificaci[oó]n|OSIRIS/i], ["SISMED", /SISMED/], ["INFORHUS", /INFORHUS/],
    ["AIRHSP", /AIRHSP/], ["Planilla (PLH)", /\bPLH\b/], ["ARFSIS (SIS)", /ARFSIS/], ["TUA SUSALUD", /\bTUA\b/],
    ["Informe / evidencia", /informe|auditable/i]
  ];

  FICHAS.forEach(function (f, i) {
    f._i = i;
    f._t = TIPO_BY_LABEL[f.tipo] || TIPOS[0];
    f._freq = FRECS.filter(function (p) { return p[1].test(f.frecuencia); }).map(function (p) { return p[0]; });
    if (!f._freq.length) f._freq = ["No consigna"];
    var org = ORGS.filter(function (p) { return p[1].test(f.resp_tec); })[0];
    f._org = org ? org[0] : "Otras direcciones";
    f._src = FUENTES.filter(function (p) { return p[1].test(f.fuente); }).map(function (p) { return p[0]; });
    var parts = [f.n, f.nombre, f.tipo, f.ambito, f.definicion, f.num, f.den, f.formula, f.criterios_titulo,
      f.umbral, f.logro, f.calculo, f.frecuencia, f.fuente, f.resp_tec, f.resp_info];
    (f.construccion || []).forEach(function (b) { parts.push(b[0]); parts = parts.concat(b[1]); });
    (f.criterios || []).forEach(function (c) { parts.push(c[0], c[1]); });
    parts = parts.concat(f.notas || []);
    f._fold = fold(parts.filter(Boolean).join(" • "));
  });

  function byN(n) {
    for (var i = 0; i < FICHAS.length; i++) if (FICHAS[i].n === n) return FICHAS[i];
    return null;
  }
  function uniq(list) {
    var seen = {}, out = [];
    list.forEach(function (x) { if (!seen[x]) { seen[x] = 1; out.push(x); } });
    return out;
  }
  function countBy(fn) {
    var c = {};
    FICHAS.forEach(function (f) { [].concat(fn(f)).forEach(function (k) { c[k] = (c[k] || 0) + 1; }); });
    return c;
  }
  var C_TIPO = countBy(function (f) { return f._t.k; });
  var C_FREQ = countBy(function (f) { return f._freq; });
  var C_ORG = countBy(function (f) { return f._org; });
  var C_SRC = countBy(function (f) { return f._src; });
  var OPT_FREQ = FRECS.map(function (p) { return p[0]; }).concat(["No consigna"]).filter(function (k) { return C_FREQ[k]; });
  var OPT_ORG = ORGS.map(function (p) { return p[0]; }).concat(["Otras direcciones"]).filter(function (k) { return C_ORG[k]; });
  var OPT_SRC = FUENTES.map(function (p) { return p[0]; }).filter(function (k) { return C_SRC[k]; });

  /* ---------- estado del catálogo en la URL ---------- */
  var DEFAULT = { q: "", tipo: "", freq: "", resp: "", fuente: "", orden: "n", vista: "" };
  var state = Object.assign({}, DEFAULT);
  var lastScroll = 0;

  function parseHash() {
    var h = location.hash.replace(/^#/, "");
    if (!h || h === "/") return { view: "catalogo", params: {} };
    var qi = h.indexOf("?");
    var path = qi >= 0 ? h.slice(0, qi) : h;
    var params = {};
    if (qi >= 0) {
      h.slice(qi + 1).split("&").forEach(function (kv) {
        if (!kv) return;
        var p = kv.split("=");
        try { params[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || "").replace(/\+/g, " ")); } catch (e) { /* ignora */ }
      });
    }
    var m = path.match(/^\/ficha\/([\d.]+)\/?$/);
    if (m) return { view: "ficha", n: m[1], params: params };
    if (/^\/guia\/?$/.test(path)) return { view: "guia", params: params };
    if (path === "/" || path === "") return { view: "catalogo", params: params };
    return { view: "404", params: params };
  }
  function catalogHash(s) {
    var q = [];
    Object.keys(DEFAULT).forEach(function (k) {
      if (k === "vista" && s[k] === "tarjetas") return;
      if (s[k] && s[k] !== DEFAULT[k]) q.push(k + "=" + encodeURIComponent(s[k]));
    });
    return "#/" + (q.length ? "?" + q.join("&") : "");
  }
  function syncUrl() {
    var h = catalogHash(state);
    if (location.hash !== h && !(h === "#/" && (location.hash === "" || location.hash === "#"))) {
      history.replaceState(null, "", h);
    }
    sessionStore("fichas-ultimo-catalogo", h);
  }
  function defaultView() {
    var v = store("fichas-vista");
    return v === "tabla" ? "tabla" : "tarjetas";
  }

  /* ---------- filtros ---------- */
  function filtered() {
    var ts = terms(state.q);
    var list = FICHAS.filter(function (f) {
      if (state.tipo && f._t.k !== state.tipo) return false;
      if (state.freq && f._freq.indexOf(state.freq) < 0) return false;
      if (state.resp && f._org !== state.resp) return false;
      if (state.fuente && f._src.indexOf(state.fuente) < 0) return false;
      for (var i = 0; i < ts.length; i++) if (f._fold.indexOf(ts[i]) < 0) return false;
      return true;
    });
    if (state.orden === "nombre") {
      list = list.slice().sort(function (a, b) { return a.nombre.localeCompare(b.nombre, "es"); });
    }
    return list;
  }
  // Fragmento donde aparece la búsqueda cuando no está en el nombre.
  function hitSnippet(f, ts) {
    if (!ts.length) return "";
    var nf = fold(f.nombre);
    if (ts.every(function (t) { return nf.indexOf(t) >= 0; })) return "";
    var fields = [["Definición", f.definicion], ["Ámbito", f.ambito], ["Numerador", f.num], ["Denominador", f.den],
      ["Fórmula", f.formula], ["Fuente", f.fuente], ["Responsable técnico", f.resp_tec], ["Responsable de información", f.resp_info],
      ["Frecuencia", f.frecuencia], ["Logro esperado", f.logro], ["Cálculo", f.calculo]];
    (f.criterios || []).forEach(function (c) { fields.push(["Criterio", c[0]]); });
    (f.construccion || []).forEach(function (b) { b[1].forEach(function (it) { fields.push(["Construcción · " + b[0], it]); }); });
    (f.notas || []).forEach(function (n) { fields.push(["Nota", n]); });
    var missing = ts.filter(function (t) { return nf.indexOf(t) < 0; });
    for (var i = 0; i < fields.length; i++) {
      var txt = fields[i][1];
      if (!txt) continue;
      var ff = fold(txt), at = ff.indexOf(missing[0]);
      if (at < 0) continue;
      var a = Math.max(0, at - 70), b = Math.min(txt.length, at + missing[0].length + 90);
      var cut = (a > 0 ? "…" : "") + txt.slice(a, b) + (b < txt.length ? "…" : "");
      return '<p class="hit"><b>' + esc(fields[i][0]) + ":</b> " + hl(cut, ts) + "</p>";
    }
    return "";
  }

  /* ---------- vistas ---------- */
  function setNav(view) {
    $$("[data-nav]").forEach(function (a) {
      if (a.getAttribute("data-nav") === view) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }

  function renderCatalog(params) {
    state = Object.assign({}, DEFAULT, params);
    if (!state.vista) state.vista = defaultView();
    var nID = C_TIPO.ID || 0, nIR = C_TIPO.IR || 0, nCM = C_TIPO.CM || 0;
    document.title = SITE + " · Catálogo";
    setNav("catalogo");

    function opts(list, counts, sel, all, pre) {
      return '<option value="">' + esc(all) + "</option>" + list.map(function (k) {
        return '<option value="' + esc(k) + '"' + (sel === k ? " selected" : "") + ">" + esc(pre + k) + " (" + counts[k] + ")</option>";
      }).join("");
    }
    function chip(k, label, n, dot) {
      return '<button type="button" class="chip' + (dot ? " t-" + k : "") + '" data-tipo="' + k + '" aria-pressed="' + (state.tipo === k) + '">' +
        (dot ? '<span class="dot"></span>' : "") + esc(label) + " <small>" + n + "</small></button>";
    }

    app.innerHTML =
      '<section class="hero">' +
        "<div>" +
          '<p class="kicker">Convenios de Gestión 2026 · Anexo I MINSA</p>' +
          "<h1>Catálogo de fichas técnicas de indicadores y compromisos de mejora</h1>" +
          '<p class="hero-lead">Consulta las ' + FICHAS.length + " fichas (N.° 01 a 48, con 37.1 a 37.5): definición, fórmula, construcción, metas, fuente de datos y responsables. Cada ficha tiene su propio enlace y código QR.</p>" +
        "</div>" +
        '<div class="stats" aria-label="Resumen">' +
          '<div class="stat"><b>' + FICHAS.length + "</b><span>Fichas técnicas</span></div>" +
          '<div class="stat" style="--c:var(--teal)"><b>' + nID + "</b><span>Indicadores de desempeño</span></div>" +
          '<div class="stat" style="--c:var(--sand)"><b>' + nIR + "</b><span>Indicador de resultado</span></div>" +
          '<div class="stat" style="--c:var(--coral)"><b>' + nCM + "</b><span>Compromisos de mejora</span></div>" +
        "</div>" +
      "</section>" +
      '<div class="toolbar">' +
        '<div class="search">' + I.search +
          '<input id="q" type="search" autocomplete="off" spellcheck="false" placeholder="Buscar por nombre, código CIE/CPMS, fuente, responsable…" aria-label="Buscar fichas" value="' + esc(state.q) + '">' +
          "<kbd>/</kbd>" +
        "</div>" +
        '<div class="filters">' +
          '<div class="chips" role="group" aria-label="Tipo de ficha">' +
            chip("", "Todas", FICHAS.length, false) + chip("ID", "Desempeño", nID, true) +
            (nIR ? chip("IR", "Resultado", nIR, true) : "") + chip("CM", "Compromisos", nCM, true) +
          "</div>" +
          '<label class="select' + (state.freq ? " is-set" : "") + '"><select data-f="freq" aria-label="Frecuencia de medición">' + opts(OPT_FREQ, C_FREQ, state.freq, "Frecuencia: todas", "Frecuencia: ") + "</select></label>" +
          '<label class="select' + (state.resp ? " is-set" : "") + '"><select data-f="resp" aria-label="Responsable técnico">' + opts(OPT_ORG, C_ORG, state.resp, "Responsable técnico: todos", "Responsable: ") + "</select></label>" +
          '<label class="select' + (state.fuente ? " is-set" : "") + '"><select data-f="fuente" aria-label="Fuente de datos">' + opts(OPT_SRC, C_SRC, state.fuente, "Fuente de datos: todas", "Fuente: ") + "</select></label>" +
          '<div class="filters-end">' +
            '<label class="select"><select data-f="orden" aria-label="Ordenar">' +
              '<option value="n"' + (state.orden !== "nombre" ? " selected" : "") + ">Orden: N.° de ficha</option>" +
              '<option value="nombre"' + (state.orden === "nombre" ? " selected" : "") + ">Orden: nombre A–Z</option>" +
            "</select></label>" +
            '<div class="seg" role="group" aria-label="Vista">' +
              '<button type="button" data-vista="tarjetas" aria-pressed="' + (state.vista !== "tabla") + '" aria-label="Vista de tarjetas" title="Tarjetas">' + I.grid + "</button>" +
              '<button type="button" data-vista="tabla" aria-pressed="' + (state.vista === "tabla") + '" aria-label="Vista de tabla" title="Tabla">' + I.rows + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>" +
      '<div class="resultbar"><span aria-live="polite" data-count></span><button type="button" class="linkbtn" data-action="reset" hidden>Limpiar filtros</button></div>' +
      '<div data-results></div>';

    var input = $("#q");
    var t;
    input.addEventListener("input", function () {
      clearTimeout(t);
      t = setTimeout(function () { state.q = input.value.trim(); syncUrl(); renderResults(); }, 120);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && input.value) { input.value = ""; state.q = ""; syncUrl(); renderResults(); }
      if (e.key === "Enter") {
        var first = $("[data-results] a");
        var list = filtered();
        if (list.length === 1 && first) first.click();
      }
    });
    $$(".chip[data-tipo]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.tipo = b.getAttribute("data-tipo");
        $$(".chip[data-tipo]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        syncUrl(); renderResults();
      });
    });
    $$("select[data-f]").forEach(function (s) {
      s.addEventListener("change", function () {
        state[s.getAttribute("data-f")] = s.value;
        if (s.getAttribute("data-f") !== "orden") s.parentNode.classList.toggle("is-set", !!s.value);
        syncUrl(); renderResults();
      });
    });
    $$("[data-vista]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.vista = b.getAttribute("data-vista");
        store("fichas-vista", state.vista);
        $$("[data-vista]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        syncUrl(); renderResults();
      });
    });
    $('[data-action="reset"]').addEventListener("click", function () {
      var v = state.vista;
      state = Object.assign({}, DEFAULT, { vista: v });
      renderCatalog(state.vista === defaultView() ? {} : { vista: v });
      syncUrl();
      $("#q").focus();
    });
    renderResults();
  }

  function renderResults() {
    var list = filtered();
    var ts = terms(state.q);
    var active = !!(state.q || state.tipo || state.freq || state.resp || state.fuente);
    $("[data-count]").innerHTML = active
      ? "<strong>" + list.length + "</strong> de " + FICHAS.length + " fichas coinciden"
      : "<strong>" + FICHAS.length + "</strong> fichas";
    $('[data-action="reset"]').hidden = !active;
    var box = $("[data-results]");
    if (!list.length) {
      box.innerHTML = '<div class="empty"><strong>No hay fichas que coincidan.</strong>Prueba con otra palabra o limpia los filtros.</div>';
      return;
    }
    if (state.vista === "tabla") {
      box.innerHTML = '<div class="table-wrap"><table class="list"><thead><tr>' +
        '<th class="c-n">N.°</th><th>Ficha</th><th>Tipo</th><th class="c-goal">Valor umbral</th><th class="c-goal">Logro esperado</th><th>Frecuencia</th><th>Resp. técnico</th>' +
        "</tr></thead><tbody>" + list.map(function (f) {
          return '<tr data-href="#/ficha/' + f.n + '"><td><span class="num">' + esc(f.n) + "</span></td>" +
            '<td><a href="#/ficha/' + f.n + '">' + hl(f.nombre, ts) + "</a></td>" +
            '<td><span class="pill t-' + f._t.k + '">' + f._t.k + "</span></td>" +
            "<td>" + esc(f.umbral) + "</td><td>" + esc(f.logro) + "</td>" +
            "<td>" + esc(f._freq.join(" · ")) + "</td><td>" + esc(f._org) + "</td></tr>";
        }).join("") + "</tbody></table></div>";
      $$("tr[data-href]", box).forEach(function (tr) {
        tr.addEventListener("click", function (e) { if (e.target.tagName !== "A") location.hash = tr.getAttribute("data-href"); });
      });
      return;
    }
    box.innerHTML = '<div class="grid">' + list.map(function (f) {
      var src = f._src.slice(0, 3).map(function (s) { return '<span class="tag">' + I.db + esc(s) + "</span>"; }).join("");
      if (f._src.length > 3) src += '<span class="tag">+' + (f._src.length - 3) + "</span>";
      return '<a class="card t-' + f._t.k + '" href="#/ficha/' + f.n + '" aria-label="Ficha ' + esc(f.n) + ": " + esc(f.nombre) + '">' +
        '<div class="card-top"><span class="num">' + esc(f.n) + '</span><span class="pill">' + esc(f._t.label) + "</span></div>" +
        "<h3>" + hl(f.nombre, ts) + "</h3>" +
        '<dl class="card-goals"><div><dt>Valor umbral</dt><dd>' + esc(f.umbral) + "</dd></div><div><dt>Logro esperado</dt><dd>" + esc(f.logro) + "</dd></div></dl>" +
        hitSnippet(f, ts) +
        '<div class="card-foot"><span class="tag">' + I.clock + esc(f._freq.join(" · ")) + "</span>" + src + "</div>" +
      "</a>";
    }).join("") + "</div>";
  }

  /* ---------- detalle de ficha ---------- */
  function isLong(s) { return String(s).length > 38; }
  function secHead(icon, title, sub) {
    return '<div class="sec-h"><span class="ico">' + icon + "</span><div><h2>" + esc(title) + "</h2>" + (sub ? "<p>" + esc(sub) + "</p>" : "") + "</div></div>";
  }
  function formulaBlock(f) {
    if (f.num && f.den) {
      var post = f.post === undefined ? "× 100" : f.post;
      return '<div class="frac-wrap" role="group" aria-label="Fórmula: numerador sobre denominador">' +
        (f.pre ? '<span class="op">' + esc(f.pre) + "</span>" : "") +
        '<div class="frac"><div class="frac-part"><span class="frac-lbl">Numerador</span><span>' + esc(f.num) + "</span></div>" +
        '<div class="frac-bar" aria-hidden="true"></div>' +
        '<div class="frac-part"><span class="frac-lbl">Denominador</span><span>' + esc(f.den) + "</span></div></div>" +
        (post ? '<span class="op">' + esc(post) + "</span>" : "") +
      "</div>";
    }
    if (f.criterios) {
      var hasVal = f.criterios.some(function (c) { return c[1]; });
      return (f.criterios_titulo ? '<p class="crit-title">' + esc(f.criterios_titulo) + "</p>" : "") +
        '<table class="crit"><thead><tr><th>Criterio</th>' + (hasVal ? '<th class="val">' + esc(f.valor_label || "Valor") + "</th>" : "") + "</tr></thead><tbody>" +
        f.criterios.map(function (c) {
          return "<tr><td>" + esc(c[0]) + "</td>" + (hasVal ? '<td class="val">' + esc(c[1]) + "</td>" : "") + "</tr>";
        }).join("") + "</tbody></table>";
    }
    return '<div class="formula-txt">' + esc(f.formula) + "</div>";
  }
  function formulaTitle(f) {
    if (f.num || (f.formula && f._t.k !== "CM")) return "Fórmula del indicador";
    return "Criterios de cumplimiento";
  }

  function renderFicha(n) {
    var f = byN(n);
    if (!f) return render404("No existe la ficha N.° " + n + ".");
    setNav("catalogo");
    document.title = "Ficha " + f.n + " · " + SITE;
    var prev = FICHAS[f._i - 1], next = FICHAS[f._i + 1];
    var noNotes = f.notas.length === 1 && /no consigna/i.test(f.notas[0]);
    var pages = f.pagina === f.pagina_fin ? "pág. " + f.pagina : "págs. " + f.pagina + "–" + f.pagina_fin;
    var url = shareUrl();

    var sections = [
      ["s-ident", "Identificación"], ["s-formula", formulaTitle(f)], ["s-constr", "Construcción del indicador"],
      ["s-metas", "Metas y cumplimiento"], ["s-medicion", "Medición y responsables"], ["s-notas", "Notas"]
    ];

    app.innerHTML =
      '<nav class="crumbs" aria-label="Ruta"><a href="' + backHash() + '">' + "Catálogo</a><span aria-hidden=\"true\">/</span><span>Ficha N.° " + esc(f.n) + "</span></nav>" +
      '<div class="print-only print-meta"><span>' + esc(SITE) + " · Anexo I MINSA (dic. 2025), " + pages + "</span><span>" + esc(url) + "</span></div>" +
      '<header class="ficha-head t-' + f._t.k + '">' +
        '<div class="bignum" aria-hidden="true"><small>FICHA</small>' + esc(f.n) + "</div>" +
        "<div>" +
          '<span class="pill">' + esc(f.tipo) + "</span>" +
          "<h1>" + esc(f.nombre) + "</h1>" +
          '<div class="actions">' +
            '<button type="button" class="btn btn-primary" data-action="share">' + I.qr + "Compartir / QR</button>" +
            '<button type="button" class="btn btn-outline" data-action="copy-here">' + I.link + "Copiar enlace</button>" +
            '<button type="button" class="btn btn-outline" data-action="print">' + I.print + "Imprimir</button>" +
            '<a class="btn btn-outline" href="' + PDF + "#page=" + f.pagina + '" target="_blank" rel="noopener">' + I.pdf + "Ver en el Anexo I (" + pages + ")</a>" +
          "</div>" +
        "</div>" +
      "</header>" +
      '<div class="ficha-layout">' +
        '<article class="ficha-body">' +
          '<section class="sec" id="s-ident">' + secHead(I.id, "Identificación") +
            '<dl class="fields cols">' +
              "<div><dt>Nombre</dt><dd>" + esc(f.nombre) + "</dd></div>" +
              "<div><dt>Tipo</dt><dd>" + esc(f.tipo) + "</dd></div>" +
              "<div><dt>Ámbito de evaluación</dt><dd>" + esc(f.ambito) + "</dd></div>" +
              '<div><dt>Definición</dt><dd class="lead-txt">' + esc(f.definicion) + "</dd></div>" +
            "</dl></section>" +
          '<section class="sec" id="s-formula">' + secHead(I.sigma, formulaTitle(f)) + formulaBlock(f) + "</section>" +
          '<section class="sec" id="s-constr">' + secHead(I.layers, "Construcción del indicador", "Códigos, filtros y criterios tal como los consigna la ficha") +
            '<div class="build">' + f.construccion.map(function (b) {
              return '<details class="build-b" open><summary>' + esc(b[0]) + "<small>" + b[1].length + (b[1].length === 1 ? " elemento" : " elementos") + "</small></summary><ol>" +
                b[1].map(function (it) { return "<li>" + esc(it) + "</li>"; }).join("") + "</ol></details>";
            }).join("") + "</div></section>" +
          '<section class="sec" id="s-metas">' + secHead(I.target, "Metas y cumplimiento") +
            '<dl class="goals">' +
              '<div class="goal' + (isLong(f.umbral) ? " is-long" : "") + '"><dt>Valor umbral</dt><dd>' + esc(f.umbral) + "</dd></div>" +
              '<div class="goal is-logro' + (isLong(f.logro) ? " is-long" : "") + '"><dt>Logro esperado</dt><dd>' + esc(f.logro) + "</dd></div>" +
            "</dl>" +
            '<div class="calc"><span>Cálculo del porcentaje de cumplimiento</span>' + esc(f.calculo) + "</div>" +
          "</section>" +
          '<section class="sec" id="s-medicion">' + secHead(I.users, "Medición y responsables") +
            '<dl class="fields cols">' +
              "<div><dt>Frecuencia de medición</dt><dd>" + esc(f.frecuencia) + "</dd></div>" +
              "<div><dt>Fuente de datos</dt><dd>" + esc(f.fuente) + "</dd></div>" +
              "<div><dt>Responsable técnico</dt><dd>" + esc(f.resp_tec) + "</dd></div>" +
              "<div><dt>Responsable de información</dt><dd>" + esc(f.resp_info) + "</dd></div>" +
            "</dl></section>" +
          '<section class="sec" id="s-notas">' + secHead(I.note, "Notas") +
            (noNotes ? '<p class="muted">' + esc(f.notas[0]) + "</p>" :
              '<ul class="notes">' + f.notas.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>") +
          "</section>" +
        "</article>" +
        '<aside class="aside">' +
          '<div class="box"><h3>Resumen</h3><dl class="facts">' +
            "<div><dt>Valor umbral</dt><dd>" + esc(f.umbral) + "</dd></div>" +
            "<div><dt>Logro esperado</dt><dd>" + esc(f.logro) + "</dd></div>" +
            "<div><dt>Frecuencia</dt><dd>" + esc(f.frecuencia) + "</dd></div>" +
            "<div><dt>Responsable técnico</dt><dd>" + esc(f._org === "Otras direcciones" ? f.resp_tec : f._org) + "</dd></div>" +
          "</dl></div>" +
          '<div class="box toc-box"><h3>En esta ficha</h3><nav class="toc">' +
            sections.map(function (s) { return '<button type="button" data-goto="' + s[0] + '">' + esc(s[1]) + "</button>"; }).join("") +
          "</nav></div>" +
          '<div class="box qr-box-side"><h3>Código QR de esta ficha</h3><div class="qr-mini"><div class="qr">' + qrSvg(url, "#0E4D5C") + "</div>" +
            '<div><p>Escanéalo para abrir esta ficha en el celular.</p><button type="button" class="btn btn-soft no-print" data-action="qr-png">Descargar PNG</button></div></div></div>' +
        "</aside>" +
      "</div>" +
      '<nav class="pager" aria-label="Fichas vecinas">' +
        (prev ? '<a href="#/ficha/' + prev.n + '"><small>← Ficha ' + esc(prev.n) + "</small><span>" + esc(prev.nombre) + "</span></a>" : "<span></span>") +
        (next ? '<a class="next" href="#/ficha/' + next.n + '"><small>Ficha ' + esc(next.n) + " →</small><span>" + esc(next.nombre) + "</span></a>" : "") +
      "</nav>";

    $$("[data-goto]").forEach(function (b) {
      b.addEventListener("click", function () {
        var el = document.getElementById(b.getAttribute("data-goto"));
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    window.scrollTo(0, 0);
  }

  function backHash() {
    var h = sessionStore("fichas-ultimo-catalogo");
    return h && h.indexOf("#/") === 0 && h.indexOf("#/ficha") !== 0 && h.indexOf("#/guia") !== 0 ? h : "#/";
  }
  function sessionStore(key, val) {
    try { if (val === undefined) return sessionStorage.getItem(key); sessionStorage.setItem(key, val); } catch (e) { return null; }
    return null;
  }

  /* ---------- guía ---------- */
  function renderGuide() {
    setNav("guia");
    document.title = "Guía y descargas · " + SITE;
    var tipos = TIPOS.filter(function (t) { return C_TIPO[t.k]; });
    app.innerHTML =
      '<header class="page-head"><p class="kicker">Guía y descargas</p><h1>Cómo usar este catálogo</h1>' +
        "<p>El catálogo reproduce, de forma resumida y ordenada, el contenido de cada ficha técnica del Anexo I del MINSA. No agrega datos: ante cualquier diferencia prevalece el documento oficial.</p></header>" +
      '<div class="guide">' +
        '<section class="sec">' + secHead(I.id, "Estructura de cada ficha") +
          '<ol class="steps">' +
            "<li><div><b>Identificación</b>Nombre, tipo, ámbito de evaluación y definición.</div></li>" +
            "<li><div><b>Fórmula o criterios</b>Numerador y denominador, o los criterios de cumplimiento en los compromisos de mejora.</div></li>" +
            "<li><div><b>Construcción del indicador</b>Códigos, filtros y fuentes auditables.</div></li>" +
            "<li><div><b>Metas y cumplimiento</b>Valor umbral, logro esperado y cálculo del porcentaje de cumplimiento.</div></li>" +
            "<li><div><b>Medición y responsables</b>Frecuencia, fuente de datos, responsable técnico y de información, y notas.</div></li>" +
          "</ol></section>" +
        '<section class="sec">' + secHead(I.note, "Notas comunes a la mayoría de fichas") +
          '<ul class="notes">' +
            "<li>La actualización de la ficha técnica o del script durante la vigencia del dispositivo que lo aprueba corresponde al MINSA; puede darse por modificaciones normativas o situaciones de emergencia y responde a la solicitud y sustento del responsable técnico.</li>" +
            "<li>El Listado de Hospitales con población asignada será aprobado como anexo en la Directiva Administrativa que regula la elaboración, suscripción, monitoreo y evaluación de los Convenios de Gestión 2026.</li>" +
            "<li>Cálculo estándar del porcentaje de cumplimiento, salvo que la ficha indique otro método:</li>" +
          "</ul>" +
          '<p class="formula-std" style="margin-top:10px">(Logro alcanzado – Valor umbral) / (Logro esperado – Valor umbral) × 100</p>' +
        "</section>" +
        '<section class="sec">' + secHead(I.layers, "Tipos de ficha") +
          '<div class="legend">' + tipos.map(function (t) {
            return '<div><span class="pill t-' + t.k + '">' + t.k + "</span><span>" + esc(t.plural) + ": <b>" + C_TIPO[t.k] + "</b></span></div>";
          }).join("") + "</div>" +
          '<p class="muted" style="margin-top:12px">Los filtros de frecuencia, responsable técnico y fuente de datos se obtienen del texto de cada ficha.</p>' +
        "</section>" +
        '<section class="sec">' + secHead(I.qr, "Compartir y QR") +
          "<p>Cada vista tiene su propio enlace: el catálogo (incluidos la búsqueda y los filtros activos) y cada ficha. Usa <b>Compartir</b> para copiar el enlace, enviarlo por WhatsApp o descargar el código QR en PNG para imprimirlo.</p>" +
          "<p class=\"muted\">Al imprimir una ficha, la hoja incluye su enlace en línea.</p>" +
        "</section>" +
        '<section class="sec span-2">' + secHead(I.pdf, "Descargas") +
          '<div class="downloads">' +
            '<a class="dl" href="' + PDF + '" target="_blank" rel="noopener" style="--d:var(--coral)"><span class="fmt">PDF</span><span><b>Documento oficial: Anexo I (MINSA, diciembre 2025)</b><small>Listado de ID, CM y fichas técnicas del año 2026 · 149 páginas</small></span><span aria-hidden="true">↗</span></a>' +
            '<a class="dl" href="data/fichas.csv" download style="--d:var(--teal)"><span class="fmt">CSV</span><span><b>Catálogo en tabla</b><small>Una fila por ficha, separador punto y coma, abre en Excel</small></span><span aria-hidden="true">↓</span></a>' +
            '<a class="dl" href="data/fichas.json" download style="--d:var(--petrol)"><span class="fmt">JSON</span><span><b>Datos estructurados</b><small>Para sistemas e integraciones</small></span><span aria-hidden="true">↓</span></a>' +
          "</div></section>" +
      "</div>";
    window.scrollTo(0, 0);
  }

  function render404(msg) {
    setNav("");
    document.title = "No encontrado · " + SITE;
    app.innerHTML = '<div class="page-head"><h1>Página no encontrada</h1><p>' + esc(msg || "La dirección no corresponde a ninguna vista del catálogo.") +
      '</p><p><a class="btn btn-primary" href="#/">Ir al catálogo</a></p></div>';
  }

  /* ---------- QR ---------- */
  function makeQr(text) {
    if (typeof window.qrcode !== "function") return null;
    var q = window.qrcode(0, "M");
    q.addData(text);
    q.make();
    return q;
  }
  function qrSvg(text, color) {
    var q = makeQr(text);
    if (!q) return "";
    var n = q.getModuleCount(), m = 4, size = n + m * 2, d = "";
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += "M" + (c + m) + " " + (r + m) + "h1v1h-1z";
    return '<svg viewBox="0 0 ' + size + " " + size + '" role="img" aria-label="Código QR del enlace" shape-rendering="crispEdges">' +
      '<rect width="100%" height="100%" fill="#fff"/><path d="' + d + '" fill="' + (color || "#0E4D5C") + '"/></svg>';
  }
  function qrPng(text, title, subtitle, file) {
    var q = makeQr(text);
    if (!q) return;
    var n = q.getModuleCount(), m = 4, cell = Math.max(8, Math.floor(880 / (n + m * 2)));
    var qrSize = (n + m * 2) * cell, pad = 40, W = qrSize + pad * 2, H = qrSize + pad * 2 + 150;
    var cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    var g = cv.getContext("2d");
    g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#0E4D5C"; g.fillRect(0, 0, W, 14);
    g.fillStyle = "#0E4D5C";
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) g.fillRect(pad + (c + m) * cell, pad + (r + m) * cell, cell, cell);
    g.textAlign = "center";
    g.fillStyle = "#15282D";
    g.font = "700 46px Cambria, Georgia, serif";
    g.fillText(title, W / 2, qrSize + pad + 62);
    g.fillStyle = "#536a70";
    g.font = "500 28px 'Segoe UI', Roboto, Arial, sans-serif";
    g.fillText(subtitle, W / 2, qrSize + pad + 106);
    g.fillStyle = "#D9603F"; g.fillRect(W / 2 - 40, H - 22, 80, 6);
    cv.toBlob(function (blob) {
      if (!blob) return;
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = (file || "qr-catalogo-cg-2026") + ".png";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      toast("QR descargado");
    }, "image/png");
  }

  /* ---------- compartir ---------- */
  function shareUrl() { return location.href.replace(/#$/, ""); }
  function shareContext() {
    var r = parseHash();
    if (r.view === "ficha") {
      var f = byN(r.n);
      if (f) return { file: "qr-ficha-" + f.n, title: "Ficha N.° " + f.n, sub: f.nombre, text: "Ficha técnica N.° " + f.n + " (CG 2026): " + f.nombre };
    }
    if (r.view === "guia") return { title: "Catálogo CG 2026", sub: "Guía y descargas del catálogo", text: "Guía del catálogo de fichas técnicas CG 2026" };
    var filt = r.view === "catalogo" && Object.keys(r.params).some(function (k) { return k !== "vista" && k !== "orden" && r.params[k]; });
    return {
      title: "Catálogo CG 2026",
      sub: filt ? "Catálogo con la búsqueda y los filtros actuales" : "Catálogo completo de fichas técnicas",
      text: "Catálogo de fichas técnicas de los Convenios de Gestión 2026 (MINSA)"
    };
  }
  function openShare() {
    var d = $("#share-dialog"), ctx = shareContext(), url = shareUrl();
    $("[data-share-sub]").textContent = ctx.sub;
    $("[data-share-qr]").innerHTML = qrSvg(url, "#0E4D5C");
    $("[data-share-url]").value = url;
    $("[data-share-local]").hidden = /^https?:/.test(location.protocol) && !/^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname);
    $("[data-share-wa]").href = "https://wa.me/?text=" + encodeURIComponent(ctx.text + " " + url);
    $('[data-action="native-share"]').hidden = !navigator.share;
    if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
  }
  function copy(text) {
    function done() { toast("Enlace copiado"); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("No se pudo copiar"); }
      ta.remove();
    }
  }

  /* ---------- tema ---------- */
  function toggleTheme() {
    var root = document.documentElement;
    var cur = root.getAttribute("data-theme");
    if (!cur) cur = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    var nxt = cur === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", nxt);
    store("fichas-tema", nxt);
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", nxt === "dark" ? "#082F38" : "#0E4D5C");
  }

  /* ---------- eventos globales ---------- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("[data-action],[data-skip]") : null;
    if (!el) return;
    if (el.hasAttribute("data-skip")) { e.preventDefault(); app.focus(); return; }
    var a = el.getAttribute("data-action");
    if (a === "share") openShare();
    else if (a === "theme") toggleTheme();
    else if (a === "copy") copy($("[data-share-url]").value);
    else if (a === "copy-here") copy(shareUrl());
    else if (a === "print") window.print();
    else if (a === "qr-png") { var c = shareContext(); qrPng(shareUrl(), c.title, "Fichas técnicas · Convenios de Gestión 2026", c.file); }
    else if (a === "native-share") {
      var ctx = shareContext();
      navigator.share({ title: ctx.title, text: ctx.text, url: shareUrl() }).catch(function () { /* cancelado */ });
    }
  });
  var dlg = $("#share-dialog");
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  document.addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toLowerCase();
    var typing = tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable;
    if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey) {
      var q = $("#q");
      if (q) { e.preventDefault(); q.focus(); q.select(); }
      else { e.preventDefault(); location.hash = "#/"; setTimeout(function () { var q2 = $("#q"); if (q2) q2.focus(); }, 0); }
    }
    if (!typing && !dlg.open && parseHash().view === "ficha" && !e.altKey && !e.ctrlKey && !e.metaKey) {
      var f = byN(parseHash().n);
      if (!f) return;
      if (e.key === "ArrowLeft" && FICHAS[f._i - 1]) location.hash = "#/ficha/" + FICHAS[f._i - 1].n;
      if (e.key === "ArrowRight" && FICHAS[f._i + 1]) location.hash = "#/ficha/" + FICHAS[f._i + 1].n;
    }
  });

  // Los bloques plegables se imprimen abiertos.
  window.addEventListener("beforeprint", function () {
    $$("details").forEach(function (d) { d.setAttribute("data-was", d.open ? "1" : "0"); d.open = true; });
  });
  window.addEventListener("afterprint", function () {
    $$("details[data-was]").forEach(function (d) { d.open = d.getAttribute("data-was") === "1"; d.removeAttribute("data-was"); });
  });

  /* ---------- enrutador ---------- */
  var currentView = null;
  function route() {
    var r = parseHash();
    if (currentView === "catalogo") lastScroll = window.scrollY;
    if (r.view === "catalogo") {
      renderCatalog(r.params);
      sessionStore("fichas-ultimo-catalogo", location.hash || "#/");
      if (currentView === "ficha") window.scrollTo(0, lastScroll); else window.scrollTo(0, 0);
    } else if (r.view === "ficha") renderFicha(r.n);
    else if (r.view === "guia") renderGuide();
    else render404();
    currentView = r.view;
    if (dlg.open) dlg.close();
  }
  window.addEventListener("hashchange", route);

  var gen = $("[data-generado]");
  if (gen && META.generado) gen.textContent = "Datos generados el " + META.generado.split("-").reverse().join("/") + ".";

  if (!FICHAS.length) {
    app.innerHTML = '<div class="empty"><strong>No se cargaron los datos.</strong>Verifica que exista data/fichas.js (ejecuta python3 tools/build_data.py).</div>';
    return;
  }
  route();
})();
