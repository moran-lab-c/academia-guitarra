// Formato de los datos del usuario (datos/estado.json y datos/historial/*.jsonl).
// Si cambia, se sube ESQUEMA y se añade su paso en migraciones.js.
export const ESQUEMA = 2; // 2: «ruta» (clásica/flamenca) pasa a llamarse «programa»; la ruta es el camino de cada curso
export const FORMATO_EXPORTACION = 'academia-guitarra';

export const PROGRAMAS = ['clasica', 'flamenca'];
export const MARCAS_OBRA = ['objetivo-futuro', 'aspiracional', 'en-preparacion', 'en-estudio', 'aprendida', 'repertorio-vivo', 'aparcada'];
// Lo que ya sabía tocar antes de la academia: no se vuelve a aprender desde cero, se comprueba.
export const CONOCIDA = ['parcial', 'entera', 'dominada'];
export const FORMATOS = ['partitura', 'tablatura'];           // las dos siempre que el contenido las tenga
export const VISTAS = [...FORMATOS, 'ambas'];                // cómo se ve: una de las dos o las dos unidas
export const TIPOS_EVENTO = ['practica', 'bateria', 'sesion', 'nota', 'diagnostico', 'evaluacion'];
export const AYUDAS = ['ninguna', 'notacion', 'referencia'];  // notacion = leyendo partitura o tablatura; referencia = audio, vídeo o profesor
export const CALIDADES = ['bien', 'fallos', 'mal'];
export const RESULTADOS = ['ok', 'casi', 'no'];
// Evaluación inicial (evento «diagnostico»): cómo se probó cada competencia, la confianza de la estimación de un área y
// lo que dejó en una competencia la pasada de una obra que ya sabía tocar. Ver logica/evaluacion.js.
export const TIPOS_PRUEBA = ['app', 'autoevaluada', 'repertorio'];
export const CONFIANZAS = ['baja', 'media', 'alta'];
export const EVIDENCIAS = ['favorable', 'dudosa', 'en-contra'];
// Aspectos de calidad que puede pedir un criterio (cada obra o ejercicio usa los suyos).
export const DIMENSIONES = {
  precision: 'Notas correctas', ritmo: 'Ritmo y pulso', continuidad: 'Sin paradas', limpieza: 'Limpieza (sin trastear ni ruidos)',
  control: 'Control y relajación', sonido: 'Sonido', dinamica: 'Dinámica', articulacion: 'Articulación', fraseo: 'Fraseo y musicalidad', memoria: 'De memoria',
};

export function estadoInicial() {
  return {
    esquema: ESQUEMA,
    perfil: {},
    preferencias: {
      programaPrincipal: 'clasica',
      tema: 'oscuro',          // 'oscuro' (el de B+) o 'claro' (preparado)
      minutosHabituales: 60,
      repartoAmbas: 0.65,      // parte clásica cuando la sesión es de las dos rutas
      formatoPreferido: null,  // null = lo que recomiende la app; 'partitura' o 'tablatura' pesa en la recomendación
      latenciaMs: 0,           // calibración del retraso del equipo (pruebas de ritmo)
      copiaExterna: null,      // { carpeta, cadaDias }: preparada para más adelante, apagada
    },
    obras: {},                 // id → { marca, nota, conocida: { nivel: 'parcial'|'entera'|'dominada', secciones, nota, fecha } }
    formatos: {},              // lo último que eligió ver: 'obra:x' o 'obra:x#A' (una sección) → 'partitura' | 'tablatura'
    ajustes: {},               // id → criterio ajustado por él o por su profesor: { tempo, pasadas, pasadasEnFrio, dimensiones, aciertos, por, motivo, fecha }
    tareasProfesor: [],        // encargos de clase
    objetivos: [],
    focos: {},                 // { tramo: { clasica, flamenca } } si abre un tramo antes de que la ruta lo proponga
    contenidoPropio: { obras: [], ejercicios: [] }, // obras suyas o de su profesor
  };
}

const esObjeto = x => x !== null && typeof x === 'object' && !Array.isArray(x);

export function validarEstado(e) {
  const err = [];
  if (!esObjeto(e)) return ['El estado no es un objeto'];
  if (!Number.isInteger(e.esquema) || e.esquema < 1) err.push('Falta la versión del formato (esquema)');
  for (const k of ['perfil', 'preferencias', 'obras', 'focos', 'contenidoPropio']) if (!esObjeto(e[k])) err.push(`«${k}» debe ser un objeto`);
  if (e.ajustes != null && !esObjeto(e.ajustes)) err.push('«ajustes» debe ser un objeto');
  if (e.formatos != null && (!esObjeto(e.formatos) || Object.values(e.formatos).some(f => !VISTAS.includes(f)))) err.push('«formatos» solo admite partitura, tablatura o ambas');
  for (const k of ['tareasProfesor', 'objetivos']) if (!Array.isArray(e[k])) err.push(`«${k}» debe ser una lista`);
  if (esObjeto(e.obras)) for (const [id, o] of Object.entries(e.obras)) {
    if (!esObjeto(o)) { err.push(`obras.${id} no es un objeto`); continue; }
    if (o.marca != null && !MARCAS_OBRA.includes(o.marca)) err.push(`obras.${id}: marca desconocida «${o.marca}»`);
    if (o.conocida != null && (!esObjeto(o.conocida) || !CONOCIDA.includes(o.conocida.nivel))) err.push(`obras.${id}: «conocida» debe decir su nivel (${CONOCIDA.join(', ')})`);
  }
  if (Array.isArray(e.tareasProfesor)) e.tareasProfesor.forEach((t, i) => {
    if (!esObjeto(t) || typeof t.id !== 'string') err.push(`tareasProfesor[${i}] sin id`);
    else if (!t.item && !t.texto) err.push(`tareasProfesor[${i}] sin obra ni texto`);
    else if (t.formato != null && !FORMATOS.includes(t.formato)) err.push(`tareasProfesor[${i}]: formato desconocido`);
    else if (t.tempo != null && !(Number.isFinite(t.tempo) && t.tempo >= 20 && t.tempo <= 300)) err.push(`tareasProfesor[${i}]: tempo fuera de 20-300`);
  });
  return err;
}

// El tempo apuntado en una práctica o una prueba (el campo del registro siempre ha aceptado de 0 a 400).
export const TEMPO_APUNTADO = [0, 400];
const tempoValido = t => t == null || (Number.isFinite(t) && t >= TEMPO_APUNTADO[0] && t <= TEMPO_APUNTADO[1]);

export function validarEvento(ev) {
  const err = [];
  if (!esObjeto(ev)) return ['El evento no es un objeto'];
  if (typeof ev.id !== 'string' || !ev.id) err.push('Evento sin id');
  if (typeof ev.t !== 'string' || Number.isNaN(Date.parse(ev.t))) err.push(`Evento ${ev.id}: fecha no válida`);
  if (!TIPOS_EVENTO.includes(ev.tipo)) err.push(`Evento ${ev.id}: tipo desconocido «${ev.tipo}»`);
  if (ev.tipo === 'practica' && typeof ev.item !== 'string') err.push(`Evento ${ev.id}: práctica sin item`);
  if (ev.ayuda != null && !AYUDAS.includes(ev.ayuda)) err.push(`Evento ${ev.id}: ayuda desconocida «${ev.ayuda}»`);
  if (ev.formato != null && ![...FORMATOS, 'memoria'].includes(ev.formato)) err.push(`Evento ${ev.id}: formato desconocido «${ev.formato}»`);
  if (ev.grabacion != null && typeof ev.grabacion !== 'boolean') err.push(`Evento ${ev.id}: «grabacion» debe ser sí o no`);
  if (ev.paso != null && typeof ev.paso !== 'string') err.push(`Evento ${ev.id}: «paso» debe ser un id de paso`);
  if (!tempoValido(ev.tempo)) err.push(`Evento ${ev.id}: el tempo es un número de ${TEMPO_APUNTADO[0]} a ${TEMPO_APUNTADO[1]}`);
  for (const [d, v] of Object.entries(ev.calidad || {})) {
    if (!(d in DIMENSIONES)) err.push(`Evento ${ev.id}: aspecto desconocido «${d}»`);
    else if (!CALIDADES.includes(v)) err.push(`Evento ${ev.id}: valor «${v}» en ${d}`);
  }
  if (ev.tipo === 'diagnostico') err.push(...validarDiagnostico(ev));
  return err;
}

// Los campos de la evaluación inicial. Todos opcionales: un diagnóstico antiguo ({ niveles, pruebas: [{ item, resultado }] })
// sigue siendo válido.
function validarDiagnostico(ev) {
  const err = [], donde = `Evento ${ev.id}`;
  const nivel = n => Number.isInteger(n) && n >= 0 && n <= 7;
  if (ev.modulo != null && typeof ev.modulo !== 'string') err.push(`${donde}: «modulo» debe ser un área`);
  if (ev.niveles != null && (!esObjeto(ev.niveles) || !Object.values(ev.niveles).every(nivel))) err.push(`${donde}: cada nivel estimado va de 0 a 7`);
  if (ev.confianza != null && (!esObjeto(ev.confianza) || !Object.values(ev.confianza).every(c => CONFIANZAS.includes(c)))) err.push(`${donde}: confianza desconocida (${CONFIANZAS.join(', ')})`);
  if (ev.hipotesis != null && !nivel(ev.hipotesis)) err.push(`${donde}: la hipótesis es un nivel de 0 a 7`);
  if (ev.pruebas != null && !Array.isArray(ev.pruebas)) err.push(`${donde}: «pruebas» debe ser una lista`);
  else (ev.pruebas || []).forEach((p, i) => {
    if (!esObjeto(p) || typeof p.item !== 'string') return err.push(`${donde}: la prueba ${i + 1} no dice qué competencia`);
    if (!RESULTADOS.includes(p.resultado)) err.push(`${donde}: resultado «${p.resultado}» en la prueba ${i + 1}`);
    if (p.tipo != null && !TIPOS_PRUEBA.includes(p.tipo)) err.push(`${donde}: tipo de prueba «${p.tipo}»`);
    if (!tempoValido(p.tempo)) err.push(`${donde}: tempo de la prueba ${i + 1}`);
    if ((p.aciertos != null || p.preguntas != null) && !(Number.isInteger(p.aciertos) && Number.isInteger(p.preguntas) && p.aciertos >= 0 && p.aciertos <= p.preguntas)) err.push(`${donde}: aciertos y preguntas de la prueba ${i + 1}`);
    for (const [d, v] of Object.entries(p.calidad || {})) if (!(d in DIMENSIONES) || !CALIDADES.includes(v)) err.push(`${donde}: aspecto «${d}» en la prueba ${i + 1}`);
  });
  if (ev.evidencias != null && !Array.isArray(ev.evidencias)) err.push(`${donde}: «evidencias» debe ser una lista`);
  else (ev.evidencias || []).forEach((x, i) => {
    if (!esObjeto(x) || typeof x.item !== 'string' || !x.item || typeof x.fuente !== 'string' || !x.fuente) return err.push(`${donde}: la evidencia ${i + 1} no dice de qué competencia ni de qué obra`);
    if (!EVIDENCIAS.includes(x.resultado)) err.push(`${donde}: evidencia «${x.resultado}»`);
    if ([...(x.aspectos || []), ...(x.sinObservar || [])].some(d => !(d in DIMENSIONES))) err.push(`${donde}: aspecto desconocido en la evidencia ${i + 1}`);
  });
  return err;
}

// Archivo de exportación: todo lo suyo en un solo JSON.
export function validarExportacion(x) {
  if (!esObjeto(x) || x.formato !== FORMATO_EXPORTACION) return ['No es un archivo de la academia'];
  if (!Number.isInteger(x.esquema)) return ['Al archivo le falta la versión del formato'];
  if (x.esquema > ESQUEMA) return [`El archivo es de una versión más nueva de la app (${x.esquema} > ${ESQUEMA})`];
  if (!Array.isArray(x.eventos)) return ['Al archivo le faltan los eventos'];
  return [];
}
