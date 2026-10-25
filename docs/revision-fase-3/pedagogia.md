# Revisión pedagógica y musical de la Fase 3

**Fecha:** 25/10/2026 · **Rama:** `revision-fase-2`, commit `216e34d` · **Revisor:** independiente (guitarra clásica, didáctica instrumental y teoría musical), solo lectura.

## Método

- **Lectura completa** del Plan (apartados 2, 3.1-3.8, 4, 6 y 7), de `docs/PLAN-FASE-3.md` y de `INFORME-FASE-2.1.md`.
- **Contenido revisado:** la ruta `contenido/rutas/clasica-c1.json` (tramos 3-5), las 19 competencias nuevas de `contenido/competencias/clasica.json` y `comun.json`, los ejercicios de `contenido/ejercicios/*.json`, las 13 notaciones nuevas de `contenido/notacion/` y `contenido/repertorio/clasica/sanz-espanoleta.json`.
- **Notación, nota a nota.** Un script propio (fuera del repositorio, en el *scratchpad*) pasó cada nota de cuerda y traste a altura real, con cuerda 1 = Mi4, 2 = Si3, 3 = Sol3, 4 = Re3, 5 = La2 y 6 = Mi2. Con eso comprobé:
  - que cada compás suma lo que pide su compás;
  - que las notas son las de la escala o del acorde;
  - que la digitación de cada acorde es la habitual;
  - que la grafía escrita que sale de `prepararNotacion` va una octava por encima de lo que suena.
- **Preguntas.** Generé tandas de cada generador de `logica/preguntas.js` con muchas semillas. Comprobé aparte todas las combinaciones de intervalos (42, ninguna incorrecta), el reparto de respuestas, que ninguna opción salga repetida y cuántas preguntas distintas tiene cada competencia.
- **Evaluación inicial.** Simulé recorridos de `logica/evaluacion.js` con el contexto de las pruebas (`pruebas/ayuda.js`, sin datos reales): distintas hipótesis por área, un módulo terminado antes de tiempo, la evidencia de *Lágrima A* con fallos y el perfil y el punto de partida que salen después.
- **Metrónomo.** Revisé `logica/metronomo.js` y cómo lo usan `web/vistas/ejercicio.js`, `paso.js`, `obra.js` y `evaluaciones.js`, y el ajuste de criterio de `web/componentes/criterio.js`.
- **Pruebas y validador.** `node --test pruebas/*.test.js` da **147 de 147 en verde** y el validador del catálogo, **0 errores**. No arranqué el servidor: la revisión es de contenido y de lógica.
- **Una búsqueda web** sobre la tonalidad y el compás de la *Españoleta* (ver P-3). La uso como indicio, no como dato.

## Estado general: **PASS CON OBSERVACIONES**

**Lo musical está bien.** No hay ningún error en la notación nueva:
- las escalas, los acordes y sus digitaciones son correctos;
- los ligados, el mordente, las dos voces y la hemiolia están bien escritos;
- los compases suman lo que deben.

**Lo teórico, también.** Las preguntas que corrige la app y las descripciones de las competencias son correctas por construcción.

**El contenido incierto está marcado.** La *Españoleta*, el mordente y las obras eje de los tramos 3 y 4 llevan su `porVerificar`.

**Lo que hay que corregir.** Son sobre todo cosas de la **evaluación inicial**:
- en dos casos estima un nivel por encima de lo que se ha probado (P-1 y P-2);
- hay **un texto que da por hecha la tonalidad de la *Españoleta*** (P-3);
- algunas preguntas se pueden acertar sin saber lo que miden (P-8 y P-9).

Conviene corregir P-1, P-2 y P-3 antes de usar la evaluación inicial con sus datos reales.

---

## Hallazgos críticos

**Ninguno.** No he encontrado errores musicales ni teóricos, ni información inventada en sentido estricto. Lo más cercano es P-3: un dato presentado como seguro que no lo es. Lo dejo como importante porque sale de leer el Plan, no de inventar, y se arregla con dos frases.

---

## Hallazgos importantes

### P-1 · La evaluación de técnica salta del nivel 2 al 6 y puede estimar «Técnica 6» con tres pruebas
- **Dónde:** `logica/evaluacion.js`: `siguiente` (línea 98, `niveles.find(x => x > l)`) y `resultadoModulo` (líneas 135-136, `if (!deL.length) continue`).
- **Qué pasa.** En técnica solo hay competencias de los niveles 1 (nueve), 2 (cejilla completa y trémolo lento) y 6 (trémolo a tempo de obra).
  - Si dice «Bastante» y supera las dos del nivel 2, la evaluación le pide el trémolo a tempo de *Recuerdos*.
  - Si se autoevalúa bien en él, el módulo da **Técnica 6, estimado**, y las nueve competencias del nivel 1 quedan «por confirmar».
- **Lo he simulado:**
  - sale `tecnica: { nivel: 6, estimado: true }` y la referencia del programa pasa a 6;
  - *Sonido clásico* y *Mordente* quedan como estimadas;
  - el «Por dónde empezar» se salta todos los pasos de técnica del tramo 1 y empieza en «Tono, semitono y la escala mayor».
- **La contradicción.** `logica/niveles.js` (línea 33) hace lo contrario y se para en el primer nivel sin contenido («no se puede confirmar más»). La prueba existente (`evaluacion.test.js`, línea 125) solo cubre el caso en que el 6 falla.
- **Lo correcto:**
  - subir solo al nivel inmediatamente superior;
  - si ese nivel no tiene contenido, terminar ahí, con el último nivel superado;
  - nunca dar por alcanzado un nivel con niveles intermedios vacíos.
- **(a) Error claro.**

### P-2 · Un nivel se da por alcanzado con que se pruebe una sola de sus competencias
- **Dónde:** `logica/evaluacion.js`, `resultadoModulo`: `deL` son solo las competencias **probadas** del nivel.
- **Qué pasa.** Si en teoría responde una competencia (por ejemplo, *Tono y semitono*), la supera y pulsa «Terminar aquí y guardar», el módulo guarda **Teoría 1, estimado**. Pasa **incluso si su hipótesis era «No lo he trabajado»**.
- **Consecuencias (simulado):**
  - *Inversiones*, *Intervalos con su calidad* y *Armaduras* (contenido que no ha visto nunca) pasan a «estimadas»;
  - la ruta marca sus pasos «porConfirmar» y no los propone para estudiar;
  - el punto de partida dice «Se dan por sabidas y se confirmarán en frío, sin volver a estudiarlas».
- **Por qué es un problema.**
  - Al fallar la primera comprobación en frío se corrige solo, pero a costa de un fallo evitable.
  - Contradice la regla «lo dudoso se marca como pendiente». Una competencia del mismo nivel que no se ha probado no es dudosa: es desconocida.
  - El Plan, apartado 6, solo da por sabido lo que está por debajo de un nivel superado, no lo que está a su lado.
- **Lo correcto:**
  - un nivel cuenta como superado solo si constan o se han probado todas sus competencias, o al menos el 80 %, el mismo margen del apartado 3.4;
  - las no probadas del último nivel quedan pendientes, no estimadas;
  - con la hipótesis 0, nada sin probar debería quedar estimado.
- **(a) Error claro.**

### P-3 · Re mayor y el 6/8 se presentan como propios de la *Españoleta*, que los tiene por verificar
- **Dónde:**
  - `contenido/rutas/clasica-c1.json`, `paso:c1.t5.03`: objetivo «La tonalidad de la polifonía de este tramo.»;
  - `contenido/competencias/clasica.json`, `comp:esc.re-mayor-1pos`: propósito «La tonalidad de la polifonía de la unidad 5 del Plan.»;
  - `paso:c1.t5.04`: «Contar 6/8 en dos y oír la hemiolia de las danzas.».
- **La contradicción.** La propia ficha (`sanz-espanoleta.json`, `porVerificar`) dice que «tonalidad y compás dependen de la edición: no se dan como dato».
  - El Plan (unidad 5) pone Re mayor como **escala de la unidad**, no como tonalidad de la obra.
  - Además, los ejercicios del tramo (apagar voces y mordente) están todos en Re mayor, lo que refuerza la idea de que la obra está en Re.
- **Indicio en contra (para verificar, no es un dato):**
  - IMSLP sitúa la *Españoleta* en el Libro I de la *Instrucción* (1674, f. 15);
  - una transcripción para guitarra moderna que aparece en la búsqueda está en **3/4 y re menor**, y otra en **la menor**.
  - Fuentes: [IMSLP, Espanoleta (Sanz, Gaspar)](https://cn.imslp.org/wiki/Espanoleta_(Sanz,_Gaspar)), [Españoleta Tab (Ultimate Guitar)](https://tabs.ultimate-guitar.com/tab/1099702), [Españoletas (flutetunes)](https://www.flutetunes.com/tunes.php?id=1073).
- **Lo correcto.** Que los textos digan lo que se sabe, por ejemplo: «Re mayor: la escala que el Plan pone en esta unidad. La tonalidad de la *Españoleta* depende de la edición (por verificar)». En cuanto se elija la edición, conviene alinear la escala y los ejercicios del tramo con su tonalidad y su compás.
- **Tipo:** **(a)** error claro en los textos; **(b)** la edición la eligen él y su profesor.

### P-4 · La hemiolia solo se define y se practica en su forma de 6/8
- **Dónde:** `comp:rit.ternario-hemiolia` («la hemiolia es meter tres negras donde había dos negras con puntillo»), `ej:rit.hemiolia` y `notacion/rit-hemiolia.json`.
- **Qué es correcto.** Esa forma (6/8 frente a 3/4 dentro del compás) es una hemiolia y está bien escrita.
- **Qué falta.** En las danzas barrocas en 3/4 (y la *Españoleta* parece estarlo, ver P-3), la hemiolia típica es otra: **dos compases de 3/4 que suenan como uno de 3/2**, casi siempre en las cadencias. El ejercicio actual no la prepara.
- **Lo correcto:**
  - añadir esa forma a la descripción y un ejercicio de cuatro compases en 3/4 con la hemiolia antes de la cadencia;
  - de paso, aprovechar lo que ya sabe: el compás de 12 de la soleá y la bulería alterna grupos de 6/8 y 3/4. Se podría declarar `transfiere` desde `comp:fl.compas-12`, sin convalidar nada.
- **Tipo:** **(a)** la definición está incompleta; **(b)** lo de la transferencia es una opción.

### P-5 · El metrónomo del ejercicio de hemiolia empieza en 4/4, y en 6/8 el tempo se apunta como ♩
- **Dónde:**
  - `web/vistas/ejercicio.js`, línea 51 (`compas: e.compas ?? null`): las fichas de ejercicio no llevan `compas`, que está en el archivo de notación, así que el metrónomo arranca en 4/4;
  - `web/vistas/evaluaciones.js`, línea 229 (`compas: null`);
  - el registro (`web/componentes/registro.js`) rotula el tempo como «♩=».
- **Qué pasa:**
  - el ejercicio dice «Metrónomo en dos por compás (una negra con puntillo por golpe)» y el criterio de la competencia pide «el metrónomo en dos por compás», pero se abre con cuatro negras;
  - si él cambia a 6/8, el motor da dos golpes por compás (bien), pero el número es de **negras con puntillo** y queda guardado como si fueran negras. Un 60 en 6/8 es ♩.=60, es decir, ♩=90.
- **Por qué importa.** El tempo es un dato de progreso, así que la unidad tiene que ser la correcta.
- **Lo correcto:**
  - tomar el compás de la notación del ejercicio (o declararlo en la ficha);
  - en los compases compuestos, rotular y guardar la unidad como «♩.».
- **(a) Error claro.**

### P-6 · El puntillo y las semicorcheas se usan en el tramo 5 sin haberse trabajado
- **Dónde:** `comp:rit.figuras-basicas` («redonda, blanca, negra, corcheas y sus silencios»), que es lo único que pide `comp:rit.ternario-hemiolia`.
- **Qué falta.** La hemiolia se apoya en la **negra con puntillo**. El mordente se escribe en **semicorcheas** (`tec-mordente.json`). Las escalas de Sol y del mordente acaban con figuras con puntillo. Ninguna competencia del curso enseña el puntillo ni las semicorcheas.
- **Qué dice el Plan.** El apartado 3.5 (Ritmo, etapa 1) pide «corcheas y semicorcheas; 2/4, 3/4, 4/4; puntillo; contar en voz alta».
- **Lo correcto.** Una competencia o un paso de ritmo («Puntillo y semicorcheas») en el tramo 3 o el 4, como requisito de la hemiolia.
- **(a) Hueco claro** respecto al Plan.

### P-7 · El Plan se contradice consigo mismo, y el contenido sigue sus unidades y no el apartado 3.5
- **Dónde:** el nivel 1 de varias competencias nuevas.
- **Qué hay.** El apartado 4 (unidades 3-5) pone en la etapa 1 cosas que la tabla 3.5 sitúa en etapas posteriores:

  | Competencia | Tabla 3.5 |
  |---|---|
  | Inversiones (`comp:teo.inversiones`) | Teoría, etapa 2 |
  | Armaduras (`comp:teo.armaduras-0-2`) | Teoría, etapa 2 |
  | Triada disminuida (en `comp:arm.triadas-do-mayor`) | «cuatro triadas», etapa 2 |
  | Cadencias en plural (`comp:arm.cadencias`) | etapa 2; la 1 solo tiene la perfecta |
  | 6/8 (`comp:rit.ternario-hemiolia`) | etapa 2 |
  | Hemiolia (`comp:rit.ternario-hemiolia`) | etapa 3 |
  | Mordente (`comp:tec.mordente`) | etapa 3, «mordente y trino» |
  | Apagar voces (`comp:tec.apagar-voces`) | «apagar bajos», etapa 2 |
  | Re mayor (`comp:esc.re-mayor-1pos`) | no aparece en Escalas, etapa 1 |

- **Lo que ha hecho el contenido.** Sigue el apartado 4 y les da a todas el nivel 1. Solo la hemiolia lo justifica en su criterio.
- **Consecuencia.**
  - Ahora «Teoría 1» exige inversiones y armaduras, y «Técnica 1», el mordente y apagar voces, con el 80 % dominado.
  - La evaluación pregunta todo eso en el nivel 1.
- **No es un error del contenido:** el Plan dice las dos cosas.
- **Lo correcto.** Que el usuario decida entre dos opciones:
  - mantener el nivel 1 y corregir la tabla 3.5;
  - dejar esas competencias en sus tramos, pero con el nivel 2 (o 3), para que no suban el listón del nivel 1.

  En los dos casos, que cada una lo justifique como ya hace la hemiolia.
- **(b) Decisión del usuario.**

### P-8 · La pregunta de intervalos no comprueba la calidad salvo en las terceras
- **Dónde:** `logica/preguntas.js`, `comp:teo.intervalos` (línea 124).
- **Qué pasa.** Los tipos son 2.ª M, 3.ª m, 3.ª M, 4.ª J, 5.ª J, 6.ª M y 8.ª J, todos correctos. Pero las opciones son esas siete, así que para 2.ª, 4.ª, 5.ª, 6.ª y 8.ª basta con **contar las letras**: solo hay una opción con ese número.
- **Lo que no sale nunca:**
  - la 2.ª menor (Mi-Fa, Si-Do), justo la que enseña el tramo 1;
  - la 6.ª menor;
  - las séptimas;
  - el tritono, que es el argumento de por qué resuelve el Si7 (`comp:arm.i-iv-v7-i`).
- **Otro detalle:** «De Do a Do (subiendo)» puede confundirse con el unísono.
- **Lo correcto:**
  - añadir 2.ª m, 6.ª m, 7.ª m y M, y 4.ª aumentada / 5.ª disminuida;
  - dar distractores con el mismo número y otra calidad;
  - escribir «de Do a Do agudo».
- **(a) Error claro** de diseño de la pregunta. La teoría que contiene es correcta.

### P-9 · La pregunta de las triadas de Do mayor da la calidad en el propio enunciado
- **Dónde:** `logica/preguntas.js`, `comp:arm.triadas-do-mayor` (línea 145: `['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']`).
- **Qué pasa.** «¿Qué acorde se forma sobre el grado ii?»: la minúscula ya dice «menor», y «vii°» ya dice «disminuido». Basta con saber la fundamental. Lo que la competencia quiere comprobar («por qué unos son mayores y otros menores») no se pregunta.
- **Lo correcto.** Numerales neutros («sobre el segundo grado» o «II») en el enunciado. Las minúsculas, en la explicación de después.
- **(a) Error claro.**

### P-10 · El ajuste del profesor no tiene prioridad: el del alumno lo sustituye sin aviso
- **Dónde:** `web/componentes/criterio.js`, línea 25 (`[clave]: nuevo`), y `logica/metronomo.js`, `tempoDe` (línea 65).
- **Qué pasa:**
  - solo hay un ajuste por obra o competencia, con `por: 'yo' | 'profesor'`;
  - si el profesor fija un tempo de referencia y después él guarda un ajuste propio, el del profesor desaparece;
  - «Volver al criterio del contenido» también lo borra.
- **La contradicción.** El orden que declara la Fase 3 («encargo > ajuste del profesor > ajuste propio > contenido») no puede darse, y choca con la regla cerrada «el profesor tiene prioridad». Los encargos sí van primero, y está bien.
- **Lo correcto.** Guardar el ajuste del profesor y el propio por separado (manda el del profesor), o al menos avisar antes de sustituir un ajuste del profesor.
- **(a) Error claro** frente a una regla aprobada. La causa viene de la Fase 2, pero ahora la usa el metrónomo.

### P-11 · Los tramos 3 y 4 no tienen obra eje: el ciclo del tramo y la carga quedan cojos
- **Dónde:** `tramo:c1.t3` y `tramo:c1.t4`.
- **Qué pasa.** La decisión está declarada como pendiente y la app lo dice. La señalo por sus efectos:
  - en esos dos tramos no hay paso de aplicación ni de obra, así que el ciclo aprobado (ejercicio → aplicación → obra → necesidades → refuerzo) no existe;
  - si cada tramo dura de 6 a 10 semanas (orientación del apartado 3.1), serían entre 12 y 20 semanas sin repertorio nuevo, solo consolidando *Lágrima* A y B (la obra entera espera al cierre). Para un alumno adulto que estudia por gusto, es mucho.
- **Algo a tener en cuenta al decidir.** Si la obra eje del tramo 3 es «su *Estudio en Mi menor*», que **ya toca**, las reglas la tratan como obra conocida: una pasada de comprobación, no un aprendizaje nuevo. Haría falta otra obra nueva para aplicar el arpegio.
- **Candidatas.** El propio Plan (apartado 4, «Alternativas») trae candidatas que no hay que inventar:
  - para el arpegio, Giuliani, op. 50, Carcassi, op. 59, y Carulli, op. 241;
  - para escalas y ligados, Aguado y Sor, op. 60 (n.º 5 y 7).

  Qué número concreto, de qué edición, lo deciden él y su profesor.
- **(b) Decisión del usuario o de su profesor**, ya declarada.

---

## Hallazgos menores

### P-12 · En el arpegio de Mi–La–Si7–Mi no suena el Re♯
- **Dónde:** `contenido/notacion/arm-mi-la-si7.json`, compás 7.
- **Qué pasa.** El arpegio de Si7 va por las cuerdas 5, 3, 2 y 1 (Si2, La3, Si3, Fa♯4) y salta el Re♯3 de la 4.ª, que es la sensible. Las instrucciones dicen «Fíjate en Si7: el Re♯ sube a Mi y el La baja a Sol♯», y la ficha del ejercicio lo repite. En la mitad en arpegio solo se oye La → Sol♯.
- **Lo que sí está bien.**
  - Los acordes plaqué son correctos: Mi 0-2-2-1-0-0, La x-0-2-2-2-0 y Si7 x-2-1-2-0-2, con los dedos 2, 3 y 4 en los trastes del Si7.
  - Re♯3 → Mi3 por la 4.ª cuerda sí resuelve en los compases 3 y 4.
- **Lo correcto.** Arpegiar Si7 y Mi por las cuerdas 5 (o 6), 4, 3 y 2. Así Re♯3 → Mi3 suena por la 4.ª con la i y La3 → Sol♯3 por la 3.ª con la m: las dos resoluciones, en la misma cuerda y con el mismo dedo.
- **(a) Error claro**, menor.

### P-13 · Textos de tempo que no coinciden con lo que hace el metrónomo
- **Mi–La–Si7–Mi.** `ej:arm.mi-la-si7` declara `tempo.inicial: 60` («a ♩=60»). `tempoDe` solo lee `criterio.tempo.referencia` o `tempo.objetivo`, así que el metrónomo dice «Sin tempo de referencia: empieza donde salga limpio». Sale 60 por casualidad, porque es el valor por defecto.
- **La subida de 4.** Las reglas de los ejercicios dicen «sube 4» (Plan 7, [Consenso]), pero el metrónomo solo tiene botones de ±1 y ±5.
- **Lo correcto.** Que `tempoDe` lea `inicial` o que la ficha use `objetivo`, y que la subida sea de 4 o lo diga el propio texto.
- **(a) Error claro**, menor.

### P-14 · Otros huecos del curso 1 respecto al Plan
- **Escala de Mi menor (natural, armónica y melódica).** La piden el apartado 3.5 (Escalas, etapa 1: «Mi m») y la unidad 2, y es la tonalidad de *Lágrima B*. No existe en el curso. La menor del tramo 3 la sustituye en parte, pero el Re♯ de Mi menor armónica es justo el del Si7 de *Lágrima*.
- **Tono relativo** (unidad 2): falta, y las armaduras de hasta dos alteraciones no tienen sus menores relativas, cuando el curso usa La menor y Mi menor.
- **El cifrado** que acompaña a las inversiones (unidad 3).
- **Afinar y uñas** (Diapasón, etapa 1).
- **Musicalidad, etapa 1** («piano y forte; frase con principio y final»): no tiene competencia propia.

Casi todo esto es de los tramos 1 y 2 (Fase 2), pero el curso 1 se presenta ya como completo.

**(b) Decisión del usuario:** qué se añade y dónde. Mi menor es lo más urgente.

### P-15 · Un fallo general de la pasada cuenta como evidencia contra una competencia concreta
- **Dónde:** `logica/evaluacion.js`, `evidenciaDeObra`.
- **Qué pasa.** Una pasada de *Lágrima A* con las notas mal da evidencia **en contra** de *Melodía por encima del acompañamiento*, porque su criterio incluye «notas correctas», y en el perfil sale como «Posible laguna» (simulado).
- **Qué está bien.** La evidencia se limita a lo que la obra **pide** y a los aspectos que la pasada valora, y lo no observado queda aparte (`sinObservar`): justo lo pedido. Además, aplica el criterio aprobado en D6 (cada aspecto se atribuye a las competencias que lo trabajan).
- **El problema.** En una evaluación, unas notas falsas no muestran un problema de equilibrio de voces.
- **Propuesta.** Para la evidencia, usar solo los aspectos propios de cada competencia (en la melodía acompañada, sonido y dinámica), o marcarla como «dudosa» cuando lo que falla es un aspecto general (notas, ritmo, continuidad).
- **(b) Decisión del usuario**, porque toca una regla aprobada.

### P-16 · La hipótesis de técnica no dice que es la técnica clásica
- **Dónde:** `web/vistas/evaluaciones.js`, `preguntaHipotesis` («¿Cómo ves técnica?» con la descripción general del área).
- **Qué pasa.** Un guitarrista flamenco puede contestar «Bastante» pensando en su técnica flamenca. Con eso empieza en el nivel 2 (cejilla y trémolo, que el flamenco le da) y deja sin probar el núcleo del curso 1: el sonido clásico, la melodía acompañada y apagar voces. Es justo lo que el Plan dice que le falta (apartado 2: «falta el sonido clásico y el equilibrio de voces»).
- **Propuesta:**
  - en el programa clásico, preguntar por la «técnica clásica»;
  - decir qué significa cada opción en contenido («Lo básico: sonido clásico, melodía por encima del acompañamiento…»);
  - o empezar siempre por el núcleo de técnica del curso 1 cuando no consta nada.
- **(b) Decisión del usuario.**

### P-17 · Diferencias de la evaluación con el apartado 6 del Plan, sin declarar
- **Qué falta:**
  - en lectura no se mide el tiempo de respuesta («aciertos y tiempo de respuesta»);
  - el ritmo se autoevalúa, en vez de marcarlo con la barra espaciadora sobre el metrónomo tras calibrar el retraso;
  - el diapasón se pregunta en texto, en un solo sentido (cuerda y traste → nota), y su competencia dice «y al revés»;
  - no hay cuestionario inicial (obras que toca, uñas, objetivos; identificar *El Romancero gitano* y *Nocturnal Smatter*);
  - las transferencias del flamenco a la clásica (`transfiere`) no se usan para empezar más arriba. Hoy no cambia nada, porque todas son del nivel 1.
- **Lo correcto.** Nada de esto está mal, pero `PLAN-FASE-3.md` no lo declara como fuera de alcance. Conviene declararlo o ponerlo en la lista de pendientes.
- **(b) Decisión del usuario.**

### P-18 · Una estimación de área se pierde entera con un solo fallo en frío
- **Dónde:** `logica/niveles.js`, `estimacionesVigentes`.
- **Qué pasa.** Cualquier fallo en frío de una competencia del área de ese nivel o inferior, posterior al diagnóstico, anula toda la estimación. Con nueve competencias de técnica en el nivel 1, es muy frágil. El nivel calculado, en cambio, tolera que un 20 % no esté dominado.
- **Es una regla aprobada** (apartado 3.4). La señalo por cómo se comporta ahora que hay mucho más contenido por nivel. Una opción: que el fallo anule solo esa competencia y abra la reevaluación del área.
- **(b) Decisión del usuario.**

### P-19 · La *Españoleta*: un «dato» con rango y un porqué demasiado seguro
- **Dónde:** `contenido/repertorio/clasica/sanz-espanoleta.json`.
- **El rango.** `nivel.referencias[0]`: «RCM 2018 · nivel "2-3"», con `naturaleza: "dato"`. Un nivel del RCM es un valor concreto de un libro concreto, así que un rango indica que no se ha comprobado.
- **El porqué** (línea 50) afirma «dos voces sencillas en primera posición, adornos y cadencias», mientras la ficha deja por verificar la edición, los adornos y las secciones.
- **Bien resuelto:** el subtítulo (de la *Instrucción*) y «cifra para guitarra barroca de cinco órdenes» son correctos, y la fuente y el año ya están marcados por verificar.
- **Lo correcto:**
  - marcar el RCM como `estimacion` o `porVerificar` («2-3, según el Plan»);
  - en el porqué, «en las ediciones habituales, dos voces sencillas…», o que dependa de la edición.
- **(a) Error claro**, menor.

### P-20 · El nombre «mordente» puede confundir con la terminología del solfeo español
- **Dónde:** `comp:tec.mordente` y `ej:tec.mordente`.
- **Qué está bien.** La mecánica: nota, nota inferior diatónica y vuelta, con ligado descendente y ascendente, en el tiempo. Además, cómo hacerlo en cada estilo está pendiente, como se acordó.
- **Duda de terminología.** En muchos manuales de lenguaje musical en español, «mordente» designa también las notas de adorno breves antes de la nota real (de una, dos o tres notas).
- **Propuesta.** Llamarlo «mordente inferior (barroco)», para que coincida con lo que diga su profesor.
- **(b) Decisión del usuario o de su profesor.**

### P-21 · El oído de 3.ª, 5.ª y 8.ª solo usa terceras mayores
- **Dónde:** `logica/preguntas.js`, `comp:oid.intervalos-3-5-8` (`['3.ª', 4]`).
- **Qué pasa.** Se puede reconocer la tercera por su color mayor y no por su tamaño.
- **Propuesta:**
  - mezclar terceras mayores y menores, las dos con la respuesta «3.ª», que es lo que pide la competencia;
  - más adelante, intervalos descendentes.
- **(a) Error claro**, menor.

### P-22 · Un ejercicio para dos competencias se registra en la que no es
- **Dónde:** `ej:esc.do-mayor-1pos` (trabaja `comp:esc.do-sol-mayor-1pos` y `comp:tec.alternancia-im-ma`), que es el contenido de `paso:c1.t4.01` (alternancia).
- **Qué pasa.** Desde la página del ejercicio, el registro va a la primera competencia no dominada, que es *Do mayor y Sol mayor*. Desde el paso sí va a la alternancia. Según por dónde entre, la alternancia i-m / m-a puede no recibir sus intentos.
- **Propuesta.** Elegir dónde se registra, o un ejercicio propio para m-a.
- **(a) Error claro**, menor.

### P-23 · Apoyar la «a» en el arpegio apaga la 2.ª cuerda
- **Dónde:** `ej:arp.nota-destacada` («La a, más fuerte (apoyando, si puedes)»).
- **Qué pasa.** Al apoyar la a en la 1.ª, el dedo cae sobre la 2.ª y corta la nota de la m.
- **Propuesta.** Una frase en las instrucciones: en este ejercicio no importa, pero en las obras donde la 2.ª tiene que seguir sonando la a destaca tirando, con más peso, como ya dice `comp:tec.melodia-acompanada`.
- **(b) Matiz técnico** para él y su profesor.

---

## Lo que está bien

**Notación, comprobada nota a nota.**

| Ejercicio | Qué tiene | Resultado |
|---|---|---|
| Do mayor | Do3-Do4 | Correcta |
| Sol mayor | Sol2-Sol4, con los dos Fa♯: 4.ª en el traste 4 y 1.ª en el 2 | Correcta |
| Re mayor | Re3-Re4 | Correcta |
| La menor, tres formas | La armónica tiene Sol♯ en la 3.ª, traste 1, también al bajar; la melódica sube con Fa♯ y Sol♯ y baja natural | Correcta |
| Cromática | La2-La3, un dedo por traste | Correcta |
| Mi mayor | Dos octavas | Correcta |
| Do y Sol7 de primera posición, para p-i-m-a y p-a-m-i | Do x-3-2-0-1-0 y Sol7 3-2-0-0-0-1, con los dedos de la digitación habitual | Correctos |
| La menor y Mi mayor del arpegio con nota destacada | Dedos 3 y 1 en La menor; dedo 1 en el Sol♯ de Mi | Correctos |
| Ligados | Desde la cuerda al aire, con cada dedo, en la 1.ª y la 2.ª | Correctos |
| Mordente | Cuatro mordentes con la nota inferior diatónica de Re mayor: Re-Do♯, Fa♯-Mi, La-Sol y Do♯-Si; con el consejo de dejar los dos dedos puestos | Correcto |
| Dos voces | Bajo de blanca y silencio de blanca en 4/4; cadencia final La-Re por movimiento contrario | Correctas |
| Hemiolia | En el tercer compás de 6/8 | Correcta |

Todos los compases suman lo que deben, la escritura queda una octava por encima de lo que suena y la primera posición se respeta (traste ≤ 4).

**Teoría.** Las descripciones de las competencias son correctas:
- intervalos y sus semitonos;
- armaduras de Do, Sol, Re, Fa y Si♭;
- triadas de Do mayor (I, IV y V mayores; ii, iii y vi menores; vii disminuido);
- inversiones;
- cadencias: perfecta y plagal, conclusivas; semicadencia, suspensiva; rota;
- las tres formas de La menor;
- 6/8 en dos y 3/4 en tres.

**Preguntas.** Correctas por construcción:
- lectura: todas las notas naturales de la primera posición, dibujadas solo en el pentagrama, porque la tablatura daría la respuesta;
- diapasón, tono y semitono, grados de la escala mayor, triadas, IV y V7, homónimos, armaduras, inversiones y cadencias;
- oído: mayor y menor, escala mayor y menor natural, y final conclusivo (I-IV-V-I) o suspensivo (I-IV-I-V);
- **cadencia andaluza por arriba:** La menor – Sol – Fa – Mi, con reposo en Mi mayor y el Fa justo antes. Correcta.

Las respuestas están repartidas (2024 frente a 1976 en las de dos opciones) y ninguna opción sale repetida.

**Honestidad.**
- Las obras eje de los tramos 3 y 4 se declaran pendientes en los objetivos, en `porVerificar` y en las pantallas del curso y del paso.
- La *Españoleta* marca la edición, la fuente, la tonalidad y el compás, la duración, las secciones y los adornos.
- El mordente deja el estilo para la edición o el profesor.
- Ningún tempo es obligatorio. Las reglas de tempo llevan su naturaleza (`consenso` o `decision`).

**Reglas cerradas, respetadas:**
- tablatura en todo el contenido nuevo, con la partitura como principal solo donde el objetivo es ver las voces o leer ritmo;
- la lectura no bloquea y Sor sigue siendo solo un recurso de lectura;
- las relaciones van en los dos sentidos: los pasos preparan la *Españoleta*, y la obra dice qué pide y dónde se trabaja;
- el aprendizaje del tramo 5 va en orden: apagar voces → aplicación en la obra → obra entera;
- los requisitos de los pasos son coherentes (el mordente detrás de los ligados, la nota destacada detrás de p-i-m-a y de la melodía acompañada, la hemiolia detrás de las figuras).

**Criterios de dominio.** Son medibles por la autoescucha y concretos: «cada bajo dura dos tiempos y se apaga en el tercero», «los cuatro mordentes del ejercicio», «las dos notas casi igual de fuertes». No hay velocidades inventadas.

**Evaluación inicial.**
- El perfil es por áreas, no un número.
- No pregunta lo que ya consta por su progreso.
- Empieza en su hipótesis y la confianza es prudente: una autoevaluación no llega nunca a «alta». La reevaluación va a 90, 45 o 21 días, o antes si una comprobación en frío desmiente la estimación.
- Las obras conocidas no convalidan: dejan evidencia que se confirma en frío.
- «Mi punto de partida» recomienda sin bloquear nada.

**Metrónomo.**
- La lógica es pura y está probada: de 30 a 240 BPM, el 6/8 en dos y el compás de 12 con sus acentos.
- Respeta la regla de que el tempo informa y no suspende.
- El «mejor limpio» solo cuenta intentos con todos los aspectos bien.

## Decisiones para el usuario

1. **Obras eje de los tramos 3 y 4** (P-11): cuáles, de qué edición y si una obra que ya toca puede ser el eje de un tramo, sabiendo que entonces solo se comprueba.
2. **Edición de la *Españoleta*** (P-3 y P-19). Con ella, la tonalidad y el compás reales; si la escala del tramo 5 sigue siendo Re mayor o pasa a la de la obra; y qué hemiolia necesita (P-4).
3. **Niveles de las competencias que el Plan sitúa en dos sitios** (P-7): mantener el nivel 1 y corregir la tabla 3.5, o subirlas de nivel sin moverlas de tramo.
4. **Qué añadir del Plan que falta en el curso 1** (P-6 y P-14): el puntillo y las semicorcheas, la escala de Mi menor, el tono relativo, el cifrado, afinar y uñas, y la musicalidad de la etapa 1.
5. **Evidencia de las obras conocidas** (P-15): si un fallo general (notas, ritmo) debe contar contra competencias concretas en la evaluación.
6. **La hipótesis de técnica en el programa clásico** (P-16): cómo se pregunta y si el núcleo del curso 1 se prueba siempre.
7. **Lo que falta del apartado 6** (P-17): el tiempo de respuesta en lectura, el ritmo con la barra espaciadora, el mástil dibujado, el cuestionario inicial y las transferencias. Hacerlo o declararlo fuera de alcance.
8. **Fragilidad de la estimación** (P-18): si un fallo en frío anula toda el área o solo esa competencia.
9. **Terminología del mordente** con su profesor (P-20), y el matiz de apoyar o tirar la a en el arpegio (P-23).
10. **El ajuste del profesor** (P-10): guardarlo aparte del propio, que es lo que pide la regla, o avisar antes de sustituirlo.
