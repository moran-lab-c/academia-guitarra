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

// Todos los aspectos de calidad «bien» (cada criterio mira solo los suyos).
export const BIEN = Object.fromEntries(Object.keys(DIMENSIONES).filter(d => d !== 'memoria').map(d => [d, 'bien']));

let n = 0;
// Fecha 'AAAA-MM-DD' a las 18:00 hora local.
export const enDia = (fecha, hora = 18) => { const [a, m, d] = fecha.split('-').map(Number); return new Date(a, m - 1, d, hora).toISOString(); };
export const practica = (item, fecha, extra = {}) => ({ id: `e${++n}`, t: enDia(fecha, extra.hora), tipo: 'practica', item, min: 5, ...extra });
export const tanda = (resultados, fecha, hora) => ({ id: `e${++n}`, t: enDia(fecha, hora), tipo: 'bateria', resultados });
export const diagnostico = (fecha, extra) => ({ id: `e${++n}`, t: enDia(fecha), tipo: 'diagnostico', ...extra });

export function ctxDe({ estado = estadoInicial(), eventos = [], hoy = '2026-11-01' } = {}) {
  return contexto(catalogoReal(estado), estado, eventos, new Date(enDia(hoy, 12)));
}
