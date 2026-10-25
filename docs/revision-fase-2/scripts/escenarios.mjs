// «¿Qué hago hoy?» en seis escenarios y cuatro duraciones. Uso: node escenarios.mjs [--detalle]
import { ctxDe, planificar, verRuta, analizar, linea } from './comun.mjs';
import { ESCENARIOS } from './escenarios-datos.mjs';
const HOY = '2026-10-25';
const detalle = process.argv.includes('--detalle');

for (const [nombre, { estado, eventos, programa = 'clasica' }] of Object.entries(ESCENARIOS)) {
  const ctx = ctxDe({ estado, eventos, hoy: HOY });
  console.log(`\n## ${nombre}\n${verRuta(ctx)}`);
  for (const minutos of [20, 30, 60, 90]) {
    const plan = planificar(ctx, { minutos, programa });
    const problemas = analizar(plan, ctx);
    console.log(`  ${minutos}′: ${plan.bloques.map(linea).join(' · ')}`);
    if (problemas.length) console.log(`       ⚠ ${problemas.join(' | ')}`);
    if (plan.avisos.length) console.log(`       avisos: ${plan.avisos.join(' / ')}`);
    if (detalle) for (const b of plan.bloques) console.log(`         - ${b.titulo} (${b.minutos}) · ${b.paraQue}`);
  }
}
