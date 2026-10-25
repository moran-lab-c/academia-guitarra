import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularDominio, valorarIntento, criterioDe } from '../logica/dominio.js';
import { catalogoReal, practica, tanda, diagnostico, BIEN } from './ayuda.js';

const cat = catalogoReal();
const ESCALA = 'comp:esc.mi-mayor-1pos'; // precisión, ritmo, limpieza y control; 3 pasadas (2 en frío); sin mirar
const ok = (fecha, extra) => practica(ESCALA, fecha, { calidad: BIEN, pasadas: 3, ...extra });
const frio = (fecha, extra) => practica(ESCALA, fecha, { modo: 'comprobacion', calidad: BIEN, pasadas: 2, ...extra });
const mal = { ...BIEN, precision: 'mal' };
const estado = (evs, hoy, id = ESCALA) => calcularDominio(cat, evs, hoy).get(id);

test('lo que no se ha tocado está pendiente; empezado sin cumplir, en progreso', () => {
  assert.equal(estado([], '2026-11-01'), undefined);
  assert.equal(estado([ok('2026-11-01', { pasadas: 1 })], '2026-11-01').estado, 'en-progreso');
});

test('un acierto es «completado», no «dominado», aunque pasen 14 días', () => {
  assert.equal(estado([ok('2026-11-01')], '2026-11-15').estado, 'completado');
});

test('tres aciertos en frío y espaciados lo dan por dominado', () => {
  const e = estado([ok('2026-11-01'), frio('2026-11-04'), frio('2026-11-11')], '2026-11-11');
  assert.equal(e.estado, 'dominado');
  assert.equal(e.solidez, 3);
  assert.equal(e.proxima, '2026-12-02'); // y la siguiente, a los 21 días
});

test('una comprobación demasiado pronto no suma', () => {
  assert.equal(estado([ok('2026-11-01'), frio('2026-11-02')], '2026-11-02').solidez, 1);
  assert.equal(estado([ok('2026-11-01'), frio('2026-11-02'), frio('2026-11-04')], '2026-11-04').solidez, 2);
});

test('practicar en caliente o con ayuda no prueba que se retenga', () => {
  assert.equal(estado([ok('2026-11-01'), ok('2026-11-05'), ok('2026-11-20')], '2026-11-20').solidez, 1);
  assert.equal(estado([ok('2026-11-01'), frio('2026-11-05', { ayuda: 'notacion' })], '2026-11-05').solidez, 1);
});

test('un fallo en frío baja la solidez; si estaba dominado, pasa a «necesita repaso»', () => {
  const evs = [ok('2026-11-01'), frio('2026-11-04'), frio('2026-11-11'), frio('2026-12-02', { calidad: mal })];
  const e = estado(evs, '2026-12-02');
  assert.equal(e.estado, 'necesita-repaso');
  assert.equal(e.solidez, 1);
  assert.equal(e.proxima, '2026-12-05');
  // y vuelve a dominado con dos aciertos espaciados
  assert.equal(estado([...evs, frio('2026-12-05'), frio('2026-12-12')], '2026-12-12').estado, 'dominado');
});

test('un «casi» no suma ni resta, pero adelanta la comprobación', () => {
  const e = estado([ok('2026-11-01'), frio('2026-11-04'), frio('2026-11-11', { calidad: { ...BIEN, ritmo: 'fallos' } })], '2026-11-11');
  assert.equal(e.solidez, 2);
  assert.equal(e.proxima, '2026-11-14'); // la mitad de 7 días
});

test('lo dominado sin comprobar el doble de su intervalo pasa a «necesita repaso»', () => {
  const evs = [ok('2026-11-01'), frio('2026-11-04'), frio('2026-11-11')];
  assert.equal(estado(evs, '2026-12-23').estado, 'dominado');
  assert.equal(estado(evs, '2026-12-24').estado, 'necesita-repaso');
});

test('cuenta la calidad en sus aspectos, no solo el tempo', () => {
  const c = criterioDe(cat.porId.get(ESCALA));
  assert.equal(valorarIntento({ calidad: BIEN, pasadas: 3 }, c), 'ok');
  assert.equal(valorarIntento({ calidad: BIEN, pasadas: 3, tempo: 40 }, c), 'ok'); // sin tempo obligatorio, el tempo solo se apunta
  assert.equal(valorarIntento({ calidad: { ...BIEN, limpieza: 'fallos' }, pasadas: 3 }, c), 'casi');
  assert.equal(valorarIntento({ calidad: { ...BIEN, limpieza: 'fallos', ritmo: 'fallos' }, pasadas: 3 }, c), 'no');
  assert.equal(valorarIntento({ calidad: { ...BIEN, control: 'mal' }, pasadas: 3 }, c), 'no');
  assert.equal(valorarIntento({ calidad: { precision: 'bien' }, pasadas: 3 }, c), 'no'); // lo no valorado no se da por bueno
  assert.equal(valorarIntento({ calidad: BIEN, pasadas: 2 }, c), 'casi');
  // Una obra mira otros aspectos (continuidad, dinámica, fraseo…): con fallos en el fraseo, «casi».
  const obra = criterioDe(cat.porId.get('obra:tarrega.lagrima'));
  assert.ok(obra.dimensiones.includes('fraseo') && obra.dimensiones.includes('continuidad'));
  assert.equal(valorarIntento({ calidad: { ...BIEN, fraseo: 'fallos' }, pasadas: 1 }, obra), 'casi');
  assert.equal(valorarIntento({ calidad: BIEN, pasadas: 1, ayuda: 'notacion' }, obra), 'ok');
});

test('los números del criterio se ajustan, y el tempo solo obliga si se dice', () => {
  const item = cat.porId.get(ESCALA);
  const conTempo = criterioDe(item, { tempo: { referencia: 72, obligatorio: true }, pasadas: 2, por: 'profesor', motivo: 'para esta semana' });
  assert.equal(valorarIntento({ calidad: BIEN, pasadas: 2, tempo: 72 }, conTempo), 'ok');
  assert.equal(valorarIntento({ calidad: BIEN, pasadas: 2, tempo: 68 }, conTempo), 'casi');
  assert.equal(valorarIntento({ calidad: BIEN, pasadas: 2, tempo: 60 }, conTempo), 'no');
  assert.equal(valorarIntento({ calidad: BIEN, pasadas: 2, tempo: 60 }, criterioDe(item, { tempo: { referencia: 72, obligatorio: false } })), 'casi'); // 2 de 3 pasadas
  const deMemoria = criterioDe(cat.porId.get('obra:tarrega.lagrima'), { memoria: true });
  assert.equal(valorarIntento({ calidad: { ...BIEN, memoria: 'bien' }, pasadas: 1, ayuda: 'notacion' }, deMemoria), 'no'); // leyendo no es de memoria
  assert.equal(calcularDominio(cat, [ok('2026-11-01', { pasadas: 2 })], '2026-11-01', { [ESCALA]: { pasadas: 2 } }).get(ESCALA).estado, 'completado');
});

test('practicar una sección no da por completada la obra entera', () => {
  const lagrima = 'obra:tarrega.lagrima';
  const seccion = practica(lagrima, '2026-11-01', { calidad: BIEN, pasadas: 1, seccion: 'A' });
  const sueltos = practica(lagrima, '2026-11-01', { calidad: BIEN, pasadas: 1, fragmento: '1-8' });
  const dom = calcularDominio(cat, [seccion, sueltos], '2026-11-01');
  assert.equal(dom.get(lagrima), undefined);
  assert.equal(dom.get(`${lagrima}#A`).estado, 'completado');
  assert.equal(calcularDominio(cat, [practica(lagrima, '2026-11-01', { calidad: BIEN, pasadas: 1 })], '2026-11-01').get(lagrima).estado, 'completado');
});

test('en las tandas que corrige la app, solo la primera del día cuenta en frío', () => {
  const NOTAS = 'comp:lec.notas-1pos-agudas'; // 20 preguntas, 90 %
  const bien = { [NOTAS]: [19, 20, 1500] };
  const evs = [tanda(bien, '2026-11-01'), tanda(bien, '2026-11-04'), tanda(bien, '2026-11-04', 20), tanda(bien, '2026-11-11')];
  assert.equal(estado(evs.slice(0, 3), '2026-11-04', NOTAS).solidez, 2);
  assert.equal(estado(evs, '2026-11-11', NOTAS).estado, 'dominado');
  assert.equal(estado([tanda({ [NOTAS]: [16, 20, 1500] }, '2026-11-01')], '2026-11-01', NOTAS).estado, 'en-progreso'); // 80 %
});

test('el diagnóstico convalida y dos comprobaciones lo confirman, sin volver a estudiarlo', () => {
  const evs = [diagnostico('2026-11-01', { pruebas: [{ item: ESCALA, resultado: 'ok' }] })];
  assert.equal(estado(evs, '2026-11-01').estado, 'completado');
  assert.equal(estado([...evs, frio('2026-11-04'), frio('2026-11-11')], '2026-11-11').estado, 'dominado');
});
