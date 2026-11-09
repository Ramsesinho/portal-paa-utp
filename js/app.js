(function () {
  'use strict';
  var M = window.PAA.mate, LEC = window.PAA.lecciones, TEMAS = M.TEMAS;
  var app = document.getElementById('app');
  var LET = ['A', 'B', 'C', 'D'];
  var KEY = 'ruta-paa-v1';

  /* ---------- utilidades ---------- */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { add(el, x); }); return; }
    el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function rnd() { return Math.floor(Math.random() * 2147483000) + 1; }

  /* ---------- almacenamiento (puede fallar en modo privado) ---------- */
  var mem = null;
  function load() {
    if (mem) return mem;
    try { mem = JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { mem = null; }
    if (!mem || typeof mem !== 'object') mem = {};
    mem.temas = mem.temas || {}; mem.errores = mem.errores || []; mem.sims = mem.sims || [];
    return mem;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* sin guardado */ } }
  function registrar(p, ok) {
    var s = load(), t = s.temas[p.tema] = s.temas[p.tema] || { n: 0, ok: 0, recent: [] };
    t.n++; if (ok) t.ok++; t.recent.push(ok ? 1 : 0); if (t.recent.length > 10) t.recent.shift();
    var id = p.id + (p.grid ? ':g' : ''), i = s.errores.indexOf(id);
    if (ok && i >= 0) s.errores.splice(i, 1);
    if (!ok && i < 0) s.errores.push(id);
    if (s.errores.length > 200) s.errores.shift();
    save();
  }
  function estado(id) {
    var t = load().temas[id];
    if (!t || !t.n) return { txt: 'Sin empezar', pct: 0, cls: 'nuevo' };
    var r = t.recent, pct = Math.round(100 * r.reduce(function (a, b) { return a + b; }, 0) / r.length);
    if (t.n >= 5 && pct >= 80) return { txt: 'Dominado ⭐', pct: pct, cls: 'ok' };
    if (pct >= 50) return { txt: 'En camino', pct: pct, cls: 'mid' };
    return { txt: 'A repasar', pct: pct, cls: 'low' };
  }
  function desdeId(id) {
    var a = id.split(':'); return M.make(a[0], parseInt(a[1], 10), a[2] === 'g');
  }

  /* ---------- piezas de pantalla ---------- */
  function figura(p) {
    var out = [];
    if (p.table) {
      out.push(h('table', { class: 'tabla' }, h('thead', null, h('tr', null, p.table.head.map(function (x) { return h('th', { text: x }); }))),
        h('tbody', null, p.table.rows.map(function (r2) { return h('tr', null, r2.map(function (c) { return h('td', { text: c }); })); }))));
    }
    if (p.chart) out.push(grafica(p.chart));
    return out;
  }
  function grafica(c) {
    var ns = 'http://www.w3.org/2000/svg', W = 520, rowH = 38, L = 100, max = 50, Hh = c.labels.length * rowH + 34;
    function s(tag, attrs) { var e = document.createElementNS(ns, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + Hh, class: 'chart', role: 'img', 'aria-label': 'Gráfica de barras: ' + c.labels.map(function (l, i) { return l + ' ' + c.values[i]; }).join(', ') });
    [0, 10, 20, 30, 40, 50].forEach(function (v) {
      var x = L + (W - L - 20) * v / max;
      svg.appendChild(s('line', { x1: x, x2: x, y1: 4, y2: Hh - 26, class: 'ax' }));
      var t = s('text', { x: x, y: Hh - 8, 'text-anchor': 'middle' }); t.textContent = v; svg.appendChild(t);
    });
    c.labels.forEach(function (l, i) {
      var y = 8 + i * rowH, w = (W - L - 20) * c.values[i] / max;
      var t = s('text', { x: L - 8, y: y + 20, 'text-anchor': 'end' }); t.textContent = l; svg.appendChild(t);
      svg.appendChild(s('rect', { x: L, y: y, width: w, height: 26, rx: 5, class: 'b' }));
    });
    return h('figure', { class: 'fig' }, svg, h('figcaption', { class: 'muted', text: 'Número de ' + c.unit + ' (lee el número en la línea de abajo)' }));
  }
  function pasosList(p, upto) {
    var n = upto == null ? p.pasos.length : upto;
    return h('ol', { class: 'pasos' }, p.pasos.slice(0, n).map(function (t, i) {
      return h('li', { class: i === p.pasos.length - 1 ? 'last' : '', text: t });
    }));
  }
  function receta(tema, abierta) {
    var L = LEC[tema], T = TEMAS[tema];
    return h('details', { class: 'receta', open: abierta ? true : null },
      h('summary', { text: '📖 Cómo se resuelve: ' + T.nombre }),
      h('p', { class: 'idea', text: L.idea }),
      h('ol', null, L.receta.map(function (t) { return h('li', { text: t }); })),
      h('p', { class: 'muted', text: '⚠️ Error común: ' + L.error }));
  }
  function crumbs() {
    var a = [h('a', { href: '#/', text: 'Camino' })];
    for (var i = 0; i < arguments.length; i++) { a.push(' › '); a.push(arguments[i]); }
    return h('p', { class: 'crumbs' }, a);
  }
  function comprobarGrid(p, txt) {
    var v = String(txt).trim().replace(',', '.').replace('−', '-');
    return v !== '' && Number(v) === Number(p.answer);
  }

  /* ---------- vistas ---------- */
  function vistaInicio() {
    var s = load(), temaIds = Object.keys(TEMAS), hechos = 0, sig = null;
    temaIds.forEach(function (id) {
      var e = estado(id); if (e.cls === 'ok') hechos++;
      if (!sig && e.cls !== 'ok') sig = id;
    });
    var total = temaIds.length, empezo = temaIds.some(function (id) { return s.temas[id]; });
    var hero = h('section', { class: 'card hero' },
      h('h1', { text: empezo ? '¡Bienvenido de vuelta!' : 'Las matemáticas se aprenden paso a paso' }),
      h('p', { class: 'big', text: 'Aquí cada problema trae primero su receta: sabes cómo resolverlo ANTES de contestar. Sin prisa, sin vergüenza, y puedes repetir todo lo que quieras.' }),
      h('div', { class: 'row' },
        sig ? h('a', { class: 'btn', href: '#/tema/' + sig, text: empezo ? 'Seguir: ' + TEMAS[sig].nombre : 'Empezar: ' + TEMAS[sig].nombre }) : h('a', { class: 'btn', href: '#/simulacro', text: '¡Todo dominado! Haz un simulacro' }),
        h('span', { text: hechos + ' de ' + total + ' temas dominados' })),
      h('progress', { max: total, value: hechos, 'aria-label': 'Temas dominados' }));
    var cuerpo = [hero];
    cuerpo.push(h('div', { class: 'card' }, h('h3', { text: '¿Cómo usar este portal?' }),
      h('ol', null,
        h('li', { text: 'Elige un tema. Lee la receta (es corta y con palabras sencillas).' }),
        h('li', { text: 'Mira el ejemplo resuelto y luego practica. Si te trabas, pide una pista: te la da paso a paso.' }),
        h('li', { text: 'Cuando domines varios temas, haz un simulacro con reloj para entrenar el examen real.' }),
        h('li', { text: 'Los problemas que falles se guardan en “Repaso” para volver a intentarlos.' }))));
    var areas = {};
    temaIds.forEach(function (id) { (areas[TEMAS[id].area] = areas[TEMAS[id].area] || []).push(id); });
    Object.keys(areas).forEach(function (a) {
      cuerpo.push(h('h2', { class: 'area-title' }, a));
      cuerpo.push(h('div', { class: 'grid' }, areas[a].map(function (id) {
        var e = estado(id);
        return h('a', { class: 'tema', href: '#/tema/' + id }, h('b', { text: TEMAS[id].nombre }),
          h('span', { class: 'estado', text: e.txt + (e.pct ? ' · ' + e.pct + '%' : '') }),
          h('div', { class: 'bar' }, h('i', { style: null, 'data-w': e.pct })));
      })));
    });
    return cuerpo;
  }

  function vistaTema(id) {
    var T = TEMAS[id]; if (!T) return vistaNoExiste();
    var ej = M.make(id, 12345);
    return [crumbs(T.area, ' › ', T.nombre),
      h('h1', { text: T.nombre }),
      receta(id, true),
      h('h2', { text: 'Un ejemplo resuelto' }),
      h('div', { class: 'card' }, h('p', { class: 'q', text: ej.q }), figura(ej),
        h('p', { class: 'muted', text: 'Así se piensa, paso a paso:' }), pasosList(ej),
        h('p', { class: 'muted', text: 'Respuesta: ' + (ej.grid ? ej.answer : ej.opts[ej.a]) })),
      h('div', { class: 'row' },
        h('a', { class: 'btn', href: '#/practica/' + id, text: 'Practicar este tema →' }),
        h('a', { class: 'btn ghost', href: '#/', text: 'Volver al camino' }))];
  }

  /* Sesion de practica (tema o repaso). items: lista de problemas ya creados */
  function vistaPractica(titulo, items, volver) {
    var st = { i: 0, ok: 0, pistas: 0, resp: false };
    var cont = h('div');
    function pinta() {
      clear(cont);
      if (st.i >= items.length) return fin();
      var p = items[st.i], vistas = 0, resp = false;
      var pistaBox = h('div'), pistaBtn, msg = h('div'), solucion = h('div'), sig = h('div');
      pistaBtn = h('button', { class: 'btn soft sm', type: 'button', text: '💡 Dame una pista', onclick: function () {
        if (vistas < p.pasos.length - 1) { vistas++; st.pistas++; clear(pistaBox); pistaBox.appendChild(pasosList(p, vistas)); }
        if (vistas >= p.pasos.length - 1) { pistaBtn.disabled = true; pistaBtn.textContent = 'Ya tienes todas las pistas: ¡responde!'; }
        else pistaBtn.textContent = '💡 Otra pista (' + vistas + ' de ' + (p.pasos.length - 1) + ')';
      } });
      function responder(correcto, marcar) {
        if (resp) return; resp = true;
        registrar(p, correcto); if (correcto) st.ok++;
        marcar && marcar();
        pistaBtn.disabled = true; clear(pistaBox);
        msg.appendChild(h('div', { class: 'msg ' + (correcto ? 'ok' : 'bad'), role: 'status', text: correcto ? '¡Muy bien! ✅ Respuesta correcta.' : 'No pasa nada, así se aprende. La respuesta era: ' + (p.grid ? p.answer : p.opts[p.a]) }));
        solucion.appendChild(h('h3', { text: 'Así se resuelve' })); solucion.appendChild(pasosList(p));
        sig.appendChild(h('button', { class: 'btn', type: 'button', text: st.i + 1 >= items.length ? 'Ver resultado' : 'Siguiente →', onclick: function () { st.i++; pinta(); window.scrollTo(0, 0); } }));
      }
      var entrada;
      if (p.grid) {
        var inp = h('input', { class: 'num', type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': 'Tu respuesta' });
        var go = function () { if (inp.value.trim() === '') return; inp.disabled = true; var ok = comprobarGrid(p, inp.value); responder(ok); };
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
        entrada = h('div', { class: 'row' }, inp, h('button', { class: 'btn', type: 'button', text: 'Comprobar', onclick: go }));
      } else {
        var btns = p.opts.map(function (o, k) {
          return h('button', { class: 'opt', type: 'button', onclick: function () {
            responder(k === p.a, function () { btns.forEach(function (b, j) { b.disabled = true; if (j === p.a) b.classList.add('ok'); else if (j === k) b.classList.add('bad'); }); });
          } }, h('span', { class: 'l', text: LET[k] }), h('span', { text: o }));
        });
        entrada = h('div', { class: 'opts', role: 'group', 'aria-label': 'Opciones' }, btns);
      }
      cont.appendChild(h('div', null,
        h('div', { class: 'row between' }, h('b', { text: 'Pregunta ' + (st.i + 1) + ' de ' + items.length }), h('span', { class: 'muted', text: st.ok + ' correctas' })),
        h('progress', { max: items.length, value: st.i, 'aria-label': 'Avance' }),
        receta(p.tema, st.i === 0),
        h('div', { class: 'card' }, h('p', { class: 'q', text: p.q }), figura(p), entrada, pistaBtn, pistaBox, msg, solucion, sig)));
      var f = cont.querySelector('input.num'); if (f) f.focus();
    }
    function fin() {
      var pct = Math.round(100 * st.ok / items.length);
      cont.appendChild(h('div', { class: 'card' }, h('h2', { text: 'Terminaste esta práctica' }),
        h('p', { class: 'score', text: st.ok + ' / ' + items.length }),
        h('p', { class: 'big', text: pct >= 80 ? '¡Excelente! Ya dominas este tema. 🎉' : pct >= 50 ? 'Vas muy bien. Repite una vez más y lo dominas.' : 'Es normal al principio. Lee la receta otra vez y usa las pistas; verás cómo mejora.' }),
        h('p', { class: 'muted', text: 'Pediste ' + st.pistas + ' pista(s). Es una buena herramienta: úsalas sin pena.' }),
        h('div', { class: 'row' },
          h('button', { class: 'btn', type: 'button', text: 'Practicar otra vez', onclick: function () { location.reload(); } }),
          h('a', { class: 'btn ghost', href: volver, text: 'Volver' }))));
    }
    pinta();
    return [crumbs(titulo), h('h1', { text: titulo }), cont];
  }

  function lote(tema, n) {
    var out = [], base = rnd();
    for (var i = 0; i < n; i++) out.push(M.make(tema, base + i * 101, M.GRID_OK && i % 4 === 3));
    return out;
  }

  function vistaRepaso() {
    var ids = load().errores.slice(-10).reverse(), items = [];
    ids.forEach(function (id) { try { items.push(desdeId(id)); } catch (e) { /* ignora */ } });
    if (!items.length) return [crumbs('Repaso'), h('h1', { text: 'Repaso' }), h('div', { class: 'card' }, h('p', { class: 'big', text: 'No tienes problemas pendientes de repaso. 🎉' }), h('p', { class: 'muted', text: 'Cuando falles alguno, aparecerá aquí para que lo intentes de nuevo. Al acertarlo, sale de la lista.' }), h('a', { class: 'btn', href: '#/', text: 'Ir al camino' }))];
    return vistaPractica('Repaso de errores', items, '#/');
  }

  /* ---------- simulacro ---------- */
  var simTimer = null;
  function detenerSim() { if (simTimer) { clearInterval(simTimer); simTimer = null; } }

  function vistaSimulacro() {
    var ayuda = h('input', { type: 'checkbox', id: 'ayuda' });
    function opcion(titulo, n, min, desc) {
      return h('div', { class: 'card' }, h('h3', { text: titulo }), h('p', { class: 'muted', text: desc }),
        h('button', { class: 'btn', type: 'button', text: 'Comenzar (' + n + ' preguntas, ' + min + ' min)', onclick: function () { empezarSim(n, min, ayuda.checked); } }));
    }
    return [crumbs('Simulacro'), h('h1', { text: 'Simulacro de examen' }),
      h('p', { class: 'big', text: 'Aquí practicas como el día real: con reloj, sin ver la respuesta hasta el final y sin calculadora. Antes de hacerlo, repasa las recetas del camino.' }),
      h('div', { class: 'card' }, h('label', null, ayuda, ' Mostrar la receta de cada tema mientras resuelvo (modo ayuda)'),
        h('p', { class: 'muted', text: 'Recomendado al principio. Cuando te sientas listo, hazlo sin ayuda.' })),
      opcion('Corto', 15, 25, 'Para empezar a entrenar el reloj.'),
      opcion('Completo', 40, 70, 'Mezcla de aritmética, álgebra, geometría y datos. Aproximadamente 1 y medio minuto por pregunta.'),
      h('p', { class: 'muted', text: 'En la prueba real no se descuenta por respuesta equivocada: si no sabes, marca una opción igual.' })];
  }

  function empezarSim(n, min, ayuda) {
    detenerSim();
    var ids = Object.keys(TEMAS), qs = [], base = rnd(), i;
    var orden = M.shuffle(M.mulberry32(base), ids);
    for (i = 0; i < n; i++) qs.push(M.make(orden[i % orden.length], base + i * 131, i % 7 === 6));
    qs = M.shuffle(M.mulberry32(base + 1), qs);
    var S = { qs: qs, resp: qs.map(function () { return null; }), flag: qs.map(function () { return false; }), i: 0, fin: Date.now() + min * 60000, ayuda: ayuda, min: min };
    clear(app);
    var host = h('div'); app.appendChild(host);
    function pinta() {
      clear(host);
      var p = S.qs[S.i];
      var tm = h('span', { class: 'timer', role: 'timer', 'aria-label': 'Tiempo restante' });
      function tic() {
        var ms = S.fin - Date.now(); if (ms <= 0) { detenerSim(); terminar(true); return; }
        var m = Math.floor(ms / 60000), sx = Math.floor(ms % 60000 / 1000);
        tm.textContent = '⏱ ' + m + ':' + (sx < 10 ? '0' : '') + sx; tm.className = 'timer' + (ms < 300000 ? ' low' : '');
      }
      detenerSim(); tic(); simTimer = setInterval(tic, 1000);
      var dots = h('div', { class: 'dots' }, S.qs.map(function (q, k) {
        return h('button', { type: 'button', class: 'dot' + (S.resp[k] != null ? ' done' : '') + (k === S.i ? ' cur' : '') + (S.flag[k] ? ' flag' : ''), text: k + 1, 'aria-label': 'Ir a la pregunta ' + (k + 1), onclick: function () { S.i = k; pinta(); } });
      }));
      var entrada;
      if (p.grid) {
        var inp = h('input', { class: 'num', type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': 'Tu respuesta', value: S.resp[S.i] == null ? '' : S.resp[S.i] });
        inp.addEventListener('input', function () { S.resp[S.i] = inp.value.trim() === '' ? null : inp.value; });
        entrada = inp;
      } else {
        var btns = p.opts.map(function (o, k) {
          return h('button', { class: 'opt' + (S.resp[S.i] === k ? ' sel' : ''), type: 'button', onclick: function () { S.resp[S.i] = k; btns.forEach(function (b, j) { b.classList.toggle('sel', j === k); }); } },
            h('span', { class: 'l', text: LET[k] }), h('span', { text: o }));
        });
        entrada = h('div', { class: 'opts' }, btns);
      }
      host.appendChild(h('div', null,
        h('div', { class: 'row between' }, h('b', { text: 'Pregunta ' + (S.i + 1) + ' de ' + S.qs.length }), tm),
        S.ayuda ? receta(p.tema, false) : null,
        h('div', { class: 'card' }, h('p', { class: 'q', text: p.q }), figura(p), p.grid ? h('p', { class: 'muted', text: 'Escribe tu respuesta como número.' }) : null, entrada,
          h('div', { class: 'row' },
            h('button', { class: 'btn ghost sm', type: 'button', text: S.flag[S.i] ? 'Quitar marca ⚑' : 'Marcar para revisar ⚑', onclick: function () { S.flag[S.i] = !S.flag[S.i]; pinta(); } }))),
        dots,
        h('div', { class: 'row between' },
          h('button', { class: 'btn ghost', type: 'button', text: '← Anterior', disabled: S.i === 0, onclick: function () { S.i--; pinta(); } }),
          S.i < S.qs.length - 1 ? h('button', { class: 'btn', type: 'button', text: 'Siguiente →', onclick: function () { S.i++; pinta(); } })
            : h('button', { class: 'btn', type: 'button', text: 'Entregar examen', onclick: function () {
              var sin = S.resp.filter(function (x) { return x == null; }).length;
              if (!sin || confirm('Te faltan ' + sin + ' sin contestar. En la prueba real no se descuenta por equivocarse. ¿Entregar de todos modos?')) terminar(false);
            } }))));
    }
    function terminar() {
      detenerSim(); clear(host);
      var ok = 0, porArea = {}, malas = [];
      S.qs.forEach(function (p, k) {
        var r = S.resp[k], bien = r != null && (p.grid ? comprobarGrid(p, r) : r === p.a), area = TEMAS[p.tema].area;
        porArea[area] = porArea[area] || { n: 0, ok: 0 }; porArea[area].n++;
        if (bien) { ok++; porArea[area].ok++; } else malas.push({ p: p, r: r });
        registrar(p, bien);
      });
      var pct = ok / S.qs.length, pts = Math.round(200 + 600 * pct);
      var s = load(); s.sims.push({ t: Date.now(), n: S.qs.length, ok: ok }); if (s.sims.length > 30) s.sims.shift(); save();
      host.appendChild(h('div', null, h('h1', { text: 'Resultado del simulacro' }),
        h('div', { class: 'card' }, h('p', { class: 'score', text: ok + ' / ' + S.qs.length }),
          h('p', { class: 'big', text: Math.round(pct * 100) + '% de aciertos · puntaje estimado en matemáticas: ' + pts + ' de 800' }),
          h('p', { class: 'muted', text: 'Es una estimación para orientarte (la conversión oficial no es exacta). La UTP pide sumar 900 puntos entre las dos partes de 800 para carreras no ingenieriles y 1000 para ingenierías. Una buena meta de práctica: llegar al 70% de aciertos con margen.' })),
        h('div', { class: 'card' }, h('h3', { text: 'Por área' }), Object.keys(porArea).map(function (a) {
          var v = porArea[a], pc = Math.round(100 * v.ok / v.n);
          return h('div', null, h('div', { class: 'row between' }, h('span', { text: a }), h('b', { text: v.ok + '/' + v.n })), h('progress', { max: 100, value: pc, 'aria-label': a }));
        })),
        malas.length ? h('div', null, h('h2', { text: 'Revisa lo que fallaste (' + malas.length + ')' }), h('p', { class: 'muted', text: 'Están guardados en Repaso. Abre cada uno para ver cómo se resuelve.' }),
          malas.map(function (m) {
            var tuya = m.r == null ? 'Sin contestar' : (m.p.grid ? m.r : LET[m.r] + ') ' + m.p.opts[m.r]);
            return h('details', { class: 'card' }, h('summary', { text: m.p.q }), figura(m.p),
              h('p', { text: 'Tu respuesta: ' + tuya }), h('p', { text: 'Correcta: ' + (m.p.grid ? m.p.answer : LET[m.p.a] + ') ' + m.p.opts[m.p.a]) }), pasosList(m.p));
          })) : h('div', { class: 'msg ok', text: '¡Sin errores! Perfecto. 🏆' }),
        h('div', { class: 'row' }, h('a', { class: 'btn', href: '#/repaso', text: 'Ir a repasar' }), h('a', { class: 'btn ghost', href: '#/simulacro', text: 'Otro simulacro' }), h('a', { class: 'btn ghost', href: '#/', text: 'Camino' }))));
      window.scrollTo(0, 0);
    }
    pinta();
  }

  function vistaGuia() {
    function link(t, u) { return h('li', null, h('a', { href: u, target: '_blank', rel: 'noopener noreferrer', text: t })); }
    return [crumbs('Sobre la prueba'), h('h1', { text: 'Sobre la prueba de admisión (PAA)' }),
      h('div', { class: 'card' }, h('h3', { text: 'Lo que dice la UTP' }), h('ul', null,
        h('li', { text: 'La PAA mide Lectura y Redacción (800 puntos), Razonamiento Matemático (800 puntos) e Inglés (solo diagnóstico). Total: 1600.' }),
        h('li', { text: 'Para carreras técnicas y licenciaturas no ingenieriles: 900 puntos o más (56.25%). Para ingenierías: 1000 o más (62.5%).' }),
        h('li', { text: 'Matemáticas incluye Aritmética, Álgebra, Geometría, y Análisis de datos y Probabilidad. No se usa calculadora.' }),
        h('li', { text: 'Las preguntas tienen 4 opciones y algunas piden escribir la respuesta. No hay penalización por responder mal.' }),
        h('li', { text: 'Los problemas van de más fáciles a más difíciles dentro de cada grupo.' }))),
      h('div', { class: 'card' }, h('h3', { text: 'Consejos para el día del examen' }), h('ul', null,
        h('li', { text: 'Haz primero los que sabes y deja marcados los difíciles para volver.' }),
        h('li', { text: 'Si no sabes, descarta opciones y marca una igual: equivocarse no resta.' }),
        h('li', { text: 'No gastes mucho tiempo en un solo problema.' }),
        h('li', { text: 'Duerme bien la noche anterior y lleva tus lápices y tu identificación.' }))),
      h('div', { class: 'card' }, h('h3', { text: 'Material oficial (gratis)' }), h('ul', null,
        link('Guía de estudio oficial de la PAA (PDF, UTP)', 'https://utp.ac.pa/sites/default/files/documentos/2024/pdf/guia_de_estudios_paa_v2021.pdf'),
        link('Práctica oficial para la PAA', 'https://paa.aprendolibre.com/'),
        link('Proceso de admisión de la UTP (fechas e inscripción)', 'https://utp.ac.pa/proceso-de-admision-para-las-carreras-de-pregrado')),
        h('p', { class: 'muted', text: 'Las fechas y requisitos pueden cambiar: confirma siempre en el sitio de la UTP.' })),
      h('div', { class: 'card' }, h('h3', { text: 'Tu progreso' }), h('p', { class: 'muted', text: 'Se guarda solo en este navegador de este dispositivo. No se envía a ningún lado.' }),
        h('button', { class: 'btn ghost sm', type: 'button', text: 'Borrar mi progreso', onclick: function () { if (confirm('¿Seguro? Se borrará todo tu progreso en este dispositivo.')) { mem = {}; try { localStorage.removeItem(KEY); } catch (e) { /* nada */ } load(); route(); } } }))];
  }
  function vistaNoExiste() { return [h('h1', { text: 'No encontré esa página' }), h('a', { class: 'btn', href: '#/', text: 'Ir al inicio' })]; }

  /* ---------- enrutador ---------- */
  function route() {
    detenerSim();
    var parts = (location.hash.replace(/^#\/?/, '') || '').split('/'), name = parts[0] || 'inicio', id = parts[1], out;
    try {
      if (name === 'inicio') out = vistaInicio();
      else if (name === 'tema') out = vistaTema(id);
      else if (name === 'practica') out = TEMAS[id] ? vistaPractica(TEMAS[id].nombre, lote(id, 8), '#/tema/' + id) : vistaNoExiste();
      else if (name === 'repaso') out = vistaRepaso();
      else if (name === 'simulacro') { out = vistaSimulacro(); }
      else if (name === 'guia') out = vistaGuia();
      else out = vistaNoExiste();
    } catch (e) {
      out = [h('h1', { text: 'Algo salió mal' }), h('p', { text: 'Recarga la página. Si sigue igual, avisa a quien te compartió el portal.' })];
      if (window.console) console.error(e);
    }
    clear(app); add(app, out);
    document.querySelectorAll('nav a').forEach(function (a) {
      var k = a.getAttribute('data-nav'), on = k === name || (k === 'inicio' && (name === 'tema' || name === 'practica'));
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    // anchos de las barras de progreso (sin estilos en linea por CSP)
    app.querySelectorAll('.bar > i[data-w]').forEach(function (el) { el.className = 'w' + (Math.round(el.getAttribute('data-w') / 10) * 10); });
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();
})();
