// Por qué una obra: si es estudiable ahora y si trabaja sus puntos actuales (apartado 9 del plan).
import { estaHecho } from './dominio.js';
import { recomendarFormato } from './notacion.js';
import { nombreDe } from './catalogo.js';

const NO_RECOMENDAR = new Set(['en-estudio', 'aprendida', 'repertorio-vivo', 'aparcada']);
const PUNTOS = { estudiable: 3, cerca: 0.5, 'sin-clasificar': -1, 'demasiado-dificil': -6 };

export function lista(nombres) {
  if (nombres.length < 2) return nombres.join('');
  return `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}`;
}

// Estudiable ahora, cerca o demasiado difícil, según su técnica y lo que pide la obra.
export function viabilidad(obra, ctx) {
  const faltan = (obra.pide || []).filter(id => !estaHecho(ctx.estadoDe(id)));
  const nombresFaltan = lista(faltan.map(id => `«${nombreDe(ctx.cat.porId.get(id))}»`));
  const dif = obra.dificultad?.valor ?? obra.nivel?.curso ?? null;
  if (dif == null) return { clase: 'sin-clasificar', faltan, motivo: 'Sin nivel todavía: no se puede saber si es estudiable.' };
  const salto = dif - (ctx.tecnica(obra.programa) + 1); // trabaja en el nivel siguiente al alcanzado
  if (salto <= 0.5 && !faltan.length) return { clase: 'estudiable', faltan, motivo: 'Estudiable ahora.' };
  if (salto <= 1.5 && faltan.length <= 2) {
    return { clase: 'cerca', faltan, motivo: faltan.length ? `Cerca: te falta ${nombresFaltan}.` : 'Cerca: está un poco por encima de tu técnica.' };
  }
  return { clase: 'demasiado-dificil', faltan, motivo: faltan.length ? `Todavía no. Necesitas ${nombresFaltan}.` : 'Todavía no: está bastante por encima de tu técnica.' };
}

// Puntos de trabajo actuales: lo de los tramos abiertos de su ruta sin dominar, lo que falló hace poco y lo que piden sus
// obras en preparación.
export function focos(ctx) {
  const f = new Map();
  for (const programa of ['clasica', 'flamenca']) {
    for (const t of ctx.rutaActual(programa)?.tramos || []) {
      if (t.estado !== 'abierto') continue;
      for (const p of t.pasos) for (const id of p.claves || []) if (ctx.cat.porId.get(id)?.tipo === 'competencia' && ctx.estadoDe(id) !== 'dominado') f.set(id, 'ruta');
    }
  }
  for (const [id, d] of ctx.dom) if (d.ultimoFrio?.res === 'no' && !f.has(id) && ctx.cat.porId.get(id)?.tipo === 'competencia') f.set(id, 'flojo');
  for (const o of ctx.cat.obras) {
    const marca = ctx.marca(o.id);
    if (marca !== 'en-preparacion' && marca !== 'objetivo-futuro') continue;
    for (const id of o.pide || []) if (!estaHecho(ctx.estadoDe(id)) && !f.has(id)) f.set(id, marca === 'en-preparacion' ? 'objetivo' : 'futuro');
  }
  return f;
}

export function recomendar(ctx, { programa = 'clasica', limite = 5 } = {}) {
  return ctx.cat.obras
    .filter(o => o.programa === programa && !NO_RECOMENDAR.has(ctx.marca(o.id)) && !estaHecho(ctx.estadoDe(o.id)))
    .map(o => explicar(o, ctx))
    .sort((a, b) => b.puntos - a.puntos || a.obra.titulo.localeCompare(b.obra.titulo))
    .slice(0, limite);
}

export function explicar(obra, ctx) {
  const v = viabilidad(obra, ctx);
  const coinciden = (obra.desarrolla || []).filter(id => ctx.focos.has(id));
  const nombres = coinciden.map(id => `«${nombreDe(ctx.cat.porId.get(id))}»`);
  const notacion = formatoPara(obra, ctx, { proposito: 'repertorio' });
  const razones = [];
  if (coinciden.length) razones.push(`Te conviene ahora porque desarrolla ${lista(nombres)}, ${coinciden.length === 1 ? 'que es uno de tus puntos' : 'que son tus puntos'} de trabajo actuales.`);
  else if (obra.desarrolla?.length) razones.push('No toca ninguno de tus puntos de trabajo actuales.');
  razones.push(v.motivo, notacion.motivo);
  return { obra, viabilidad: v, coinciden, notacion, razones, puntos: coinciden.length * 2 + PUNTOS[v.clase] };
}

// La recomendación de formato con todo lo que se sabe de él: lectura, técnica, si ya la toca, su preferencia y lo último que eligió.
export function formatoPara(item, ctx, { proposito, seccion, encargo } = {}) {
  const clave = seccion ? `${item.id}#${seccion.id}` : item.id;
  return recomendarFormato(item, {
    lectura: ctx.niveles.lectura?.efectivo ?? 0, tecnica: ctx.tecnica(item.programa === 'flamenca' ? 'flamenca' : 'clasica'),
    estadoItem: ctx.estadoDe(clave), proposito, seccion, encargo,
    preferencia: ctx.estado.preferencias?.formatoPreferido ?? null, elegido: ctx.estado.formatos?.[clave] ?? null,
  });
}
