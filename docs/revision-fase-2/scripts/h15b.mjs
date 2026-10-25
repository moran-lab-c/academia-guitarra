// H15b · Empezar un paso del tramo 2 sin requisitos (homónimos) cuando el tramo 1 está a medias: el «Ahora» salta al tramo 2.
import { ctxDe, planificar, hecho, practica, tanda, linea } from './comun.mjs';
const ev = [hecho('comp:tec.sonido-clasico', '2026-10-20'), tanda({ 'comp:arm.tono-homonimo': [5, 10, 1500] }, '2026-10-24')];
const ctx = ctxDe({ eventos: ev, hoy: '2026-10-25' });
const r = ctx.rutaActual('clasica');
console.log('T1:', r.tramos[0].estado, '· T2:', r.tramos[1].estado, '· actual:', r.actual);
console.log('60′:', planificar(ctx, { minutos: 60 }).bloques.map(linea).join(' · '));
