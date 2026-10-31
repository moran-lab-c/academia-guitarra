// Lo que se sabe de la guitarra por cálculo: qué nota hay en cada cuerda y traste, de qué está hecho un acorde, qué dedos
// se quedan al cambiar y las escenas animadas del mástil. Nada se escribe a mano: si el dato sale de aquí, no puede
// contradecir al diagrama ni a la tablatura. Lógica pura: lo dibuja web/componentes/mastil.js.
import { ACORDES, ventana } from './acordes.js';
import { AFINACION, ARMONICO, armadura, grafia, midiDe, prepararNotacion } from './partitura.js';

const AIRE = AFINACION.map(midiDe); // índice 0 = 1.ª cuerda
const LETRA = { c: 'Do', d: 'Re', e: 'Mi', f: 'Fa', g: 'Sol', a: 'La', b: 'Si' };
const SIGNO = { '': '', '#': '♯', b: '♭', '##': '𝄪', bb: '𝄫' };

export const midiEn = (c, t) => AIRE[c - 1] + t;
export const nombreDe = (midi, clave = 'C') => { const g = grafia(midi, armadura(clave)); return `${LETRA[g.letra]}${SIGNO[g.acc]}`; };
export const notaEn = (c, t, clave = 'C') => nombreDe(midiEn(c, t), clave);
export const ordinal = c => `${c}.ª`;

// La distancia entre dos alturas, por semitonos (hasta la octava, que es lo que se usa en este nivel).
const INTERVALO = { 1: '2.ª menor', 2: '2.ª mayor', 3: '3.ª menor', 4: '3.ª mayor', 5: '4.ª justa', 6: 'tritono', 7: '5.ª justa', 8: '6.ª menor', 9: '6.ª mayor', 10: '7.ª menor', 11: '7.ª mayor', 12: '8.ª' };
export const intervalo = semitonos => INTERVALO[semitonos] ?? null;

// Qué es cada nota dentro del acorde, medida desde la fundamental.
const FUNCION = { 0: 'fundamental', 3: '3.ª menor', 4: '3.ª mayor', 7: '5.ª justa', 10: '7.ª menor', 11: '7.ª mayor' };
const RAIZ = { Do: 0, Re: 2, Mi: 4, Fa: 5, Sol: 7, La: 9, Si: 11 };
export const raizDe = nombre => RAIZ[nombre.match(/^(Do|Re|Mi|Fa|Sol|La|Si)/)[1]];

// Cuerda a cuerda, de la 6.ª a la 1.ª: traste, dedo, nota y papel. Y el resumen: las notas distintas y las que se repiten.
export function anatomiaAcorde(nombre, clave = 'C') {
  const a = ACORDES[nombre];
  if (!a) return null;
  const raiz = raizDe(nombre);
  const cuerdas = a.cuerdas.map((t, i) => {
    const c = 6 - i;
    if (t === null) return { cuerda: c, suena: false };
    const midi = midiEn(c, t);
    return { cuerda: c, suena: true, traste: t, dedo: a.dedos[i], aire: t === 0, midi, nota: nombreDe(midi, clave), funcion: FUNCION[((midi - raiz) % 12 + 12) % 12] ?? null };
  });
  const notas = [];
  for (const x of cuerdas.filter(y => y.suena)) {
    const ya = notas.find(n => n.nota === x.nota);
    if (ya) ya.veces++;
    else notas.push({ nota: x.nota, funcion: x.funcion, veces: 1, orden: ((x.midi - raiz) % 12 + 12) % 12 });
  }
  notas.sort((p, q) => p.orden - q.orden);
  return { nombre, cuerdas, notas, cejilla: a.cejilla, duplicadas: notas.filter(n => n.veces > 1) };
}

const pisadas = a => a.cuerdas.flatMap((t, i) => (t > 0 ? [{ dedo: a.dedos[i], c: 6 - i, t }] : []));

// Qué hace cada dedo al pasar de un acorde a otro. queda: no se mueve; desliza: sigue en su cuerda; salta: cambia de cuerda;
// sale y entra: solo pisa en uno de los dos.
export function compararAcordes(de, a) {
  const A = pisadas(ACORDES[de]), B = pisadas(ACORDES[a]);
  const dedos = [...new Set([...A, ...B].map(x => x.dedo))].sort();
  const lista = dedos.map(dedo => {
    const x = A.find(y => y.dedo === dedo), z = B.find(y => y.dedo === dedo);
    const que = !x ? 'entra' : !z ? 'sale' : x.c === z.c && x.t === z.t ? 'queda' : x.c === z.c ? 'desliza' : 'salta';
    return { dedo, de: x ?? null, a: z ?? null, que };
  });
  return { de, a, dedos: lista, comunes: lista.filter(x => x.que === 'queda').map(x => x.dedo) };
}

// La escala mayor desde una tónica, calculada con el patrón T-T-S-T-T-T-S. Sirve para mostrar grados y para que suene.
const PATRON_MAYOR = [2, 2, 1, 2, 2, 2, 1];
export function escalaMayor(clave = 'C', largo = 8) {
  const pc = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[clave[0]] + (clave[1] === '#' ? 1 : clave[1] === 'b' ? -1 : 0);
  let midi = 48 + ((pc + 12) % 12);
  return Array.from({ length: largo }, (_, i) => {
    const nota = { posicion: i + 1, grado: (i % 7) + 1, midi, nota: nombreDe(midi, clave) };
    midi += PATRON_MAYOR[i % 7];
    return nota;
  });
}

// Una serie de acordes como eventos, para escucharla con el mismo reproductor que una notación.
export function eventosDeAcordes(nombres, { tiempos = 4 } = {}) {
  const eventos = nombres.map((n, i) => {
    const midis = ACORDES[n].cuerdas.flatMap((t, k) => (t === null ? [] : [midiEn(6 - k, t)]));
    return { t: i * tiempos, dur: tiempos, midis, suena: midis.map(() => tiempos), compas: i + 1 };
  });
  return { eventos, largo: nombres.length * tiempos, negras: tiempos };
}

// De la notación a lo que suena: cada nota con su tiempo (en negras), su duración y su compás. Lo usan «Escuchar» y la pista.
// suena: cuánto dura de verdad cada nota: como en una guitarra, hasta que se vuelve a tocar su cuerda (con seco, solo su figura).
const RESONANCIA = 3; // en negras, lo más que se deja sonar una cuerda
export function eventosDeNotacion(json, { compases = null, seco = false } = {}) {
  const plan = prepararNotacion(json, { compases });
  if (!plan.ok) return { eventos: [], largo: 0 };
  const afinacion = (json.afinacion ?? AFINACION).map(midiDe);
  const negras = (plan.compas.num * 4) / plan.compas.den;
  const eventos = [];
  // Una anacrusa entra al final de su compás: sin un hueco antes del compás 1.
  const vacio = json.anacrusa && plan.compases[0].numero === (json.primerCompas ?? 1) ? negras - Math.max(...plan.compases[0].voces.map(v => v.reduce((s, n) => s + (4 / Number(n.duracion)) * (n.puntillo ? 1.5 : 1) * (n.tres ? 2 / 3 : 1), 0))) : 0;
  plan.compases.forEach((m, i) => {
    for (const voz of m.voces) for (const n of voz) {
      if (n.silencio) continue;
      eventos.push({ t: i * negras + n.inicio + (i === 0 ? vacio : 0), dur: (4 / Number(n.duracion)) * (n.puntillo ? 1.5 : 1) * (n.tres ? 2 / 3 : 1), midis: n.tab.map(x => afinacion[x.cuerda - 1] + (n.arm ? ARMONICO[x.traste] : x.traste + (n.oct ? 12 : 0))), cuerdas: n.tab.map(x => x.cuerda), compas: m.numero });
    }
  });
  eventos.sort((a, b) => a.t - b.t);
  const largo = plan.compases.length * negras;
  eventos.forEach((ev, i) => {
    ev.suena = ev.cuerdas.map(c => {
      if (seco) return ev.dur;
      const sig = eventos.slice(i + 1).find(x => x.cuerdas.includes(c));
      return Math.min(RESONANCIA, (sig ? sig.t : largo + 1) - ev.t);
    });
  });
  return { eventos, largo, negras };
}

// ───────── Escenas del mástil ─────────
// Una escena es una lista de cuadros: { texto, base, marcas, cejilla, arcos, flechas, manos, pulso, suena, ms }. Cada marca lleva
// una clave k: si la misma clave sigue en el cuadro siguiente, el dedo viaja hasta su sitio nuevo en lugar de aparecer.
// base: 0 solo la madera; 1 con cuerdas y trastes. El mismo componente sirve para acordes, escalas, arpegios, cambios,
// intervalos, patrones de mano derecha y escenas libres, y se añade un tipo nuevo escribiendo solo su función aquí.
const marcaAcorde = (x, clave, conNota) => ({ k: `d${x.dedo}`, c: x.c, t: x.t, dedo: x.dedo, nota: conNota ? notaEn(x.c, x.t, clave) : null });
const marcaAire = (c, clave, conNota) => ({ k: `a${c}`, c, t: 0, aire: true, nota: conNota ? notaEn(c, 0, clave) : null });
const marcasDe = (nombre, clave, conNota = true) => {
  const a = ACORDES[nombre];
  const out = [];
  a.cuerdas.forEach((t, i) => {
    const c = 6 - i;
    if (t === null) out.push({ k: `x${c}`, c, t: 0, mudo: true });
    else if (t === 0) out.push(marcaAire(c, clave, conNota));
  });
  return [...out, ...pisadas(a).map(x => marcaAcorde(x, clave, conNota))];
};
const rangoDe = nombres => {
  let hasta = 4;
  for (const n of nombres) { const v = ventana(ACORDES[n]); hasta = Math.max(hasta, v.desde + v.trastes - 1); }
  return [0, hasta];
};
const todas = nombre => ACORDES[nombre].cuerdas.flatMap((t, i) => (t === null ? [] : [midiEn(6 - i, t)]));

const ESCENAS = {
  // La construcción de un acorde: espacio vacío, trastes, cuerdas, diagrama completo, cada dedo con su color, cuerdas al aire y
  // las que no suenan, notas y acorde entero. La dibuja web/componentes/diagramaAnimado.js. base: 0 vacío, 1 trastes, 2 cuerdas, 3 completo.
  acorde({ acorde, clave = 'C' }) {
    const a = ACORDES[acorde];
    const an = anatomiaAcorde(acorde, clave);
    const lista = pisadas(a).sort((x, y) => x.dedo - y.dedo);
    const papel = c => an.cuerdas.find(x => x.cuerda === c)?.funcion ?? '';
    const cuadros = [
      { base: 0, marcas: [], ms: 900, texto: 'Empezamos con el espacio vacío.' },
      { base: 1, marcas: [], ms: 1600, texto: 'Las líneas horizontales son los trastes. Arriba, la cejuela: el principio del mástil.' },
      { base: 2, marcas: [], ms: 1800, texto: 'Las verticales son las cuerdas: a la izquierda la 6.ª, la más grave, y a la derecha la 1.ª. Es la guitarra vista de frente.' },
      { base: 3, marcas: [], ms: 1400, texto: 'El diagrama ya está listo. Ahora, los dedos de la mano izquierda.' },
    ];
    const puestas = [];
    if (a.cejilla) cuadros.push({ base: 3, marcas: [], cejilla: a.cejilla, texto: `Cejilla: el dedo ${a.cejilla.dedo} pisa varias cuerdas en el traste ${a.cejilla.traste}.` });
    for (const x of lista) {
      puestas.push(marcaAcorde(x, clave, false));
      cuadros.push({ base: 3, marcas: [...puestas], cejilla: a.cejilla, suena: [midiEn(x.c, x.t)], ms: 2600,
        texto: `Dedo ${x.dedo}: ${ordinal(x.c)} cuerda, traste ${x.t}. Suena ${notaEn(x.c, x.t, clave)}, la ${papel(x.c)} del acorde.` });
    }
    const aire = a.cuerdas.flatMap((t, i) => (t === 0 ? [6 - i] : []));
    const mudas = a.cuerdas.flatMap((t, i) => (t === null ? [6 - i] : []));
    if (aire.length) cuadros.push({ base: 3, marcas: [...puestas, ...aire.map(c => marcaAire(c, clave, false))], cejilla: a.cejilla, suena: aire.map(c => midiEn(c, 0)), arpegiado: true, ms: 2800,
      texto: `Con un círculo, las cuerdas al aire, sin pisar: ${aire.map(c => `${ordinal(c)} (${notaEn(c, 0, clave)})`).join(', ')}.` });
    if (mudas.length) cuadros.push({ base: 3, marcas: marcasDe(acorde, clave, false), cejilla: a.cejilla, ms: 2600,
      texto: `Con una ×, lo que no debe sonar: ${mudas.map(c => `${ordinal(c)} cuerda`).join(' y ')}.` });
    cuadros.push({ base: 3, marcas: marcasDe(acorde, clave, true), cejilla: a.cejilla, suena: todas(acorde), arpegiado: true, ms: 3200, final: true, texto: `${acorde} completo: ${an.notas.map(n => n.nota).join(', ')}. Debajo tienes la nota de cada cuerda.` });
    return { trastes: rangoDe([acorde]), acorde, cuadros };
  },

  // Un acorde que se convierte en otro: los dedos viajan, y el que no se mueve se ve quieto.
  cambio({ de, a, clave = 'C', textos = {} }) {
    const cmp = compararAcordes(de, a);
    const trastes = rangoDe([de, a]);
    const quietos = new Set(cmp.comunes.map(d => `d${d}`));
    const conRol = (lista) => lista.map(m => (quietos.has(m.k) ? { ...m, rol: 'queda' } : m));
    const decir = cmp.comunes.length
      ? `El dedo ${cmp.comunes.join(' y el ')} no se mueve: pisa lo mismo en los dos acordes.`
      : 'Ningún dedo pisa lo mismo en los dos acordes: aquí se prepara el cambio antes de hacerlo.';
    return { trastes, cuadros: [
      { base: 1, marcas: marcasDe(de, clave), suena: todas(de), arpegiado: true, texto: textos.inicio ?? `${de}.`, ms: 2200 },
      { base: 1, marcas: conRol(marcasDe(de, clave)), texto: textos.medio ?? decir, ms: 3000 },
      { base: 1, marcas: conRol(marcasDe(a, clave)), suena: todas(a), arpegiado: true, texto: textos.fin ?? `${a}.`, ms: 2800 },
    ] };
  },

  // Varias notas una detrás de otra, por el mástil: una escala o un arpegio. Se quedan encendidas las que ya han sonado.
  recorrido({ notas, clave = 'C', trastes = [0, 5], ms = 900, final }) {
    const puestas = [];
    const cuadros = [{ base: 1, marcas: [], ms: 600, texto: 'Mira el recorrido.' }];
    notas.forEach((n, i) => {
      const ya = puestas.findIndex(p => p.c === n.c && p.t === n.t);
      const m = { k: `n${n.c}-${n.t}`, c: n.c, t: n.t, dedo: n.dedo ?? null, aire: n.t === 0, etiq: n.grado ?? null, nota: notaEn(n.c, n.t, clave) };
      if (ya < 0) puestas.push(m);
      cuadros.push({ base: 1, marcas: puestas.map(p => (p.k === m.k ? { ...p, rol: 'ahora' } : p)), suena: [midiEn(n.c, n.t)], ms,
        texto: `${n.texto ?? notaEn(n.c, n.t, clave)}${n.t === 0 ? ` · ${ordinal(n.c)} al aire` : ` · ${ordinal(n.c)}, traste ${n.t}`}${n.dedo ? `, dedo ${n.dedo}` : ''}${n.mano ? `, mano derecha ${n.mano}` : ''}` });
      void i;
    });
    cuadros.push({ base: 1, marcas: [...puestas], texto: final ?? 'El recorrido entero.', ms: 2600 });
    return { trastes, cuadros };
  },

  // Distancias sobre una sola cuerda: cada traste es un semitono. pasos: [{ a: traste, texto, nombre }]; acaba en lo que se quiera.
  distancias({ cuerda = 1, desde = 0, trastes = [0, 12], clave = 'C', pasos, final }) {
    const marca = t => ({ k: `t${t}`, c: cuerda, t, aire: t === 0, nota: notaEn(cuerda, t, clave) });
    const puestas = [marca(desde)];
    const arcos = [];
    const cuadros = [{ base: 1, marcas: [...puestas], suena: [midiEn(cuerda, desde)], texto: `${notaEn(cuerda, desde, clave)}: el punto de partida. Cada traste es un semitono.`, ms: 2200 }];
    let antes = desde;
    for (const p of pasos) {
      if (p.mover != null) {
        const i = puestas.findIndex(x => x.t === p.mover);
        puestas[i] = { ...marca(p.a), k: puestas[i].k };
        const j = arcos.findIndex(x => x.hasta === p.mover);
        if (j >= 0) arcos.splice(j, 1);
      } else puestas.push(marca(p.a));
      if (p.arco) arcos.push({ c: cuerda, de: p.de ?? antes, hasta: p.a, texto: p.arco });
      cuadros.push({ base: 1, marcas: [...puestas], arcos: [...arcos], suena: [midiEn(cuerda, p.a)], texto: p.texto, ms: p.ms ?? 2400 });
      antes = p.a;
    }
    if (final) cuadros.push({ base: 1, marcas: [...puestas], arcos: [...arcos], suena: puestas.map(x => midiEn(cuerda, x.t)), arpegiado: true, texto: final, ms: 3000 });
    return { trastes, cuadros };
  },

  // La mano izquierda fija en un acorde y la derecha que pulsa: p, i, m y a cada una en su cuerda.
  manoDerecha({ acorde, clave = 'C', cuerdas, ms = 800, veces = 2 }) {
    const manos = cuerdas.map(x => ({ c: x.c, letra: x.mano }));
    const marcas = marcasDe(acorde, clave);
    const cuadros = [{ base: 1, marcas, manos, boca: true, ms: 2600, texto: 'Antes de sonar, cada dedo de la mano derecha ya está en su cuerda.' }];
    for (let v = 0; v < veces; v++) for (const x of cuerdas) {
      const t = ACORDES[acorde].cuerdas[6 - x.c];
      cuadros.push({ base: 1, marcas, manos, boca: true, pulso: x.c, ms, suena: [midiEn(x.c, t)], texto: `${x.mano}: ${ordinal(x.c)} cuerda, ${notaEn(x.c, t, clave)}.` });
    }
    cuadros.push({ base: 1, marcas, manos, boca: true, ms: 2600, texto: `La mano izquierda no se ha movido: ${acorde} sigue puesto. Lo que cambia es qué dedo de la derecha pulsa.` });
    return { trastes: rangoDe([acorde]), boca: true, cuadros };
  },

  // Un ejercicio de principio a fin: el fragmento de mástil, el zoom a la zona, cada dedo que aparece, la secuencia con lo que hace
  // cada mano, y el resultado. notas: [{ c, t, dedo, mano, con: [otra nota a la vez], texto }]. Un dedo es una sola marca: si cambia de
  // sitio se le ve viajar, y si no se mueve se queda puesto. Sirve para escalas, ligados, dedo guía, cruces y trémolo.
  ejercicio({ notas, clave = 'C', trastes = [0, 12], zoom = null, ms = 850, inicio, final }) {
    const todas = notas.flatMap(n => [n, ...(n.con ?? [])]);
    const conMano = todas.some(n => n.mano);
    const manos = conMano ? [...new Map(todas.filter(n => n.mano).map(n => [n.c, { c: n.c, letra: n.mano }])).values()] : undefined;
    const marca = n => (n.dedo
      ? { k: `d${n.dedo}`, c: n.c, t: n.t, dedo: n.dedo, nota: notaEn(n.c, n.t, clave) }
      : { k: `a${n.c}`, c: n.c, t: 0, aire: true, nota: notaEn(n.c, 0, clave) });
    const cuadros = [];
    if (zoom) {
      cuadros.push({ base: 1, marcas: [], ms: 1600, texto: inicio ?? 'Este es el mástil. Vamos a acercarnos a la zona donde se toca.' });
      cuadros.push({ base: 1, marcas: [], zoom, ms: 1500, texto: `Aquí: ${zoom[0] <= 1 ? 'al principio del mástil' : `del traste ${zoom[0]} al ${zoom[1]}`}.` });
    }
    // Cada dedo, de uno en uno, donde va a empezar.
    const puestos = new Map();
    for (const n of todas) if (n.dedo && !puestos.has(n.dedo)) {
      puestos.set(n.dedo, marca(n));
      cuadros.push({ base: 1, marcas: [...puestos.values()], zoom, ms: 1500, suena: [midiEn(n.c, n.t)], texto: `Dedo ${n.dedo}: ${ordinal(n.c)} cuerda, traste ${n.t}. ${notaEn(n.c, n.t, clave)}.` });
    }
    // La secuencia: los dedos siguen donde se quedaron y se marca lo que suena.
    const vivos = new Map();
    for (const n of notas) {
      const grupo = [n, ...(n.con ?? [])];
      for (const x of grupo) if (x.dedo) vivos.set(x.dedo, marca(x));
      const ahora = new Set(grupo.map(x => marca(x).k));
      const lista = [...vivos.values(), ...grupo.filter(x => !x.dedo).map(marca)].map(m => (ahora.has(m.k) ? { ...m, rol: 'ahora' } : m));
      cuadros.push({ base: 1, marcas: lista, zoom, manos, pulso: n.c, pulsos: grupo.map(x => x.c), boca: conMano, ms: n.ms ?? ms, suena: grupo.map(x => midiEn(x.c, x.t)),
        texto: n.texto ?? grupo.map(x => `${x.mano ? `${x.mano}: ` : ''}${ordinal(x.c)}${x.t ? `, traste ${x.t}, dedo ${x.dedo}` : ' al aire'} · ${notaEn(x.c, x.t, clave)}`).join('  +  ') });
    }
    cuadros.push({ base: 1, marcas: [...vivos.values()], zoom, manos, ms: 2400, suena: [], texto: final ?? 'Ahora tócalo tú, igual de despacio.' });
    return { trastes, boca: conMano, cuadros };
  },

  // Cuadros escritos a mano para lo que no es un patrón (la resolución del tritono, p. ej.). Las notas se calculan igual.
  libre({ trastes = [0, 4], clave = 'C', cuadros }) {
    return { trastes, cuadros: cuadros.map(q => ({
      base: 1, ...q,
      marcas: (q.marcas ?? []).map(m => ({ k: m.k ?? `${m.c}-${m.t}`, aire: m.t === 0, nota: m.sinNota ? null : notaEn(m.c, m.t, clave), ...m })),
      suena: q.suena ?? (q.marcas ?? []).filter(m => !m.mudo && !m.callada).map(m => midiEn(m.c, m.t)),
    })) };
  },
};

// El ritmo, sin mástil: cada nota es una barra que ocupa lo que dura, sobre los tiempos del compás. Lo dibuja web/componentes/ritmo.js.
// figuras: [{ d: duración en negras, nota: [cuerda, traste], fuerte, nombre }]; tiempos: cuántos tiene el compás; agrupar: cada cuántos se marca.
export function escenaRitmo({ figuras, tiempos = 4, por = 60 }) {
  let t = 0;
  const lista = figuras.map(f => { const x = { ...f, t }; t += f.d; return x; });
  const cuadros = lista.map((f, i) => ({ encendidas: i + 1, suena: [midiEn(f.nota?.[0] ?? 1, f.nota?.[1] ?? 0)], ms: Math.max(350, f.d * (60000 / por)), texto: f.texto ?? `${f.nombre ?? ''}` }));
  cuadros.push({ encendidas: lista.length, ms: 1800, texto: 'Todo junto, sobre el pulso.', suena: [] });
  return { lista, tiempos, largo: t, cuadros };
}

export const TIPOS_ESCENA = [...Object.keys(ESCENAS), 'ritmo'];
export function escena(spec) {
  if (spec?.tipo === 'ritmo') return escenaRitmo(spec);
  const crear = ESCENAS[spec?.tipo];
  return crear ? crear(spec) : null;
}

// Los errores de una descripción de escena (vacío si está bien): acordes que existen, cuerdas y trastes posibles.
export function validarEscena(spec) {
  const err = [];
  if (spec?.tipo === 'ritmo') { const e = escenaRitmo(spec); return Math.abs((e.largo / e.tiempos) % 1) < 1e-9 ? [] : [`el ritmo dura ${e.largo} tiempos y no llena compases de ${e.tiempos}`]; }
  if (!ESCENAS[spec?.tipo]) return [`escena desconocida: ${spec?.tipo}`];
  for (const n of [spec.acorde, spec.de, spec.a]) if (n && !ACORDES[n]) err.push(`acorde desconocido: ${n}`);
  if (err.length) return err;
  const e = escena(spec);
  if (!e.cuadros.length) err.push('escena sin cuadros');
  for (const q of e.cuadros) for (const m of q.marcas ?? []) {
    if (!(m.c >= 1 && m.c <= 6 && m.t >= 0 && m.t <= 24)) err.push(`marca imposible: cuerda ${m.c}, traste ${m.t}`);
    if (m.t > e.trastes[1]) err.push(`la marca del traste ${m.t} no cabe en la escena (${e.trastes.join('-')})`);
  }
  return err;
}
