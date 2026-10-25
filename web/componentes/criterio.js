// El criterio de dominio de una cosa y su ajuste: los números (tempo, pasadas, aciertos) no son ley;
// él o su profesor pueden cambiarlos, y queda quién y por qué.
import { h, valores } from '../nucleo/dom.js';
import { ctx, cambiar } from '../nucleo/almacen.js';
import { criterioDe, textoCriterio } from '../../logica/dominio.js';

export function bloqueCriterio(item, clave = item.id) {
  const c = ctx();
  const ajuste = c.estado.ajustes?.[clave];
  const crit = criterioDe(item, ajuste);
  const campo = (t, control) => h('label', null, t, control);
  const num = (name, valor, extra = {}) => h('input', { type: 'number', name, value: valor ?? '', style: 'width:6em', ...extra });
  const form = h('form', { onsubmit: e => {
    e.preventDefault();
    const v = valores(form);
    const nuevo = { por: v.por, motivo: v.motivo || null, fecha: c.hoy };
    if (crit.tipo === 'conocimiento') {
      if (v.aciertos != null) nuevo.aciertos = v.aciertos / 100;
    } else {
      nuevo.tempo = v.tempo ? { referencia: v.tempo, unidad: crit.tempo?.unidad ?? '♩', obligatorio: !!v.obligatorio, naturaleza: 'decision', justificacion: v.motivo || 'Ajuste suyo' } : null;
      if (v.pasadas != null) nuevo.pasadas = v.pasadas;
      if (v.pasadasEnFrio != null) nuevo.pasadasEnFrio = v.pasadasEnFrio;
      if (item.tipo === 'obra') nuevo.memoria = !!v.memoria;
    }
    cambiar(est => { est.ajustes = { ...(est.ajustes || {}), [clave]: nuevo }; });
  } },
    crit.tipo === 'conocimiento'
      ? campo('Aciertos necesarios (%)', num('aciertos', Math.round(crit.aciertos * 100), { min: 50, max: 100 }))
      : [campo('Tempo de referencia (vacío: sin tempo)', num('tempo', crit.tempo?.referencia, { min: 20, max: 300 })),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'obligatorio', checked: !!crit.tempo?.obligatorio }), 'Que el tempo cuente para dominarlo'),
        campo('Pasadas seguidas bien', num('pasadas', crit.pasadas, { min: 1, max: 10 })),
        campo('En frío', num('pasadasEnFrio', crit.pasadasEnFrio, { min: 1, max: 5 })),
        item.tipo === 'obra' && h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'memoria', checked: crit.dimensiones.includes('memoria') }), 'De memoria')],
    campo('Lo ajusta', h('select', { name: 'por' }, h('option', { value: 'yo', selected: ajuste?.por !== 'profesor' }, 'Yo'), h('option', { value: 'profesor', selected: ajuste?.por === 'profesor' }, 'Mi profesor'))),
    campo('Por qué', h('input', { name: 'motivo', value: ajuste?.motivo ?? '' })),
    h('div', { class: 'fila' }, h('button', { type: 'submit' }, 'Guardar ajuste'),
      ajuste && h('button', { type: 'button', onclick: () => cambiar(est => { delete est.ajustes[clave]; }) }, 'Volver al criterio del contenido')));

  return h('div', null,
    h('p', null, h('strong', null, 'Criterio: '), textoCriterio(item, ajuste)),
    item.criterio?.justificacion && h('p', { class: 'suave' }, `De dónde sale: ${item.criterio.justificacion}`),
    h('details', null, h('summary', null, 'Ajustar el criterio'), form));
}
