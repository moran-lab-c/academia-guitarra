// Reproducciones de los hallazgos de ruta y planificador. Uso: node hallazgos.mjs
import { ctxDe, planificar, estadoInicial, tramo1, frioMal, hecho, practica, BIEN, LAGRIMA, verRuta, linea, cat, ruta as R } from './comun.mjs';
const HOY = '2026-10-25';
const paso = (r, id) => r.tramos.flatMap(t => t.pasos).find(p => p.id === id);
const t = (titulo, f) => { console.log(`\n### ${titulo}`); f(); };

t('H1 · El paso 18 (aplicación en Lágrima B) sale «hecho» sin tocar la parte B: basta con la media cejilla del paso 13', () => {
  const ctx = ctxDe({ eventos: [...tramo1('2026-10-14'), hecho('comp:tec.media-cejilla', '2026-10-20')], hoy: HOY });
  const r = ctx.rutaActual('clasica');
  console.log('  paso 13:', paso(r, 'paso:c1.t2.02').estado, '· paso 18:', paso(r, 'paso:c1.t2.07').estado, '· dominio de Lágrima#B:', ctx.estadoDe(`${LAGRIMA}#B`));
  const sinA = ctxDe({ eventos: tramo1('2026-10-14', { conA: false }), hoy: HOY });
  console.log('  paso 9 (aplicación de la A) sin haber tocado nunca la A:', paso(sinA.rutaActual('clasica'), 'paso:c1.t1.09').estado, '· Lágrima#A:', sinA.estadoDe(`${LAGRIMA}#A`));
});

t('H1b · Con el fallo en frío, el 18 sale «repaso» sin haberse tocado, y el refuerzo cae entre el 18 y el 19', () => {
  const ctx = ctxDe({ eventos: [...tramo1('2026-10-14'), hecho('comp:tec.media-cejilla', '2026-10-20'), frioMal('comp:tec.media-cejilla', '2026-10-24')], hoy: HOY });
  console.log(verRuta(ctx));
  console.log('  Lágrima#B en el dominio:', ctx.estadoDe(`${LAGRIMA}#B`));
});

t('H2 · El mismo refuerzo, dos veces en la ruta (falla la melodía acompañada; la media cejilla está sin hacer)', () => {
  const ctx = ctxDe({ eventos: [...tramo1('2026-10-14'), frioMal('comp:tec.melodia-acompanada', '2026-10-24')], hoy: HOY });
  const t2 = ctx.rutaActual('clasica').tramos[1];
  const refs = t2.pasos.filter(p => p.insertado).map(p => `${p.id} (antes del ${t2.pasos[t2.pasos.indexOf(p) + 1].numero})`);
  console.log('  refuerzos del tramo 2:\n    ' + refs.join('\n    '));
  console.log(verRuta(ctx));
});

t('H3 · La obra del tramo 2 en la sesión es Sor (obra de lectura), no Lágrima B (la obra eje)', () => {
  const ctx = ctxDe({ eventos: [...tramo1('2026-10-14'), hecho('comp:tec.media-cejilla', '2026-10-20'), frioMal('comp:tec.media-cejilla', '2026-10-24')], hoy: HOY });
  console.log('  obraEje del tramo 2:', cat.porId.get('tramo:c1.t2').obraEje);
  for (const m of [20, 30, 45, 60, 90, 120]) {
    const plan = planificar(ctx, { minutos: m });
    const obra = plan.bloques.filter(b => b.tipo === 'obra' || b.tipo === 'pasada');
    console.log(`  ${m}′:`, obra.map(b => `${b.tipo} ${b.item}${b.seccion ? '#' + b.seccion : ''} «${b.paraQue}»`).join(' + ') || '(sin obra)',
      '· ¿Lágrima B?', plan.bloques.some(b => b.item === LAGRIMA && b.seccion === 'B'));
  }
  for (const m of [60, 90]) {
    const plan = planificar(ctx, { minutos: m });
    const lect = plan.bloques.filter(b => b.area === 'lectura' || b.item === 'obra:sor.op60-1');
    console.log(`  ${m}′ lectura: ${lect.map(b => `${b.tipo}(${b.minutos})`).join(' + ')} = ${lect.reduce((s, b) => s + b.minutos, 0)} min`);
  }
});

t('H3b · Tramo 1 hecho sin fallos (S2): Sor + refuerzo de lectura + pasada de Sor', () => {
  const ctx = ctxDe({ eventos: tramo1('2026-10-14'), hoy: HOY });
  const plan = planificar(ctx, { minutos: 60 });
  console.log('  60′:', plan.bloques.map(linea).join(' · '));
  const lect = plan.bloques.filter(b => b.area === 'lectura' || b.item === 'obra:sor.op60-1');
  console.log(`  lectura: ${lect.map(b => `${b.tipo}(${b.minutos})`).join(' + ')} = ${lect.reduce((s, b) => s + b.minutos, 0)} de 51 min útiles`);
});

t('H4 · «Los dos»: dos bloques de lectura (uno por programa) y lectura de pentagrama dentro del flamenco', () => {
  const ctx = ctxDe({ hoy: HOY });
  for (const m of [60, 90]) {
    const plan = planificar(ctx, { minutos: m, programa: 'ambas' });
    console.log(`  ambas ${m}′ lectura:`, plan.bloques.filter(b => b.area === 'lectura').map(b => `${b.programa}:${b.item}(${b.minutos})`).join(', '));
  }
  for (const m of [20, 30, 60, 90]) {
    const plan = planificar(ctx, { minutos: m, programa: 'flamenca' });
    console.log(`  flamenca ${m}′:`, plan.bloques.map(linea).join(' · '));
  }
});

t('H5 · Obra conocida: una pasada en frío que falla no genera ningún refuerzo; el bloque pasa a «Obra» normal', () => {
  const estado = estadoInicial(); estado.obras[LAGRIMA] = { conocida: { nivel: 'entera' } };
  const base = tramo1('2026-10-20', { conA: false });
  const falla = practica(LAGRIMA, '2026-10-24', { seccion: 'A', modo: 'comprobacion', enFrio: true, calidad: { ...BIEN, limpieza: 'mal', sonido: 'mal' }, pasadas: 1 });
  const ctx = ctxDe({ estado, eventos: [...base, falla], hoy: HOY });
  const r = ctx.rutaActual('clasica');
  const p10 = paso(r, 'paso:c1.t1.10');
  console.log('  paso 10:', p10.estado, '· conocida:', p10.conocida, '· refuerzos en la ruta:', r.tramos.flatMap(x => x.pasos).filter(p => p.insertado).map(p => p.id).join(', ') || 'ninguno');
  console.log('  Lágrima#A:', ctx.estadoDe(`${LAGRIMA}#A`), '· estadoObra:', R.estadoObra(ctx, LAGRIMA).clave);
  console.log('  necesidades de la A:', R.necesidades(ctx, LAGRIMA, 'A').pide.map(x => `${x.comp}=${x.situacion}`).join(', '));
  const plan = planificar(ctx, { minutos: 60 });
  console.log('  60′:', plan.bloques.map(linea).join(' · '));
});

t('H6 · Obra conocida: la «pasada de comprobación» de la parte A ocupa 9-15 min, y a 20′ la sesión es solo comprobar', () => {
  const estado = estadoInicial(); estado.obras[LAGRIMA] = { conocida: { nivel: 'entera' } };
  const ctx = ctxDe({ estado, eventos: tramo1('2026-10-20', { conA: false }), hoy: HOY });
  for (const m of [20, 30, 60, 90]) {
    const plan = planificar(ctx, { minutos: m });
    const b = plan.bloques.find(x => x.modo === 'comprobacion');
    console.log(`  ${m}′: pasada de comprobación ${b.minutos} min · resto:`, plan.bloques.filter(x => x !== b).map(linea).join(' · '));
  }
});

t('H7 · Alumno nuevo: la obra (Lágrima A, paso 10) se recomienda desde el primer día', () => {
  const r = ctxDe({ hoy: HOY }).rutaActual('clasica');
  console.log('  paso 7:', paso(r, 'paso:c1.t1.07').estado, '· paso 9:', paso(r, 'paso:c1.t1.09').estado, '· paso 10:', paso(r, 'paso:c1.t1.10').estado, '· requiere del 10:', JSON.stringify(cat.porId.get('paso:c1.t1.10').requiere ?? []));
  console.log('  paso 19 (Lágrima B) con el tramo 1 hecho y la media cejilla sin empezar:', paso(ctxDe({ eventos: tramo1('2026-10-14'), hoy: HOY }).rutaActual('clasica'), 'paso:c1.t2.08').estado);
  for (const m of [20, 30]) console.log(`  ${m}′:`, planificar(ctxDe({ hoy: HOY }), { minutos: m }).bloques.map(linea).join(' · '));
});

t('H8 · Comprobaciones del cierre del tramo 1: 12 vencidas, 2 al día con 20-60′ (3 con 90′)', () => {
  const ctx = ctxDe({ eventos: tramo1('2026-10-14'), hoy: HOY });
  for (const m of [20, 60, 90]) {
    const plan = planificar(ctx, { minutos: m });
    const c = plan.bloques.find(b => b.tipo === 'comprobacion');
    console.log(`  ${m}′: ${c ? c.items.map(i => i.id).join(', ') : '-'} · ${plan.avisos.join(' ')}`);
  }
});
