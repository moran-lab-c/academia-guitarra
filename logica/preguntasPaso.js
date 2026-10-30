// Las preguntas que corrige la app en cada paso del currículo. Las respuestas salen del cálculo, nunca de una lista escrita
// a mano. Si un paso no está aquí, no se inventan preguntas: se ve su texto y él se comprueba solo.
import { preguntas, azar } from './preguntas.js';

const SEMITONOS = { '2.ª menor': 1, '2.ª mayor': 2, '3.ª menor': 3, '3.ª mayor': 4, '4.ª justa': 5, 'tritono': 6, '5.ª justa': 7, '6.ª menor': 8, '6.ª mayor': 9,
  '7.ª menor': 10, '7.ª mayor': 11, '8.ª': 12, '9.ª menor': 13, '9.ª mayor': 14 };
const ACORDE = { mayor: [0, 4, 7], menor: [0, 3, 7], aumentado: [0, 4, 8], 'séptima de dominante': [0, 4, 7, 10], 'séptima disminuida': [0, 3, 6, 9],
  'mayor con 7.ª mayor': [0, 4, 7, 11], 'menor con 7.ª menor': [0, 3, 7, 10] };
const GRADO = { I: [0, 4, 7], IV: [5, 9, 12], V: [-5, -1, 2], vi: [-3, 0, 4], V7: [-5, -1, 2, 5], i: [0, 3, 7], iv: [5, 8, 12], VI: [-4, 0, 3], 'I6/4': [-5, 0, 4] };

const elegir = (r, l) => l[Math.floor(r() * l.length)];
function barajar(r, lista) {
  const l = [...lista];
  for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
  return l;
}
const pregunta = (r, enunciado, correcta, todas, audio) => {
  const otras = barajar(r, todas.filter(x => x !== correcta)).slice(0, 3);
  const opciones = barajar(r, [correcta, ...otras]);
  return { enunciado, opciones, correcta: opciones.indexOf(correcta), audio };
};

const GEN = {
  intervalos: (r, { lista, aLaVez }) => {
    const nombre = elegir(r, lista), base = 50 + Math.floor(r() * 12), s = SEMITONOS[nombre];
    const juntas = aLaVez && r() < 0.5;
    return pregunta(r, juntas ? 'Escucha las dos notas a la vez: ¿qué intervalo forman?' : 'Escucha las dos notas: ¿qué intervalo forman?', nombre, lista,
      { secuencia: juntas ? [[base, base + s]] : [[base], [base + s]], duracion: 0.9 });
  },
  acordes: (r, { lista }) => {
    const nombre = elegir(r, lista), base = 48 + Math.floor(r() * 10);
    return pregunta(r, 'Escucha el acorde: ¿cómo es?', nombre, lista, { secuencia: [ACORDE[nombre].map(x => base + x)], duracion: 1.4 });
  },
  progresiones: (r, { lista }) => {
    const nombre = elegir(r, lista), base = 52 + Math.floor(r() * 8);
    return pregunta(r, 'Escucha los acordes: ¿qué progresión es?', nombre, lista, { secuencia: nombre.split('-').map(g => GRADO[g].map(x => base + x)), duracion: 1 });
  },
};

const N1 = ['3.ª menor', '3.ª mayor', '4.ª justa', '5.ª justa', '8.ª'];
const N2 = [...N1, '6.ª menor', '6.ª mayor'];
const N3 = ['2.ª menor', '2.ª mayor', ...N2];
const N4 = [...N3, '7.ª menor', '7.ª mayor'];
const N5 = [...N4, 'tritono'];
const N7 = [...N5, '9.ª menor', '9.ª mayor'];
const CUATRO = ['I-IV-V-I', 'I-IV-V-vi', 'I-vi-IV-V', 'I-vi-IV-I'];
const iv = (lista, aLaVez = false) => ({ gen: 'intervalos', lista, aLaVez });
const ac = lista => ({ gen: 'acordes', lista });
const pr = lista => ({ gen: 'progresiones', lista });
const comp = id => ({ comp: id });

// Paso → sus preguntas. Las listas son las de cada nivel en el apartado 9.6 del maestro.
export const PREGUNTAS = {
  'n1.t1.l5.p3': comp('comp:lec.notas-1pos-agudas'), 'n1.t3.l3.p2': comp('comp:teo.tono-semitono'), 'n1.t4.l1.p2': comp('comp:teo.escala-mayor'),
  'n1.t4.l2.p6': ac(['mayor', 'menor']), 'n1.t4.l6.p4': comp('comp:teo.triada-mayor-menor'), 'n1.t6.l2.p2': comp('comp:teo.inversiones'),
  'n1.t7.l1.p4': comp('comp:arm.tono-homonimo'), 'n1.t7.l2.p1': comp('comp:oid.mayor-menor'), 'n1.t9.l2.p3': comp('comp:teo.armaduras-0-2'),
  'n1.t9.l3.p2': comp('comp:teo.intervalos'), 'n1.t9.l3.p3': iv(N1), 'n1.t12.l6.p4': comp('comp:oid.cadencia-conclusiva-suspensiva'),
  'n1.t13.l2.p2': comp('comp:dia.notas-1pos'), 'n1.t14.l3.p4': iv(N1), 'n1.t14.l3.p5': comp('comp:teo.escala-mayor'),
  'n2.t1.l7.p1': iv(['6.ª menor', '6.ª mayor', '5.ª justa', '8.ª']), 'n2.t2.l6.p1': iv(N2, true), 'n2.t4.l5.p1': pr(['I-IV-I', 'I-V-I']),
  'n2.t5.l3.p3': ac(['mayor', 'menor', 'séptima de dominante']), 'n2.t8.l4.p1': ac(['mayor', 'menor', 'séptima de dominante']), 'n2.t10.l2.p2': comp('comp:teo.intervalos'),
  'n2.t10.l3.p3': ac(['séptima de dominante', 'séptima disminuida']), 'n2.t13.l2.p4': iv(N2, true),
  'n3.t1.l6.p1': iv(N3, true), 'n3.t6.l6.p2': ac(['mayor', 'menor', 'séptima de dominante', 'séptima disminuida']), 'n3.t7.l4.p1': pr(['i-iv-i', 'i-V-i']), 'n3.t10.l2.p4': iv(N3, true),
  'n4.t1.l4.p1': iv(N4, true), 'n4.t3.l5.p2': ac(['mayor', 'menor', 'aumentado']), 'n4.t6.l4.p2': pr(['I-IV-I', 'I-V-I', 'I-IV-V']), 'n4.t11.l2.p3': iv(N4, true),
  'n5.t1.l5.p2': iv(N5, true), 'n5.t1.l6.p6': iv(N5, true), 'n5.t2.l3.p2': pr(CUATRO), 'n5.t13.l2.p3': pr(CUATRO),
  'n6.t3.l4.p1': pr(CUATRO),
  'n7.t1.l5.p1': iv(N7, true), 'n7.t2.l3.p1': ac(['mayor con 7.ª mayor', 'menor con 7.ª menor', 'séptima de dominante', 'séptima disminuida']),
  'n7.t3.l4.p1': pr(['I-IV-I6/4-V-I', 'I-vi-IV-V-I', 'I-IV-V-vi-I']), 'n7.t10.l4.p2': iv(N7, true),
};

export function preguntasDelPaso(id, n = 5, semilla = id) {
  const def = PREGUNTAS[id];
  if (!def) return null;
  if (def.comp) return preguntas(def.comp, n, semilla);
  const r = azar(semilla);
  return Array.from({ length: n }, () => GEN[def.gen](r, def));
}
