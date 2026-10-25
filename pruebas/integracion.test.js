// Fase 3F: los bloques juntos. La evaluación cambia la ruta y la sesión sin bloquear; la notación llega a cada ejercicio
// y obra con su formato; el metrónomo lleva el tempo al progreso sin decidir el dominio; y una obra que falla en frío
// pide su refuerzo y, cuando vuelve a salir, el refuerzo desaparece.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { eventoModulo, resultadoPreguntas, resultadoEjecucion, puntoDePartida } from '../logica/evaluacion.js';
import { planificar, colaDeRepasos, PROPOSITO } from '../logica/planificador.js';
import { formatoPara } from '../logica/recomendador.js';
import { prepararNotacion } from '../logica/partitura.js';
import { tempoDe, progresoTempo, textoTempo } from '../logica/metronomo.js';
import { estadoInicial, validarEstado } from '../logica/esquema.js';
import { ctxDe, entidadesReales, practica, enDia, BIEN } from './ayuda.js';

const CONTENIDO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'contenido');
const conId = (ev, i) => ({ id: `int${i}`, t: enDia('2026-11-01'), ...ev });
const ESP = 'obra:sanz.espanoleta';
const APAGAR = 'comp:tec.apagar-voces';
const ESTADOS_RUTA = new Set(['dominado', 'hecho', 'repaso', 'actual', 'recomendado', 'proximo', 'futuro', 'completado']);

test('Integración · evaluación → perfil → ruta → Hoy: lo estimado se confirma en frío, lo flojo recibe tiempo y nada se bloquea', () => {
  const c0 = ctxDe();
  const ok = id => ({ item: id, tipo: 'autoevaluada', resultado: resultadoEjecucion(c0.cat.porId.get(id), { calidad: BIEN, pasadas: 3 }) });
  const tec = conId(eventoModulo(c0, 'tecnica', [ok('comp:tec.cejilla-completa'), ok('comp:tec.tremolo-lento'), { item: 'comp:tec.tremolo-a-tempo', tipo: 'autoevaluada', resultado: 'no' }], { hipotesis: 2 }), 1);
  const app = (item, aciertos) => ({ item, tipo: 'app', aciertos, preguntas: 10, resultado: resultadoPreguntas(c0.cat.porId.get(item), aciertos, 10) });
  const lec = conId(eventoModulo(c0, 'lectura', [app('comp:lec.notas-1pos-agudas', 4), app('comp:lec.notas-1pos-graves', 3)]), 2);
  const c = ctxDe({ eventos: [tec, lec], hoy: '2026-11-02' });
  // Ruta: la técnica de nivel 1 queda por confirmar y no marca el sitio; ningún paso queda cerrado.
  const r = c.rutaActual('clasica');
  const pasos = r.tramos.flatMap(t => t.pasos);
  assert.ok(pasos.find(p => p.id === 'paso:c1.t1.01').porConfirmar);
  assert.ok(!pasos.find(p => p.id === r.actual).porConfirmar);
  assert.ok(pasos.every(p => ESTADOS_RUTA.has(p.estado) && p.href));
  // Punto de partida: empieza en el paso actual de la ruta; la técnica fuerte y la lectura por detrás.
  const pp = puntoDePartida(c, 'clasica');
  assert.equal(pp.empezar.paso, r.actual);
  assert.ok(pp.fuertes.includes('tecnica') && pp.flojas.includes('lectura'));
  // Hoy: lo estimado entra como comprobación en frío; la lectura entra con más peso, sin ocupar el sitio del paso actual.
  const cola = colaDeRepasos(c, 'clasica');
  assert.ok(cola.some(x => x.id === 'comp:tec.sonido-clasico' && /da por sabido/.test(x.motivo)));
  const plan = planificar(c, { minutos: 60 });
  assert.ok(plan.bloques.some(b => b.tipo === 'comprobacion' && b.items.some(x => x.motivo.includes('da por sabido'))));
  assert.ok(plan.bloques.some(b => b.tipo === 'paso' && /Tu paso actual/.test(b.motivos[0]) && b.area !== 'lectura'));
  assert.ok(plan.bloques.some(b => b.area === 'lectura' && b.motivos.some(m => /por detrás/.test(m))));
});

test('Integración · notación → ejercicio y obra: cada ejercicio de la ruta se dibuja y se recomienda en su formato; el profesor y su elección mandan', () => {
  const c = ctxDe();
  const enRuta = new Set(entidadesReales().filter(e => e.tipo === 'paso').flatMap(p => p.contenido || []));
  const ejercicios = c.cat.ejercicios.filter(e => enRuta.has(e.id) && e.notacion?.fuente);
  assert.ok(ejercicios.length >= 12);
  for (const e of ejercicios) {
    assert.ok(prepararNotacion(JSON.parse(fs.readFileSync(path.join(CONTENIDO, e.notacion.fuente)))).ok, e.id);
    const rec = formatoPara(e, c, { proposito: PROPOSITO[e.area] });
    assert.equal(rec.recomendado, e.notacion.principal, e.id); // el formato para el que está pensado
    assert.deepEqual([...rec.disponibles].sort(), [...(e.notacion.vistas ?? ['partitura', 'tablatura'])].sort(), e.id); // sin «vistas», las dos
  }
  // Un encargo del profesor con formato manda sobre el formato principal.
  const hemiolia = c.cat.porId.get('ej:rit.hemiolia');
  assert.equal(formatoPara(hemiolia, c, { encargo: { formato: 'tablatura' } }).recomendado, 'tablatura');
  // Su elección («Ambas») se guarda y se respeta.
  const estado = estadoInicial();
  estado.formatos['ej:tec.apagar-voces'] = 'ambas';
  assert.deepEqual(validarEstado(estado), []);
  assert.equal(formatoPara(c.cat.porId.get('ej:tec.apagar-voces'), ctxDe({ estado }), {}).mostrar, 'ambas');
  // Una obra solo con partitura fuera de la app: se dice dónde, sin notas inventadas y sin prometer la tablatura.
  for (const id of ['obra:tarrega.lagrima', ESP]) {
    const rec = formatoPara(c.cat.porId.get(id), c, { proposito: 'repertorio' });
    assert.deepEqual([rec.disponibles, rec.pendientes], [['partitura'], ['tablatura']], id);
  }
});

test('Integración · metrónomo → ejercicio y obra: el tempo usado queda como progreso, el del profesor manda y no decide el dominio', () => {
  const SOL = 'comp:esc.do-sol-mayor-1pos';
  const ej = ctxDe().cat.porId.get('ej:esc.sol-mayor-1pos');
  // Sin tempo de referencia, el del ejercicio es su regla (no se inventa un número).
  const sin = tempoDe(ctxDe(), SOL, { contenido: ej });
  assert.equal(sin.objetivo, null);
  assert.match(sin.motivo, /tempo más alto al que salga limpio/);
  // Practicar con el metrónomo y apuntar el tempo: progreso, no nota.
  const eventos = [60, 66, 72].map((t, i) => practica(SOL, `2026-10-2${i + 1}`, { calidad: i === 2 ? { ...BIEN, limpieza: 'fallos' } : BIEN, pasadas: 3, ayuda: 'ninguna', tempo: t }));
  const c = ctxDe({ eventos, hoy: '2026-10-24' });
  const p = progresoTempo(c, SOL);
  assert.deepEqual([p.ultimo, p.mejorValido], [72, 66]);
  assert.equal(c.estadoDe(SOL), 'completado'); // el tempo no ha decidido nada
  assert.match(textoTempo(tempoDe(c, SOL, { contenido: ej })), /no decide si está bien/);
  // En una obra, el tempo que pide el profesor en un encargo es el de referencia.
  const estado = estadoInicial();
  estado.tareasProfesor.push({ id: 'e1', item: ESP, minutos: 15, hasta: '2026-11-10', tempo: 72, estado: 'activa' });
  const t = tempoDe(ctxDe({ estado }), ESP);
  assert.deepEqual([t.objetivo, t.fuente], [72, 'encargo']);
});

test('Integración · necesidades → refuerzos → retorno: la Españoleta falla en frío por la limpieza, se refuerza lo que la pide y se vuelve a la obra', () => {
  const estado = estadoInicial();
  estado.focos = { tramo: { clasica: 'tramo:c1.t5' } }; // él abre el tramo 5 (los anteriores no lo bloquean)
  const base = [
    practica(APAGAR, '2026-10-01', { calidad: BIEN, pasadas: 3, ayuda: 'ninguna' }),
    practica(ESP, '2026-10-02', { calidad: BIEN, pasadas: 1, ayuda: 'notacion' }), // aprendida
  ];
  const fallo = practica(ESP, '2026-10-10', { modo: 'comprobacion', calidad: { ...BIEN, limpieza: 'mal' }, pasadas: 1, ayuda: 'notacion' });
  const c = ctxDe({ estado, eventos: [...base, fallo], hoy: '2026-10-11' });
  const t5 = c.rutaActual('clasica').tramos.find(t => t.id === 'tramo:c1.t5');
  const obra = t5.pasos.find(p => p.id === 'paso:c1.t5.07');
  assert.match(obra.detalle, /falló en la limpieza/);
  const refuerzos = t5.pasos.filter(p => p.insertado);
  assert.deepEqual(refuerzos.map(p => p.comp), [APAGAR]); // solo lo que la obra pide y mira la limpieza (el mordente no)
  assert.ok(t5.pasos.indexOf(refuerzos[0]) < t5.pasos.indexOf(obra));
  const plan = planificar(c, { minutos: 60 });
  assert.ok(plan.bloques.some(b => (b.tipo === 'refuerzo' && b.item === APAGAR) || (b.tipo === 'comprobacion' && b.items.some(x => x.id === APAGAR))));
  assert.ok(plan.bloques.some(b => b.tipo === 'obra' && b.item === ESP && b.modo === 'recuperar'));
  // Retorno: refuerza las voces y la obra vuelve a salir en frío. El refuerzo desaparece y la obra no se ha reiniciado.
  const vuelta = [practica(APAGAR, '2026-10-12', { calidad: BIEN, pasadas: 3, ayuda: 'ninguna' }), practica(ESP, '2026-10-16', { modo: 'comprobacion', calidad: BIEN, pasadas: 1, ayuda: 'notacion' })];
  const c2 = ctxDe({ estado, eventos: [...base, fallo, ...vuelta], hoy: '2026-10-17' });
  const t5b = c2.rutaActual('clasica').tramos.find(t => t.id === 'tramo:c1.t5');
  assert.ok(!t5b.pasos.some(p => p.insertado));
  assert.ok(['hecho', 'dominado'].includes(t5b.pasos.find(p => p.id === 'paso:c1.t5.07').estado));
  assert.ok(c2.dom.get(ESP).solidez >= 1);
});
