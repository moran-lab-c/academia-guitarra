// Los acordes que piden los pasos del currículo, con su digitación habitual. Cada forma, de la 6.ª cuerda a la 1.ª:
// cuerdas: traste (0 al aire, null no se toca); dedos: el dedo de cada cuerda; cejilla: { traste, desde, hasta, dedo }.
// De aquí sale el diagrama (web/componentes/acorde.js). Formas estándar de guitarra, no contenido pedagógico.
const F = (cuerdas, dedos, cejilla = null) => ({ cuerdas, dedos, cejilla });
const _ = null;

export const ACORDES = {
  'Do': F([_, 3, 2, 0, 1, 0], [_, 3, 2, 0, 1, 0]),
  'Do7': F([_, 3, 2, 3, 1, 0], [_, 3, 2, 4, 1, 0]),
  'Re': F([_, _, 0, 2, 3, 2], [_, _, 0, 1, 3, 2]),
  'Re7': F([_, _, 0, 2, 1, 2], [_, _, 0, 2, 1, 3]),
  'Re m': F([_, _, 0, 2, 3, 1], [_, _, 0, 2, 3, 1]),
  'Mi': F([0, 2, 2, 1, 0, 0], [0, 2, 3, 1, 0, 0]),
  'Mi7': F([0, 2, 0, 1, 0, 0], [0, 2, 0, 1, 0, 0]),
  'Mi m': F([0, 2, 2, 0, 0, 0], [0, 2, 3, 0, 0, 0]),
  'Fa': F([_, _, 3, 2, 1, 1], [_, _, 3, 2, 1, 1], { traste: 1, desde: 2, hasta: 1, dedo: 1 }),
  'Fa△7': F([_, _, 3, 2, 1, 0], [_, _, 3, 2, 1, 0]),
  'Sol': F([3, 2, 0, 0, 0, 3], [2, 1, 0, 0, 0, 3]),
  'Sol7': F([3, 2, 0, 0, 0, 1], [3, 2, 0, 0, 0, 1]),
  'Sol m': F([3, 5, 5, 3, 3, 3], [1, 3, 4, 1, 1, 1], { traste: 3, desde: 6, hasta: 1, dedo: 1 }),
  'La': F([_, 0, 2, 2, 2, 0], [_, 0, 1, 2, 3, 0]),
  'La7': F([_, 0, 2, 0, 2, 0], [_, 0, 2, 0, 3, 0]),
  'La m': F([_, 0, 2, 2, 1, 0], [_, 0, 2, 3, 1, 0]),
  'La (cejilla V)': F([5, 7, 7, 6, 5, 5], [1, 3, 4, 2, 1, 1], { traste: 5, desde: 6, hasta: 1, dedo: 1 }),
  'Si7': F([_, 2, 1, 2, 0, 2], [_, 2, 1, 3, 0, 4]),
  'Si♭': F([_, 1, 3, 3, 3, 1], [_, 1, 2, 3, 4, 1], { traste: 1, desde: 5, hasta: 1, dedo: 1 }),
};

const NOMBRES = Object.keys(ACORDES).sort((a, b) => b.length - a.length).map(n => n.replace(/[()]/g, '\\$&')).join('|');
const CADENA = new RegExp(`(?:${NOMBRES})(?:–(?:${NOMBRES}))+`, 'g');
const UNO = new RegExp(`^(?:${NOMBRES})`);

// Los acordes que nombra un paso: las cadenas «Mi–La–Si7–Mi» y, en los pasos de acordes, las listas «Mi, La y Si7».
// Sin repetir y en orden. Lo que no se nombra no se dibuja.
export function acordesDe(paso) {
  if (!paso.recursos?.includes('acordes')) return [];
  const texto = paso.texto.replaceAll('*', '');
  const vistos = [];
  const anadir = n => { if (ACORDES[n] && !vistos.includes(n)) vistos.push(n); };
  for (const cadena of texto.match(CADENA) ?? []) {
    let resto = cadena;
    while (resto) {
      const m = resto.match(UNO);
      if (!m) break;
      anadir(m[0]);
      resto = resto.slice(m[0].length).replace(/^–/, '');
    }
  }
  if (!vistos.length) {
    if (/^Fa con media cejilla/.test(texto)) anadir('Fa');
    else if (paso.tipo === 'Acordes' || /^Acordes abiertos/.test(texto)) {
      const lista = texto.replace(/^Acordes abiertos /, '').match(new RegExp(`^(?:${NOMBRES})(?:(?:, | y )(?:${NOMBRES}))*\\.?$`));
      if (lista) for (const n of lista[0].replace(/\.$/, '').split(/, | y /)) anadir(n);
    }
    if (/cejilla del V/i.test(texto)) anadir('La (cejilla V)');
  }
  return vistos;
}

// El primer traste que se dibuja y cuántos caben: 1-4, o desde el traste más bajo si la forma va más arriba.
export function ventana(acorde) {
  const pisados = acorde.cuerdas.filter(t => t > 0);
  const max = Math.max(...pisados, 1), min = Math.min(...pisados, 1);
  const desde = max <= 4 ? 1 : min;
  return { desde, trastes: Math.max(4, max - desde + 1) };
}
