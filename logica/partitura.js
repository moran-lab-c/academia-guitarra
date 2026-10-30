// De la notación propia de la app (contenido/notacion/*.json) a un plan de dibujo neutro: compases, voces, alturas
// escritas (la guitarra se escribe una octava por encima de lo que suena), alteraciones visibles según la armadura,
// tablatura, digitación, ligados y lo demás que diga el archivo. Lo dibuja web/componentes/partitura.js con VexFlow;
// aquí no hay nada del navegador, para poder probarlo. Lo que no está en los datos no se inventa.
//
// Formato del archivo (todo lo marcado «opcional» puede faltar):
//   { titulo, compas: '3/4', armadura: 'E' | 'Em' | 'C' …, afinacion: ['E4','B3','G3','D3','A2','E2'] (opcional),
//     tempo: { bpm, figura: '4', naturaleza } (opcional), parcial: { transcritos, total, nota } (opcional),
//     repetir: true (barras de repetición), conteo: true (el pulso debajo: 1 y 2 y…),
//     compases: [{ pos: 'V' | 'C II' (opcional), voces: [[nota, …], …] }] }
//   nota: { d: '1'|'2'|'4'|'8'|'16'|'32', p: true (puntillo), s: true (silencio) | c: cuerda 1-6, t: traste 0-24 |
//           acorde: [{ c, t }],  dedo: 0-4, mano: 'p'|'i'|'m'|'a'|'c', lig: 'h'|'p' (ligado a la siguiente),
//           rotulo: 'Mi' (nombre del acorde encima), tie: true (ligadura de prolongación con la siguiente), art: ['staccato'|'acento'|'tenuto'], din: 'pp'…'ff' }

export const DURACIONES = ['1', '2', '4', '8', '16', '32'];
export const MANO = ['p', 'i', 'm', 'a', 'c'];
export const ARTICULACIONES = ['staccato', 'acento', 'tenuto'];
export const DINAMICAS = ['pp', 'p', 'mp', 'mf', 'f', 'ff'];
export const AFINACION = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'];

const LETRAS = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
const NATURAL = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const SOSTENIDOS = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
const BEMOLES = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];
const ORDEN_SOSTENIDOS = ['f', 'c', 'g', 'd', 'a', 'e', 'b'];
const ORDEN_BEMOLES = ['b', 'e', 'a', 'd', 'g', 'c', 'f'];
const MAYORES = { C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, 'F#': 6, 'C#': 7, F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Gb: -6, Cb: -7 };
const MENORES = { Am: 0, Em: 1, Bm: 2, 'F#m': 3, 'C#m': 4, 'G#m': 5, 'D#m': 6, 'A#m': 7, Dm: -1, Gm: -2, Cm: -3, Fm: -4, Bbm: -5, Ebm: -6, Abm: -7 };

// Altura MIDI de «E4», «F#3», «Bb2».
export function midiDe(nombre) {
  const m = /^([A-Ga-g])([#b]?)(-?\d)$/.exec(nombre ?? '');
  if (!m) return null;
  return (Number(m[3]) + 1) * 12 + NATURAL[m[1].toLowerCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}

// Armadura: cuántas alteraciones (positivo, sostenidos; negativo, bemoles) y qué alteración lleva cada letra.
export function armadura(clave = 'C') {
  const n = MAYORES[clave] ?? MENORES[clave];
  if (n == null) return null;
  const alter = Object.fromEntries(LETRAS.map(l => [l, '']));
  if (n > 0) ORDEN_SOSTENIDOS.slice(0, n).forEach(l => { alter[l] = '#'; });
  if (n < 0) ORDEN_BEMOLES.slice(0, -n).forEach(l => { alter[l] = 'b'; });
  return { clave, alteraciones: n, alter, menor: clave in MENORES, tonica: clave[0].toLowerCase() };
}
const ALTERA = { '': 0, '#': 1, b: -1, '##': 2, bb: -2 };

// Nombre escrito de una altura (MIDI) según la armadura: las notas de la tonalidad con su grafía (Re# en Mi mayor,
// Mib en Si bemol); en las menores, el 6.º y el 7.º grados elevados (las formas armónica y melódica) sobre su letra (Do#
// en Re menor, Si becuadro en Do menor); y lo demás cromático, con sostenidos en las tonalidades de sostenidos y con
// bemoles en las de bemoles.
export function grafia(midi, arm) {
  const pc = ((midi % 12) + 12) % 12;
  let letra = null, acc = '';
  for (const l of LETRAS) {
    const a = arm.alter[l];
    const v = (NATURAL[l] + ALTERA[a] + 12) % 12;
    if (v === pc) { letra = l; acc = a; break; }
  }
  if (!letra && arm.menor) {
    for (const k of [1, 2]) { // el 7.º y el 6.º grados, medio tono por encima de lo que da la armadura
      const l = LETRAS[(LETRAS.indexOf(arm.tonica) - k + 7) % 7];
      const a = arm.alter[l];
      if ((NATURAL[l] + ALTERA[a] + 1 + 12) % 12 === pc) { letra = l; acc = a === 'b' ? '' : a === '' ? '#' : '##'; break; }
    }
  }
  if (!letra) {
    const nombre = (arm.alteraciones < 0 ? BEMOLES : SOSTENIDOS)[pc];
    letra = nombre[0]; acc = nombre.slice(1);
  }
  // La octava es la de la letra: Si# es un Do (la octava de abajo); Dob es un Si (la de arriba).
  const base = NATURAL[letra] + ALTERA[acc];
  const octava = Math.round((midi - base) / 12) - 1;
  return { letra, acc, octava };
}

const ticks = n => (4 / Number(n.d)) * (n.p ? 1.5 : 1); // en negras
const compasEn = compas => { const [num, den] = String(compas).split('/').map(Number); return { num, den, negras: (num * 4) / den }; };

// Errores del archivo (vacío si está bien). Lo usa el servidor al cargar el contenido y el dibujo antes de pintar.
export function validarNotacion(p, nombre = 'notación') {
  const err = [];
  if (!p || typeof p !== 'object') return [`${nombre}: no es un objeto`];
  if (!/^\d+\/\d+$/.test(p.compas ?? '')) err.push(`${nombre}: falta el compás (p. ej., «4/4»)`);
  if (p.armadura != null && !armadura(p.armadura)) err.push(`${nombre}: armadura desconocida «${p.armadura}»`);
  if (p.afinacion != null && (!Array.isArray(p.afinacion) || p.afinacion.length !== 6 || p.afinacion.some(x => midiDe(x) == null))) err.push(`${nombre}: la afinación debe dar las 6 cuerdas (p. ej., «E4»)`);
  if (p.tempo != null && !(p.tempo.bpm >= 20 && p.tempo.bpm <= 300)) err.push(`${nombre}: tempo fuera de 20-300`);
  if (p.compasVisible != null && typeof p.compasVisible !== 'boolean') err.push(`${nombre}: «compasVisible» debe ser sí o no`); // false: una nota suelta, sin el compás escrito
  if (p.parcial != null && !(Number.isInteger(p.parcial.total) && Number.isInteger(p.parcial.transcritos) && p.parcial.transcritos <= p.parcial.total)) err.push(`${nombre}: «parcial» debe decir cuántos compases hay transcritos de cuántos`);
  if (!Array.isArray(p.compases) || !p.compases.length) return [...err, `${nombre}: sin compases`];
  if (p.parcial && Number.isInteger(p.parcial.transcritos) && p.parcial.transcritos !== p.compases.length) err.push(`${nombre}: «parcial» dice ${p.parcial.transcritos} compases transcritos y hay ${p.compases.length}`);
  const largo = /^\d+\/\d+$/.test(p.compas ?? '') ? compasEn(p.compas).negras : null;
  const posicion = (x, donde) => {
    if (!(Number.isInteger(x?.c) && x.c >= 1 && x.c <= 6)) err.push(`${donde}: cuerda fuera de 1-6`);
    if (!(Number.isInteger(x?.t) && x.t >= 0 && x.t <= 24)) err.push(`${donde}: traste fuera de 0-24`);
  };
  const altura = x => (x && Number.isInteger(x.c) && Number.isInteger(x.t) ? midiDe((Array.isArray(p.afinacion) ? p.afinacion : AFINACION)[x.c - 1]) + x.t : null); // para comparar notas
  const alturas = n => (Array.isArray(n?.acorde) ? n.acorde : [n]).map(altura).sort((a, b) => a - b).join(',');
  // La nota siguiente de la misma voz (en este compás o al principio del siguiente), para ligados y ligaduras.
  const siguienteDe = (i, v, k) => p.compases[i].voces[v][k + 1] ?? p.compases[i + 1]?.voces?.[v]?.[0] ?? null;
  p.compases.forEach((m, i) => {
    if (!m || typeof m !== 'object' || !Array.isArray(m.voces) || !m.voces.length) return err.push(`${nombre}: el compás ${i + 1} no tiene voces`);
    if (m.voces.length > 2) err.push(`${nombre}, compás ${i + 1}: como mucho dos voces (melodía y bajo)`);
    m.voces.forEach((voz, v) => {
      if (!Array.isArray(voz) || !voz.length) return err.push(`${nombre}, compás ${i + 1}, voz ${v + 1}: vacía`);
      voz.forEach((n, k) => {
        const donde = `${nombre}, compás ${i + 1}, voz ${v + 1}, nota ${k + 1}`;
        if (!n || typeof n !== 'object') return err.push(`${donde}: no es una nota`);
        if (!DURACIONES.includes(String(n.d))) err.push(`${donde}: duración «${n.d}» (vale ${DURACIONES.join(', ')})`);
        if (n.dedo != null && !(Number.isInteger(n.dedo) && n.dedo >= 0 && n.dedo <= 4)) err.push(`${donde}: dedo fuera de 0-4`);
        if (n.mano != null && !MANO.includes(n.mano)) err.push(`${donde}: mano derecha «${n.mano}» (vale ${MANO.join(', ')})`);
        if (n.lig != null && !['h', 'p'].includes(n.lig)) err.push(`${donde}: ligado «${n.lig}» (h ascendente, p descendente)`);
        if ((n.lig || n.tie) && !voz[k + 1] && !p.compases[i + 1]) err.push(`${donde}: un ligado o una ligadura necesita una nota después`);
        const sig = (n.lig || n.tie) && !n.s ? siguienteDe(i, v, k) : null;
        if (sig && typeof sig === 'object' && !sig.s) {
          // Un ligado va en la misma cuerda, hacia arriba (h) o hacia abajo (p); una ligadura une la misma altura.
          if (n.lig && !Array.isArray(n.acorde) && !Array.isArray(sig.acorde) && Number.isInteger(n.t) && Number.isInteger(sig.t)) {
            if (sig.c !== n.c) err.push(`${donde}: un ligado va en la misma cuerda`);
            else if (n.lig === 'h' ? sig.t <= n.t : sig.t >= n.t) err.push(`${donde}: un ligado «${n.lig}» va ${n.lig === 'h' ? 'hacia un traste más agudo' : 'hacia un traste más grave'}`);
          }
          if (n.tie && alturas(n) !== alturas(sig)) err.push(`${donde}: una ligadura une dos notas iguales`);
        }
        if (n.art != null && (!Array.isArray(n.art) || n.art.some(a => !ARTICULACIONES.includes(a)))) err.push(`${donde}: articulación desconocida`);
        if (n.din != null && !DINAMICAS.includes(n.din)) err.push(`${donde}: dinámica desconocida «${n.din}»`);
        if (n.s) return; // silencio
        if (Array.isArray(n.acorde)) { if (!n.acorde.length) err.push(`${donde}: acorde vacío`); n.acorde.forEach(x => posicion(x, donde)); } else posicion(n, donde);
      });
      // Cada voz llena su compás (la primera puede ser anacrusa si el archivo lo dice).
      const suma = voz.reduce((s, n) => s + (DURACIONES.includes(String(n?.d)) ? ticks(n) : 0), 0);
      const duracionesBien = voz.every(n => DURACIONES.includes(String(n?.d))); // si no, ya se ha dicho arriba
      const anacrusa = i === 0 && p.anacrusa;
      if (largo != null && duracionesBien && !anacrusa && Math.abs(suma - largo) > 1e-9) err.push(`${nombre}, compás ${i + 1}, voz ${v + 1}: dura ${suma} negras y el compás pide ${largo}`);
      if (largo != null && duracionesBien && anacrusa && suma > largo + 1e-9) err.push(`${nombre}: la anacrusa dura ${suma} negras, más que el compás (${largo})`);
    });
  });
  return err;
}

// El plan de dibujo. opciones.compases: [desde, hasta] (1 en adelante) para un fragmento; se conserva su numeración.
export function prepararNotacion(p, { compases = null } = {}) {
  const errores = validarNotacion(p);
  if (errores.length) return { ok: false, errores, compases: [], avisos: ['La notación tiene errores y no se dibuja: no se muestran notas que no estén bien escritas.'] };
  const arm = armadura(p.armadura ?? 'C');
  const afinacion = (p.afinacion ?? AFINACION).map(midiDe);
  const total = p.compases.length;
  const [desde, hasta] = compases ? [Math.max(1, compases[0]), Math.min(total, compases[1])] : [1, total];
  const avisos = [];
  if (compases && (compases[0] > total || desde > hasta)) {
    return { ok: false, errores: [`Los compases ${compases[0]}-${compases[1]} no están en la notación (tiene ${total})`], compases: [], avisos: ['Ese fragmento no está transcrito todavía.'] };
  }
  if (compases && compases[1] > total) avisos.push(`Del fragmento (compases ${compases[0]}-${compases[1]}) solo están transcritos hasta el ${total}.`);
  if (p.parcial) avisos.push(`Transcritos ${p.parcial.transcritos} de ${p.parcial.total} compases${p.parcial.nota ? `: ${p.parcial.nota}` : ''}. El resto está por hacer y no se dibuja.`);

  const salida = [];
  for (let i = desde - 1; i < hasta; i++) {
    const m = p.compases[i];
    const voces = m.voces.map((voz, v) => {
      let inicio = 0;
      return voz.map((n, k) => {
        const antes = k > 0 ? voz[k - 1] : i > desde - 1 ? p.compases[i - 1].voces[v]?.at(-1) : null;
        const nota = {
          duracion: String(n.d), puntillo: !!n.p, silencio: !!n.s, claves: [], alteraciones: [], tab: [], inicio,
          dedo: n.dedo ?? null, rotulo: n.rotulo ?? null, mano: n.mano ?? null, lig: n.lig ?? null, tie: !!n.tie, art: n.art ?? [], din: n.din ?? null,
          ligadaDesdeAntes: !n.s && !!antes?.tie,
        };
        inicio += ticks(n);
        if (n.s) return nota;
        for (const x of Array.isArray(n.acorde) ? n.acorde : [{ c: n.c, t: n.t }]) {
          const g = grafia(afinacion[x.c - 1] + x.t + 12, arm); // + 12: escrita una octava por encima
          nota.claves.push(`${g.letra}${g.acc}/${g.octava}`);
          nota.tab.push({ cuerda: x.c, traste: x.t });
          nota._g = [...(nota._g || []), g];
        }
        return nota;
      });
    });
    // Alteraciones visibles: las que no da la armadura, o las que cambian lo que ya ha sonado antes en el compás (con
    // becuadro). Las dos voces comparten pentagrama, así que se recorre el compás por orden de tiempo.
    const vigente = {}; // 'letra+octava' → alteración en curso en este compás
    const porTiempo = voces.flatMap((voz, v) => voz.map(n => ({ n, v }))).filter(x => !x.n.silencio)
      .sort((a, b) => a.n.inicio - b.n.inicio || a.v - b.v);
    for (const { n } of porTiempo) {
      if (n.ligadaDesdeAntes) { delete n._g; continue; } // la ligadura prolonga la nota anterior: ni se repite su alteración ni cuenta como dicha
      n._g.forEach((g, k) => {
        const id = `${g.letra}${g.octava}`;
        const esperada = id in vigente ? vigente[id] : arm.alter[g.letra];
        if (g.acc !== esperada) n.alteraciones.push({ indice: k, tipo: g.acc === '' ? 'n' : g.acc });
        vigente[id] = g.acc;
      });
      delete n._g;
    }
    salida.push({ numero: i + 1, pos: m.pos ?? null, voces });
  }
  return {
    ok: true, errores: [], titulo: p.titulo ?? null, compas: compasEn(p.compas), compasVisible: p.compasVisible !== false, armadura: arm.clave, tempo: p.tempo ?? null,
    parcial: p.parcial ?? null, repetir: !!p.repetir, conteo: !!p.conteo, compases: salida, avisos, total,
  };
}

// En qué líneas va cada compás, para un ancho disponible (en píxeles). Cada compás pide sitio según sus notas; la
// primera de cada línea, además, la clave y la armadura (y la primera de todas, el compás). Ninguna línea pasa del
// ancho; las que van llenas se estiran hasta el borde, y la última se queda con su ancho natural si va corta.
export function sistemas(plan, ancho, vista = 'partitura') {
  if (!plan?.ok || !plan.compases.length) return [];
  const alter = Math.abs(armadura(plan.armadura)?.alteraciones ?? 0);
  const cabecera = (primeraLinea) => (vista === 'tablatura' ? 34 : 34 + alter * 11) + (primeraLinea ? 30 : 0) + 10;
  // Cada nota pide su sitio, y más si lleva alteración, digitación o mano derecha; con dos voces, algo más.
  const natural = m => {
    const porVoz = m.voces.map(v => v.reduce((s, n) => s + 23 + (n.alteraciones?.length || n.dedo != null || n.mano ? 12 : 0) + (n.puntillo ? 6 : 0), 0));
    return Math.max(m.voces.length > 1 ? 120 : 90, 30 + Math.max(...porVoz) + (m.voces.length > 1 ? 14 : 0));
  };
  const lineas = [];
  let actual = null;
  plan.compases.forEach((m, i) => {
    const base = natural(m);
    if (!actual || actual.usado + base > ancho) {
      if (actual) lineas.push(actual);
      actual = { compases: [], usado: 0 };
      const w = Math.min(ancho, base + cabecera(lineas.length === 0));
      actual.compases.push({ indice: i, numero: m.numero, ancho: w, primero: true, cabecera: cabecera(lineas.length === 0) });
      actual.usado = w;
    } else {
      actual.compases.push({ indice: i, numero: m.numero, ancho: base, primero: false, cabecera: 0 });
      actual.usado += base;
    }
  });
  lineas.push(actual);
  return lineas.map((l, k) => {
    const ultima = k === lineas.length - 1;
    // La última línea, si va corta, se estira un poco (hasta 1,5 veces) pero no hasta el borde.
    const factor = ultima && l.usado < ancho * 0.7 ? Math.min(1.5, ancho / l.usado) : ancho / l.usado;
    let x = 0;
    const compases = l.compases.map(c => {
      const w = Math.floor(c.ancho * factor);
      const r = { ...c, x, ancho: w };
      x += w;
      return r;
    });
    return { compases, ancho: x };
  });
}
