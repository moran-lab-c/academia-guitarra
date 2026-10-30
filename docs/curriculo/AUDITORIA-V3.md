---
status: active
project: personal
type: reference
created: 2026-10-30
---
# Auditoría de la versión 3 (antes de corregir)

Informe de la auditoría que pidió el 30/10/2026, escrito **antes de cambiar nada** (commit `3960792`). Las correcciones dan lugar a la versión 3.1. Anexo de [[CURRICULO-MAESTRO]].

**Cómo se ha hecho:**
- Los cursos se han auditado sobre su texto completo, tal como se escribió y se parcheó en esta misma sesión; el repositorio estaba limpio, sin cambios posteriores.
- Por scripts se ha contrastado lo mecánico: ejercicios definidos y usados, lecciones de un solo paso, referencias, números y etiquetas.
- Contra las fuentes guardadas se han comprobado el ABRSM de 2019, el RCM de 2024, el BOE, La Rioja entera, la lista RCM de Da Capo y Mater Salvatoris. Las dos últimas se han vuelto a descargar.

---

## Lo más importante
**La arquitectura es correcta, pero el contenido no era tan bueno como decían las tablas.** Tres causas:

1. **Mi prueba por tercios creó relleno.** Para que cada técnica apareciera al principio, a la mitad y al final, añadí en esta misma sesión pasos y etiquetas sin función (apartado F). La tabla quedaba perfecta y la pedagogía no mejoraba: justo lo que usted teme.
2. **Hubo datos mal leídos que escribí como si fueran seguros** (apartado C).
3. **Las matrices prometían cosas que ningún paso enseña** (apartado H). Una etiqueta o una celda no demostraban nada.

---

## A. Correcto: no se toca
- Programa → Nivel → Tramo → Lección → Paso; los tramos con su música; los pasos sin plantilla.
- Ningún nivel es temático en la práctica. Todos desarrollan muchas áreas a la vez, también sin contar lo etiquetado de relleno.
- El nivel 1 resuelve bien la asimetría: la técnica va por tablatura mientras la lectura sube por dosis (dos cuerdas → tres y bajos → armadura → sostenidos → primera vista → primera obra leída), y lo ya sabido se comprueba con ◇. No es un curso de principiantes ni un 4.º de Elementales disfrazado.
- *Lágrima* se aprende por partes (A, B, A-B-A, memoria), con función técnica, armónica y de oído.
- La escalera de oído en los niveles 1-5 y 7, y las cadencias y voces del ABRSM: comprobadas.
- **Todos los niveles RCM de las obras** coinciden con la lista de Da Capo.
- La colocación según La Rioja: comprobada en todas las obras que la citan.
- Las cadenas que atraviesan los niveles: el cambio de modo, la romanesca, la folía, Händel y Barrios.
- La experiencia de usuario: «Continuar», sin «Hoy», sin sesiones, y la tablatura permanente con el selector.
- El trémolo que progresa de nivel en nivel, las cuatro voces y los ligados: la repetición con progresión se queda.

## B. Errores documentales
| # | Dónde | Problema |
|---|---|---|
| B1 | Toda la carpeta vigente | **No queda ninguna referencia a `progresion.md` ni a `[[progresion]]`.** Las coincidencias de grep son la palabra «progresiones». En el código y en `docs/Plan`, también es otra palabra. Solo sigue en `v2/` y en notas diarias: es historia y se queda |
| B2 | `curso-2` a `curso-5` | Sus apartados «Ejercicios importantes» hablan de la versión 2 |
| B3 | Maestro, apartado 1; `repertorio` 1; `ejercicios` | El historial de la V2 mezclado con el currículo vigente. Se muda a `v2/` |
| B4 | `cobertura.md` | Coincide con las lecciones actuales, pero se presenta como prueba de calidad y confunde presencia con desarrollo y con dominio |
| B5 | Maestro, 5.1 y 9 | «Equivale a» parece más firme de lo que es (apartado H, E) |

## C. Errores pedagógicos y de datos
| # | Dónde | Error | Corrección |
|---|---|---|---|
| C1 | Nivel 2, tramo 8; maestro; repertorio | **Tárrega, *Sueño*.** Mater Salvatoris pone en 1.º «*Sueño* (Mazurka)»; el estudio de trémolo es otra obra. Saqué una conclusión falsa y además acusé a la V2 de error | Fuera del nivel 2 como trémolo. Entra Tárrega, *Preludio n.º 1* (La Rioja EP 1; Mater Salvatoris EP 2) y una melodía corta en trémolo. El estudio queda como alternativa |
| C2 | Nivel 6; maestro 9.6 | **RCM 9.** «Major and minor four-note chords» son acordes mayores y menores a cuatro notas, no cuatriadas; las de séptima llegan en el nivel 10 | Corregido en los niveles 6 y 7 |
| C3 | Nivel 3 | «Mi y Mi♭, tres octavas, como el grado 6»: el ABRSM pide Mi♭ en dos | Mi tres; Mi♭, Do y Do♯ menor, dos |
| C4 | Nivel 4 | «La♭, Si y Re menor, tres octavas»: son dos (grado 7). Solo Fa mayor y menor van en tres | Corregido |
| C5 | Nivel 5 | «Todas las tonalidades» y «todos los arpegios del grado 8»: el ABRSM no lo pide y ningún paso lo enseñaba | Las tonalidades concretas, con pasos |
| C6 | Nivel 2, L5.4 | «Sol7 resolviendo en Do, como el grado 4»: el ABRSM dice «in the key of G», es decir, Re7 → Sol | Corregido |
| C7 | Niveles 2-3 | Primera vista en la V y en la VII: confunde leer obras con leer a primera vista, y el ABRSM no sube tanto en esos grados | Lectura por posiciones, sí; primera vista, más abajo |
| C8 | Nivel 1, L4.4 | **Digitación falsa.** «Entre La y Si7, el dedo 2 viaja por la 5.ª cuerda»: La no pisa esa cuerda. El dedo común real es Si7 → Mi, con el 2 en la 5.ª cuerda | Corregido |
| C9 | Nivel 1, L12.1 | «La cifra de Sanz se lee igual que la suya»: las cifras antiguas pueden invertir el orden de las cuerdas | Reescrito y **[Por verificar]** |
| C10 | Nivel 4, L4.1 | Lo mismo con Santiago de Murcia: «con números como la suya» | Reescrito y **[Por verificar]** |
| C11 | Niveles 6 y 7 | «Trémolo con el bajo ligado» en *Una limosna*: no lo he comprobado y construí un ejercicio encima | El bajo como segunda voz; ligados solo si los marca la edición |
| C12 | Nivel 2 | «*Sonatina* op. 71 n.º 1»: La Rioja dice «Op. 71 (I-Maestoso)», sin número | Número **[Por verificar]** |
| C13 | Nivel 7, L6.3 | «El picado y el pulgar que ya domina»: él dice que le cuesta la velocidad. Es confundir «ya lo sabe» con «no hay que enseñarlo» | Reescrito; nueva línea de picado |
| C14 | Nivel 5, L8.3 | Novena de dominante en una fantasía de Weiss: teoría puesta para cubrir el BOE, sin relación con la obra | Pasa a la armonía de Barrios, nivel 6, **[Por verificar]** |
| C15 | Nivel 5, L10.1 | Modulación lejana sin música: va a Schubert-Mertz, donde tiene sentido | Movida al tramo 9, **[Por verificar]** el pasaje |
| C16 | Nivel 5, L6.2; nivel 4, L8.1 | La sexta aumentada y la napolitana no están comprobadas en sus obras | **[Por verificar]**, con la regla de mostrarla en la obra o sacarla |
| C17 | Niveles 4-7 | Sin ruta para aprender obras largas (apartado G) | Rutas de obra |

## D. Posibles mejoras
- **Objetivos:** los de los niveles 4, 5 y 7 empiezan por una sola dimensión. No son temáticos, porque el resto de la frase es amplio, pero se reformulan como un salto global.
- **Comprobaciones:** 82 tramos con «Comprobación del tramo» podrían sentirse como un examen continuo. En pantalla no se llamarán así, y nunca bloquean.
- **Botón:** él dijo «lo marca como aprendido». El botón será «Lo he aprendido» y el estado visible, «Hecho».
- **Diagramas:** falta especificar la cejilla parcial, la scordatura y el pulgar. Los pasos los piden bien (⌗).
- **Tablatura:** las obras con derechos no pueden traerla si no se dispone de una edición. Queda como decisión suya.
- **Lectura:** el nivel 1 tenía tramos sin dosis (6, 8, 11 y 12). Es su mayor asimetría, así que aquí sí hace falta añadir.

## E. Datos que necesitan verificación externa
- **La equivalencia entre sistemas.** No he encontrado ninguna tabla oficial entre RCM y ABRSM. Los nombres «RCM N = ABRSM N» son una estimación mía, y por componentes no cuadran: en escalas, el nivel 1 está cerca del grado 3 y en oído, del 4. Tampoco he podido confirmar lo que suele decirse, que el grado 8 del ABRSM queda por encima del nivel 8 del RCM.
- **Las velocidades del ABRSM:** la tabla de su PDF sale desordenada y no se ve a qué figura va cada cifra. No se cita ningún número suyo.
- **Los parámetros de primera vista por grado:** longitud y compases se leen bien; a qué grado corresponde cada posición, no del todo.
- **Lo que trabaja cada obra sin partitura delante:** todo lo marcado **[Por verificar]**, sobre todo Carcassi op. 60 n.º 7 y 19, Giuliani op. 100 n.º 12, Sor op. 31 n.º 20 y op. 6 n.º 9, Brouwer VI y VII, Tárrega *Preludio n.º 1* y las cejillas de *Recuerdos*.
- **Duración de las obras:** estimaciones mías, para calcular la carga.
- **Carlevaro:** sigo sin tener los cuadernos.

## F. Repetición y relleno
**Relleno que añadí para cuadrar la prueba por tercios (se retira o baja a «presencia»):**
| Nivel | Lección | Qué era |
|---|---|---|
| 2 | L4.3, L10.1 | Ligados añadidos a una escala, sin función |
| 2 | L4.6, L11.4 | Etiqueta de polifonía sin contenido |
| 2 | L6.5 | Colores por variación |
| 3 | L4.5 | La progresión «con cejilla» |
| 3 | L5.3, L8.2 | Etiquetas de sonido e interpretación |
| 4 | L2.4 | Colores por diferencia |
| 5 | L1.6 | «Tasto donde la barcarola se duerme» |
| 5 | L3.4, L10.3 | Etiquetas de conjunto y polifonía |
| 5 | L10.2 | Ligados cromáticos sin relación |
| 5 | L12.1 | Cejillas sin comprobar |
| 6 | L1.4, L3.2, L6.2 | Color, ligados y un repaso de trémolo |
| 6 | L10.4 | Etiquetas de mano derecha y solfeo |
| 7 | L3.2, L3.5, L8.3, L9.3, L10.2 | Etiquetas de ligados, recursos, posiciones, cejilla y trémolo |

**Ejercicios:**
- **E-N2-02** no se usaba en ninguna lección: se recupera.
- **E-N4-05 y E-N5-02** eran casi el mismo: E-N5-02 pasa a ser de resistencia a tempo de obra.
- **E-N4-06** repetía lo que ya hacía el nivel 3: ahora es velocidad.
- E-N3-07 → E-N4-03, E-N1-11 → E-N1-23 → E-N2-01 y E-N5-04 → E-N6-01 son progresión: se quedan.

**Explicaciones y contexto:**
- «El metrónomo mide, no empuja» y «estudiar primero lo difícil» se repetían sin añadir nada.
- Había lecciones de un solo paso con un contexto vacío («Antonio Lauro (Venezuela)»; las de Barrios y Villa-Lobos): se les da contenido o se funden.
- Las lecciones cortas con un ejercicio útil no son un problema.

## G. Carga y granularidad
**Carga.** La Rioja exige para aprobar un curso cinco obras y tres estudios, una de memoria **[Dato]**. Mater Salvatoris pide memorizar dos o tres **[Dato]**. La V3 no distinguía tipos, así que parecía obligar a todo:

| Nivel | Obras listadas | Minutos si se aprendieran todas **[Estimación]** | Referencia de La Rioja |
|---|---|---|---|
| 4 | 12 | 35-40 | 5 obras + 3 estudios |
| 5 | 14 | 45-50 | 5 + 3 |
| 6 | 13 | 55-60 | 5 + 3 |
| 7 | 10 | 60 | 5 + 3 |

**Es irreal para un aficionado.** Hay que clasificar las obras: troncal, aplicación, lectura, fragmento y alternativa.

**Granularidad.** «Las obras son más largas» explica la diferencia solo en parte. En el nivel 7, *Una limosna*, *Asturias* y *La Catedral* eran uno o dos pasos «Obra», con once lecciones de un solo paso. El alumno no tiene ruta para montarlas. Hay que dividirlas por secciones reales, sin convertirlas en ejercicios artificiales.

## H. Coherencia entre documentos (matriz frente a pasos)
**Lo que las matrices prometían sin ningún paso que lo enseñara:**
| Nivel | Promesa sin paso | Corrección |
|---|---|---|
| 1 | Triadas en arpegio; cantar 1-3-5 y ecos; 2/4; síncopa; pasar de tablatura a partitura; el mapa de una obra | Se añaden las tres primeras; se retiran o rebajan las otras |
| 2 | Pulgar melódico y apagar bajos; cantar intervalos de la escala; cromática de dos octavas | Se añaden |
| 3 | Décimas | Se retira |
| 4 | Sol♯ menor; cromática de tres octavas; octavas y décimas; cantar la voz de abajo y el bajo | Se añaden algunas, se retiran otras y se corrige |
| 5 | «Canta el bajo mientras toca la melodía»; la novena | Se rebaja y se mueve |
| 6 | Compás de amalgama de las soleares | Se retira |
| Varios | «Velocidad de referencia del grado 7/8» y «velocidad anotada» | Se retiran: números sin base y parecen un registro |

**Otras incoherencias:**
- Las celdas de obras por nivel no coincidían con las tablas de repertorio (trece y catorce en el nivel 5).
- La tabla técnica del maestro decía «mantenimiento» o daba escalones sin paso en campanela, extensiones, rasgueado y scordatura.
- La regla de *Lágrima*: el recital la exigía de memoria, contra lo que usted pide ahora (se corrige con una regla de equivalencia).

---

## Auditoría nivel a nivel: presencia, desarrollo y dominio
**Presencia:** aparece. **Desarrollo:** se trabaja de verdad. **Dominio:** se demuestra al salir.

| Nivel | Desarrollo real | Solo presencia o débil antes de corregir | Dominio demostrado |
|---|---|---|---|
| 1 | Sonido, ambas manos, escalas, arpegios (sin triadas), lectura, teoría, armonía, oído, *Lágrima* | Solfeo (faltaban las bases); tablatura; trémolo (primer contacto, correcto) | Recital y prueba corta; bien |
| 2 | Cejilla, traslados, melodía en *a*, Carlevaro, teoría completa, armonía, oído | Pulgar; trémolo (se apoyaba en una obra equivocada); polifonía añadida en Clasicismo | Recital y prueba |
| 3 | Voces, trino, octavados, ráfagas, modulación, oído, lectura | Acordes; sonido; cejilla parcial bien, pero con relleno | Recital y prueba |
| 4 | Velocidad, arpegio continuo, modos, suite, sonata, secuencia, oído | Campanela sin comprobar; escalas mal calibradas | Programa y prueba |
| 5 | Trémolo, arpegio extendido, voces, variación, oído | Escalas y arpegios (promesa vacía); la lectura solo en dos obras | Programa y prueba |
| 6 | Análisis, digitación, armonía del siglo XX | Técnica de obras concentrada en pocos pasos; tablatura; tocar con otros (un dúo, suficiente) | Programa y prueba |
| 7 | Autonomía, análisis, estilo | Técnica real muy resumida (obra = un paso); escalas, solo «mantenimiento» | Recital; prueba corta |

**Tramos, y áreas con poco:** historia, creatividad y tocar con otros aparecen dos veces por nivel como mucho. **Es suficiente**, y no se añade nada.

## Auditoría de las técnicas
| Técnica | Introducción y preparación | Consolidación y repertorio | Al salir | Problema detectado |
|---|---|---|---|---|
| Apoyando | Nivel 1, ◇ y L2.1 | *Romance*, escalas | Elección por color (6) | Sin pasos en 3-4: se añaden en los planos y en la velocidad |
| Tirando | Nivel 1 | Arpegios en todos | Arpegio de concierto | Ninguno |
| Preparación | Nivel 1 | — | — | Desaparece: falta la preparación a velocidad (4) |
| Pulgar | Nivel 1 | Bajos; Villa-Lobos; *Asturias* | Melodía en el bajo | Faltaba en el nivel 2 |
| Arpegios | Nivel 1, ◇ y Giuliani | Carlevaro, BWV 999, *Julia Florida*, Villa-Lobos | Concierto | Faltaban las triadas (1) y los del nivel 5 |
| Escalas | Nivel 1 | Tres octavas desde el 3 | Las de sus obras | C3, C4, C5 |
| Velocidad | Nivel 3 (ráfagas), preparada por los cruces | Niveles 4, 6 y 7 | Concierto | Bien; sin números falsos |
| Picado | Lo trae de flamenco | — | — | **Faltaba la línea** (C13) |
| Ligados | Nivel 1 | Sube bien hasta Barrios | Concierto | Repetición en 3-4 |
| Ornamentos | Mordente (1) | Trino, Barroco, Dowland | Con fuentes | Bien |
| Cejilla | Media (1) → V (1) → trastes (2) | Parcial, encadenada, bajo trémolo | Decisión | Bien; algunas cejillas sin comprobar |
| Posiciones | Dedo guía (1) | Hasta XII (4) | Todo | Bien |
| Acordes | ◇ y dedo común | Móviles, cuatriadas, sexta aumentada | Rearmonizar | C8 |
| Rasgueado | Nivel 1 | Clásico (2), barroco (3), Brouwer, Turina | Según obra | Nivel 4 sin paso: es correcto, no «mantenimiento» |
| Trémolo | Nivel 1 | Melodía (2), progresión (3), fragmento (4), obra (5), *Una limosna* | Largo | **C1, C11** |
| Armónicos | XII, VII, V (1) | IV, IX, XIX (2), octavado (3), melodía (4), artificiales (5) | Color | IV y IX repetidos en 2 y 3 |
| Vibrato | Oído (1), obra (2) | Estilo y lied | Propio | Bien |
| Glissando | Nivel 2 | Portamento (3), Villa-Lobos (5) | Propio | Bien |
| Campanela | Nivel 3 | Murcia, Mudarra | — | Nivel 5 inventado: se quita |
| Polifonía | Dos planos (1) | Voces, implícita, cuatro | Concierto | Bien, sin las etiquetas falsas |
| Efectos | Pizzicato (2) | Tambora, siglo XX | Con intención | Bien |
| Scordatura | Nivel 6 | *Capricho árabe* | Repertorio | La preparación («transportar») era artificial; basta la del propio paso |

**Demasiado pronto:** el trémolo en el nivel 1 (**[Decisión]**, ya avisado); ninguna otra. **Demasiado tarde:** nada, tras corregir. **El mayor salto:** de la melodía en trémolo (2) a la parte en La menor de *Recuerdos* (4): el nivel 3 lo reparte sobre una progresión, y es suficiente.

## Teoría, armonía, oído y solfeo
- **Dominantes secundarias:** preparadas por V/V (2), aplicadas en Bach (3). Bien.
- **Modulación:** a la dominante en Sor (2), vecinas (3), ¿adónde modula? (4), lejana (5, corregido). Bien.
- **Modos:** primer vistazo con Milán (3), en serio con Narváez (4), frigio aplicado en Turina (6) y Albéniz (7). Bien.
- **Forma sonata:** sonatina (2), Diabelli (4), Sor (6). Bien.
- **Sexta aumentada:** sin obra comprobada (C16).
- **Siglo XX:** ostinato (1), paralelismos, tonos enteros y frigio (6). Bien.
- **Análisis:** de señalar frases (1) a la obra completa (7). Bien.
- **Oído:** intervalos → acordes → funciones → cadencias → modulaciones → forma. Bien, salvo C2.
- **Solfeo:** las bases faltaban en el nivel 1; ritmo → melodía → voces → bajo → oído interno → fraseo. Tras corregir, bien.
- **Lectura:** posición → alteraciones → voces → posiciones altas → obras → autonomía. Bien; la primera vista estaba confundida (C7).

---

## Las quince respuestas (estado antes de corregir)
1. **¿Cada nivel es completo?** Sí en la estructura y casi en el contenido. Los huecos reales estaban en el solfeo del nivel 1, las escalas del 5 y la técnica de los niveles 6 y 7, resumida en pasos «Obra».
2. **¿Hay algún curso temático en la práctica?** No.
3. **¿La progresión técnica es correcta?** En conjunto, sí; con errores concretos: *Sueño*, *Una limosna*, escalas y picado.
4. **¿La progresión musical es correcta?** Sí.
5. **¿La de teoría, armonía, oído y solfeo?** Sí en el orden. Hay un error de lectura del RCM 9 y varios conceptos sin ligar a la obra.
6. **¿El repertorio está bien distribuido?** Sí, salvo *Sueño*.
7. **¿La carga es razonable?** **No, en los niveles 4 a 7**, si se entiende como obligatoria.
8. **¿Los niveles altos tienen granularidad suficiente?** **No.** Sobre todo el 7.
9. **¿`cobertura.md` representa el contenido?** Representa las etiquetas, no la calidad, y algunas eran relleno.
10. **¿Quedan referencias a `progresion.md`?** No en el currículo vigente.
11. **¿Quedan referencias a V2?** Sí, en cursos 2-5, maestro, repertorio y ejercicios. Se retiran del contenido vigente.
12. **¿Hay afirmaciones que parezcan oficiales y sean estimaciones?** Sí: las equivalencias RCM = ABRSM, «como el grado N» mal leídos y la velocidad de referencia.
13. **¿Hay ejercicios repetidos?** Dos parejas, más uno sin usar.
14. **¿Hay contenido artificial para rellenar áreas?** **Sí, y lo puse yo** (apartado F).
15. **¿Qué cambiaría antes de aprobar?** Lo de C, el relleno de F, la carga y las rutas de G, y una cobertura que separe presencia, desarrollo y dominio. Es lo que recoge la versión 3.1.

---

## Estado después de corregir (versión 3.1)
**Se ha corregido:** todo lo de C; el relleno de F; los ejercicios; las promesas de H; la carga y las rutas de G; las equivalencias de E (ahora «se parece a», con el RCM y el conservatorio como referencia, y el ABRSM solo por componentes); y `cobertura.md`, que ya separa desarrollo, presencia y dominio. El historial de la V2 está en `v2/`.

**No se ha cambiado:** la filosofía, la arquitectura, los siete niveles ni la experiencia de usuario, salvo el texto del botón y que «Comprobación» no se ve en pantalla.

**Sigue abierto, porque necesita la partitura o una decisión suya:** lo de E y las obras con derechos (apartado 14 del maestro).

| Pregunta | Después de corregir |
|---|---|
| 1. ¿Cada nivel es completo? | Sí, con contenido real en cada área; historia, creatividad y conjunto, en dosis pequeñas y suficientes |
| 2. ¿Alguno es temático? | No |
| 3. ¿La progresión técnica es correcta? | Sí, salvo lo que depende de comprobar partituras |
| 4. ¿La musical? | Sí |
| 5. ¿Teoría, armonía, oído y solfeo? | Sí; la sexta aumentada y la napolitana, pendientes de ligar a una obra comprobada |
| 6. ¿El repertorio está bien distribuido? | Sí |
| 7. ¿La carga es razonable? | Sí con la regla de carga: entre 7 y 8 obras enteras por nivel. Sigue siendo mucho para un aficionado: unos 9-18 meses por nivel **[Estimación]** |
| 8. ¿Los niveles altos tienen granularidad suficiente? | Las troncales, sí. Las de aplicación van en pocos pasos a propósito |
| 9. ¿`cobertura.md` representa el contenido? | Sí en lo que dice, y avisa de lo que no puede decir |
| 10. ¿Quedan referencias a `progresion.md`? | No, salvo el historial de `v2/` y las notas diarias, que no se reescriben |
| 11. ¿Quedan referencias a la V2? | Solo en el historial y en esta auditoría |
| 12. ¿Hay falsos datos oficiales? | Los detectados, corregidos. Quedan marcados los que no he podido comprobar |
| 13. ¿Hay ejercicios repetidos? | No: los parecidos que quedan son escalones de una progresión |
| 14. ¿Hay contenido artificial? | Retirado el que he identificado. Solo una revisión con partitura puede descartar el resto |
| 15. ¿Qué falta antes de aprobar? | Sus decisiones del apartado 14 del maestro, y sobre todo que un profesor de guitarra revise los niveles altos: yo no los he tocado ni puedo oírlos |
