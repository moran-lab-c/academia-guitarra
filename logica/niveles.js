// Niveles por área (apartado 3.4 del plan) y el curso que marcan en cada programa.
import { estaHecho } from './dominio.js';
import { dia } from './fechas.js';

const PESO = { dominado: 1, completado: 0.6, 'necesita-repaso': 0.6, 'en-progreso': 0.2, pendiente: 0 };
const AREAS_DE_OBRAS = { repertorio: 'clasica', 'fl-toque': 'flamenca' }; // se miden por obras, no por competencias
const NUCLEO = { clasica: ['tecnica', 'repertorio'], flamenca: ['fl-tecnica', 'fl-toque'] }; // lo que marca el curso de cada programa
const r2 = x => Math.round(x * 100) / 100;

export function nivelesPorArea(cat, dom, eventos) {
  const estadoDe = id => dom.get(id)?.estado ?? 'pendiente';
  const estimaciones = estimacionesVigentes(cat, dom, eventos);
  const res = {};
  for (const area of cat.areas) {
    const calc = AREAS_DE_OBRAS[area.id]
      ? porObras(cat, estadoDe, AREAS_DE_OBRAS[area.id], area.max)
      : porCompetencias(cat, estadoDe, area);
    const est = estimaciones[area.id];
    const estimado = est != null && est > calc.nivel;
    res[area.id] = { ...calc, nivel: estimado ? est : calc.nivel, estimado, efectivo: estimado ? est : r2(calc.nivel + calc.progreso) };
  }
  return res;
}

// Nivel N: todas las competencias de núcleo hasta N hechas y al menos el 80 % dominadas.
function porCompetencias(cat, estadoDe, area) {
  const comps = cat.competencias.filter(c => c.area === area.id && c.nucleo !== false);
  const conteo = {};
  for (const c of comps) conteo[estadoDe(c.id)] = (conteo[estadoDe(c.id)] ?? 0) + 1;
  let nivel = 0;
  for (let n = 1; n <= area.max; n++) {
    const deN = comps.filter(c => c.nivel === n).map(c => estadoDe(c.id));
    if (!deN.length) break; // sin contenido en ese nivel: no se puede confirmar más
    if (!deN.every(estaHecho) || deN.filter(e => e === 'dominado').length < 0.8 * deN.length) break;
    nivel = n;
  }
  const sig = comps.filter(c => c.nivel === nivel + 1);
  const progreso = sig.length ? Math.min(0.99, sig.reduce((s, c) => s + PESO[estadoDe(c.id)], 0) / sig.length) : 0;
  return { nivel, progreso: r2(progreso), max: area.max, conteo, total: comps.length, sinContenido: comps.length === 0 };
}

// Repertorio: nivel N cuando hay al menos dos obras de nivel N o más completadas.
function porObras(cat, estadoDe, programa, max) {
  const obras = cat.obras.filter(o => o.programa === programa && o.nivel?.curso);
  const hechas = n => obras.filter(o => o.nivel.curso >= n && estaHecho(estadoDe(o.id))).length;
  let nivel = 0;
  while (nivel < max && hechas(nivel + 1) >= 2) nivel++;
  const conteo = {};
  for (const o of obras) conteo[estadoDe(o.id)] = (conteo[estadoDe(o.id)] ?? 0) + 1;
  const todas = cat.obras.filter(o => o.programa === programa).length; // las sin clasificar cuentan como contenido, aunque no den nivel
  return { nivel, progreso: nivel < max ? r2(Math.min(0.99, hechas(nivel + 1) / 2)) : 0, max, conteo, total: obras.length, sinContenido: todas === 0 };
}

// El diagnóstico deja estimaciones por área ({ niveles: { tecnica: 2 } }). Valen hasta que una comprobación
// en frío de ese nivel o inferior falle después del diagnóstico.
function estimacionesVigentes(cat, dom, eventos) {
  const ultima = {};
  for (const ev of eventos) if (ev.tipo === 'diagnostico') for (const [area, n] of Object.entries(ev.niveles || {})) {
    if (!ultima[area] || ev.t > ultima[area].t) ultima[area] = { t: ev.t, n };
  }
  const res = {};
  for (const [area, { t, n }] of Object.entries(ultima)) {
    const desde = dia(t);
    const desmentida = cat.competencias.some(c => c.area === area && c.nivel <= n
      && dom.get(c.id)?.ultimoFrio?.res === 'no' && dom.get(c.id).ultimoFrio.dia >= desde);
    if (!desmentida) res[area] = n;
  }
  return res;
}

// El curso que marcan los niveles: la técnica y el repertorio juntos (las demás áreas no lo bajan); la referencia
// (para ver qué áreas van por detrás), el mayor de los dos. El curso actual puede ir más allá si ya terminó la ruta
// de este (ver progreso.js).
export function resumenPrograma(cat, niveles, programa) {
  const [tec, rep] = NUCLEO[programa].map(a => niveles[a]?.nivel ?? 0);
  const cursos = cat.cursos.filter(c => c.programa === programa);
  const numero = Math.min(Math.min(tec, rep) + 1, cursos.length || 1);
  return { referencia: Math.max(tec, rep), curso: cursos.find(c => c.numero === numero) ?? null, porNiveles: numero, tecnica: tec, repertorio: rep };
}
