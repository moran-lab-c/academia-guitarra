import { test } from 'node:test';
import assert from 'node:assert/strict';
import { viabilidad, explicar, recomendar } from '../logica/recomendador.js';
import { estadoInicial } from '../logica/esquema.js';
import { ctxDe } from './ayuda.js';

test('estudiable ahora, cerca o demasiado difícil, con lo que falta', () => {
  const ctx = ctxDe();
  const v = id => viabilidad(ctx.cat.porId.get(id), ctx);
  assert.equal(v('obra:sor.op60-1').clase, 'estudiable');
  assert.equal(v('obra:tarrega.lagrima').clase, 'cerca');
  const recuerdos = v('obra:tarrega.recuerdos');
  assert.equal(recuerdos.clase, 'demasiado-dificil');
  assert.ok(recuerdos.faltan.includes('comp:tec.tremolo-a-tempo'));
  assert.equal(v('obra:cepero.agua-marina').clase, 'sin-clasificar');
});

test('explica por qué conviene: lo que desarrolla coincide con sus puntos de trabajo', () => {
  const ctx = ctxDe();
  const r = explicar(ctx.cat.porId.get('obra:tarrega.lagrima'), ctx);
  assert.match(r.razones[0], /Te conviene ahora porque desarrolla «Melodía por encima del acompañamiento»/);
  assert.match(r.razones.at(-1), /tablatura/);
});

test('una obra en preparación convierte sus requisitos en puntos de trabajo', () => {
  const estado = estadoInicial();
  estado.obras['obra:tarrega.recuerdos'] = { marca: 'en-preparacion' };
  const ctx = ctxDe({ estado });
  assert.equal(ctx.focos.get('comp:tec.cejilla-completa'), 'objetivo');
});

test('no recomienda lo que ya estudia ni lo aparcado, y una obra difícil no desaparece del catálogo', () => {
  const estado = estadoInicial();
  estado.obras['obra:sor.op60-1'] = { marca: 'en-estudio' };
  const ctx = ctxDe({ estado });
  const ids = recomendar(ctx, { limite: 10 }).map(r => r.obra.id);
  assert.ok(!ids.includes('obra:sor.op60-1'));
  assert.ok(ids.includes('obra:tarrega.recuerdos'));
  assert.equal(ids[0], 'obra:tarrega.lagrima');
});
