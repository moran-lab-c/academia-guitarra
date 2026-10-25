// Utilidades de las pruebas: el catálogo real y eventos con fecha.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cargarContenido } from '../servidor/catalogo.js';
import { indexar, conPropio } from '../logica/catalogo.js';
import { estadoInicial, DIMENSIONES } from '../logica/esquema.js';
import { contexto } from '../logica/progreso.js';

const CONTENIDO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'contenido');
export const entidadesReales = () => cargarContenido(CONTENIDO).entidades;
export const catalogoReal = (estado) => indexar(conPropio(entidadesReales(), estado));
// Fase 3: los tramos 3-5 del curso 1 ya tienen contenido. Las pruebas que comprueban qué pasa con tramos en preparación
// (la ruta que espera, el curso en preparación) usan este catálogo, el de antes: esos tramos vacíos y en borrador, y sin
// lo que llegó con ellos (lo que solo usan sus pasos, salvo lo que ya existía: el arpegio p-i-m-a y los arpegios de
// Giuliani). Lo que comprueban no cambia.
const TRAMO_3_5 = /^(tramo|paso):c1\.t[345](\.|$)/;
const YA_EXISTIAN = new Set(['comp:esc.arpegio-pima', 'ej:giuliani.op1']);
export function entidadesHastaTramo2() {
  const todas = entidadesReales();
  const usos = (e, ids) => [...(e.trabaja || []), ...(e.contenido || []), ...(e.pide || []), ...(e.desarrolla || []), ...(e.requiere || []), ...(e.obraEje ? [e.obraEje] : [])]
    .forEach(k => ids.add(String(k).split('#')[0]));
  const de35 = new Set(), deFuera = new Set();
  for (const e of todas) if (['paso', 'tramo'].includes(e.tipo)) usos(e, TRAMO_3_5.test(e.id) ? de35 : deFuera);
  const tipo = new Map(todas.map(e => [e.id, e.tipo]));
  const nuevas = new Set([...de35].filter(id => ['competencia', 'ejercicio', 'obra'].includes(tipo.get(id)) && !deFuera.has(id) && !YA_EXISTIAN.has(id)));
  // Y los ejercicios que solo trabajan competencias nuevas.
  for (const e of todas) if (e.tipo === 'ejercicio' && e.trabaja?.length && e.trabaja.every(id => nuevas.has(id)) && !YA_EXISTIAN.has(e.id)) nuevas.add(e.id);
  return todas.filter(e => !(e.tipo === 'paso' && TRAMO_3_5.test(e.id)) && !nuevas.has(e.id))
    .map(e => (e.tipo === 'tramo' && TRAMO_3_5.test(e.id) ? { ...e, borrador: true, pasos: [], obraEje: undefined, porVerificar: undefined } : e));
}

// Todos los aspectos de calidad «bien» (cada criterio mira solo los suyos).
export const BIEN = Object.fromEntries(Object.keys(DIMENSIONES).filter(d => d !== 'memoria').map(d => [d, 'bien']));

let n = 0;
// Fecha 'AAAA-MM-DD' a las 18:00 hora local.
export const enDia = (fecha, hora = 18) => { const [a, m, d] = fecha.split('-').map(Number); return new Date(a, m - 1, d, hora).toISOString(); };
export const practica = (item, fecha, extra = {}) => ({ id: `e${++n}`, t: enDia(fecha, extra.hora), tipo: 'practica', item, min: 5, ...extra });
export const tanda = (resultados, fecha, hora) => ({ id: `e${++n}`, t: enDia(fecha, hora), tipo: 'bateria', resultados });
export const diagnostico = (fecha, extra) => ({ id: `e${++n}`, t: enDia(fecha), tipo: 'diagnostico', ...extra });

export function ctxDe({ estado = estadoInicial(), eventos = [], hoy = '2026-11-01', entidades = null } = {}) {
  return contexto(entidades ? indexar(conPropio(entidades, estado)) : catalogoReal(estado), estado, eventos, new Date(enDia(hoy, 12)));
}
