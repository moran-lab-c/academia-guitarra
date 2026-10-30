// Convierte el currículo aprobado (docs/curriculo/*.md, la fuente de verdad) en los datos que usa la app:
// contenido/curriculo/clasica.json. No se escribe contenido a mano: lo que no esté en los documentos no existe.
// Uso: node herramientas/generar-curriculo.mjs        (pruebas/curriculo.test.js exige que el archivo esté al día)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(RAIZ, 'docs', 'curriculo');
const DESTINO = path.join(RAIZ, 'contenido', 'curriculo', 'clasica.json');
const leer = nombre => fs.readFileSync(path.join(DOCS, nombre), 'utf8').replaceAll('\r\n', '\n');

const TIPOS = ['Explicación (guía)', 'Explicación', 'Cómo se hace', 'Ejercicio', 'Obra conocida', 'Obra', 'Comprobación del tramo', 'Oído', 'Contexto',
  'Fíjate en…', 'Análisis', 'Lectura', 'Repaso', 'Aplicación', 'Ritmo', 'Teoría', 'Solfeo', 'Digitación', 'Primera vista', 'Consejo del profesor',
  'Escucha', 'Diapasón', 'Tablatura', 'Progresión', 'Acordes', 'Técnica', 'Esto te sirve para…', '¿Sabías que…?', '◇'];
const RECURSOS = { '𝄞': 'partitura', T: 'tablatura', '⌗': 'acordes', '♪': 'audio', '⏱': 'metronomo', '✎': 'preguntas' };
// Un trozo que solo dice qué recursos lleva el paso: «𝄞 + T», «𝄞 principal y T a un toque», «♪ enlaces»…
const SOLO_RECURSOS = /^(𝄞|T|⌗|♪|⏱|✎)(\s*\+\s*(𝄞|T|⌗))*( (principal|enlaces?|con marcas))?( y T a un toque)?$/;

const NORMAL = s => s.normalize('NFD').replace(/[\u0300-\u036f*]/g, '').toLowerCase();
const SLUG = s => NORMAL(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Lo que ya existe en la app con su notación comprobada (contenido/ejercicios).
const EN_APP = {
  'E-N1-06': ['ej:esc.mi-mayor-1pos'], 'E-N1-07': ['ej:arm.mi-la-si7'], 'E-N1-08': ['ej:giuliani.op1'], 'E-N1-09': ['ej:arp.nota-destacada'],
  'E-N1-12': ['ej:tec.presion-decreciente'], 'E-N1-18': ['ej:tec.apagar-voces'], 'E-N1-19': ['ej:tec.mordente'],
  'E-N1-20': ['ej:rit.hemiolia', 'ej:rit.hemiolia-3-4'], 'E-N1-21': ['ej:rit.puntillo-semicorcheas'],
};
const DE_LA_APP = [
  [/p-i-m-a y p-a-m-i/, ['ej:arp.pima-do-sol7', 'ej:arp.pami-do-sol7']], [/La menor en tres formas/, ['ej:esc.la-menor-3-formas']],
  [/Cromática/, ['ej:esc.cromatica-1pos']], [/Do mayor y Sol mayor/, ['ej:esc.do-mayor-1pos', 'ej:esc.sol-mayor-1pos']],
  [/Ligados en 1\.ª/, ['ej:tec.ligados-1pos']], [/Re mayor/, ['ej:esc.re-mayor-1pos']],
];
// Las obras que ya tienen ficha en el catálogo.
const FICHAS = { lagrima: 'obra:tarrega.lagrima', adelita: 'obra:tarrega.adelita', recuerdos: 'obra:tarrega.recuerdos', espanoleta: 'obra:sanz.espanoleta', 'op. 60 n.º 1': 'obra:sor.op60-1' };

// Los documentos hablan de él; las pantallas le hablan de tú. Solo cambia el trato, no el contenido.
const TRATO = [
  ['la postura que ya usa', 'la postura que ya usas'], ['Su *Estudio', 'Tu *Estudio'], ['y él los repite', 'y tú los repites'], ['Del arpegio que ya hace', 'Del arpegio que ya haces'],
  ['de su *Estudio', 'de tu *Estudio'], ['que ya conoce', 'que ya conoces'], ['de su estudio', 'de tu estudio'], ['Su picado se comprueba', 'Tu picado se comprueba'],
  ['el flamenco que ya hace', 'el flamenco que ya haces'], ['y él la acompaña', 'y tú la acompañas'], ['si su profesor lo prefiere', 'si tu profesor lo prefiere'],
  ['él la canta y después la toca', 'tú la cantas y después la tocas'], ['que él elija', 'que elijas'], ['que ya reconoce', 'que ya reconoces'], ['dos compases que conoce', 'dos compases que conoces'],
  ['que ya sabe', 'que ya sabes'], ['con su grabación', 'con tu grabación'], ['Tocar su armonía', 'Tocar tu armonía'], ['él canta la de arriba', 'tú cantas la de arriba'],
  ['como su tablatura', 'como tu tablatura'], ['cuál le da más ligereza a él y dónde cambia de uno a otro', 'cuál te da más ligereza y dónde cambias de uno a otro'],
  ['Su picado le sirve de base; aquí se le pide', 'Tu picado te sirve de base; aquí se pide'], ['la de su *Passacaglia*', 'la de tu *Passacaglia*'],
  ['Su versión (la de Lameei, si la compra) o su transcripción', 'Tu versión (la de Lameei, si la compras) o tu transcripción'], ['si lo eligió', 'si lo elegiste'], ['si la eligió', 'si la elegiste'],
  ['que elija,', 'que elijas,'], ['si quiere', 'si quieres'], ['Escribir en tablatura su digitación', 'Escribir en tablatura tu digitación'], ['; su pasaje digitado', '; tu pasaje digitado'],
  ['hechas por él', 'hechas por ti'], ['apoyándose en su análisis', 'apoyándote en tu análisis'], ['digitadas por él', 'digitadas por ti'], ['Su análisis de', 'Tu análisis de'],
  ['que su *Passacaglia*', 'que tu *Passacaglia*'], ['que elija él', 'que elijas'], ['Glosar él una', 'Glosar tú una'], ['elegidos por él', 'elegidos por ti'], ['con él decidiendo', 'decidiendo tú'],
  ['Su rutina', 'Tu rutina'], ['necesita para sus obras', 'necesitas para tus obras'], ['dejar su digitación', 'dejar tu digitación'], ['elegidas por él', 'elegidas por ti'],
  ['BWV 998**, la primera parte, con su digitación', 'BWV 998**, la primera parte, con tu digitación'], ['Revisar su digitación después de tocarla: qué cambiaría', 'Revisar tu digitación después de tocarla: qué cambiarías'],
  ['El preludio con su digitación', 'El preludio con tu digitación'], ['lo que él decida', 'lo que decidas'], ['con su digitación propia', 'con tu digitación propia'], ['descritos por él', 'descritos por ti'],
  ['montado por él', 'montado por ti'], ['Su base flamenca le ayuda, pero no se da por hecha: aquí se comprueba y se le pide', 'Tu base flamenca te ayuda, pero no se da por hecha: aquí se comprueba y se pide'],
  ['para su recital', 'para tu recital'], ['con su arreglo', 'con tu arreglo'], ['Su arreglo', 'Tu arreglo'], ['Su programa, su orden y sus presentaciones', 'Tu programa, tu orden y tus presentaciones'],
  ['dónde reconoce su sonido', 'dónde reconoces tu sonido'], ['él ya hace', 'ya haces'], ['donde él quiere', 'donde quieres'], ['sabe elegir', 'sabes elegir'], ['sabe dónde', 'sabes dónde'],
  ['puede destacar', 'puedes destacar'], ['Lo que ha conseguido', 'Lo que has conseguido'],
];
const tratoDeTu = t => TRATO.reduce((s, [a, b]) => s.replace(new RegExp(`${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-záéíóúñ])`, 'g'), b), t);

// Lo que es del diseño y no del alumno: etiquetas de naturaleza, referencias a la revisión y a sistemas externos.
function limpiar(t) {
  return tratoDeTu(t)
    // La calibración con otros sistemas es para diseñar, no para el alumno.
    .replace(/\s*(?:La Rioja|Una programación de Madrid|Mater Salvatoris)\b[^.]*(?:\.|$)/g, '')
    .replace(/\s*\*\*\[(Dato|Consenso|Decisión|Estimación)[^\]]*\]\*\*/g, '')
    .replace(/\s*\(P-\d+\)/g, '')
    .replace(/,? como (?:en )?el grado \d[^,)]*ABRSM/g, '')
    .replace(/\s*\(`ej` de la app\)/g, '')
    .replace(/\s*\(`ej` de la app; [^)]*\)/g, '')
    .replace(/\s*\((?:como (?:en )?el |grado |nivel \d+ del RCM|los del nivel )[^)]*\)/g, '')
    .replace(/\s*\(grado \d[^)]*\)/g, '')
    .replace(/\s+([.,;:])/g, '$1')
    .trim();
}

function fichasEjercicios() {
  const texto = leer('ejercicios.md');
  const fichas = {};
  for (const bloque of texto.split(/\n(?=\*\*E-N\d-\d\d · )/).slice(1)) {
    const lineas = bloque.split('\n');
    // Una línea puede traer varias fichas: «**E-N1-18 · Apagar voces** (app) · **E-N1-19 · Mordente** (app)…».
    const titulos = [...lineas[0].matchAll(/\*\*(E-N\d-\d\d) · ([^*]+(?:\*[^*]+\*[^*]*)*)\*\*/g)];
    const campos = {};
    for (const l of lineas.slice(1)) {
      if (l.startsWith('## ')) break;
      for (const m of l.matchAll(/\*\*([^*:]+?):?\*\*:?\s*(.*?)(?=\s\*\*[^*]+:\*\*|$)/g)) {
        const k = m[1].trim();
        if (/^Está bien cuando/.test(k)) campos.bien = limpiar(m[2]).replace(/^/, '');
        else if (k === 'Instrucciones') campos.instrucciones = limpiar(m[2]);
        else if (k === 'Por qué existe') campos.porque = limpiar(m[2]);
        else if (k === 'Errores frecuentes') campos.errores = limpiar(m[2]);
        else if (k === '[Por verificar]') campos.porVerificar = limpiar(m[2]);
      }
    }
    for (const t of titulos) fichas[t[1]] = { codigo: t[1], titulo: t[2].trim(), ...campos };
  }
  return fichas;
}

function pasoDe(linea, fichas) {
  let partes = linea.split(' · ').map(x => x.trim());
  let tipo = null;
  const cabeza = partes[0].replace(/[.:]$/, '');
  if (TIPOS.includes(cabeza)) { tipo = cabeza; partes = partes.slice(1); }
  const guia = tipo === 'Explicación (guía)';
  if (guia) tipo = 'Explicación';
  const paso = { tipo: tipo ?? 'Nota', texto: '', recursos: [], guia: guia || undefined };
  const enApp = linea.includes('`ej` de la app');
  const quedan = [];
  for (let p of partes) {
    // «⏱. ↩ necesita E-N1-15.» o «… ↩ necesita *Adelita*.»
    const apoyo = p.match(/^(.*?)\s*↩ (necesita .*)$/);
    if (apoyo) { paso.apoyo = apoyo[2].replace(/\.$/, ''); p = apoyo[1]; }
    // «⏱. El resto del movimiento…»: el recurso y, detrás, una frase más.
    const delante = p.match(/^(𝄞|T|⌗|♪|⏱|✎)\. (.+)$/);
    if (delante) { (paso.recursos).push(RECURSOS[delante[1]]); p = delante[2]; }
    const seco = p.replace(/\.$/, '').trim();
    if (!seco) continue;
    if (SOLO_RECURSOS.test(seco)) {
      for (const s of seco.match(/𝄞|⌗|♪|⏱|✎|\bT\b/g)) if (!paso.recursos.includes(RECURSOS[s])) paso.recursos.push(RECURSOS[s]);
    } else if (/^edición publicada|^transcripción publicada|^edición elegida/.test(seco)) paso.edicion = seco;
    else quedan.push(p);
  }
  let texto = quedan.join(' · ');
  const verif = texto.match(/\*\*\[Por verificar\]\*\*\s*(.*)$/);
  if (verif) {
    paso.porVerificar = limpiar(verif[1]).replace(/\.$/, '') || 'pendiente de comprobar en la partitura';
    texto = texto.slice(0, verif.index).replace(/[\s·]+$/, '');
  }
  const codigos = [...new Set(texto.match(/E-N\d-\d\d/g) ?? [])];
  if (codigos.length) paso.ejercicios = codigos;
  // Los ejercicios que ya tienen su notación dibujada en la app.
  const notacion = [...codigos.flatMap(c => EN_APP[c] ?? []), ...(enApp ? DE_LA_APP.filter(([re]) => re.test(texto)).flatMap(([, ids]) => ids) : [])];
  if (notacion.length) paso.notacion = [...new Set(notacion)];
  texto = texto.replace(/\*\*(E-N\d-\d\d) ([^*]+(?:\*[^*]+\*[^*]*)*)\*\*/g, '**$2**');
  texto = texto.replace(/E-N\d-\d\d/g, c => `«${fichas[c]?.titulo ?? c}»`);
  if (paso.apoyo) paso.apoyo = limpiar(paso.apoyo.replace(/E-N\d-\d\d/g, c => `«${fichas[c]?.titulo ?? c}»`));
  paso.texto = limpiar(texto).replace(/\*\*Obra\*\*/g, '');
  if (!paso.recursos.length) delete paso.recursos;
  if (!paso.guia) delete paso.guia;
  return paso;
}

function nivelDe(n, fichas) {
  const texto = leer(`curso-${n}.md`);
  const ficha = {
    objetivo: limpiar(texto.match(/\*\*Objetivo general:\*\* (.*)/)[1]),
    parecido: limpiar(texto.match(/\*\*Se parece a:\*\* (.*?)\s*\*\*\[Estimación\]/)[1]),
  };
  const mapa = {};
  for (const m of texto.split('## Mapa de tramos')[1].split('\n---')[0].matchAll(/^\| (\d+) \| (.*?) \| (.*?) \|$/gm)) mapa[m[1]] = m[3];
  const matriz = [];
  for (const m of texto.split(/## Matriz del nivel \d/)[1].split('\n## ')[0].matchAll(/^\| ([^|]+?) \| ([^|]*?) \| ([^|]*?) \| ([^|]*?) \|$/gm)) {
    if (m[1] !== 'Área' && !m[1].startsWith('-')) matriz.push({ area: m[1], sale: limpiar(m[4]) });
  }
  const tramos = [];
  let tramo = null, leccion = null, paso = null;
  for (const l of texto.split('\n')) {
    let m;
    if (l.startsWith('## ') && !l.startsWith('## Tramo')) { if (tramo) { tramo = null; leccion = null; paso = null; } continue; }
    if ((m = l.match(/^## Tramo (\d+) · (.*)$/))) {
      tramo = { id: `n${n}.t${m[1]}`, numero: +m[1], titulo: m[2], trabaja: mapa[m[1]] ?? '', lecciones: [] };
      tramos.push(tramo); leccion = null; paso = null;
    } else if (tramo && (m = l.match(/^\*\*L(\d+)\.(\d+) · (.*?)\*\* \{([^}]*)\}/))) {
      leccion = { id: `${tramo.id}.l${m[2]}`, numero: +m[2], titulo: tratoDeTu(m[3]), areas: m[4].split(',').map(a => a.trim()), pasos: [] };
      tramo.lecciones.push(leccion); paso = null;
    } else if (leccion && (m = l.match(/^(\d+)\. (.*)$/))) {
      paso = { id: `${leccion.id}.p${m[1]}`, ...pasoDe(m[2], fichas) };
      leccion.pasos.push(paso);
    } else if (paso && (m = l.match(/^\s+- (.*)$/))) {
      (paso.lista ??= []).push(limpiar(m[1]));
    }
  }
  return { id: `nivel:${n}`, numero: n, nombre: `Nivel ${n}`, ...ficha, salidas: matriz, tramos };
}

const TIPO_OBRA = t => {
  const x = NORMAL(t);
  if (x.startsWith('troncal')) return 'troncal';
  if (x.startsWith('aplicacion')) return 'aplicacion';
  if (x.startsWith('lectura')) return 'lectura';
  if (x.startsWith('fragmento')) return 'fragmento';
  if (x.startsWith('alternativa') || x.startsWith('a elegir')) return 'alternativa';
  if (x.startsWith('conocida')) return 'conocida';
  return 'aplicacion';
};

// «Tárrega, *Lágrima*» → compositor y título. Sin coma, el nombre entero es el título.
function nombreObra(crudo) {
  const t = crudo.trim();
  const pegado = t.match(/^([A-ZÁÉÍÓÚ][\wáéíóúñ-]+) (op\..*)$/); // «Giuliani op. 50 n.º 17»
  if (pegado) return { compositor: pegado[1], titulo: pegado[2] };
  const m = t.match(/^([^,*]+),\s*(.+)$/);
  if (m) return { compositor: m[1].trim(), titulo: m[2].replaceAll('*', '').trim() };
  return { compositor: null, titulo: t.replaceAll('*', '').trim() };
}

function obras() {
  const lista = [], visto = new Set();
  const anadir = (o, n) => {
    const nombre = nombreObra(o.nombre);
    if (o.nombre.startsWith('*Recuerdos*')) { nombre.compositor = 'Tárrega'; nombre.titulo = 'Recuerdos de la Alhambra, parte en La menor'; }
    if (o.nombre.startsWith('Su ')) { nombre.compositor = 'Suya'; nombre.titulo = o.nombre.replace('Su ', '').replaceAll('*', ''); }
    if (/^Händel/.test(o.nombre)) nombre.titulo = 'Passacaglia';
    const clave = `${n}|${NORMAL(`${nombre.compositor} ${nombre.titulo}`)}`;
    if (visto.has(clave)) return;
    visto.add(clave);
    lista.push({ id: `o${n}-${SLUG(`${nombre.compositor ?? ''} ${nombre.titulo}`)}`, nivel: n, ...nombre, tipo: TIPO_OBRA(o.tipo), tipoTexto: o.tipo, ...o.resto, nombre: undefined });
  };
  const repertorio = leer('repertorio.md');
  for (const sec of repertorio.split(/\n(?=## \d+\. Nivel \d)/).slice(1)) {
    const n = +sec.match(/Nivel (\d)/)[1];
    for (const m of sec.matchAll(/^\| (.+?) \| (.*?) \| (.*?) \| (.*?) \| (.*?) \| (.*?) \|$/gm)) {
      if (m[1] === 'Obra' || m[1].startsWith('-')) continue;
      if (m[1] === '*Alternativas*') {
        for (const x of m[2].split(';')) anadir({ nombre: x.replace(/\s*\([^)]*\)\s*$/, ''), tipo: 'Alternativa', resto: { porVerificar: /Por verificar/.test(x) || undefined } }, n);
        continue;
      }
      const [epoca, derechos = ''] = m[6].split(' · ');
      const resto = {
        tecnica: limpiar(m[4]).replace(/\*\*\[Por verificar\]\*\*/g, '').trim() || undefined,
        teoria: m[5] === '—' ? undefined : limpiar(m[5]).replace(/\*\*\[Por verificar\]\*\*/g, '').trim() || undefined,
        epoca, derechos: /con derechos/i.test(derechos) ? 'con-derechos' : 'libre',
        porVerificar: /Por verificar/.test(m[0]) || undefined,
      };
      for (const parte of m[1].split(' / ')) anadir({ nombre: parte, tipo: m[3], resto }, n);
    }
  }
  // Las alternativas que solo están en el curso.
  for (let n = 1; n <= 7; n++) {
    const fila = leer(`curso-${n}.md`).match(/^\| \*\*Alternativas\*\* \| (.*?) \|/m);
    if (!fila) continue;
    for (const x of fila[1].split(';')) {
      const limpio = x.trim().replace(/\s*\*\*\[Por verificar\]\*\*.*$/, '').replace(/\s*\([^)]*\)\s*$/, '').trim();
      if (/ y /.test(limpio) && !/,/.test(limpio)) continue;
      anadir({ nombre: limpio, tipo: 'Alternativa', resto: { porVerificar: /Por verificar/.test(x) || undefined } }, n);
    }
  }
  return lista;
}

// Formas en que los pasos nombran una obra: «Lágrima», «op. 44 n.º 1», «Recuerdos»…
function nombres(o) {
  const t = NORMAL(o.titulo);
  const v = new Set([t, t.split(',')[0]]);
  const opus = t.match(/op\. ?\d+( n\.º \d+)?/);
  if (opus) { v.add(`${NORMAL(o.compositor ?? '')}, ${opus[0]}`); v.add(opus[0]); }
  const bwv = t.match(/bwv [\w. ]*\d+/);
  if (bwv) v.add(bwv[0]);
  if (t.startsWith('recuerdos')) v.add('recuerdos');
  if (NORMAL(o.compositor ?? '') === 'diabelli') v.add('diabelli');
  if (t.startsWith('sonata k.')) v.add('k. 208');
  return [...v].filter(x => x.length >= 5).sort((a, b) => b.length - a.length);
}

// Une cada paso de obra con su obra: la que nombra el paso, la del paso anterior de la lección o la del título del tramo.
function enlazarObras(niveles, lista) {
  const conObra = new Set(['Obra', 'Obra conocida', 'Aplicación', 'Repaso', 'Digitación']);
  for (const n of niveles) {
    const delNivel = lista.filter(o => o.nivel === n.numero && o.tipo !== 'alternativa' || o.nivel === n.numero && /Sor|Aguado|Händel|Turina/.test(o.compositor ?? ''));
    const buscar = texto => { const x = NORMAL(texto); return delNivel.find(o => nombres(o).some(k => x.includes(k))) ?? null; };
    for (const t of n.tramos) {
      const delTramo = buscar(t.titulo);
      for (const l of t.lecciones) {
        let anterior = null;
        for (const p of l.pasos) {
          if (!conObra.has(p.tipo)) continue;
          const o = buscar(p.texto) ?? (['Obra', 'Aplicación'].includes(p.tipo) ? anterior ?? delTramo : null);
          if (!o) continue;
          p.obra = o.id;
          anterior = o;
          if (!(o.tramos ??= []).some(x => x.id === t.id)) o.tramos.push({ id: t.id, numero: t.numero, titulo: t.titulo });
        }
      }
    }
  }
  for (const o of lista) {
    const k = Object.keys(FICHAS).find(x => NORMAL(o.titulo).includes(x));
    if (k) o.ficha = FICHAS[k];
    delete o.nombre;
  }
}

export function generar() {
  const fichas = fichasEjercicios();
  const niveles = [1, 2, 3, 4, 5, 6, 7].map(n => nivelDe(n, fichas));
  const lista = obras();
  enlazarObras(niveles, lista);
  return { version: '3.1', generadoDe: 'docs/curriculo', niveles, obras: lista, ejercicios: fichas };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const datos = generar();
  fs.mkdirSync(path.dirname(DESTINO), { recursive: true });
  fs.writeFileSync(DESTINO, JSON.stringify(datos, null, 1) + '\n');
  const n = datos.niveles;
  console.log(`niveles ${n.length} · tramos ${n.flatMap(x => x.tramos).length} · lecciones ${n.flatMap(x => x.tramos).flatMap(t => t.lecciones).length} · pasos ${n.flatMap(x => x.tramos).flatMap(t => t.lecciones).flatMap(l => l.pasos).length} · obras ${datos.obras.length} · ejercicios ${Object.keys(datos.ejercicios).length}`);
}
