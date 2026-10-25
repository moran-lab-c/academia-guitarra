// Piezas pequeñas que repiten varias pantallas.
import { h } from '../nucleo/dom.js';
import { enlace } from '../nucleo/rutas.js';
import { nombreDe } from '../../logica/catalogo.js';

export const NOMBRE_ESTADO = { pendiente: 'Pendiente', 'en-progreso': 'En progreso', completado: 'Completado', dominado: 'Dominado', 'necesita-repaso': 'Necesita repaso' };
export const NOMBRE_PROGRAMA = { clasica: 'Clásico', flamenca: 'Flamenco', comun: 'Común' };
export const NOMBRE_MARCA = {
  'objetivo-futuro': 'Objetivo futuro', aspiracional: 'Aspiracional', 'en-preparacion': 'En preparación', 'en-estudio': 'En estudio',
  aprendida: 'Aprendida', 'repertorio-vivo': 'Repertorio vivo', aparcada: 'Aparcada',
};
export const NOMBRE_VIABILIDAD = { estudiable: 'Estudiable ahora', cerca: 'Cerca', 'demasiado-dificil': 'Demasiado difícil por ahora', 'sin-clasificar': 'Sin clasificar' };
export const NOMBRE_NATURALEZA = { dato: 'dato', evidencia: 'evidencia', consenso: 'consenso', recomendacion: 'recomendación', decision: 'decisión del sistema', estimacion: 'estimación' };

export const estadoEtiqueta = estado => h('span', { class: `etiqueta e-${estado}` }, NOMBRE_ESTADO[estado] ?? estado);
export const programaEtiqueta = programa => h('span', { class: `etiqueta programa-${programa}` }, NOMBRE_PROGRAMA[programa] ?? programa);

export function enlaceItem(item) {
  if (!item) return h('span', { class: 'suave' }, '—');
  const destino = item.tipo === 'obra' ? enlace('/obra', item.id) : item.tipo === 'competencia' ? enlace('/competencia', item.id) : null;
  return destino ? h('a', { href: destino }, nombreDe(item)) : h('span', null, nombreDe(item));
}

export function nivelArea(n) {
  if (!n) return h('span', { class: 'suave' }, '—');
  if (n.sinContenido) return h('span', { class: 'suave' }, 'Sin contenido todavía');
  const texto = n.estimado ? `Nivel ${n.nivel} (estimado, a confirmar)` : `Nivel ${n.nivel}`;
  const hacia = !n.estimado && n.nivel < n.max ? ` · ${Math.round(n.progreso * 100)} % hacia el ${n.nivel + 1}` : '';
  return h('div', null, h('strong', null, texto), h('span', { class: 'suave' }, hacia),
    h('div', { class: 'barra' }, h('i', { style: `width:${Math.min(100, ((n.estimado ? n.nivel : n.nivel + n.progreso) / n.max) * 100)}%` })));
}

// «1 paso», «3 pasos»: el número con su palabra en singular o plural.
export const plural = (n, uno, varios = `${uno}s`) => `${n} ${n === 1 ? uno : varios}`;

export const fecha = d => (d ? new Date(d.length === 10 ? d + 'T12:00:00' : d).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) : '—');
export const aviso = (texto, error) => h('div', { class: `aviso${error ? ' error' : ''}` }, texto);
export const tarjeta = (...hijos) => h('div', { class: 'tarjeta' }, ...hijos);
