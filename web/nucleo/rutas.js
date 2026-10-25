// Direcciones con # (por ejemplo #/obra/obra:tarrega.lagrima): cada pantalla se puede abrir directamente.
const tabla = [];

export function ruta(patron, vista) {
  const nombres = [];
  const re = new RegExp('^' + patron.replace(/:(\w+)/g, (_, n) => { nombres.push(n); return '([^/]+)'; }) + '$');
  tabla.push({ re, nombres, vista });
}

export function actual() {
  const hash = location.hash.slice(1) || '/';
  for (const r of tabla) {
    const m = hash.match(r.re);
    if (m) return { vista: r.vista, params: Object.fromEntries(r.nombres.map((n, i) => [n, decodeURIComponent(m[i + 1])])), hash };
  }
  return null;
}

export const enlace = (...partes) => '#' + partes.map((p, i) => (i ? encodeURIComponent(p) : p)).join('/');
export const ir = (...partes) => { location.hash = enlace(...partes).slice(1); };

// Volver a dibujar la pantalla actual sin moverse de sitio (para cambios que solo viven en la pantalla).
export const repintar = () => window.dispatchEvent(new Event('academia:repintar'));
