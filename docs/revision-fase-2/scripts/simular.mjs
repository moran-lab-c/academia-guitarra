// Un «alumno perfecto»: cada día hace la sesión que propone la app y todo le sale bien. Sirve para ver si la ruta avanza,
// si el refuerzo desaparece y la obra vuelve, y si algo se queda atascado.
// Uso: node simular.mjs <escenario: nuevo|fallo|conocida> [días] [minutos]
import { ctxDe, planificar, estadoInicial, tramo1, frioMal, hecho, practica, tanda, BIEN, LAGRIMA, cat, enDia } from './comun.mjs';
import { sumarDias } from 'file:///C:/Users/david/The%20Cave/08%20-%20Guitarra/Academia/app/logica/fechas.js';

const [esc = 'fallo', dias = '30', minutos = '60'] = process.argv.slice(2);
let estado = estadoInicial();
let eventos = [];
if (esc === 'fallo') eventos = [...tramo1('2026-10-14'), hecho('comp:tec.media-cejilla', '2026-10-20'), frioMal('comp:tec.media-cejilla', '2026-10-24')];
if (esc === 'conocida') { estado.obras[LAGRIMA] = { conocida: { nivel: 'entera' } }; eventos = tramo1('2026-10-20', { conA: false }); }
let n = 0;
const ev = (item, fecha, hora, extra) => {
  const it = cat.porId.get(item.split('#')[0]);
  const [id, seccion] = item.split('#');
  if (it?.criterio?.tipo === 'conocimiento') return { id: `s${++n}`, t: enDia(fecha, hora), tipo: 'bateria', resultados: { [id]: [20, 20, 1200] } };
  const obra = it?.tipo === 'obra';
  return { id: `s${++n}`, t: enDia(fecha, hora), tipo: 'practica', item: id, ...(seccion ? { seccion } : {}), calidad: BIEN, pasadas: obra ? 1 : 3, ayuda: obra ? 'notacion' : 'ninguna', min: 5, ...extra };
};

let dia = '2026-10-25';
const resumen = [];
for (let d = 0; d < Number(dias); d++, dia = sumarDias(dia, 1)) {
  const ctx = ctxDe({ estado, eventos, hoy: dia });
  const r = ctx.rutaActual('clasica');
  const plan = planificar(ctx, { minutos: Number(minutos) });
  const refuerzos = r.tramos.flatMap(t => t.pasos).filter(p => p.insertado).map(p => p.comp.replace('comp:', '') + (p.porLectura ? '(lect)' : ''));
  const obra = plan.bloques.find(b => b.tipo === 'obra');
  const frio = plan.bloques.find(b => b.tipo === 'comprobacion');
  if (process.env.PLANES) resumen.push("   " + plan.bloques.map(b => `${b.tipo}${b.modo ? "/" + b.modo : ""}(${b.minutos}) ${(b.item ?? "").replace(/^(comp|obra|ej):/, "")}${b.seccion ? "#" + b.seccion : ""}${b.items ? "[" + b.items.map(i => i.id.replace(/^(comp|obra):/, "")).join(",") + "]" : ""}`).join(" · "));
  resumen.push(`${dia} curso=${r.curso.numero} actual=${r.actual?.replace('paso:', '') ?? '-'} tramos=${r.tramos.map(t => t.estado[0]).join('')} final=${r.final?.estado} · frío=${frio?.items.length ?? 0} · obra=${obra ? obra.item.replace('obra:', '') + (obra.seccion ? '#' + obra.seccion : '') + (obra.modo ? '/' + obra.modo : '') : '-'} · ref=[${refuerzos.join(',')}] · ${plan.avisos.filter(a => /repaso/.test(a)).join('')}`);
  let hora = 8;
  for (const b of plan.bloques) {
    if (b.tipo === 'comprobacion') for (const x of b.items) eventos.push(ev(x.id, dia, hora++, { modo: 'comprobacion', enFrio: true, pasadas: cat.porId.get(x.id.split('#')[0]).tipo === 'obra' ? 1 : 2 }));
    else if (['paso', 'refuerzo', 'area', 'encargo'].includes(b.tipo) && b.item) eventos.push(ev(b.seccion ? `${b.item}#${b.seccion}` : b.item, dia, hora++));
    else if (b.tipo === 'obra' || b.tipo === 'pasada') eventos.push(ev(b.seccion ? `${b.item}#${b.seccion}` : b.item, dia, hora++, b.modo === 'comprobacion' ? { modo: 'comprobacion', enFrio: true } : {}));
  }
}
console.log(resumen.join('\n'));
import fs from 'node:fs';
fs.writeFileSync(new URL(`./sim-${esc}-${minutos}.json`, import.meta.url), JSON.stringify({ estado, eventos }));
