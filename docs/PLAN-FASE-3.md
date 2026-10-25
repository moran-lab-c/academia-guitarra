# Plan técnico de la Fase 3

Rama `revision-fase-2`, desde `b919978` (Fase 2.1 cerrada). Fecha: 25/10/2026.

Objetivo: que **contenido → notación → práctica → metrónomo → evaluación → progreso → ruta → obra** funcione como un solo sistema. La arquitectura pedagógica aprobada no cambia: programas, cursos, rutas, tramos, pasos, relaciones ruta ↔ obra, dominio (realizada, aprendida, consolidada, dominada), prioridad del profesor, lectura sin bloqueo, tablatura permanente y planificador.

## Lo que hay al empezar (inspección)

- **Sin dependencias.** Node 22 o superior, módulos ES y pruebas con `node --test`. El servidor sirve `web/`, `logica/` y la notación de `contenido/notacion/`.
- **Notación.**
  - Ya existe el modelo: `contenido/notacion/*.json`, donde cada nota es una cuerda y un traste, y de ahí salen la partitura y la tablatura. Lo comprueba `validarPartitura`.
  - También está la recomendación (`recomendarFormato`, con la prioridad profesor > formato principal > propósito > preferencia > lectura) y el selector `selectorFormato`, que recuerda la elección por obra, ejercicio o sección.
  - **Falta dibujar.** El atril solo dice «Aquí se dibujará…». Hay una sola notación propia, la escala de Mi mayor.
- **Metrónomo.** No existe. El tempo ya es un dato del intento (`ev.tempo`) y del criterio (`criterio.tempo`), y solo cuenta para el dominio si el criterio lo hace obligatorio. El profesor ya puede ajustarlo (`estado.ajustes`).
- **Evaluación.**
  - Existe el evento `diagnostico`: sus `niveles` son estimaciones por área, válidas hasta que una comprobación en frío las desmienta, y sus `pruebas` convalidan cada competencia como primer acierto en frío.
  - Las competencias estimadas se confirman en la cola de comprobaciones.
  - La pantalla «Evaluaciones» solo describe lo que habrá.
- **Contenido.** El curso 1 clásico tiene listos los tramos 1 y 2. Los tramos 3, 4 y 5 están en borrador, sin pasos. Hay 21 competencias, 5 ejercicios y 5 obras.

## Decisiones de arquitectura

1. **Librería de notación: VexFlow 5.0.0** (MIT), que ya proponía la Arquitectura.
   - **Formato:** se usa su compilación de un solo archivo con la fuente Bravura incluida (`vexflow-bravura.js`, 728 KB), así que funciona sin red.
   - **Dónde vive:** copiada en `web/vendor/vexflow/` con su licencia, sin pasar por npm (el proyecto sigue sin dependencias).
   - **Carga:** solo la primera vez que hay que dibujar una notación.
   - **Alcance:** pinta pentagrama y tablatura de guitarra (TabStave, TabNote, ligados H/P, digitaciones y cuerdas).
2. **El dibujo se separa en dos capas.**
   - **`logica/partitura.js` (pura y probada en Node).** Convierte la notación propia en un plan de dibujo neutro:
     - compases y voces;
     - alturas escritas, una octava por encima de lo que suena, como se escribe la guitarra, con la grafía de la armadura;
     - duraciones, puntillos y silencios;
     - posiciones de tablatura;
     - digitación, mano derecha, ligados, ligaduras, articulaciones y dinámicas;
     - tempo y avisos.
   - **`web/componentes/partitura.js`.** Pasa ese plan a VexFlow. No inventa nada: lo que no está en los datos no se dibuja.
3. **Modelo de notación ampliado y compatible.** La notación actual sigue siendo válida. Todos los campos nuevos son opcionales.

   | Campo | Nivel | Qué es |
   |---|---|---|
   | `tempo` | archivo | `{ bpm, figura, naturaleza }` |
   | `parcial` | archivo | `{ transcritos, total, nota }`, cuando no está entera |
   | `pos` | compás | posición o cejilla, como texto |
   | `p` | nota | puntillo |
   | `dedo` | nota | 0-4 (mano izquierda) |
   | `mano` | nota | p, i, m, a (mano derecha) |
   | `lig` | nota | `'h'` / `'p'`: ligado ascendente o descendente hacia la nota siguiente |
   | `tie` | nota | ligadura de prolongación |
   | `art` | nota | staccato, acento o tenuto |
   | `din` | nota | pp, p, mp, mf, f o ff |
4. **Qué vistas necesita cada contenido: `notacion.vistas`** en la ficha del catálogo, `['partitura','tablatura']` por defecto.
   - **Solo tablatura:** un ejercicio técnico en el que el pentagrama no aporta nada.
   - **Solo partitura:** una lectura en la que la tablatura daría la respuesta.

   Así no se fuerza un pentagrama innecesario, y la tablatura sigue disponible en todo lo que la tenga.
5. **Selector Partitura | Tab | Ambas.** Sigue siendo el componente de siempre (`selectorFormato`).
   - **«Ambas»** (pentagrama y tablatura unidos) aparece cuando el contenido tiene las dos.
   - **La elección** se recuerda por obra, ejercicio, sección o fragmento (`estado.formatos`, que admite también `ambas`) y nunca quita una vista que el contenido necesita.
   - **La recomendación** no cambia.
6. **Fragmentos de obra: `fragmentos` en la obra.** Cada uno lleva `id`, `titulo`, `seccion`, `compases [desde, hasta]`, `pide`, `proposito`, `notacion` y `lecturaNecesaria`.
   - **Clave** `obra#id`, en el mismo espacio que las secciones y con ids distintos, así que su dominio se lleva aparte con el mismo código.
   - **No completa** la obra ni la sección.
   - **Notación:** un fragmento puede tener la suya o recortar la de su obra o sección (`compases`).
   - **Validación:** el validador comprueba que los ids no se repiten y que existe la sección a la que pertenece.
7. **Metrónomo.**
   - **`logica/metronomo.js`, pura:**
     - límites de 30 a 240 BPM y cambios de ±1 y ±5;
     - estados parado, sonando y pausado;
     - pulsos y acento según el compás (2/4, 3/4, 4/4, 6/8…);
     - tempo de referencia: encargo del profesor > ajuste del profesor > ajuste propio > contenido > ninguno;
     - progreso del tempo: el que apunta frente a su objetivo.
   - **`web/componentes/metronomo.js`:** motor Web Audio con programación anticipada y una barra compacta que se mantiene viva entre repintados.
   - **Integración:** el tempo del metrónomo rellena el campo «Tempo» del registro.
   - **Regla:** el tempo es una señal de progreso. El dominio solo lo mira si el criterio, o su ajuste, lo hace obligatorio, que es la regla de siempre.
8. **Evaluación inicial modular: `logica/evaluacion.js`.**
   - **Módulos:** uno por área del catálogo (técnica, escalas y arpegios, ritmo, lectura, teoría, armonía, oído, diapasón, interpretación y repertorio). Arpegios, mano derecha, ligados y musicalidad son aspectos dentro de esas áreas; no se crean áreas nuevas.
   - **Pruebas que corrige la app:** generadores deterministas con respuesta correcta por construcción, para las competencias de conocimiento. Las de lectura dibujan la nota con VexFlow; las de oído suenan con Web Audio.
   - **Ejecución:** protocolo autoevaluado con el criterio de la competencia y el metrónomo.
   - **Repertorio conocido:** una pasada con rúbrica. Aporta evidencia a las competencias concretas que pide la obra cuyos aspectos salen bien. Las deja «por confirmar» en frío, no convalidadas.
   - **Adaptativa:** empieza en su hipótesis (cuestionario, estimación o lo ya hecho), sube si supera y baja si falla. Se salta lo que ya está hecho.
   - **Se guarda** como el evento `diagnostico` de siempre, con campos opcionales nuevos: `modulo`, `pruebas[].tipo` y `pruebas[].aspectos`, `evidencias` y `confianza`. Ni el esquema ni la migración cambian.
   - **Perfil por área (calculado):** nivel estimado, confianza, evidencias, fecha y cuándo reevaluar.
   - **«Mi punto de partida»** dice por dónde empezar, las áreas fuertes y débiles y las posibles lagunas. Nunca bloquea nada.
9. **Contenido: los tramos 3-5 del curso 1**, a partir de las unidades 3-5 del Plan (apartado 4) y de la tabla 3.5.
   - **Qué se añade:** competencias nuevas, ejercicios con notación propia que la app puede comprobar por construcción (escalas, arpegios, ligados, mordente) y fragmentos.
   - **Lo dudoso:** lo que no se puede verificar desde aquí (qué edición, qué compases, qué tonalidad exacta) queda marcado `porVerificar` y no se presenta como dato.
   - **Obras eje:**
     - **tramo 3:** según el Plan, es su *Estudio en Mi menor*, una obra suya que no está en el repositorio;
     - **tramo 4:** las obras que cita el Plan no se pueden identificar con seguridad;
     - **tramo 5:** la *Españoleta* de Sanz, con sus datos por verificar.

     Las dos primeras quedan como **decisiones pendientes**, sin improvisar.

## Orden y criterio de avance

| Bloque | Qué | Sale cuando |
|---|---|---|
| 3A | Plan, modelo de notación y `logica/partitura.js` | Pruebas del plan de dibujo en verde |
| 3B | VexFlow, dibujo y selector en obra, sección, fragmento, ejercicio y paso | Comprobado en el navegador, sin errores |
| 3C | Metrónomo e integración con la práctica y el registro | Pruebas de la lógica y del navegador |
| 3D | Evaluación inicial y perfil | Pruebas por área, evidencia, confianza y ausencia de bloqueos |
| 3E | Contenido de los tramos 3-5 | Validador limpio; las pruebas antiguas siguen comprobando lo mismo |
| 3F | Integración, revisión UI, QA y pedagogía, e informe | `INFORME-FASE-3.md` |

## Lo que cambian las pruebas antiguas

Algunas pruebas de la Fase 2.1 comprueban el modo espera y el curso en preparación con los tramos 3-5 en borrador. Esas reglas no cambian. Como esos tramos dejan de ser borrador, esas pruebas pasan a usar un catálogo de prueba con los tramos 3-5 vaciados (`entidadesHastaTramo2`), en vez del contenido real. Lo que comprueban sigue siendo lo mismo.

## Fuera de alcance

Transcripción o reconocimiento de audio y vídeo, OCR musical, IA que escuche, grabación avanzada, móvil, nube, cuentas, pagos, gamificación, contenido masivo sin verificar y rediseño visual.
