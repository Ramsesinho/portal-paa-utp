/* Generador de problemas de matematica. Cada problema trae:
   tema, q (enunciado), opts[4] + a (indice correcto) o grid:true + answer,
   pasos[] (solucion explicada en palabras simples; el ultimo paso da la respuesta). */
(function (root) {
  'use strict';

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var ri = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  function shuffle(r, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  var gcd = function (a, b) { return b ? gcd(b, a % b) : Math.abs(a); };
  var lcm = function (a, b) { return a / gcd(a, b) * b; };
  function frac(n, d) {
    var g = gcd(n, d); n /= g; d /= g;
    if (d < 0) { n = -n; d = -d; }
    return d === 1 ? String(n) : n + '/' + d;
  }
  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
  function sup(n) { return String(n).split('').map(function (c) { return SUP[c] || c; }).join(''); }
  function sg(n) { return n < 0 ? '−' + (-n) : String(n); }          // numero con signo menos bonito
  function lin(a, b) {                                                // ax + b
    var s = (a === 1 ? '' : a === -1 ? '−' : sg(a)) + 'x';
    if (b > 0) s += ' + ' + b; else if (b < 0) s += ' − ' + (-b);
    return s;
  }
  function num(x) { return String(parseFloat(x.toFixed(4))); }

  function build(r, tema, q, correct, wrongs, pasos, extra) {
    var seen = {}; seen[String(correct)] = 1; var w = [];
    wrongs.forEach(function (x) {
      var s = String(x);
      if (!seen[s]) { seen[s] = 1; w.push(s); }
    });
    if (w.length < 3 && typeof correct === 'number') {
      var k = 1;
      while (w.length < 3 && k < 30) {
        [correct + k, correct - k].forEach(function (c) {
          var s = String(c);
          if (!seen[s] && w.length < 3 && !(correct >= 0 && c < 0 && false)) { seen[s] = 1; w.push(s); }
        });
        k++;
      }
    }
    if (w.length < 3) throw new Error('faltan distractores: ' + q);
    var all = shuffle(r, [String(correct)].concat(w.slice(0, 3)));
    var o = { tema: tema, q: q, opts: all, a: all.indexOf(String(correct)), pasos: pasos };
    if (extra) for (var key in extra) o[key] = extra[key];
    return o;
  }
  function grid(tema, q, answer, pasos, extra) {
    var o = { tema: tema, q: q, grid: true, answer: String(answer), pasos: pasos };
    if (extra) for (var key in extra) o[key] = extra[key];
    return o;
  }

  var G = {}; // generadores por nombre

  /* ================= ARITMETICA ================= */
  G.fracSuma = function (r) {
    var b = pick(r, [2, 3, 4, 5, 6, 8]), d = pick(r, [2, 3, 4, 5, 6, 8]);
    while (d === b) d = pick(r, [2, 3, 4, 5, 6, 8]);
    var n1 = ri(r, 1, b - 1), n2 = ri(r, 1, d - 1), L = lcm(b, d);
    var a1 = n1 * (L / b), a2 = n2 * (L / d);
    var ok = frac(a1 + a2, L);
    return build(r, 'arit_frac', 'Calcula: ' + n1 + '/' + b + ' + ' + n2 + '/' + d, ok,
      [(n1 + n2) + '/' + (b + d), frac(n1 * n2, b * d), (a1 + a2) + '/' + (L + b), frac(a1 + a2, L) === ok ? (a1 + a2 + 1) + '/' + L : ''],
      ['Para sumar fracciones los “pisos” (denominadores) deben ser iguales. Busca un número donde quepan ' + b + ' y ' + d + ': el ' + L + '.',
       n1 + '/' + b + ' = ' + a1 + '/' + L + '  (multiplicamos arriba y abajo por ' + (L / b) + ').',
       n2 + '/' + d + ' = ' + a2 + '/' + L + '  (multiplicamos arriba y abajo por ' + (L / d) + ').',
       'Ahora sumamos solo los de arriba: ' + a1 + ' + ' + a2 + ' = ' + (a1 + a2) + '. El piso se queda en ' + L + ': ' + (a1 + a2) + '/' + L + '.',
       'Si se puede, simplificamos. Respuesta: ' + ok + '.']);
  };

  G.decimalMult = function (r) {
    var x = ri(r, 2, 9), y = ri(r, 2, 9), v = x * y / 100;
    return build(r, 'arit_frac', 'Calcula: 0.' + x + ' × 0.' + y, num(v),
      [num(x * y / 10), num(x * y / 1000), num(x * y), num(x / 10 + y / 10)],
      ['Olvida los puntos un momento: ' + x + ' × ' + y + ' = ' + (x * y) + '.',
       'Cuenta cuántos números hay después del punto en total: 0.' + x + ' tiene 1 y 0.' + y + ' tiene 1, o sea 2 lugares.',
       'Pon el punto 2 lugares desde la derecha: ' + num(v) + '.']);
  };

  G.porcDe = function (r) {
    var p = pick(r, [10, 15, 20, 25, 30, 40, 50, 60, 75]), n = pick(r, [40, 60, 80, 120, 160, 200, 240, 400]);
    var v = p * n / 100;
    return build(r, 'arit_porc', '¿Cuánto es el ' + p + '% de ' + n + '?', v,
      [p * n / 10, n / p * 10, n - v, v * 2],
      ['“Por ciento” quiere decir “de cada 100”. Entonces ' + p + '% es ' + p + ' de cada 100.',
       'Divide ' + n + ' entre 100: ' + (n / 100) + '. Eso es el 1%.',
       'Multiplica por ' + p + ': ' + (n / 100) + ' × ' + p + ' = ' + v + '.']);
  };

  G.descuento = function (r) {
    var P = pick(r, [20, 40, 60, 80, 100, 120, 200]), d = pick(r, [10, 20, 25, 30, 40, 50]);
    var desc = P * d / 100, fin = P - desc;
    return build(r, 'arit_porc', 'Una camisa cuesta $' + P + ' y tiene ' + d + '% de descuento. ¿Cuánto se paga?', fin,
      [desc, P + desc, P - d, fin + desc],
      ['Primero busca cuánto se descuenta: el ' + d + '% de ' + P + '. (' + P + ' ÷ 100) × ' + d + ' = ' + desc + '.',
       'Ese dinero se RESTA del precio: ' + P + ' − ' + desc + ' = ' + fin + '.',
       'Cuidado: ' + desc + ' es lo que te ahorras, no lo que pagas. Se paga $' + fin + '.']);
  };

  G.queProc = function (r) {
    var b = pick(r, [20, 40, 50, 80, 200, 250]), p = pick(r, [10, 20, 25, 30, 40, 50, 60, 75]);
    var a = b * p / 100;
    return build(r, 'arit_porc', '¿Qué por ciento de ' + b + ' es ' + a + '?', p + '%',
      [(100 - p) + '%', (p + 10) + '%', (p + 20) + '%', Math.max(5, p - 5) + '%'],
      ['Piensa en una fracción: ' + a + ' de ' + b + ' es ' + a + '/' + b + '.',
       'Para pasar a “de cada 100” multiplicamos por 100: ' + a + ' ÷ ' + b + ' = ' + num(a / b) + ' y ' + num(a / b) + ' × 100 = ' + p + '.',
       'Respuesta: ' + p + '%.']);
  };

  G.proporcion = function (r) {
    var k = pick(r, [2, 3, 4, 5, 6]), u = pick(r, [2, 3, 4, 5, 6, 7, 8]), m = k * ri(r, 2, 4), c = k * u;
    var ok = m * u;
    return build(r, 'arit_prop', k + ' cuadernos cuestan $' + c + '. ¿Cuánto cuestan ' + m + ' cuadernos?', ok,
      [c + m, (m - k) * u, c * 2, ok + u],
      ['Primero busca cuánto cuesta UN cuaderno: ' + c + ' ÷ ' + k + ' = ' + u + '.',
       'Ahora multiplica por los que quieres comprar: ' + u + ' × ' + m + ' = ' + ok + '.',
       'Respuesta: $' + ok + '.']);
  };

  G.escala = function (r) {
    var e = pick(r, [5, 10, 20, 25]), cm = ri(r, 3, 9), ok = e * cm;
    return build(r, 'arit_prop', 'En un mapa, 1 cm representa ' + e + ' km. Dos pueblos están a ' + cm + ' cm en el mapa. ¿A cuántos km están en la realidad?', ok,
      [e + cm, cm * 2 * e, ok / 2 + e, ok + e],
      ['Cada centímetro del mapa vale ' + e + ' km.', 'Hay ' + cm + ' centímetros, así que repetimos ' + e + ' km, ' + cm + ' veces.',
       e + ' × ' + cm + ' = ' + ok + '. Respuesta: ' + ok + ' km.']);
  };

  G.mcdmcm = function (r) {
    var g = pick(r, [2, 3, 4, 5, 6]), p = pick(r, [2, 3, 5, 7]), q = pick(r, [2, 3, 5, 7]);
    while (q === p) q = pick(r, [2, 3, 5, 7]);
    var a = g * p, b = g * q, esMcm = r() < 0.5;
    if (esMcm) {
      var ok = g * p * q;
      return build(r, 'arit_teoria', 'El mínimo común múltiplo (MCM) de ' + a + ' y ' + b + ' es:', ok,
        [a * b, g, a + b, ok + g],
        ['El MCM es el primer número al que llegan los dos “saltando de a ' + a + '” y “saltando de a ' + b + '”.',
         'Descomponemos: ' + a + ' = ' + g + ' × ' + p + ' y ' + b + ' = ' + g + ' × ' + q + '. Lo que se repite (' + g + ') se cuenta una sola vez.',
         'MCM = ' + g + ' × ' + p + ' × ' + q + ' = ' + ok + '.']);
    }
    return build(r, 'arit_teoria', 'El máximo común divisor (MCD) de ' + a + ' y ' + b + ' es:', g,
      [a * b / g, p * q, a - b < 0 ? b - a + g : a - b + g, g + 1],
      ['El MCD es el número más GRANDE que cabe exacto en los dos.',
       'Descomponemos: ' + a + ' = ' + g + ' × ' + p + ' y ' + b + ' = ' + g + ' × ' + q + '.',
       'Lo que comparten es ' + g + '. Respuesta: ' + g + '.']);
  };

  function isPrime(n) { if (n < 2) return false; for (var i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
  G.primos = function (r) {
    var a = ri(r, 10, 40), b = a + ri(r, 10, 18), lst = [];
    for (var i = a; i <= b; i++) if (isPrime(i)) lst.push(i);
    return build(r, 'arit_teoria', '¿Cuántos números primos hay entre ' + a + ' y ' + b + ' (contando ' + a + ' y ' + b + ' si lo son)?', lst.length,
      [lst.length + 1, lst.length - 1, lst.length + 2],
      ['Un número primo solo se puede dividir exacto entre 1 y entre sí mismo (como 7, 11, 13).',
       'Revisamos uno por uno desde ' + a + ' hasta ' + b + '. Si es par (y no es 2) o termina en 5, no es primo.',
       'Los primos que encontramos: ' + (lst.length ? lst.join(', ') : 'ninguno') + '.',
       'Respuesta: ' + lst.length + '.']);
  };

  G.factorPrima = function (r) {
    var a = ri(r, 1, 3), b = ri(r, 1, 2), c = ri(r, 0, 1), N = Math.pow(2, a) * Math.pow(3, b) * Math.pow(5, c);
    function f(x, y, z) { return ['2' + sup(x), '3' + sup(y)].concat(z ? ['5'] : []).join(' × '); }
    var ok = f(a, b, c);
    return build(r, 'arit_teoria', '¿Cuál es la factorización prima de ' + N + '?', ok,
      [f(a + 1, b, c), f(a, b + 1, c), f(Math.max(1, a - 1), b, c) , f(a, Math.max(1, b - 1), c + 1)],
      ['Vamos dividiendo entre números primos (2, 3, 5…) hasta llegar a 1.',
       'Los factores de ' + N + ' son: ' + Array(a + 1).join('2 ').trim() + ' ' + Array(b + 1).join('3 ').trim() + (c ? ' 5' : '') + '.',
       'Contamos cuántas veces aparece cada uno y lo escribimos con exponente: ' + ok + '.',
       'Comprobamos multiplicando: da ' + N + '.']);
  };

  G.exponentes = function (r) {
    var a = ri(r, 3, 7), b = ri(r, 2, 6), c = ri(r, 1, 4), e = a + b - c;
    return build(r, 'arit_exp', 'Simplifica: (x' + sup(a) + ' · x' + sup(b) + ') ÷ x' + sup(c), 'x' + sup(e),
      ['x' + sup(a * b - c), 'x' + sup(a + b + c), 'x' + sup(a * b / c | 0), 'x' + sup(e + 1)],
      ['Regla 1: al MULTIPLICAR potencias con la misma base, los exponentes se SUMAN: ' + a + ' + ' + b + ' = ' + (a + b) + '.',
       'Regla 2: al DIVIDIR, los exponentes se RESTAN: ' + (a + b) + ' − ' + c + ' = ' + e + '.',
       'Respuesta: x' + sup(e) + '.']);
  };

  G.cientifica = function (r) {
    var a = pick(r, [2, 3]), b = pick(r, [2, 3]), m = ri(r, 2, 6), n = ri(r, 2, 6), ok = a * b + '×10' + sup(m + n);
    return build(r, 'arit_exp', 'Calcula: (' + a + '×10' + sup(m) + ')(' + b + '×10' + sup(n) + ')', ok,
      [(a * b) + '×10' + sup(m * n), (a + b) + '×10' + sup(m + n), (a * b) + '×10' + sup(m + n + 1), (a * b) + '×10' + sup(Math.abs(m - n))],
      ['Multiplica por un lado los números normales: ' + a + ' × ' + b + ' = ' + (a * b) + '.',
       'Por otro lado las potencias de 10: los exponentes se suman: ' + m + ' + ' + n + ' = ' + (m + n) + '.',
       'Junta todo: ' + ok + '.']);
  };

  G.patron = function (r) {
    var a = ri(r, 2, 9), d = ri(r, 2, 7), n = ri(r, 9, 14), ok = a + (n - 1) * d;
    var seq = [a, a + d, a + 2 * d, a + 3 * d].join(', ');
    return build(r, 'arit_patron', 'En la secuencia ' + seq + ', … ¿cuál es el término número ' + n + '?', ok,
      [a + n * d, n * d, a + (n - 2) * d, ok + d],
      ['Mira cuánto sube cada vez: de ' + a + ' a ' + (a + d) + ' suben ' + d + '. Siempre suma ' + d + '.',
       'Para llegar al término ' + n + ' damos ' + (n - 1) + ' saltos (el primero ya está puesto).',
       'Empezamos en ' + a + ' y sumamos ' + (n - 1) + ' veces ' + d + ': ' + a + ' + ' + (n - 1) + ' × ' + d + ' = ' + ok + '.']);
  };

  G.orden = function (r) {
    var e = pick(r, [2, 4]), d = e * ri(r, 2, 5), b = ri(r, 2, 5), c = ri(r, 2, 5), a = ri(r, b * c + 1, b * c + 12);
    var ok = a - b * c + d / e, izq = ((a - b) * c + d) / e;
    return build(r, 'arit_patron', 'Calcula: ' + a + ' − ' + b + ' × ' + c + ' + ' + d + ' ÷ ' + e, ok,
      [izq, a - b * c - d / e, (a - b) * c, ok + 2],
      ['Orden: primero × y ÷ (de izquierda a derecha), después + y −.',
       b + ' × ' + c + ' = ' + (b * c) + '  y  ' + d + ' ÷ ' + e + ' = ' + (d / e) + '.',
       'Queda: ' + a + ' − ' + (b * c) + ' + ' + (d / e) + ' = ' + ok + '.']);
  };

  /* ================= ALGEBRA ================= */
  G.lineal = function (r, asGrid) {
    var x = ri(r, -6, 12), a = ri(r, 2, 9), b = ri(r, -12, 12), c = a * x + b;
    var q = 'Si ' + lin(a, b) + ' = ' + sg(c) + ', ¿cuánto vale x?';
    var pasos = ['Queremos dejar la x sola. Lo que está sumando o restando junto a la x se “pasa” al otro lado con la operación contraria.',
      (b === 0 ? 'No hay número suelto con la x.' : (b > 0 ? 'Quitamos +' + b : 'Quitamos −' + (-b)) + ': ' + a + 'x = ' + sg(c) + (b > 0 ? ' − ' : ' + ') + Math.abs(b) + ' = ' + sg(c - b) + '.'),
      'Ahora ' + a + ' está multiplicando a x, así que dividimos: x = ' + sg(c - b) + ' ÷ ' + a + ' = ' + sg(x) + '.',
      'Comprueba: ' + a + ' × ' + sg(x) + ' ' + (b < 0 ? '−' : '+') + ' ' + Math.abs(b) + ' = ' + sg(c) + ' ✓'];
    if (asGrid) return grid('alg_lineal', q + ' (escribe el número)', x, pasos);
    return build(r, 'alg_lineal', q, x, [-x, x + 1, x - 1, Math.round((c + b) / a)], pasos);
  };

  G.linealDos = function (r) {
    var x = ri(r, 1, 9), a = ri(r, 4, 9), c = ri(r, 1, a - 2), d = ri(r, 1, 10), b = d + (c - a) * x;
    var q = 'Resuelve: ' + lin(a, b) + ' = ' + lin(c, d);
    return build(r, 'alg_lineal', q, x, [-x, x + 1, x - 1, a - c],
      ['Junta las x en un lado: restamos ' + c + 'x a los dos lados → ' + lin(a - c, b) + ' = ' + d + '.',
       'Pasa el número suelto: ' + (a - c) + 'x = ' + d + (b >= 0 ? ' − ' + b : ' + ' + (-b)) + ' = ' + (d - b) + '.',
       'Divide entre ' + (a - c) + ': x = ' + (d - b) + ' ÷ ' + (a - c) + ' = ' + x + '.']);
  };

  G.inecuacion = function (r) {
    var k = ri(r, -5, 8), a = pick(r, [2, 3, 4, -2, -3, -4]), b = ri(r, -8, 8), c = a * k + b, op = r() < 0.5 ? '>' : '<';
    var flip = a < 0, res = (op === '>') !== flip ? '>' : '<', opp = res === '>' ? '<' : '>';
    var q = 'Resuelve: ' + lin(a, b) + ' ' + op + ' ' + sg(c);
    return build(r, 'alg_ineq', q, 'x ' + res + ' ' + sg(k),
      ['x ' + opp + ' ' + sg(k), 'x ' + res + ' ' + sg(-k), 'x ' + opp + ' ' + sg(-k)],
      ['Una desigualdad se resuelve como una ecuación, con UNA regla extra: si multiplicas o divides por un número NEGATIVO, el signo se voltea.',
       'Pasamos el número suelto: ' + a + 'x ' + op + ' ' + sg(c) + (b >= 0 ? ' − ' : ' + ') + Math.abs(b) + ' = ' + sg(c - b) + '.',
       'Dividimos entre ' + a + (a < 0 ? ' (es NEGATIVO, así que volteamos el signo)' : ' (positivo, el signo no cambia)') + ': x ' + res + ' ' + sg(k) + '.']);
  };

  G.simplificar = function (r) {
    var p = ri(r, 3, 6), q = ri(r, 1, 5), s = ri(r, 1, 4), t = ri(r, 1, 5), rr = ri(r, 1, p - 1);
    // p(x+q) - rr(x - t)
    var A = p - rr, B = p * q + rr * t;
    return build(r, 'alg_expr', 'Simplifica: ' + p + '(x + ' + q + ') − ' + rr + '(x − ' + t + ')', lin(A, B),
      [lin(A, p * q - rr * t), lin(p + rr, B), lin(A, p + q + rr + t), lin(A, B + 2 * rr * t)],
      ['Primero “repartimos” el número de afuera a cada término de adentro (propiedad distributiva).',
       p + '(x + ' + q + ') = ' + p + 'x + ' + (p * q) + '.',
       'Cuidado con el signo de adelante: −' + rr + '(x − ' + t + ') = −' + rr + 'x + ' + (rr * t) + '  (menos por menos da más).',
       'Junta las x: ' + p + 'x − ' + rr + 'x = ' + A + 'x. Junta los números: ' + (p * q) + ' + ' + (rr * t) + ' = ' + B + '.',
       'Respuesta: ' + lin(A, B) + '.']);
  };

  G.evaluarExpr = function (r) {
    var x = ri(r, 2, 6), a = ri(r, 2, 5), b = ri(r, 1, 9), ok = a * x * x - b;
    return build(r, 'alg_expr', 'Si x = ' + x + ', ¿cuánto vale ' + a + 'x² − ' + b + '?', ok,
      [(a * x) * (a * x) - b, a * x * 2 - b, a * x * x + b],
      ['Sustituir es cambiar la letra por su número: x = ' + x + '.',
       'Primero la potencia: x² = ' + x + ' × ' + x + ' = ' + (x * x) + '. (OJO: no es ' + a + ' × ' + x + ' al cuadrado.)',
       'Luego multiplica: ' + a + ' × ' + (x * x) + ' = ' + (a * x * x) + '. Después resta ' + b + ': ' + ok + '.']);
  };

  function binom(p) { return p > 0 ? '(x + ' + p + ')' : '(x − ' + (-p) + ')'; }
  G.factorizar = function (r) {
    var p = pick(r, [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]), q = pick(r, [-7, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 7]);
    while (Math.abs(p) === Math.abs(q)) q = pick(r, [-7, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 7]);
    var s = p + q, m = p * q;
    var expr = 'x²' + (s === 0 ? '' : s > 0 ? ' + ' + (s === 1 ? '' : s) + 'x' : ' − ' + (s === -1 ? '' : -s) + 'x') + (m > 0 ? ' + ' + m : ' − ' + (-m));
    return build(r, 'alg_expr', 'Factoriza: ' + expr, binom(p) + binom(q),
      [binom(-p) + binom(-q), binom(p) + binom(-q), binom(-p) + binom(q)],
      ['Buscamos dos números que MULTIPLICADOS den ' + m + ' (el número suelto) y SUMADOS den ' + s + ' (el que acompaña a la x).',
       'Probamos parejas que multiplican ' + m + '… La pareja ' + p + ' y ' + q + ' cumple: ' + p + ' × ' + q + ' = ' + m + ' y ' + p + ' + ' + q + ' = ' + s + '.',
       'Respuesta: ' + binom(p) + binom(q) + '.']);
  };

  G.sistema = function (r, asGrid) {
    var y = ri(r, 1, 9), x = y + ri(r, 1, 8), s = x + y, d = x - y;
    var q = 'x + y = ' + s + '  y  x − y = ' + d + '. ¿Cuánto vale x?';
    var pasos = ['Suma las dos ecuaciones: la y y la −y se cancelan.', '(x + y) + (x − y) = ' + s + ' + ' + d + ' → 2x = ' + (s + d) + '.',
      'Divide entre 2: x = ' + x + '.', 'Comprueba: y = ' + s + ' − ' + x + ' = ' + y + ', y ' + x + ' − ' + y + ' = ' + d + ' ✓'];
    if (asGrid) return grid('alg_sistema', q, x, pasos);
    return build(r, 'alg_sistema', q, x, [y, s - d, x + 1, d], pasos);
  };

  G.sistemaHistoria = function (r) {
    var b = ri(r, 6, 25), dif = ri(r, 3, 12), tot = 2 * b + dif;
    return build(r, 'alg_sistema', 'Ana y Beto tienen juntos $' + tot + '. Ana tiene $' + dif + ' más que Beto. ¿Cuánto tiene Beto?', b,
      [b + dif, tot / 2, tot - dif, b + 1],
      ['Si le quitamos a Ana los $' + dif + ' extra, los dos tendrían lo mismo.', 'Entonces ' + tot + ' − ' + dif + ' = ' + (tot - dif) + ' se reparte en partes iguales entre 2.',
       (tot - dif) + ' ÷ 2 = ' + b + '. Beto tiene $' + b + ' (y Ana $' + (b + dif) + ').']);
  };

  G.cuadratica = function (r) {
    var p = pick(r, [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]), q = pick(r, [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
    while (Math.abs(p) === Math.abs(q)) q = pick(r, [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
    var s = p + q, m = p * q;
    function st(a, b) { var v = [a, b].sort(function (u, w) { return u - w; }); return 'x = ' + sg(v[0]) + ' ó x = ' + sg(v[1]); }
    var eq = 'x²' + (s === 0 ? '' : (-s) > 0 ? ' + ' + (-s === 1 ? '' : -s) + 'x' : ' − ' + (s === 1 ? '' : s) + 'x') + (m > 0 ? ' + ' + m : ' − ' + (-m)) + ' = 0';
    return build(r, 'alg_cuad', 'Resuelve: ' + eq, st(p, q), [st(-p, -q), st(-p, q), st(p, -q)],
      ['Factoriza: busca dos números que multiplicados den ' + m + ' y sumados den ' + sg(-s) + '. Son ' + sg(-p) + ' y ' + sg(-q) + '.',
       'Queda (x ' + (-p < 0 ? '−' : '+') + ' ' + Math.abs(p) + ')(x ' + (-q < 0 ? '−' : '+') + ' ' + Math.abs(q) + ') = 0.',
       'Si dos cosas se multiplican y dan 0, una de ellas es 0. Así que cada paréntesis igual a 0 nos da una solución.',
       'Respuesta: ' + st(p, q) + '. (Mira que el signo de la solución es contrario al del paréntesis.)']);
  };

  G.funcion = function (r) {
    var a = ri(r, 1, 3), b = pick(r, [-5, -4, -3, -2, 2, 3, 4, 5]), c = ri(r, -5, 5), k = pick(r, [-3, -2, -1, 1, 2, 3]);
    var ok = a * k * k + b * k + c;
    var f = (a === 1 ? '' : a) + 'x²' + (b > 0 ? ' + ' + b + 'x' : ' − ' + (-b) + 'x') + (c > 0 ? ' + ' + c : c < 0 ? ' − ' + (-c) : '');
    return build(r, 'alg_func', 'Si f(x) = ' + f + ', ¿cuánto vale f(' + sg(k) + ')?', ok,
      [-a * k * k + b * k + c, a * k * k - b * k + c, a * k * k + b * k - c],
      ['f(' + sg(k) + ') significa: en lugar de cada x, escribe ' + sg(k) + ' (entre paréntesis para no equivocarte con el signo).',
       'x² = (' + sg(k) + ')² = ' + (k * k) + '  (un número negativo al cuadrado sale POSITIVO).',
       a + ' × ' + (k * k) + ' = ' + (a * k * k) + ';   ' + sg(b) + ' × (' + sg(k) + ') = ' + (b * k) + '.',
       'Suma todo: ' + (a * k * k) + ' + (' + sg(b * k) + ') + (' + sg(c) + ') = ' + ok + '.']);
  };

  G.pendiente = function (r) {
    var m = pick(r, [-4, -3, -2, -1, 1, 2, 3, 4]), dx = ri(r, 1, 4), x1 = ri(r, -3, 3), y1 = ri(r, -4, 4), x2 = x1 + dx, y2 = y1 + m * dx;
    return build(r, 'alg_func', '¿Cuál es la pendiente de la recta que pasa por (' + x1 + ', ' + y1 + ') y (' + x2 + ', ' + y2 + ')?', m,
      [frac(dx, m * dx), -m, m + 1, m - 1],
      ['La pendiente dice cuánto SUBE (o baja) la recta por cada paso a la derecha: “subida ÷ avance”.',
       'Subida: ' + y2 + ' − (' + y1 + ') = ' + (m * dx) + '.  Avance: ' + x2 + ' − (' + x1 + ') = ' + dx + '.',
       'Pendiente = ' + (m * dx) + ' ÷ ' + dx + ' = ' + m + '.']);
  };

  G.radical = function (r) {
    var a = ri(r, 2, 7), b = pick(r, [2, 3, 5, 6, 7]);
    while (a === b) a = ri(r, 2, 7);
    var N = a * a * b;
    return build(r, 'alg_radical', 'Simplifica: √' + N, a + '√' + b, [b + '√' + a, String(a * b), a + '√' + (2 * b), (a + b) + '√' + b],
      ['Busca un número “cuadrado perfecto” (4, 9, 16, 25, 36, 49…) que quepa exacto dentro de ' + N + '.',
       N + ' = ' + (a * a) + ' × ' + b + ', y ' + (a * a) + ' es un cuadrado perfecto (' + a + ' × ' + a + ').',
       'Sacamos su raíz afuera y lo que sobra se queda adentro: ' + a + '√' + b + '.']);
  };

  G.variacion = function (r) {
    var c = ri(r, 2, 5), x0 = ri(r, 2, 6), x1 = x0 + ri(r, 2, 6), ok = c * x1;
    return build(r, 'alg_func', 'y varía directamente con x. Si y = ' + (c * x0) + ' cuando x = ' + x0 + ', ¿cuánto vale y cuando x = ' + x1 + '?', ok,
      [c * x0 + (x1 - x0), x1 + c, ok + c, (c * x0 * x0) / x1 | 0],
      ['“Varía directamente” significa que y es siempre x multiplicada por el mismo número k.',
       'Hallamos k: ' + (c * x0) + ' ÷ ' + x0 + ' = ' + c + '. Entonces y = ' + c + ' · x.',
       'Con x = ' + x1 + ': y = ' + c + ' × ' + x1 + ' = ' + ok + '.']);
  };

  /* ================= GEOMETRIA ================= */
  G.rectangulo = function (r) {
    var l = ri(r, 4, 14), w = ri(r, 2, l - 1), area = r() < 0.5;
    if (area) return build(r, 'geo_area', 'Un rectángulo mide ' + l + ' cm de largo y ' + w + ' cm de ancho. ¿Cuál es su área?', l * w + ' cm²',
      [2 * (l + w) + ' cm²', (l + w) + ' cm²', l * w * 2 + ' cm²', (l * l) + ' cm²'],
      ['Área = cuánto espacio cubre por dentro = largo × ancho.', l + ' × ' + w + ' = ' + (l * w) + '.', 'Se mide en cm² (centímetros cuadrados): ' + (l * w) + ' cm².']);
    return build(r, 'geo_area', 'Un rectángulo mide ' + l + ' cm de largo y ' + w + ' cm de ancho. ¿Cuál es su perímetro?', 2 * (l + w) + ' cm',
      [l * w + ' cm', (l + w) + ' cm', 2 * l + w + ' cm', 4 * l + ' cm'],
      ['Perímetro = el camino alrededor de la figura (como una cerca).', 'Un rectángulo tiene 2 lados largos y 2 cortos: ' + l + ' + ' + w + ' + ' + l + ' + ' + w + '.',
       '= ' + 2 * (l + w) + ' cm.']);
  };

  G.triangulo = function (r) {
    var b = 2 * ri(r, 2, 8), h = ri(r, 3, 12), ok = b * h / 2;
    return build(r, 'geo_area', 'Un triángulo tiene base de ' + b + ' cm y altura de ' + h + ' cm. ¿Cuál es su área?', ok + ' cm²',
      [b * h + ' cm²', b + h + ' cm²', b * h / 4 + ' cm²', ok + b + ' cm²'],
      ['Un triángulo es la MITAD de un rectángulo con la misma base y altura.', 'Rectángulo: ' + b + ' × ' + h + ' = ' + (b * h) + '.',
       'La mitad: ' + (b * h) + ' ÷ 2 = ' + ok + ' cm².']);
  };

  G.circulo = function (r) {
    var rad = ri(r, 2, 9), d = rad * 2;
    return build(r, 'geo_area', 'Un círculo tiene diámetro de ' + d + ' cm. ¿Cuál es su área? (deja π sin multiplicar)', rad * rad + 'π cm²',
      [d * d + 'π cm²', d + 'π cm²', rad + 'π cm²', 2 * rad * rad + 'π cm²'],
      ['El diámetro atraviesa todo el círculo; el radio es la MITAD: ' + d + ' ÷ 2 = ' + rad + '.', 'Área del círculo = π × radio × radio.',
       rad + ' × ' + rad + ' = ' + rad * rad + '. Respuesta: ' + rad * rad + 'π cm².']);
  };

  G.pitagoras = function (r) {
    var t = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]), k = pick(r, [1, 1, 2]), a = t[0] * k, b = t[1] * k, c = t[2] * k;
    if (r() < 0.5) return build(r, 'geo_pit', 'En un triángulo rectángulo los catetos miden ' + a + ' y ' + b + '. ¿Cuánto mide la hipotenusa?', c,
      [a + b, c * c, c + 1, b - a],
      ['La hipotenusa es el lado más largo, el que está frente al ángulo recto.', 'Teorema de Pitágoras: (cateto)² + (cateto)² = (hipotenusa)².',
       a + '² + ' + b + '² = ' + a * a + ' + ' + b * b + ' = ' + (a * a + b * b) + '.', 'La raíz de ' + (a * a + b * b) + ' es ' + c + '. Respuesta: ' + c + '.']);
    return build(r, 'geo_pit', 'En un triángulo rectángulo la hipotenusa mide ' + c + ' y un cateto mide ' + a + '. ¿Cuánto mide el otro cateto?', b,
      [c - a, c + a, b + 1, c * c - a * a],
      ['Usamos Pitágoras pero “al revés”: cateto² = hipotenusa² − otro cateto².', c + '² − ' + a + '² = ' + c * c + ' − ' + a * a + ' = ' + b * b + '.',
       'La raíz de ' + b * b + ' es ' + b + '. Respuesta: ' + b + '.']);
  };

  G.angulos = function (r) {
    var t = ri(r, 0, 2);
    if (t === 0) { var a = ri(r, 30, 80), b = ri(r, 30, 80), c = 180 - a - b;
      return build(r, 'geo_ang', 'Dos ángulos de un triángulo miden ' + a + '° y ' + b + '°. ¿Cuánto mide el tercero?', c + '°',
        [(a + b) + '°', (180 - a) + '°', (360 - a - b) + '°', (c + 10) + '°'],
        ['Los tres ángulos de CUALQUIER triángulo siempre suman 180°.', 'Los dos que tenemos: ' + a + ' + ' + b + ' = ' + (a + b) + '.', '180 − ' + (a + b) + ' = ' + c + '°.']); }
    if (t === 1) { var n = pick(r, [5, 6, 8, 10]), ok = (n - 2) * 180 / n;
      return build(r, 'geo_ang', '¿Cuánto mide cada ángulo interior de un polígono regular de ' + n + ' lados?', ok + '°',
        [(n - 2) * 180 + '°', 360 / n + '°', ok + 12 + '°', ok - 12 + '°'],
        ['Regular = todos sus lados y ángulos son iguales. Se puede partir en ' + (n - 2) + ' triángulos (lados menos 2).', 'Cada triángulo suma 180°: ' + (n - 2) + ' × 180 = ' + (n - 2) * 180 + '°.',
         'Repartimos entre los ' + n + ' ángulos: ' + (n - 2) * 180 + ' ÷ ' + n + ' = ' + ok + '°.']); }
    var x = ri(r, 20, 70);
    return build(r, 'geo_ang', 'Dos ángulos son suplementarios. Uno mide ' + x + '°. ¿Cuánto mide el otro?', 180 - x + '°',
      [90 - x + '°', 360 - x + '°', x + '°', 180 - x + 10 + '°'],
      ['Suplementarios = juntos forman una línea recta = suman 180°. (Complementarios suman 90°.)', '180 − ' + x + ' = ' + (180 - x) + '°.']);
  };

  G.volumen = function (r) {
    if (r() < 0.5) { var l = ri(r, 2, 9), w = ri(r, 2, 6), h = ri(r, 2, 8);
      return build(r, 'geo_vol', 'Una caja mide ' + l + ' cm de largo, ' + w + ' cm de ancho y ' + h + ' cm de alto. ¿Cuál es su volumen?', l * w * h + ' cm³',
        [l * w + w * h + ' cm³', 2 * (l * w + w * h + l * h) + ' cm³', l + w + h + ' cm³', l * w * h * 2 + ' cm³'],
        ['Volumen = cuántos cubitos de 1 cm caben dentro de la caja.', 'Una capa de abajo tiene ' + l + ' × ' + w + ' = ' + l * w + ' cubitos.', 'La caja tiene ' + h + ' capas: ' + l * w + ' × ' + h + ' = ' + l * w * h + ' cm³.']); }
    var rd = ri(r, 2, 6), h2 = ri(r, 2, 9);
    return build(r, 'geo_vol', 'Un cilindro tiene radio de ' + rd + ' cm y altura de ' + h2 + ' cm. ¿Cuál es su volumen? (deja π sin multiplicar)', rd * rd * h2 + 'π cm³',
      [2 * rd * h2 + 'π cm³', rd * h2 + 'π cm³', rd * rd + h2 + 'π cm³', rd * rd * h2 * 2 + 'π cm³'],
      ['Un cilindro es un círculo “apilado” varias veces hacia arriba.', 'Área del círculo de abajo: π × ' + rd + ' × ' + rd + ' = ' + rd * rd + 'π.', 'Multiplica por la altura: ' + rd * rd + ' × ' + h2 + ' = ' + rd * rd * h2 + '. Respuesta: ' + rd * rd * h2 + 'π cm³.']);
  };

  G.coordenadas = function (r) {
    var t = ri(r, 0, 2);
    if (t === 0) { var k = ri(r, 1, 3), x1 = ri(r, -3, 3), y1 = ri(r, -3, 3);
      return build(r, 'geo_coord', '¿Qué distancia hay entre los puntos (' + x1 + ', ' + y1 + ') y (' + (x1 + 3 * k) + ', ' + (y1 + 4 * k) + ')?', 5 * k,
        [7 * k, 12 * k, 5 * k + 1, k],
        ['Dibuja un triángulo rectángulo: avanzas ' + 3 * k + ' a la derecha y ' + 4 * k + ' hacia arriba.', 'La distancia es la hipotenusa: ' + 3 * k + '² + ' + 4 * k + '² = ' + 9 * k * k + ' + ' + 16 * k * k + ' = ' + 25 * k * k + '.', 'Raíz de ' + 25 * k * k + ' = ' + 5 * k + '.']); }
    if (t === 1) { var a = 2 * ri(r, -4, 4), b = 2 * ri(r, -4, 4), c = 2 * ri(r, -4, 4), d = 2 * ri(r, -4, 4);
      function pt(x, y) { return '(' + sg(x) + ', ' + sg(y) + ')'; }
      return build(r, 'geo_coord', '¿Cuál es el punto medio entre ' + pt(a, b) + ' y ' + pt(c, d) + '?', pt((a + c) / 2, (b + d) / 2),
        [pt((a + c), (b + d)), pt((c - a) / 2, (d - b) / 2), pt((a + c) / 2, (b - d) / 2), pt((a + c) / 2 + 1, (b + d) / 2)],
        ['El punto medio está justo en el medio: es el promedio de las x y el promedio de las y.', 'x: (' + a + ' + ' + c + ') ÷ 2 = ' + (a + c) / 2 + '.   y: (' + b + ' + ' + d + ') ÷ 2 = ' + (b + d) / 2 + '.', 'Respuesta: ' + pt((a + c) / 2, (b + d) / 2) + '.']); }
    var x = ri(r, 1, 6), y = ri(r, 1, 6);
    function pp(a2, b2) { return '(' + sg(a2) + ', ' + sg(b2) + ')'; }
    return build(r, 'geo_coord', 'El punto (' + x + ', ' + y + ') se refleja sobre el eje x (como un espejo en el suelo). ¿Dónde queda?', pp(x, -y),
      [pp(-x, y), pp(-x, -y), pp(y, x)],
      ['Reflejar sobre el eje x: el punto se va al otro lado del eje horizontal, a la misma distancia.', 'Se mueve de arriba hacia abajo: la x se queda igual y la y cambia de signo.', 'Respuesta: ' + pp(x, -y) + '.']);
  };

  G.semejanza = function (r) {
    var a = ri(r, 3, 8), k = pick(r, [2, 3]), c = ri(r, 2, 7);
    return build(r, 'geo_sem', 'Dos triángulos son semejantes. En el pequeño un lado mide ' + a + ' cm y en el grande el lado que le corresponde mide ' + a * k + ' cm. Otro lado del pequeño mide ' + c + ' cm. ¿Cuánto mide su lado correspondiente en el grande?', c * k + ' cm',
      [c + k + ' cm', c + (a * k - a) + ' cm', c * k * k + ' cm', a * k + c + ' cm'],
      ['Semejantes = misma forma, distinto tamaño. Todos los lados se agrandan por el MISMO número.', 'Cuántas veces creció: ' + a * k + ' ÷ ' + a + ' = ' + k + '.', 'Multiplica el otro lado por ' + k + ': ' + c + ' × ' + k + ' = ' + c * k + ' cm.']);
  };

  /* ================= DATOS Y PROBABILIDAD ================= */
  G.media = function (r) {
    var m = ri(r, 6, 20), v = [], i; for (i = 0; i < 4; i++) v.push(ri(r, Math.max(1, m - 5), m + 5));
    var last = 5 * m - v.reduce(function (s, x) { return s + x; }, 0); if (last < 1) throw new Error('reintentar');
    v.push(last); v = shuffle(r, v);
    return build(r, 'dat_central', 'El promedio (media) de ' + v.join(', ') + ' es:', m,
      [m + 1, m - 1, v.slice().sort(function (a, b) { return a - b; })[2] + (m === v.slice().sort(function (a, b) { return a - b; })[2] ? 3 : 0), 5 * m],
      ['Promedio = juntar todo y repartir en partes iguales.', 'Suma: ' + v.join(' + ') + ' = ' + 5 * m + '.', 'Reparte entre 5 datos: ' + 5 * m + ' ÷ 5 = ' + m + '.']);
  };

  G.mediana = function (r) {
    var n = pick(r, [5, 7]), v = []; for (var i = 0; i < n; i++) v.push(ri(r, 2, 30));
    var s = v.slice().sort(function (a, b) { return a - b; }), med = s[(n - 1) / 2], mean = Math.round(v.reduce(function (a, b) { return a + b; }, 0) / n);
    return build(r, 'dat_central', 'La mediana de ' + v.join(', ') + ' es:', med,
      [v[(n - 1) / 2], mean, s[0], s[n - 1]],
      ['Mediana = el dato que queda justo en el MEDIO cuando los ordenas de menor a mayor.', 'Ordenados: ' + s.join(', ') + '.', 'Son ' + n + ' datos, el del medio es el número ' + (n + 1) / 2 + ': ' + med + '.']);
  };

  G.moda = function (r) {
    var m = ri(r, 2, 15), others = [], v;
    while (others.length < 4) { var o = ri(r, 1, 20); if (o !== m && others.indexOf(o) < 0) others.push(o); }
    v = shuffle(r, [m, m, m].concat(others.slice(0, 2)).concat([others[2]]));
    return build(r, 'dat_central', 'La moda de ' + v.join(', ') + ' es:', m, [others[0], others[1], others[2], Math.round(v.reduce(function (a, b) { return a + b; }, 0) / v.length)],
      ['Moda = el dato que MÁS se repite.', 'Cuenta cuántas veces sale cada uno. El ' + m + ' sale 3 veces; los demás una sola vez.', 'Respuesta: ' + m + '.']);
  };

  G.promFalta = function (r) {
    var n = ri(r, 3, 5), a = ri(r, 70, 90), d = ri(r, 1, 4), x = a + d * (n + 1);
    return build(r, 'dat_central', 'El promedio de ' + n + ' notas es ' + a + '. Con una nota más, el promedio sube a ' + (a + d) + '. ¿Cuál fue la nota nueva?', x,
      [a + d, a + 2 * d, (a + d) * (n + 1), x + d],
      ['Con el promedio podemos saber la SUMA: promedio × cantidad.', 'Antes: ' + a + ' × ' + n + ' = ' + a * n + '.   Después: ' + (a + d) + ' × ' + (n + 1) + ' = ' + (a + d) * (n + 1) + '.',
       'La nota nueva es la diferencia: ' + (a + d) * (n + 1) + ' − ' + a * n + ' = ' + x + '.']);
  };

  G.probabilidad = function (r) {
    var R = ri(r, 2, 6), B = ri(r, 2, 6), V = ri(r, 1, 5), T = R + B + V;
    return build(r, 'dat_prob', 'Una bolsa tiene ' + R + ' bolitas rojas, ' + B + ' azules y ' + V + ' verdes. Si sacas una sin mirar, ¿cuál es la probabilidad de que sea roja?', frac(R, T),
      [frac(R, B + V), frac(B, T), frac(T - R, T), frac(1, T)],
      ['Probabilidad = (casos que me sirven) ÷ (casos posibles en total).', 'Total de bolitas: ' + R + ' + ' + B + ' + ' + V + ' = ' + T + '.   Las que me sirven (rojas): ' + R + '.',
       R + '/' + T + (frac(R, T) !== R + '/' + T ? ' = ' + frac(R, T) + ' al simplificar' : '') + '.']);
  };

  G.tabla = function (r) {
    var meses = ['Enero', 'Febrero', 'Marzo', 'Abril'], v = meses.map(function () { return ri(r, 10, 60); });
    var i = ri(r, 0, 2), j = ri(r, i + 1, 3), ok = v[i] + v[j];
    return build(r, 'dat_tablas', 'Según la tabla, ¿cuántos libros se vendieron en total en ' + meses[i] + ' y ' + meses[j] + '?', ok,
      [Math.abs(v[i] - v[j]), v.reduce(function (a, b) { return a + b; }, 0), v[i], ok + 10],
      ['Lee la tabla con calma: cada fila dice un mes y cuántos libros se vendieron.', meses[i] + ': ' + v[i] + ' libros.  ' + meses[j] + ': ' + v[j] + ' libros.', 'Total = ' + v[i] + ' + ' + v[j] + ' = ' + ok + '.'],
      { table: { head: ['Mes', 'Libros vendidos'], rows: meses.map(function (m, k) { return [m, String(v[k])]; }) } });
  };

  G.grafica = function (r) {
    var names = ['Fútbol', 'Béisbol', 'Natación', 'Baloncesto'], v = names.map(function () { return ri(r, 2, 9) * 5; });
    var i = ri(r, 0, 3), j = (i + ri(r, 1, 3)) % 4;
    if (v[i] === v[j]) v[i] += 5;
    var dif = Math.abs(v[i] - v[j]), mas = v[i] > v[j] ? i : j, menos = v[i] > v[j] ? j : i;
    return build(r, 'dat_tablas', 'Según la gráfica, ¿cuántos estudiantes MÁS prefieren ' + names[mas] + ' que ' + names[menos] + '?', dif,
      [v[i] + v[j], v[mas], dif + 5, Math.max(5, dif - 5)],
      ['Mira hasta dónde llega cada barra y lee el número en el eje.', names[mas] + ': ' + v[mas] + ' estudiantes.   ' + names[menos] + ': ' + v[menos] + ' estudiantes.',
       '“Cuántos MÁS” es una resta: ' + v[mas] + ' − ' + v[menos] + ' = ' + dif + '.'],
      { chart: { labels: names, values: v, unit: 'estudiantes' } });
  };

  var STAT = [
    ['Se quiere saber la estatura promedio de los 800 estudiantes de un colegio y se mide a 40 de ellos. ¿Qué es el grupo de 40?', 'La muestra', ['La población', 'La variable', 'La moda'],
      ['Población = TODO el grupo que quieres estudiar (los 800).', 'Muestra = una parte pequeña que se mide para estimar (los 40).']],
    ['¿Cuál de estas es una variable DISCRETA (se cuenta, no se mide)?', 'Número de hermanos', ['Estatura', 'Peso', 'Tiempo que tarda en llegar'],
      ['Discreta = se puede CONTAR con números enteros (0, 1, 2, 3…).', 'Estatura, peso y tiempo se MIDEN y pueden tener decimales (continuas). Los hermanos se cuentan.']],
    ['¿Cuál de estas es una variable CONTINUA?', 'El peso de una mochila', ['Cantidad de lápices', 'Número de goles', 'Cantidad de aulas'],
      ['Continua = se MIDE y puede tener decimales (1.25 kg).', 'Lápices, goles y aulas se cuentan: son discretas.']],
    ['En una bolsa hay solo bolitas rojas. ¿Cuál es la probabilidad de sacar una roja?', '1', ['0', '1/2', '100'],
      ['Probabilidad va siempre de 0 (imposible) a 1 (seguro).', 'Si todas son rojas, es seguro: 1.']]
  ];
  G.estadistica = function (r) {
    var s = pick(r, STAT);
    return build(r, 'dat_prob', s[0], s[1], s[2], s[3]);
  };

  /* ================= TEMAS ================= */
  var TEMAS = {
    arit_frac:   { area: 'Aritmética', nombre: 'Fracciones y decimales', gens: ['fracSuma', 'decimalMult'] },
    arit_porc:   { area: 'Aritmética', nombre: 'Porcentajes', gens: ['porcDe', 'descuento', 'queProc'] },
    arit_prop:   { area: 'Aritmética', nombre: 'Razón y proporción', gens: ['proporcion', 'escala'] },
    arit_teoria: { area: 'Aritmética', nombre: 'Múltiplos, divisores y primos', gens: ['mcdmcm', 'primos', 'factorPrima'] },
    arit_exp:    { area: 'Aritmética', nombre: 'Exponentes y notación científica', gens: ['exponentes', 'cientifica'] },
    arit_patron: { area: 'Aritmética', nombre: 'Patrones y orden de operaciones', gens: ['patron', 'orden'] },
    alg_lineal:  { area: 'Álgebra', nombre: 'Ecuaciones de primer grado', gens: ['lineal', 'linealDos'] },
    alg_ineq:    { area: 'Álgebra', nombre: 'Desigualdades', gens: ['inecuacion'] },
    alg_expr:    { area: 'Álgebra', nombre: 'Expresiones y factorización', gens: ['simplificar', 'evaluarExpr', 'factorizar'] },
    alg_sistema: { area: 'Álgebra', nombre: 'Sistemas de ecuaciones', gens: ['sistema', 'sistemaHistoria'] },
    alg_cuad:    { area: 'Álgebra', nombre: 'Ecuaciones cuadráticas', gens: ['cuadratica'] },
    alg_func:    { area: 'Álgebra', nombre: 'Funciones, rectas y variación', gens: ['funcion', 'pendiente', 'variacion'] },
    alg_radical: { area: 'Álgebra', nombre: 'Radicales', gens: ['radical'] },
    geo_area:    { area: 'Geometría', nombre: 'Perímetro y área', gens: ['rectangulo', 'triangulo', 'circulo'] },
    geo_ang:     { area: 'Geometría', nombre: 'Ángulos', gens: ['angulos'] },
    geo_pit:     { area: 'Geometría', nombre: 'Teorema de Pitágoras', gens: ['pitagoras'] },
    geo_vol:     { area: 'Geometría', nombre: 'Volumen', gens: ['volumen'] },
    geo_coord:   { area: 'Geometría', nombre: 'Plano cartesiano', gens: ['coordenadas'] },
    geo_sem:     { area: 'Geometría', nombre: 'Figuras semejantes', gens: ['semejanza'] },
    dat_central: { area: 'Datos y Probabilidad', nombre: 'Promedio, mediana y moda', gens: ['media', 'mediana', 'moda', 'promFalta'] },
    dat_prob:    { area: 'Datos y Probabilidad', nombre: 'Probabilidad y estadística', gens: ['probabilidad', 'estadistica'] },
    dat_tablas:  { area: 'Datos y Probabilidad', nombre: 'Tablas y gráficas', gens: ['tabla', 'grafica'] }
  };

  var GRID_OK = { lineal: 1, sistema: 1 };

  /* Crea un problema del tema; seed fija -> mismo problema (util para repasar errores). */
  function make(tema, seed, wantGrid) {
    var t = TEMAS[tema]; if (!t) throw new Error('tema desconocido ' + tema);
    var base = seed | 0;
    for (var intento = 0; intento < 40; intento++) {
      var r = mulberry32((base + intento * 7919) | 0), name = pick(r, t.gens);
      try {
        var p = (wantGrid && GRID_OK[name]) ? G[name](r, true) : G[name](r);
        p.tema = tema; p.seed = base; p.id = tema + ':' + base;
        return p;
      } catch (e) { /* reintenta con otra semilla */ }
    }
    throw new Error('no se pudo generar ' + tema);
  }

  var API = { make: make, TEMAS: TEMAS, G: G, mulberry32: mulberry32, shuffle: shuffle, GRID_OK: GRID_OK };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.PAA = root.PAA || {}; root.PAA.mate = API;
})(typeof window !== 'undefined' ? window : globalThis);
