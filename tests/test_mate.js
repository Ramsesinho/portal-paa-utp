'use strict';
const M = require('../data/mate.js');
let fails = 0, total = 0;
const bad = (m, p) => { fails++; if (fails < 25) console.log('FALLA:', m, '\n  ', p && p.q, p && p.opts, p && p.answer); };
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const num = (s) => parseFloat(String(s).replace('−', '-'));

for (const tema of Object.keys(M.TEMAS)) {
  for (let seed = 1; seed <= 600; seed++) {
    for (const g of [false, true]) {
      let p;
      try { p = M.make(tema, seed, g); } catch (e) { bad('no genera ' + tema + ' ' + e.message); continue; }
      total++;
      if (!p.pasos || p.pasos.length < 2) bad('faltan pasos', p);
      if (p.grid) { if (!/^-?\d+(\.\d+)?$/.test(p.answer)) bad('grid no numerico', p); continue; }
      if (!Array.isArray(p.opts) || p.opts.length !== 4 || new Set(p.opts).size !== 4) bad('opciones no unicas', p);
      if (!(p.a >= 0 && p.a < 4)) bad('indice a invalido', p);
      const ans = p.opts[p.a];
      let m;
      // --- verificaciones independientes ---
      if ((m = p.q.match(/^Si (.+)x ([+−]) (\d+) = (−?\d+), ¿cuánto vale x\?/)) && p.tema === 'alg_lineal') {
        const a = num(m[1]), b = m[2] === '+' ? num(m[3]) : -num(m[3]), c = num(m[4]);
        if (a * num(ans) + b !== c) bad('lineal', p);
      }
      if ((m = p.q.match(/^x \+ y = (\d+)  y  x − y = (\d+)/))) { const x = num(ans), s = +m[1], d = +m[2]; if (x + (s - x) !== s || x - (s - x) !== d) bad('sistema', p); }
      if ((m = p.q.match(/^El mínimo común múltiplo \(MCM\) de (\d+) y (\d+)/))) { const a = +m[1], b = +m[2]; if (a * b / gcd(a, b) !== num(ans)) bad('mcm', p); }
      if ((m = p.q.match(/^El máximo común divisor \(MCD\) de (\d+) y (\d+)/))) { if (gcd(+m[1], +m[2]) !== num(ans)) bad('mcd', p); }
      if ((m = p.q.match(/^¿Cuánto es el (\d+)% de (\d+)\?/))) { if (+m[1] * +m[2] / 100 !== num(ans)) bad('porc', p); }
      if ((m = p.q.match(/^Calcula: (\d+)\/(\d+) \+ (\d+)\/(\d+)$/))) {
        const [n1, b, n2, d] = m.slice(1).map(Number), [an, ad] = ans.includes('/') ? ans.split('/').map(Number) : [num(ans), 1];
        if (an * b * d !== (n1 * d + n2 * b) * ad) bad('frac', p);
      }
      if ((m = p.q.match(/^Un círculo tiene diámetro de (\d+) cm/))) { const r = +m[1] / 2; if (ans !== r * r + 'π cm²') bad('circulo', p); }
      if ((m = p.q.match(/^En un triángulo rectángulo los catetos miden (\d+) y (\d+)/))) { if (Math.hypot(+m[1], +m[2]) !== num(ans)) bad('pit', p); }
      if ((m = p.q.match(/^En un triángulo rectángulo la hipotenusa mide (\d+) y un cateto mide (\d+)/))) { if (Math.hypot(num(ans), +m[2]) !== +m[1]) bad('pit2', p); }
      if ((m = p.q.match(/^La mediana de (.+) es:/))) { const s = m[1].split(', ').map(Number).sort((a, b) => a - b); if (s[(s.length - 1) / 2] !== num(ans)) bad('mediana', p); }
      if ((m = p.q.match(/^El promedio \(media\) de (.+) es:/))) { const v = m[1].split(', ').map(Number); if (v.reduce((a, b) => a + b, 0) / v.length !== num(ans)) bad('media', p); }
      if ((m = p.q.match(/^Resuelve: (.+)x ([+−]) (\d+) = (.+)x ([+−]) (\d+)$/)) ) {
        const a = num(m[1] || 1), b = (m[2] === '+' ? 1 : -1) * +m[3], c = num(m[4] || 1), d = (m[5] === '+' ? 1 : -1) * +m[6], x = num(ans);
        if (a * x + b !== c * x + d) bad('lineal2', p);
      }
      if ((m = p.q.match(/^Simplifica: √(\d+)$/))) { const [k, rad] = ans.split('√').map(Number); if (k * k * rad !== +m[1]) bad('radical', p); }
      if ((m = p.q.match(/^Si f\(x\) = (.+), ¿cuánto vale f\((−?\d+)\)\?/))) {
        const k = num(m[2]); let e = m[1].replace(/−/g, '-').replace(/x²/g, '*(x*x)').replace(/(\d)x/g, '$1*x').replace(/ /g, '');
        if (/^\*/.test(e)) e = '1' + e; e = e.replace(/^\(x\*x\)/, '1*(x*x)').replace(/([+-])\(x\*x\)/, '$11*(x*x)');
        const x = k; const v = eval(e.replace(/^\*/, '1*').replace(/^(\(x\*x\))/, '$1')); // eslint-disable-line no-eval
        if (v !== num(ans)) bad('funcion ' + e + '=' + v, p);
      }
    }
  }
}
console.log(`${total} problemas generados, ${fails} fallas`);
process.exit(fails ? 1 : 0);
