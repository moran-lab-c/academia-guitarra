// El contenido enriquecido: cada dato musical sale del cálculo y coincide con los diagramas, cada referencia existe y
// el recorrido (Continuar y progreso) no cambia. El Tramo 4 del Nivel 1 es el tramo de referencia.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { cargarCurriculo } from '../servidor/catalogo.js';
import { indexarCurriculo, continuar, marcar, progresoVacio, esDePractica } from '../logica/curriculo.js';
import { validarPaso, TIPOS_BLOQUE, bloquesDe, COMPRUEBAN } from '../logica/bloques.js';
import { anatomiaAcorde, compararAcordes, escalaMayor, escena, eventosDeAcordes, eventosDeNotacion, intervalo, midiEn, notaEn, validarEscena, TIPOS_ESCENA } from '../logica/guitarra.js';
import { prepararNotacion } from '../logica/partitura.js';
import { ACORDES } from '../logica/acordes.js';
import { PREGUNTAS, preguntasDelPaso } from '../logica/preguntasPaso.js';

const CONTENIDO = new URL('../contenido/', import.meta.url);
const datos = cargarCurriculo(fileURLToPath(CONTENIDO));
const ind = indexarCurriculo(datos);
const leerNotacion = f => JSON.parse(fs.readFileSync(new URL(f, CONTENIDO)));
const notaciones = new Map(fs.readdirSync(new URL('notacion/', CONTENIDO)).map(f => [`notacion/${f}`, leerNotacion(`notacion/${f}`)]));
const contexto = { pasos: ind.porId, obras: ind.obraPorId, notaciones, preguntas: new Set(Object.keys(PREGUNTAS)) };
const pasosDelTramo = ind.pasos.filter(e => e.tramo.id === 'n1.t4');

test('el Tramo 4 está enriquecido entero y cada bloque es válido', () => {
  assert.equal(pasosDelTramo.length, 22);
  for (const e of pasosDelTramo) assert.ok(datos.enriquecido[e.paso.id], `sin enriquecer: ${e.paso.id}`);
  for (const [id, def] of Object.entries(datos.enriquecido)) assert.deepEqual(validarPaso(id, def, contexto), []);
  // No hay una plantilla: los pasos usan combinaciones distintas de bloques.
  const formas = new Set(Object.values(datos.enriquecido).map(d => bloquesDe(d).map(b => b.tipo).join('|')));
  assert.ok(formas.size >= 20, `solo ${formas.size} formas distintas`);
  const usados = new Set(Object.values(datos.enriquecido).flatMap(d => bloquesDe(d).map(b => b.tipo)));
  for (const t of TIPOS_BLOQUE) assert.ok(usados.has(t), `tipo sin usar: ${t}`);
});

test('primero se enseña: nunca se pregunta sin haber explicado antes en ese mismo paso', () => {
  for (const [id, def] of Object.entries(datos.enriquecido)) {
    const bloques = bloquesDe(def);
    const primera = bloques.findIndex(b => COMPRUEBAN.has(b.tipo));
    if (primera < 0) continue;
    assert.ok(primera >= 1, `${id}: empieza preguntando`);
    const explicado = bloques.slice(0, primera).map(b => [b.md, b.titulo, b.que, b.porque, ...(b.items ?? []).map(x => (typeof x === 'string' ? x : x.error ?? x.texto))].filter(Boolean).join(' ')).join(' ').length;
    assert.ok(explicado > 60 || bloques.slice(0, primera).some(b => ['mastil', 'tabla', 'grados', 'escuchar', 'progresion'].includes(b.tipo)), `${id}: pregunta sin enseñar antes`);
  }
});

test('lo que se puede oír tiene audio y la tablatura enseña a tocar', () => {
  const conAudio = new Set(['escuchar', 'notacion', 'progresion', 'pista', 'grados', 'mastil', 'preguntas']);
  for (const e of pasosDelTramo) assert.ok(bloquesDe(datos.enriquecido[e.paso.id]).some(b => conAudio.has(b.tipo) || b.audio), `${e.paso.id}: sin audio`);
  for (const def of Object.values(datos.enriquecido)) for (const b of bloquesDe(def).filter(x => x.tipo === 'notacion')) {
    const j = notaciones.get(b.fuente);
    for (const m of j.compases) for (const n of m.voces.flat()) {
      if (n.acorde) { assert.ok(n.rotulo || m.voces.flat().some(x => x.rotulo), `${b.fuente}: acorde sin nombre`); continue; }
      if (n.t > 0) assert.ok(n.dedo, `${b.fuente}: nota en el traste ${n.t} sin dedo`);
    }
    // Cada nota pulsada lleva su dedo de la derecha; la que llega por un ligado no se pulsa.
    if (!b.fuente.includes('lec-')) j.compases.forEach(m => m.voces.forEach(v => v.forEach((n, i) => { if (!n.s && !v[i - 1]?.lig) assert.ok(n.mano, `${b.fuente}: nota sin mano derecha`); })));
  }
});

test('los dedos de las tablaturas son los de los diagramas', () => {
  const forma = (nombre, c) => { const i = 6 - c; return { t: ACORDES[nombre].cuerdas[i], dedo: ACORDES[nombre].dedos[i] }; };
  const revisar = (fuente, acordes) => notaciones.get(`notacion/${fuente}.json`).compases.forEach((m, k) => {
    for (const n of m.voces.flat()) {
      if (n.acorde) continue;
      const f = forma(acordes[k], n.c);
      assert.equal(n.t, f.t, `${fuente}, compás ${k + 1}, cuerda ${n.c}`);
      if (n.t > 0) assert.equal(n.dedo, f.dedo, `${fuente}, compás ${k + 1}: dedo`);
    }
  });
  revisar('arm-mi-la-si7-digitada', ['Mi', 'La', 'Si7', 'Mi', 'Mi', 'La', 'Si7', 'Mi']);
  revisar('arm-do-fa-sol7', ['Do', 'Fa△7', 'Sol7', 'Do']);
  revisar('arm-sol-do-re7', ['Sol', 'Do', 'Re7', 'Sol']);
  revisar('arp-pima-do-sol7', ['Do', 'Sol7', 'Sol7', 'Do']);
  revisar('arp-pami-do-sol7', ['Do', 'Sol7', 'Sol7', 'Do']);
  revisar('arp-pim-do-sol7', ['Do', 'Sol7', 'Sol7', 'Do']);
  revisar('arp-pimami-do-sol7', ['Do', 'Sol7', 'Sol7', 'Do']);
  // La escala: un dedo por traste.
  for (const f of ['esc-mi-mayor-digitada', 'esc-mi-mayor-octava']) for (const m of notaciones.get(`notacion/${f}.json`).compases) for (const n of m.voces.flat()) if (n.t > 0) assert.equal(n.dedo, n.t);
});

test('la escala mayor que se calcula es la que explica el texto', () => {
  assert.deepEqual(escalaMayor('E').map(n => n.nota), ['Mi', 'Fa♯', 'Sol♯', 'La', 'Si', 'Do♯', 'Re♯', 'Mi']);
  assert.deepEqual(escalaMayor('C').map(n => n.nota), ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si', 'Do']);
  assert.deepEqual(escalaMayor('G').map(n => n.nota), ['Sol', 'La', 'Si', 'Do', 'Re', 'Mi', 'Fa♯', 'Sol']);
  // «Una sí, una no»: los acordes de los grados 1, 4 y 5 salen de la escala.
  const e = escalaMayor('E', 12);
  const notas = pos => pos.map(p => e[p - 1].nota);
  assert.deepEqual(notas([1, 3, 5]), anatomiaAcorde('Mi', 'E').notas.map(n => n.nota));
  assert.deepEqual(notas([4, 6, 8]), anatomiaAcorde('La', 'E').notas.map(n => n.nota));
  assert.deepEqual(notas([5, 7, 9, 11]), anatomiaAcorde('Si7', 'E').notas.map(n => n.nota));
  // La tabla de la construcción de Mi mayor: la distancia desde la nota natural que sigue.
  const nat = { Fa: 5, Sol: 7, Do: 0, Re: 2 };
  assert.equal(nat.Fa - 4, 1, 'de Mi a Fa natural, un semitono');
  assert.equal(nat.Sol - 6, 1, 'de Fa♯ a Sol natural, un semitono');
  assert.equal(nat.Do + 12 - 11, 1, 'de Si a Do natural, un semitono');
  assert.equal(nat.Re - 1, 1, 'de Do♯ a Re natural, un semitono');
  // Las progresiones del tramo se oyen con sus acordes.
  assert.equal(eventosDeAcordes(['Mi', 'La', 'Si7', 'Mi']).largo, 16);
});

test('las digitaciones de las tablas de la armadura son correctas', () => {
  const sitios = { 'Fa♯': [[6, 2], [4, 4], [1, 2]], 'Do♯': [[5, 4], [2, 2]], 'Sol♯': [[6, 4], [3, 1], [1, 4]], 'Re♯': [[4, 1], [2, 4]] };
  for (const [nota, lista] of Object.entries(sitios)) {
    for (const [c, t] of lista) assert.equal(notaEn(c, t, 'E'), nota);
    const todos = [1, 2, 3, 4, 5, 6].flatMap(c => [0, 1, 2, 3, 4].filter(t => notaEn(c, t, 'E') === nota).map(t => [c, t]));
    assert.equal(todos.length, lista.length, `faltan sitios de ${nota}`);
  }
});

test('solo se enriquece el Curso 1: los demás siguen sin tocar', () => {
  assert.ok(Object.keys(datos.enriquecido).every(id => id.startsWith('n1.')));
});

test('cada tramo escrito está entero y sus esquemas existen', () => {
  const escritos = new Set(Object.keys(datos.enriquecido).map(id => id.split('.').slice(0, 2).join('.')));
  for (const t of escritos) for (const e of ind.pasos.filter(x => x.tramo.id === t)) assert.ok(datos.enriquecido[e.paso.id], `sin enriquecer: ${e.paso.id}`);
  for (const def of Object.values(datos.enriquecido)) for (const b of bloquesDe(def).filter(x => x.tipo === 'figura')) assert.ok(fs.existsSync(new URL(`../web/figuras/${b.src}.svg`, import.meta.url)), `falta ${b.src}`);
});

test('cada nota del pentagrama de las cuerdas al aire es la cuerda que dice', () => {
  const j = notaciones.get('notacion/lec-cuerdas-al-aire.json');
  assert.deepEqual(j.compases.map(m => m.voces[0][0].c), [6, 5, 4, 3, 2, 1]);
  assert.deepEqual([6, 5, 4, 3, 2, 1].map(c => notaEn(c, 0)), ['Mi', 'La', 'Re', 'Sol', 'Si', 'Mi']);
  // Afinar por el traste 5, y el 4 entre la 3.ª y la 2.ª.
  for (const [g, a, t] of [[6, 5, 5], [5, 4, 5], [4, 3, 5], [3, 2, 4], [2, 1, 5]]) assert.equal(midiEn(g, t), midiEn(a, 0));
});

test('al alumno no le llega lenguaje interno', () => {
  const prohibido = /\[(Dato|Consenso|Decisión|Estimación)|E-N\d-\d\d|ABRSM|La Rioja|𝄞|⏱|⌗|✎|dominio(?! público)|comprobación en frío/i;
  assert.ok(!prohibido.test(JSON.stringify(datos.enriquecido)));
});

test('el Curso 1 está enriquecido entero y Continuar lo recorre en orden hasta el Nivel 2', () => {
  const curso = ind.pasos.filter(e => e.paso.id.startsWith('n1.'));
  for (const e of curso) assert.ok(datos.enriquecido[e.paso.id], `sin enriquecer: ${e.paso.id}`);
  const c = progresoVacio();
  for (const e of curso) {
    assert.equal(continuar(ind, c, '2026-11-01').entrada.paso.id, e.paso.id);
    marcar(c, e, esDePractica(e.paso) ? 'practica' : 'hecho', '2026-11-01');
    c.repasos = {};
  }
  assert.equal(continuar(ind, c, '2026-11-01').otro.numero, 2);
});

test('los enlaces de una obra son seguros y ningún paso cita un compás de una obra sin transcribir', () => {
  const texto = JSON.stringify(datos.enriquecido);
  for (const m of texto.matchAll(/\]\((https?:[^)\s]+?)\)(?=[^)]|$)/g)) { assert.match(m[1], /^https:\/\/(imslp\.org|www\.youtube\.com\/results)/); assert.ok(!m[1].includes('('), `paréntesis sin codificar: ${m[1]}`); }
  // Lo único que se da de una obra por compases son los de su Estudio, que salen de su propia transcripción.
  for (const [id, def] of Object.entries(datos.enriquecido)) for (const b of bloquesDe(def).filter(x => x.tipo === 'notacion')) assert.ok(!/repertorio/.test(b.fuente), id);
});

test('la validación detecta referencias rotas', () => {
  assert.ok(validarPaso('n1.t4.l1.p1', { bloques: [{ tipo: 'nada' }] }, contexto).length);
  assert.ok(validarPaso('n1.t4.l1.p1', { bloques: [{ tipo: 'notacion', fuente: 'notacion/esc-mi-mayor-1pos.json', notas: ['En el {c:99} no hay nada.'] }] }, contexto).length, 'un compás que no existe');
  assert.ok(validarPaso('n1.t4.l1.p1', { bloques: [{ tipo: 'reaparece', items: [{ paso: 'n9.t9', texto: 'x' }] }] }, contexto).length);
  assert.ok(validarEscena({ tipo: 'acorde', acorde: 'Nada' }).length);
});

test('las notas de la guitarra son las correctas, con su grafía', () => {
  assert.equal(notaEn(6, 0, 'E'), 'Mi');
  assert.equal(notaEn(4, 1, 'E'), 'Re♯');
  assert.equal(notaEn(3, 1, 'E'), 'Sol♯');
  assert.equal(notaEn(1, 2, 'E'), 'Fa♯');
  assert.equal(notaEn(2, 2, 'E'), 'Do♯');
  assert.equal(notaEn(2, 1, 'C'), 'Do');
  assert.equal(intervalo(6), 'tritono');
});

test('la anatomía de Mi, La y Si7 es la que explica el texto', () => {
  const mi = anatomiaAcorde('Mi', 'E');
  assert.deepEqual(mi.notas.map(n => [n.nota, n.funcion, n.veces]), [['Mi', 'fundamental', 3], ['Sol♯', '3.ª mayor', 1], ['Si', '5.ª justa', 2]]);
  const la = anatomiaAcorde('La', 'E');
  assert.deepEqual(la.notas.map(n => [n.nota, n.funcion, n.veces]), [['La', 'fundamental', 2], ['Do♯', '3.ª mayor', 1], ['Mi', '5.ª justa', 2]]);
  assert.equal(la.cuerdas[0].suena, false, 'la 6.ª no se toca');
  const si = anatomiaAcorde('Si7', 'E');
  assert.deepEqual(si.notas.map(n => [n.nota, n.funcion]), [['Si', 'fundamental'], ['Re♯', '3.ª mayor'], ['Fa♯', '5.ª justa'], ['La', '7.ª menor']]);
  assert.deepEqual(anatomiaAcorde('Fa△7', 'C').notas.map(n => n.nota), ['Fa', 'La', 'Do', 'Mi']);
});

test('el tritono del Si7 es de seis semitonos y resuelve a un semitono en cada cuerda', () => {
  assert.equal(midiEn(3, 2) - midiEn(4, 1), 6);
  assert.equal(midiEn(4, 2) - midiEn(4, 1), 1, 'el Re♯ sube a Mi');
  assert.equal(midiEn(3, 2) - midiEn(3, 1), 1, 'el La baja a Sol♯');
  assert.equal(notaEn(4, 2, 'E'), 'Mi');
  assert.equal(notaEn(3, 1, 'E'), 'Sol♯');
});

test('cada dedo común que afirma el texto es cierto', () => {
  assert.deepEqual(compararAcordes('Si7', 'Mi').comunes, [2]);
  assert.deepEqual(compararAcordes('Mi', 'La').comunes, []);
  assert.deepEqual(compararAcordes('La', 'Si7').comunes, []);
  assert.equal(compararAcordes('La', 'Si7').dedos.find(d => d.dedo === 1).que, 'desliza');
  assert.deepEqual(compararAcordes('Do', 'Fa△7').comunes, [1]);
  assert.deepEqual(compararAcordes('Do', 'Re7').comunes, [1]);
  // Do → Fa△7: los dedos 2 y 3 bajan una cuerda sin cambiar de traste. Sol7 → Do: el 3 y el 2 bajan una y el 1 sube otra.
  for (const d of compararAcordes('Do', 'Fa△7').dedos.filter(x => x.dedo !== 1)) { assert.equal(d.de.t, d.a.t); assert.equal(d.de.c - d.a.c, 1); }
  for (const d of compararAcordes('Sol7', 'Do').dedos) assert.equal(d.de.c - d.a.c, d.dedo === 1 ? -1 : 1, `dedo ${d.dedo}`);
});

test('la escena de un acorde sigue el orden pedido y termina con el acorde completo', () => {
  for (const nombre of Object.keys(ACORDES)) {
    const e = escena({ tipo: 'acorde', acorde: nombre, clave: 'C' });
    assert.deepEqual(e.cuadros.slice(0, 4).map(q => q.base), [0, 1, 2, 3], 'espacio vacío, trastes, cuerdas y diagrama completo');
    assert.ok(e.cuadros.slice(0, 4).every(q => q.marcas.length === 0), 'los dedos llegan después');
    const ultimo = e.cuadros.at(-1);
    const a = ACORDES[nombre];
    for (const m of ultimo.marcas.filter(x => x.dedo)) assert.equal(a.cuerdas[6 - m.c], m.t, `${nombre}: el dedo ${m.dedo} donde dice el diagrama`);
    assert.equal(ultimo.marcas.filter(x => x.dedo).length, a.cuerdas.filter(t => t > 0).length);
    assert.deepEqual(validarEscena({ tipo: 'acorde', acorde: nombre }), []);
  }
  const si7 = escena({ tipo: 'acorde', acorde: 'Si7', clave: 'E' });
  assert.deepEqual(si7.cuadros.filter(q => /^Dedo/.test(q.texto)).map(q => q.texto.match(/Dedo (\d)/)[1]), ['1', '2', '3', '4'], 'los dedos, de uno en uno y en orden');
});

test('la escena reutilizable sirve para todos sus tipos', () => {
  assert.deepEqual(TIPOS_ESCENA.sort(), ['acorde', 'cambio', 'distancias', 'libre', 'manoDerecha', 'recorrido']);
  const c = escena({ tipo: 'cambio', de: 'Si7', a: 'Mi' });
  const d2 = q => q.marcas.find(m => m.k === 'd2');
  assert.deepEqual([d2(c.cuadros[0]).c, d2(c.cuadros[0]).t], [d2(c.cuadros.at(-1)).c, d2(c.cuadros.at(-1)).t], 'el dedo 2 se queda donde está');
  assert.equal(d2(c.cuadros.at(-1)).rol, 'queda');
  assert.equal(c.cuadros[2].marcas.some(m => m.k === 'd4'), false, 'el dedo 4 se va');
});

test('las escalas sobre una cuerda cumplen T-T-S-T-T-T-S', () => {
  const b = bloquesDe(datos.enriquecido['n1.t4.l1.p1']).filter(x => x.tipo === 'mastil' && x.escena.pasos?.length === 7).map(x => x.escena);
  assert.equal(b.length, 2);
  for (const e of b) {
    const trastes = [e.desde, ...e.pasos.map(p => p.a)];
    assert.deepEqual(trastes.slice(1).map((t, i) => t - trastes[i]), [2, 2, 1, 2, 2, 2, 1]);
  }
});

test('las notaciones nuevas son válidas y lo que suena coincide con lo escrito', () => {
  for (const f of ['lec-mi-mayor-armadura', 'arp-mi-mayor-2oct', 'arp-pim-do-sol7', 'arp-pimami-do-sol7', 'arm-do-fa-sol7', 'arm-sol-do-re7', 'esc-mi-mayor-digitada', 'esc-mi-mayor-octava', 'arm-mi-la-si7-digitada']) {
    const j = notaciones.get(`notacion/${f}.json`);
    assert.ok(prepararNotacion(j).ok, f);
    assert.ok(eventosDeNotacion(j).eventos.length > 0, f);
  }
  // El arpegio de Mi no lleva más notas que las de la triada.
  const arp = eventosDeNotacion(notaciones.get('notacion/arp-mi-mayor-2oct.json'));
  for (const ev of arp.eventos) for (const m of ev.midis) assert.ok([4, 8, 11].includes(m % 12), `nota ajena: ${m}`);
  // Cada compás de una progresión solo lleva notas de su acorde.
  const dentro = (fuente, acordes) => eventosDeNotacion(notaciones.get(`notacion/${fuente}.json`)).eventos.forEach(ev => {
    const pc = new Set(anatomiaAcorde(acordes[ev.compas - 1], 'C').cuerdas.filter(x => x.suena).map(x => x.midi % 12));
    for (const m of ev.midis) assert.ok(pc.has(m % 12), `${fuente}, compás ${ev.compas}: ${m}`);
  });
  dentro('arm-do-fa-sol7', ['Do', 'Fa△7', 'Sol7', 'Do']);
  dentro('arm-sol-do-re7', ['Sol', 'Do', 'Re7', 'Sol']);
  // En el compás 7 de la progresión de Mi están el Re♯ (4.ª) y el La (3.ª) que dice la explicación.
  const c7 = leerNotacion('notacion/arm-mi-la-si7.json').compases[6].voces[0];
  assert.ok(c7.some(n => n.c === 4 && n.t === 1) && c7.some(n => n.c === 3 && n.t === 2));
  const c8 = leerNotacion('notacion/arm-mi-la-si7.json').compases[7].voces[0];
  assert.ok(c8.some(n => n.c === 4 && n.t === 2) && c8.some(n => n.c === 3 && n.t === 1));
  // Los recortes de la pista se escuchan solo en su tramo.
  assert.equal(eventosDeNotacion(leerNotacion('notacion/arm-mi-la-si7.json'), { compases: [5, 8] }).largo, 16);
});

test('las preguntas de oído nuevas suenan a lo que dice su respuesta', () => {
  for (const q of preguntasDelPaso('n1.t4.l5.p2', 30)) {
    const [i, otro] = q.audio.secuencia;
    const salto = otro[0] - i[0];
    assert.equal({ I: 0, IV: 5, V: -5 }[q.opciones[q.correcta]], salto);
  }
  const lista = preguntasDelPaso('n1.t4.l2.p6', 12);
  assert.ok(lista.some(q => /mayor/.test(q.opciones.join())) && lista.some(q => /fundamental/.test(q.opciones.join())), 'las dos clases de pregunta');
  for (const q of lista.filter(x => /fundamental/.test(x.opciones.join()))) {
    const [ac, [nota]] = q.audio.secuencia;
    assert.equal(ac[{ 'La fundamental': 0, 'La 3.ª': 1, 'La 5.ª': 2 }[q.opciones[q.correcta]]], nota);
  }
});

test('Continuar y el progreso recorren el tramo igual que antes', () => {
  const c = progresoVacio();
  for (const e of ind.pasos.slice(0, ind.pasos.indexOf(pasosDelTramo[0]))) marcar(c, e, 'hecho', '2026-11-01');
  c.repasos = {};
  for (const e of pasosDelTramo) {
    assert.equal(continuar(ind, c, '2026-11-01').entrada.paso.id, e.paso.id);
    marcar(c, e, esDePractica(e.paso) ? 'practica' : 'hecho', '2026-11-01');
    c.repasos = {};
  }
  assert.equal(continuar(ind, c, '2026-11-01').entrada.tramo.numero, 5);
});

test('hay muestra de guitarra para toda nota que puede sonar', () => {
  const hay = n => fs.existsSync(new URL(`../web/sonidos/guitarra/${n}.mp3`, import.meta.url));
  for (let n = 40; n <= 88; n++) assert.ok(hay(n), `falta la nota ${n}`);
  for (const f of notaciones.values()) for (const ev of eventosDeNotacion(f).eventos) for (const m of ev.midis) assert.ok(hay(m), `${f.titulo}: nota ${m}`);
  for (const id of Object.keys(PREGUNTAS)) for (const q of preguntasDelPaso(id, 20)) for (const m of (q.audio?.secuencia ?? []).flat()) assert.ok(hay(m), `${id}: nota ${m}`);
});

test('cada cuerda suena hasta que se vuelve a tocar, como en una guitarra', () => {
  const { eventos } = eventosDeNotacion(notaciones.get('notacion/arm-mi-la-si7.json'), { compases: [5, 5] });
  assert.equal(eventos[0].suena[0], 2, 'el bajo se repite a los dos tiempos');
  const seco = eventosDeNotacion(notaciones.get('notacion/arm-mi-la-si7.json'), { compases: [5, 5], seco: true }).eventos;
  assert.equal(seco[0].suena[0], 0.5);
});
