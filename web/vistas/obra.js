// Una obra (lámina P4-Obra): su ficha, su papel en la ruta (y si es obra final), sus partes, partitura y tablatura,
// lo que trabaja, lo que necesita (lo que ya tiene, lo que hay que reforzar y lo que falta, con dónde se trabaja), si ya
// la conocía de antes, su progreso y su criterio de dominio.
import { h } from '../nucleo/dom.js';
import { ctx, cambiar } from '../nucleo/almacen.js';
import { enlace, repintar } from '../nucleo/rutas.js';
import { explicar, formatoPara } from '../../logica/recomendador.js';
import { avisoTecnicaLectura, textoTablatura, decimal } from '../../logica/notacion.js';
import { necesidades, obraEnRutas, estadoObra, progresoFinal, textoRequisitos } from '../../logica/ruta.js';
import { seccionDe, esFragmento } from '../../logica/catalogo.js';
import { MARCAS_OBRA, CONOCIDA } from '../../logica/esquema.js';
import { formularioRegistro } from '../componentes/registro.js';
import { selectorFormato } from '../componentes/notacion.js';
import { bloqueCriterio } from '../componentes/criterio.js';
import { chipEstado, colorArea } from '../componentes/marcas.js';
import { fecha, NOMBRE_MARCA, NOMBRE_NATURALEZA } from '../componentes/comunes.js';
import { barraMetronomo } from '../componentes/metronomo.js';
import { tempoDe } from '../../logica/metronomo.js';

const vista = { id: null, seccion: null, abierto: null };
const NOMBRE_CONOCIDA = { '': 'No la conocía', parcial: 'Una parte', entera: 'Entera', dominada: 'Entera y bien dominada' };
const GRUPOS = [['refuerzo', 'Necesitan refuerzo', 'refuerzo'], ['falta', 'Te faltan', 'repaso'], ['estimada', 'Por confirmar (diagnóstico)', 'neutro'], ['por-consolidar', 'Todavía no consolidadas', 'neutro'], ['la-tienes', 'Ya las tienes', 'neutro']];

export default function obra({ id }) {
  const c = ctx();
  const o = c.cat.porId.get(id);
  if (!o || o.tipo !== 'obra') return h('p', { class: 'suave' }, 'Esta obra no existe.');
  if (vista.id !== id) Object.assign(vista, { id, seccion: null, abierto: null });
  const sec = seccionDe(o, vista.seccion); // una sección o un fragmento
  const clave = sec ? `${id}#${sec.id}` : id;
  const r = explicar(o, c);
  const est = estadoObra(c, id);
  const enRutas = obraEnRutas(c, id);
  const n = necesidades(c, id, sec?.id ?? null);
  const final = enRutas.finalDe[0];
  const tramos = [...new Map(enRutas.pasos.filter(p => p.tramo).map(p => [`${p.seccion ?? ''}`, p])).values()];
  const meta = [o.compositor, o.subtitulo && o.subtitulo[0].toLowerCase() + o.subtitulo.slice(1), (o.tonalidad || []).join(' y '), o.compas,
    ...(o.nivel?.referencias || []).map(x => `${x.sistema}${x.nivel != null ? ` nivel ${x.nivel}` : ''}${x.curso != null ? ` ${x.curso}.º` : ''}`)].filter(Boolean).join(' · ');
  const rec = formatoPara(o, c, { proposito: 'repertorio', seccion: sec });
  const tecnicaLectura = avisoTecnicaLectura(o, c.tecnica(o.programa), c.niveles.lectura?.efectivo ?? 0);

  return h('div', { class: 'pantalla-obra' },
    h('a', { href: '#/repertorio', class: 'suave' }, '← Obras'),
    h('header', { class: 'pila-s', style: 'margin:8px 0 14px' },
      h('div', { class: 'fila' },
        final && chipEstado(`★ OBRA FINAL DEL CURSO ${String(final.numero).padStart(2, '0')}`, 'encargo'),
        tramos.length > 0 && h('span', { class: 'rotulo' }, tramos.map(p => `${p.seccion ? `PARTE ${p.seccion} EN EL TRAMO ${p.tramo}` : `TRAMO ${p.tramo}`}`).join(' · ')),
        chipEstado(est.texto, est.clave === 'en-repaso' ? 'repaso' : est.clave === 'conocida' ? 'refuerzo' : 'neutro')),
      h('h1', { class: 'titulo-obra', style: 'font-size:60px;line-height:1;margin:0' }, o.titulo),
      h('div', { class: 'suave' }, meta)),
    h('div', { class: 'con-lateral' },
      h('section', { class: 'pila' },
        h('div', { class: 'fila-entre' },
          ((o.secciones || []).length > 0 || (o.fragmentos || []).length > 0) && h('div', { class: 'fila', role: 'group', 'aria-label': 'Parte de la obra' },
            [null, ...(o.secciones || [])].map(s => h('button', { class: 'pildora', 'aria-pressed': String((s?.id ?? null) === vista.seccion), onclick: () => { vista.seccion = s?.id ?? null; repintar(); } },
              s ? `${s.titulo}${['completado', 'dominado'].includes(c.estadoDe(`${id}#${s.id}`)) ? ' ✓' : ''}` : 'Toda la obra')),
            (o.fragmentos || []).map(f => h('button', { class: 'pildora pildora--fragmento', title: f.proposito, 'aria-pressed': String(f.id === vista.seccion), onclick: () => { vista.seccion = f.id; repintar(); } },
              `Fragmento: ${f.titulo}${['completado', 'dominado'].includes(c.estadoDe(`${id}#${f.id}`)) ? ' ✓' : ''}`)))),
        sec && esFragmento(o, sec.id) && h('div', { class: 'tarjeta-s pila-s' },
          h('div', { class: 'rotulo' }, `FRAGMENTO${sec.seccion ? ` DE LA ${(seccionDe(o, sec.seccion)?.titulo ?? sec.seccion).toUpperCase()}` : ''}${sec.compases ? ` · COMPASES ${sec.compases[0]}-${sec.compases[1]}` : ''}`),
          h('p', { style: 'margin:0' }, sec.proposito),
          (sec.porVerificar || []).length > 0 && h('p', { class: 'pequeno ocre', style: 'margin:0' }, `Por verificar: ${sec.porVerificar.map(x => `${x.campo} (${x.motivo})`).join('; ')}.`)),
        tecnicaLectura && h('div', { class: 'aviso' }, tecnicaLectura),
        selectorFormato(o, rec, clave, sec),
        practicarHoy(c, o, sec, est),
        h('div', { class: 'rejilla-2' }, enLaRuta(c, enRutas), progreso(c, o))),
      h('aside', { class: 'pila' },
        barraMetronomo({ clave, tempo: tempoDe(c, clave), compas: sec?.compas ?? o.compas ?? null }),
        loQueTrabaja(c, n, final),
        loQueNecesitas(n, sec),
        conocidaDeAntes(c, o, est),
        h('div', { class: 'tarjeta pila-s' },
          h('div', { class: 'rotulo' }, 'CRITERIO DE DOMINIO'),
          bloqueCriterio(o),
          h('label', null, 'Tu marca', h('select', { onchange: e => cambiar(x => { x.obras[id] = { ...x.obras[id], marca: e.target.value || null }; }) },
            ['', ...MARCAS_OBRA].map(v => h('option', { value: v, selected: (c.marca(id) ?? '') === v }, v ? NOMBRE_MARCA[v] : '—')))),
          h('p', { class: 'pequeno suave' }, r.viabilidad.motivo)),
        ficha(o))));
}

function practicarHoy(c, o, sec, est) {
  const que = sec ? `la ${sec.titulo.charAt(0).toLowerCase()}${sec.titulo.slice(1)}` : 'la obra';
  const consejo = est.clave === 'conocida'
    ? `La conoces de antes: tócala entera, sin calentarla, y valora cada aspecto. Si sale, queda aprendida y la ruta sigue; si algo falla, te dirá qué reforzar.`
    : `Primero lo que necesita refuerzo, aislado y lento. Después ${que} entera, y para acabar una pasada sin parar, aunque haya fallos.`;
  return h('div', { class: 'tarjeta fila-entre', style: 'gap:16px' },
    h('div', { class: 'pila-s' }, h('div', { class: 'rotulo' }, 'CÓMO PRACTICARLA'), h('p', { style: 'margin:0' }, consejo)),
    h('div', { class: 'fila' },
      h('button', { class: 'btn btn-papel', onclick: () => { vista.abierto = 'trabajo'; repintar(); } }, 'Registrar'),
      h('button', { class: 'btn btn-borde', onclick: () => { vista.abierto = 'comprobacion'; repintar(); } }, est.clave === 'conocida' ? 'Pasada de comprobación' : 'Pasada en frío')),
    vista.abierto && h('div', { style: 'flex-basis:100%' }, formularioRegistro(o, { modo: vista.abierto, seccion: vista.seccion }, () => { vista.abierto = null; repintar(); })));
}

function loQueTrabaja(c, n, final) {
  return h('div', { class: 'tarjeta pila-s' },
    h('div', { class: 'rotulo' }, 'LO QUE ESTA OBRA TRABAJA'),
    n.desarrolla.length ? h('ul', { class: 'lista-limpia pila-s' }, n.desarrolla.map(x => h('li', { class: 'fila-entre' },
      h('span', { class: 'fila', style: 'gap:8px' }, h('i', { class: 'punto', style: `--c:${colorArea(c.cat.porId.get(x.comp)?.area)}` }), h('a', { href: enlace('/competencia', x.comp) }, x.nombre)),
      h('span', { class: 'pequeno suave' }, x.donde.find(d => d.tipo === 'paso') ? `tramo ${x.donde.find(d => d.tipo === 'paso').tramo}` : '')))) : h('p', { class: 'suave' }, 'Sin clasificar todavía.'),
    final && h('p', { class: 'pequeno suave' }, final.justificacion));
}

function loQueNecesitas(n, sec) {
  const titulo = sec ? `LO QUE NECESITAS PARA LA ${sec.titulo.toUpperCase()}` : 'LO QUE NECESITAS PARA ESTA OBRA';
  return h('div', { class: 'tarjeta tarjeta-borde pila-s' },
    h('div', { class: 'rotulo' }, titulo),
    // Sin habilidades en «pide» no se puede decir «no pide nada que no tengas» si la lectura que pide no llega.
    !n.pide.length && h('p', { class: 'suave' }, n.lectura && n.lectura.pide > n.lectura.tienes
      ? 'No pide ninguna habilidad de la ruta (o está sin clasificar); lo que pide es lectura, más abajo.'
      : 'No pide nada que no tengas todavía (o está sin clasificar).'),
    GRUPOS.map(([clave, nombre, tipo]) => {
      const lista = n.pide.filter(x => x.situacion === clave);
      if (!lista.length) return null;
      return h('div', { class: 'pila-s' }, chipEstado(nombre, tipo),
        lista.map(x => {
          const d = x.donde.find(y => y.tipo === 'paso') ?? x.donde[0];
          return h('a', { class: 'tarjeta-s fila-entre', href: d?.href ?? enlace('/competencia', x.comp) },
            h('span', null, h('strong', null, x.nombre), d && h('div', { class: 'pequeno suave' }, d.tipo === 'paso' ? `paso de la ruta · curso ${String(d.curso).padStart(2, '0')}, tramo ${d.tramo}` : `ejercicio · ${d.titulo}`)),
            h('span', { class: 'pequeno' }, clave === 'la-tienes' ? 'Ver' : 'Practicar →'));
        }));
    }),
    n.lectura && h('p', { class: 'pequeno suave' }, `Lectura: para tocarla solo con partitura pide ${decimal(n.lectura.pide)}; tienes ${decimal(n.lectura.tienes)}. No frena nada. ${textoTablatura(n.obra, n.seccion)}`));
}

function conocidaDeAntes(c, o, est) {
  const actual = c.estado.obras?.[o.id]?.conocida ?? null;
  const secciones = o.secciones || [];
  return h('div', { class: 'tarjeta pila-s' },
    h('div', { class: 'rotulo' }, 'SI YA LA SABÍAS TOCAR'),
    h('p', { class: 'pequeno suave' }, 'Lo que ya sabías no se vuelve a aprender desde cero: se comprueba con una pasada en frío, y lo que falle se refuerza.'),
    h('label', null, '¿La conocías de antes?', h('select', { onchange: e => cambiar(x => {
      const nivel = e.target.value;
      x.obras[o.id] = { ...x.obras[o.id], conocida: nivel ? { nivel, secciones: nivel === 'parcial' ? actual?.secciones ?? [] : undefined, fecha: c.hoy } : undefined };
      if (!nivel) delete x.obras[o.id].conocida;
    }) }, ['', ...CONOCIDA].map(v => h('option', { value: v, selected: (actual?.nivel ?? '') === v }, NOMBRE_CONOCIDA[v])))),
    actual?.nivel === 'parcial' && secciones.length > 0 && h('div', { class: 'fila' }, secciones.map(s => h('label', { class: 'check' },
      h('input', { type: 'checkbox', checked: (actual.secciones || []).includes(s.id), onchange: e => cambiar(x => {
        const k = x.obras[o.id].conocida; const set = new Set(k.secciones || []);
        if (e.target.checked) set.add(s.id); else set.delete(s.id);
        k.secciones = [...set];
      }) }), s.titulo))),
    est.deEvaluacion && h('p', { class: 'pequeno' }, 'Como es obra final, aquí sirve de evaluación del curso: tocarla entera, con sus requisitos.'));
}

function enLaRuta(c, enRutas) {
  return h('div', { class: 'tarjeta pila-s' },
    h('div', { class: 'rotulo' }, 'EN LA RUTA'),
    enRutas.pasos.length ? h('ul', { class: 'lista-limpia pila-s' }, enRutas.pasos.map(p => h('li', null,
      h('a', { href: p.href }, p.titulo), h('div', { class: 'pequeno suave' }, `curso ${String(p.curso).padStart(2, '0')} · tramo ${p.tramo} · ${{ aplicacion: 'aplicación', obra: p.papel === 'lectura' ? 'obra para leer' : 'obra', preparacion: 'preparación de la obra final' }[p.clase] ?? p.clase}`))))
      : h('p', { class: 'suave' }, 'Fuera de la ruta: para tocar por gusto o adelantar.'),
    enRutas.finalDe.map(f => {
      // Como obra final: primera realización, aprendida con sus requisitos, consolidada y dominada (el modelo de siempre).
      // El de la ruta sabe si la preparación del tramo de cierre está hecha (sin ella no queda aprendida).
      const pf = c.ruta?.(f.curso)?.final?.progreso ?? progresoFinal(c, f.obra, f.requisitos);
      const pasadas = pf.pasadas > 1 ? ` (${pf.pasadas} pasadas seguidas${pf.ajustadoPor === 'profesor' ? ', como pide tu profesor' : ', según tu ajuste'})` : '';
      const marca = (ok, t) => h('li', { class: ok ? '' : 'suave' }, `${ok ? '✓' : '○'} ${t}`);
      return h('div', { class: 'pila-s' },
        h('p', { class: 'pequeno', style: 'margin:0' }, `★ Obra final del curso ${String(f.numero).padStart(2, '0')}: ${textoRequisitos(f.requisitos) ?? 'entera'}.`),
        h('ul', { class: 'lista-limpia pequeno' },
          marca(pf.primera, 'Primera realización (entera, como pida su criterio; puede ser leyendo)'),
          ...pf.requisitos.map(r => marca(r.cumplido, r.id === 'memoria' ? `De memoria, sin mirar: entera y con todos los aspectos bien${pasadas}` : r.exigible ? 'Grabada' : 'Grabada (opcional por ahora: no se exige hasta que la grabación forme parte de la evaluación)')),
          marca(pf.preparada, 'Preparación del tramo de cierre hecha'),
          marca(pf.aprendida, `Aprendida con sus requisitos: permite cerrar el curso${pf.pasadas > 1 ? '' : ' (basta una pasada válida)'}`),
          marca(pf.consolidada, 'Consolidada (comprobaciones en frío, días después): nivel posterior, no hace falta para pasar de curso'),
          marca(pf.dominada, 'Dominada')));
    }));
}

function progreso(c, o) {
  const filas = [[null, 'Entera'], ...(o.secciones || []).map(s => [s.id, s.titulo])];
  const ultimoTempo = clave => [...c.eventos].reverse().find(e => e.item === o.id && (e.seccion ?? null) === clave && e.tempo)?.tempo;
  return h('div', { class: 'tarjeta pila-s' },
    h('div', { class: 'rotulo' }, 'PROGRESO Y DOMINIO'),
    filas.map(([s, t]) => {
      const k = s ? `${o.id}#${s}` : o.id;
      const d = c.dom.get(k);
      const nombre = { pendiente: 'sin empezar', 'en-progreso': 'en curso', completado: 'aprendida', dominado: 'dominada', 'necesita-repaso': 'en repaso' }[c.estadoDe(k)];
      return h('div', { class: 'fila-entre' }, h('span', null, t),
        h('span', { class: 'pequeno suave' }, nombre, d?.solidez ? ` · solidez ${Math.min(3, d.solidez)} de 3` : '', d?.proxima && d.solidez ? ` · en frío ${fecha(d.proxima)}` : ''),
        h('span', { class: 'dato' }, ultimoTempo(s) ? `♩ ${ultimoTempo(s)}` : '—'));
    }),
    h('details', null, h('summary', { class: 'pequeno' }, 'Historial'),
      h('ul', { class: 'pequeno' }, c.eventos.filter(e => e.item === o.id).slice(-10).reverse().map(e => h('li', null,
        `${fecha(e.t)} · ${e.modo === 'comprobacion' ? 'en frío' : 'práctica'} · ${e.min ?? 0} min`, e.seccion ? ` · ${e.seccion}` : ' · entera', e.tempo ? ` · ♩=${e.tempo}` : '', e.nota ? ` · ${e.nota}` : '')))));
}

function ficha(o) {
  const nat = x => NOMBRE_NATURALEZA[x] ?? x;
  const fila = (t, v) => v != null && v !== '' && h('tr', null, h('th', null, t), h('td', null, v));
  return h('details', { class: 'tarjeta' }, h('summary', { class: 'rotulo' }, 'FICHA'),
    h('table', null,
      fila('Catálogo', o.catalogo), fila('Época', o.periodo), fila('Estilo', o.estilo), fila('Clase', o.clase),
      fila('Curso', o.nivel ? `${o.nivel.curso} (${nat(o.nivel.naturaleza)})` : 'Sin clasificar'),
      fila('Dificultad', o.dificultad ? `${decimal(o.dificultad.valor)} de 7 (${nat(o.dificultad.naturaleza)})` : null),
      fila('Lectura que pide', o.lecturaNecesaria ? `${decimal(o.lecturaNecesaria.nivel)} (${nat(o.lecturaNecesaria.naturaleza)})` : null),
      fila('Duración', o.duracionMin ? `${o.duracionMin.valor ?? o.duracionMin} min aprox.` : null),
      fila('Notación', o.notacion?.donde ? `Fuera de la app: ${o.notacion.donde}` : null),
      fila('Por qué está', o.porQue),
      fila('Por verificar', (o.porVerificar || []).length ? h('ul', { class: 'lista-limpia pila-s' }, o.porVerificar.map(x => h('li', { class: 'ocre' }, `${x.campo}: ${x.motivo}`))) : null),
      fila('Nota', [o.nota, o.notaSecciones].filter(Boolean).join(' '))));
}
