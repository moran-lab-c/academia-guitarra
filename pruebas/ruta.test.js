// Fase 2: programas, cursos, la ruta de cada curso (tramos y pasos), las relaciones ruta ↔ obra, los refuerzos, las obras
// que ya conocía, la lectura que no frena y «¿Qué hago hoy?» con el orden aprobado el 25/10/2026.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validarCatalogo } from '../logica/validarCatalogo.js';
import { necesidades, relacionesPaso, estadoObra, obraEnRutas } from '../logica/ruta.js';
import { planificar } from '../logica/planificador.js';
import { formatoPara } from '../logica/recomendador.js';
import { migrar } from '../logica/migraciones.js';
import { estadoInicial, validarEstado, ESQUEMA } from '../logica/esquema.js';
import { ctxDe, entidadesReales, catalogoReal, practica, tanda, diagnostico, BIEN } from './ayuda.js';

const cat = catalogoReal();
const LAGRIMA = 'obra:tarrega.lagrima';
// Hecho una vez, como pida su criterio (una tanda corregida por la app o una práctica bien).
const hecho = (id, fecha) => (cat.porId.get(id).criterio.tipo === 'conocimiento'
  ? tanda({ [id]: [20, 20, 1200] }, fecha)
  : practica(id, fecha, { calidad: BIEN, pasadas: 3 }));
const seccion = (s, fecha, extra = {}) => practica(LAGRIMA, fecha, { seccion: s, calidad: BIEN, pasadas: 1, ayuda: 'notacion', ...extra });
const COMPS_T1 = ['comp:tec.sonido-clasico', 'comp:tec.presion-minima', 'comp:lec.notas-1pos-agudas', 'comp:teo.tono-semitono', 'comp:teo.escala-mayor',
  'comp:teo.triada-mayor-menor', 'comp:esc.mi-mayor-1pos', 'comp:rit.pulso', 'comp:tec.melodia-acompanada', 'comp:arm.i-iv-v7-i', 'comp:oid.mayor-menor'];
// El tramo 1 hecho (todo salvo lo que se diga; con o sin la parte A de Lágrima).
const tramo1 = (fecha, { salvo = [], conA = true } = {}) => [...COMPS_T1.filter(c => !salvo.includes(c)).map(c => hecho(c, fecha)), ...(conA ? [seccion('A', fecha)] : [])];
const paso = (r, id) => r.tramos.flatMap(t => t.pasos).find(p => p.id === id);

test('el modelo representa programas, cursos, rutas, tramos, pasos, obras, secciones y la obra final', () => {
  assert.deepEqual(cat.programas.map(p => p.id), ['programa:clasica', 'programa:flamenca']);
  assert.equal(cat.cursos.filter(c => c.programa === 'clasica').length, 7);
  assert.equal(cat.cursos.filter(c => c.programa === 'flamenca').length, 6);
  assert.deepEqual(cat.tramosDe.get('curso:c1').map(t => t.orden), [1, 2, 3, 4, 5, 6]);
  assert.equal(cat.tramoDe.get('paso:c1.t2.02').id, 'tramo:c1.t2');
  assert.ok(cat.pasosDe.get('comp:tec.media-cejilla').some(p => p.id === 'paso:c1.t2.02'));
  assert.ok(cat.pasosCon.get(`${LAGRIMA}#B`).some(p => p.id === 'paso:c1.t2.08'));
  assert.ok(cat.ejerciciosDe.get('comp:esc.mi-mayor-1pos').some(e => e.id === 'ej:esc.mi-mayor-1pos'));
  assert.deepEqual(cat.finalDe.get(LAGRIMA).map(c => c.id), ['curso:c1']);
  assert.deepEqual(cat.porId.get(LAGRIMA).secciones.map(s => s.id), ['A', 'B']);
  // Un curso es una formación completa: su ruta trabaja muchas áreas, no una sola.
  const r = ctxDe().rutaActual('clasica');
  assert.ok(r.areas.length >= 8, r.areas.map(a => a.area).join(', '));
  // Los programas no se mezclan: ningún paso clásico trabaja nada flamenco, ni al revés.
  for (const p of cat.pasos) for (const c of p.trabaja || []) assert.ok([p.programa, 'comun'].includes(cat.porId.get(c).programa), `${p.id} → ${c}`);
});

test('el validador exige una ruta coherente y una obra final que no la rompa', () => {
  const base = entidadesReales();
  const cambiar = (id, f) => base.map(e => (e.id === id ? f(structuredClone(e)) : e));
  const sin = id => base.filter(e => e.id !== id);
  const errores = ents => validarCatalogo(ents);
  assert.ok(errores(cambiar(LAGRIMA, o => ({ ...o, pide: [...o.pide, 'comp:tec.cejilla-completa'] }))).some(e => e.includes('la obra final pide comp:tec.cejilla-completa')));
  assert.ok(errores(cambiar('tramo:c1.cierre', t => ({ ...t, pasos: [] })).filter(e => e.id !== 'paso:c1.cierre.01')).some(e => e.includes('falta un paso de preparación')));
  const suelto = { id: 'paso:x', tipo: 'paso', programa: 'clasica', clase: 'habilidad', titulo: 'x', trabaja: ['comp:tec.sonido-clasico'] };
  assert.ok(errores([...base, suelto]).some(e => e.includes('no está en ningún tramo')));
  assert.ok(errores(cambiar('paso:c1.t1.10', p => ({ ...p, contenido: [`${LAGRIMA}#Z`] }))).some(e => e.includes('no tiene la sección Z')));
  const circulo = cambiar('paso:c1.t1.01', p => ({ ...p, requiere: ['paso:c1.t1.07'] }));
  assert.ok(errores(circulo).some(e => e.includes('círculo')));
  assert.ok(errores(cambiar('curso:c2', c => ({ ...c, borrador: false }))).some(e => e.includes('necesita su obra final')));
  assert.ok(errores(sin('paso:c1.t1.03')).some(e => e.includes('referencia rota a paso:c1.t1.03')));
});

test('la ruta empieza en el primer paso; todo se ve, pero solo se recomienda lo que toca', () => {
  const r = ctxDe().rutaActual('clasica');
  assert.equal(r.curso.id, 'curso:c1');
  assert.equal(r.actual, 'paso:c1.t1.01');
  const [t1, t2] = r.tramos;
  assert.equal(t1.estado, 'abierto');
  assert.equal(t2.estado, 'por-llegar');
  assert.equal(paso(r, 'paso:c1.t1.03').estado, 'recomendado'); // sin requisitos: desbloqueado
  assert.equal(paso(r, 'paso:c1.t1.07').estado, 'proximo'); // pide el sonido clásico antes
  assert.ok(t2.pasos.every(p => p.estado === 'proximo'));
  assert.equal(paso(r, 'paso:c1.cierre.01').estado, 'futuro');
  assert.equal(r.final.estado, 'futuro');
  assert.match(r.final.justificacion, /Reúne/);
  // Visible no es recomendado: todos los pasos, también los futuros, tienen su enlace.
  assert.ok(r.tramos.flatMap(t => t.pasos).every(p => p.href.startsWith('#/paso/')));
});

test('al hacer el tramo 1 se abre el 2; su cierre se comprueba en frío días después', () => {
  const r = ctxDe({ eventos: tramo1('2026-10-20'), hoy: '2026-10-21' }).rutaActual('clasica');
  assert.equal(r.tramos[0].completo, true);
  assert.equal(r.tramos[1].estado, 'abierto');
  assert.equal(paso(r, 'paso:c1.t1.11').estado, 'recomendado');
  assert.ok(r.actual.startsWith('paso:c1.t2.'));
  const despues = ctxDe({ eventos: [...tramo1('2026-10-20'), ...COMPS_T1.map(c => ({ ...hecho(c, '2026-10-23'), modo: 'comprobacion', enFrio: true })), seccion('A', '2026-10-23', { modo: 'comprobacion' })], hoy: '2026-10-24' }).rutaActual('clasica');
  assert.equal(paso(despues, 'paso:c1.t1.11').estado, 'hecho');
});

test('una lectura más baja no frena: el tramo siguiente se abre y la tablatura sigue disponible', () => {
  const estado = estadoInicial();
  estado.formatos['ej:esc.mi-mayor-1pos'] = 'partitura';
  const ctx = ctxDe({ estado, eventos: tramo1('2026-10-20', { salvo: ['comp:lec.notas-1pos-agudas'] }), hoy: '2026-10-21' });
  const r = ctx.rutaActual('clasica');
  assert.equal(r.tramos[0].estado, 'abierto'); // la lectura sigue ahí, recomendada…
  assert.equal(paso(r, 'paso:c1.t1.03').estado, 'recomendado');
  assert.equal(r.tramos[1].estado, 'abierto'); // …pero el camino sigue
  assert.equal(ctx.niveles.lectura.nivel, 0);
  const f = formatoPara(cat.porId.get('ej:esc.mi-mayor-1pos'), ctx, { proposito: 'tecnica' });
  assert.deepEqual(f.disponibles, ['partitura', 'tablatura']);
  assert.equal(f.recomendado, 'tablatura');
  assert.equal(f.mostrar, 'partitura'); // su elección manda y se recuerda
});

test('ruta ↔ obra: el paso dice qué obras prepara y la obra, qué necesita, qué tiene y dónde se trabaja', () => {
  const eventos = [...tramo1('2026-10-20'),
    practica('comp:tec.melodia-acompanada', '2026-10-24', { modo: 'comprobacion', calidad: BIEN, pasadas: 2 }),
    practica('comp:tec.melodia-acompanada', '2026-10-31', { modo: 'comprobacion', calidad: BIEN, pasadas: 2 })];
  const ctx = ctxDe({ eventos, hoy: '2026-10-31' });
  const rel = relacionesPaso(ctx, 'paso:c1.t2.02');
  assert.ok(rel.prepara.some(x => x.obra === LAGRIMA && x.seccion === 'B'));
  const n = necesidades(ctx, LAGRIMA, 'B');
  const de = id => n.pide.find(x => x.comp === id);
  assert.equal(de('comp:tec.melodia-acompanada').situacion, 'la-tienes');
  assert.equal(de('comp:tec.media-cejilla').situacion, 'falta');
  assert.ok(de('comp:tec.media-cejilla').donde.some(d => d.tipo === 'paso' && d.id === 'paso:c1.t2.02'));
  const antes = necesidades(ctxDe({ eventos: tramo1('2026-10-20'), hoy: '2026-10-21' }), LAGRIMA, 'A');
  assert.equal(antes.pide.find(x => x.comp === 'comp:tec.melodia-acompanada').situacion, 'por-consolidar'); // hecha, sin consolidar
  const enRutas = obraEnRutas(ctx, LAGRIMA);
  assert.ok(['paso:c1.t1.10', 'paso:c1.t2.08', 'paso:c1.cierre.01'].every(id => enRutas.pasos.some(p => p.paso === id)));
  assert.equal(enRutas.finalDe[0].curso, 'curso:c1');
  assert.ok(n.lectura && n.lectura.frena === false);
});

test('una obra que necesita algo flojo genera un refuerzo justo antes, y la sesión lo incluye', () => {
  const eventos = [...tramo1('2026-10-20'), practica('comp:tec.media-cejilla', '2026-10-21', { calidad: BIEN, pasadas: 3 }),
    practica('comp:tec.media-cejilla', '2026-10-25', { modo: 'comprobacion', calidad: { ...BIEN, limpieza: 'mal' }, pasadas: 2 })];
  const ctx = ctxDe({ eventos, hoy: '2026-10-26' });
  const t2 = ctx.rutaActual('clasica').tramos[1];
  const i = t2.pasos.findIndex(p => p.insertado && p.comp === 'comp:tec.media-cejilla');
  assert.ok(i >= 0, 'hay un refuerzo de media cejilla');
  assert.match(t2.pasos[i].detalle, /Falló en frío/);
  assert.match(t2.pasos[i + 1].obra, /#B$/); // va justo antes de lo que lo necesita
  assert.equal(paso({ tramos: [t2] }, 'paso:c1.t2.02').estado, 'repaso');
  assert.equal(necesidades(ctx, LAGRIMA, 'B').pide.find(x => x.comp === 'comp:tec.media-cejilla').situacion, 'refuerzo');
  const plan = planificar(ctx, { minutos: 60 });
  const refuerzo = plan.bloques.find(b => b.tipo === 'refuerzo' && b.item === 'comp:tec.media-cejilla');
  assert.ok(refuerzo, plan.bloques.map(b => `${b.tipo} ${b.item}`).join(' · '));
  assert.match(refuerzo.paraQue, /Lágrima/);
  // Y una obra para leer cuando la lectura no llega: refuerzo de lectura antes del estudio de Sor.
  const sor = t2.pasos.findIndex(p => p.id === 'paso:c1.t2.06');
  assert.ok(t2.pasos[sor - 1].insertado && /lectura/.test(t2.pasos[sor - 1].detalle), t2.pasos[sor - 1].detalle);
});

test('una obra que ya conocía no se reinicia: se comprueba con una pasada y queda aprendida', () => {
  const estado = estadoInicial();
  estado.obras[LAGRIMA] = { conocida: { nivel: 'entera' } };
  const previa = seccion('B', '2026-10-01'); // lo que ya había registrado no se pierde
  const ctx = ctxDe({ estado, eventos: [previa, ...tramo1('2026-10-20', { conA: false })], hoy: '2026-10-21' });
  assert.equal(estadoObra(ctx, LAGRIMA).clave, 'empezada'); // la B ya tiene práctica
  assert.equal(ctx.estadoDe(`${LAGRIMA}#B`), 'completado');
  const r = ctx.rutaActual('clasica');
  const a = paso(r, 'paso:c1.t1.10');
  assert.equal(a.conocida, true);
  assert.match(a.detalle, /La conoces/);
  assert.equal(r.final.conocida, true);
  const plan = planificar(ctx, { minutos: 60 });
  const b = plan.bloques.find(x => x.tipo === 'obra');
  assert.equal(b.modo, 'comprobacion');
  assert.match(b.titulo, /Pasada de comprobación/);
  assert.ok(b.minutos <= 10);
  const tras = ctxDe({ estado, eventos: [previa, ...tramo1('2026-10-20', { conA: false }), seccion('A', '2026-10-21', { modo: 'comprobacion' })], hoy: '2026-10-21' });
  assert.equal(tras.estadoDe(`${LAGRIMA}#A`), 'completado'); // una pasada en frío basta: no se aprende de cero
  assert.equal(paso(tras.rutaActual('clasica'), 'paso:c1.t1.10').estado, 'hecho');
  // Sin ninguna práctica, una obra conocida está «por comprobar», y si es obra final, es obra de evaluación.
  const solo = estadoObra(ctxDe({ estado }), LAGRIMA);
  assert.equal(solo.clave, 'conocida');
  assert.equal(solo.deEvaluacion, true);
});

test('«¿Qué hago hoy?»: profesor, comprobaciones cortas por prioridad, la ruta y su obra; lo que no cabe sigue en la cola', () => {
  const estado = estadoInicial();
  estado.tareasProfesor.push({ id: 't1', item: 'obra:sor.op60-1', minutos: 12, hasta: '2026-11-03' });
  const eventos = [
    practica('comp:esc.mi-mayor-1pos', '2026-10-28', { calidad: BIEN, pasadas: 3 }), // de la ruta y vencida
    practica('comp:esc.arpegio-pima', '2026-10-01', { calidad: BIEN, pasadas: 3 }), // fuera de la ruta, vencida hace 28 días
  ];
  const ctx = ctxDe({ estado, eventos, hoy: '2026-11-01' });
  const plan = planificar(ctx, { minutos: 60 });
  assert.equal(plan.total, 60);
  assert.deepEqual(plan.bloques.slice(0, 3).map(b => b.tipo), ['calentamiento', 'comprobacion', 'encargo']);
  const frio = plan.bloques[1];
  assert.ok(frio.minutos <= 4);
  // Lo de fuera de la ruta ya no espera para siempre (Fase 2.1, punto 5): con 28 días vencida, entra primero.
  assert.deepEqual(frio.items.map(x => x.id), ['comp:esc.arpegio-pima', 'comp:esc.mi-mayor-1pos']);
  assert.ok(plan.bloques.some(b => b.tipo === 'paso' && /Tu paso actual/.test(b.motivos[0])));
  assert.ok(plan.bloques.some(b => b.tipo === 'obra' && b.item === 'obra:tarrega.lagrima'));
  assert.ok(plan.bloques.every(b => typeof b.paraQue === 'string' && b.paraQue.length > 0));
  // Con 20 minutos y un encargo, los repasos no se comen la sesión: esperan.
  const corto = planificar(ctx, { minutos: 20 });
  assert.ok(!corto.bloques.some(b => b.tipo === 'comprobacion'));
  assert.deepEqual(corto.bloques.map(b => b.tipo), ['calentamiento', 'encargo', 'paso']);
  assert.ok(corto.avisos.some(a => /2 comprobaciones siguen en la cola/.test(a)));
  // Con la técnica por delante (diagnóstico), la lectura va por detrás: más tiempo, sin frenar la ruta.
  const conDiag = planificar(ctxDe({ estado: estadoInicial(), eventos: [diagnostico('2026-10-31', { niveles: { tecnica: 2 } })] }), { minutos: 60 });
  const lectura = conDiag.bloques.filter(b => b.area === 'lectura');
  assert.ok(lectura.length && lectura.every(b => b.motivos.some(m => /por detrás/.test(m))));
});

test('la migración del esquema 1 al 2 cambia «ruta» por «programa» sin perder nada', () => {
  const datos = {
    estado: {
      esquema: 1, perfil: { nombre: 'David' }, preferencias: { rutaPrincipal: 'flamenca' }, obras: {}, objetivos: [],
      tareasProfesor: [{ id: 't', item: 'comp:tec.sonido-clasico', ruta: 'clasica' }],
      focos: { unidad: { clasica: 'unidad:c1.u2' } },
      contenidoPropio: { obras: [{ id: 'obra:propia.x', ruta: 'clasica', clase: 'obra', titulo: 'X', compositor: 'Y', nivel: { etapa: 2 } }], ejercicios: [] },
    },
    eventos: [{ id: 'e', t: '2026-10-01T10:00:00Z', tipo: 'sesion', ruta: 'clasica' }],
  };
  const r = migrar(structuredClone(datos));
  assert.equal(r.estado.esquema, ESQUEMA);
  assert.equal(r.estado.preferencias.programaPrincipal, 'flamenca');
  assert.equal(r.estado.preferencias.rutaPrincipal, undefined);
  assert.equal(r.estado.tareasProfesor[0].programa, 'clasica');
  assert.deepEqual(r.estado.focos, { tramo: { clasica: 'tramo:c1.t2' } });
  assert.equal(r.estado.contenidoPropio.obras[0].programa, 'clasica');
  assert.equal(r.estado.contenidoPropio.obras[0].nivel.curso, 2);
  assert.equal(r.eventos[0].programa, 'clasica');
  assert.equal(r.estado.perfil.nombre, 'David');
  assert.deepEqual(validarEstado(r.estado), []);
});
