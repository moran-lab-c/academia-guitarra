// Todo lo que se calcula a partir del catálogo, el estado y el historial: dominio, niveles, el curso de cada programa,
// su ruta y los puntos de trabajo. Lo usan la interfaz y el planificador.
import { dia, diasEntre } from './fechas.js';
import { calcularDominio } from './dominio.js';
import { nivelesPorArea, resumenPrograma } from './niveles.js';
import { focos } from './recomendador.js';
import { areaDe } from './catalogo.js';
import { rutaDelCurso, cursoActual, cursoPedido } from './ruta.js';
import { PROGRAMAS } from './esquema.js';
import { evidenciasVigentes } from './evaluacion.js';

export function contexto(cat, estado, eventos, ahora = new Date()) {
  const hoy = dia(ahora);
  const dom = calcularDominio(cat, eventos, hoy, estado.ajustes || {});
  const niveles = nivelesPorArea(cat, dom, eventos);
  const rutas = new Map();
  const ctx = {
    cat, estado, eventos, hoy, dom, niveles,
    evidencias: evidenciasVigentes(eventos), // lo que dejaron en cada competencia las obras que ya sabía tocar
    estadoDe: id => dom.get(id)?.estado ?? 'pendiente',
    // Pasos con alguna práctica registrada para ellos (evidencia de que una aplicación se ha trabajado).
    pasosPracticados: new Set(eventos.filter(ev => ev.tipo === 'practica' && ev.paso).map(ev => ev.paso)),
    marca: id => estado.obras?.[id]?.marca ?? null,
    ruta: cursoId => (rutas.has(cursoId) ? rutas.get(cursoId) : rutas.set(cursoId, rutaDelCurso(ctx, cursoId)).get(cursoId)),
    resumen: {},
  };
  ctx.tecnica = programa => niveles[programa === 'flamenca' ? 'fl-tecnica' : 'tecnica']?.nivel ?? 0;
  for (const p of PROGRAMAS) {
    const r = resumenPrograma(cat, niveles, p);
    const curso = cursoActual(ctx, p, r.porNiveles) ?? r.curso;
    // Si los niveles (o haber terminado la ruta) piden un curso que aún no tiene ruta, se queda en el último que la tiene
    // y se dice cuál está en preparación.
    const pedido = Math.min(cursoPedido(ctx, p, r.porNiveles), ctx.cat.cursos.filter(c => c.programa === p).length);
    const enPreparacion = curso && pedido > curso.numero ? ctx.cat.cursos.find(c => c.programa === p && c.numero === pedido) ?? null : null;
    ctx.resumen[p] = { ...r, curso, enPreparacion };
  }
  ctx.cursoActual = programa => ctx.resumen[programa]?.curso ?? null;
  ctx.rutaActual = programa => (ctx.cursoActual(programa) ? ctx.ruta(ctx.cursoActual(programa).id) : null);
  ctx.minutos7d = minutosPorArea(cat, eventos, hoy, 7);
  ctx.areasFlojas = areasFlojas(cat, dom, eventos, hoy, 14);
  ctx.focos = focos(ctx);
  return ctx;
}

export function minutosPorArea(cat, eventos, hoy, dias) {
  const res = {};
  for (const ev of eventos) {
    if (ev.tipo !== 'practica' || !ev.min) continue;
    const d = diasEntre(ev.t, hoy);
    if (d < 0 || d >= dias) continue;
    const area = ev.area ?? areaDe(cat.porId.get(ev.item));
    if (area) res[area] = (res[area] ?? 0) + ev.min;
  }
  return res;
}

// Áreas con un fallo en frío o una valoración baja (1-2 de 5) en los últimos días.
function areasFlojas(cat, dom, eventos, hoy, dias) {
  const s = new Set();
  for (const [id, d] of dom) {
    if (d.ultimoFrio?.res === 'no' && diasEntre(d.ultimoFrio.dia, hoy) <= dias) s.add(areaDe(cat.porId.get(id.split('#')[0])));
  }
  for (const ev of eventos) {
    if (ev.tipo === 'practica' && ev.valoracion != null && ev.valoracion <= 2 && diasEntre(ev.t, hoy) <= dias) {
      s.add(ev.area ?? areaDe(cat.porId.get(ev.item)));
    }
  }
  s.delete(null); s.delete(undefined);
  return s;
}
