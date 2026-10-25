import { test } from 'node:test';
import assert from 'node:assert/strict';
import { practica, tanda, diagnostico, ctxDe, BIEN } from './ayuda.js';

const AGUDAS = 'comp:lec.notas-1pos-agudas', GRAVES = 'comp:lec.notas-1pos-graves';
const bien = id => ({ [id]: [20, 20, 1200] });
const dominar = id => [tanda(bien(id), '2026-11-01'), tanda(bien(id), '2026-11-04'), tanda(bien(id), '2026-11-11')];

test('sin práctica, todos los niveles están a 0', () => {
  const { niveles } = ctxDe();
  for (const n of Object.values(niveles)) assert.equal(n.nivel, 0);
  assert.equal(niveles['fl-acompanamiento'].sinContenido, true);
});

test('un nivel se alcanza con todo su núcleo hecho y el 80 % dominado', () => {
  let { niveles } = ctxDe({ eventos: [...dominar(AGUDAS), ...dominar(GRAVES)], hoy: '2026-11-11' });
  assert.equal(niveles.lectura.nivel, 1);
  ({ niveles } = ctxDe({ eventos: [...dominar(AGUDAS), tanda(bien(GRAVES), '2026-11-01')], hoy: '2026-11-11' }));
  assert.equal(niveles.lectura.nivel, 0); // una dominada y otra solo completada: 50 %
  assert.equal(niveles.lectura.progreso, 0.8);
});

test('una estimación del diagnóstico vale hasta que una comprobación la desmiente', () => {
  const diag = diagnostico('2026-11-01', { niveles: { tecnica: 2 } });
  assert.equal(ctxDe({ eventos: [diag] }).niveles.tecnica.nivel, 2);
  assert.equal(ctxDe({ eventos: [diag] }).niveles.tecnica.estimado, true);
  const fallo = [practica('comp:tec.media-cejilla', '2026-10-20', { calidad: BIEN, pasadas: 3 }),
    practica('comp:tec.media-cejilla', '2026-11-05', { modo: 'comprobacion', calidad: { ...BIEN, limpieza: 'mal' }, pasadas: 2 })];
  assert.equal(ctxDe({ eventos: [diag, ...fallo], hoy: '2026-11-05' }).niveles.tecnica.nivel, 0);
});

test('un área floja no baja la etapa: la marcan la técnica y el repertorio', () => {
  const lagrima = practica('obra:tarrega.lagrima', '2026-11-01', { calidad: BIEN, pasadas: 1 });
  const sor = practica('obra:sor.op60-1', '2026-11-01', { calidad: BIEN, pasadas: 1 });
  const ctx = ctxDe({ eventos: [diagnostico('2026-11-01', { niveles: { tecnica: 2 } }), lagrima, sor] });
  assert.equal(ctx.niveles.repertorio.nivel, 1);
  assert.equal(ctx.niveles.lectura.nivel, 0);
  assert.equal(ctx.resumen.clasica.curso.id, 'curso:c2'); // min(técnica 2, repertorio 1) + 1
  assert.equal(ctx.resumen.clasica.referencia, 2);
});
