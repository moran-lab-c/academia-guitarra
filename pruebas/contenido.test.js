// Fase 3E: el contenido de los tramos 3-5 del curso 1. Las notas de cada ejercicio son las de su escala o su acorde
// (calculadas aparte, con la teoría, no con el código que dibuja), cada cosa nueva tiene su propósito y sus relaciones
// en los dos sentidos, y lo que no se puede comprobar desde aquí está marcado, no presentado como dato.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepararNotacion } from '../logica/partitura.js';
import { escala } from '../logica/preguntas.js';
import { validarCatalogo } from '../logica/validarCatalogo.js';
import { relacionesPaso, necesidades, obraEnRutas } from '../logica/ruta.js';
import { ctxDe, entidadesReales } from './ayuda.js';

const NOTACION = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'contenido', 'notacion');
const leer = f => JSON.parse(fs.readFileSync(path.join(NOTACION, f)));
const CUERDAS = [64, 59, 55, 50, 45, 40]; // MIDI de las cuerdas al aire, de la 1.ª a la 6.ª
const PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const pcDe = ({ letra, acc }) => (PC[letra] + (acc === '#' ? 1 : acc === 'b' ? -1 : 0) + 12) % 12;
// Lo que suena, compás a compás: listas de alturas MIDI (un acorde, varias).
const alturas = f => leer(f).compases.map(m => m.voces.flatMap(v => v.filter(n => !n.s).map(n => (n.acorde ?? [n]).map(x => CUERDAS[x.c - 1] + x.t))));
const melodia = f => alturas(f).flat(2);
const ENTIDADES = entidadesReales();
const porId = new Map(ENTIDADES.map(e => [e.id, e]));
const TRAMOS_NUEVOS = ['tramo:c1.t3', 'tramo:c1.t4', 'tramo:c1.t5'];
const pasosNuevos = TRAMOS_NUEVOS.flatMap(t => porId.get(t).pasos).map(id => porId.get(id));

test('Contenido · las escalas suenan las notas de su escala, en orden, con su fórmula y en primera posición', () => {
  const comprobar = (f, tonica, modo, octavas = 1) => {
    const notas = melodia(f);
    const grados = escala(tonica, modo).map(pcDe);
    for (const m of notas) assert.ok(grados.includes(m % 12), `${f}: ${m} no es de ${tonica} ${modo}`);
    const sube = notas.slice(0, 7 * octavas + 1);
    for (let i = 1; i < sube.length; i++) assert.ok(sube[i] > sube[i - 1], `${f}: no sube por grados`);
    assert.equal(sube.at(-1) - sube[0], 12 * octavas, `${f}: no llega a la octava`);
    assert.equal(notas.at(-1), notas[0], `${f}: no vuelve a la tónica`);
    for (const m of leer(f).compases) for (const v of m.voces) for (const n of v) if (!n.s) assert.ok(n.t <= 4, `${f}: traste ${n.t} fuera de la primera posición`);
  };
  comprobar('esc-do-mayor-1pos.json', 'c', 'mayor');
  comprobar('esc-sol-mayor-1pos.json', 'g', 'mayor', 2);
  comprobar('esc-re-mayor-1pos.json', 'd', 'mayor');
  // La menor: natural, armónica (Sol♯) y melódica (Fa♯ y Sol♯ al subir, natural al bajar).
  const la = alturas('esc-la-menor-3-formas.json').map(c => c.flat());
  const natural = escala('a', 'menor').map(pcDe);
  assert.deepEqual(la[0].map(m => m % 12), [...natural, natural[0]]);
  assert.deepEqual(la[2].map(m => m % 12), [...natural.slice(0, 6), 8, 9]);
  assert.deepEqual(la[4].map(m => m % 12), [...natural.slice(0, 5), 6, 8, 9]);
  assert.deepEqual(la[5].map(m => m % 12), [9, ...[...natural].reverse().slice(0, 7)]); // baja como la natural
  // Cromática: todos los semitonos, uno detrás de otro.
  const crom = melodia('esc-cromatica-1pos.json');
  crom.slice(1).forEach((m, i) => assert.equal(m - crom[i], 1));
  assert.equal(crom.at(-1) - crom[0], 12);
});

test('Contenido · los arpegios solo usan notas de su acorde y el Si7 resuelve como dice la teoría', () => {
  const ACORDES = { Do: [0, 4, 7], Sol7: [7, 11, 2, 5], Lam: [9, 0, 4], Mi: [4, 8, 11], La: [9, 1, 4], Si7: [11, 3, 6, 9] };
  const revisar = (f, orden) => alturas(f).forEach((c, i) => c.flat().forEach(m => assert.ok(ACORDES[orden[i]].includes(m % 12), `${f}, compás ${i + 1}: ${m} no es de ${orden[i]}`)));
  revisar('arp-pima-do-sol7.json', ['Do', 'Sol7', 'Sol7', 'Do']);
  revisar('arp-pami-do-sol7.json', ['Do', 'Sol7', 'Sol7', 'Do']);
  revisar('arp-nota-destacada.json', ['Lam', 'Mi', 'Mi', 'Lam']);
  revisar('arm-mi-la-si7.json', ['Mi', 'La', 'Si7', 'Mi', 'Mi', 'La', 'Si7', 'Mi']);
  // p-i-m-a sube del bajo a la 1.ª; p-a-m-i, después del bajo, baja de la 1.ª a la 3.ª.
  const cuerdas = f => leer(f).compases[0].voces[0].slice(0, 4).map(n => n.c);
  assert.deepEqual(cuerdas('arp-pima-do-sol7.json'), [5, 3, 2, 1]);
  assert.deepEqual(cuerdas('arp-pami-do-sol7.json'), [5, 1, 2, 3]);
  // La nota de «a» lleva el acento, las demás no.
  for (const n of leer('arp-nota-destacada.json').compases.flatMap(m => m.voces[0])) assert.equal(!!n.art?.includes('acento'), n.c === 1);
  // Si7 → Mi: el Re♯ (4.ª, traste 1) sube medio tono a Mi y el La (3.ª, traste 2) baja medio tono a Sol♯ (Plan, 3.6).
  const [si7, mi] = [alturas('arm-mi-la-si7.json')[2][0], alturas('arm-mi-la-si7.json')[3][0]];
  assert.ok(si7.includes(51) && mi.includes(52) && si7.includes(57) && mi.includes(56));
});

test('Contenido · ligados, mordentes, dos voces y hemiolia están escritos como dicen sus instrucciones', () => {
  const lig = leer('tec-ligados-1pos.json').compases.flatMap(m => m.voces[0]);
  lig.forEach((n, i) => { if (n.lig === 'h') assert.ok(lig[i + 1].c === n.c && lig[i + 1].t > n.t); if (n.lig === 'p') assert.ok(lig[i + 1].c === n.c && lig[i + 1].t < n.t); });
  // Mordente: la nota, la de abajo (un grado de Re mayor por debajo) y vuelta, en la misma cuerda y dentro del tiempo.
  const re = escala('d', 'mayor').map(pcDe);
  const mord = leer('tec-mordente.json').compases.flatMap(m => m.voces[0]);
  let vistos = 0;
  mord.forEach((n, i) => {
    if (n.lig !== 'p' || mord[i + 1]?.lig !== 'h') return;
    const [a, b, c] = [n, mord[i + 1], mord[i + 2]].map(x => CUERDAS[x.c - 1] + x.t);
    assert.ok(a === c && a - b >= 1 && a - b <= 2 && re.includes(b % 12), `mordente ${a}-${b}-${c}`);
    vistos++;
  });
  assert.equal(vistos, 4);
  // Dos voces: el bajo dura dos tiempos y se calla (silencio) en los tres primeros compases.
  const voces = leer('tec-apagar-voces.json').compases;
  for (const m of voces.slice(0, 3)) assert.deepEqual(m.voces[1].map(n => [n.d, !!n.s]), [['2', false], ['2', true]]);
  // Hemiolia: dos compases de 6/8 en dos y, en el tercero, tres negras acentuadas.
  const h = leer('rit-hemiolia.json');
  assert.equal(h.compas, '6/8');
  assert.deepEqual(h.compases[2].voces[0].map(n => [n.d, !!n.p, !!n.art?.includes('acento')]), [['4', false, true], ['4', false, true], ['4', false, true]]);
  // Todo se puede dibujar.
  for (const f of fs.readdirSync(NOTACION)) assert.ok(prepararNotacion(leer(f)).ok, f);
});

test('Contenido · cada competencia y ejercicio nuevo dice para qué es, de qué área y nivel, qué necesita y dónde se trabaja', () => {
  assert.deepEqual(validarCatalogo(ENTIDADES), []);
  const comps = [...new Set(pasosNuevos.flatMap(p => p.trabaja || []))].map(id => porId.get(id));
  assert.ok(comps.length >= 15);
  for (const c of comps) {
    assert.ok(c.nombre && c.descripcion && c.proposito, `${c.id}: sin nombre, descripción o propósito`);
    assert.ok(c.area && Number.isInteger(c.nivel) && c.criterio?.tipo, `${c.id}: sin área, nivel o criterio`);
    // Si es de ejecución, tiene al menos un ejercicio con notación propia.
    if (c.criterio.tipo === 'ejecucion') assert.ok(ENTIDADES.some(e => e.tipo === 'ejercicio' && e.trabaja?.includes(c.id) && e.notacion?.fuente), `${c.id}: sin ejercicio con notación`);
  }
  // Cada ejercicio nuevo con notación: el archivo existe, sus vistas incluyen el formato principal y dice por qué.
  const ejercicios = [...new Set(pasosNuevos.flatMap(p => p.contenido || []))].map(id => porId.get(id)).filter(e => e?.tipo === 'ejercicio' && e.notacion?.fuente);
  assert.ok(ejercicios.length >= 10);
  for (const e of ejercicios) {
    assert.ok(fs.existsSync(path.join(NOTACION, '..', e.notacion.fuente)), e.id);
    assert.ok(e.notacion.vistas.includes('tablatura'), `${e.id}: la tablatura siempre está`);
    assert.ok(e.notacion.vistas.includes(e.notacion.principal) && e.notacion.motivo, e.id);
    assert.ok((e.instrucciones || []).length && e.objetivo, e.id);
  }
});

test('Contenido · relaciones en los dos sentidos: los pasos preparan la Españoleta y la obra dice qué pide y dónde se trabaja', () => {
  const ctx = ctxDe();
  const ESP = 'obra:sanz.espanoleta';
  assert.ok(relacionesPaso(ctx, 'paso:c1.t5.01').prepara.some(x => x.obra === ESP)); // apagar voces → la obra que lo pide
  const nec = necesidades(ctx, ESP);
  const apagar = nec.pide.find(x => x.comp === 'comp:tec.apagar-voces');
  assert.ok(apagar.donde.some(d => d.id === 'paso:c1.t5.01') && apagar.donde.some(d => d.id === 'ej:tec.apagar-voces'));
  assert.ok(obraEnRutas(ctx, ESP).pasos.some(p => p.clase === 'obra' && p.tramo === 5));
  // Los requisitos entre competencias apuntan a lo que se trabaja antes en la ruta.
  const orden = ['tramo:c1.t1', 'tramo:c1.t2', ...TRAMOS_NUEVOS].flatMap(t => porId.get(t).pasos);
  const primerPaso = id => orden.findIndex(p => (porId.get(p).trabaja || []).includes(id));
  for (const p of pasosNuevos) for (const c of p.trabaja || []) for (const r of porId.get(c).requiere || []) {
    if (primerPaso(r) >= 0) assert.ok(primerPaso(r) <= primerPaso(c), `${c} pide ${r}, que llega después`);
  }
});

test('Contenido · lo que no se puede comprobar desde aquí queda pendiente, no como dato', () => {
  const esp = porId.get('obra:sanz.espanoleta');
  // Ni tonalidad ni compás ni duración ni secciones inventadas; la notación, fuera de la app; su porqué, escrito.
  for (const campo of ['tonalidad', 'compas', 'duracionMin', 'secciones', 'fragmentos']) assert.equal(esp[campo], undefined, campo);
  assert.equal(esp.notacion.partitura, 'externa');
  assert.ok(esp.porQue && esp.objetivos.length);
  const pendientes = esp.porVerificar.map(x => x.campo).join(' ');
  for (const c of ['edicion', 'fuente', 'tonalidad', 'desarrolla']) assert.ok(pendientes.includes(c), c);
  // Las obras eje de los tramos 3 y 4 no se improvisan: quedan pendientes y lo dicen.
  for (const t of ['tramo:c1.t3', 'tramo:c1.t4']) {
    const tramo = porId.get(t);
    assert.equal(tramo.obraEje, undefined);
    assert.ok(tramo.porVerificar.some(x => x.campo === 'obraEje'));
    assert.ok(tramo.objetivos.some(o => /pendiente/.test(o)));
  }
  assert.equal(porId.get('tramo:c1.t5').obraEje, 'obra:sanz.espanoleta');
  // El mordente dice que su ejecución en cada estilo depende de la edición.
  assert.ok(porId.get('ej:tec.mordente').porVerificar.length);
});

test('Contenido · cada ejercicio dice el compás de su notación (el metrónomo arranca en él) y la hemiolia tiene sus dos formas', () => {
  for (const e of ENTIDADES.filter(x => x.tipo === 'ejercicio' && x.notacion?.fuente)) {
    const compas = JSON.parse(fs.readFileSync(path.join(NOTACION, '..', e.notacion.fuente))).compas;
    assert.equal(e.compas ?? '4/4', compas, `${e.id}: el ejercicio dice ${e.compas ?? 'nada (4/4)'} y su notación ${compas}`);
  }
  // La hemiolia en 3/4: dos compases que suenan como tres blancas (la segunda, ligada sobre la barra), antes del final.
  const h34 = leer('rit-hemiolia-3-4.json');
  assert.equal(h34.compas, '3/4');
  const acentos = h34.compases.slice(2, 4).flatMap(m => m.voces[0]).filter(n => n.art?.includes('acento')).length;
  assert.equal(acentos, 3);
  assert.ok(h34.compases[2].voces[0].at(-1).tie);
  // El puntillo y las semicorcheas se trabajan antes de la hemiolia, que los pide.
  const hemiolia = porId.get('comp:rit.ternario-hemiolia');
  assert.ok(hemiolia.requiere.includes('comp:rit.puntillo-semicorcheas'));
  assert.ok(porId.get('paso:c1.t5.04').requiere.includes('paso:c1.t4.08'));
  assert.ok(porId.get('tramo:c1.t4').pasos.includes('paso:c1.t4.08'));
  // Lo que depende de la edición de la Españoleta no se da como dato de la obra.
  for (const id of ['paso:c1.t5.03', 'paso:c1.t5.04']) assert.match(porId.get(id).objetivo, /edición/, id);
  assert.match(porId.get('comp:esc.re-mayor-1pos').proposito, /por verificar/);
  assert.equal(porId.get('obra:sanz.espanoleta').nivel.referencias.find(r => r.sistema === 'RCM 2018').naturaleza, 'estimacion');
});

test('Contenido · en Mi–La–Si7 en arpegio suenan las dos resoluciones del Si7: Re♯ → Mi en la 4.ª y La → Sol♯ en la 3.ª', () => {
  const m = leer('arm-mi-la-si7.json').compases;
  const nota = (k, mano) => m[k].voces[0].find(n => n.mano === mano);
  assert.deepEqual([nota(6, 'i').c, CUERDAS[3] + nota(6, 'i').t, CUERDAS[3] + nota(7, 'i').t], [4, 51, 52]); // Re♯3 → Mi3
  assert.deepEqual([nota(6, 'm').c, CUERDAS[2] + nota(6, 'm').t, CUERDAS[2] + nota(7, 'm').t], [3, 57, 56]); // La3 → Sol♯3
});
