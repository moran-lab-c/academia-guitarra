// Partitura y tablatura: la app recomienda, nunca quita (casos A-D de su revisión del 24/10/2026).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recomendarFormato, disponibles, avisoTecnicaLectura, textoTablatura, pasajesDeLectura, validarPartitura } from '../logica/notacion.js';
import { catalogoReal } from './ayuda.js';

const cat = catalogoReal();
// Una obra con las dos notaciones (una sola fuente da partitura y tablatura) que pide lectura 3.
const obra = { id: 'obra:x', tipo: 'obra', programa: 'clasica', notacion: { fuente: 'notacion/x.json' }, lecturaNecesaria: { nivel: 3 }, dificultad: { valor: 2 } };

test('caso A: un ejercicio de técnica se enseña en tablatura (y la partitura está si se quiere)', () => {
  const r = recomendarFormato(cat.porId.get('ej:esc.mi-mayor-1pos'), { lectura: 5, proposito: 'tecnica' });
  assert.equal(r.recomendado, 'tablatura');
  assert.equal(r.alternativa, 'partitura');
  const soloTab = recomendarFormato({ notacion: { tablatura: true } }, { lectura: 7 });
  assert.deepEqual([soloTab.recomendado, soloTab.alternativa], ['tablatura', null]);
});

test('caso B: con las dos, se puede elegir y la elección se respeta', () => {
  const r = recomendarFormato(obra, { lectura: 1, elegido: 'partitura' });
  assert.equal(r.recomendado, 'tablatura');
  assert.equal(r.mostrar, 'partitura');
  assert.equal(r.elegidoPorTi, true);
  assert.deepEqual(r.disponibles, ['partitura', 'tablatura']);
});

test('caso C: un fragmento difícil de leer puede ir en tablatura aunque la obra se recomiende en partitura', () => {
  const conSecciones = { ...obra, secciones: [{ id: 'A', lecturaNecesaria: 2 }, { id: 'B', lecturaNecesaria: 5 }] };
  assert.equal(recomendarFormato(conSecciones, { lectura: 3, tecnica: 2 }).recomendado, 'partitura');
  assert.equal(recomendarFormato(conSecciones, { lectura: 3, tecnica: 2, seccion: conSecciones.secciones[1] }).recomendado, 'tablatura');
  assert.equal(recomendarFormato(conSecciones, { lectura: 3, tecnica: 2, seccion: conSecciones.secciones[1], elegido: 'partitura' }).mostrar, 'partitura');
});

test('caso D: al mejorar la lectura cambia la recomendación, no lo que se puede ver', () => {
  for (const lectura of [0, 1, 2, 3, 5, 7]) {
    const r = recomendarFormato(obra, { lectura, tecnica: 3 });
    assert.deepEqual(r.disponibles, ['partitura', 'tablatura'], `lectura ${lectura}`);
    assert.ok(r.alternativa, `lectura ${lectura}: siempre hay alternativa`);
  }
  assert.equal(recomendarFormato(obra, { lectura: 0.5, tecnica: 3 }).recomendado, 'tablatura');
  assert.equal(recomendarFormato(obra, { lectura: 3.2, tecnica: 3 }).recomendado, 'partitura');
});

test('no es una regla fija de nivel: pesan el propósito, si ya la toca, la dificultad, el profesor y la preferencia', () => {
  assert.equal(recomendarFormato(obra, { lectura: 0.5, proposito: 'lectura' }).recomendado, 'partitura'); // bloque de lectura
  assert.equal(recomendarFormato(obra, { lectura: 7, proposito: 'tecnica' }).recomendado, 'tablatura'); // bloque de técnica
  assert.equal(recomendarFormato(obra, { lectura: 2.3, estadoItem: 'completado' }).recomendado, 'partitura'); // ya la toca: leerla enseña
  assert.equal(recomendarFormato({ ...obra, dificultad: { valor: 5 } }, { lectura: 4, tecnica: 2 }).recomendado, 'tablatura'); // le exige mucho técnicamente
  assert.equal(recomendarFormato(obra, { lectura: 5, encargo: { formato: 'tablatura' } }).recomendado, 'tablatura'); // lo dice el profesor
  assert.equal(recomendarFormato(obra, { lectura: 0, preferencia: 'partitura' }).recomendado, 'partitura'); // su preferencia
  assert.equal(recomendarFormato({ ...obra, notacion: { ...obra.notacion, principal: 'partitura', motivo: 'Es de lectura.' } }, { lectura: 0 }).recomendado, 'partitura'); // pensado para leer
});

test('lo que no hay (o está por hacer) no se ofrece, y se dice', () => {
  const lagrima = cat.porId.get('obra:tarrega.lagrima'); // partitura en IMSLP, tablatura por hacer
  assert.deepEqual(disponibles(lagrima), ['partitura']);
  assert.match(recomendarFormato(lagrima, { lectura: 0 }).motivo, /tablatura está por hacer/);
  assert.equal(recomendarFormato(cat.porId.get('ej:tec.presion-decreciente'), {}).recomendado, null); // no necesita notación
});

test('el aviso «tu técnica permite esta obra, pero tu lectura…» no quita la partitura y dice la verdad sobre la tablatura', () => {
  assert.match(avisoTecnicaLectura(obra, 1, 0.5), /te recomienda tablatura; la partitura sigue disponible/);
  assert.match(avisoTecnicaLectura(obra, 1, 0.5), /tu lectura \(0,5\)/); // decimales con coma
  // Lágrima tiene la tablatura por hacer: no se recomienda lo que no existe.
  const lagrima = avisoTecnicaLectura(cat.porId.get('obra:tarrega.lagrima'), 1, 0.5);
  assert.match(lagrima, /tablatura está por hacer/);
  assert.doesNotMatch(lagrima, /te recomienda tablatura/);
  assert.equal(avisoTecnicaLectura(cat.porId.get('obra:tarrega.lagrima'), 1, 3), null);
  assert.equal(textoTablatura(cat.porId.get('obra:sor.op60-1')), 'La tablatura está por hacer: de momento, solo partitura.');
  assert.equal(textoTablatura(obra), 'La tablatura está a un toque.');
});

test('los pasajes que ya puede leer, si tienen partitura, entran como lectura', () => {
  const o = { ...obra, secciones: [{ id: 'A', lecturaNecesaria: 1.5 }, { id: 'B', lecturaNecesaria: 3 }] };
  assert.deepEqual(pasajesDeLectura(o, 2).map(s => s.id), ['A']);
});

test('la notación propia se valida: cuerda, traste y duración de cada nota', () => {
  assert.deepEqual(validarPartitura({ compas: '4/4', compases: [{ voces: [[{ d: '8', c: 6, t: 0 }, { d: '4', s: true }, { d: '2', acorde: [{ c: 5, t: 2 }, { c: 4, t: 2 }] }]] }] }), []);
  const err = validarPartitura({ compas: '4/4', compases: [{ voces: [[{ d: '7', c: 9, t: 30 }]] }] });
  assert.equal(err.length, 3);
});
