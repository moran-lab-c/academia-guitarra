// Utilidades de la revisión: importa la app por su ruta absoluta (solo lectura).
import fs from 'node:fs';
const APP = 'file:///C:/Users/david/The%20Cave/08%20-%20Guitarra/Academia/app/';
export const { ctxDe, practica, tanda, diagnostico, BIEN, catalogoReal, entidadesReales, enDia } = await import(APP + 'pruebas/ayuda.js');
export const { planificar } = await import(APP + 'logica/planificador.js');
export const ruta = await import(APP + 'logica/ruta.js');
export const { estadoInicial } = await import(APP + 'logica/esquema.js');
export const { calcularDominio } = await import(APP + 'logica/dominio.js');
export const LAGRIMA = 'obra:tarrega.lagrima';
export const cat = catalogoReal();
export const COMPS_T1 = ['comp:tec.sonido-clasico', 'comp:tec.presion-minima', 'comp:lec.notas-1pos-agudas', 'comp:teo.tono-semitono', 'comp:teo.escala-mayor',
  'comp:teo.triada-mayor-menor', 'comp:esc.mi-mayor-1pos', 'comp:rit.pulso', 'comp:tec.melodia-acompanada', 'comp:arm.i-iv-v7-i', 'comp:oid.mayor-menor'];
export const hecho = (id, fecha, extra = {}) => (cat.porId.get(id).criterio?.tipo === 'conocimiento'
  ? tanda({ [id]: [20, 20, 1200] }, fecha)
  : practica(id, fecha, { calidad: BIEN, pasadas: 3, min: 10, ...extra }));
export const frioOk = (id, fecha) => (cat.porId.get(id).criterio?.tipo === 'conocimiento'
  ? tanda({ [id]: [20, 20, 1200] }, fecha)
  : practica(id, fecha, { modo: 'comprobacion', enFrio: true, calidad: BIEN, pasadas: 2, min: 2 }));
export const frioMal = (id, fecha) => practica(id, fecha, { modo: 'comprobacion', enFrio: true, calidad: Object.fromEntries(Object.keys(BIEN).map(k => [k, 'mal'])), pasadas: 2, min: 2 });
export const seccion = (s, fecha, extra = {}) => practica(LAGRIMA, fecha, { seccion: s, calidad: BIEN, pasadas: 1, ayuda: 'notacion', min: 15, ...extra });
export const tramo1 = (fecha, { salvo = [], conA = true } = {}) => [...COMPS_T1.filter(c => !salvo.includes(c)).map(c => hecho(c, fecha)), ...(conA ? [seccion('A', fecha)] : [])];

export function leerDatos(dir) {
  const estado = JSON.parse(fs.readFileSync(dir + '/estado.json', 'utf8')).estado;
  const eventos = fs.readdirSync(dir + '/historial').filter(f => f.endsWith('.jsonl'))
    .flatMap(f => fs.readFileSync(dir + '/historial/' + f, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse));
  return { estado, eventos };
}

export function verRuta(ctx, programa = 'clasica') {
  const r = ctx.rutaActual(programa);
  const out = [];
  for (const t of r.tramos) out.push(`  T${t.orden} ${t.estado}${t.completo ? ' (completo)' : ''}: ` + t.pasos.map(p => `${p.numero ?? 'R'}:${p.estado}${p.insertado ? `[${p.comp.split(':')[1]}${p.porLectura ? ',lectura' : ''}]` : ''}`).join(' '));
  out.push(`  actual=${r.actual} final=${r.final?.estado}`);
  return out.join('\n');
}

const LECTURA = b => b.area === 'lectura' || (b.tipo === 'refuerzo' && b.area === 'lectura');
export function analizar(plan, ctx) {
  const p = [];
  if (plan.total !== plan.minutos) p.push(`total ${plan.total} ≠ ${plan.minutos}`);
  for (const b of plan.bloques) {
    const min = b.tipo === 'calentamiento' ? 3 : b.tipo === 'comprobacion' ? 2 : 5;
    if (b.minutos < min) p.push(`bloque de ${b.minutos} min: ${b.titulo}`);
  }
  const items = plan.bloques.filter(b => b.tipo !== 'pasada' && b.tipo !== 'pausa').flatMap(b => [b.item && (b.seccion ? `${b.item}#${b.seccion}` : b.item), ...(b.items || []).map(i => i.id)]).filter(Boolean);
  const base = items.map(x => x.split('#')[0]);
  const rep = base.filter((x, i) => base.indexOf(x) !== i);
  if (rep.length) p.push(`repetido: ${[...new Set(rep)].join(', ')}`);
  const lect = plan.bloques.filter(LECTURA);
  if (lect.length > 1) p.push(`${lect.length} bloques de lectura`);
  const util = plan.bloques.filter(b => !['calentamiento', 'pausa'].includes(b.tipo));
  const deRuta = util.filter(b => b.tipo === 'paso' || (b.tipo === 'obra' && b.paso) || b.tipo === 'refuerzo');
  if (!util.some(b => b.tipo === 'paso' || (b.tipo === 'obra' && b.paso))) p.push('sin paso ni obra de la ruta');
  const repasos = util.filter(b => b.tipo === 'comprobacion' || b.tipo === 'refuerzo' || b.modo === 'comprobacion').reduce((s, b) => s + b.minutos, 0);
  const total = util.reduce((s, b) => s + b.minutos, 0);
  if (total && repasos / total > 0.5) p.push(`repasos ${repasos}/${total} min`);
  return p;
}
export const linea = b => `${b.tipo}${b.modo ? '/' + b.modo : ''}(${b.minutos}) ${b.item ? b.item.replace(/^(comp|obra|ej):/, '') + (b.seccion ? '#' + b.seccion : '') : ''}${b.items ? '[' + b.items.map(i => i.id.replace(/^(comp|obra):/, '')).join(',') + ']' : ''}${b.paso ? ' ←' + b.paso.replace('paso:', '') : ''}`;
