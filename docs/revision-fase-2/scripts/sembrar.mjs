// Crea una carpeta de datos de prueba con progreso realista (tramo 1 hecho, un fallo en frío de la media cejilla, un
// encargo del profesor) para revisar la Fase 2 sin tocar los datos reales. Uso: node sembrar.mjs <carpeta>
import fs from 'node:fs';
import path from 'node:path';
import { practica, tanda, BIEN, catalogoReal } from 'file:///C:/Users/david/The%20Cave/08%20-%20Guitarra/Academia/app/pruebas/ayuda.js';
import { estadoInicial } from 'file:///C:/Users/david/The%20Cave/08%20-%20Guitarra/Academia/app/logica/esquema.js';

const dir = process.argv[2];
fs.rmSync(dir, { recursive: true, force: true });
for (const d of ['historial', 'copias', 'adjuntos']) fs.mkdirSync(path.join(dir, d), { recursive: true });

const cat = catalogoReal();
const LAGRIMA = 'obra:tarrega.lagrima';
const hecho = (id, fecha) => (cat.porId.get(id).criterio.tipo === 'conocimiento'
  ? tanda({ [id]: [20, 20, 1200] }, fecha)
  : practica(id, fecha, { calidad: BIEN, pasadas: 3, min: 10 }));
const COMPS_T1 = ['comp:tec.sonido-clasico', 'comp:tec.presion-minima', 'comp:lec.notas-1pos-agudas', 'comp:teo.tono-semitono', 'comp:teo.escala-mayor',
  'comp:teo.triada-mayor-menor', 'comp:esc.mi-mayor-1pos', 'comp:rit.pulso', 'comp:tec.melodia-acompanada', 'comp:arm.i-iv-v7-i', 'comp:oid.mayor-menor'];

const eventos = [
  ...COMPS_T1.map(c => hecho(c, '2026-10-14')),
  practica(LAGRIMA, '2026-10-14', { seccion: 'A', calidad: BIEN, pasadas: 1, ayuda: 'notacion', min: 15 }),
  practica('comp:tec.media-cejilla', '2026-10-20', { calidad: BIEN, pasadas: 3, min: 10 }),
  practica('comp:tec.media-cejilla', '2026-10-24', { modo: 'comprobacion', enFrio: true, calidad: { ...BIEN, limpieza: 'mal' }, pasadas: 2, min: 3 }),
];
const estado = estadoInicial();
estado.tareasProfesor.push({ id: 'encargo-prueba', item: LAGRIMA, texto: 'Parte B, el paso a Mi menor', minutos: 15, hasta: '2026-10-27', programa: 'clasica', estado: 'pendiente', creada: '2026-10-21T18:30:00.000Z' });

fs.writeFileSync(path.join(dir, 'estado.json'), JSON.stringify({ rev: 1, estado }, null, 1));
fs.writeFileSync(path.join(dir, 'historial', '2026-10.jsonl'), eventos.map(e => JSON.stringify(e)).join('\n') + '\n');
console.log(`${dir}: ${eventos.length} eventos`);
