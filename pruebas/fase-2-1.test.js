// Fase 2.1: la lógica pedagógica con las decisiones definitivas de David (25/10/2026): aplicación, refuerzos, obra eje y
// lectura, lectura que no bloquea, cola de comprobaciones, cobertura de áreas, obra final, fallos en frío por aspectos,
// repertorio mientras la ruta espera y curso en preparación. Los escenarios con «Lágrima conocida» son ficticios: sirven
// para probar el mecanismo (es la única obra con secciones en la ruta); en sus datos no está marcada como conocida.
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
const frioOk = (clave, fecha, hora) => {
  const [id, s] = clave.split('#');
  if (conocimiento(id)) return tanda({ [id]: [20, 20, 1200] }, fecha, hora);
  const obra = cat.porId.get(id).tipo === 'obra';
  return practica(id, fecha, { ...(s ? { seccion: s } : {}), modo: 'comprobacion', calidad: BIEN, pasadas: obra ? 1 : 2, ayuda: obra ? 'notacion' : 'ninguna', hora });
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

// ───────────────────────────── Aplicación (decisión 1): realizado no es aprendido ni dominado
test('Aplicación · no se da por hecha (ni en repaso) solo porque su competencia esté aprendida', () => {
  // Media cejilla aprendida, Lágrima B sin tocar: la aplicación «La media cejilla dentro de Lágrima» no está hecha.
  const base = [...tramo1('2026-10-20'), hecho('comp:tec.media-cejilla', '2026-10-21')];
  const r = ctxDe({ eventos: base, hoy: '2026-10-22' }).rutaActual('clasica');
  assert.equal(paso(r, 'paso:c1.t2.02').estado, 'hecho'); // la habilidad, sí
  const ap = paso(r, 'paso:c1.t2.07');
  assert.ok(!HECHO.includes(ap.estado), `aplicación: ${ap.estado}`);
  assert.deepEqual(ap.etapas, { realizado: false, aprendido: true, consolidado: false, dominado: false });
  assert.match(ap.detalle, /falta aplicarla en Lágrima, parte B/);
  // Tras un fallo en frío de la competencia, tampoco sale como «repaso»: nunca se ha trabajado.
  const fallo = ctxDe({ eventos: [...base, practica('comp:tec.media-cejilla', '2026-10-25', { modo: 'comprobacion', calidad: { ...BIEN, limpieza: 'mal' }, pasadas: 2 })], hoy: '2026-10-26' }).rutaActual('clasica');
  assert.equal(paso(fallo, 'paso:c1.t2.02').estado, 'repaso');
  assert.ok(!HECHO.includes(paso(fallo, 'paso:c1.t2.07').estado));
  // Basta con haber trabajado el pasaje (aunque salga con fallos)…
  const conB = ctxDe({ eventos: [...base, seccion('B', '2026-10-22', { calidad: { ...BIEN, limpieza: 'fallos' } })], hoy: '2026-10-22' }).rutaActual('clasica');
  assert.equal(paso(conB, 'paso:c1.t2.07').estado, 'hecho');
  // …o una práctica registrada para ese paso (desde su bloque de «Hoy» o desde su página).
  const conPaso = ctxDe({ eventos: [...base, hecho('comp:tec.media-cejilla', '2026-10-22', { paso: 'paso:c1.t2.07' })], hoy: '2026-10-22' }).rutaActual('clasica');
  assert.equal(paso(conPaso, 'paso:c1.t2.07').estado, 'hecho');
});

test('Aplicación · realizada (pasaje trabajado), aprendida (competencia) y consolidada son cosas distintas; si la competencia falla, vuelve el refuerzo', () => {
  // Pasaje trabajado sin haber aprendido la media cejilla: realizada, no aprendida.
  const soloPasaje = ctxDe({ eventos: [...tramo1('2026-10-20'), seccion('B', '2026-10-21', { calidad: { ...BIEN, limpieza: 'mal' } })], hoy: '2026-10-21' }).rutaActual('clasica');
  const ap = paso(soloPasaje, 'paso:c1.t2.07');
  assert.equal(ap.estado, 'hecho');
  assert.deepEqual(ap.etapas, { realizado: true, aprendido: false, consolidado: false, dominado: false });
  assert.notEqual(paso(soloPasaje, 'paso:c1.t2.02').estado, 'hecho'); // la competencia sigue por aprender en su paso
  // Con la competencia aprendida: aprendida, pero no consolidada (eso lo dicen las comprobaciones en frío).
  const base = [...tramo1('2026-10-20'), hecho('comp:tec.media-cejilla', '2026-10-21'), seccion('B', '2026-10-21')];
  assert.deepEqual(paso(ctxDe({ eventos: base, hoy: '2026-10-22' }).rutaActual('clasica'), 'paso:c1.t2.07').etapas, { realizado: true, aprendido: true, consolidado: false, dominado: false });
  const consolidada = ctxDe({ eventos: [...base, frioOk('comp:tec.media-cejilla', '2026-10-25')], hoy: '2026-10-25' }).rutaActual('clasica');
  assert.equal(paso(consolidada, 'paso:c1.t2.07').etapas.consolidado, true);
  // Si después la competencia falla en frío, la aplicación pasa a «repaso» y sale el refuerzo antes de ella.
  const falla = ctxDe({ eventos: [...base, practica('comp:tec.media-cejilla', '2026-10-25', { modo: 'comprobacion', calidad: { ...BIEN, limpieza: 'mal' }, pasadas: 2 })], hoy: '2026-10-26' }).rutaActual('clasica');
  assert.equal(paso(falla, 'paso:c1.t2.07').estado, 'repaso');
  const t2 = falla.tramos[1].pasos;
  const ref = t2.find(p => p.insertado && p.comp === 'comp:tec.media-cejilla');
  assert.ok(ref && t2.indexOf(ref) < t2.findIndex(p => p.id === 'paso:c1.t2.07'));
});

test('Aplicación · sin la de la parte A, el tramo 1 no se completa; la preparación de la obra final pide la obra entera y su competencia', () => {
  const ctx = ctxDe({ eventos: tramo1('2026-10-20', { conA: false }), hoy: '2026-10-21' });
  const r = ctx.rutaActual('clasica');
  assert.ok(!HECHO.includes(paso(r, 'paso:c1.t1.09').estado));
  assert.equal(r.tramos[0].completo, false);
  const prep = cat.porId.get('paso:c1.cierre.01');
  assert.equal(estadoPaso(ctxDe({ eventos: [hecho('comp:int.pieza-sin-parar', '2026-10-20')], hoy: '2026-10-21' }), prep).estado, 'pendiente'); // con cualquier obra, no
  assert.notEqual(estadoPaso(ctxDe({ eventos: [practica(LAGRIMA, '2026-10-20', { calidad: BIEN, pasadas: 1, ayuda: 'notacion' })], hoy: '2026-10-21' }), prep).estado, 'hecho'); // solo la obra, tampoco
  assert.equal(estadoPaso(ctxDe({ eventos: [practica(LAGRIMA, '2026-10-20', { calidad: BIEN, pasadas: 1, ayuda: 'notacion' }), hecho('comp:int.pieza-sin-parar', '2026-10-20')], hoy: '2026-10-21' }), prep).estado, 'hecho');
});

// ───────────────────────────── Refuerzos: uno por necesidad
test('Refuerzos · una misma necesidad genera un solo refuerzo, con todos sus orígenes (aplicación y obra)', () => {
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

// ───────────────────────────── Obra eje y lectura (decisión 2)
test('Obra eje · con Lágrima B y Sor pendientes, Lágrima B es la obra principal en todas las duraciones; Sor no la desplaza', () => {
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

test('Lectura · con una necesidad de lectura, la ruta manda el orden: antes de Sor, el paso de lectura que queda (las cuerdas 4-6)', () => {
  const plan = planificar(ctxDe({ eventos: tramo1('2026-10-20'), hoy: '2026-10-22' }), { minutos: 60 });
  const lectura = plan.bloques.filter(b => b.area === 'lectura');
  assert.equal(lectura.length, 1);
  assert.notEqual(lectura[0].item, SOR);
  assert.ok(lectura[0].motivos.some(m => /Hoy hace falta lectura/.test(m)));
  // Ningún refuerzo de lectura «por medio nivel»: Sor (lectura 1) está en el nivel que trabaja (1).
  assert.ok(!ctxDe({ eventos: tramo1('2026-10-20'), hoy: '2026-10-22' }).rutaActual('clasica').tramos[1].pasos.some(p => p.porLectura));
});

test('Lectura · Sor entra como recurso de lectura cuando hace falta lectura y su trabajo aporta, sin quitarle el sitio a Lágrima B', () => {
  // Las cuerdas 4-6 ya están; su lectura (0,6) no llega a la que pide Sor (1): hace falta lectura y Sor la aporta.
  const ctx = ctxDe({ eventos: [...tramo1('2026-10-20'), hecho('comp:lec.notas-1pos-graves', '2026-10-21')], hoy: '2026-10-22' });
  const plan = planificar(ctx, { minutos: 60 });
  const sor = plan.bloques.find(b => b.item === SOR);
  assert.ok(sor, plan.bloques.map(b => `${b.tipo}:${b.item}`).join(' · '));
  assert.equal(sor.tipo, 'area');
  assert.equal(sor.area, 'lectura');
  assert.match(sor.paraQue, /lectura de hoy/);
  assert.ok(plan.bloques.some(b => b.tipo === 'obra' && b.item === LAGRIMA && b.seccion === 'B'));
  assert.equal(plan.bloques.filter(b => b.area === 'lectura').length, 1);
});

test('Lectura · si la lectura está cubierta, no entra Sor (ni otra lectura) solo porque exista', () => {
  // Lectura de nivel 1 dominada (lo que desarrolla Sor) y una semana con bastante lectura.
  const dominar = c => [hecho(c, '2026-10-01'), frioOk(c, '2026-10-05'), frioOk(c, '2026-10-13')];
  const semana = ['2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25'].map(d => practica('comp:lec.notas-1pos-graves', d, { calidad: BIEN, pasadas: 3, area: 'lectura', min: 30 }));
  const ctx = ctxDe({ eventos: [...tramo1('2026-10-01'), ...dominar('comp:lec.notas-1pos-agudas'), ...dominar('comp:lec.notas-1pos-graves'), ...semana], hoy: '2026-10-26' });
  assert.ok(ctx.niveles.lectura.nivel >= 1, JSON.stringify(ctx.niveles.lectura));
  assert.equal(paso(ctx.rutaActual('clasica'), 'paso:c1.t2.06').estado, 'recomendado'); // Sor sigue en la ruta…
  for (const m of [30, 60, 90]) {
    const plan = planificar(ctx, { minutos: m });
    assert.ok(!plan.bloques.some(b => b.item === SOR), `${m}′: Sor sin necesidad`); // …pero no se mete en la sesión
    assert.ok(!plan.bloques.some(b => b.area === 'lectura' && b.tipo !== 'comprobacion'), `${m}′: lectura cubierta`);
  }
});

// ───────────────────────────── La lectura no bloquea el tramo
const cierreT2 = fecha => ['comp:arm.tono-homonimo', 'comp:tec.media-cejilla', 'comp:dia.notas-1pos', 'comp:rit.figuras-basicas', `${LAGRIMA}#B`].map(k => frioOk(k, fecha));
test('Lectura · una obra para leer pendiente no impide cerrar el tramo ni marca el «Ahora»', () => {
  const eventos = [...tramo1('2026-10-01'), ...tramo2('2026-10-02', { conSor: false }), ...cierreT2('2026-10-06')];
  const r = ctxDe({ eventos, hoy: '2026-10-07' }).rutaActual('clasica');
  assert.equal(r.tramos[1].completo, true);
  assert.equal(paso(r, 'paso:c1.t2.09').estado, 'hecho'); // el cierre no espera a Sor
  assert.equal(paso(r, 'paso:c1.t2.06').estado, 'recomendado'); // Sor sigue ahí, recomendada
  assert.notEqual(r.actual, 'paso:c1.t2.06');
  assert.equal(paso(r, 'paso:c1.t2.06').area, 'lectura');
});

test('Lectura · si un tramo exige una lectura, lo declara en sus datos («exige») y entonces sí frena', () => {
  const conExige = entidadesReales().map(e => (e.id === 'tramo:c1.t2' ? { ...e, exige: ['paso:c1.t2.06'] } : e));
  assert.deepEqual(validarCatalogo(conExige), []);
  const eventos = [...tramo1('2026-10-01'), ...tramo2('2026-10-02', { conSor: false }), ...cierreT2('2026-10-06')];
  const r = ctxCon(conExige, { eventos, hoy: '2026-10-07' }).rutaActual('clasica');
  assert.equal(r.tramos[1].completo, false);
  assert.notEqual(paso(r, 'paso:c1.t2.09').estado, 'hecho');
  const mal = entidadesReales().map(e => (e.id === 'tramo:c1.t2' ? { ...e, exige: ['paso:c1.t1.03'] } : e));
  assert.ok(validarCatalogo(mal).some(x => x.includes('no es un paso de este tramo')));
});

// Varios días de práctica registrando cada bloque como la app (una práctica con sus minutos; lo de conocimiento, además,
// con su tanda) y las comprobaciones en frío bien.
const practicarDias = (eventos, minutos, dias, desde) => {
  const evs = [...eventos], sesiones = [];
  for (let d = 0, dia = desde; d < dias; d++, dia = sumarDias(dia, 1)) {
    const plan = planificar(ctxDe({ eventos: evs, hoy: dia }), { minutos });
    let hora = 8;
    for (const b of plan.bloques.filter(x => x.tipo === 'comprobacion')) for (const x of b.items) evs.push(frioOk(x.id, dia, hora++));
    for (const b of plan.bloques.filter(x => x.item && !['comprobacion', 'pasada'].includes(x.tipo))) {
      if (conocimiento(b.item)) evs.push(tanda({ [b.item]: [20, 20, 1200] }, dia, hora));
      evs.push(practica(b.item, dia, { ...(b.seccion ? { seccion: b.seccion } : {}), calidad: BIEN, pasadas: 3, area: b.area, min: b.minutos, hora: hora++, ...(b.paso ? { paso: b.paso } : {}) }));
    }
    sesiones.push(plan);
  }
  return sesiones;
};
const peorRacha = (sesiones, falta) => sesiones.reduce(([r, peor], s) => (falta(s) ? [r + 1, Math.max(peor, r + 1)] : [0, peor]), [0, 0])[1];

test('Lectura · aunque vaya varios niveles por detrás durante semanas, no ocupa el sitio del paso actual ni deja fuera el repertorio activo o la técnica', () => {
  const minutosDe = (plan, f) => plan.bloques.filter(f).reduce((s, b) => s + b.minutos, 0);
  // Técnica y repertorio en 3 por el diagnóstico, lectura en 0: va tres niveles por detrás todo el tiempo.
  const atrasada = practicarDias([diagnostico('2026-09-25', { niveles: { tecnica: 3, repertorio: 3 } })], 30, 21, '2026-10-07');
  const corta = practicarDias([diagnostico('2026-09-25', { niveles: { tecnica: 2 } }), ...tramo1('2026-10-01')], 20, 14, '2026-10-07');
  for (const plan of [...atrasada, ...corta]) {
    assert.ok(!plan.bloques.some(b => b.area === 'lectura' && b.motivos.some(m => /Tu paso actual/.test(m))), 'un paso de lectura como paso actual');
  }
  assert.ok(peorRacha(atrasada, p => !p.bloques.some(b => b.area === 'repertorio')) <= 1, 'días seguidos sin repertorio');
  assert.ok(peorRacha(atrasada, p => minutosDe(p, b => b.area === 'lectura') > minutosDe(p, b => b.area === 'repertorio')) <= 2, 'días seguidos con más lectura que repertorio');
  const total = atrasada.reduce((s, p) => s + minutosDe(p, b => !['calentamiento', 'pausa'].includes(b.tipo)), 0);
  assert.ok(atrasada.reduce((s, p) => s + minutosDe(p, b => b.area === 'lectura'), 0) / total <= 0.2, 'la lectura no se come las sesiones');
  // Mientras la ruta espera, una lectura atrasada no deja la técnica fuera más que su margen y unos días.
  const espera = practicarDias([diagnostico('2026-09-25', { niveles: { tecnica: 2 } }), ...tramo1('2026-10-01'), hecho('comp:tec.media-cejilla', '2026-10-02'), seccion('B', '2026-10-03')], 30, 21, '2026-10-07');
  assert.ok(espera.some(p => p.avisos.some(a => /Has terminado lo disponible/.test(a))), 'llega a esperar');
  assert.ok(peorRacha(espera, p => !p.bloques.some(b => b.area === 'tecnica' && b.tipo !== 'calentamiento')) <= 7, 'días seguidos sin técnica');
});

// ───────────────────────────── Comprobaciones en frío (decisión 3): una cola con jerarquía
// Tramos 1 y 2 hechos el 1/10: el 20/10 hay muchas comprobaciones vencidas a la vez.
const muchas = () => [...tramo1('2026-10-01'), ...tramo2('2026-10-01')];
test('Comprobaciones · muchas vencidas: ninguna sesión (20, 30, 60, 90) se convierte en un examen, entran por jerarquía y lo demás sigue en la cola', () => {
  const ctx = ctxDe({ eventos: muchas(), hoy: '2026-10-20' });
  const cola = colaDeRepasos(ctx, 'clasica');
  assert.ok(cola.length >= 15, `en cola: ${cola.length}`);
  for (const [m, tope] of [[20, 4], [30, 4], [60, 4], [90, 6]]) {
    const plan = planificar(ctx, { minutos: m });
    const frio = plan.bloques.filter(b => b.tipo === 'comprobacion');
    const min = frio.reduce((s, b) => s + b.minutos, 0);
    assert.ok(min <= tope, `${m}′: ${min} min de comprobaciones`);
    assert.ok(plan.bloques.some(b => !['calentamiento', 'comprobacion', 'pausa'].includes(b.tipo)), `${m}′: queda sitio para lo demás`);
    assert.ok(plan.avisos.some(a => /comprobaciones siguen en la cola/.test(a)), `${m}′`);
    // Lo que entra va por delante en la jerarquía de lo que se queda (de 2 minutos, que también cabría).
    const ids = new Set(frio.flatMap(b => b.items.map(x => x.id)));
    const entran = cola.filter(x => ids.has(x.id)), quedan = cola.filter(x => !ids.has(x.id) && x.minutos <= 2);
    const peor = entran.at(-1), mejor = quedan[0];
    assert.ok(!mejor || peor.franja < mejor.franja || (peor.franja === mejor.franja && peor.prioridad >= mejor.prioridad), `${m}′`);
  }
});

test('Comprobaciones · pocas: entran todas, también en 20 y 30 minutos', () => {
  const ctx = ctxDe({ eventos: [hecho('comp:esc.mi-mayor-1pos', '2026-10-28')], hoy: '2026-11-01' });
  for (const m of [20, 30, 60, 90]) {
    const plan = planificar(ctx, { minutos: m });
    assert.deepEqual(plan.bloques.find(b => b.tipo === 'comprobacion')?.items.map(x => x.id), ['comp:esc.mi-mayor-1pos'], `${m}′`);
    assert.ok(!plan.avisos.some(a => /en la cola/.test(a)), `${m}′`);
  }
});

test('Comprobaciones · jerarquía: lo que necesita la obra activa, la ruta, lo que falló, lo vencido y, al final, lo que solo está a punto de olvidarse', () => {
  const eventos = [
    ...tramo1('2026-10-01'), // tramo 2 abierto; Lágrima B (obra eje) pide sonido clásico y melodía acompañada
    hecho('comp:esc.arpegio-pima', '2026-10-01'), practica('comp:esc.arpegio-pima', '2026-10-10', { modo: 'comprobacion', calidad: MAL, pasadas: 2 }), // fuera de la ruta y falló
    hecho('comp:tec.cejilla-completa', '2026-10-12'), // fuera de la ruta, vencida, sin fallo
  ];
  const cola = colaDeRepasos(ctxDe({ eventos, hoy: '2026-10-20' }), 'clasica');
  const de = id => cola.find(x => x.id === id);
  assert.equal(de('comp:tec.sonido-clasico').franja, 1);
  assert.equal(de('comp:tec.melodia-acompanada').franja, 1);
  assert.match(de('comp:tec.sonido-clasico').motivo, /lo necesita la obra que estás trabajando/);
  assert.equal(de('comp:esc.mi-mayor-1pos').franja, 2);
  assert.equal(de('comp:esc.arpegio-pima').franja, 3);
  assert.match(de('comp:esc.arpegio-pima').motivo, /falló la última vez/);
  assert.equal(de('comp:tec.cejilla-completa').franja, 4);
  const pos = id => cola.findIndex(x => x.id === id);
  assert.ok(pos('comp:tec.sonido-clasico') < pos('comp:esc.mi-mayor-1pos') && pos('comp:esc.mi-mayor-1pos') < pos('comp:esc.arpegio-pima') && pos('comp:esc.arpegio-pima') < pos('comp:tec.cejilla-completa'));
  // La ruta va antes que lo de fuera aunque esto sea más antiguo (si no lleva semanas esperando).
  const fuera = colaDeRepasos(ctxDe({ eventos: [hecho('comp:esc.mi-mayor-1pos', '2026-10-28'), hecho('comp:esc.arpegio-pima', '2026-10-15')], hoy: '2026-11-01' }), 'clasica');
  assert.deepEqual(fuera.map(x => x.id), ['comp:esc.mi-mayor-1pos', 'comp:esc.arpegio-pima']);
  // Lo que solo está a punto de olvidarse va al final.
  const casi = colaDeRepasos(ctxDe({ eventos: [hecho('comp:esc.arpegio-pima', '2026-10-20'), frioOk('comp:esc.arpegio-pima', '2026-10-24'), hecho('comp:tec.cejilla-completa', '2026-10-25')], hoy: '2026-10-30' }), 'clasica');
  assert.equal(casi.at(-1).id, 'comp:esc.arpegio-pima');
  assert.equal(casi.at(-1).franja, 5);
});

test('Comprobaciones · nada queda relegado para siempre: cada 4 semanas vencida sube una franja, y la antigüedad tiene tope', () => {
  const cola = d => colaDeRepasos(ctxDe({ eventos: [hecho('comp:tec.cejilla-completa', d)], hoy: '2026-12-31' }), 'clasica')[0];
  assert.equal(cola('2026-12-20').franja, 4);
  const un = cola('2026-11-25'); // vencida hace 33 días
  assert.equal(un.franja, 3);
  assert.match(un.motivo, /lleva más de 4 semanas esperando/);
  assert.equal(cola('2026-10-20').franja, 2); // más de 8 semanas: llega a la franja de la ruta (nunca a la 1)
  assert.equal(cola('2026-06-01').franja, 2);
  // La antigüedad suma como mucho 4 puntos.
  assert.ok(cola('2026-06-01').prioridad <= 2 + 4);
});

// Un alumno que cada día hace las comprobaciones que le propone la sesión y le salen bien.
function simularComprobaciones({ eventos, desde, dias, minutos }) {
  const evs = [...eventos];
  const porDia = [];
  let dia = desde;
  for (let d = 0; d < dias; d++, dia = sumarDias(dia, 1)) {
    const plan = planificar(ctxDe({ eventos: evs, hoy: dia }), { minutos });
    const ids = plan.bloques.filter(b => b.tipo === 'comprobacion').flatMap(b => b.items.map(x => x.id));
    porDia.push({ dia, ids, minutos: plan.bloques.filter(b => b.tipo === 'comprobacion').reduce((s, b) => s + b.minutos, 0) });
    evs.push(...ids.map(id => frioOk(id, dia)));
  }
  return porDia;
}

test('Comprobaciones · varios días: lo de la ruta entra en dos semanas, lo de fuera también llega, y ninguna sesión se pasa del tope', () => {
  const eventos = [...muchas(), hecho('comp:esc.arpegio-pima', '2026-10-15')]; // fuera de la ruta, vence el 18/10
  const vencidas = colaDeRepasos(ctxDe({ eventos, hoy: '2026-10-20' }), 'clasica').filter(x => x.vencida);
  const dias = simularComprobaciones({ eventos, desde: '2026-10-20', dias: 30, minutos: 30 });
  assert.ok(dias.every(d => d.minutos <= 4));
  for (const x of vencidas) {
    const i = dias.findIndex(d => d.ids.includes(x.id));
    assert.ok(i >= 0 && i <= (x.franja <= 2 ? 14 : 28), `${x.id} (franja ${x.franja}) tarda ${i} días`);
  }
  assert.ok(vencidas.some(x => x.id === 'comp:esc.arpegio-pima'));
});

// ───────────────────────────── Cobertura de áreas (decisión 4)
// Un mes sin teoría, oído, armonía, ritmo, mástil, escalas ni lectura: solo técnica y repertorio (media cejilla y la parte B).
function soloTecnicaYRepertorio() {
  const evs = tramo1('2026-09-20');
  for (let i = 0; i < 20; i++) {
    const d = sumarDias('2026-10-05', i);
    evs.push(practica('comp:tec.media-cejilla', d, { calidad: BIEN, pasadas: 3, min: 20, area: 'tecnica' }), seccion('B', d, { min: 20, area: 'repertorio' }));
  }
  return evs;
}
test('Cobertura · varias áreas abandonadas vuelven a aparecer en pocos días, cada una según su margen', () => {
  const evs = soloTecnicaYRepertorio();
  const primera = {};
  let dia = '2026-10-25';
  for (let d = 0; d < 7; d++, dia = sumarDias(dia, 1)) {
    const plan = planificar(ctxDe({ eventos: evs, hoy: dia }), { minutos: 60 });
    let hora = 7;
    for (const b of plan.bloques) {
      if (b.tipo === 'comprobacion') { for (const x of b.items) evs.push(frioOk(x.id, dia)); continue; }
      if (!b.item || b.tipo === 'pasada') continue;
      primera[b.area] ??= d;
      evs.push(conocimiento(b.item) ? tanda({ [b.item]: [20, 20, 1200] }, dia, hora++) : practica(b.item, dia, { ...(b.seccion ? { seccion: b.seccion } : {}), calidad: BIEN, pasadas: 3, area: b.area, min: b.minutos, hora: hora++, ...(b.paso ? { paso: b.paso } : {}) }));
    }
  }
  for (const a of ['teoria', 'oido', 'armonia', 'ritmo', 'diapason', 'escalas', 'lectura']) assert.ok(primera[a] != null && primera[a] <= 4, `${a}: ${primera[a]}`);
});

test('Cobertura · un área abandonada nunca adelanta al paso actual, a la obra principal ni a lo que necesita la obra', () => {
  // Teoría, oído y demás llevan un mes sin aparecer; con 20 minutos solo cabe una cosa: el paso actual.
  const ctx = ctxDe({ eventos: [...soloTecnicaYRepertorio().filter(e => e.seccion !== 'B'), practica('comp:tec.media-cejilla', '2026-10-24', { calidad: BIEN, pasadas: 3 })], hoy: '2026-10-25' });
  const corto = planificar(ctx, { minutos: 20 });
  const util = corto.bloques.filter(b => !['calentamiento', 'comprobacion'].includes(b.tipo));
  assert.deepEqual(util.map(b => b.tipo), ['paso']);
  assert.ok(util[0].actual);
  // Con 30 minutos, la obra principal (Lágrima B) va antes que cualquier área abandonada.
  const medio = planificar(ctx, { minutos: 30 });
  assert.ok(medio.bloques.some(b => b.tipo === 'obra' && b.seccion === 'B'));
  // Con un refuerzo abierto, el refuerzo entra antes que la cobertura.
  const conFallo = ctxDe({ eventos: [...soloTecnicaYRepertorio().filter(e => e.seccion !== 'B'), practica('comp:tec.melodia-acompanada', '2026-10-24', { modo: 'comprobacion', calidad: MAL, pasadas: 2 })], hoy: '2026-10-25' });
  const conRef = planificar(conFallo, { minutos: 45 });
  const orden = conRef.bloques.map(b => b.tipo);
  assert.ok(orden.includes('refuerzo'), orden.join(' · '));
  // Y cuando entra un área por cobertura, dice por qué.
  const largo = planificar(ctx, { minutos: 90 });
  assert.ok(largo.bloques.some(b => b.motivos?.some(m => /lleva \d+ días sin aparecer \(su margen es de \d\)/.test(m))));
});

// ───────────────────────────── Obra final y cierre del curso (decisión 5)
test('Obra final · ni una lectura inicial ni una pasada aislada la cierran; entera dos veces seguidas de memoria sí, sin exigir grabación ni consolidación', () => {
  const entera = (fecha, extra = {}) => practica(LAGRIMA, fecha, { calidad: BIEN, pasadas: 1, ayuda: 'notacion', ...extra });
  const leyendo = ctxDe({ eventos: [entera('2026-11-01')], hoy: '2026-11-01' });
  const f = leyendo.rutaActual('clasica').final;
  assert.equal(estadoObra(leyendo, LAGRIMA).clave, 'aprendida'); // primera realización, como obra
  assert.notEqual(f.estado, 'hecho');
  assert.equal(f.progreso.primera, true);
  assert.equal(f.progreso.aprendida, false);
  assert.deepEqual(f.progreso.requisitos, [{ id: 'memoria', cumplido: false, exigible: true }, { id: 'grabacion', cumplido: false, exigible: false }]);
  // «De memoria» marcado, pero leyendo: no cuenta.
  const trampa = ctxDe({ eventos: [entera('2026-11-01', { calidad: { ...BIEN, memoria: 'bien' } })], hoy: '2026-11-01' });
  assert.equal(trampa.rutaActual('clasica').final.progreso.aprendida, false);
  // Una sola pasada, aunque sea de memoria y sin fallos, es una pasada aislada: no la cierra.
  const memoria = { calidad: { ...BIEN, memoria: 'bien' }, ayuda: 'ninguna', formato: 'memoria', pasadas: 2 };
  const aislada = ctxDe({ eventos: [entera('2026-11-01', { ...memoria, pasadas: 1 })], hoy: '2026-11-01' }).rutaActual('clasica').final;
  assert.equal(aislada.progreso.aprendida, false);
  assert.notEqual(aislada.estado, 'hecho');
  // Entera dos veces seguidas de memoria, sin grabar: aprendida con requisitos (la grabación es opcional por ahora); no
  // consolidada.
  const aprendida = ctxDe({ eventos: [entera('2026-11-01', memoria)], hoy: '2026-11-01' }).rutaActual('clasica').final;
  assert.equal(aprendida.estado, 'hecho');
  assert.equal(aprendida.progreso.consolidada, false);
  // La grabación, si la hay, queda como evidencia.
  const grabada = ctxDe({ eventos: [entera('2026-11-01', { ...memoria, grabacion: true })], hoy: '2026-11-01' }).rutaActual('clasica').final;
  assert.equal(grabada.progreso.requisitos[1].cumplido, true);
  // Consolidada solo tras una comprobación en frío días después, también de memoria.
  const consolidada = ctxDe({ eventos: [entera('2026-11-01', memoria), practica(LAGRIMA, '2026-11-05', { ...memoria, modo: 'comprobacion', pasadas: 1 })], hoy: '2026-11-05' }).rutaActual('clasica').final;
  assert.equal(consolidada.progreso.consolidada, true);
  assert.equal(consolidada.progreso.dominada, false);
});

test('Obra final · con todo el curso hecho, «aprendida con requisitos» cierra el curso aunque no esté consolidada', () => {
  // Un curso 1 sin tramos en borrador (solo para esta prueba): tramos 1 y 2, cierre y obra final.
  const sinBorradores = entidadesReales().filter(e => !['tramo:c1.t3', 'tramo:c1.t4', 'tramo:c1.t5'].includes(e.id));
  const memoria = { calidad: { ...BIEN, memoria: 'bien' }, ayuda: 'ninguna', formato: 'memoria', pasadas: 2 };
  const eventos = [...tramo1('2026-10-01'), ...tramo2('2026-10-01'), ...[...COMPS_T1, `${LAGRIMA}#A`].map(k => frioOk(k, '2026-10-05')), ...cierreT2('2026-10-05'),
    hecho('comp:int.pieza-sin-parar', '2026-10-06'), practica(LAGRIMA, '2026-10-06', memoria)];
  const ctx = ctxCon(sinBorradores, { eventos, hoy: '2026-10-07' });
  const r = ctx.ruta('curso:c1');
  assert.equal(r.final.estado, 'hecho');
  assert.equal(r.final.progreso.consolidada, false);
  assert.equal(r.terminado, true); // el curso se cierra
  // El curso 2 no tiene ruta: se queda en el 1 (terminado) y lo dice.
  assert.equal(ctx.cursoActual('clasica').id, 'curso:c1');
  assert.equal(ctx.resumen.clasica.enPreparacion?.id, 'curso:c2');
  assert.equal(r.continuidad?.siguienteCurso?.id, 'curso:c2');
});

// ───────────────────────────── Fallos en frío por aspectos (decisión 6)
test('Fallos en frío · obra conocida: refuerza lo que falló, sin reiniciarla', () => {
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

test('Fallos en frío · obra no conocida (aprendida aquí) con un aspecto identificado: refuerzo de la competencia que lo trabaja', () => {
  const frioMal = seccion('A', '2026-10-24', { modo: 'comprobacion', calidad: { ...BIEN, sonido: 'mal' } });
  const r = ctxDe({ eventos: [...tramo1('2026-10-20'), frioMal], hoy: '2026-10-25' }).rutaActual('clasica');
  const obra = paso(r, 'paso:c1.t1.10');
  assert.equal(obra.estado, 'repaso');
  assert.match(obra.detalle, /La comprobación en frío falló en el sonido: se refuerza eso y se vuelve a la obra/);
  const refs = r.tramos[0].pasos.filter(p => p.insertado).map(p => p.comp);
  assert.ok(refs.includes('comp:tec.sonido-clasico') && refs.includes('comp:tec.melodia-acompanada'), refs.join(', ')); // las dos miran el sonido
  // En la sesión: el refuerzo (o, si hoy le toca, su comprobación en frío, que va antes y no se repite) y la vuelta a la
  // parte A para recuperar lo que falló.
  const plan = planificar(ctxDe({ eventos: [...tramo1('2026-10-20'), frioMal], hoy: '2026-10-25' }), { minutos: 90 });
  assert.ok(plan.bloques.some(b => (b.tipo === 'refuerzo' && b.item === 'comp:tec.sonido-clasico') || (b.tipo === 'comprobacion' && b.items.some(x => x.id === 'comp:tec.sonido-clasico'))));
  assert.ok(plan.bloques.some(b => b.tipo === 'obra' && b.seccion === 'A' && b.modo === 'recuperar'));
});

test('Fallos en frío · sin aspecto identificable no se inventa un diagnóstico: revisión general y ningún refuerzo concreto', () => {
  // Falló (todo sin valorar), pero no consta qué aspecto.
  const sinAspectos = seccion('A', '2026-10-24', { modo: 'comprobacion', calidad: {} });
  const ctx = ctxDe({ eventos: [...tramo1('2026-10-20'), sinAspectos], hoy: '2026-10-25' });
  const r = ctx.rutaActual('clasica');
  const obra = paso(r, 'paso:c1.t1.10');
  assert.equal(obra.recuperar.indeterminado, 'aspecto');
  assert.match(obra.detalle, /no consta en qué aspecto/);
  assert.ok(!r.tramos[0].pasos.some(p => p.insertado));
  const b = planificar(ctx, { minutos: 60 }).bloques.find(x => x.tipo === 'obra' && x.item === LAGRIMA && x.seccion === 'A');
  assert.match(b.titulo, /revisión general/);
  // Un aspecto conocido que ninguna competencia de la ruta trabaja (el fraseo): se dice, sin refuerzo inventado.
  const fraseo = seccion('A', '2026-10-24', { modo: 'comprobacion', calidad: { ...BIEN, fraseo: 'mal' } });
  const r2 = ctxDe({ eventos: [...tramo1('2026-10-20'), fraseo], hoy: '2026-10-25' }).rutaActual('clasica');
  assert.equal(paso(r2, 'paso:c1.t1.10').recuperar.indeterminado, 'competencia');
  assert.match(paso(r2, 'paso:c1.t1.10').detalle, /ninguna competencia de la ruta lo trabaja/);
  assert.ok(!r2.tramos[0].pasos.some(p => p.insertado));
});

// ───────────────────────────── Repertorio mientras la ruta espera (decisión 7) y curso en preparación
const finDisponible = () => [...tramo1('2026-10-01'), ...tramo2('2026-10-01'), ...[...COMPS_T1, `${LAGRIMA}#A`].map(k => frioOk(k, '2026-10-05')), ...cierreT2('2026-10-05')];
test('Curso en preparación · los niveles no le llevan a un curso sin ruta: se queda en el último que la tiene y lo dice', () => {
  const eventos = [diagnostico('2026-11-01', { niveles: { tecnica: 2 } }), practica(LAGRIMA, '2026-11-01', { calidad: BIEN, pasadas: 1 }), practica(SOR, '2026-11-01', { calidad: BIEN, pasadas: 1 })];
  const ctx = ctxDe({ eventos });
  assert.equal(ctx.resumen.clasica.porNiveles, 2);
  assert.equal(ctx.cursoActual('clasica').id, 'curso:c1');
  assert.equal(ctx.resumen.clasica.enPreparacion.id, 'curso:c2');
  const r = ctx.rutaActual('clasica');
  assert.ok(r.tramos.length > 0 && r.actual, 'sigue teniendo ruta y paso actual');
  assert.ok(planificar(ctx, { minutos: 60 }).avisos.some(a => /curso 2, que está en preparación/.test(a)));
});

test('Curso en preparación · al terminar lo disponible, la ruta lo dice y la sesión consolida (nunca vacía); también mientras esperan los cierres', () => {
  const ctx = ctxDe({ eventos: finDisponible(), hoy: '2026-10-07' });
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
  const esperando = ctxDe({ eventos: [...tramo1('2026-10-01'), ...tramo2('2026-10-01')], hoy: '2026-10-02' }).rutaActual('clasica');
  assert.equal(esperando.continuidad.motivo, 'cierres');
});

test('Repertorio en espera · entra el repertorio activo del curso (la obra final) antes que la lectura y la cobertura; Sor no es la obra por defecto', () => {
  const ctx = ctxDe({ eventos: finDisponible(), hoy: '2026-10-07' });
  for (const m of [20, 30, 60, 90]) {
    const plan = planificar(ctx, { minutos: m });
    const obras = plan.bloques.filter(b => b.tipo === 'obra');
    assert.deepEqual(obras.map(b => b.item), [LAGRIMA], `${m}′: ${obras.map(b => b.item)}`); // Lágrima completa, la obra final
    assert.equal(obras[0].modo, 'activo');
    assert.ok(!plan.bloques.some(b => b.item === SOR && b.tipo !== 'comprobacion' && b.area !== 'lectura'), `${m}′: Sor como repertorio`);
  }
  // Con la obra final ya aprendida con sus requisitos, se consolida lo aprendido del curso (no Sor).
  const memoria = { calidad: { ...BIEN, memoria: 'bien' }, ayuda: 'ninguna', formato: 'memoria', pasadas: 2 };
  const plan = planificar(ctxDe({ eventos: [...finDisponible(), practica(LAGRIMA, '2026-10-06', memoria)], hoy: '2026-10-07' }), { minutos: 60 });
  const rep = plan.bloques.find(b => b.tipo === 'obra');
  assert.ok(rep, plan.bloques.map(b => `${b.tipo}:${b.item}`).join(' · '));
  assert.equal(rep.item, LAGRIMA);
  assert.equal(rep.modo, 'mantenimiento');
});

test('Repertorio en espera · varios días: el repertorio no desaparece (tampoco el día que la obra final toca comprobarla en frío) y la lectura no se come las sesiones', () => {
  const evs = finDisponible();
  const suma = {};
  let total = 0, comprobadaYTrabajada = 0;
  let dia = '2026-10-07';
  for (let d = 0; d < 14; d++, dia = sumarDias(dia, 1)) {
    const plan = planificar(ctxDe({ eventos: evs, hoy: dia }), { minutos: 60 });
    let hora = 8;
    for (const b of plan.bloques.filter(x => x.tipo === 'comprobacion')) for (const x of b.items) evs.push(frioOk(x.id, dia, hora++));
    for (const b of plan.bloques) {
      if (['calentamiento', 'pausa', 'comprobacion'].includes(b.tipo)) continue;
      suma[b.area] = (suma[b.area] ?? 0) + b.minutos; total += b.minutos;
      if (b.item) evs.push(practica(b.item, dia, { ...(b.seccion ? { seccion: b.seccion } : {}), calidad: BIEN, pasadas: 3, area: b.area, min: b.minutos, hora: hora++ }));
    }
    const rep = plan.bloques.find(b => b.tipo === 'obra' && b.area === 'repertorio');
    assert.ok(rep, `${dia}: sin repertorio (${plan.bloques.map(b => `${b.tipo}:${b.item ?? ''}`).join(' · ')})`);
    if (plan.bloques.some(b => b.tipo === 'comprobacion' && b.items.some(x => x.id === LAGRIMA)) && rep.item === LAGRIMA) comprobadaYTrabajada++;
  }
  assert.ok(comprobadaYTrabajada > 0, 'algún día se comprueba Lágrima en frío y después se trabaja');
  assert.ok((suma.repertorio ?? 0) / total >= 0.25, `repertorio ${Math.round(100 * (suma.repertorio ?? 0) / total)} %`);
  assert.ok((suma.lectura ?? 0) / total <= 0.3, `lectura ${Math.round(100 * (suma.lectura ?? 0) / total)} %`);
});
