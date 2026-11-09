/* Recetas por tema: lo que se muestra ANTES de responder. Lenguaje simple. */
(function (root) {
  'use strict';
  var L = {
    arit_frac: {
      idea: 'Una fracción es un pedazo de algo entero. El número de abajo dice en cuántos pedazos se partió; el de arriba, cuántos tomas.',
      receta: ['Para SUMAR o RESTAR fracciones, los números de abajo deben ser iguales.', 'Busca un número donde quepan los dos de abajo (el más pequeño posible).', 'Convierte cada fracción multiplicando arriba y abajo por el mismo número.', 'Suma solo los de arriba. Los de abajo no se suman.', 'Si se puede, simplifica (divide arriba y abajo entre el mismo número).',
        'Para MULTIPLICAR decimales: multiplica como si no hubiera punto y luego cuenta los lugares decimales.'],
      error: 'Sumar arriba con arriba Y abajo con abajo (1/2 + 1/3 NO es 2/5).'
    },
    arit_porc: {
      idea: '“Por ciento” significa “de cada 100”. 25% es lo mismo que 25 de cada 100.',
      receta: ['Divide el número entre 100: eso es el 1%.', 'Multiplica por el porcentaje que te piden.', 'DESCUENTO: calcula cuánto se descuenta y réstalo del precio. AUMENTO: súmalo.', 'Para saber “¿qué por ciento es A de B?” haz A ÷ B y multiplica por 100.'],
      error: 'Contestar con el descuento en vez del precio final. Relee qué te preguntan.'
    },
    arit_prop: {
      idea: 'Una proporción dice que dos cosas crecen juntas: si compras el doble, pagas el doble.',
      receta: ['Busca primero el valor de UNA unidad (divide).', 'Multiplica por las unidades que te piden.', 'En un mapa: cada centímetro vale una distancia fija; multiplícala por los centímetros.'],
      error: 'Sumar en lugar de multiplicar. Si compras más cuadernos, el precio se multiplica.'
    },
    arit_teoria: {
      idea: 'Los múltiplos son la tabla de un número (6, 12, 18…). Los divisores son los números que caben exacto en él. Primo es el que solo se divide entre 1 y entre sí mismo.',
      receta: ['MCD (mayor divisor común): el número más GRANDE que cabe exacto en los dos.', 'MCM (menor múltiplo común): el primer número al que llegan los dos en sus tablas.', 'Descompón cada número en factores (ej. 12 = 2 × 2 × 3) y compara.', 'Para primos: descarta pares (menos el 2), los que terminan en 5 y los que se parten en 3 (cuyas cifras suman múltiplo de 3).'],
      error: 'Confundir MCD con MCM. MCD ≤ los números; MCM ≥ los números.'
    },
    arit_exp: {
      idea: 'Un exponente dice cuántas veces se multiplica un número por sí mismo: 2³ = 2 × 2 × 2 = 8.',
      receta: ['Misma base y MULTIPLICAS → SUMA los exponentes.', 'Misma base y DIVIDES → RESTA los exponentes.', 'Notación científica: multiplica los números normales por un lado y suma los exponentes del 10 por otro.'],
      error: 'Multiplicar los exponentes cuando lo correcto es sumarlos.'
    },
    arit_patron: {
      idea: 'Un patrón es una regla que se repite. Descubre la regla y podrás seguir la fila tan lejos como quieras.',
      receta: ['Resta cada número con el anterior. Si siempre da lo mismo, esa es la “subida”.', 'Para el término número n: empieza en el primero y suma la subida (n − 1) veces.', 'Orden de operaciones: primero × y ÷, después + y −. Paréntesis siempre primero.'],
      error: 'Sumar la subida n veces en lugar de (n − 1): el primero ya está puesto.'
    },
    alg_lineal: {
      idea: 'Una ecuación es una balanza: lo que haces de un lado, lo haces del otro. Tu meta: dejar la x solita.',
      receta: ['Mira qué número está sumando o restando junto a la x.', 'Quítalo en los DOS lados con la operación contraria (si suma, resta; si resta, suma).', 'Ahora el número que multiplica a x se quita dividiendo en los dos lados.', 'Comprueba: pon tu respuesta en la ecuación; debe cumplirse.', 'Si hay x en los dos lados, junta primero las x en un solo lado.'],
      error: 'Cambiar solo un lado de la balanza.'
    },
    alg_ineq: {
      idea: 'Una desigualdad (>, <) se resuelve igual que una ecuación, con una regla especial.',
      receta: ['Pasa los números sueltos al otro lado (operación contraria).', 'Divide entre el número que acompaña a la x.', 'REGLA DE ORO: si divides o multiplicas por un NEGATIVO, el signo se voltea (> pasa a <).'],
      error: 'Olvidar voltear el signo al dividir entre un número negativo.'
    },
    alg_expr: {
      idea: 'Simplificar es escribir lo mismo de forma más corta. Factorizar es “deshacer” una multiplicación.',
      receta: ['Si hay paréntesis con un número afuera, multiplícalo por CADA cosa de adentro (¡con su signo!).', 'Junta los términos parecidos: x con x, números con números.', 'Sustituir: cambia la letra por su número, hazlo entre paréntesis y respeta el orden (primero potencias).', 'Factorizar x² + bx + c: busca dos números que MULTIPLICADOS den c y SUMADOS den b.'],
      error: 'Olvidar que menos por menos da más al repartir un signo negativo.'
    },
    alg_sistema: {
      idea: 'Un sistema son dos pistas sobre dos números secretos. Con las dos pistas juntas se descubren.',
      receta: ['Escribe las dos ecuaciones una debajo de la otra.', 'Si una tiene +y y la otra −y, SÚMALAS: la y desaparece.', 'Resuelve la x y luego devuélvela a una ecuación para hallar la y.', 'En historias: si uno tiene “$5 más que otro”, quítale esos $5 para dejarlos iguales y reparte.'],
      error: 'Hallar x y olvidar que la pregunta pedía y.'
    },
    alg_cuad: {
      idea: 'Una ecuación cuadrática tiene x² y normalmente dos soluciones.',
      receta: ['Pásalo todo a un lado para que quede = 0.', 'Factoriza (dos números que multiplicados dan el de atrás y sumados dan el del medio).', 'Cada paréntesis igual a 0 da una solución.', 'El signo de la solución es el CONTRARIO al del paréntesis: (x − 3) → x = 3.'],
      error: 'Poner el signo del paréntesis como solución.'
    },
    alg_func: {
      idea: 'Una función es una máquina: le metes un número x y te devuelve otro. f(2) significa “meter el 2 a la máquina”.',
      receta: ['f(número): cambia cada x por ese número, entre paréntesis.', 'Potencias primero, luego multiplicaciones, al final sumas y restas.', 'Pendiente = lo que sube ÷ lo que avanza = (y₂ − y₁) ÷ (x₂ − x₁).', 'Variación directa: y = k · x. Halla k dividiendo y ÷ x con los datos que te dan.'],
      error: 'Que (−3)² salga negativo: un negativo al cuadrado es POSITIVO.'
    },
    alg_radical: {
      idea: 'La raíz cuadrada pregunta: ¿qué número multiplicado por sí mismo da este?',
      receta: ['Aprende los cuadrados perfectos: 4, 9, 16, 25, 36, 49, 64, 81, 100.', 'Busca el más grande que quepa exacto dentro del número.', 'Sácalo afuera como su raíz; lo que sobra se queda adentro.'],
      error: 'Sacar el número equivocado: √72 = √(36·2) = 6√2, no 2√6.'
    },
    geo_area: {
      idea: 'Perímetro = el camino alrededor (una cerca). Área = lo que cubre por dentro (el piso).',
      receta: ['Rectángulo: área = largo × ancho; perímetro = suma de los 4 lados.', 'Triángulo: área = (base × altura) ÷ 2.', 'Círculo: área = π × radio × radio. El radio es la mitad del diámetro.', 'Área va en unidades al cuadrado (cm²); perímetro en unidades normales (cm).'],
      error: 'Usar el diámetro como si fuera el radio.'
    },
    geo_ang: {
      idea: 'Los ángulos miden cuánto se abre una esquina. Un giro completo son 360°.',
      receta: ['Triángulo: sus 3 ángulos suman 180°.', 'Línea recta (suplementarios): suman 180°. Esquina cuadrada (complementarios): suman 90°.', 'Polígono regular: (lados − 2) × 180 ÷ lados = cada ángulo.'],
      error: 'Confundir complementarios (90°) con suplementarios (180°).'
    },
    geo_pit: {
      idea: 'En un triángulo con una esquina cuadrada (recto), los lados están conectados por una regla mágica.',
      receta: ['Identifica la hipotenusa: es el lado más largo, frente a la esquina cuadrada.', 'cateto² + cateto² = hipotenusa².', 'Si buscas la hipotenusa: suma los cuadrados y saca raíz.', 'Si buscas un cateto: resta (hipotenusa² − cateto²) y saca raíz.', 'Trios que conviene recordar: 3-4-5, 5-12-13, 8-15-17.'],
      error: 'Sumar los catetos sin elevarlos al cuadrado.'
    },
    geo_vol: {
      idea: 'Volumen es cuánto espacio ocupa algo por dentro, como la cantidad de cubitos que caben en una caja.',
      receta: ['Caja: largo × ancho × alto.', 'Cilindro: (área del círculo de abajo) × alto = π × radio² × alto.', 'El volumen va en unidades al cubo (cm³).'],
      error: 'Olvidar elevar el radio al cuadrado en el cilindro.'
    },
    geo_coord: {
      idea: 'El plano cartesiano es un mapa con dos calles: x (horizontal) y y (vertical). Cada punto es (x, y).',
      receta: ['Distancia entre dos puntos: dibuja el triángulo recto y usa Pitágoras.', 'Punto medio: promedio de las x y promedio de las y.', 'Reflejar sobre el eje x: la y cambia de signo. Sobre el eje y: la x cambia de signo.'],
      error: 'Cambiar el signo de la coordenada equivocada al reflejar.'
    },
    geo_sem: {
      idea: 'Figuras semejantes tienen la misma forma pero distinto tamaño, como una foto y su ampliación.',
      receta: ['Divide dos lados que se corresponden: así sabes cuántas veces creció.', 'Multiplica el lado que buscas por ese mismo número.'],
      error: 'Sumar la diferencia en lugar de multiplicar por la razón.'
    },
    dat_central: {
      idea: 'Tres formas de resumir muchos datos: el promedio, el del medio y el que más se repite.',
      receta: ['Promedio: suma todos y divide entre cuántos son.', 'Mediana: ORDENA de menor a mayor y toma el del medio.', 'Moda: el dato que más veces aparece.', 'Si te dan el promedio, la suma es promedio × cantidad.'],
      error: 'Buscar la mediana sin ordenar antes los datos.'
    },
    dat_prob: {
      idea: 'La probabilidad dice qué tan posible es que algo pase. Va de 0 (imposible) a 1 (seguro).',
      receta: ['Cuenta los casos que te sirven.', 'Cuenta TODOS los casos posibles.', 'Probabilidad = los que sirven ÷ todos. Simplifica la fracción.', 'Población = todo el grupo estudiado; muestra = la parte que se mide.'],
      error: 'Dividir entre los casos que NO sirven en lugar de entre el total.'
    },
    dat_tablas: {
      idea: 'Las tablas y gráficas son información ordenada. Lo difícil no es la cuenta: es leer bien qué piden.',
      receta: ['Lee el título y los nombres de las filas o barras.', 'Busca solo los datos que pide la pregunta y anótalos.', '“En total” = sumar. “Cuántos más” o “diferencia” = restar.'],
      error: 'Sumar cuando la pregunta pedía comparar (restar).'
    }
  };
  root.PAA = root.PAA || {}; root.PAA.lecciones = L;
  if (typeof module !== 'undefined' && module.exports) module.exports = L;
})(typeof window !== 'undefined' ? window : globalThis);
