// El contenido enriquecido: cada dato musical sale del cálculo y coincide con los diagramas, cada referencia existe y
// el recorrido (Continuar y progreso) no cambia. El Tramo 4 del Nivel 1 es el tramo de referencia.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { cargarCurriculo } from '../servidor/catalogo.js';
import { indexarCurriculo, continuar, marcar, progresoVacio, esDePractica } from '../logica/curriculo.js';
import { validarPaso, TIPOS_BLOQUE } from '../logica/bloques.js';
import { anatomiaAcorde, compararAcordes, escena, eventosDeNotacion, intervalo, midiEn, notaEn, validarEscena, TIPOS_ESCENA } from '../logica/guitarra.js';
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
  const formas = new Set(Object.values(datos.enriquecido).map(d => d.bloques.map(b => b.tipo).join('|')));
  assert.ok(formas.size >= 20, `solo ${formas.size} formas distintas`);
  const usados = new Set(Object.values(datos.enriquecido).flatMap(d => d.bloques.map(b => b.tipo)));
  for (const t of TIPOS_BLOQUE) assert.ok(usados.has(t), `tipo sin usar: ${t}`);
});

test('solo está enriquecido lo aprobado: ningún otro tramo se ha tocado', () => {
  assert.ok(Object.keys(datos.enriquecido).every(id => id.startsWith('n1.t4.')));
});

test('al alumno no le llega lenguaje interno', () => {
  const prohibido = /\[(Dato|Consenso|Decisión|Estimación)|E-N\d-\d\d|ABRSM|La Rioja|𝄞|⏱|⌗|✎|dominio(?! público)|comprobación en frío/i;
  assert.ok(!prohibido.test(JSON.stringify(datos.enriquecido)));
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
    assert.equal(e.cuadros[0].base, 0, 'empieza con el mástil vacío');
    assert.equal(e.cuadros[1].base, 1, 'luego cuerdas y trastes');
    assert.equal(e.cuadros[1].marcas.length, 0);
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

test('la escala de Mi mayor en una cuerda cumple T-T-S-T-T-T-S', () => {
  const b = datos.enriquecido['n1.t4.l1.p1'].bloques.filter(x => x.tipo === 'mastil').map(x => x.escena);
  for (const e of b) {
    const trastes = [e.desde, ...e.pasos.map(p => p.a)];
    assert.deepEqual(trastes.slice(1).map((t, i) => t - trastes[i]), [2, 2, 1, 2, 2, 2, 1]);
  }
});

test('las notaciones nuevas son válidas y lo que suena coincide con lo escrito', () => {
  for (const f of ['lec-mi-mayor-armadura', 'arp-mi-mayor-2oct', 'arp-pim-do-sol7', 'arp-pimami-do-sol7', 'arm-do-fa-sol7', 'arm-sol-do-re7']) {
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
