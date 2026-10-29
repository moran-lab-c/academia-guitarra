# Informe de la Fase 3: infraestructura musical real y evaluación inicial

Rama `revision-fase-2`, sin fusionar en `main`. Empieza en `b919978` (Fase 2.1 cerrada). Fecha: 29/10/2026.

**Lo que se ha hecho.** La Fase 3 completa (3A a 3F):
- notación real (partitura, tablatura y las dos juntas);
- metrónomo integrado en la práctica;
- evaluación inicial modular con perfil por áreas;
- primer paquete de contenido controlado: los tramos 3 a 5 del curso 1 clásico;
- dos revisiones independientes terminadas (QA y pedagogía) y la corrección de todos sus fallos claros. La de interfaz no llegó a terminarse (ver O).

**Lo que no se ha hecho.**
- No he empezado ninguna fase posterior.
- No he reabierto la Fase 2.1.
- No he cambiado la arquitectura pedagógica aprobada ni las prioridades del planificador. La única excepción es un tope numérico que contradecía una regla ya aprobada (ver C y L).

**Sus datos.** Sus datos reales no están en el repositorio y no los he tocado. Todo se ha probado con carpetas temporales (`ACADEMIA_DATOS`) y puertos de prueba (`ACADEMIA_PUERTO`).

**Sobre la estructura de este informe.** Su mensaje de la Fase 3 pedía los apartados A a Q. La lista literal no me llegó entera a esta parte de la sesión (solo un resumen), así que la he reconstruido con lo que pedía cubrir. Si quiere otro orden o algún apartado que falte, lo rehago.

---

## A. Resumen y veredicto

**Veredicto propuesto: APROBADA CON OBSERVACIONES.**

| Bloque | Estado |
|---|---|
| Notación (3A, 3B) | Hecho. VexFlow 5.0.0 sin dependencias; 16 notaciones propias, todas comprobadas nota a nota |
| Selector Partitura · Tab · Ambas | Hecho. En ejercicio, paso, competencia, obra, sección, fragmento y «Hoy»; recuerda la elección |
| Metrónomo (3C) | Hecho. Integrado con el registro, el profesor y el progreso; el tempo informa y no decide el dominio |
| Evaluación inicial (3D) | Hecha. Modular, por áreas, adaptativa, con confianza y fecha de reevaluación; nada bloquea |
| Contenido (3E) | Tramos 3-5 del curso 1: 20 competencias, 14 ejercicios, 15 notaciones nuevas y la *Españoleta*; lo dudoso, por verificar |
| Integración y revisión (3F) | 157 pruebas en verde (también con la hora de Madrid); revisiones independientes de QA y pedagogía, con todos sus fallos claros corregidos; la de interfaz, sin terminar |

**Por qué «con observaciones» y no «aprobada»:**
- **Decisiones suyas pendientes** (apartado Q): las obras eje de los tramos 3 y 4, la edición de la *Españoleta* y una decena de reglas que las revisiones marcan como discutibles. Ninguna bloquea el uso de la app, pero cambian el contenido o la evaluación.
- **La revisión independiente de la interfaz no se ha hecho.** El revisor se paró dos veces por límites de uso y no llegó a escribir su informe. Por decisión suya, el informe se cierra sin ella (ver O).

---

## B. Estado de partida e inspección

Al empezar (commit `b919978`):
- **Notación:** el modelo existía (cada nota es una cuerda y un traste) y había una sola notación, la escala de Mi mayor. No se dibujaba nada: el atril decía «Aquí se dibujará…».
- **Metrónomo:** no existía. El tempo ya era un dato del intento y del criterio, y solo contaba para el dominio si era obligatorio.
- **Evaluación:** existía el evento `diagnostico` (niveles estimados por área y pruebas que convalidan). La pantalla «Evaluaciones» solo describía lo que habría.
- **Contenido:** 101 entidades. El curso 1 clásico tenía los tramos 1 y 2 completos y los tramos 3-5 en borrador, sin pasos (21 pasos). Había 29 competencias, 4 ejercicios, 5 obras y 1 notación.

El plan técnico, con lo que encontré y cómo lo resolví, está en `docs/PLAN-FASE-3.md`.

---

## C. Decisiones de arquitectura

Ninguna cambia la arquitectura aprobada. Todas están en `docs/PLAN-FASE-3.md` y en `docs/Arquitectura de la academia.md`.

1. **VexFlow 5.0.0** (MIT), la librería que ya proponía la Arquitectura.
   - Copiada en `web/vendor/vexflow/` con su licencia, sin npm: el proyecto sigue sin dependencias.
   - Es la compilación con la fuente incluida, así que funciona sin red.
   - Se carga la primera vez que hay que dibujar.
2. **Dos capas para el dibujo.**
   - `logica/partitura.js` es pura y se prueba en Node. Calcula alturas escritas, alteraciones, compases y reparto en líneas.
   - `web/componentes/partitura.js` solo pasa ese plan a VexFlow.
   - Lo musical se prueba sin navegador, y los datos no dependen de la librería.
3. **El modelo de notación se amplía sin romper nada.** Todos los campos nuevos son opcionales: tempo, parcial, posición, puntillo, digitación, mano derecha, ligado, ligadura, articulación y dinámica.
4. **`notacion.vistas` en la ficha** dice qué vistas tiene cada contenido. Por ejemplo, la lectura va sin tablatura porque daría la respuesta.
5. **Fragmentos de obra** (`obra#id`): llevan su propio dominio y no completan la obra.
6. **Metrónomo en dos capas.** `logica/metronomo.js` es la lógica, y el motor de Web Audio va con programación anticipada.
7. **La evaluación inicial reutiliza el evento `diagnostico`** con campos opcionales nuevos. **No cambia el esquema ni hace falta migración.**
8. **Un tope numérico del planificador, de 3,4 a 3,65** (ver L). No cambia ninguna prioridad: hace que se cumpla la regla aprobada en la Fase 2.1.

No ha hecho falta ninguna decisión arquitectónica importante que tuviera que parar para consultarle.

---

## D. Notación

- **Cómo se escribe.** Cada nota es una cuerda y un traste. De ahí salen:
  - la partitura, escrita una octava por encima de lo que suena, como se escribe la guitarra;
  - la tablatura;
  - las dos juntas («Ambas»).
- **Grafía.** Sigue la armadura: Re♯ en Mi mayor, nunca Mi♭. En las menores, el 6.º y el 7.º elevados van sobre su letra (Do♯ en Re menor, Si becuadro en Do menor). Lo demás cromático va con sostenidos o bemoles según la armadura.
- **Alteraciones.** Se escriben en orden de tiempo, mirando las dos voces, con becuadro cuando hace falta. La nota a la que llega una ligadura sobre la barra no repite la alteración.
- **Lo que se dibuja:** dos voces con sus plicas, vigas por pulsos (de tres corcheas en 6/8), digitación, mano derecha, ligados (H y P) y ligaduras, articulaciones, dinámicas, posición y cejilla.
- **Nada se inventa.**
  - Una notación con errores no se dibuja: se muestra la lista de errores.
  - Un fragmento que no está transcrito lo dice.
  - Una obra con partitura solo fuera de la app dice dónde está y no promete la tablatura.
- **El validador** comprueba:
  - que cada voz llene su compás;
  - que los ligados vayan en la misma cuerda y en su dirección;
  - que las ligaduras unan notas iguales;
  - que «parcial» cuadre con lo escrito;
  - que la anacrusa no pase del compás.

  No se rompe con datos nulos.
- **Reparto en líneas** según el ancho, sin pasarse nunca. La primera línea lleva el compás.
- **Las 16 notaciones propias** están comprobadas nota a nota con un cálculo aparte:
  - escalas: Do, Sol, Re, Mi, La menor en sus tres formas y la cromática;
  - arpegios: p-i-m-a, p-a-m-i y nota destacada;
  - Mi–La–Si7–Mi;
  - técnica: ligados, mordente y apagar voces;
  - ritmo: la hemiolia en 6/8 y en 3/4, y el puntillo con las semicorcheas.

---

## E. Selector y vínculos

- **El selector «Partitura | Tab | Ambas»** está en:
  - el ejercicio;
  - el paso (su material);
  - la competencia;
  - la obra, la sección y el fragmento;
  - «Hoy».
- **«Ambas»** aparece solo cuando el contenido tiene las dos vistas.
- **La elección se recuerda** por cada cosa y nunca quita una vista que el contenido necesita.
- **La tablatura es permanente.** La partitura es la recomendada cuando el objetivo es leer: ritmo, dos voces y lectura.
- **Mandan, por este orden:**
  1. un encargo del profesor con formato;
  2. su elección;
  3. el formato principal del contenido;
  4. su preferencia general.
- **Vínculos.**
  - El ejercicio dice para qué paso de la ruta es y qué obra prepara.
  - El paso dice su material, en qué se apoya y para qué sirve.
  - La obra dice lo que pide y dónde se trabaja cada cosa.

  Las relaciones van en los dos sentidos.

---

## F. Metrónomo

- **Lo básico:**
  - de 30 a 240 BPM, con ±1 y un paso grande;
  - parado, sonando y pausado (la pausa sigue en el mismo pulso);
  - compases simples y compuestos (6/8, 9/8 y 12/8 en negras con puntillo);
  - acentos del contenido, como el compás de 12 de la soleá;
  - una sola barra para toda la app, que sigue sonando al cambiar de pantalla y avisa si suena para otra cosa.
- **Lo toma del contenido:**
  - **el compás:** el de la sección, el del ejercicio o el de la obra. Una notación propia sin compás dicho va en 4/4. Si no se sabe (la *Españoleta*), no se inventa: lo dice y deja elegirlo;
  - **la unidad:** ♩. en los compases compuestos. En 6/8, 60 es ♩.=60, y así se apunta;
  - **el tempo inicial;**
  - **la subida de su regla** («sube 4»), que pasa a ser el paso grande.
- **El tempo de referencia**, por este orden: el encargo del profesor, el ajuste del profesor, el ajuste propio y el contenido. Sin ninguno, la regla del ejercicio («el tempo más alto al que salga limpio»).
- **El tempo es progreso, no nota.**
  - El tempo usado pasa al campo «Tempo» del registro.
  - Se ve el último, el mejor limpio y el porcentaje del objetivo.
  - Solo cuenta para el dominio si el criterio, o su ajuste, lo hace obligatorio. Un tempo que no es un número no se guarda ni supera un tempo obligatorio.
- **Tras un parón del navegador** (una pestaña en segundo plano), se retoma desde ese momento, sin pulsos tardíos ni pegados.

---

## G. Evaluación inicial

**Pantalla:** «Mi punto de partida» (`#/evaluaciones`), enlazada desde Progreso y Ajustes.

- **Un módulo por área.** Se hace por separado, cuando quiera, y se puede repetir.
- **Cómo se prueba:**
  - **app:** preguntas que corrige la app, en lectura (la nota dibujada en el pentagrama), diapasón, teoría, armonía y oído (con sonido);
  - **autoevaluada:** la ejecución en frío, con el criterio de la competencia, valorando cada aspecto, con el metrónomo al lado;
  - **repertorio:** una pasada de las obras que ya sabía tocar.
- **Adaptativa.**
  - Empieza en su hipótesis («No lo he trabajado», «Lo básico», «Bastante» o «Mucho»), en la estimación vigente o en lo que ya consta.
  - Sube si supera y baja si falla.
  - No vuelve a preguntar lo que su progreso ya prueba.
- **Niveles:**
  - cuentan seguidos desde el 1 y se paran en el primero sin contenido, como en el resto de la app;
  - un nivel se supera solo con todas sus competencias probadas y bien;
  - uno sin probar nada, por debajo de uno superado, se da por sabido y queda por confirmar en frío;
  - uno probado a medias corta.
- **Confianza:** alta, media o baja, según cómo se ha probado y cuánto cubre. Con ella, la fecha de reevaluación: a los 90, 45 o 21 días, o antes si una comprobación en frío la desmiente.
- **Lo superado** cuenta como primer acierto en frío y se confirma después, como siempre. Lo fallado no queda «en curso».
- **El perfil es por áreas, nunca un número.** Cada área dice:
  - su nivel;
  - de dónde sale: la evaluación, su progreso o las obras que ya sabía;
  - la confianza y las evidencias;
  - la fecha y cuándo reevaluar;
  - las posibles lagunas y lo que queda por confirmar.

---

## H. Evidencia del repertorio y punto de partida

- **Una obra que ya sabía tocar** se comprueba con una pasada en frío y su rúbrica, sin aprenderla de cero.
  - Deja evidencia solo en las competencias que esa obra (o esa sección) pide.
  - Solo cuenta en los aspectos que la pasada valora; lo que no deja ver queda «sin observar».
  - **No convalida:**
    - la evidencia favorable deja la competencia «por confirmar»;
    - la evidencia en contra la marca como posible laguna.
- **«Hoy»** lo trata como lo estimado: «*Adelita* ya lo apunta: confírmalo».
- **Si una obra conocida falla en frío,** pide sus refuerzos y, cuando vuelve a salir, el refuerzo desaparece y la obra no se reinicia. Hay una prueba de integración que lo comprueba.
- **«Mi punto de partida»** dice:
  - por dónde empezar en la ruta (el paso actual);
  - las áreas fuertes y las que van por detrás;
  - las posibles lagunas;
  - lo que queda por confirmar y lo que falta por evaluar.

  Siempre como recomendación: todos los pasos siguen abiertos.

---

## I. Contenido

**Los tramos 3 a 5 del curso 1 clásico**, de las unidades 3 a 5 del Plan. El curso pasa de 21 a 44 pasos.

| Tramo | Qué trabaja | Obra eje |
|---|---|---|
| 3 · Arpegios y armonía | p-i-m-a y p-a-m-i, la nota destacada, La menor en tres formas, Mi–La–Si7–Mi, inversiones, mayor o menor de oído | **Pendiente de su decisión** |
| 4 · Escalas y ligados | i-m y m-a, Do y Sol mayor, la cromática, ligados, intervalos y armaduras, las triadas de Do, **puntillo y semicorcheas** | **Pendiente de su decisión** |
| 5 · Polifonía antigua | Apagar voces, mordente, Re mayor, 6/8, 3/4 y la hemiolia, las cadencias, la aplicación en la obra y la obra entera | *Españoleta* de Sanz |

**Lo que se añade:**
- **20 competencias**, cada una con su propósito, lo que requiere, su criterio y su justificación.
- **14 ejercicios.**
- **15 notaciones propias.**
- **1 obra.**

En total, el catálogo pasa de 101 a 159 entidades. El validador da 0 errores.

**Calidad antes que cantidad:**
- Todas las notas están calculadas aparte y comprobadas.
- Ningún tempo es obligatorio.
- Cada regla dice su naturaleza (consenso o decisión).
- Lo dudoso va como `porVerificar`, no como dato:
  - la edición, la fuente, la tonalidad y el compás, la duración, las secciones, los adornos y el nivel RCM de la *Españoleta*;
  - el estilo del mordente;
  - las obras eje de los tramos 3 y 4.
- **No hay fragmentos de obras reales:** sus compases no se pueden comprobar desde aquí. El modelo está hecho y probado.

**Añadido tras la revisión pedagógica:**
- la hemiolia en su forma de 3/4 (dos compases que suenan como uno de 3/2, antes de la cadencia), con su ejercicio;
- «Puntillo y semicorcheas», que la hemiolia y el mordente usaban sin haberse trabajado.

---

## J. Pendiente de verificar y decisiones pendientes

**Por verificar** (en los datos y visible en la app):
- **La *Españoleta*:** la edición, la fuente, la tonalidad y el compás, la duración y las secciones, lo que desarrolla y el nivel RCM («2-3» es el rango del Plan).
- **El mordente:** cómo se hace en cada estilo, según la edición o su profesor.
- **Las obras eje de los tramos 3 y 4.**

**Decisiones suyas**, con el detalle en las revisiones (`docs/revision-fase-3/`):

1. **Obras eje de los tramos 3 y 4** (P-11). Sin ellas, esos tramos no tienen el ciclo ejercicio → aplicación → obra. Ojo: si la del tramo 3 es su *Estudio en Mi menor*, que ya toca, las reglas lo tratan como obra conocida, que solo se comprueba.
2. **Edición de la *Españoleta*** (P-3, P-19). De ella dependen la tonalidad, el compás, la escala del tramo y qué hemiolia necesita.
3. **Niveles de las competencias que el Plan sitúa en dos sitios** (P-7):
   - mantener el nivel 1 y corregir la tabla 3.5;
   - o subirlas de nivel sin moverlas de tramo.
4. **Qué añadir del Plan que falta en el curso 1** (P-14): la escala de Mi menor (la más urgente: es la de *Lágrima B*), el tono relativo, el cifrado, afinar y uñas, y la musicalidad de la etapa 1.
5. **Evidencia de las obras conocidas:**
   - si un fallo general (notas, ritmo) debe contar contra competencias concretas (P-15);
   - si una evidencia en contra se conserva cuando otra obra da después evidencia favorable (Q-3). Hoy manda la última.
6. **La hipótesis de técnica en el programa clásico** (P-16): preguntar por la «técnica clásica», o probar siempre el núcleo del curso 1.
7. **Lo que falta del apartado 6 del Plan** (P-17): el tiempo de respuesta en lectura, el ritmo con la barra espaciadora, el mástil dibujado, el cuestionario inicial y las transferencias. Hacerlo o declararlo fuera de alcance.
8. **Fragilidad de la estimación** (P-18): si un fallo en frío anula toda el área o solo esa competencia.
9. **El ajuste del profesor** (P-10). Hoy se pide confirmación antes de sustituirlo. La otra opción es guardar aparte el suyo y el del profesor, que manda.
10. **Detalles de la evaluación:**
    - el orden dentro de un nivel (hoy, alfabético) y si cortar antes (Q-12);
    - la lectura de pentagrama en el flamenco, que hoy sale «por detrás» (Q-16);
    - más preguntas distintas en cadencias y en la cadencia andaluza (Q-18);
    - si las tandas de práctica de las competencias de conocimiento usan también las preguntas de la app (Q-17).
11. **Detalles de pantalla:**
    - el metrónomo en los pasos de teoría (Q-20);
    - el nombre «mordente» con su profesor (P-20);
    - apoyar o tirar la «a» del arpegio (P-23). He puesto «tirando» en el ejercicio; él y su profesor lo confirman.
12. **El orden en el tramo 4.** El paso nuevo se llama `paso:c1.t4.08` y va antes del cierre (`t4.07`). No he renumerado el cierre para no cambiar un id que ya pudiera estar en su historial.

---

## K. Modelo de datos y migraciones

- **El esquema sigue en 2. No hay migración.**
- **Evento `diagnostico`:** campos nuevos, todos opcionales:
  - `modulo`, `confianza` e `hipotesis`;
  - en `pruebas[]`: `tipo`, `aciertos`, `preguntas`, `calidad`, `pasadas` y `tempo`;
  - `evidencias[]`, cada una con `item`, `fuente`, `resultado` (favorable, dudosa o en contra), `aspectos` y `sinObservar`.

  Un diagnóstico antiguo sigue siendo válido y sale con la confianza más prudente.
- **Validación nueva:**
  - el tempo de una práctica, un número de 0 a 400;
  - aciertos y preguntas, juntos y coherentes;
  - cada evidencia dice de qué obra sale.
- **Estado:**
  - `formatos` admite `ambas`;
  - los encargos admiten `tempo` y `formato`.
- **Catálogo:** campos opcionales nuevos:
  - en notaciones y ejercicios: `notacion.vistas`, `compas` y `tempo.inicial` / `tempo.subida`;
  - en las obras: `fragmentos`, `porQue` y `porVerificar`;
  - en las fichas de ejercicio: `nota`.
- **Comprobado (revisión QA):**
  - una exportación de esquema 2 hecha con la Fase 2 se importa;
  - una de esquema 1 se migra;
  - en las dos, exportar → importar → exportar da exactamente lo mismo.

---

## L. Correcciones fuera de lo previsto

- **Dominio:** una prueba del diagnóstico solo cuenta si salió bien. Antes, una prueba fallada dejaba la competencia «en curso» sin haberla practicado.
- **Ruta:** `estimada` también es verdad cuando una obra conocida deja evidencia favorable (por confirmar, nunca convalidada).
- **Planificador:** el tope de la cobertura pasa de 3,4 a 3,65.
  - **Por qué:** la regla aprobada en la Fase 2.1 dice que la cobertura nunca adelanta al repertorio activo, que va a 3,6.
  - **Por qué no se veía antes:** mientras todos los tramos tenían obra eje, no se notaba. Salió al dejar los tramos 3 y 4 sin ella (dos días sin repertorio con 30 minutos).
- **Pruebas antiguas:** las que comprueban la ruta en espera usan un catálogo con los tramos 3-5 vacíos (`entidadesHastaTramo2`). Lo que comprueban no cambia.
- **Un tropiezo de mi parte:** en un commit se me coló la carpeta de trabajo temporal del revisor de interfaz como un enlace vacío. La saqué en el commit siguiente (`f966715`); no llegó a tener contenido.

---

## M. Pruebas

- **157 pruebas, todas en verde.** Con `npm test`, con `TZ=Europe/Madrid` y con `TZ=UTC`. Al empezar la fase había 116.
- **Nuevas de la Fase 3:**
  - notación: 12;
  - metrónomo: 7;
  - evaluación: 10;
  - contenido: 8;
  - integración entre bloques: 4.
- **Las de integración** recorren:
  - evaluación → perfil → ruta → «Hoy»;
  - notación → ejercicio y obra;
  - metrónomo → progreso (sin decidir el dominio);
  - necesidad → refuerzo → vuelta a la obra.
- **Mutantes (revisión QA):** se detectaban 22 de 28 reglas rotas a propósito. Para las 6 que no, ya hay pruebas:
  - la confianza de un diagnóstico antiguo;
  - las respuestas de armonía, homónimo y cadencia andaluza;
  - que el reparto en líneas corte de verdad;
  - el orden de las evidencias.
- **Validador del catálogo:** 0 errores, con 159 entidades.

---

## N. Comprobación visual

En Chromium, con servidor y datos temporales:
- **Notación:**
  - los 16 ejercicios con notación propia en «Partitura», «Tab» y «Ambas»;
  - la ligadura sobre la barra de la hemiolia en 3/4;
  - las semicorcheas agrupadas por pulso;
  - las resoluciones del Si7 en la 4.ª y la 3.ª.
- **Metrónomo:**
  - la hemiolia en 6/8 arranca en 6/8 con dos pulsos y «BPM (♩.)», y la de 3/4, en 3/4 con tres;
  - el ejercicio con «sube 4» tiene ±4;
  - Mi–La–Si7 arranca en 60.
- **Registro:** en un paso o un ejercicio con dos competencias, se elige en cuál se apunta, y el metrónomo va con ella.
- **Evaluación:** técnica con «Mucho» pregunta el nivel 2, termina ahí sin saltar al 6 y guarda «nivel 2, confianza baja».
- **Otras pantallas:** el mapa de la ruta con 44 pasos, el perfil y el punto de partida.
- **Errores de consola:** ninguno en todo lo recorrido.

---

## O. Revisión independiente

Se encargaron tres revisiones independientes, sin acceso a modificar el código. Dos están terminadas y sus informes completos están en `docs/revision-fase-3/`.

| Revisión | Estado | Hallazgos | Corregidos ya |
|---|---|---|---|
| Pedagogía y música (`pedagogia.md`) | PASS CON OBSERVACIONES | 0 críticos, 11 importantes, 12 menores | Todos los claros (a): P-1, P-2, P-3, P-4, P-5, P-6, P-8, P-9, P-10 (con confirmación), P-12, P-13, P-19, P-21, P-22 y, como matiz, P-23. Lo que es decisión suya, en J |
| QA (`qa.md`) | PASS CON OBSERVACIONES | 0 críticos, 4 importantes, 16 menores | Todos los claros (a): Q-1, Q-2, Q-4 a Q-11, Q-13, Q-15, Q-19, el comentario de Q-17, los enarmónicos de Q-18 y la elección de competencia de Q-20. Lo que es decisión suya, en J |
| Interfaz | **No terminada** | — | — |

**La revisión de interfaz, sin terminar.**
- El revisor se paró por el límite de uso semanal y, al reanudarlo, por el de 5 horas. Dejó scripts y capturas, pero ningún hallazgo escrito.
- Por decisión suya, la fase se cierra sin ella. No la sustituyo por una mía: no sería independiente.
- Lo que hay de la interfaz es mi propia comprobación visual (apartado N) y lo que QA probó con Playwright, citado en su informe:
  - los 14 ejercicios de entonces se dibujan sin errores;
  - «Ambas» se recuerda;
  - a 390 px no hay desplazamiento horizontal;
  - el tempo pasa al registro;
  - el aviso de «está sonando para otro ejercicio».
- Queda pendiente para cuando usted quiera.

**Lo que dicen las dos que está bien:**
- **Pedagogía y QA:** ningún error musical ni teórico en la notación ni en las preguntas.
  - QA comprobó 2.600 preguntas contra tablas escritas a mano, con 0 errores.
  - Pedagogía comprobó la notación nota a nota.
- **Nada se pierde ni se bloquea.**
- **Lo dudoso está marcado.**
- **Las reglas cerradas se respetan:**
  - tablatura permanente;
  - lectura sin bloqueo;
  - Sor solo como recurso de lectura;
  - el profesor manda;
  - el tempo como progreso;
  - perfil por áreas;
  - obras conocidas que no se reaprenden.

---

## P. Fuera de alcance y limitaciones

- **Fuera de alcance, como estaba previsto:** móvil, nube, cuentas, transcripción, IA que escuche, grabación avanzada, tienda, red social, gamificación, pagos, contenido masivo sin verificar y rediseño.
- **Limitaciones conocidas:**
  - **El ritmo se autoevalúa:** no se marca con la barra espaciadora.
  - **La lectura no mide el tiempo de respuesta.**
  - **El diapasón se pregunta en un solo sentido** (de cuerda y traste a nota). Las tres primeras van en J, punto 7.
  - **El metrónomo en segundo plano:** la recuperación tras un parón no se puede probar en un navegador sin pantalla. Está hecha y razonada, pero no medida.
  - **Las preguntas de la app solo se usan en la evaluación.** En la práctica diaria, las competencias de conocimiento siguen apuntando aciertos y preguntas a mano.
  - **Sin fragmentos de obras reales**, hasta tener las ediciones.

---

## Q. Veredicto y lo que necesita su aprobación

**Veredicto propuesto: APROBADA CON OBSERVACIONES.** El sistema contenido → notación → práctica → metrónomo → evaluación → progreso → ruta → obra funciona como uno solo, con las reglas aprobadas y sin bloquear nada.

**Necesita su decisión** (detalle en J):
1. Las obras eje de los tramos 3 y 4.
2. La edición de la *Españoleta*.
3. El nivel de las competencias que el Plan pone en dos sitios.
4. Qué añadir del Plan que falta en el curso 1, empezando por la escala de Mi menor.
5. Las reglas de evidencia de las obras conocidas.
6. La hipótesis de técnica en el programa clásico.
7. Lo que falta del apartado 6 (hacerlo o declararlo fuera).
8. La fragilidad de la estimación ante un fallo en frío.
9. Si el ajuste del profesor se guarda aparte del suyo.
10. Los detalles de la evaluación y de pantalla.
11. Si se hace más adelante la revisión independiente de la interfaz, que quedó sin terminar.

**Lo que no he hecho:** empezar la fase siguiente ni fusionar en `main`.
