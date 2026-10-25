// Fase 3: el metrónomo (límites, cambios, estados, compás), de dónde sale el tempo (el profesor manda) y el tempo como
// señal de progreso que no decide el dominio.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearMetronomo, iniciar, pausar, detener, cambiarBpm, fijarBpm, fijarCompas, avanzar, ajustarBpm, pulsosDe, intervaloMs, tempoDe, progresoTempo, textoTempo, BPM_MIN, BPM_MAX } from '../logica/metronomo.js';
import { estadoInicial, validarEstado } from '../logica/esquema.js';
import { indexar, conPropio } from '../logica/catalogo.js';
import { contexto } from '../logica/progreso.js';
import { entidadesReales, practica, enDia, BIEN } from './ayuda.js';

const ESCALA = 'comp:esc.mi-mayor-1pos';
// El catálogo real, con un tempo de referencia en el criterio de la escala (solo para estas pruebas).
const conTempo = (obligatorio = false) => entidadesReales().map(e => (e.id === ESCALA
  ? { ...e, criterio: { ...e.criterio, tempo: { referencia: 80, unidad: '♩', obligatorio, naturaleza: 'decision', justificacion: 'prueba' } } } : e));
const ctxCon = ({ entidades = conTempo(), estado = estadoInicial(), eventos = [], hoy = '2026-11-01' } = {}) =>
  contexto(indexar(conPropio(entidades, estado)), estado, eventos, new Date(enDia(hoy, 12)));
const intento = (tempo, fecha = '2026-11-01', extra = {}) => practica(ESCALA, fecha, { calidad: BIEN, pasadas: 3, ayuda: 'ninguna', tempo, ...extra });

test('Metrónomo · BPM dentro de 30-240, cambios de 1 y de 5 y nada fuera de los límites', () => {
  assert.deepEqual([ajustarBpm(10), ajustarBpm(500), ajustarBpm('72.6'), ajustarBpm(null)], [BPM_MIN, BPM_MAX, 73, BPM_MIN]);
  let m = crearMetronomo({ bpm: 60 });
  m = cambiarBpm(cambiarBpm(m, 5), 1);
  assert.equal(m.bpm, 66);
  assert.equal(cambiarBpm(fijarBpm(m, 238), 5).bpm, 240);
  assert.equal(cambiarBpm(fijarBpm(m, 32), -5).bpm, 30);
  assert.equal(Math.round(intervaloMs(120)), 500);
});

test('Metrónomo · empezar, pausar (sigue donde iba), seguir y detener (vuelve al primer pulso); el acento cae en el 1', () => {
  let m = crearMetronomo({ bpm: 90, compas: '4/4' });
  assert.equal(m.estado, 'parado');
  assert.equal(pausar(m).estado, 'parado'); // pausar algo parado no hace nada
  m = iniciar(m);
  assert.equal(m.estado, 'sonando');
  const pulsos = [];
  for (let i = 0; i < 6; i++) { const r = avanzar(m); m = r.metronomo; pulsos.push(`${r.pulso}${r.acento ? '>' : ''}`); }
  assert.deepEqual(pulsos, ['0>', '1', '2', '3', '0>', '1']);
  m = pausar(m);
  assert.equal(m.estado, 'pausado');
  m = iniciar(m);
  assert.equal(avanzar(m).pulso, 2); // sigue donde iba
  m = detener(m);
  assert.deepEqual([m.estado, avanzar(m).pulso], ['parado', 0]);
});

test('Metrónomo · el compás del contenido: 3/4 en tres, 6/8 en dos (de tres en tres) y el de 12 flamenco con sus acentos', () => {
  assert.deepEqual(pulsosDe('3/4'), { compas: '3/4', pulsos: 3, subdivision: 1, acentos: [1] });
  assert.deepEqual(pulsosDe('6/8'), { compas: '6/8', pulsos: 2, subdivision: 3, acentos: [1] });
  assert.deepEqual(pulsosDe('12/8', [3, 6, 8, 10, 12]), { compas: '12/8', pulsos: 12, subdivision: 1, acentos: [3, 6, 8, 10, 12] });
  assert.equal(pulsosDe('raro').pulsos, 4);
  // Cambiar de compás empieza en el primer pulso.
  let m = iniciar(crearMetronomo({ compas: '4/4' }));
  m = avanzar(avanzar(m).metronomo).metronomo;
  m = fijarCompas(m, '3/4');
  assert.deepEqual([m.pulsos, m.pulso], [3, 0]);
  const soleá = fijarCompas(crearMetronomo(), '12/8', [3, 6, 8, 10, 12]);
  let s = iniciar(soleá);
  const fuertes = [];
  for (let i = 0; i < 12; i++) { const r = avanzar(s); s = r.metronomo; if (r.acento) fuertes.push(r.pulso + 1); }
  assert.deepEqual(fuertes, [3, 6, 8, 10, 12]);
});

test('Metrónomo · el tempo de referencia: el encargo del profesor, luego su ajuste, luego el tuyo y, al final, el del contenido', () => {
  assert.deepEqual([tempoDe(ctxCon(), ESCALA).objetivo, tempoDe(ctxCon(), ESCALA).fuente], [80, 'contenido']);
  const estado = estadoInicial();
  estado.ajustes[ESCALA] = { tempo: { referencia: 72 }, por: 'yo' };
  assert.deepEqual([tempoDe(ctxCon({ estado }), ESCALA).objetivo, tempoDe(ctxCon({ estado }), ESCALA).fuente], [72, 'propio']);
  estado.ajustes[ESCALA] = { tempo: { referencia: 66 }, por: 'profesor', motivo: 'Despacio y limpio' };
  assert.deepEqual([tempoDe(ctxCon({ estado }), ESCALA).objetivo, tempoDe(ctxCon({ estado }), ESCALA).fuente], [66, 'profesor']);
  estado.tareasProfesor.push({ id: 't1', item: ESCALA, minutos: 10, hasta: '2026-11-03', tempo: 60, estado: 'activa' });
  assert.deepEqual(validarEstado(estado), []);
  const t = tempoDe(ctxCon({ estado }), ESCALA);
  assert.deepEqual([t.objetivo, t.fuente], [60, 'encargo']);
  assert.match(t.motivo, /profesor/);
  // Un encargo caducado o hecho ya no manda.
  assert.equal(tempoDe(ctxCon({ estado, hoy: '2026-11-04' }), ESCALA).fuente, 'profesor');
  estado.tareasProfesor[0].estado = 'hecha';
  assert.equal(tempoDe(ctxCon({ estado }), ESCALA).fuente, 'profesor');
  // Un tempo de encargo fuera de lo razonable no se guarda.
  estado.tareasProfesor.push({ id: 't2', item: ESCALA, tempo: 900, estado: 'activa' });
  assert.ok(validarEstado(estado).some(e => /tempo fuera/.test(e)));
  // Sin nada, lo dice el contenido que se practica (su regla), no se inventa un número.
  const sin = tempoDe(ctxCon({ entidades: entidadesReales() }), ESCALA, { contenido: entidadesReales().find(e => e.id === 'ej:esc.mi-mayor-1pos') });
  assert.equal(sin.objetivo, null);
  assert.match(sin.motivo, /tempo más alto al que salga limpio/);
});

test('Metrónomo · el tempo es progreso, no criterio: 65 de 80 sale bien si el tempo no obliga; si el profesor lo hace obligatorio, cuenta', () => {
  const eventos = [intento(58, '2026-10-28'), intento(65, '2026-10-30'), intento(70, '2026-11-01', { calidad: { ...BIEN, limpieza: 'fallos' } })];
  const ctx = ctxCon({ eventos });
  assert.equal(ctx.estadoDe(ESCALA), 'completado'); // a 58, por debajo del objetivo: completado igual
  const p = progresoTempo(ctx, ESCALA);
  assert.deepEqual([p.ultimo, p.mejorValido, p.intentos.length], [70, 65, 3]); // el mejor limpio es 65 (el de 70 tuvo fallos)
  const t = tempoDe(ctx, ESCALA);
  assert.match(textoTempo(t), /Objetivo ♩=80 · último apuntado 70 · mejor limpio 65 · 81 % del objetivo/);
  assert.match(textoTempo(t), /no decide si está bien/);
  // Sin tempo apuntado tampoco pasa nada: el tempo es opcional.
  assert.equal(ctxCon({ eventos: [intento(undefined, '2026-11-01')] }).estadoDe(ESCALA), 'completado');
  // Si el criterio lo hace obligatorio (p. ej., lo ajusta su profesor), entonces sí cuenta: a 65 no llega.
  const estado = estadoInicial();
  estado.ajustes[ESCALA] = { tempo: { referencia: 80, obligatorio: true }, por: 'profesor', motivo: 'Para el examen' };
  const exigente = ctxCon({ estado, eventos: [intento(65, '2026-11-01')] });
  assert.notEqual(exigente.estadoDe(ESCALA), 'completado');
  assert.match(textoTempo(tempoDe(exigente, ESCALA)), /cuenta para dominarlo/);
  assert.equal(ctxCon({ estado, eventos: [intento(80, '2026-11-01')] }).estadoDe(ESCALA), 'completado');
});
