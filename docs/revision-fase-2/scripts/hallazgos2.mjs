// Más reproducciones: comprobaciones que nunca llegan, salto a un curso vacío, obra final sin memoria, vida del refuerzo.
// Uso: node hallazgos2.mjs (necesita sim-fallo-60.json, que deja «node simular.mjs fallo 30 60»)
import fs from 'node:fs';
import { ctxDe, planificar, estadoInicial, tramo1, frioMal, frioOk, hecho, practica, BIEN, LAGRIMA, verRuta, linea, cat } from './comun.mjs';
const t = (titulo, f) => { console.log(`\n### ${titulo}`); f(); };
const paso = (r, id) => r.tramos.flatMap(x => x.pasos).find(p => p.id === id);

t('H9 · Lo vencido fuera de la ruta no se comprueba nunca, ni con 120′ y nada más que hacer', () => {
  const eventos = [hecho('comp:esc.arpegio-pima', '2026-09-01'), practica('comp:esc.arpegio-pima', '2026-09-05', { modo: 'comprobacion', enFrio: true, calidad: BIEN, pasadas: 2 })];
  for (const hoy of ['2026-10-25', '2026-12-25', '2027-06-01']) {
    const ctx = ctxDe({ eventos, hoy });
    const d = ctx.dom.get('comp:esc.arpegio-pima');
    const plan = planificar(ctx, { minutos: 120 });
    console.log(`  ${hoy}: estado=${d.estado} urgencia=${d.urgencia.toFixed(1)} · ¿en comprobaciones? ${plan.bloques.some(b => b.tipo === 'comprobacion' && b.items.some(i => i.id === 'comp:esc.arpegio-pima'))} · avisos: ${plan.avisos.filter(a => /repaso/.test(a)).join('')}`);
  }
  // «A punto de olvidarse» (urgencia 0,8-1) tampoco entra, ni siendo de la ruta.
  const ev2 = [hecho('comp:tec.sonido-clasico', '2026-10-01'), frioOk('comp:tec.sonido-clasico', '2026-10-04'), frioOk('comp:tec.sonido-clasico', '2026-10-11')];
  const ctx2 = ctxDe({ eventos: ev2, hoy: '2026-10-29' });
  const d2 = ctx2.dom.get('comp:tec.sonido-clasico');
  console.log(`  sonido clásico (de la ruta) urgencia=${d2.urgencia.toFixed(2)} ${d2.estado} · ¿en comprobaciones? ${planificar(ctx2, { minutos: 120 }).bloques.some(b => b.tipo === 'comprobacion')}`);
});

t('H10 · Tras el «alumno perfecto» de 30 días: salta al curso 2 (borrador, sin tramos) y se acaban las comprobaciones', () => {
  const { estado, eventos } = JSON.parse(fs.readFileSync(new URL('./sim-fallo-60.json', import.meta.url)));
  const ctx = ctxDe({ estado, eventos, hoy: '2026-11-24' });
  const r1 = ctx.ruta('curso:c1');
  console.log('  curso actual:', ctx.cursoActual('clasica').id, '· borrador:', !!ctx.cursoActual('clasica').borrador, '· tramos del curso 2:', (ctx.cat.tramosDe.get('curso:c2') || []).length);
  console.log('  niveles: técnica', ctx.niveles.tecnica.nivel, '· repertorio', ctx.niveles.repertorio.nivel, '· curso 1 terminado:', r1.terminado, '· obra final del curso 1:', r1.final.estado);
  const vencidas = [...ctx.dom].filter(([, d]) => d.urgencia >= 1).map(([id]) => id);
  console.log(`  vencidas: ${vencidas.length} (${vencidas.slice(0, 6).join(', ')}…)`);
  for (const m of [20, 60, 120]) console.log(`  ${m}′:`, planificar(ctx, { minutos: m }).bloques.map(linea).join(' · '));
});

t('H11 · La obra final cuenta como hecha con una pasada leyendo (sin memoria ni grabación)', () => {
  const ctx = ctxDe({ eventos: [practica(LAGRIMA, '2026-10-24', { calidad: BIEN, pasadas: 1, ayuda: 'notacion' })], hoy: '2026-10-25' });
  const r = ctx.rutaActual('clasica');
  console.log('  Lágrima:', ctx.estadoDe(LAGRIMA), '· final.estado:', r.final.estado, '· requisitos:', r.final.requisitos.join(', '), '· progreso:', JSON.stringify(r.progreso));
});

t('H12 · El refuerzo desaparece en cuanto la obra se completa en caliente, aunque la media cejilla siga fallada en frío', () => {
  const base = [...tramo1('2026-10-14'), hecho('comp:tec.media-cejilla', '2026-10-20'), frioMal('comp:tec.media-cejilla', '2026-10-24')];
  const obraB = practica(LAGRIMA, '2026-10-25', { seccion: 'B', calidad: BIEN, pasadas: 1, ayuda: 'notacion' });
  for (const [nombre, eventos] of [['antes', base], ['tras tocar la B una vez, leyendo', [...base, obraB]]]) {
    const ctx = ctxDe({ eventos, hoy: '2026-10-26' });
    const r = ctx.rutaActual('clasica');
    console.log(`  ${nombre}: refuerzos=${r.tramos.flatMap(x => x.pasos).filter(p => p.insertado).map(p => p.comp).join(', ') || 'ninguno'} · media cejilla=${ctx.estadoDe('comp:tec.media-cejilla')} (último frío: ${ctx.dom.get('comp:tec.media-cejilla').ultimoFrio.res}) · paso 13=${paso(r, 'paso:c1.t2.02').estado}`);
    console.log(`     60′: ${planificar(ctx, { minutos: 60 }).bloques.map(linea).join(' · ')}`);
  }
  // Y la vuelta normal: el refuerzo sale bien en frío 3 días después (27/10) → desaparece y la obra B vuelve.
  const vuelta = [...base, frioOk('comp:tec.media-cejilla', '2026-10-27')];
  const ctx = ctxDe({ eventos: vuelta, hoy: '2026-10-28' });
  const r = ctx.rutaActual('clasica');
  console.log(`  tras frío OK el 27: refuerzos=${r.tramos.flatMap(x => x.pasos).filter(p => p.insertado).map(p => p.comp).join(', ')} · paso 13=${paso(r, 'paso:c1.t2.02').estado} · paso 18=${paso(r, 'paso:c1.t2.07').estado} · paso 19=${paso(r, 'paso:c1.t2.08').estado}`);
  console.log(`     60′: ${planificar(ctx, { minutos: 60 }).bloques.map(linea).join(' · ')}`);
  // Un frío OK al día siguiente del fallo (demasiado pronto para sumar solidez) también lo quita.
  const pronto = ctxDe({ eventos: [...base, frioOk('comp:tec.media-cejilla', '2026-10-25')], hoy: '2026-10-26' });
  console.log(`  frío OK al día siguiente del fallo: solidez=${pronto.dom.get('comp:tec.media-cejilla').solidez} · refuerzo de media cejilla=${pronto.rutaActual('clasica').tramos.flatMap(x => x.pasos).some(p => p.insertado && p.comp === 'comp:tec.media-cejilla')}`);
  // ¿Cuándo le toca la comprobación de la media cejilla? Con la cola del tramo 1, se retrasa.
  const cola = ctxDe({ eventos: base, hoy: '2026-10-27' });
  const c = planificar(cola, { minutos: 60 }).bloques.find(b => b.tipo === 'comprobacion');
  console.log(`  27/10 (le toca): comprobaciones de hoy = ${c.items.map(i => i.id).join(', ')}; urgencia media cejilla=${cola.dom.get('comp:tec.media-cejilla').urgencia}`);
});

t('H13 · Paso 13 en «repaso»: el planificador no lo propone como paso; solo sale el refuerzo (y solo si cabe)', () => {
  const ctx = ctxDe({ eventos: [...tramo1('2026-10-14'), hecho('comp:tec.media-cejilla', '2026-10-20'), frioMal('comp:tec.media-cejilla', '2026-10-24')], hoy: '2026-10-25' });
  for (const m of [20, 30]) console.log(`  ${m}′:`, planificar(ctx, { minutos: m }).bloques.map(linea).join(' · '));
});
