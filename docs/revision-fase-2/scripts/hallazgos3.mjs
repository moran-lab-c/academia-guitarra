// Lectura que frena, tramo abierto por empezar algo, determinismo, cuadre de minutos en barrido. Uso: node hallazgos3.mjs
import { ctxDe, planificar, estadoInicial, tramo1, frioMal, frioOk, hecho, practica, tanda, BIEN, LAGRIMA, verRuta, linea, cat, analizar } from './comun.mjs';
const t = (titulo, f) => { console.log(`\n### ${titulo}`); f(); };
const paso = (r, id) => r.tramos.flatMap(x => x.pasos).find(p => p.id === id);
const HOY = '2026-10-25';
const T2 = ['comp:arm.tono-homonimo', 'comp:tec.media-cejilla', 'comp:lec.notas-1pos-graves', 'comp:dia.notas-1pos', 'comp:rit.figuras-basicas'];

t('H14 · La obra para leer (Sor, paso 17) sí frena el tramo 2, aunque los pasos de lectura «no frenan»', () => {
  const base = [...tramo1('2026-10-10'), ...T2.map(c => hecho(c, '2026-10-20')), practica(LAGRIMA, '2026-10-20', { seccion: 'B', calidad: BIEN, pasadas: 1, ayuda: 'notacion' })];
  const sinSor = ctxDe({ eventos: base, hoy: HOY }).rutaActual('clasica');
  const conSor = ctxDe({ eventos: [...base, practica('obra:sor.op60-1', '2026-10-20', { calidad: BIEN, pasadas: 1, ayuda: 'notacion' })], hoy: HOY }).rutaActual('clasica');
  console.log('  paso 17: area =', cat.porId.get('paso:c1.t2.06').area, '· papel =', cat.porId.get('paso:c1.t2.06').papel);
  console.log('  sin Sor  → T2 completo:', sinSor.tramos[1].completo, '· estado del 17:', paso(sinSor, 'paso:c1.t2.06').estado, '· cierre 20:', paso(sinSor, 'paso:c1.t2.09').estado);
  console.log('  con Sor  → T2 completo:', conSor.tramos[1].completo, '· cierre 20:', paso(conSor, 'paso:c1.t2.09').estado);
  // En comparación, un paso de lectura con área (el 14, notas graves) no frena:
  const sin14 = ctxDe({ eventos: [...tramo1('2026-10-10'), ...T2.filter(c => c !== 'comp:lec.notas-1pos-graves').map(c => hecho(c, '2026-10-20')), practica(LAGRIMA, '2026-10-20', { seccion: 'B', calidad: BIEN, pasadas: 1, ayuda: 'notacion' }), practica('obra:sor.op60-1', '2026-10-20', { calidad: BIEN, pasadas: 1, ayuda: 'notacion' })], hoy: HOY }).rutaActual('clasica');
  console.log('  sin el 14 (lectura con área) → T2 completo:', sin14.tramos[1].completo);
});

t('H15 · Empezar algo del tramo 2 (p. ej., un encargo de media cejilla) abre todo el tramo 2 y le cambia el «Ahora»', () => {
  const ev = [hecho('comp:tec.sonido-clasico', '2026-10-20'), practica('comp:tec.media-cejilla', '2026-10-24', { calidad: { ...BIEN, limpieza: 'fallos' }, pasadas: 1 })];
  const ctx = ctxDe({ eventos: ev, hoy: HOY });
  const r = ctx.rutaActual('clasica');
  console.log('  T1:', r.tramos[0].estado, '· T2:', r.tramos[1].estado, '· actual:', r.actual, '· paso 2 (presión, requisito del 13):', paso(r, 'paso:c1.t1.02').estado);
  console.log('  60′:', planificar(ctx, { minutos: 60 }).bloques.map(linea).join(' · '));
});

t('H16 · Tramo elegido a mano (focos.tramo) y el de cierre no se puede elegir', () => {
  const e = estadoInicial(); e.focos = { tramo: { clasica: 'tramo:c1.t2' } };
  const r = ctxDe({ estado: e, hoy: HOY }).rutaActual('clasica');
  console.log('  elegido T2 → T2:', r.tramos[1].estado, '· actual:', r.actual);
  const e2 = estadoInicial(); e2.focos = { tramo: { clasica: 'tramo:c1.cierre' } };
  const r2 = ctxDe({ estado: e2, hoy: HOY }).rutaActual('clasica');
  console.log('  elegido cierre → cierre:', r2.tramos.at(-1).estado);
});

t('H17 · Determinismo con contextos distintos y barrido de minutos 10-150 en todos los escenarios', async () => {});
const { ESCENARIOS } = await import('./escenarios-datos.mjs');
let fallos = 0, total = 0;
for (const [nombre, { estado, eventos, programa = 'clasica' }] of Object.entries(ESCENARIOS)) {
  const a = ctxDe({ estado: structuredClone(estado), eventos: structuredClone(eventos), hoy: HOY });
  const b = ctxDe({ estado: structuredClone(estado), eventos: structuredClone(eventos).reverse(), hoy: HOY });
  for (let m = 10; m <= 150; m += 5) {
    total++;
    const pa = planificar(a, { minutos: m, programa }), pb = planificar(b, { minutos: m, programa });
    if (JSON.stringify(pa) !== JSON.stringify(pb)) { fallos++; console.log(`  no determinista: ${nombre} ${m}′`); }
    const prob = analizar(pa, a).filter(x => /total|bloque de/.test(x));
    if (prob.length) { fallos++; console.log(`  ${nombre} ${m}′: ${prob.join(' | ')}`); }
  }
}
console.log(`  ${total} planes, ${fallos} con problemas de cuadre o determinismo`);
