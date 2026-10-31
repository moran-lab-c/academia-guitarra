// El currículo V3.1 en la app: los datos coinciden con los documentos aprobados, «Continuar» lleva donde debe,
// los repasos van por dentro y lo que se dibuja (acordes, preguntas) está bien calculado.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generar } from '../herramientas/generar-curriculo.mjs';
import { indexarCurriculo, continuar, marcar, responderRepaso, resumenNivel, enElAtril, paraRepasar, progresoObra, progresoVacio, esDePractica, INTERVALOS, validarCurriculo } from '../logica/curriculo.js';
import { ACORDES, acordesDe, ventana } from '../logica/acordes.js';
import { PREGUNTAS, preguntasDelPaso } from '../logica/preguntasPaso.js';
import { validarEstado, estadoInicial } from '../logica/esquema.js';
import { entidadesReales } from './ayuda.js';

const datos = generar();
const ind = indexarCurriculo(datos);
const nuevo = () => progresoVacio();

test('los datos de la app coinciden con los documentos aprobados', () => {
  const archivo = JSON.parse(fs.readFileSync(new URL('../contenido/curriculo/clasica.json', import.meta.url), 'utf8'));
  assert.deepEqual(archivo, JSON.parse(JSON.stringify(datos)), 'contenido/curriculo/clasica.json no está al día: node herramientas/generar-curriculo.mjs');
});

test('la estructura es la aprobada: 7 niveles y los tramos de cada uno', () => {
  assert.equal(datos.niveles.length, 7);
  assert.deepEqual(datos.niveles.map(n => n.tramos.length), [14, 13, 10, 11, 13, 11, 10]);
  for (const e of ind.pasos) assert.ok(e.paso.tipo && e.paso.id, `paso mal: ${e.paso.id}`);
  assert.equal(new Set(ind.pasos.map(e => e.paso.id)).size, ind.pasos.length);
});

test('al alumno no le llega el lenguaje interno ni la calibración', () => {
  const prohibido = /\[(Dato|Consenso|Decisión|Estimación)|E-N\d-\d\d|ABRSM|La Rioja|𝄞|⏱|⌗|✎|dominio(?! público)|comprobación en frío|\bél (la|los|canta|decide)\b/i;
  for (const e of ind.pasos) assert.ok(!prohibido.test(e.paso.texto), `${e.paso.id}: ${e.paso.texto}`);
});

test('lo dudoso sigue marcado como por verificar', () => {
  assert.ok(ind.pasos.filter(e => e.paso.porVerificar).length > 20);
  assert.ok(ind.obras.some(o => o.porVerificar));
});

test('cada ejercicio citado existe y cada notación apunta a un ejercicio real', () => {
  const ids = new Set(entidadesReales().map(e => e.id));
  for (const e of ind.pasos) {
    for (const c of e.paso.ejercicios ?? []) assert.ok(ind.ejercicios[c], `${e.paso.id}: falta ${c}`);
    for (const n of e.paso.notacion ?? []) assert.ok(ids.has(n), `${e.paso.id}: no existe ${n}`);
  }
  for (const o of ind.obras) if (o.ficha) assert.ok(ids.has(o.ficha), `${o.id}: no existe ${o.ficha}`);
});

test('las obras están clasificadas y las troncales de los niveles altos tienen ruta', () => {
  const tipos = new Set(['troncal', 'aplicacion', 'lectura', 'fragmento', 'alternativa', 'conocida']);
  for (const o of ind.obras) assert.ok(tipos.has(o.tipo), `${o.id}: ${o.tipo}`);
  for (const o of ind.obras.filter(x => x.tipo === 'troncal')) assert.ok(progresoObra(ind, nuevo(), o.id).total >= 1, `sin pasos: ${o.id}`);
  // El Estudio n.º 11 se prepara solo, sin pasos guiados: es lo que enseña.
  for (const o of ind.obras.filter(x => x.tipo === 'troncal' && x.nivel >= 5 && !x.titulo.includes('n.º 11'))) assert.ok(progresoObra(ind, nuevo(), o.id).total >= 2, `obra larga sin ruta: ${o.id}`);
});

test('Continuar: la primera vez, Comenzar por el primer paso', () => {
  const d = continuar(ind, nuevo());
  assert.equal(d.etiqueta, 'Comenzar');
  assert.equal(d.entrada.paso.id, 'n1.t1.l1.p1');
});

test('Continuar: al marcar un paso pasa al siguiente, y «Sigo practicando» también avanza', () => {
  const c = nuevo();
  marcar(c, ind.porId.get('n1.t1.l1.p1'), 'hecho', '2026-11-01');
  assert.equal(continuar(ind, c, '2026-11-01').entrada.paso.id, 'n1.t1.l1.p2');
  marcar(c, ind.porId.get('n1.t1.l1.p2'), 'practica', '2026-11-01');
  assert.equal(continuar(ind, c, '2026-11-01').entrada.paso.id, 'n1.t1.l1.p3');
});

test('terminado el nivel, propone el siguiente; terminado todo, nada', () => {
  const c = nuevo();
  for (const e of ind.pasos.filter(x => x.nivel.numero === 1)) marcar(c, e, 'practica', '2026-11-01');
  const d = continuar(ind, c, '2026-11-01');
  assert.equal(d.accion, 'siguiente-nivel');
  assert.equal(d.otro.numero, 2);
  const f = nuevo(); f.nivel = 7;
  for (const e of ind.pasos.filter(x => x.nivel.numero === 7)) marcar(f, e, 'practica', '2026-11-01');
  assert.equal(continuar(ind, f, '2026-11-01').accion, 'fin');
});

test('los repasos entran solos entre lecciones, nunca a mitad, y como mucho dos seguidos', () => {
  const c = nuevo();
  const ejercicios = ind.pasos.filter(e => e.paso.tipo === 'Ejercicio' && e.paso.ejercicios).slice(0, 4);
  for (const e of ejercicios) marcar(c, e, 'hecho', '2026-11-01');
  // A mitad de una lección no interrumpe: hecho el primer paso, queda el segundo.
  marcar(c, ind.pasos[0], 'hecho', '2026-11-01');
  assert.equal(continuar(ind, c, '2026-12-30').accion, 'paso', 'a mitad de una lección no interrumpe');
  for (const p of ind.pasos[0].leccion.pasos.slice(1)) marcar(c, ind.porId.get(p.id), 'hecho', '2026-11-01');
  const r1 = continuar(ind, c, '2026-12-30');
  assert.equal(r1.accion, 'repaso');
  responderRepaso(c, r1.entrada, 'bien', '2026-12-30');
  const r2 = continuar(ind, c, '2026-12-30');
  assert.equal(r2.accion, 'repaso');
  responderRepaso(c, r2.entrada, 'bien', '2026-12-30');
  assert.equal(continuar(ind, c, '2026-12-30').accion, 'paso', 'tras dos seguidos, sigue la ruta');
});

test('Bien aleja el repaso, Regular lo mantiene y No salió lo devuelve a la práctica', () => {
  const c = nuevo();
  const e = ind.pasos.find(x => x.paso.tipo === 'Ejercicio' && x.paso.ejercicios);
  marcar(c, e, 'hecho', '2026-11-01');
  assert.equal(c.repasos[e.paso.id].prox, '2026-11-04');
  assert.equal(INTERVALOS[0], 3);
  responderRepaso(c, e, 'bien', '2026-11-04');
  assert.equal(c.repasos[e.paso.id].n, 1);
  responderRepaso(c, e, 'regular', '2026-11-11');
  assert.equal(c.repasos[e.paso.id].n, 1);
  responderRepaso(c, e, 'no', '2026-11-18');
  assert.equal(c.repasos[e.paso.id].n, 0);
  assert.equal(c.pasos[e.paso.id].e, 'practica');
  assert.deepEqual(paraRepasar(ind, c, '2026-11-18'), []);
});

test('el progreso es sencillo: porcentaje, lecciones y lo que está en práctica', () => {
  const c = nuevo();
  const l = ind.lecciones.get('n1.t2.l1').leccion;
  for (const p of l.pasos) marcar(c, ind.porId.get(p.id), 'hecho', '2026-11-01');
  const r = resumenNivel(ind, c, 1);
  assert.equal(r.hechos, l.pasos.length);
  assert.equal(r.tramos[1].lecciones[0].estado, 'hecho');
  assert.equal(r.tramos[1].lecciones[1].estado, 'nueva');
  const o = ind.pasos.find(e => e.paso.obra);
  marcar(c, o, 'practica', '2026-11-02');
  assert.equal(enElAtril(ind, c)[0].paso.id, o.paso.id);
});

test('los pasos de tocar se marcan como aprendidos; los de leer, Continuar', () => {
  assert.equal(esDePractica({ tipo: 'Ejercicio' }), true);
  assert.equal(esDePractica({ tipo: 'Obra' }), true);
  assert.equal(esDePractica({ tipo: 'Contexto' }), false);
  assert.equal(esDePractica({ tipo: 'Explicación' }), false);
});

test('el progreso se guarda sin cambiar el formato: opcional y validado', () => {
  const e = estadoInicial();
  assert.deepEqual(validarEstado(e), []);
  e.curriculo = { nivel: 2, posicion: 'n2.t1.l1.p1', pasos: { x: { e: 'hecho', t: '2026-11-01' } }, repasos: { x: { n: 0, prox: '2026-11-04' } } };
  assert.deepEqual(validarEstado(e), []);
  assert.ok(validarCurriculo({ pasos: { x: { e: 'dominado' } } }).length);
});

test('cada acorde está bien formado y los diagramas salen de lo que nombra el paso', () => {
  for (const [nombre, a] of Object.entries(ACORDES)) {
    assert.equal(a.cuerdas.length, 6, nombre);
    a.cuerdas.forEach((t, i) => assert.equal(t === null, a.dedos[i] === null, `${nombre}: cuerda ${6 - i}`));
    a.cuerdas.forEach((t, i) => { if (t === 0) assert.equal(a.dedos[i], 0, `${nombre}: al aire sin dedo`); if (t > 0) assert.ok(a.dedos[i] >= 1 && a.dedos[i] <= 4, `${nombre}: dedo`); });
    if (a.cejilla) a.cuerdas.forEach((t, i) => { const c = 6 - i; if (c <= a.cejilla.desde && c >= a.cejilla.hasta) assert.ok(t >= a.cejilla.traste, `${nombre}: nota bajo la cejilla`); });
    assert.ok(ventana(a).trastes >= 4);
  }
  assert.deepEqual(acordesDe(ind.porId.get('n1.t4.l2.p4').paso), ['Mi', 'La', 'Si7']);
  assert.deepEqual(acordesDe(ind.porId.get('n1.t4.l2.p2').paso), ['Mi', 'La', 'Si7']);
  assert.deepEqual(acordesDe(ind.porId.get('n1.t7.l2.p3').paso), ['Mi m', 'La m', 'Si7']);
  assert.deepEqual(acordesDe(ind.porId.get('n1.t13.l3.p3').paso), ['La (cejilla V)', 'Re', 'Mi7', 'La']);
  assert.deepEqual(acordesDe(ind.porId.get('n4.t4.l3.p2').paso), ['Re m', 'Sol m', 'Do', 'Fa', 'Si♭', 'La']);
  assert.deepEqual(acordesDe(ind.porId.get('n1.t14.l3.p2').paso), [], 'una lista de tonalidades no son acordes');
});

test('las notas de cada acorde son las que dice su nombre', () => {
  const AIRE = [40, 45, 50, 55, 59, 64];
  const clases = n => new Set(ACORDES[n].cuerdas.map((t, i) => (t === null ? null : (AIRE[i] + t) % 12)).filter(x => x !== null));
  const esperado = { Mi: [4, 8, 11], La: [9, 1, 4], Si7: [11, 3, 6, 9], Do: [0, 4, 7], Re: [2, 6, 9], Sol: [7, 11, 2], 'La m': [9, 0, 4], 'Mi m': [4, 7, 11], 'Re m': [2, 5, 9], Fa: [5, 9, 0],
    Sol7: [7, 11, 2, 5], Re7: [2, 6, 9, 0], La7: [9, 1, 4, 7], Mi7: [4, 8, 11, 2], Do7: [0, 4, 10], 'Fa△7': [5, 9, 0, 4], // Do7: la forma abierta habitual no lleva la 5.ª
    'Sol m': [7, 10, 2], 'Si♭': [10, 2, 5], 'La (cejilla V)': [9, 1, 4] };
  for (const [n, notas] of Object.entries(esperado)) assert.deepEqual([...clases(n)].sort((a, b) => a - b), [...notas].sort((a, b) => a - b), n);
  assert.equal(Object.keys(esperado).length, Object.keys(ACORDES).length);
});

test('las preguntas de cada paso existen, se calculan y tienen la respuesta entre las opciones', () => {
  for (const id of Object.keys(PREGUNTAS)) {
    assert.ok(ind.porId.has(id), `no existe el paso ${id}`);
    const lista = preguntasDelPaso(id, 5);
    assert.equal(lista.length, 5, id);
    for (const q of lista) { assert.ok(q.opciones.length >= 2, id); assert.ok(q.correcta >= 0 && q.correcta < q.opciones.length, id); }
  }
  assert.deepEqual(preguntasDelPaso('n3.t1.l6.p1', 3), preguntasDelPaso('n3.t1.l6.p1', 3), 'con la misma semilla, las mismas');
  assert.equal(preguntasDelPaso('n1.t1.l1.p1'), null, 'lo que no tiene preguntas no se inventa');
});

test('el intervalo que suena es el de la respuesta correcta', () => {
  const SEMIS = { '3.ª menor': 3, '3.ª mayor': 4, '4.ª justa': 5, '5.ª justa': 7, '8.ª': 12 };
  for (const q of preguntasDelPaso('n1.t9.l3.p3', 30)) {
    const [[a], [b]] = q.audio.secuencia;
    assert.equal(b - a, SEMIS[q.opciones[q.correcta]]);
  }
});
