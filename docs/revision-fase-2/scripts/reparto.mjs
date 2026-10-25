// Reparto real por área en los días del «alumno perfecto» (sim-fallo-60.json) frente al reparto base del curso.
// Uso: node reparto.mjs [archivo] [desde] [hasta]
import fs from 'node:fs';
import { ctxDe, planificar, enDia } from './comun.mjs';
import { sumarDias } from 'file:///C:/Users/david/The%20Cave/08%20-%20Guitarra/Academia/app/logica/fechas.js';
const [archivo = 'sim-fallo-60.json', desde = '2026-10-27', hasta = '2026-11-07'] = process.argv.slice(2);
const { estado, eventos } = JSON.parse(fs.readFileSync(new URL('./' + archivo, import.meta.url)));
const suma = {}; let total = 0, maxBloque = { m: 0 };
for (let d = desde; d <= hasta; d = sumarDias(d, 1)) {
  const ctx = ctxDe({ estado, eventos: eventos.filter(e => e.t < enDia(d, 0)), hoy: d });
  for (const b of planificar(ctx, { minutos: 60 }).bloques) {
    if (['calentamiento', 'pausa'].includes(b.tipo)) continue;
    const a = b.tipo === 'comprobacion' ? 'comprobacion' : b.area;
    suma[a] = (suma[a] ?? 0) + b.minutos; total += b.minutos;
    if (b.minutos > maxBloque.m) maxBloque = { m: b.minutos, d, t: b.titulo };
  }
}
console.log(`${desde} → ${hasta}, 60′/día, minutos útiles ${total}`);
for (const [a, m] of Object.entries(suma).sort((x, y) => y[1] - x[1])) console.log(`  ${a.padEnd(14)} ${String(m).padStart(4)} min  ${(100 * m / total).toFixed(0)} %`);
console.log(`  bloque más largo: ${maxBloque.m} min (${maxBloque.d}, ${maxBloque.t})`);
