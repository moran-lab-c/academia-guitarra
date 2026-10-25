// Preguntas que corrige la app (lectura, diapasón, teoría, armonía y oído), generadas a partir de la teoría musical: la
// respuesta correcta sale del cálculo, no de una lista escrita a mano. Deterministas: con la misma semilla, las mismas
// preguntas. Las usan la evaluación inicial y las tandas de práctica de las competencias de conocimiento.
//
// Una pregunta: { enunciado, opciones: [texto], correcta: índice, notacion?: (notación propia de una o dos notas para
// dibujar), audio?: { secuencia: [[midi, …], …], duracion } }.
import { armadura, grafia, midiDe } from './partitura.js';

const NOMBRES = { c: 'Do', d: 'Re', e: 'Mi', f: 'Fa', g: 'Sol', a: 'La', b: 'Si' };
const LETRAS = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
const NATURAL = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const ALTER = { '': '', '#': '♯', b: '♭' };
export const nombreNota = (letra, acc = '') => `${NOMBRES[letra]}${ALTER[acc] ?? acc}`;
const AFINACION = [64, 59, 55, 50, 45, 40]; // cuerdas 1-6 al aire (MIDI)
const CLAVE_TONO = { c: 'C', g: 'G', d: 'D', a: 'A', e: 'E', f: 'F' };

// Generador pseudoaleatorio con semilla (mulberry32).
export function azar(semilla) {
  let a = [...String(semilla)].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 2654435761) >>> 0, 1779033703);
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const elegir = (r, lista) => lista[Math.floor(r() * lista.length)];
// Opciones barajadas con la correcta dentro; devuelve también su índice.
function opciones(r, correcta, distractores, n = 4) {
  const lista = [correcta, ...[...new Set(distractores)].filter(x => x !== correcta).sort(() => r() - 0.5).slice(0, n - 1)];
  for (let i = lista.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [lista[i], lista[j]] = [lista[j], lista[i]]; }
  return { opciones: lista, correcta: lista.indexOf(correcta) };
}

// Escala mayor (o menor natural) con su grafía: [{ letra, acc }] de 7 grados.
export function escala(tonica, modo = 'mayor') {
  const intervalos = modo === 'mayor' ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
  const [l0, a0] = [tonica[0], tonica.slice(1)];
  const base = NATURAL[l0] + (a0 === '#' ? 1 : a0 === 'b' ? -1 : 0);
  const i0 = LETRAS.indexOf(l0);
  return intervalos.map((iv, k) => {
    const letra = LETRAS[(i0 + k) % 7];
    let dif = ((base + iv) - NATURAL[letra] + 12) % 12;
    if (dif > 6) dif -= 12;
    return { letra, acc: dif === 1 ? '#' : dif === -1 ? 'b' : dif === 2 ? '##' : dif === -2 ? 'bb' : '' };
  });
}
const nombreTono = (t, modo) => `${nombreNota(t[0], t.slice(1))} ${modo}`;
const triada = (tonica, modo) => { const e = escala(tonica, modo); return [e[0], e[2], e[4]]; };
const textoAcorde = notas => notas.map(n => nombreNota(n.letra, n.acc)).join(' – ');

// Una nota natural escrita en el pentagrama: notación propia de una sola nota (redonda), para dibujarla.
const unaNota = (c, t) => ({ compas: '4/4', compasVisible: false, armadura: 'C', compases: [{ voces: [[{ d: '1', c, t }]] }] });
// Notas naturales de la primera posición: [cuerda, traste].
const NATURALES = { 1: [0, 1, 3], 2: [0, 1, 3], 3: [0, 2], 4: [0, 2, 3], 5: [0, 2, 3], 6: [0, 1, 3] };
const natural = (c, t) => { const g = grafia(AFINACION[c - 1] + t, armadura('C')); return g.acc === '' ? g : null; };

const GENERADORES = {
  // Lectura: una nota en el pentagrama (escrita como se escribe la guitarra) → su nombre.
  'comp:lec.notas-1pos-agudas': r => preguntaLectura(r, [1, 2, 3]),
  'comp:lec.notas-1pos-graves': r => preguntaLectura(r, [4, 5, 6]),
  // Diapasón: cuerda y traste → nota.
  'comp:dia.notas-1pos': r => {
    const c = elegir(r, [1, 2, 3, 4, 5, 6]);
    const t = elegir(r, NATURALES[c]);
    const g = natural(c, t);
    return { enunciado: `Cuerda ${c}, traste ${t}: ¿qué nota es?`, ...opciones(r, NOMBRES[g.letra], Object.values(NOMBRES)) };
  },
  'comp:teo.tono-semitono': r => {
    const i = Math.floor(r() * 7);
    const [a, b] = [LETRAS[i], LETRAS[(i + 1) % 7]];
    const semitono = (NATURAL[b] - NATURAL[a] + 12) % 12 === 1;
    return { enunciado: `De ${NOMBRES[a]} a ${NOMBRES[b]} (subiendo, sin alteraciones): ¿tono o semitono?`, opciones: ['Tono', 'Semitono'], correcta: semitono ? 1 : 0 };
  },
  'comp:teo.escala-mayor': r => {
    const t = elegir(r, Object.keys(CLAVE_TONO));
    const grado = elegir(r, [2, 3, 4, 5, 6, 7]);
    const e = escala(t, 'mayor');
    const ok = nombreNota(e[grado - 1].letra, e[grado - 1].acc);
    const otros = e.map(n => nombreNota(n.letra, n.acc)).concat(e.map(n => nombreNota(n.letra, n.acc === '#' ? '' : '#')));
    return { enunciado: `¿Cuál es el ${grado}.º grado de ${nombreTono(t, 'mayor')}?`, ...opciones(r, ok, otros) };
  },
  'comp:teo.triada-mayor-menor': r => {
    const t = elegir(r, ['c', 'd', 'e', 'g', 'a']);
    const modo = elegir(r, ['mayor', 'menor']);
    const ok = textoAcorde(triada(t, modo));
    const otro = textoAcorde(triada(t, modo === 'mayor' ? 'menor' : 'mayor'));
    return { enunciado: `¿Qué notas tiene el acorde de ${nombreTono(t, modo)}?`, ...opciones(r, ok, [otro, textoAcorde(triada(LETRAS[(LETRAS.indexOf(t) + 1) % 7], modo)), textoAcorde(triada(LETRAS[(LETRAS.indexOf(t) + 3) % 7], modo))]) };
  },
  'comp:arm.i-iv-v7-i': r => {
    const t = elegir(r, Object.keys(CLAVE_TONO));
    const e = escala(t, 'mayor');
    const funcion = elegir(r, [['IV', 3, 'subdominante (IV)', ''], ['V7', 4, 'dominante con séptima (V7)', '7']]);
    const n = e[funcion[1]];
    const ok = `${nombreNota(n.letra, n.acc)}${funcion[3]}`;
    const otros = [e[3], e[4], e[1], e[5]].map(x => `${nombreNota(x.letra, x.acc)}${funcion[3]}`);
    return { enunciado: `En ${nombreTono(t, 'mayor')}, ¿cuál es el acorde de ${funcion[2]}?`, ...opciones(r, ok, otros) };
  },
  'comp:arm.tono-homonimo': r => {
    const t = elegir(r, ['c', 'g', 'd', 'a', 'e']);
    const relativo = escala(t, 'mayor')[5];
    const ok = nombreTono(t, 'menor');
    return { enunciado: `¿Cuál es el tono homónimo (misma tónica) de ${nombreTono(t, 'mayor')}?`, ...opciones(r, ok, [`${nombreNota(relativo.letra, relativo.acc)} menor`, nombreTono(LETRAS[(LETRAS.indexOf(t) + 4) % 7], 'mayor'), `${nombreNota(relativo.letra, relativo.acc)} mayor`]) };
  },
  // Oído: suena una triada; ¿mayor o menor?
  'comp:oid.mayor-menor': r => {
    const raiz = 48 + Math.floor(r() * 12);
    const mayor = r() < 0.5;
    return { enunciado: 'Escucha el acorde: ¿es mayor o menor?', audio: { secuencia: [[raiz, raiz + (mayor ? 4 : 3), raiz + 7]], duracion: 1.4, arpegiado: true }, opciones: ['Mayor', 'Menor'], correcta: mayor ? 0 : 1 };
  },
  // El modo flamenco por arriba es el modo de Mi (Mi, Fa, Sol, La…): la cadencia baja por grados desde el La, con acordes
  // sobre La (menor), Sol, Fa y Mi (mayor), que es el reposo; el Fa, medio tono por encima, es el que lleva a él.
  'comp:fla.cadencia-andaluza': r => {
    const ACORDES = ['La menor', 'Sol', 'Fa', 'Mi'];
    const tipo = elegir(r, ['orden', 'reposo', 'antes', 'calidad']);
    if (tipo === 'orden') return { enunciado: 'La cadencia andaluza por arriba: ¿qué acordes tiene, en orden?', ...opciones(r, ACORDES.join(' – '), ['Mi – Fa – Sol – La menor', 'La menor – Sol – Fa – Mi menor', 'La menor – Re menor – Mi – La menor', 'Re menor – Do – Si♭ – La']) };
    if (tipo === 'reposo') return { enunciado: 'En el modo flamenco por arriba, ¿en qué acorde reposa la cadencia andaluza?', ...opciones(r, 'Mi', ['La menor', 'Sol', 'Fa', 'Do']) };
    if (tipo === 'antes') return { enunciado: 'En la cadencia andaluza por arriba, ¿qué acorde va justo antes del reposo?', ...opciones(r, 'Fa', ['Sol', 'La menor', 'Si7', 'Re menor']) };
    return { enunciado: 'El acorde de reposo del modo flamenco por arriba (Mi), ¿es mayor o menor?', opciones: ['Mayor', 'Menor'], correcta: 0 };
  },
  // Contenido del curso 1, tramos 3-5.
  'comp:teo.intervalos': r => {
    const tipos = [['2.ª mayor', 1, 2], ['3.ª menor', 2, 3], ['3.ª mayor', 2, 4], ['4.ª justa', 3, 5], ['5.ª justa', 4, 7], ['6.ª mayor', 5, 9], ['8.ª justa', 7, 12]];
    const [nombre, pasos, semis] = elegir(r, tipos);
    const a = elegir(r, ['c', 'd', 'e', 'f', 'g', 'a']);
    const letraB = LETRAS[(LETRAS.indexOf(a) + pasos) % 7];
    let dif = ((NATURAL[a] + semis) - NATURAL[letraB] + 120) % 12; if (dif > 6) dif -= 12;
    const accB = dif === 1 ? '#' : dif === -1 ? 'b' : dif === 0 ? '' : null;
    if (accB == null) return GENERADORES['comp:teo.intervalos'](r);
    return { enunciado: `¿Qué intervalo hay de ${NOMBRES[a]} a ${nombreNota(letraB, accB)} (subiendo)?`, ...opciones(r, nombre, tipos.map(x => x[0])) };
  },
  'comp:teo.armaduras-0-2': r => {
    const tonos = [['c', 0], ['g', 1], ['d', 2], ['f', -1], ['bb', -2]];
    const [t, n] = elegir(r, tonos);
    const texto = n === 0 ? 'ninguna alteración' : `${Math.abs(n)} ${n > 0 ? (Math.abs(n) === 1 ? 'sostenido' : 'sostenidos') : (Math.abs(n) === 1 ? 'bemol' : 'bemoles')}`;
    const nombre = t === 'bb' ? 'Si♭ mayor' : nombreTono(t, 'mayor');
    return elegir(r, [true, false])
      ? { enunciado: `¿Qué tonalidad mayor lleva ${texto} en la armadura?`, ...opciones(r, nombre, tonos.map(([x]) => (x === 'bb' ? 'Si♭ mayor' : nombreTono(x, 'mayor')))) }
      : { enunciado: `¿Qué armadura tiene ${nombre}?`, ...opciones(r, texto, ['ninguna alteración', '1 sostenido', '2 sostenidos', '1 bemol', '2 bemoles']) };
  },
  'comp:arm.triadas-do-mayor': r => {
    const e = escala('c', 'mayor');
    const calidades = ['mayor', 'menor', 'menor', 'mayor', 'mayor', 'menor', 'disminuido'];
    const grados = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
    const i = Math.floor(r() * 7);
    const ok = `${NOMBRES[e[i].letra]} ${calidades[i]}`;
    return { enunciado: `En Do mayor, ¿qué acorde se forma sobre el grado ${grados[i]}?`, ...opciones(r, ok, [`${NOMBRES[e[i].letra]} ${calidades[i] === 'mayor' ? 'menor' : 'mayor'}`, ...e.map((n, k) => `${NOMBRES[n.letra]} ${calidades[k]}`)]) };
  },
  'comp:teo.inversiones': r => {
    const t = elegir(r, ['c', 'g', 'a', 'e', 'd']);
    const modo = t === 'a' || t === 'e' ? 'menor' : 'mayor';
    const notas = triada(t, modo);
    const k = Math.floor(r() * 3);
    const nombres = ['estado fundamental', 'primera inversión', 'segunda inversión'];
    return { enunciado: `Acorde de ${nombreTono(t, modo)} (${textoAcorde(notas)}) con ${nombreNota(notas[k].letra, notas[k].acc)} en el bajo: ¿en qué posición está?`, ...opciones(r, nombres[k], nombres, 3) };
  },
  'comp:arm.cadencias': r => {
    const casos = [['V – I', 'Cadencia perfecta (conclusiva)'], ['IV – I', 'Cadencia plagal (conclusiva)'], ['I – V', 'Semicadencia (suspensiva)'], ['V – vi', 'Cadencia rota (engaña)']];
    const [enlace, nombre] = elegir(r, casos);
    return { enunciado: `Un final ${enlace}: ¿qué cadencia es?`, ...opciones(r, nombre, casos.map(x => x[1])) };
  },
  'comp:oid.intervalos-3-5-8': r => {
    const base = 52 + Math.floor(r() * 10);
    const [nombre, semis] = elegir(r, [['3.ª', 4], ['5.ª', 7], ['8.ª', 12]]);
    return { enunciado: 'Escucha las dos notas: ¿qué intervalo forman?', audio: { secuencia: [[base], [base + semis]], duracion: 0.8 }, opciones: ['3.ª', '5.ª', '8.ª'], correcta: ['3.ª', '5.ª', '8.ª'].indexOf(nombre) };
  },
  'comp:oid.escala-mayor-menor': r => {
    const base = 52 + Math.floor(r() * 8);
    const mayor = r() < 0.5;
    const iv = mayor ? [0, 2, 4, 5, 7, 9, 11, 12] : [0, 2, 3, 5, 7, 8, 10, 12];
    return { enunciado: 'Escucha la escala: ¿mayor o menor?', audio: { secuencia: iv.map(x => [base + x]), duracion: 0.35 }, opciones: ['Mayor', 'Menor'], correcta: mayor ? 0 : 1 };
  },
  'comp:oid.cadencia-conclusiva-suspensiva': r => {
    const t = 48 + Math.floor(r() * 7);
    const I = [t, t + 4, t + 7], V = [t + 7, t + 11, t + 14], IV = [t + 5, t + 9, t + 12];
    const conclusiva = r() < 0.5;
    return { enunciado: 'Escucha el final: ¿conclusivo o suspensivo?', audio: { secuencia: conclusiva ? [I, IV, V, I] : [I, IV, I, V], duracion: 0.9 }, opciones: ['Conclusivo', 'Suspensivo'], correcta: conclusiva ? 0 : 1 };
  },
};

function preguntaLectura(r, cuerdas) {
  const c = elegir(r, cuerdas);
  const t = elegir(r, NATURALES[c]);
  const g = natural(c, t);
  return { enunciado: '¿Qué nota es?', notacion: unaNota(c, t), solucion: { cuerda: c, traste: t }, ...opciones(r, NOMBRES[g.letra], Object.values(NOMBRES), 7) };
}

export const tieneGenerador = id => id in GENERADORES;
// n preguntas para una competencia (null si la app no sabe corregirla todavía).
export function preguntas(id, n, semilla = id) {
  const gen = GENERADORES[id];
  if (!gen) return null;
  const r = azar(semilla);
  return Array.from({ length: n }, () => gen(r));
}
// Para comprobar la teoría en las pruebas.
export const _interno = { escala, triada, midiDe };
