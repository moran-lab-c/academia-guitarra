// Encargos de clase: lo que manda el profesor va primero en «¿Qué hago hoy?».
import { h, valores } from '../nucleo/dom.js';
import { ctx, cambiar } from '../nucleo/almacen.js';
import { sumarDias } from '../../logica/fechas.js';
import { nombreDe } from '../../logica/catalogo.js';
import { enlaceItem, fecha, tarjeta } from '../componentes/comunes.js';

// La próxima clase (por defecto, el martes siguiente): hasta entonces vale el encargo.
function proximaClase(hoy, dia = 2) {
  const d = new Date(hoy + 'T12:00:00');
  return sumarDias(hoy, ((dia - d.getDay() + 7) % 7) || 7);
}

export default function profesor() {
  const c = ctx();
  const tareas = c.estado.tareasProfesor || [];
  const activas = tareas.filter(t => t.estado !== 'hecha' && t.estado !== 'cancelada');
  const opciones = [...c.cat.obras, ...c.cat.competencias].map(x => h('option', { value: x.id }, `${x.tipo === 'obra' ? 'Obra' : c.cat.porId.get(x.area)?.nombre}: ${nombreDe(x)}`));
  const marcar = (id, estado) => cambiar(e => { const t = e.tareasProfesor.find(x => x.id === id); if (t) t.estado = estado; });

  const form = h('form', { class: 'tarjeta', onsubmit: ev => {
    ev.preventDefault();
    const v = valores(form);
    if (!v.item && !v.texto.trim()) return;
    cambiar(e => e.tareasProfesor.push({
      id: `tp_${Date.now().toString(36)}`, clase: c.hoy, item: v.item || null, texto: v.texto.trim() || null, detalle: v.detalle || null,
      minutos: v.minutos || 15, hasta: v.hasta || null, programa: v.item ? undefined : v.programa, formato: v.formato || null, tempo: v.tempo || null, estado: 'activa',
    }));
  } },
    h('div', { class: 'fila' },
      h('label', null, 'Qué te ha mandado', h('select', { name: 'item' }, h('option', { value: '' }, '— (escríbelo abajo)'), opciones)),
      h('label', null, 'O escríbelo', h('input', { name: 'texto', placeholder: 'Pasaje, ejercicio…' })),
      h('label', null, 'Minutos al día', h('input', { type: 'number', name: 'minutos', value: 15, min: 5, style: 'width:6em' })),
      h('label', null, 'Hasta', h('input', { type: 'date', name: 'hasta', value: proximaClase(c.hoy) })),
      h('label', null, 'Programa (si lo escribes)', h('select', { name: 'programa' }, h('option', { value: 'clasica' }, 'Clásico'), h('option', { value: 'flamenca' }, 'Flamenco'))),
      h('label', null, 'Con qué te ha dicho que la mires', h('select', { name: 'formato' }, h('option', { value: '' }, 'No lo ha dicho'), h('option', { value: 'partitura' }, 'Partitura'), h('option', { value: 'tablatura' }, 'Tablatura'))),
      h('label', null, 'Tempo que te ha pedido (opcional)', h('input', { type: 'number', name: 'tempo', min: 30, max: 240, placeholder: '♩=', style: 'width:6em' }))),
    h('label', { style: 'display:flex' }, 'Cómo (compases, tempo, digitación que te ha dado…)', h('textarea', { name: 'detalle' })),
    h('button', { class: 'principal', type: 'submit' }, 'Añadir encargo'));

  return h('div', null,
    h('h1', null, 'Encargos del profesor'),
    h('p', { class: 'suave' }, 'Van antes que lo que propone la app. Si una digitación de la app no coincide con la suya, vale la suya.'),
    form,
    h('h2', null, 'Activos'),
    activas.length ? activas.map(t => tarjeta(
      h('strong', null, t.texto || enlaceItem(c.cat.porId.get(t.item))), h('span', { class: 'suave' }, ` · ${t.minutos} min al día · hasta el ${fecha(t.hasta)}${t.formato ? ` · en ${t.formato}` : ''}${t.tempo ? ` · a ♩=${t.tempo}` : ''}`),
      t.detalle && h('p', null, t.detalle),
      h('div', { class: 'fila' }, h('button', { onclick: () => marcar(t.id, 'hecha') }, 'Hecho'), h('button', { onclick: () => marcar(t.id, 'cancelada') }, 'Quitar')))) : h('p', { class: 'suave' }, 'Ninguno.'),
    tareas.length > activas.length && h('details', null, h('summary', null, 'Anteriores'),
      h('ul', null, tareas.filter(t => !activas.includes(t)).map(t => h('li', null, t.texto || nombreDe(c.cat.porId.get(t.item)), ` · ${t.estado}`)))));
}
