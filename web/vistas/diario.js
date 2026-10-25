// Diario de práctica: todo lo registrado, por días, y notas sueltas.
import { h, valores } from '../nucleo/dom.js';
import { ctx, registrar } from '../nucleo/almacen.js';
import { dia } from '../../logica/fechas.js';
import { nombreDe } from '../../logica/catalogo.js';
import { fecha } from '../componentes/comunes.js';

export default function diario() {
  const c = ctx();
  const porDia = new Map();
  for (const e of [...c.eventos].reverse()) (porDia.get(dia(e.t)) ?? porDia.set(dia(e.t), []).get(dia(e.t))).push(e);
  const form = h('form', { class: 'tarjeta', onsubmit: ev => {
    ev.preventDefault();
    const { texto } = valores(form);
    if (texto.trim()) registrar({ tipo: 'nota', texto: texto.trim() });
  } }, h('label', { style: 'display:flex' }, 'Nota del día (cómo ha ido, dudas, objetivos)', h('textarea', { name: 'texto' })), h('button', { class: 'principal', type: 'submit' }, 'Guardar nota'));

  return h('div', null,
    h('h1', null, 'Diario'),
    form,
    porDia.size === 0 && h('p', { class: 'suave' }, 'Todavía no hay nada registrado.'),
    [...porDia].map(([d, evs]) => h('div', null,
      h('h2', null, fecha(d), h('span', { class: 'suave' }, ` · ${evs.filter(e => e.tipo === 'practica').reduce((s, e) => s + (e.min || 0), 0)} min`)),
      h('ul', null, evs.map(e => h('li', null, linea(c, e)))))));
}

function linea(c, e) {
  const nombre = nombreDe(c.cat.porId.get(e.item)) || e.item;
  switch (e.tipo) {
    case 'practica': return `${e.modo === 'comprobacion' ? 'Comprobación en frío' : 'Práctica'}: ${nombre} · ${e.min || 0} min${e.tempo ? ` · ♩=${e.tempo}` : ''}${e.limpias != null ? ` · ${e.limpias} limpias` : ''}${e.valoracion ? ` · ${e.valoracion}/5` : ''}${e.nota ? ` · «${e.nota}»` : ''}`;
    case 'sesion': return `Sesión de ${e.minutosPlan} min (${{ clasica: 'programa clásico', flamenca: 'programa flamenco', ambas: 'los dos programas' }[e.programa ?? e.ruta] ?? e.programa}): ${e.bloques.filter(b => b.hecho).length} de ${e.bloques.length} bloques hechos`;
    case 'nota': return `Nota: ${e.texto}`;
    case 'bateria': return `Ejercicios de ${e.area ?? 'la app'}`;
    case 'diagnostico': return 'Evaluación inicial';
    default: return e.tipo;
  }
}
