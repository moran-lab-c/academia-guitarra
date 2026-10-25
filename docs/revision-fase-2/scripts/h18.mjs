// H18 · «Preparar la obra final» (paso 21) se da por hecho con la competencia «pieza sin parar» en cualquier obra.
// H19 · Conocida «parcial» (solo la A): la obra entera y la obra final salen como «la conoces».
import { ctxDe, estadoInicial, practica, BIEN, LAGRIMA, ruta as R } from './comun.mjs';
const ctx = ctxDe({ eventos: [practica('comp:int.pieza-sin-parar', '2026-10-24', { calidad: BIEN, pasadas: 1, nota: 'tocando Sor' })], hoy: '2026-10-25' });
console.log('H18 paso 21:', R.estadoPaso(ctx, ctx.cat.porId.get('paso:c1.cierre.01')).estado, '· Lágrima entera:', ctx.estadoDe(LAGRIMA));
const e = estadoInicial(); e.obras[LAGRIMA] = { conocida: { nivel: 'parcial', secciones: ['A'] } };
const c2 = ctxDe({ estado: e, hoy: '2026-10-25' });
const r = c2.rutaActual('clasica');
const p = id => r.tramos.flatMap(t => t.pasos).find(x => x.id === id);
console.log('H19 estadoObra:', R.estadoObra(c2, LAGRIMA).clave, '· final.conocida:', r.final.conocida, '· paso 10 conocida:', p('paso:c1.t1.10').conocida, '· paso 19 conocida:', p('paso:c1.t2.08').conocida);
