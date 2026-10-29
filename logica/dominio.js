// Dominio: distingue «lo he hecho» (completado) de «lo sé hacer» (dominado).
// Reglas en «Plan de la academia», apartado 7: tres aciertos en frío, sin ayuda y espaciados,
// valorando los aspectos de calidad que pide cada cosa (no solo el tempo).
import { dia, diasEntre, sumarDias } from './fechas.js';
import { DIMENSIONES } from './esquema.js';

export const ESTADOS = ['pendiente', 'en-progreso', 'completado', 'dominado', 'necesita-repaso'];
// Días hasta la siguiente comprobación en frío según la solidez (1 = completado una vez).
export const INTERVALOS = [0, 3, 7, 21, 45, 90, 180];
export const SOLIDEZ_DOMINADO = 3;

const HECHOS = new Set(['completado', 'dominado', 'necesita-repaso']);
export const estaHecho = estado => HECHOS.has(estado);
export const intervalo = s => INTERVALOS[Math.min(Math.max(s, 0), INTERVALOS.length - 1)];
// Separación mínima con el último acierto para que una comprobación en frío sume solidez.
const separacion = s => (s === 1 ? 3 : s === 2 ? 7 : Math.ceil(intervalo(s) / 2));

// Aspectos que se miran por defecto: no todas las cosas necesitan los mismos [Decisión, ajustable].
const ASPECTOS = {
  obra: ['precision', 'ritmo', 'continuidad', 'limpieza', 'sonido', 'dinamica', 'fraseo'],
  interpretacion: ['continuidad', 'fraseo', 'dinamica'],
  ejecucion: ['precision', 'ritmo', 'limpieza', 'control'],
};

// El criterio de una cosa: lo que dice el contenido, con valores por defecto, y encima el ajuste
// que haya hecho él o su profesor (quién y por qué quedan guardados).
export function criterioDe(item, ajuste) {
  const c = item?.criterio || {};
  const obra = item?.tipo === 'obra';
  const base = {
    tipo: c.tipo ?? 'ejecucion',
    dimensiones: c.dimensiones ?? (obra ? ASPECTOS.obra : item?.area === 'interpretacion' ? ASPECTOS.interpretacion : ASPECTOS.ejecucion),
    pasadas: c.pasadas ?? (obra ? 1 : 3),            // seguidas y bien, al trabajarlo
    pasadasEnFrio: c.pasadasEnFrio ?? (obra ? 1 : 2), // al comprobarlo en frío
    ayuda: c.ayuda ?? (obra ? ['ninguna', 'notacion'] : ['ninguna']),
    tempo: c.tempo ?? null,                           // { referencia, unidad, obligatorio, naturaleza, fuente }
    aciertos: c.aciertos ?? 0.9, preguntas: c.preguntas ?? 10, tiempoMs: c.tiempoMs ?? null,
    detalle: c.detalle ?? null,
  };
  if (!ajuste) return base;
  const r = { ...base, ajustado: { por: ajuste.por ?? 'yo', motivo: ajuste.motivo ?? null } };
  for (const k of ['pasadas', 'pasadasEnFrio', 'aciertos', 'preguntas', 'tiempoMs']) if (ajuste[k] != null) r[k] = ajuste[k];
  if (ajuste.tempo !== undefined) r.tempo = ajuste.tempo && { ...base.tempo, ...ajuste.tempo };
  if (Array.isArray(ajuste.dimensiones)) r.dimensiones = ajuste.dimensiones;
  if (ajuste.memoria != null) r.dimensiones = ajuste.memoria ? [...new Set([...r.dimensiones, 'memoria'])] : r.dimensiones.filter(d => d !== 'memoria');
  return r;
}

// Un intento frente a su criterio: 'ok' (cumple), 'casi' o 'no'.
// Cada aspecto se valora bien, con fallos o mal; lo que no se valora cuenta como «con fallos» (no se da por bueno).
export function valorarIntento(ev, c) {
  if (c.tipo === 'conocimiento') return valorarTanda(ev.tanda, c);
  const notas = c.dimensiones.map(d => (d === 'memoria' && ev.ayuda === 'notacion' ? 'mal' : ev.calidad?.[d] ?? 'fallos'));
  if (notas.includes('mal')) return 'no';
  let fallos = notas.filter(n => n === 'fallos').length;
  if (c.tempo?.obligatorio && c.tempo.referencia) { // el tempo solo pesa si el criterio (o su ajuste) lo hace obligatorio
    const t = Number.isFinite(ev.tempo) ? ev.tempo : 0; // lo que no es un número no llega a ningún tempo
    if (t < c.tempo.referencia * 0.9) return 'no';
    if (t < c.tempo.referencia) fallos++;
  }
  const pedidas = ev.enFrio ? c.pasadasEnFrio : c.pasadas;
  const pasadas = ev.pasadas ?? 0;
  if (pasadas < pedidas - 1) return 'no';
  if (pasadas < pedidas) fallos++;
  return fallos === 0 ? 'ok' : fallos === 1 ? 'casi' : 'no';
}

// Tandas que corrige la app (notas, intervalos…): [aciertos, preguntas, milisegundos de media].
function valorarTanda([aciertos, preguntas, ms] = [0, 0, 0], c) {
  const p = preguntas ? aciertos / preguntas : 0;
  const rapido = !c.tiempoMs || ms <= c.tiempoMs;
  if (preguntas >= c.preguntas && p >= c.aciertos && rapido) return 'ok';
  return p >= 0.75 ? 'casi' : 'no';
}

// Clave de lo que se practica: la obra entera, o una sección suya (obra#A). Practicar un fragmento
// no da por completada la obra entera.
export const claveDe = ev => (ev.seccion ? `${ev.item}#${ev.seccion}` : ev.fragmento ? null : ev.item);

// De los eventos del historial, los intentos de cada cosa en orden: { t, enFrio, sinAyuda, res, min }.
export function intentosPorItem(eventos, cat, ajustes = {}) {
  const porItem = new Map();
  const anadir = (id, x) => (porItem.get(id) ?? porItem.set(id, []).get(id)).push(x);
  const criterio = clave => {
    const [id] = clave.split('#');
    const item = cat.porId.get(id);
    return item && criterioDe(item, ajustes[clave] ?? ajustes[id]);
  };
  const vistos = new Set(); // 'clave|día': si ya se tocó ese día, una tanda deja de ser «en frío»
  for (const ev of [...eventos].sort((a, b) => a.t.localeCompare(b.t))) {
    if (ev.tipo === 'practica') {
      const clave = claveDe(ev);
      const c = clave && criterio(clave);
      if (!c) continue;
      const enFrio = ev.modo === 'comprobacion' || ev.enFrio === true;
      anadir(clave, { t: ev.t, enFrio, sinAyuda: c.ayuda.includes(ev.ayuda ?? 'ninguna'), res: valorarIntento({ ...ev, enFrio }, c), min: ev.min ?? 0 });
      vistos.add(clave + '|' + dia(ev.t));
    } else if (ev.tipo === 'bateria') {
      for (const [id, tanda] of Object.entries(ev.resultados || {})) {
        const c = criterio(id);
        if (!c) continue;
        const marca = id + '|' + dia(ev.t);
        anadir(id, { t: ev.t, enFrio: !vistos.has(marca), sinAyuda: true, res: valorarIntento({ tanda }, c), min: 0 });
        vistos.add(marca);
      }
    } else if (ev.tipo === 'diagnostico') {
      // Una prueba superada en el diagnóstico es un primer acierto en frío (se convalida, y se confirma después). Una
      // no superada no cuenta como intento: no está «en curso», es lo que falta (lo dice el perfil de la evaluación).
      for (const p of ev.pruebas || []) if (p.resultado === 'ok' && cat.porId.has(p.item)) anadir(p.item, { t: ev.t, enFrio: true, sinAyuda: true, res: p.resultado, min: 0 });
    }
  }
  return porItem;
}

// Estado de una cosa a partir de sus intentos.
export function estadoDominio(intentos, hoy) {
  if (!intentos?.length) return { estado: 'pendiente', solidez: 0 };
  let s = 0, ref = null, adelanto = null, fueDominado = false, ultimaPractica = null, ultimoFrio = null, minutos = 0;
  for (const x of intentos) {
    const d = dia(x.t);
    ultimaPractica = d;
    minutos += x.min || 0;
    if (s === 0) { if (x.res === 'ok') { s = 1; ref = d; } continue; }
    if (!x.enFrio || !x.sinAyuda) continue; // practicar en caliente o con ayuda no prueba que se retenga
    ultimoFrio = { dia: d, res: x.res };
    if (x.res === 'no') { s = Math.max(1, s - 2); ref = d; adelanto = null; continue; }
    if (x.res === 'casi') { adelanto = d; continue; }
    if (diasEntre(ref, d) >= separacion(s)) { // un acierto demasiado pronto no cuenta (pero tampoco resta)
      s++; ref = d; adelanto = null;
      if (s >= SOLIDEZ_DOMINADO) fueDominado = true;
    }
  }
  if (s === 0) return { estado: 'en-progreso', solidez: 0, ultimaPractica, ultimoFrio, minutos };
  const iv = intervalo(s);
  const espera = adelanto ? Math.max(1, Math.floor(iv / 2)) : iv; // tras un «casi», se comprueba antes
  const desde = adelanto ?? ref;
  const proxima = sumarDias(desde, espera);
  let estado = s >= SOLIDEZ_DOMINADO ? 'dominado' : fueDominado ? 'necesita-repaso' : 'completado';
  if (estado === 'dominado' && diasEntre(proxima, hoy) > iv) estado = 'necesita-repaso'; // el doble de su intervalo sin comprobar
  return { estado, solidez: s, proxima, urgencia: diasEntre(desde, hoy) / espera, ultimaPractica, ultimoFrio, minutos };
}

// Estado de todas las competencias, obras y secciones con algún intento.
export function calcularDominio(cat, eventos, hoy, ajustes = {}) {
  const dom = new Map();
  for (const [id, intentos] of intentosPorItem(eventos, cat, ajustes)) dom.set(id, estadoDominio(intentos, hoy));
  return dom;
}

export function textoCriterio(item, ajuste) {
  const c = criterioDe(item, ajuste);
  const ajustado = c.ajustado ? ` (ajustado por ${c.ajustado.por === 'profesor' ? 'tu profesor' : 'ti'}${c.ajustado.motivo ? `: ${c.ajustado.motivo}` : ''})` : '';
  if (c.tipo === 'conocimiento') {
    return `${Math.round(c.aciertos * 100)} % de aciertos en ${c.preguntas} preguntas` + (c.tiempoMs ? `, menos de ${c.tiempoMs / 1000} s por respuesta` : '') + ajustado;
  }
  const t = c.tempo?.referencia ? `${c.tempo.unidad ?? '♩'}=${c.tempo.referencia}` : null;
  return [
    `${c.pasadas} ${c.pasadas === 1 ? 'pasada completa' : 'pasadas seguidas'} bien en: ${c.dimensiones.map(d => DIMENSIONES[d].toLowerCase()).join(', ')}`,
    t && (c.tempo.obligatorio ? `a ${t} o más` : `tempo de referencia ${t} (orienta, no obliga)`),
    c.ayuda.includes('notacion') ? 'puedes leer' : 'sin mirar',
    c.detalle,
  ].filter(Boolean).join(' · ') + ajustado;
}
