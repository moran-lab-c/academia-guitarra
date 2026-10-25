// Fase 3: la notación propia hasta el plan de dibujo (sin navegador), las vistas que necesita cada contenido, el selector
// y los fragmentos de obra.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { prepararNotacion, validarNotacion, grafia, armadura } from '../logica/partitura.js';
import { formatos, recomendarFormato } from '../logica/notacion.js';
import { validarCatalogo } from '../logica/validarCatalogo.js';
import { seccionDe, pideDe, esFragmento } from '../logica/catalogo.js';
import { validarEstado, estadoInicial } from '../logica/esquema.js';
import { entidadesReales } from './ayuda.js';

const nota = (c, t, d = '8', extra = {}) => ({ d, c, t, ...extra });
const unCompas = (voces, extra = {}) => ({ compas: '4/4', compases: [{ voces }], ...extra });

test('Notación · la escala de Mi mayor sale escrita una octava por encima y con la grafía de su armadura (Re#, no Mib)', () => {
  const p = prepararNotacion(JSON.parse(fs.readFileSync(new URL('../contenido/notacion/esc-mi-mayor-1pos.json', import.meta.url))));
  assert.equal(p.ok, true);
  assert.equal(p.armadura, 'E');
  assert.deepEqual(p.compases[0].voces[0].map(n => n.claves[0]), ['e/3', 'f#/3', 'g#/3', 'a/3', 'b/3', 'c#/4', 'd#/4', 'e/4']);
  // Todo lo de Mi mayor lo da la armadura: ninguna alteración a la vista.
  assert.ok(p.compases.every(m => m.voces.every(v => v.every(n => !n.alteraciones.length))));
  // La tablatura sale de la misma nota: cuerda y traste.
  assert.deepEqual(p.compases[0].voces[0][6].tab, [{ cuerda: 4, traste: 1 }]);
  assert.deepEqual(p.compases[3].voces[0].at(-1), { ...p.compases[3].voces[0].at(-1), duracion: '2', claves: ['e/3'] });
});

test('Notación · las alteraciones se ven cuando la armadura no las da, y el becuadro cuando algo ya alterado vuelve en el compás (las dos voces comparten pentagrama)', () => {
  // Do mayor: Fa# (cuerda 1, traste 2) y luego Fa natural (traste 1) en el mismo compás.
  const c = prepararNotacion(unCompas([[nota(1, 2, '4'), nota(1, 1, '4'), nota(1, 2, '4'), nota(1, 2, '4')]]), {});
  assert.deepEqual(c.compases[0].voces[0].map(n => n.alteraciones.map(a => a.tipo).join('')), ['#', 'n', '#', '']);
  // Con dos voces, el orden es el del tiempo: el bajo pone Sol# en la parte 1 y la melodía lo repite en la 2 sin alteración.
  const dos = prepararNotacion(unCompas([
    [nota(1, 0, '4'), nota(3, 1, '4'), nota(1, 0, '2')],
    [nota(3, 1, '2'), nota(6, 0, '2')],
  ]));
  assert.equal(dos.compases[0].voces[1][0].alteraciones[0].tipo, '#');   // Sol# del bajo, en la parte 1
  assert.equal(dos.compases[0].voces[0][1].alteraciones.length, 0);      // el de la melodía, en la parte 2, ya va alterado
  // En Fa mayor, La# se escribe Sib y no lleva alteración; en Do, La# sí.
  assert.deepEqual(prepararNotacion(unCompas([[nota(3, 3, '1')]], { armadura: 'F' })).compases[0].voces[0][0].claves, ['bb/4']);
  assert.deepEqual(prepararNotacion(unCompas([[nota(3, 3, '1')]], { armadura: 'F' })).compases[0].voces[0][0].alteraciones, []);
  assert.equal(prepararNotacion(unCompas([[nota(3, 3, '1')]])).compases[0].voces[0][0].alteraciones[0].tipo, '#');
  // Grafías límite: en Fa# mayor (6 sostenidos) el Fa natural se escribe Mi#.
  assert.deepEqual(grafia(65, armadura('F#')), { letra: 'e', acc: '#', octava: 4 });
});

test('Notación · digitación, mano derecha, ligados, ligaduras, articulaciones, dinámica y posición llegan al plan tal cual, sin añadir nada', () => {
  const p = prepararNotacion({ compas: '2/4', armadura: 'C', tempo: { bpm: 72, figura: '4', naturaleza: 'decision' }, compases: [
    { pos: 'II', voces: [[nota(2, 1, '8', { dedo: 1, mano: 'i', lig: 'h' }), nota(2, 3, '8', { dedo: 3 }), nota(1, 0, '4', { art: ['staccato'], din: 'p', tie: true })]] },
    { voces: [[nota(1, 0, '2')]] },
  ] });
  assert.equal(p.ok, true);
  const [a, b, c] = p.compases[0].voces[0];
  assert.deepEqual([a.dedo, a.mano, a.lig, b.dedo, b.mano, b.lig], [1, 'i', 'h', 3, null, null]);
  assert.deepEqual([c.art, c.din, c.tie], [['staccato'], 'p', true]);
  assert.equal(p.compases[0].pos, 'II');
  assert.equal(p.compases[1].pos, null);
  assert.deepEqual(p.tempo, { bpm: 72, figura: '4', naturaleza: 'decision' });
  // Un acorde: varias claves y varias posiciones de tablatura.
  const ac = prepararNotacion(unCompas([[{ d: '1', acorde: [{ c: 5, t: 3 }, { c: 4, t: 2 }, { c: 3, t: 0 }] }]]));
  assert.deepEqual(ac.compases[0].voces[0][0].claves, ['c/4', 'e/4', 'g/4']);
  assert.equal(ac.compases[0].voces[0][0].tab.length, 3);
});

test('Notación · lo mal escrito no se dibuja: ninguna nota inventada, y el motivo a la vista', () => {
  const mal = unCompas([[nota(7, 0, '4'), nota(1, 30, '5'), nota(1, 0, '4', { dedo: 6, mano: 'x', lig: 'q' })]]);
  const errores = validarNotacion(mal);
  for (const que of ['cuerda fuera', 'traste fuera', 'duración «5»', 'dedo fuera', 'mano derecha «x»', 'ligado «q»']) assert.ok(errores.some(e => e.includes(que)), que);
  const p = prepararNotacion(mal);
  assert.equal(p.ok, false);
  assert.deepEqual(p.compases, []);
  assert.match(p.avisos[0], /no se dibuja/);
  // Un compás que no se llena es un error (salvo una anacrusa declarada), y más de dos voces también.
  assert.ok(validarNotacion(unCompas([[nota(1, 0, '4')]])).some(e => /dura 1 negras/.test(e)));
  assert.deepEqual(validarNotacion({ ...unCompas([[nota(1, 0, '4')]]), anacrusa: true }), []);
  assert.ok(validarNotacion(unCompas([[nota(1, 0, '1')], [nota(2, 0, '1')], [nota(3, 0, '1')]])).some(e => /dos voces/.test(e)));
  // Un ligado al final de todo no tiene adónde ir.
  assert.ok(validarNotacion(unCompas([[nota(1, 0, '1', { lig: 'h' })]])).some(e => /necesita una nota después/.test(e)));
});

test('Notación · un fragmento se dibuja con sus compases y su numeración; si no está transcrito, se dice y no se rellena', () => {
  const tres = { compas: '4/4', compases: [1, 2, 3].map(t => ({ voces: [[nota(1, t, '1')]] })) };
  const f = prepararNotacion(tres, { compases: [2, 3] });
  assert.deepEqual(f.compases.map(m => m.numero), [2, 3]);
  assert.deepEqual(f.compases.map(m => m.voces[0][0].tab[0].traste), [2, 3]);
  const fuera = prepararNotacion(tres, { compases: [5, 8] });
  assert.equal(fuera.ok, false);
  assert.deepEqual(fuera.compases, []);
  const corto = prepararNotacion(tres, { compases: [2, 6] });
  assert.deepEqual(corto.compases.map(m => m.numero), [2, 3]);
  assert.ok(corto.avisos.some(a => /solo están transcritos hasta el 3/.test(a)));
  // Una notación parcial lo dice.
  assert.ok(prepararNotacion({ ...tres, parcial: { transcritos: 3, total: 32 } }).avisos.some(a => /3 de 32/.test(a)));
});

test('Vistas · solo tablatura, solo partitura o las dos; «Ambas» solo cuando hay las dos, y la elección se recuerda', () => {
  const tab = { id: 'ej:t', notacion: { fuente: 'notacion/x.json', vistas: ['tablatura'], motivo: 'Técnica pura: el pentagrama no aporta.' } };
  const par = { id: 'ej:p', notacion: { fuente: 'notacion/x.json', vistas: ['partitura'], motivo: 'Es para leer: la tablatura daría la respuesta.' } };
  const dos = { id: 'ej:d', notacion: { fuente: 'notacion/x.json' } };
  assert.deepEqual(formatos(tab), { partitura: null, tablatura: 'app' });
  assert.deepEqual(formatos(par), { partitura: 'app', tablatura: null });
  assert.deepEqual(formatos(dos), { partitura: 'app', tablatura: 'app' });
  const rTab = recomendarFormato(tab, { elegido: 'partitura' });
  assert.deepEqual([rTab.disponibles, rTab.mostrar, rTab.motivo], [['tablatura'], 'tablatura', 'Técnica pura: el pentagrama no aporta.']); // no se fuerza el pentagrama
  assert.equal(recomendarFormato(tab, { elegido: 'ambas' }).mostrar, 'tablatura');
  assert.equal(recomendarFormato(par, {}).mostrar, 'partitura');
  const rDos = recomendarFormato(dos, { elegido: 'ambas', proposito: 'lectura' });
  assert.deepEqual([rDos.recomendado, rDos.mostrar, rDos.elegidoPorTi], ['partitura', 'ambas', true]);
  // Sin elegir, manda la recomendación de siempre (aquí, el propósito de lectura).
  assert.equal(recomendarFormato(dos, { proposito: 'lectura' }).mostrar, 'partitura');
  // La preferencia «ambas» se guarda como cualquier otra; algo desconocido, no.
  const e = estadoInicial();
  e.formatos = { 'ej:d': 'ambas' };
  assert.deepEqual(validarEstado(e), []);
  e.formatos = { 'ej:d': 'pentagrama' };
  assert.ok(validarEstado(e).some(x => /formatos/.test(x)));
});

test('Fragmentos · tienen su clave («obra#id»), lo que piden y su notación; el validador no deja ids repetidos ni secciones que no existen', () => {
  const obra = { id: 'obra:x', tipo: 'obra', programa: 'clasica', clase: 'obra', titulo: 'X', compositor: 'Anónimo', pide: ['comp:tec.sonido-clasico'],
    secciones: [{ id: 'B', titulo: 'Parte B', pide: ['comp:tec.melodia-acompanada'] }],
    fragmentos: [{ id: 'B-cejilla', titulo: 'El paso con media cejilla', seccion: 'B', compases: [2, 3], proposito: 'Aislar la media cejilla.', pide: ['comp:tec.media-cejilla'],
      notacion: { fuente: 'notacion/esc-mi-mayor-1pos.json', compases: [2, 3], principal: 'tablatura', motivo: 'Es un pasaje técnico.' } }] };
  assert.equal(seccionDe(obra, 'B-cejilla').titulo, 'El paso con media cejilla');
  assert.equal(esFragmento(obra, 'B-cejilla'), true);
  assert.equal(esFragmento(obra, 'B'), false);
  assert.deepEqual(pideDe(obra, 'B-cejilla'), ['comp:tec.sonido-clasico', 'comp:tec.media-cejilla']); // lo suyo, no toda la parte B
  assert.deepEqual(pideDe(obra), ['comp:tec.sonido-clasico', 'comp:tec.melodia-acompanada']);        // la obra entera, sin los fragmentos
  assert.deepEqual(formatos(obra, seccionDe(obra, 'B-cejilla')), { partitura: 'app', tablatura: 'app' });
  const base = entidadesReales();
  const conObra = o => validarCatalogo([...base, { ...o, archivo: 'prueba.json' }]);
  assert.deepEqual(conObra(obra), []);
  const paso = { ...base.find(e => e.id === 'paso:c1.t2.07'), contenido: ['obra:x#B-cejilla'] };
  assert.deepEqual(validarCatalogo([...base.filter(e => e.id !== paso.id), paso, { ...obra, archivo: 'p.json' }]), []); // un paso puede contener un fragmento
  assert.ok(conObra({ ...obra, fragmentos: [{ ...obra.fragmentos[0], id: 'B' }] }).some(e => /id repetido/.test(e)));
  assert.ok(conObra({ ...obra, fragmentos: [{ ...obra.fragmentos[0], seccion: 'C' }] }).some(e => /sección C no existe/.test(e)));
  assert.ok(conObra({ ...obra, fragmentos: [{ ...obra.fragmentos[0], proposito: '' }] }).some(e => /para qué es/.test(e)));
  assert.ok(conObra({ ...obra, notacion: { partitura: 'externa', vistas: ['tablatura'] } }).some(e => /«vistas» va con una notación propia/.test(e)));
});
