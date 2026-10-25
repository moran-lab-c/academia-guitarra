// Formulario para registrar un intento: cada aspecto que pide el criterio (bien, con fallos, mal), las pasadas,
// el tempo si se quiere apuntar, la ayuda y con qué se ha leído. Ver el apartado 7 del plan.
import { h, valores } from '../nucleo/dom.js';
import { ctx, registrar } from '../nucleo/almacen.js';
import { repintar } from '../nucleo/rutas.js';
import { criterioDe, textoCriterio } from '../../logica/dominio.js';
import { areaDe } from '../../logica/catalogo.js';
import { DIMENSIONES } from '../../logica/esquema.js';

// item: competencia, obra o ejercicio del catálogo (o null en un encargo de texto libre).
// extra: { modo: 'trabajo'|'comprobacion', area, minutos, encargo, sesion, idLibre, seccion, paso }. Con «paso», la
// práctica queda anotada para ese paso de la ruta (es la evidencia de que una aplicación se ha trabajado).
// Si la obra es obra final de un curso, se puede marcar si ha salido de memoria y si se ha grabado (sus requisitos).
export function formularioRegistro(item, extra = {}, alGuardar = () => {}) {
  const c = ctx();
  const crit = item ? criterioDe(item, c.estado.ajustes?.[item.id]) : { tipo: 'ejecucion', dimensiones: ['precision', 'ritmo'], pasadas: 1 };
  const frio = extra.modo === 'comprobacion';
  const campo = (etiqueta, control) => h('label', null, etiqueta, control);
  const num = (name, valor, min = 0, max) => h('input', { type: 'number', name, value: valor ?? '', min, max, style: 'width:6em' });
  const elegir = (name, opciones, valor) => h('select', { name }, opciones.map(([v, t]) => h('option', { value: v, selected: String(v) === String(valor) }, t)));

  const aspectos = h('div', { class: 'aspectos' }, crit.dimensiones.map(d => h('div', { class: 'fila' },
    h('span', null, DIMENSIONES[d]),
    ...[['bien', 'Bien'], ['fallos', 'Con fallos'], ['mal', 'Mal']].map(([v, t]) => h('label', { class: 'check' }, h('input', { type: 'radio', name: `cal_${d}`, value: v }), t)))));
  const todoBien = h('button', { type: 'button', onclick: () => aspectos.querySelectorAll('input[value="bien"]').forEach(x => { x.checked = true; }) }, 'Todo bien');

  const secciones = item?.tipo === 'obra' ? item.secciones || [] : [];
  const requisitos = item?.tipo === 'obra' ? [...new Set((c.cat.finalDe.get(item.id) || []).flatMap(cu => cu.obraFinal.requisitos || []))] : [];
  const campos = crit.tipo === 'conocimiento'
    ? [campo('Aciertos', num('aciertos', null)), campo('Preguntas', num('preguntas', crit.preguntas, 1)), campo('Segundos por respuesta (media, opcional)', num('segundos', null))]
    : [
      campo(item?.tipo === 'obra' ? 'Pasadas completas (si solo has tocado una parte, elige la sección)' : 'Pasadas seguidas bien', num('pasadas', null)),
      campo(`Tempo (${crit.tempo?.unidad ?? '♩'}=, opcional)`, num('tempo', null)),
      campo('Ayuda', elegir('ayuda', [['ninguna', 'Ninguna (sin mirar)'], ['notacion', 'Leyendo partitura o tablatura'], ['referencia', 'Con audio, vídeo o profesor']], item?.tipo === 'obra' ? 'notacion' : 'ninguna')),
      item?.notacion && campo('Leído en', elegir('formato', [['', '—'], ['partitura', 'Partitura'], ['tablatura', 'Tablatura'], ['memoria', 'De memoria']], c.estado.formatos?.[item.id] ?? '')),
      item?.tipo === 'obra' && campo('Qué parte', elegir('seccion', [['', 'Toda la obra'], ...secciones.map(s => [s.id, s.titulo ?? `Sección ${s.id}`])], extra.seccion ?? '')),
      item?.tipo === 'obra' && campo('O compases sueltos', h('input', { name: 'fragmento', placeholder: 'p. ej., 9-16', style: 'width:8em' })),
    ];

  const aviso = h('p', { class: 'aviso', hidden: true });
  const form = h('form', { class: 'tarjeta', onsubmit: e => {
    e.preventDefault();
    const v = valores(form);
    const ev = {
      tipo: 'practica', item: item?.id ?? extra.idLibre, area: extra.area ?? areaDe(item), min: v.min ?? 0,
      modo: frio ? 'comprobacion' : 'trabajo', enFrio: frio || !!v.enFrio, valoracion: v.valoracion ? Number(v.valoracion) : null, nota: v.nota || null,
      encargo: extra.encargo ?? null, sesion: extra.sesion ?? null, paso: extra.paso ?? null,
    };
    if (crit.tipo === 'conocimiento') ev.tanda = [v.aciertos ?? 0, v.preguntas ?? 0, Math.round((v.segundos ?? 0) * 1000)];
    else {
      const calidad = {};
      for (const d of crit.dimensiones) if (v[`cal_${d}`]) calidad[d] = v[`cal_${d}`];
      if (item && Object.keys(calidad).length < crit.dimensiones.length) { aviso.hidden = false; aviso.textContent = 'Valora cada aspecto (o pulsa «Todo bien» si ha salido todo bien).'; return; }
      Object.assign(ev, { calidad, pasadas: v.pasadas ?? 0, tempo: v.tempo, ayuda: v.ayuda, formato: v.formato || null, seccion: v.seccion || null, fragmento: v.fragmento?.trim() || null });
      if (v.deMemoria) { ev.calidad.memoria = 'bien'; ev.formato = 'memoria'; if (ev.ayuda === 'notacion') ev.ayuda = 'ninguna'; } // de memoria es sin leer
      if (v.grabada) ev.grabacion = true;
    }
    registrar(ev);
    alGuardar(ev);
    repintar();
  } },
    item && h('p', { class: 'suave' }, `Criterio: ${textoCriterio(item, c.estado.ajustes?.[item.id])}`),
    frio && h('p', null, 'Comprobación en frío: tócalo ahora, antes de practicarlo hoy, sin calentar ese pasaje y sin ayuda.'),
    crit.tipo !== 'conocimiento' && h('div', null, h('div', { class: 'fila', style: 'justify-content:space-between' }, h('strong', null, 'Cómo ha salido'), todoBien), aspectos),
    h('div', { class: 'fila' }, ...campos, campo('Minutos', num('min', extra.minutos ?? null)),
      campo('Sensación (1-5)', elegir('valoracion', [['', '—'], [1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5']], ''))),
    !frio && h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'enFrio' }), 'Era el primer intento de hoy, sin calentarlo antes'),
    requisitos.length > 0 && h('div', { class: 'pila-s' },
      h('span', { class: 'pequeno suave' }, 'Obra final: cuenta la obra entera con sus requisitos (una pasada leyendo no la cierra).'),
      requisitos.includes('memoria') && h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'deMemoria' }), 'De memoria, sin mirar la partitura'),
      requisitos.includes('grabacion') && h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'grabada' }), 'La he grabado')),
    h('label', { style: 'display:flex' }, 'Nota (dificultades, observaciones)', h('textarea', { name: 'nota' })),
    aviso,
    h('button', { class: 'principal', type: 'submit' }, 'Guardar'));
  return form;
}
