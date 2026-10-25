// Tabla Markdown de los planes por escenario y duración, con avisos automáticos. Uso: node tabla.mjs > tabla.md
import { ctxDe, planificar, analizar } from './comun.mjs';
import { ESCENARIOS } from './escenarios-datos.mjs';
const HOY = '2026-10-25';
const CORTO = { calentamiento: 'cal', comprobacion: 'frío', encargo: 'encargo', paso: 'paso', refuerzo: 'refuerzo', obra: 'obra', pasada: 'pasada', area: 'área', pausa: 'pausa' };
const nombre = id => (id || '').replace(/^(comp|obra|ej):/, '').replace('tarrega.lagrima', 'Lágrima').replace('sor.op60-1', 'Sor 60/1');
const celda = b => {
  const t = b.modo === 'comprobacion' && b.tipo === 'obra' ? 'pasada-comprobación' : CORTO[b.tipo] ?? b.tipo;
  const que = b.items ? b.items.map(i => nombre(i.id)).join(', ') : b.tipo === 'pausa' || b.tipo === 'calentamiento' ? '' : nombre(b.item) + (b.seccion ? ` ${b.seccion}` : '');
  const prog = b.programa === 'flamenca' && b.tipo !== 'pausa' ? 'FL ' : '';
  return `${prog}${t} ${b.minutos}${que ? ` (${que})` : ''}`;
};
console.log('| Escenario | Min | Bloques (minutos) | Avisos automáticos |\n|---|---|---|---|');
for (const [nom, { estado, eventos, programa = 'clasica' }] of Object.entries(ESCENARIOS)) {
  const ctx = ctxDe({ estado, eventos, hoy: HOY });
  for (const m of [20, 30, 60, 90]) {
    const plan = planificar(ctx, { minutos: m, programa });
    const extra = [];
    if (plan.bloques.some(b => b.item === 'obra:sor.op60-1' && b.tipo === 'obra' && b.paso)) extra.push('la «obra del tramo» es Sor (lectura)');
    const lect = plan.bloques.filter(b => b.area === 'lectura' || (b.item === 'obra:sor.op60-1' && !b.encargo)).reduce((s, b) => s + b.minutos, 0);
    if (lect >= m * 0.3) extra.push(`lectura ${lect} min`);
    console.log(`| ${nom} | ${m} | ${plan.bloques.map(celda).join(' · ')} | ${[...analizar(plan, ctx), ...extra].join('; ') || '—'} |`);
  }
}
