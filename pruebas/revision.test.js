// Revisión formal de la Fase 2: los fallos claros que se corrigieron y lo que no estaba cubierto (apertura y cierre de
// tramos, refuerzos sin duplicar y antes de la aplicación, «¿Qué hago hoy?» con varios tiempos y escenarios).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planificar, MIN_BLOQUE } from '../logica/planificador.js';
import { estadoInicial } from '../logica/esquema.js';
import { ctxDe, catalogoReal, practica, tanda, diagnostico, BIEN } from './ayuda.js';

const cat = catalogoReal();
const LAGRIMA = 'obra:tarrega.lagrima';
const SOR = 'obra:sor.op60-1';
const hecho = (id, fecha) => (cat.porId.get(id).criterio.tipo === 'conocimiento'
  ? tanda({ [id]: [20, 20, 1200] }, fecha)
  : practica(id, fecha, { calidad: BIEN, pasadas: 3 }));
const seccion = (s, fecha, extra = {}) => practica(LAGRIMA, fecha, { seccion: s, calidad: BIEN, pasadas: 1, ayuda: 'notacion', ...extra });
const COMPS_T1 = ['comp:tec.sonido-clasico', 'comp:tec.presion-minima', 'comp:lec.notas-1pos-agudas', 'comp:teo.tono-semitono', 'comp:teo.escala-mayor',
  'comp:teo.triada-mayor-menor', 'comp:esc.mi-mayor-1pos', 'comp:rit.pulso', 'comp:tec.melodia-acompanada', 'comp:arm.i-iv-v7-i', 'comp:oid.mayor-menor'];
const COMPS_T2 = ['comp:arm.tono-homonimo', 'comp:tec.media-cejilla', 'comp:lec.notas-1pos-graves', 'comp:dia.notas-1pos', 'comp:rit.figuras-basicas'];
const tramo1 = fecha => [...COMPS_T1.map(c => hecho(c, fecha)), seccion('A', fecha)];
const tramo2 = fecha => [...COMPS_T2.map(c => hecho(c, fecha)), practica(SOR, fecha, { calidad: BIEN, pasadas: 1, ayuda: 'notacion' }), seccion('B', fecha)];
const pasos = r => r.tramos.flatMap(t => t.pasos);
const paso = (r, id) => pasos(r).find(p => p.id === id);
// Media cejilla hecha y fallada en frío después: el caso de la sospecha.
const falloCejilla = () => [...tramo1('2026-10-20'), practica('comp:tec.media-cejilla', '2026-10-21', { calidad: BIEN, pasadas: 3 }),
  practica('comp:tec.media-cejilla', '2026-10-25', { modo: 'comprobacion', calidad: { ...BIEN, limpieza: 'mal' }, pasadas: 2 })];

test('tras un fallo en frío, el refuerzo va antes de la aplicación de Lágrima B (no después) y una sola vez', () => {
  const r = ctxDe({ eventos: falloCejilla(), hoy: '2026-10-26' }).rutaActual('clasica');
  const t2 = r.tramos[1].pasos;
  const refuerzos = t2.filter(p => p.insertado && p.comp === 'comp:tec.media-cejilla');
  assert.equal(refuerzos.length, 1, 'un solo refuerzo de media cejilla en el tramo');
  const i = t2.indexOf(refuerzos[0]);
  assert.equal(t2[i + 1].id, 'paso:c1.t2.07'); // antes de la aplicación, que es lo primero que la necesita
  assert.ok(t2.findIndex(p => p.id === 'paso:c1.t2.08') > i);
  assert.match(refuerzos[0].detalle, /Lágrima, parte B/); // la sección con su mayúscula
});

test('lo que pide la obra y falla no se refuerza dos veces en el mismo tramo (aplicación y obra piden lo mismo)', () => {
  // Melodía acompañada falla en frío con el tramo 2 abierto: la piden la aplicación y la obra de Lágrima B.
  const eventos = [...tramo1('2026-10-20'), practica('comp:tec.melodia-acompanada', '2026-10-25', { modo: 'comprobacion', calidad: Object.fromEntries(Object.keys(BIEN).map(d => [d, 'mal'])), pasadas: 2 })];
  const r = ctxDe({ eventos, hoy: '2026-10-26' }).rutaActual('clasica');
  const t2 = r.tramos[1];
  assert.equal(t2.estado, 'abierto');
  const ids = t2.pasos.filter(p => p.insertado).map(p => p.comp);
  assert.equal(ids.filter(c => c === 'comp:tec.melodia-acompanada').length, 1, ids.join(', '));
});

test('el refuerzo de lectura antes de Sor dice su número con coma', () => {
  const r = ctxDe({ eventos: falloCejilla(), hoy: '2026-10-26' }).rutaActual('clasica');
  const lect = r.tramos[1].pasos.find(p => p.insertado && p.porLectura);
  assert.ok(lect, 'hay refuerzo de lectura');
  assert.match(lect.detalle, /tu lectura \(0,3\)/);
});

test('apertura y cierre de tramos: visible no es recomendado, y los tramos en borrador no dejan pasar al cierre', () => {
  const ctx = ctxDe({ eventos: [...tramo1('2026-10-20'), ...tramo2('2026-10-21')], hoy: '2026-10-22' });
  const r = ctx.rutaActual('clasica');
  assert.equal(r.tramos[0].completo, true);
  assert.equal(r.tramos[1].completo, true);
  const cierre = r.tramos.find(t => t.cierre);
  assert.equal(cierre.estado, 'por-llegar'); // los tramos 3-5 están en borrador
  assert.equal(r.final.estado, 'futuro');
  assert.ok(r.tramos.slice(2, 5).every(t => t.borrador && t.total === 0));
  assert.equal(paso(r, 'paso:c1.cierre.01').estado, 'futuro');
  assert.ok(paso(r, 'paso:c1.cierre.01').href.startsWith('#/paso/')); // se ve y se puede abrir
  // Elegir un tramo lo abre aunque el anterior no esté hecho.
  const estado = estadoInicial();
  estado.focos = { tramo: { clasica: 'tramo:c1.t2' } };
  const elegido = ctxDe({ estado }).rutaActual('clasica');
  assert.equal(elegido.tramos[1].estado, 'abierto');
  assert.equal(elegido.tramos[0].estado, 'abierto');
});

test('la lectura atrasada no marca el sitio actual ni frena el tramo', () => {
  const eventos = tramo1('2026-10-20').filter(e => e.item !== 'comp:lec.notas-1pos-agudas' && !e.resultados?.['comp:lec.notas-1pos-agudas']);
  const r = ctxDe({ eventos, hoy: '2026-10-21' }).rutaActual('clasica');
  assert.equal(r.tramos[1].estado, 'abierto');
  assert.notEqual(paso(r, r.actual).area, 'lectura');
  assert.equal(paso(r, 'paso:c1.t1.03').estado, 'recomendado');
});

test('«¿Qué hago hoy?» dice lo que no cabe, sin confundirlo con «no hay»', () => {
  const ctx = ctxDe({ eventos: falloCejilla(), hoy: '2026-10-26' });
  const corto = planificar(ctx, { minutos: 20 });
  assert.ok(!corto.bloques.some(b => b.tipo === 'refuerzo'));
  assert.ok(corto.noCaben.refuerzos >= 1, JSON.stringify(corto.noCaben));
  const largo = planificar(ctx, { minutos: 60 });
  assert.ok(largo.bloques.some(b => b.tipo === 'refuerzo'));
  // Las comprobaciones críticas que no caben no se anuncian como «no urgentes».
  assert.ok(corto.avisos.every(a => !/comprobaci.*no son urgentes/.test(a)));
  if (corto.noCaben.comprobaciones) assert.ok(corto.avisos.some(a => /siguen? en la cola/.test(a)));
  assert.ok(corto.avisos.every(a => !/^1 repasos|^1 comprobaciones/.test(a))); // plurales
});

// Escenarios para buscar planes absurdos con todos los tiempos.
function escenarios() {
  const conEncargo = estadoInicial();
  conEncargo.tareasProfesor.push({ id: 't1', item: SOR, minutos: 25, hasta: '2026-11-30' });
  const conocida = estadoInicial();
  conocida.obras[LAGRIMA] = { conocida: { nivel: 'entera' } };
  const enEstudio = estadoInicial();
  enEstudio.obras['obra:tarrega.adelita'] = { marca: 'en-estudio' };
  return {
    inicio: { programa: 'clasica', ctx: ctxDe() },
    'tramo 2 con fallo': { programa: 'clasica', ctx: ctxDe({ eventos: falloCejilla(), hoy: '2026-10-26' }) },
    'encargo largo': { programa: 'clasica', ctx: ctxDe({ estado: conEncargo, eventos: tramo1('2026-10-20'), hoy: '2026-10-26' }) },
    'obra conocida': { programa: 'clasica', ctx: ctxDe({ estado: conocida, eventos: tramo1('2026-10-20').slice(0, -1), hoy: '2026-10-21' }) },
    'obra en estudio fuera de la ruta': { programa: 'clasica', ctx: ctxDe({ estado: enEstudio, eventos: tramo1('2026-10-20'), hoy: '2026-10-28' }) },
    'diagnóstico con técnica alta': { programa: 'clasica', ctx: ctxDe({ eventos: [diagnostico('2026-10-31', { niveles: { tecnica: 2 } })] }) },
    'tramo 2 hecho, cierre en borrador': { programa: 'clasica', ctx: ctxDe({ eventos: [...tramo1('2026-10-20'), ...tramo2('2026-10-21')], hoy: '2026-10-30' }) },
    flamenco: { programa: 'flamenca', ctx: ctxDe() },
    'los dos': { programa: 'ambas', ctx: ctxDe({ eventos: tramo1('2026-10-20'), hoy: '2026-10-26' }) },
  };
}

for (const [nombre, { programa, ctx }] of Object.entries(escenarios())) {
  test(`«¿Qué hago hoy?» sin planes absurdos: ${nombre} con 20, 30, 45, 60, 90 y 120 minutos`, () => {
    for (const minutos of [20, 30, 45, 60, 90, 120]) {
      const plan = planificar(ctx, { minutos, programa });
      const donde = `${nombre}, ${minutos} min: ${plan.bloques.map(b => `${b.tipo}:${b.item ?? ''}:${b.minutos}`).join(' | ')}`;
      assert.equal(plan.total, minutos, donde);
      assert.equal(plan.bloques.reduce((s, b) => s + b.minutos, 0), minutos, donde);
      assert.equal(new Set(plan.bloques.map(b => b.id)).size, plan.bloques.length, donde);
      for (const b of plan.bloques) {
        assert.ok(b.minutos > 0, `bloque sin minutos · ${donde}`);
        if (!['calentamiento', 'comprobacion'].includes(b.tipo)) assert.ok(b.minutos >= MIN_BLOQUE, `bloque de ${b.minutos} min · ${donde}`);
        assert.ok(typeof b.paraQue === 'string' && b.paraQue.length > 0, `bloque sin para qué · ${donde}`);
      }
      // Nada se trabaja dos veces en la misma sesión (la pasada es la segunda mitad de su obra).
      const trabajo = plan.bloques.filter(b => b.item && !['pasada', 'comprobacion'].includes(b.tipo)).map(b => `${b.item}#${b.seccion ?? ''}`);
      assert.equal(new Set(trabajo).size, trabajo.length, `repetido · ${donde}`);
      // Las comprobaciones en frío no se comen la sesión: como mucho 6 minutos, y al principio.
      const frio = plan.bloques.filter(b => b.tipo === 'comprobacion');
      assert.ok(frio.every(b => b.minutos <= (minutos >= 90 ? 6 : 4)), donde);
      const pos = t => plan.bloques.findIndex(b => b.tipo === t);
      if (pos('comprobacion') >= 0) assert.ok(plan.bloques.slice(0, pos('comprobacion')).every(b => b.tipo === 'calentamiento' || b.tipo === 'encargo' || b.programa !== frio[0].programa), donde);
      // Una pasada solo existe con su obra, y va después.
      for (const p of plan.bloques.filter(b => b.tipo === 'pasada')) {
        const obra = plan.bloques.findIndex(b => b.tipo === 'obra' && b.item === p.item && b.seccion === p.seccion);
        assert.ok(obra >= 0 && obra < plan.bloques.indexOf(p), `pasada sin su obra · ${donde}`);
      }
      // Las pausas solo en sesiones largas y nunca al final.
      if (minutos < 90) assert.ok(!plan.bloques.some(b => b.tipo === 'pausa'), donde);
      assert.notEqual(plan.bloques.at(-1).tipo, 'pausa', donde);
      // Siempre hay algo de la ruta o de repertorio (salvo que un encargo llene una sesión corta).
      const util = plan.bloques.some(b => ['paso', 'obra', 'encargo', 'refuerzo', 'area'].includes(b.tipo));
      assert.ok(util, `sesión sin contenido · ${donde}`);
      // El panel de «cómo se ha hecho» tiene sus datos.
      assert.ok(plan.noCaben && Object.values(plan.noCaben).every(v => Number.isInteger(v) && v >= 0), donde);
    }
  });
}
