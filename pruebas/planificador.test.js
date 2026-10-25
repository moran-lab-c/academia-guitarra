import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planificar, repartir, DURACIONES, MIN_BLOQUE } from '../logica/planificador.js';
import { estadoInicial } from '../logica/esquema.js';
import { practica, diagnostico, ctxDe, catalogoReal, BIEN } from './ayuda.js';

const cat = catalogoReal();
const rutaDe = id => cat.porId.get(id)?.programa;
// La pasada final repite a propósito la obra del bloque de repertorio: no cuenta como repetida.
const itemsDe = plan => plan.bloques.filter(b => b.tipo !== 'pasada').flatMap(b => [b.item, ...(b.items || []).map(i => i.id)]).filter(Boolean);
const conLagrima = () => { const e = estadoInicial(); e.obras['obra:tarrega.lagrima'] = { marca: 'en-estudio' }; return e; };

test('cuadra los minutos pedidos, con bloques de 5 o más y las pausas', () => {
  const ctx = ctxDe({ estado: conLagrima() });
  for (const minutos of [...DURACIONES, 25, 75]) {
    const plan = planificar(ctx, { minutos });
    assert.equal(plan.total, minutos, `${minutos} min`);
    for (const b of plan.bloques) assert.ok(b.minutos >= (b.tipo === 'calentamiento' ? 3 : b.tipo === 'comprobacion' ? 2 : MIN_BLOQUE), `${minutos} min: ${b.titulo} ${b.minutos}`);
    assert.equal(plan.bloques.filter(b => b.tipo === 'pausa').length, minutos >= 90 ? Math.floor(minutos / 50) : 0);
  }
});

test('el encargo del profesor va primero y le quita el sitio a lo automático', () => {
  const estado = conLagrima();
  estado.tareasProfesor.push({ id: 't1', item: 'obra:tarrega.lagrima', minutos: 15, hasta: '2026-11-03', clase: '2026-10-27' });
  const plan = planificar(ctxDe({ estado }), { minutos: 30 });
  assert.equal(plan.bloques[0].tipo, 'calentamiento');
  assert.equal(plan.bloques[1].tipo, 'encargo');
  assert.equal(plan.bloques[1].item, 'obra:tarrega.lagrima');
  assert.equal(plan.bloques.filter(b => b.item === 'obra:tarrega.lagrima').length, 1); // no se repite en repertorio
  const largo = planificar(ctxDe({ estado }), { minutos: 45 }); // el encargo no se parte en trabajo y pasada
  assert.equal(largo.bloques.find(b => b.tipo === 'encargo').minutos, 15);
  assert.ok(!largo.bloques.some(b => b.tipo === 'pasada' && b.item === 'obra:tarrega.lagrima'));
  const corto = planificar(ctxDe({ estado }), { minutos: 20 });
  assert.deepEqual(corto.bloques.map(b => [b.tipo, b.minutos]), [['calentamiento', 3], ['encargo', 17]]); // si no cabe nada más, la sesión es el encargo
  // un encargo caducado ya no cuenta
  assert.ok(!planificar(ctxDe({ estado, hoy: '2026-11-04' }), { minutos: 30 }).bloques.some(b => b.tipo === 'encargo'));
});

test('lo que toca comprobar en frío va al principio, antes de practicarlo', () => {
  const eventos = [practica('comp:esc.mi-mayor-1pos', '2026-10-28', { calidad: BIEN, pasadas: 3 })];
  const plan = planificar(ctxDe({ estado: conLagrima(), eventos, hoy: '2026-11-01' }), { minutos: 45 });
  const i = plan.bloques.findIndex(b => b.tipo === 'comprobacion');
  assert.equal(i, 1);
  assert.deepEqual(plan.bloques[i].items.map(x => x.id), ['comp:esc.mi-mayor-1pos']);
});

test('las rutas no se mezclan; con las dos, cada una en sus bloques', () => {
  const ctx = ctxDe({ estado: conLagrima() });
  assert.ok(itemsDe(planificar(ctx, { minutos: 60, programa: 'clasica' })).every(id => rutaDe(id) !== 'flamenca'));
  assert.ok(itemsDe(planificar(ctx, { minutos: 60, programa: 'flamenca' })).every(id => rutaDe(id) !== 'clasica'));
  const ambas = itemsDe(planificar(ctx, { minutos: 90, programa: 'ambas' }));
  assert.ok(ambas.some(id => rutaDe(id) === 'flamenca') && ambas.some(id => rutaDe(id) === 'clasica'));
  assert.equal(new Set(ambas).size, ambas.length); // nada repetido
});

test('un área que va por detrás de la técnica recibe más tiempo', () => {
  const lectura = plan => plan.bloques.filter(b => b.area === 'lectura').reduce((s, b) => s + b.minutos, 0);
  const normal = planificar(ctxDe({ estado: conLagrima() }), { minutos: 60 });
  const tecnicaAlta = planificar(ctxDe({ estado: conLagrima(), eventos: [diagnostico('2026-10-31', { niveles: { tecnica: 3 } })] }), { minutos: 60 });
  assert.ok(lectura(tecnicaAlta) > lectura(normal), `${lectura(tecnicaAlta)} > ${lectura(normal)}`);
  assert.ok(tecnicaAlta.bloques.find(b => b.area === 'lectura').motivos.some(m => /por detrás/.test(m)));
});

test('el desfase se cuenta en niveles: lectura 1,4 con técnica 2 va un nivel por detrás', () => {
  const ctx = ctxDe({ estado: conLagrima(), eventos: [diagnostico('2026-10-31', { niveles: { tecnica: 2 } })] });
  ctx.niveles.lectura = { ...ctx.niveles.lectura, nivel: 1, efectivo: 1.4 };
  const plan = planificar(ctx, { minutos: 60 });
  assert.ok(plan.bloques.find(b => b.area === 'lectura').motivos.some(m => /va 1 nivel por detrás/.test(m)));
});

test('lo que el diagnóstico estima se confirma, no se vuelve a estudiar', () => {
  const plan = planificar(ctxDe({ estado: conLagrima(), eventos: [diagnostico('2026-10-31', { niveles: { tecnica: 1 } })] }), { minutos: 60 });
  const tecnica = plan.bloques.filter(b => b.area === 'tecnica' && b.tipo === 'area').map(b => b.item);
  assert.ok(!tecnica.some(id => cat.porId.get(id).nivel <= 1));
  assert.ok(plan.bloques.find(b => b.tipo === 'comprobacion').items.every(x => x.motivo.includes('diagnóstico')));
});

test('cada bloque dice por qué está, y avisa de lo que aún no tiene contenido', () => {
  for (const ruta of ['clasica', 'flamenca', 'ambas']) for (const minutos of [20, 60, 120]) {
    for (const b of planificar(ctxDe({ estado: conLagrima() }), { minutos, programa: ruta }).bloques) assert.ok(b.motivos?.length, `${ruta} ${minutos}: ${b.titulo}`);
  }
  const plan = planificar(ctxDe({ estado: conLagrima() }), { minutos: 60, programa: 'flamenca' });
  assert.ok(plan.avisos.some(a => a.includes('Todavía sin contenido') && a.includes('Acompañamiento')));
});

test('el formato que pide el profesor manda, y la otra opción sigue a mano', () => {
  const estado = conLagrima();
  estado.tareasProfesor.push({ id: 't1', item: 'ej:esc.mi-mayor-1pos', minutos: 10, hasta: '2026-11-03', formato: 'partitura' });
  const encargo = planificar(ctxDe({ estado }), { minutos: 30 }).bloques.find(b => b.tipo === 'encargo');
  assert.equal(encargo.notacion.recomendado, 'partitura');
  assert.match(encargo.notacion.motivo, /profesor/);
  assert.equal(encargo.notacion.alternativa, 'tablatura');
});

test('la lectura se trabaja también sobre pasajes de sus obras', () => {
  const ctx = ctxDe({ estado: conLagrima() });
  const lagrima = ctx.cat.porId.get('obra:tarrega.lagrima');
  lagrima.secciones = [{ id: 'A', titulo: 'Parte A', lecturaNecesaria: 0.4, notacion: { partitura: 'externa', tablatura: 'pendiente' } }];
  const bloque = planificar(ctx, { minutos: 60 }).bloques.find(b => b.area === 'lectura');
  assert.equal(bloque.item, 'obra:tarrega.lagrima');
  assert.equal(bloque.seccion, 'A');
  assert.equal(bloque.notacion.recomendado, 'partitura');
});

test('es determinista y reparte sin perder minutos', () => {
  const ctx = ctxDe({ estado: conLagrima() });
  assert.deepEqual(planificar(ctx, { minutos: 45 }), planificar(ctx, { minutos: 45 }));
  assert.deepEqual(repartir(23, [3, 1, 1]), [13, 5, 5]);
  assert.equal(repartir(37, [2.2, 1.3, 1, 0.4]).reduce((a, b) => a + b, 0), 37);
});
