// Fase 3D: la evaluación inicial por áreas. Preguntas que corrige la app (bien por construcción), el recorrido adaptativo
// que no repite lo que ya consta, el resultado con su confianza, la evidencia del repertorio que no convalida, el perfil
// por áreas, el punto de partida sin bloqueos y el evento que se guarda.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { preguntas, tieneGenerador, escala } from '../logica/preguntas.js';
import { prepararNotacion } from '../logica/partitura.js';
import { modulos, nivelInicial, siguiente, resultadoModulo, resultadoPreguntas, resultadoEjecucion, eventoModulo, evidenciaDeObra, eventoRepertorio, perfil, puntoDePartida, obrasConocidas } from '../logica/evaluacion.js';
import { estadoInicial, validarEvento } from '../logica/esquema.js';
import { estimada } from '../logica/ruta.js';
import { colaDeRepasos } from '../logica/planificador.js';
import { ctxDe, entidadesReales, practica, diagnostico, enDia, BIEN } from './ayuda.js';

const AFINACION = [64, 59, 55, 50, 45, 40]; // MIDI de las cuerdas 1-6 al aire
const PC = { Do: 0, Re: 2, Mi: 4, Fa: 5, Sol: 7, La: 9, Si: 11 };
const pc = nombre => { const m = /^(Do|Re|Mi|Fa|Sol|La|Si)(♯|♭)?/.exec(nombre); return (PC[m[1]] + (m[2] === '♯' ? 1 : m[2] === '♭' ? -1 : 0) + 12) % 12; };
const respuesta = q => q.opciones[q.correcta];
const conId = (ev, i = 0) => ({ id: `d${i}`, t: enDia('2026-11-01'), ...ev });
// Lo que responde él en un módulo: el resultado de cada competencia, ya corregido.
const app = (comp, aciertos, preguntas = 10) => ({ item: comp, tipo: 'app', aciertos, preguntas, resultado: resultadoPreguntas({ criterio: { tipo: 'conocimiento', aciertos: 0.9, preguntas: 20 } }, aciertos, preguntas) });
const hecho = (ctx, id) => ({ item: id, tipo: 'autoevaluada', resultado: resultadoEjecucion(ctx.cat.porId.get(id), { calidad: BIEN, pasadas: 3 }), calidad: { sonido: 'bien' } });
const falla = id => ({ item: id, tipo: 'autoevaluada', resultado: 'no' });
// Las competencias de técnica de un nivel, del catálogo real (crece con el contenido).
const tecnicaDe = (ctx, nivel) => ctx.cat.competencias.filter(c => c.area === 'tecnica' && c.nivel === nivel).map(c => c.id);

test('Evaluación · las preguntas que corrige la app son correctas por construcción y repetibles con la misma semilla', () => {
  // Diapasón y lectura: la nota de la respuesta es la que suena en esa cuerda y traste (y la que se dibuja en el pentagrama).
  for (const q of preguntas('comp:dia.notas-1pos', 60, 's1')) {
    const [, c, t] = /Cuerda (\d), traste (\d+)/.exec(q.enunciado).map(Number);
    assert.equal(pc(respuesta(q)), (AFINACION[c - 1] + t) % 12, q.enunciado);
  }
  for (const id of ['comp:lec.notas-1pos-agudas', 'comp:lec.notas-1pos-graves']) for (const q of preguntas(id, 40, 's2')) {
    const n = q.notacion.compases[0].voces[0][0];
    assert.equal(pc(respuesta(q)), (AFINACION[n.c - 1] + n.t) % 12);
    assert.ok(id.endsWith('agudas') ? n.c <= 3 : n.c >= 4);
    const plan = prepararNotacion(q.notacion);
    assert.ok(plan.ok);
    assert.equal({ c: 'Do', d: 'Re', e: 'Mi', f: 'Fa', g: 'Sol', a: 'La', b: 'Si' }[plan.compases[0].voces[0][0].claves[0][0]], respuesta(q)); // lo dibujado
  }
  // Teoría: la escala mayor sale de su fórmula (Mi mayor, cuatro sostenidos; Fa mayor, Si bemol) y los grados, de ella.
  assert.deepEqual(escala('e').filter(n => n.acc === '#').map(n => n.letra), ['f', 'g', 'c', 'd']);
  assert.deepEqual(escala('f').filter(n => n.acc).map(n => n.letra + n.acc), ['bb']);
  const FORMULA = [0, 2, 4, 5, 7, 9, 11];
  for (const q of preguntas('comp:teo.escala-mayor', 40, 's3')) {
    const [, grado, tonica] = /el (\d)\.º grado de (\S+) mayor/.exec(q.enunciado);
    assert.equal((pc(respuesta(q)) - pc(tonica) + 12) % 12, FORMULA[grado - 1], q.enunciado);
  }
  for (const q of preguntas('comp:teo.triada-mayor-menor', 30, 's4')) {
    const modo = /(mayor|menor)\?$/.exec(q.enunciado)[1];
    const notas = respuesta(q).split(' – ').map(pc);
    assert.deepEqual(notas.map(x => (x - notas[0] + 12) % 12), modo === 'mayor' ? [0, 4, 7] : [0, 3, 7]);
  }
  for (const q of preguntas('comp:teo.tono-semitono', 30, 's5')) {
    const [, a, b] = /De (\S+) a (\S+) /.exec(q.enunciado);
    assert.equal(respuesta(q), (pc(b) - pc(a) + 12) % 12 === 1 ? 'Semitono' : 'Tono');
  }
  // Oído: lo que suena es lo que dice la respuesta.
  for (const q of preguntas('comp:oid.mayor-menor', 30, 's6')) {
    const [r, t] = q.audio.secuencia[0];
    assert.equal(respuesta(q), t - r === 4 ? 'Mayor' : 'Menor');
  }
  // Repetible: misma semilla, mismas preguntas; otra semilla, otras.
  assert.deepEqual(preguntas('comp:teo.escala-mayor', 8, 'x'), preguntas('comp:teo.escala-mayor', 8, 'x'));
  assert.notDeepEqual(preguntas('comp:teo.escala-mayor', 8, 'x'), preguntas('comp:teo.escala-mayor', 8, 'y'));
  // Toda competencia de conocimiento del catálogo tiene quien la pregunte; cada pregunta, opciones distintas y una correcta.
  const deConocimiento = entidadesReales().filter(e => e.tipo === 'competencia' && e.criterio?.tipo === 'conocimiento');
  assert.ok(deConocimiento.length >= 10);
  for (const c of deConocimiento) {
    assert.ok(tieneGenerador(c.id), `${c.id} no tiene preguntas`);
    for (const q of preguntas(c.id, 50, c.id)) {
      assert.equal(new Set(q.opciones).size, q.opciones.length, `${c.id}: opciones repetidas en «${q.enunciado}»`);
      assert.ok(q.correcta >= 0 && q.correcta < q.opciones.length);
    }
  }
  assert.equal(preguntas('comp:tec.sonido-clasico', 3), null); // la ejecución no la corrige la app
});

test('Evaluación · las preguntas del contenido nuevo (intervalos, armaduras, inversiones, triadas, cadencias y oído) también salen de la teoría', () => {
  const SEMIS = { '2.ª menor': 1, '2.ª mayor': 2, '3.ª menor': 3, '3.ª mayor': 4, '4.ª justa': 5, '4.ª aumentada': 6, '5.ª disminuida': 6, '5.ª justa': 7,
    '6.ª menor': 8, '6.ª mayor': 9, '7.ª menor': 10, '7.ª mayor': 11, '8.ª justa': 12 };
  const LETRA = { Do: 0, Re: 1, Mi: 2, Fa: 3, Sol: 4, La: 5, Si: 6 };
  const vistos = new Set();
  for (const q of preguntas('comp:teo.intervalos', 300, 'i')) {
    const [, a, b] = /de (\S+) a (\S+)(?: agudo)? \(subiendo\)/.exec(q.enunciado);
    const r = respuesta(q);
    vistos.add(r);
    assert.equal(((pc(b) - pc(a) + 12) % 12) || 12, SEMIS[r], q.enunciado);
    assert.equal(((LETRA[b.replace(/[♯♭]/, '')] - LETRA[a] + 7) % 7 || 7) + 1, Number(r[0]), q.enunciado); // el número, de contar las notas
    // Con otra calidad del mismo número entre las opciones (salvo la octava, que solo tiene una): contar no basta.
    if (r[0] !== '8') assert.ok(q.opciones.some(o => o !== r && o[0] === r[0]), q.enunciado);
  }
  assert.equal(vistos.size, Object.keys(SEMIS).length); // salen todas, también la 2.ª menor, la 6.ª menor, las séptimas y el tritono
  // Armaduras: las alteraciones de la escala mayor (su fórmula) son las de la armadura.
  const alteraciones = t => { const e = escala(t[0] === 's' ? 'bb' : t, 'mayor'); const s = e.filter(n => n.acc === '#').length, b = e.filter(n => n.acc === 'b').length; return s ? `${s} sostenido${s > 1 ? 's' : ''}` : b ? `${b} bemol${b > 1 ? 'es' : ''}` : 'ninguna alteración'; };
  const TONO = { 'Do mayor': 'c', 'Sol mayor': 'g', 'Re mayor': 'd', 'Fa mayor': 'f', 'Si♭ mayor': 'sb' };
  for (const q of preguntas('comp:teo.armaduras-0-2', 40, 'a')) {
    const m = /¿Qué armadura tiene (.+)\?/.exec(q.enunciado);
    if (m) assert.equal(respuesta(q), alteraciones(TONO[m[1]]), q.enunciado);
    else assert.equal(alteraciones(TONO[respuesta(q)]), /lleva (.+) en la armadura/.exec(q.enunciado)[1], q.enunciado);
  }
  // Inversiones: la posición la da qué nota del acorde está en el bajo.
  for (const q of preguntas('comp:teo.inversiones', 30, 'v')) {
    const [, notas, bajo] = /\((.+)\) con (\S+) en el bajo/.exec(q.enunciado);
    assert.equal(respuesta(q), ['estado fundamental', 'primera inversión', 'segunda inversión'][notas.split(' – ').indexOf(bajo)]);
  }
  // Triadas de Do mayor: la calidad sale de los semitonos de cada triada construida sobre la escala.
  const DO = [0, 2, 4, 5, 7, 9, 11]; // Do mayor: Do, Re, Mi, Fa, Sol, La, Si
  const GRADOS = ['primer', 'segundo', 'tercer', 'cuarto', 'quinto', 'sexto', 'séptimo'];
  for (const q of preguntas('comp:arm.triadas-do-mayor', 30, 't')) {
    const i = GRADOS.indexOf(/sobre el (\S+) grado\?/.exec(q.enunciado)[1]);
    const [r, t, q5] = [DO[i], DO[(i + 2) % 7], DO[(i + 4) % 7]].map((x, k, a) => (x - a[0] + 12) % 12);
    assert.equal(respuesta(q).split(' ')[1], t === 4 ? 'mayor' : q5 === 6 ? 'disminuido' : 'menor', q.enunciado);
    assert.equal(r, 0);
    assert.ok(!/\b[iv]+°?\b|\b[IV]+\b/.test(q.enunciado), q.enunciado); // el enunciado no dice la calidad
    const raiz = respuesta(q).split(' ')[0];
    assert.equal(q.opciones.filter(o => o.startsWith(`${raiz} `)).length, 3, q.enunciado); // las tres calidades sobre su nota
  }
  // Armonía: el IV y el V7 de la tonalidad, el homónimo (misma tónica, otro modo) y la cadencia andaluza.
  for (const q of preguntas('comp:arm.i-iv-v7-i', 40, 'f')) {
    const [, tonica, cual] = /En (\S+) mayor, ¿cuál es el acorde de .*\((IV|V7)\)\?/.exec(q.enunciado);
    assert.equal((pc(respuesta(q).replace('7', '')) - pc(tonica) + 12) % 12, cual === 'IV' ? 5 : 7, q.enunciado);
    assert.equal(respuesta(q).endsWith('7'), cual === 'V7');
  }
  for (const q of preguntas('comp:arm.tono-homonimo', 30, 'h')) assert.equal(respuesta(q), `${/de (\S+) mayor\?/.exec(q.enunciado)[1]} menor`, q.enunciado);
  const ANDALUZA = { orden: 'La menor – Sol – Fa – Mi', reposa: 'Mi', antes: 'Fa', mayor: 'Mayor' };
  for (const q of preguntas('comp:fla.cadencia-andaluza', 30, 'n')) {
    const tipo = /en orden/.test(q.enunciado) ? 'orden' : /reposa/.test(q.enunciado) ? 'reposa' : /antes/.test(q.enunciado) ? 'antes' : 'mayor';
    assert.equal(respuesta(q), ANDALUZA[tipo], q.enunciado);
  }
  // Grados de la escala mayor: sin el enarmónico de la correcta entre las opciones (Si♯ cuando es Do).
  for (const q of preguntas('comp:teo.escala-mayor', 200, 'g')) assert.equal(q.opciones.filter(o => pc(o) === pc(respuesta(q))).length, 1, q.enunciado);
  // Oído: lo que suena es lo que dice la respuesta.
  const terceras = new Set();
  for (const q of preguntas('comp:oid.intervalos-3-5-8', 60, 'o')) {
    const semis = q.audio.secuencia[1][0] - q.audio.secuencia[0][0];
    assert.equal({ 3: '3.ª', 4: '3.ª', 7: '5.ª', 12: '8.ª' }[semis], respuesta(q));
    if (semis < 5) terceras.add(semis);
  }
  assert.deepEqual([...terceras].sort(), [3, 4]); // la 3.ª, menor y mayor
  for (const q of preguntas('comp:oid.escala-mayor-menor', 30, 'e')) assert.equal(q.audio.secuencia[2][0] - q.audio.secuencia[0][0] === 4 ? 'Mayor' : 'Menor', respuesta(q));
  for (const q of preguntas('comp:oid.cadencia-conclusiva-suspensiva', 30, 'c')) {
    const [primero, , , ultimo] = q.audio.secuencia;
    assert.equal(ultimo[0] === primero[0] ? 'Conclusivo' : 'Suspensivo', respuesta(q)); // acaba en la tónica o en la dominante
  }
});

test('Evaluación · adaptativa: empieza en su hipótesis, sube si supera, baja si falla y no vuelve a pedir lo que ya consta', () => {
  const ctx = ctxDe();
  // Técnica tiene competencias de nivel 1, 2 y 6. Con «bastante», empieza en el 2; con «mucho», también: el 3 no tiene
  // contenido y lo de más arriba no se puede evaluar todavía.
  assert.equal(nivelInicial(ctx, 'tecnica', 2), 2);
  assert.equal(nivelInicial(ctx, 'tecnica', 3), 2);
  assert.equal(nivelInicial(ctx, 'tecnica', null), 1);
  let r = [];
  let s = siguiente(ctx, 'tecnica', r, { hipotesis: 2 });
  assert.deepEqual([s.comp.id, s.nivel], ['comp:tec.cejilla-completa', 2]);
  r = [hecho(ctx, 'comp:tec.cejilla-completa'), hecho(ctx, 'comp:tec.tremolo-lento')];
  // Supera el 2 y el 3 no tiene contenido: termina ahí, sin saltar al 6 (los niveles cuentan seguidos, como en niveles.js).
  assert.equal(siguiente(ctx, 'tecnica', r, { hipotesis: 2 }).fin, true);
  const res = resultadoModulo(ctx, 'tecnica', r, { hipotesis: 2 });
  assert.equal(res.nivel, 2);
  assert.deepEqual(res.frontera, []);
  assert.deepEqual(res.porConfirmar.sort(), tecnicaDe(ctx, 1).sort()); // el nivel 1 no se ha probado: se da por sabido y queda por confirmar
  assert.equal(res.confianza, 'baja'); // dos de las del nivel 1 y 2, autoevaluadas
  // Aunque una respuesta antigua del 6 saliera bien, no sube por encima del último nivel seguido con contenido.
  assert.equal(resultadoModulo(ctx, 'tecnica', [...r, hecho(ctx, 'comp:tec.tremolo-a-tempo')], { hipotesis: 2 }).nivel, 2);
  // Si falla el nivel de partida, baja al anterior.
  const mal = [falla('comp:tec.cejilla-completa'), hecho(ctx, 'comp:tec.tremolo-lento')];
  s = siguiente(ctx, 'tecnica', mal, { hipotesis: 2 });
  assert.equal(s.nivel, 1);
  // Lo que su progreso ya prueba no se pregunta: el sonido clásico hecho en la práctica se salta.
  const conProgreso = ctxDe({ eventos: [practica('comp:tec.sonido-clasico', '2026-10-20', { calidad: BIEN, pasadas: 3, ayuda: 'ninguna' })] });
  const vistas = [];
  for (let resp = [], x = siguiente(conProgreso, 'tecnica', resp); !x.fin; x = siguiente(conProgreso, 'tecnica', resp)) { vistas.push(x.comp.id); resp.push(hecho(conProgreso, x.comp.id)); }
  assert.ok(!vistas.includes('comp:tec.sonido-clasico'));
  assert.deepEqual(vistas.filter(id => tecnicaDe(conProgreso, 1).includes(id)).sort(), tecnicaDe(conProgreso, 1).filter(id => id !== 'comp:tec.sonido-clasico').sort());
  assert.equal(modulos(conProgreso, 'clasica').find(m => m.area === 'tecnica').yaConsta, 1);
});

test('Evaluación · un nivel solo se supera probado entero: terminar pronto no da por sabido lo de su lado', () => {
  const ctx = ctxDe();
  const nivel1 = tecnicaDe(ctx, 1);
  // Una sola competencia del nivel 1, bien, y «Terminar aquí»: nivel 0, y las demás del nivel no quedan por confirmar.
  const una = resultadoModulo(ctx, 'tecnica', [hecho(ctx, nivel1[0])], { hipotesis: 0 });
  assert.deepEqual([una.nivel, una.porConfirmar], [0, []]);
  // Todas las del nivel 1 bien: nivel 1.
  assert.equal(resultadoModulo(ctx, 'tecnica', nivel1.map(id => hecho(ctx, id))).nivel, 1);
  // El nivel 2 entero bien y el 1 sin probar: el 1 se da por sabido (está por debajo de uno superado).
  const dos = resultadoModulo(ctx, 'tecnica', ['comp:tec.cejilla-completa', 'comp:tec.tremolo-lento'].map(id => hecho(ctx, id)));
  assert.equal(dos.nivel, 2);
  // El nivel 1 a medias y el 2 entero: corta en el 1, que está probado a medias.
  const medias = resultadoModulo(ctx, 'tecnica', [hecho(ctx, nivel1[0]), hecho(ctx, 'comp:tec.cejilla-completa'), hecho(ctx, 'comp:tec.tremolo-lento')]);
  assert.equal(medias.nivel, 0);
});

test('Evaluación · el resultado: nivel, confianza y evidencia; lo superado se convalida y lo fallado no queda «en curso»', () => {
  const ctx = ctxDe();
  const bien = [app('comp:lec.notas-1pos-agudas', 10), app('comp:lec.notas-1pos-graves', 9)];
  const r = resultadoModulo(ctx, 'lectura', bien);
  assert.deepEqual([r.nivel, r.confianza], [1, 'alta']); // la app lo ha corregido todo
  const ev = conId(eventoModulo(ctx, 'lectura', bien));
  assert.deepEqual(validarEvento(ev), []);
  assert.deepEqual([ev.modulo, ev.niveles, ev.confianza], ['lectura', { lectura: 1 }, { lectura: 'alta' }]);
  const despues = ctxDe({ eventos: [ev] });
  assert.equal(despues.estadoDe('comp:lec.notas-1pos-agudas'), 'completado'); // primer acierto en frío, como siempre
  // Con fallos: nivel 0, lo fallado es la frontera y sigue pendiente (no «en curso»: no lo ha practicado).
  const flojo = [app('comp:lec.notas-1pos-agudas', 10), app('comp:lec.notas-1pos-graves', 5)];
  const r2 = resultadoModulo(ctx, 'lectura', flojo);
  assert.deepEqual([r2.nivel, r2.frontera], [0, ['comp:lec.notas-1pos-graves']]);
  const c2 = ctxDe({ eventos: [conId(eventoModulo(ctx, 'lectura', flojo))] });
  assert.equal(c2.estadoDe('comp:lec.notas-1pos-graves'), 'pendiente');
  assert.equal(c2.estadoDe('comp:lec.notas-1pos-agudas'), 'completado');
  // 8 de 10 está cerca (casi), no superado: con el 90 % del criterio no basta.
  assert.equal(app('comp:x', 8).resultado, 'casi');
  // La ejecución autoevaluada da confianza media.
  const tec = resultadoModulo(ctx, 'tecnica', tecnicaDe(ctx, 1).map(id => hecho(ctx, id)));
  assert.deepEqual([tec.nivel, tec.confianza], [1, 'media']);
});

test('Evaluación · el perfil es por áreas, con su confianza, su fecha y cuándo reevaluar (antes, si una comprobación lo desmiente)', () => {
  const ctx = ctxDe();
  const tec = conId(eventoModulo(ctx, 'tecnica', [hecho(ctx, 'comp:tec.cejilla-completa'), hecho(ctx, 'comp:tec.tremolo-lento'), falla('comp:tec.tremolo-a-tempo')], { hipotesis: 2 }), 1);
  const lec = conId(eventoModulo(ctx, 'lectura', [app('comp:lec.notas-1pos-agudas', 4), app('comp:lec.notas-1pos-graves', 3)]), 2);
  const c = ctxDe({ eventos: [tec, lec], hoy: '2026-11-02' });
  const p = perfil(c, 'clasica');
  assert.ok(p.length >= 8); // un registro por área: nunca un número único
  const t = p.find(x => x.area === 'tecnica');
  assert.deepEqual([t.nivel, t.estimado, t.fuente, t.confianza, t.fecha], [2, true, 'evaluacion', 'baja', '2026-11-01']);
  assert.deepEqual([t.reevaluar.fecha, t.reevaluar.vencida], ['2026-11-22', false]); // confianza baja: a las tres semanas
  assert.ok(t.evidencias.some(x => x.item === 'comp:tec.cejilla-completa' && x.tipo === 'autoevaluada' && x.resultado === 'ok'));
  assert.deepEqual(t.porConfirmar.sort(), tecnicaDe(c, 1).sort());
  const l = p.find(x => x.area === 'lectura');
  assert.deepEqual([l.nivel, l.fuente, l.confianza], [0, 'evaluacion', 'alta']); // seguro de que todavía no: lo corrigió la app
  assert.equal(p.find(x => x.area === 'oido').fuente, 'sin-datos');
  // Una comprobación en frío que falla por debajo del nivel estimado desmiente la estimación: toca reevaluar ya.
  const sonido = 'comp:tec.sonido-clasico';
  const desmentida = ctxDe({ eventos: [tec, practica(sonido, '2026-11-03', { calidad: BIEN, pasadas: 3, ayuda: 'ninguna' }), practica(sonido, '2026-11-06', { calidad: { ...BIEN, sonido: 'mal' }, modo: 'comprobacion', pasadas: 2, ayuda: 'ninguna' })], hoy: '2026-11-06' });
  const t2 = perfil(desmentida, 'clasica').find(x => x.area === 'tecnica');
  assert.deepEqual([t2.estimado, t2.reevaluar.vencida], [false, true]);
  assert.match(t2.reevaluar.motivo, /desmiente|ha fallado/);
});

test('Evaluación · una obra que ya sabía tocar deja evidencia en lo que pide, solo en lo que se ve, y no lo convalida', () => {
  const ctx = ctxDe();
  // Cálculo puro sobre la parte A de Lágrima (no se marca como conocida): el sonido clásico se ve en el sonido y la
  // limpieza, pero no en el control (que la pasada de una obra no valora); la dinámica con fallos deja dudosa la melodía.
  const ev = evidenciaDeObra(ctx, 'obra:tarrega.lagrima#A', { ...BIEN, dinamica: 'fallos' });
  const de = id => ev.find(x => x.item === id);
  assert.deepEqual([de('comp:tec.sonido-clasico').resultado, de('comp:tec.sonido-clasico').sinObservar], ['favorable', ['control']]);
  assert.equal(de('comp:tec.melodia-acompanada').resultado, 'dudosa');
  assert.equal(de('comp:tec.media-cejilla'), undefined); // es de la parte B: la A no dice nada de ella
  assert.equal(ev.length, 2); // y nada de lo que la obra no pide

  // Con una obra conocida de verdad en el estado (Adelita): pasada de comprobación y evidencia.
  const estado = estadoInicial();
  estado.obras['obra:tarrega.adelita'] = { conocida: { nivel: 'entera', fecha: '2026-10-01' } };
  const base = ctxDe({ estado });
  assert.equal(obrasConocidas(base, 'clasica').length, 1);
  assert.equal(modulos(base, 'clasica').find(m => m.area === 'repertorio').total, 1);
  const pasada = practica('obra:tarrega.adelita', '2026-11-01', { modo: 'comprobacion', calidad: BIEN, pasadas: 1, ayuda: 'notacion' });
  const diag = conId(eventoRepertorio(base, 'repertorio', [{ clave: 'obra:tarrega.adelita', calidad: pasada.calidad }]), 3);
  assert.deepEqual(validarEvento(diag), []);
  const c = ctxDe({ estado, eventos: [pasada, diag], hoy: '2026-11-02' });
  const MELODIA = 'comp:tec.melodia-acompanada';
  assert.equal(c.estadoDe(MELODIA), 'pendiente'); // no convalidada
  assert.equal(estimada(c, MELODIA), true);       // por confirmar
  assert.equal(c.estadoDe('comp:tec.sonido-clasico'), 'pendiente');
  assert.equal(estimada(c, 'comp:tec.sonido-clasico'), false); // Adelita no la pide: no se da por sabida
  const cola = colaDeRepasos(c, 'clasica');
  assert.match(cola.find(x => x.id === MELODIA).motivo, /Adelita ya lo apunta: confírmalo/);
  assert.ok(perfil(c, 'clasica').find(x => x.area === 'tecnica').porConfirmar.includes(MELODIA));
  assert.equal(obrasConocidas(c, 'clasica')[0].comprobada, true);
  // Si la pasada deja ver un aspecto mal, es una posible laguna (aunque la técnica no esté evaluada).
  const malo = conId(eventoRepertorio(base, 'repertorio', [{ clave: 'obra:tarrega.adelita', calidad: { ...BIEN, sonido: 'mal' } }]), 4);
  const c2 = ctxDe({ estado, eventos: [malo] });
  assert.ok(perfil(c2, 'clasica').find(x => x.area === 'tecnica').lagunas.includes(MELODIA));
  assert.ok(puntoDePartida(c2, 'clasica').lagunas.some(x => x.item === MELODIA));
  assert.equal(estimada(c2, MELODIA), false);
});

test('Evaluación · el punto de partida recomienda sin bloquear: dónde empezar, áreas fuertes y flojas y lo que falta por evaluar', () => {
  const ctx = ctxDe();
  const tec = conId(eventoModulo(ctx, 'tecnica', [hecho(ctx, 'comp:tec.cejilla-completa'), hecho(ctx, 'comp:tec.tremolo-lento'), falla('comp:tec.tremolo-a-tempo')], { hipotesis: 2 }), 5);
  const lec = conId(eventoModulo(ctx, 'lectura', [app('comp:lec.notas-1pos-agudas', 4), app('comp:lec.notas-1pos-graves', 3)]), 6);
  const c = ctxDe({ eventos: [tec, lec], hoy: '2026-11-02' });
  const pp = puntoDePartida(c, 'clasica');
  assert.ok(pp.fuertes.includes('tecnica'));
  assert.ok(pp.flojas.includes('lectura'));
  assert.ok(pp.sinEvaluar.includes('oido'));
  assert.match(pp.aviso, /recomendación/);
  // Dónde empezar es el paso actual de la ruta (lo de técnica del tramo 1 se confirma en frío y no es el sitio).
  const ruta = c.rutaActual('clasica');
  assert.equal(pp.empezar.paso, ruta.actual);
  const pasos = ruta.tramos.flatMap(t => t.pasos);
  assert.ok(pasos.find(p => p.id === 'paso:c1.t1.01').porConfirmar);
  // Ningún paso queda cerrado: los estados de siempre (desbloqueado = recomendado), ninguno «bloqueado».
  const VALIDOS = new Set(['dominado', 'hecho', 'repaso', 'actual', 'recomendado', 'proximo', 'futuro', 'completado']);
  assert.ok(pasos.every(p => VALIDOS.has(p.estado) && p.href), pasos.map(p => p.estado).join(','));
  // La lectura floja no frena: sus pasos siguen recomendados y la ruta sigue por técnica y repertorio.
  assert.equal(pasos.find(p => p.id === 'paso:c1.t1.03').estado, 'recomendado');
});

test('Evaluación · el evento se valida: los diagnósticos antiguos siguen valiendo y lo mal formado no se guarda', () => {
  assert.deepEqual(validarEvento(diagnostico('2026-11-01', { niveles: { tecnica: 2 }, pruebas: [{ item: 'comp:x', resultado: 'ok' }] })), []);
  const malos = [
    { niveles: { tecnica: 9 } }, { confianza: { tecnica: 'segura' } }, { pruebas: [{ item: 'comp:x', resultado: 'bien' }] },
    { pruebas: [{ item: 'comp:x', resultado: 'ok', tipo: 'oraculo' }] }, { pruebas: [{ item: 'comp:x', resultado: 'ok', aciertos: 12, preguntas: 10 }] },
    { evidencias: [{ item: 'comp:x', fuente: 'obra:y', resultado: 'convalidada' }] }, { evidencias: [{ item: 'comp:x', fuente: 'obra:y', resultado: 'favorable', aspectos: ['vibrato'] }] },
  ];
  for (const m of malos) assert.ok(validarEvento(diagnostico('2026-11-01', m)).length > 0, JSON.stringify(m));
});

test('Evaluación · lo que quedaba sin probar: la confianza de un diagnóstico antiguo, el orden de las evidencias y el tipo de fuente', () => {
  // Un diagnóstico antiguo, sin confianza: la más prudente (baja), y se reevalúa a los 21 días.
  const antiguo = { id: 'v1', t: enDia('2026-10-01'), tipo: 'diagnostico', niveles: { lectura: 1 }, pruebas: [] };
  const f = perfil(ctxDe({ eventos: [antiguo], hoy: '2026-10-05' }), 'clasica').find(x => x.area === 'lectura');
  assert.deepEqual([f.fuente, f.confianza, f.reevaluar.fecha], ['evaluacion', 'baja', '2026-10-22']);
  // Evidencias de obras: manda la última (hasta que se decida otra regla; ver el informe).
  const ev = (t, resultado) => ({ id: `x${t}`, t: enDia(t), tipo: 'diagnostico', modulo: 'repertorio', pruebas: [], evidencias: [{ item: 'comp:tec.apagar-voces', fuente: 'obra:tarrega.adelita', resultado, aspectos: ['sonido'], sinObservar: [] }] });
  const c = ctxDe({ eventos: [ev('2026-10-22', 'en-contra'), ev('2026-10-20', 'favorable')] });
  assert.equal(c.evidencias.get('comp:tec.apagar-voces').resultado, 'en-contra');
  // Un área cuya única evidencia viene de obras que ya sabía no dice «de tu progreso».
  const t = perfil(c, 'clasica').find(x => x.area === 'tecnica');
  assert.equal(t.fuente, 'obras');
  // La evidencia dice de qué obra sale; y aciertos y preguntas van juntos.
  assert.ok(validarEvento({ ...ev('2026-10-23', 'favorable'), evidencias: [{ item: 'comp:tec.apagar-voces', fuente: '', resultado: 'favorable' }] }).length > 0);
  assert.ok(validarEvento({ id: 'p', t: enDia('2026-10-23'), tipo: 'diagnostico', pruebas: [{ item: 'comp:lec.notas-1pos-agudas', resultado: 'ok', preguntas: -3 }] }).length > 0);
});
