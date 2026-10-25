// Fase 2.1: las correcciones de lógica pedagógica de la revisión de la Fase 2 (docs/FASE-2.1-INSTRUCCIONES.md).
// Cada bloque dice el punto de las instrucciones que comprueba. Los escenarios con «Lágrima conocida» son ficticios:
// sirven para probar el mecanismo (es la única obra con secciones en la ruta); en sus datos no está marcada como conocida.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planificar, colaDeRepasos } from '../logica/planificador.js';
import { estadoPaso, estadoObra } from '../logica/ruta.js';
import { validarCatalogo } from '../logica/validarCatalogo.js';
import { indexar, conPropio } from '../logica/catalogo.js';
import { contexto } from '../logica/progreso.js';
import { estadoInicial } from '../logica/esquema.js';
import { sumarDias } from '../logica/fechas.js';
import { ctxDe, catalogoReal, entidadesReales, practica, tanda, diagnostico, enDia, BIEN } from './ayuda.js';

const cat = catalogoReal();
const LAGRIMA = 'obra:tarrega.lagrima';
const SOR = 'obra:sor.op60-1';
const MAL = Object.fromEntries(Object.keys(BIEN).map(d => [d, 'mal']));
const conocimiento = id => cat.porId.get(id.split('#')[0])?.criterio?.tipo === 'conocimiento';
const hecho = (id, fecha, extra = {}) => (conocimiento(id) ? tanda({ [id]: [20, 20, 1200] }, fecha) : practica(id, fecha, { calidad: BIEN, pasadas: 3, ...extra }));
const frioOk = (clave, fecha) => {
  const [id, s] = clave.split('#');
  if (conocimiento(id)) return tanda({ [id]: [20, 20, 1200] }, fecha);
  const obra = cat.porId.get(id).tipo === 'obra';
  return practica(id, fecha, { ...(s ? { seccion: s } : {}), modo: 'comprobacion', calidad: BIEN, pasadas: obra ? 1 : 2, ayuda: obra ? 'notacion' : 'ninguna' });
};
const seccion = (s, fecha, extra = {}) => practica(LAGRIMA, fecha, { seccion: s, calidad: BIEN, pasadas: 1, ayuda: 'notacion', ...extra });
const COMPS_T1 = ['comp:tec.sonido-clasico', 'comp:tec.presion-minima', 'comp:lec.notas-1pos-agudas', 'comp:teo.tono-semitono', 'comp:teo.escala-mayor',
  'comp:teo.triada-mayor-menor', 'comp:esc.mi-mayor-1pos', 'comp:rit.pulso', 'comp:tec.melodia-acompanada', 'comp:arm.i-iv-v7-i', 'comp:oid.mayor-menor'];
const COMPS_T2 = ['comp:arm.tono-homonimo', 'comp:tec.media-cejilla', 'comp:lec.notas-1pos-graves', 'comp:dia.notas-1pos', 'comp:rit.figuras-basicas'];
const tramo1 = (fecha, { conA = true } = {}) => [...COMPS_T1.map(c => hecho(c, fecha)), ...(conA ? [seccion('A', fecha)] : [])];
const tramo2 = (fecha, { conSor = true, conB = true } = {}) => [...COMPS_T2.map(c => hecho(c, fecha)), ...(conSor ? [practica(SOR, fecha, { calidad: BIEN, pasadas: 1, ayuda: 'notacion' })] : []), ...(conB ? [seccion('B', fecha)] : [])];
const pasos = r => r.tramos.flatMap(t => t.pasos);
const paso = (r, id) => pasos(r).find(p => p.id === id);
const HECHO = ['hecho', 'dominado', 'repaso'];
const ctxCon = (entidades, { estado = estadoInicial(), eventos = [], hoy = '2026-11-01' } = {}) => contexto(indexar(conPropio(entidades, estado)), estado, eventos, new Date(enDia(hoy, 12)));

// ───────────────────────────── 1. Paso de aplicación
test('1 · un paso de aplicación no se da por hecho (ni en repaso) solo porque su competencia esté aprendida', () => {
  // Media cejilla aprendida, Lágrima B sin tocar: la aplicación «La media cejilla dentro de Lágrima» no está hecha.
  const base = [...tramo1('2026-10-20'), hecho('comp:tec.media-cejilla', '2026-10-21')];
  const r = ctxDe({ eventos: base, hoy: '2026-10-22' }).rutaActual('clasica');
  assert.equal(paso(r, 'paso:c1.t2.02').estado, 'hecho'); // la habilidad, sí
  const ap = paso(r, 'paso:c1.t2.07');
  assert.ok(!HECHO.includes(ap.estado), `aplicación: ${ap.estado}`);
  assert.match(ap.detalle, /falta aplicarla en Lágrima, parte B/);
  // Tras un fallo en frío de la competencia, tampoco sale como «repaso»: nunca se ha hecho.
  const fallo = ctxDe({ eventos: [...base, practica('comp:tec.media-cejilla', '2026-10-25', { modo: 'comprobacion', calidad: { ...BIEN, limpieza: 'mal' }, pasadas: 2 })], hoy: '2026-10-26' }).rutaActual('clasica');
  assert.equal(paso(fallo, 'paso:c1.t2.02').estado, 'repaso');
  assert.ok(!HECHO.includes(paso(fallo, 'paso:c1.t2.07').estado));
  // Con evidencia, sí: haber trabajado la parte B…
  const conB = ctxDe({ eventos: [...base, seccion('B', '2026-10-22', { calidad: { ...BIEN, limpieza: 'fallos' } })], hoy: '2026-10-22' }).rutaActual('clasica');
  assert.equal(paso(conB, 'paso:c1.t2.07').estado, 'hecho');
  // …o una práctica registrada para ese paso (desde su bloque de «Hoy» o desde su página).
  const conPaso = ctxDe({ eventos: [...base, hecho('comp:tec.media-cejilla', '2026-10-22', { paso: 'paso:c1.t2.07' })], hoy: '2026-10-22' }).rutaActual('clasica');
  assert.equal(paso(conPaso, 'paso:c1.t2.07').estado, 'hecho');
});

test('1 · sin la aplicación de la parte A, el tramo 1 no se completa; el paso de preparación tampoco se hace sin la obra entera', () => {
  const ctx = ctxDe({ eventos: tramo1('2026-10-20', { conA: false }), hoy: '2026-10-21' });
  const r = ctx.rutaActual('clasica');
  assert.ok(!HECHO.includes(paso(r, 'paso:c1.t1.09').estado));
  assert.equal(r.tramos[0].completo, false);
  const prep = cat.porId.get('paso:c1.cierre.01');
  const conPieza = ctxDe({ eventos: [hecho('comp:int.pieza-sin-parar', '2026-10-20')], hoy: '2026-10-21' });
  assert.equal(estadoPaso(conPieza, prep).estado, 'pendiente'); // «pieza sin parar» con cualquier obra no prepara Lágrima
});

// ───────────────────────────── 2. Refuerzos duplicados
test('2 · una misma necesidad genera un solo refuerzo, con todos sus orígenes (aplicación y obra)', () => {
  const eventos = [...tramo1('2026-10-20'), practica('comp:tec.melodia-acompanada', '2026-10-25', { modo: 'comprobacion', calidad: MAL, pasadas: 2 })];
  const ctx = ctxDe({ eventos, hoy: '2026-10-26' });
  const t2 = ctx.rutaActual('clasica').tramos[1];
  const refs = t2.pasos.filter(p => p.insertado && p.comp === 'comp:tec.melodia-acompanada');
  assert.equal(refs.length, 1);
  assert.deepEqual(refs[0].origenes.map(o => o.paso), ['paso:c1.t2.07', 'paso:c1.t2.08']);
  assert.match(refs[0].detalle, /la piden la aplicación y la obra de Lágrima, parte B/);
  assert.equal(t2.pasos[t2.pasos.indexOf(refs[0]) + 1].id, 'paso:c1.t2.07'); // antes del primero que la necesita
  for (const m of [45, 60, 90]) {
    const plan = planificar(ctx, { minutos: m });
    assert.ok(plan.bloques.filter(b => b.item === 'comp:tec.melodia-acompanada' && b.tipo !== 'comprobacion').length <= 1, `${m}′`);
  }
});

// ───────────────────────────── 3. Obra del tramo frente a obra de lectura
test('3 · con Lágrima B y Sor pendientes, Lágrima B es la obra principal en todas las duraciones; Sor no la desplaza', () => {
  const ctx = ctxDe({ eventos: tramo1('2026-10-20'), hoy: '2026-10-22' });
  const r = ctx.rutaActual('clasica');
  assert.equal(r.tramos[1].obraEje, `${LAGRIMA}#B`);
  assert.equal(paso(r, 'paso:c1.t2.06').estado, 'recomendado'); // Sor pendiente…
  assert.equal(paso(r, 'paso:c1.t2.08').estado, 'recomendado'); // …y Lágrima B pendiente
  for (const m of [30, 45, 60, 90, 120]) {
    const plan = planificar(ctx, { minutos: m });
    const obras = plan.bloques.filter(b => b.tipo === 'obra');
    assert.deepEqual(obras.map(b => `${b.item}#${b.seccion}`), [`${LAGRIMA}#B`], `${m}′: ${obras.map(b => b.item)}`);
    assert.ok(!plan.bloques.some(b => b.item === SOR && b.tipo !== 'area'), `${m}′: Sor como obra`);
    assert.ok(plan.bloques.filter(b => b.area === 'lectura').length <= 1, `${m}′: una sola lectura`);
  }
});

test('3 · Sor entra como apoyo de lectura cuando corresponde (su lectura ya está cerca de lo que pide), sin quitarle el sitio a Lágrima B', () => {
  // Con las notas de las cuerdas 1-3 y 4-6 hechas, su lectura (0,6) queda a medio nivel de lo que pide Sor (1).
  const ctx = ctxDe({ eventos: [...tramo1('2026-10-20'), hecho('comp:lec.notas-1pos-graves', '2026-10-21')], hoy: '2026-10-22' });
  assert.ok(ctx.niveles.lectura.efectivo >= 0.5);
  const plan = planificar(ctx, { minutos: 60 });
  const sor = plan.bloques.find(b => b.item === SOR);
  assert.ok(sor, plan.bloques.map(b => `${b.tipo}:${b.item}`).join(' · '));
  assert.equal(sor.tipo, 'area');
  assert.equal(sor.area, 'lectura');
  assert.match(sor.paraQue, /lectura de hoy/);
  assert.ok(plan.bloques.some(b => b.tipo === 'obra' && b.item === LAGRIMA && b.seccion === 'B'));
  assert.equal(plan.bloques.filter(b => b.area === 'lectura').length, 1);
  // Mientras la lectura está lejos de lo que pide, Sor genera su refuerzo de lectura y la obra espera.
  const lejos = planificar(ctxDe({ eventos: tramo1('2026-10-20'), hoy: '2026-10-22' }), { minutos: 60 });
  assert.ok(!lejos.bloques.some(b => b.item === SOR));
});

// ───────────────────────────── 4. La lectura no bloquea el tramo
const cierreT2 = fecha => ['comp:arm.tono-homonimo', 'comp:tec.media-cejilla', 'comp:dia.notas-1pos', 'comp:rit.figuras-basicas', `${LAGRIMA}#B`].map(k => frioOk(k, fecha));
test('4 · una obra para leer pendiente no impide cerrar el tramo ni marca el «Ahora»', () => {
  const eventos = [...tramo1('2026-10-01'), ...tramo2('2026-10-02', { conSor: false }), ...cierreT2('2026-10-06')];
  const r = ctxDe({ eventos, hoy: '2026-10-07' }).rutaActual('clasica');
  const t2 = r.tramos[1];
  assert.equal(t2.completo, true);
  assert.equal(paso(r, 'paso:c1.t2.09').estado, 'hecho'); // el cierre no espera a Sor
  assert.equal(paso(r, 'paso:c1.t2.06').estado, 'recomendado'); // Sor sigue ahí, recomendada
  assert.notEqual(r.actual, 'paso:c1.t2.06');
  assert.equal(paso(r, 'paso:c1.t2.06').area, 'lectura');
});

test('4 · si un tramo exige una lectura, lo declara en sus datos («exige») y entonces sí frena', () => {
  const conExige = entidadesReales().map(e => (e.id === 'tramo:c1.t2' ? { ...e, exige: ['paso:c1.t2.06'] } : e));
  assert.deepEqual(validarCatalogo(conExige), []);
  const eventos = [...tramo1('2026-10-01'), ...tramo2('2026-10-02', { conSor: false }), ...cierreT2('2026-10-06')];
  const r = ctxCon(conExige, { eventos, hoy: '2026-10-07' }).rutaActual('clasica');
  assert.equal(r.tramos[1].completo, false);
  assert.notEqual(paso(r, 'paso:c1.t2.09').estado, 'hecho');
  const mal = entidadesReales().map(e => (e.id === 'tramo:c1.t2' ? { ...e, exige: ['paso:c1.t1.03'] } : e));
  assert.ok(validarCatalogo(mal).some(x => x.includes('no es un paso de este tramo')));
});

// ───────────────────────────── 5 y 10. Repasos y comprobaciones en frío: una cola con prioridad
// Tramos 1 y 2 hechos el 1/10: el 20/10 hay muchas comprobaciones vencidas a la vez.
const muchas = () => [...tramo1('2026-10-01'), ...tramo2('2026-10-01')];
test('5/10 · con muchas comprobaciones vencidas, ninguna sesión se convierte en un examen y lo demás sigue en la cola', () => {
  const ctx = ctxDe({ eventos: muchas(), hoy: '2026-10-20' });
  const cola = colaDeRepasos(ctx, 'clasica');
  assert.ok(cola.length >= 15, `en cola: ${cola.length}`);
  for (const [m, tope] of [[20, 4], [30, 4], [60, 4], [90, 6]]) {
    const plan = planificar(ctx, { minutos: m });
    const frio = plan.bloques.filter(b => b.tipo === 'comprobacion');
    const min = frio.reduce((s, b) => s + b.minutos, 0);
    assert.ok(min <= tope, `${m}′: ${min} min de comprobaciones`);
    assert.ok(min / m <= 0.2, `${m}′`);
    assert.ok(plan.bloques.some(b => !['calentamiento', 'comprobacion', 'pausa'].includes(b.tipo)), `${m}′: queda sitio para lo demás`);
    assert.ok(plan.avisos.some(a => /comprobaciones siguen en la cola/.test(a)), `${m}′`);
    // Entran las de más prioridad.
    const ids = frio.flatMap(b => b.items.map(x => x.id));
    const primeras = cola.filter(x => ids.includes(x.id)).map(x => x.prioridad);
    const resto = cola.filter(x => !ids.includes(x.id) && x.minutos <= 2).map(x => x.prioridad);
    assert.ok(Math.min(...primeras) >= Math.max(...resto), `${m}′: prioridades ${primeras} frente a ${resto.slice(0, 3)}`);
  }
});

test('5/10 · con pocas comprobaciones, entran todas (también en 20 minutos)', () => {
  const ctx = ctxDe({ eventos: [hecho('comp:esc.mi-mayor-1pos', '2026-10-28')], hoy: '2026-11-01' });
  for (const m of [20, 60, 90]) {
    const plan = planificar(ctx, { minutos: m });
    assert.deepEqual(plan.bloques.find(b => b.tipo === 'comprobacion')?.items.map(x => x.id), ['comp:esc.mi-mayor-1pos'], `${m}′`);
    assert.ok(!plan.avisos.some(a => /en la cola/.test(a)), `${m}′`);
  }
});

test('5/10 · la prioridad es interpretable: riesgo, relación con la ruta, lo que falló y la antigüedad', () => {
  const eventos = [
    hecho('comp:esc.mi-mayor-1pos', '2026-10-28'), // de la ruta, vencida hoy
    hecho('comp:esc.arpegio-pima', '2026-10-28'), // fuera de la ruta, vencida hoy
    hecho('comp:rit.pulso', '2026-10-20'), practica('comp:rit.pulso', '2026-10-29', { modo: 'comprobacion', calidad: MAL, pasadas: 2 }), // falló la última vez
  ];
  const cola = colaDeRepasos(ctxDe({ eventos, hoy: '2026-11-01' }), 'clasica');
  const de = id => cola.find(x => x.id === id);
  assert.ok(de('comp:esc.mi-mayor-1pos').prioridad > de('comp:esc.arpegio-pima').prioridad); // la ruta pesa
  assert.match(de('comp:rit.pulso').motivo, /falló la última vez/);
  assert.match(de('comp:esc.mi-mayor-1pos').motivo, /de tu tramo/);
  // Lo de fuera de la ruta que lleva semanas vencido acaba por delante de lo nuevo de la ruta.
  const viejo = colaDeRepasos(ctxDe({ eventos: [hecho('comp:esc.mi-mayor-1pos', '2026-10-28'), hecho('comp:esc.arpegio-pima', '2026-09-01')], hoy: '2026-11-01' }), 'clasica');
  assert.equal(viejo[0].id, 'comp:esc.arpegio-pima');
  assert.match(viejo[0].motivo, /vencida hace \d+ días/);
});

// Un alumno que cada día hace las comprobaciones que le propone la sesión y le salen bien.
function simularComprobaciones({ eventos, desde, dias, minutos }) {
  const evs = [...eventos];
  const porDia = [];
  let dia = desde;
  for (let d = 0; d < dias; d++, dia = sumarDias(dia, 1)) {
    const ctx = ctxDe({ eventos: evs, hoy: dia });
    const plan = planificar(ctx, { minutos });
    const ids = plan.bloques.filter(b => b.tipo === 'comprobacion').flatMap(b => b.items.map(x => x.id));
    porDia.push({ dia, ids, minutos: plan.bloques.filter(b => b.tipo === 'comprobacion').reduce((s, b) => s + b.minutos, 0) });
    evs.push(...ids.map(id => frioOk(id, dia)));
  }
  return porDia;
}

test('5/10 · varios días: nada queda relegado para siempre, ni lo de fuera de la ruta, y ninguna sesión se pasa del tope', () => {
  const eventos = [...muchas(), hecho('comp:esc.arpegio-pima', '2026-10-15')]; // fuera de la ruta, vence el 18/10
  const vencidasAlEmpezar = colaDeRepasos(ctxDe({ eventos, hoy: '2026-10-20' }), 'clasica').filter(x => x.vencida).map(x => x.id);
  const dias = simularComprobaciones({ eventos, desde: '2026-10-20', dias: 21, minutos: 30 });
  assert.ok(dias.every(d => d.minutos <= 4));
  for (const id of vencidasAlEmpezar) {
    const i = dias.findIndex(d => d.ids.includes(id));
    assert.ok(i >= 0 && i <= 14, `${id} tarda ${i} días`);
  }
  assert.ok(vencidasAlEmpezar.includes('comp:esc.arpegio-pima'));
});

// ───────────────────────────── 6. Obra final
test('6 · una pasada leyendo no cierra la obra final: hacen falta sus requisitos (de memoria y grabada)', () => {
  const entera = (fecha, extra = {}) => practica(LAGRIMA, fecha, { calidad: BIEN, pasadas: 1, ayuda: 'notacion', ...extra });
  const leyendo = ctxDe({ eventos: [entera('2026-11-01')], hoy: '2026-11-01' });
  const f = leyendo.rutaActual('clasica').final;
  assert.equal(estadoObra(leyendo, LAGRIMA).clave, 'aprendida'); // primera realización, como obra
  assert.notEqual(f.estado, 'hecho');
  assert.equal(f.progreso.primera, true);
  assert.equal(f.progreso.aprendida, false);
  assert.deepEqual(f.progreso.requisitos, [{ id: 'memoria', cumplido: false }, { id: 'grabacion', cumplido: false }]);
  // «De memoria» marcado, pero leyendo: no cuenta.
  const trampa = ctxDe({ eventos: [entera('2026-11-01', { calidad: { ...BIEN, memoria: 'bien' } })], hoy: '2026-11-01' });
  assert.equal(trampa.rutaActual('clasica').final.progreso.requisitos[0].cumplido, false);
  // De memoria pero sin grabar: todavía no.
  const memoria = { calidad: { ...BIEN, memoria: 'bien' }, ayuda: 'ninguna', formato: 'memoria' };
  const sinGrabar = ctxDe({ eventos: [entera('2026-11-01', memoria)], hoy: '2026-11-01' }).rutaActual('clasica').final;
  assert.equal(sinGrabar.progreso.requisitos[0].cumplido, true);
  assert.notEqual(sinGrabar.estado, 'hecho');
  // Con todo: aprendida y hecha; consolidada solo tras una comprobación en frío días después, también de memoria.
  const completa = ctxDe({ eventos: [entera('2026-11-01', { ...memoria, grabacion: true })], hoy: '2026-11-01' }).rutaActual('clasica').final;
  assert.equal(completa.estado, 'hecho');
  assert.equal(completa.progreso.consolidada, false);
  const frio = practica(LAGRIMA, '2026-11-05', { ...memoria, modo: 'comprobacion', pasadas: 1 });
  const consolidada = ctxDe({ eventos: [entera('2026-11-01', { ...memoria, grabacion: true }), frio], hoy: '2026-11-05' }).rutaActual('clasica').final;
  assert.equal(consolidada.progreso.consolidada, true);
  assert.equal(consolidada.progreso.dominada, false);
});

// ───────────────────────────── 7. Obra conocida que falla
test('7 · una obra conocida que falla la comprobación genera los refuerzos de lo que falló, sin reiniciarla', () => {
  const estado = estadoInicial();
  estado.obras[LAGRIMA] = { conocida: { nivel: 'entera' } }; // escenario ficticio
  const pasada = seccion('A', '2026-10-21', { modo: 'comprobacion', calidad: { ...BIEN, sonido: 'mal', limpieza: 'mal' } });
  const ctx = ctxDe({ estado, eventos: [...tramo1('2026-10-20', { conA: false }), pasada], hoy: '2026-10-22' });
  const r = ctx.rutaActual('clasica');
  const obra = paso(r, 'paso:c1.t1.10');
  assert.equal(obra.conocida, false); // ya se ha comprobado…
  assert.ok(!HECHO.includes(obra.estado)); // …no ha salido…
  assert.match(obra.detalle, /La conocías; la comprobación falló en la limpieza, el sonido/);
  assert.notEqual(estadoObra(ctx, LAGRIMA).clave, 'sin-empezar'); // …y no se reinicia
  const t1 = r.tramos[0].pasos;
  const ref = t1.find(p => p.insertado && p.comp === 'comp:tec.sonido-clasico');
  assert.ok(ref, t1.filter(p => p.insertado).map(p => p.comp).join(', '));
  assert.match(ref.detalle, /falló en la limpieza, el sonido/);
  assert.ok(t1.indexOf(ref) < t1.findIndex(p => p.id === 'paso:c1.t1.10'));
  const plan = planificar(ctx, { minutos: 60 });
  assert.ok(plan.bloques.some(b => b.tipo === 'refuerzo' && b.item === 'comp:tec.sonido-clasico'));
  const b = plan.bloques.find(x => x.tipo === 'obra' && x.item === LAGRIMA);
  assert.equal(b.modo, 'recuperar');
  assert.match(b.paraQue, /no se aprende de cero/);
  // Si lo que falla es la dinámica, el refuerzo es la melodía acompañada (la competencia que mira ese aspecto).
  const dinamica = seccion('A', '2026-10-21', { modo: 'comprobacion', calidad: { ...BIEN, dinamica: 'mal' } });
  const r2 = ctxDe({ estado, eventos: [...tramo1('2026-10-20', { conA: false }), dinamica], hoy: '2026-10-22' }).rutaActual('clasica');
  assert.deepEqual(r2.tramos[0].pasos.filter(p => p.insertado).map(p => p.comp), ['comp:tec.melodia-acompanada']);
});

// ───────────────────────────── 8. Curso siguiente en borrador
test('8 · los niveles no le llevan a un curso sin ruta: se queda en el último que la tiene y se dice que el siguiente está en preparación', () => {
  const eventos = [diagnostico('2026-11-01', { niveles: { tecnica: 2 } }), practica(LAGRIMA, '2026-11-01', { calidad: BIEN, pasadas: 1 }), practica(SOR, '2026-11-01', { calidad: BIEN, pasadas: 1 })];
  const ctx = ctxDe({ eventos });
  assert.equal(ctx.resumen.clasica.porNiveles, 2);
  assert.equal(ctx.cursoActual('clasica').id, 'curso:c1');
  assert.equal(ctx.resumen.clasica.enPreparacion.id, 'curso:c2');
  const r = ctx.rutaActual('clasica');
  assert.ok(r.tramos.length > 0 && r.actual, 'sigue teniendo ruta y paso actual');
  assert.ok(planificar(ctx, { minutos: 60 }).avisos.some(a => /curso 2, que está en preparación/.test(a)));
});

test('8 · al terminar lo disponible, la ruta lo dice y la sesión sigue con consolidación (nunca vacía)', () => {
  const eventos = [...tramo1('2026-10-01'), ...tramo2('2026-10-01'), ...[...COMPS_T1, `${LAGRIMA}#A`].map(k => frioOk(k, '2026-10-05')), ...cierreT2('2026-10-05')];
  const ctx = ctxDe({ eventos, hoy: '2026-10-07' });
  const r = ctx.rutaActual('clasica');
  assert.equal(r.curso.id, 'curso:c1');
  assert.equal(r.actual, null);
  assert.equal(r.continuidad.motivo, 'en-preparacion');
  assert.deepEqual(r.continuidad.tramosEnPreparacion.map(t => t.orden), [3, 4, 5]);
  assert.equal(r.continuidad.siguienteCurso.id, 'curso:c2');
  for (const m of [20, 30, 60, 90]) {
    const plan = planificar(ctx, { minutos: m });
    assert.ok(plan.avisos.some(a => /Has terminado lo disponible del curso 1; los tramos 3, 4, 5 del curso 1 y el curso 2 están en preparación/.test(a)), `${m}′`);
    assert.ok(plan.bloques.some(b => ['obra', 'area', 'refuerzo', 'comprobacion'].includes(b.tipo)), `${m}′: sesión vacía`);
  }
  assert.ok(planificar(ctx, { minutos: 60 }).bloques.some(b => b.tipo === 'obra' && b.modo === 'mantenimiento'), 'repertorio que ya toca');
  // Mientras se esperan las comprobaciones de los cierres, también lo dice.
  const esperando = ctxDe({ eventos: [...tramo1('2026-10-01'), ...tramo2('2026-10-01')], hoy: '2026-10-02' }).rutaActual('clasica');
  assert.equal(esperando.continuidad.motivo, 'cierres');
});

// ───────────────────────────── 9. Cobertura: un área importante no se queda olvidada
test('9 · el repertorio que lleva días sin aparecer sube de prioridad, sin quitar el sitio a la ruta', () => {
  const fin = [...tramo1('2026-10-01'), ...tramo2('2026-10-01'), ...[...COMPS_T1, `${LAGRIMA}#A`].map(k => frioOk(k, '2026-10-05')), ...cierreT2('2026-10-05')];
  // Repertorio tocado ayer: el mantenimiento no tiene prisa y en 30 minutos no entra.
  const ayer = planificar(ctxDe({ eventos: [...fin, seccion('B', '2026-10-19')], hoy: '2026-10-20' }), { minutos: 30 });
  assert.ok(!ayer.bloques.some(b => b.area === 'repertorio'), ayer.bloques.map(b => `${b.tipo}:${b.area}`).join(' · '));
  // Cinco días sin repertorio (pero sí otras cosas): entra, y dice por qué.
  const otras = ['comp:tec.sonido-clasico', 'comp:teo.escala-mayor'].flatMap((c, i) => [practica(c, `2026-10-1${5 + i}`, { calidad: BIEN, pasadas: 3 })]);
  const cinco = planificar(ctxDe({ eventos: [...fin, seccion('B', '2026-10-14'), ...otras], hoy: '2026-10-20' }), { minutos: 30 });
  const rep = cinco.bloques.find(b => b.area === 'repertorio');
  assert.ok(rep, cinco.bloques.map(b => `${b.tipo}:${b.area}`).join(' · '));
  assert.ok(rep.motivos.some(m => /Repertorio lleva \d+ días sin aparecer/.test(m)));
  // Con la ruta en marcha, el paso actual sigue entrando antes (20 minutos: un solo hueco).
  const conRuta = ctxDe({ eventos: [hecho('comp:tec.sonido-clasico', '2026-10-01'), practica('comp:teo.escala-mayor', '2026-10-15', { calidad: BIEN, pasadas: 3 })], hoy: '2026-10-20' });
  const corto = planificar(conRuta, { minutos: 20 });
  assert.ok(corto.bloques.some(b => b.tipo === 'paso' && b.actual));
});

test('9 · varios días con la ruta en espera: el repertorio no desaparece y la lectura no se come las sesiones', () => {
  const evs = [...tramo1('2026-10-01'), ...tramo2('2026-10-01'), ...[...COMPS_T1, `${LAGRIMA}#A`].map(k => frioOk(k, '2026-10-05')), ...cierreT2('2026-10-05')];
  const suma = {};
  let total = 0, sinRepertorio = 0, peorRacha = 0;
  let dia = '2026-10-07';
  for (let d = 0; d < 14; d++, dia = sumarDias(dia, 1)) {
    const plan = planificar(ctxDe({ eventos: evs, hoy: dia }), { minutos: 60 });
    let hora = 8;
    for (const b of plan.bloques) {
      if (['calentamiento', 'pausa', 'comprobacion'].includes(b.tipo)) continue;
      suma[b.area] = (suma[b.area] ?? 0) + b.minutos; total += b.minutos;
      if (b.item) evs.push(practica(b.item, dia, { ...(b.seccion ? { seccion: b.seccion } : {}), calidad: BIEN, pasadas: 3, area: b.area, min: b.minutos, hora: hora++ }));
    }
    for (const b of plan.bloques.filter(x => x.tipo === 'comprobacion')) for (const x of b.items) evs.push(frioOk(x.id, dia));
    sinRepertorio = plan.bloques.some(b => b.area === 'repertorio') ? 0 : sinRepertorio + 1;
    peorRacha = Math.max(peorRacha, sinRepertorio);
  }
  assert.ok(peorRacha <= 2, `días seguidos sin repertorio: ${peorRacha}`);
  assert.ok((suma.repertorio ?? 0) / total >= 0.2, `repertorio ${Math.round(100 * (suma.repertorio ?? 0) / total)} %`);
  assert.ok((suma.lectura ?? 0) / total <= 0.3, `lectura ${Math.round(100 * (suma.lectura ?? 0) / total)} %`);
});
