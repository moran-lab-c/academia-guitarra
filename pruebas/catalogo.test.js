import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validarCatalogo } from '../logica/validarCatalogo.js';
import { migrar } from '../logica/migraciones.js';
import { entidadesReales } from './ayuda.js';

test('el contenido real no tiene errores', () => {
  assert.deepEqual(validarCatalogo(entidadesReales()), []);
});

test('detecta ids repetidos, referencias rotas, rutas mezcladas, círculos y datos sin naturaleza', () => {
  const base = entidadesReales();
  const con = (...extra) => validarCatalogo([...base, ...extra]);
  const comp = { id: 'comp:x', tipo: 'competencia', programa: 'comun', area: 'teoria', nivel: 1, criterio: { tipo: 'conocimiento', naturaleza: 'decision' } };
  assert.ok(con(comp, { ...comp }).some(e => e.includes('repetido')));
  assert.ok(con({ ...comp, requiere: ['comp:no-existe'] }).some(e => e.includes('referencia rota')));
  assert.ok(con({ id: 'paso:x', tipo: 'paso', programa: 'clasica', clase: 'habilidad', titulo: 'x', trabaja: ['comp:fl.picado'] }).some(e => e.includes('no puede depender')));
  assert.ok(con({ ...comp, id: 'comp:a', requiere: ['comp:b'] }, { ...comp, id: 'comp:b', requiere: ['comp:a'] }).some(e => e.includes('círculo')));
  assert.ok(con({ id: 'obra:x', tipo: 'obra', programa: 'clasica', clase: 'obra', compositor: 'X', titulo: 'Y', nivel: { curso: 2 } }).some(e => e.includes('naturaleza')));
  assert.ok(con({ ...comp, id: 'comp:y', programa: 'clasica' }).some(e => e.includes('su área')));
  const ej = { id: 'ej:x', tipo: 'ejercicio', programa: 'clasica', area: 'tecnica' };
  assert.ok(con({ ...ej, notacion: { tablatura: true, principal: 'tablatura' } }).some(e => e.includes('motivo pedagógico')));
  assert.ok(con({ ...ej, notacion: { tablatura: 'pendiente', principal: 'tablatura', motivo: 'x' } }).some(e => e.includes('no está disponible')));
  assert.ok(con({ ...comp, id: 'comp:z', criterio: { tipo: 'ejecucion', naturaleza: 'decision', dimensiones: ['velocidad'] } }).some(e => e.includes('aspecto de calidad')));
  assert.ok(con({ ...comp, id: 'comp:w', criterio: { tipo: 'ejecucion', naturaleza: 'decision', tempo: { referencia: 80, obligatorio: true, naturaleza: 'decision' } } }).some(e => e.includes('de dónde sale')));
});

test('las migraciones se aplican en orden y no se aceptan datos de una versión futura', () => {
  const pasos = { 1: d => ({ ...d, estado: { ...d.estado, nuevo: true } }), 2: d => d };
  const r = migrar({ estado: { esquema: 1 }, eventos: [] }, pasos, 3);
  assert.equal(r.estado.esquema, 3);
  assert.equal(r.estado.nuevo, true);
  assert.throws(() => migrar({ estado: { esquema: 4 }, eventos: [] }, pasos, 3), /más nueva/);
  assert.throws(() => migrar({ estado: { esquema: 1 }, eventos: [] }, {}, 2), /Falta el paso/);
});
