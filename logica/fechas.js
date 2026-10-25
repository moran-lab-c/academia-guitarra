// Fechas en hora local: los días de práctica son los de su reloj, no los de UTC.
const DIA_MS = 86400000;
const dos = n => String(n).padStart(2, '0');

// 'AAAA-MM-DD' del día local de una fecha (Date, ISO o 'AAAA-MM-DD').
export function dia(x) {
  const d = aFecha(x);
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

export const mes = x => dia(x).slice(0, 7);

// Días naturales de a a b (negativo si b es anterior).
export function diasEntre(a, b) {
  return Math.round((medianoche(b) - medianoche(a)) / DIA_MS);
}

export function sumarDias(x, n) {
  const d = aFecha(x);
  return dia(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
}

function aFecha(x) {
  if (typeof x === 'string' && x.length === 10) return new Date(x + 'T00:00:00'); // sin zona: hora local
  return new Date(x);
}

function medianoche(x) {
  const d = aFecha(x);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}
