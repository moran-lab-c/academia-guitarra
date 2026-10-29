---
status: active
project: personal
type: plan
created: 2026-10-29
---
# Academia de guitarra: currículo maestro (propuesta para su revisión)

**Estado: borrador para revisar. No se ha tocado el código ni sus datos.** Este documento y sus siete anexos (uno por curso) son la fase de diseño que pidió el 29/10/2026: auditar, investigar, diseñar, documentar y presentar. Nada se implementa hasta que usted lo apruebe.

| Archivo | Qué contiene |
|---|---|
| Este documento | Auditoría, filosofía, perfil, arquitectura del programa, las progresiones de cada área, evaluación, relaciones, la experiencia guiada y lo que queda para después |
| [[curso-1 (v1)]] | Curso 1 al detalle: tramo, lección y paso, con las fichas de ejercicios y obras |
| [[curso-2 (v1)]] … [[curso-7 (v1)]] | Cursos 2 a 7 hasta el paso, con sus fichas |

**Cómo leerlo.** Cada dato lleva su naturaleza cuando importa, como en el Plan: **[Dato]** (comprobable en una fuente), **[Consenso]** (práctica pedagógica extendida), **[Decisión]** (elección mía, se puede cambiar) y **[Por verificar]** (falta comprobarlo con la partitura o la fuente; no se presenta como dato).

---

## 0. Auditoría (Fase A)

### 0.1 Qué hay ahora
| Pieza | Estado | ¿Se reutiliza? |
|---|---|---|
| Servidor, guardado, copias, migraciones, exportar e importar | Sólido, con 157 pruebas en verde | **Sí, entero** |
| Validador del catálogo | Comprueba referencias, círculos, programas y notación | **Sí**, ampliado con lecciones y pasos nuevos |
| Notación propia (cuerda y traste por nota) → partitura y tablatura con VexFlow, selector Partitura · Tab · Ambas | Hecho en la Fase 3 | **Sí, entero**: es exactamente lo que pide el punto 19 |
| Metrónomo | Hecho en la Fase 3 | **Sí**, como herramienta dentro del paso, sin protagonismo |
| Preguntas que corrige la app (lectura, diapasón, teoría, armonía, oído) | Hecho en la Fase 3 | **Sí**: son los pasos de teoría y oído del currículo nuevo |
| Evaluación inicial por áreas | Hecha en la Fase 3 | **Sí, por dentro**: pasa a ser «Lo que ya sabes» al empezar un curso |
| Dominio (completado, solidez, repasos espaciados) | Hecho | **Sí, por dentro**: programa los repasos, sin enseñar sus términos |
| Ruta del curso (tramos y pasos, refuerzos, obras conocidas) | Hecha | **En parte**: el modelo sigue, pero la ruta pasa a ser lineal con un «Continuar» |
| Planificador «¿Qué hago hoy?» | Hecho, con sus prioridades | **Sale de la experiencia principal** (ver 0.3) |
| Pantallas Hoy, Diario, Profesor, Competencia, Área, registro por aspectos | Hechas | **Salen de la navegación**; su función útil se reparte (ver 20) |
| Diseño B+ (tokens, atril, mapa de la ruta, títulos) | Aprobado | **Sí, sin rediseño**: menos información y mejor jerarquía |
| Contenido: 7 cursos clásicos, la ruta del curso 1 (44 pasos), 20 competencias clásicas y 21 comunes, 18 ejercicios, 16 notaciones, 5 obras clásicas | Real y comprobado | **Sí**: casi todo encaja en el curso 1 nuevo (ver [[curso-1 (v1)]], apartado «Lo que se reaprovecha») |

### 0.2 Lo que he encontrado roto o confuso
1. **Por qué *Lágrima* no enseña la partitura.** Hay dos causas:
   - **La academia que usted abre no es la de la Fase 3.** `Abrir academia.cmd` arranca la copia de `08 - Guitarra/Academia/app`, que se quedó en la Fase 2 (commit `8b6bfec`): no tiene VexFlow ni la notación. La Fase 3 solo está en la rama `revision-fase-2` de GitHub. Esto se arregla en la implementación, actualizando esa copia con su aprobación.
   - **Aunque abriera la Fase 3, *Lágrima* no tiene notación en la app.** Su ficha dice `partitura: externa` (IMSLP) y `tablatura: pendiente`: nunca se transcribió, porque no había una edición decidida. El apartado 15.1 decide la edición.
2. **La pantalla obliga a entender el sistema.** Para practicar un paso hay que pasar por el criterio, el registro por aspectos, las pasadas y la comprobación en frío. Es lo que usted describe, y el código lo confirma: `paso.js`, `ejercicio.js` y `obra.js` enseñan dominio, solidez y criterio en la primera pantalla.
3. **Las obras eje de los tramos 3 y 4 del curso 1 están vacías** (decisión pendiente de la Fase 3). El currículo nuevo las asigna (ver [[curso-1 (v1)]]).

### 0.3 Reglas cerradas que este rediseño cambia (necesitan su confirmación)
Lo que usted pide el 29/10/2026 contradice algunas reglas que se cerraron antes. No las cambio en silencio: aquí están, con lo que propongo.

| Regla cerrada | Qué pide ahora | Propuesta |
|---|---|---|
| «Las prioridades del planificador no se rediseñan» | Quitar «Hoy» y las sesiones | El planificador **sale de la pantalla**; su lógica de repasos se aprovecha por dentro para elegir qué repasar |
| «El profesor tiene prioridad» y la pantalla Profesor | Quitar Profesor de la navegación | Se mantiene la regla con una sola pieza: un **encargo de clase** opcional, que aparece encima de «Continuar» mientras dure (ver 20.4) |
| Estados realizada, aprendida, consolidada y dominada, visibles | Que no se vean | Siguen calculándose; el alumno solo ve «Hecho», «En práctica» y «Para repasar» |
| Dominio con tres aciertos en frío y registro por aspectos | Nada de comprobación en frío, criterio, dominio ni registrar práctica | El paso se cierra con «Lo tengo»; los repasos aparecen solos dentro de «Continuar», con tres botones (ver 16) |
| Una obra final por curso | Varias obras por curso y un cierre que no sea «aprender una obra» | Cada curso tiene obras durante todo el recorrido y un **recital de cierre** de tres obras de estilos distintos, más técnica, lectura, oído y teoría |
| *Lágrima*, obra final del curso 1 «con el criterio de la opción 1» | — | Sigue siendo la obra principal del curso 1 y entra en el recital de cierre, de memoria. **No se marca como conocida** |

Lo que **no** cambia: los programas clásico y flamenco no se mezclan; la tablatura es permanente; la lectura no bloquea; nada se bloquea artificialmente; el repertorio que ya sabe no se reaprende; el tempo es un dato, no un requisito; lo dudoso va como *por verificar*; el diseño B+, primero el escritorio.

**Alcance.** Este rediseño es del **programa clásico**. El flamenco sigue como está y usará el mismo modelo de lección y paso cuando le toque (Fase 6).

---

## 1. Filosofía pedagógica

1. **El curso es un nivel, no una asignatura.** Cada curso forma al guitarrista entero en su nivel: técnica, sonido, lectura, teoría, oído, armonía, repertorio y musicalidad, con el peso que corresponde a ese momento.
2. **El ciclo técnica → repertorio.** Una técnica se presenta, se aísla en un ejercicio, se aplica en un fragmento real y vive en una obra. El ejercicio nunca existe por sí mismo: siempre dice para qué obra sirve.
3. **Primero se hace, luego se nombra.** «La experiencia debe preceder a la teoría» y «progresar en espiral» son principios metodológicos explícitos de la programación de guitarra del Conservatorio de La Rioja (2025-26) **[Dato]**. La teoría se toca, se oye y se lee a la vez: cada concepto une lo escrito, lo que suena y lo que hace la mano.
4. **En espiral.** Los mismos temas vuelven con más exigencia: el cambio de modo de *Lágrima* (Mi mayor → Mi menor) reaparece en el *Romance*, en *Adelita* y en *Recuerdos de la Alhambra*.
5. **Sonido antes que velocidad.** La velocidad llega en el curso 4, sobre una base limpia.
6. **Lectura en dosis pequeñas y constantes**, por posiciones y con material más fácil que el repertorio del mismo curso. La primera vista se entrena aparte (Zhukov, 2014) **[Evidencia]**. La tablatura nunca se retira.
7. **Recordar cuesta, y eso se aprovecha.** Lo que sale bien practicando no prueba que se haya aprendido (Soderstrom y Bjork, 2015), y repartir la práctica retiene más (Stafford y Haasnoot, 2017) **[Evidencia]**. Por eso hay repasos, pero en segundo plano y con palabras normales.
8. **Variedad con intención.** No hay una plantilla de lección. Cada paso tiene la forma que mejor enseña su contenido.
9. **Lo que ya sabe se comprueba, no se repite.** Muchos pasos son *comprobables* (marcados ◇): si ya lo sabe, una prueba corta los da por hechos.
10. **Su profesor manda** en lo que le encargue. La academia se adapta.
11. **Calidad antes que cantidad.** Ninguna lección existe para rellenar. Si un ejercicio ya cumple una función, no se duplica.

---

## 2. Perfil de entrada

- **Él:** 18 años; toca desde la primavera de 2025 (año y medio); Yamaha C40; clase los martes de 18:00 a 19:00.
- **Lee:** tablatura con soltura; pentagrama, muy poco.
- **Técnica:** formación sobre todo flamenca. Hace arpegio, ligados, apoyando, tirando, picado, trémolo (p-i-a-m-i), alzapúa, rasgueos y acordes abiertos; algunas escalas.
- **Repertorio clásico:**
  - su *Estudio en Mi menor* (74 compases, arpegio con armónicos), que ya toca;
  - *Lágrima*, que **no sabe tocar** (corrección suya: se aprende desde el principio);
  - la *Passacaglia* de Händel, que le resultó difícil en su versión completa.
- **Flamenco:** *Agua Marina* y bases de varios palos. Va en el otro programa.
- **Teoría, armonía y oído:** parciales, sin sistematizar.

**Dónde le sitúa eso [Estimación]:**
- su técnica y su repertorio clásicos, entre el nivel 3 y el 4 del RCM (*Lágrima* es RCM 4 y 1.º de Profesionales en Madrid **[Dato]**);
- su lectura, en el nivel Preparatorio;
- teoría y oído, a medias.

El curso 1 empieza ahí y usa la evaluación inicial por dentro para no repetirle lo que ya sabe.

---

## 3. Programa completo: cuántos cursos y por qué

### 3.1 La decisión: 7 cursos y un Horizonte
**Por qué 7 [Decisión, con dos calibraciones independientes]:**
- **El RCM** (Royal Conservatory, programa de guitarra de 2018) gradúa la guitarra en los niveles Preparatorio, 1 a 10 y el diploma ARCT **[Dato]**. Desde su punto de entrada (nivel 3-4) hasta el nivel 10 hay **siete escalones**.
- **El conservatorio español** tiene 4 cursos de Elementales y 6 de Profesionales **[Dato]**. Desde el final de Elementales (3.º-4.º) hasta 6.º de Profesionales hay, otra vez, **siete escalones**.
- **Los dos sistemas coinciden** en qué obra va en cada escalón (tabla 3.2): *Lágrima* en RCM 4 y 1.º de Profesionales; *Adelita* en RCM 6 y 2.º de Profesionales (La Rioja); *Julia Florida* en RCM 8 y 4.º de Profesionales (La Rioja, Madrid) **[Dato]**.
- **Cada escalón exige algo cualitativamente nuevo** que el siguiente da por hecho (columna «Salto» de la tabla 3.2). Es el criterio que usted aprobó el 24/10/2026.

**Por qué no más:**
- Un nivel del RCM o un curso de conservatorio ya es un año de un alumno que estudia en serio.
- Partirlos daría cursos que se distinguen solo por la cantidad, no por una capacidad nueva. Es lo que usted no quiere: «dividir contenido simplemente para fabricar más lecciones».
- La extensión se consigue con **más tramos dentro de cada curso**: entre 13 y 15, según lo que pida el nivel.

**Por qué no menos:**
- Juntar dos escalones mezclaría saltos que se apoyan uno en otro. Por ejemplo, el trémolo a tempo de obra (curso 6) necesita la resistencia y las cejillas del 5; la polifonía (curso 3) necesita la cejilla del 2.

**El Horizonte** no es un curso. Son las obras más allá del nivel 10 (*Chacona*, *Un sueño en la floresta*, *Nocturnal*). Se ven desde el principio, con lo que falta para tocarlas.

**Duración:** no es un objetivo. Un curso termina cuando se alcanzan sus competencias. Solo como orientación **[Estimación]**: con 60-90 minutos al día, entre 9 y 18 meses por curso.

### 3.2 Los siete cursos
| Curso | Nombre | Salto que exige | Calibración **[Dato]** | Obras que lo representan |
|---|---|---|---|---|
| 1 | Fundamentos del guitarrista clásico | Del sonido de tablatura y flamenco al clásico; melodía sobre acompañamiento; primera posición leída; dedo guía y media cejilla; las tonalidades de Do, Sol, Re, Mi y sus menores | RCM 3-4 · Elementales 3.º-4.º | *Lágrima*, *Españoleta*, Sor op. 31 n.º 4 |
| 2 | Cejilla y posiciones | Cejilla completa y móvil; posiciones II-VII; arpegio con melodía en *a*; tresillos; todas las armaduras; trémolo lento | RCM 5 · Profesionales 1.º | *Romance*, Dowland *Willoughby*, Carcassi op. 60 n.º 7 |
| 3 | Polifonía y mástil completo | Dos y tres voces independientes; mástil hasta el XII; armónicos naturales; ornamentos; modulación | RCM 6 · Profesionales 1.º-2.º | *Adelita*, *Bourrée* BWV 996, Sor op. 35 n.º 22 |
| 4 | Velocidad y estilos | Escalas, arpegios y ligados rápidos con control; estilos renacentista, barroco y clásico con su articulación; trémolo a velocidad media; secuencias armónicas | RCM 7 · Profesionales 2.º-3.º | *Preludio* BWV 999, *Canción del Emperador*, *El testament d'Amèlia* |
| 5 | Obras de concierto | Obras de 4-6 minutos que mezclan técnicas; plan interpretativo de toda la obra; armónicos octavados; programa de 15-20 minutos | RCM 8 · Profesionales 3.º-4.º | *Julia Florida*, Scarlatti K. 208, *Marieta* |
| 6 | Trémolo y gran forma | Trémolo a tempo de obra; tres y cuatro voces; resistencia; variaciones y formas largas | RCM 9 · Profesionales 4.º-5.º | *Recuerdos de la Alhambra*, Villa-Lobos *Preludio n.º 1*, *Folías* de Sor |
| 7 | Autonomía | Digitar e interpretar una obra nueva sin guía; obras mayores; recital de 25-30 minutos | RCM 10 · Profesionales 5.º-6.º | *Capricho árabe*, Villa-Lobos *Estudio n.º 1*, *Preludio* BWV 997 |
| — | Horizonte | — | Más allá de RCM 10 / Superior | *Chacona* BWV 1004, *Un sueño en la floresta*, Britten *Nocturnal* |

Las calibraciones salen de las listas de obras de los libros del RCM de 2018 (recopiladas por Da Capo Academy), de la programación de guitarra del Conservatorio de La Rioja de 2025-26 y de la de Mater Salvatoris (Madrid) de 2026-27 (fuentes al final).

---

## 4. Cursos

Cada curso tiene su anexo con todo el detalle. Lo común a todos:
- **Objetivo y nivel.**
- **Competencias que alcanza**, por área.
- **Los tramos**, con su razón de existir.
- **Lecciones y pasos.**
- **Fichas de los ejercicios importantes** (objetivo, técnica o concepto, dificultad, instrucciones, material, por qué existe, qué prepara, errores frecuentes y «está bien cuando…»).
- **Fichas de las obras** (compositor, nivel y fuente, curso y tramo, por qué aparece, competencias, técnicas, teoría relacionada, fragmentos útiles, dificultad, prerrequisitos, derechos y aplicaciones posteriores).
- **Evaluaciones y cierre.**

---

## 5. Tramos

**Qué es [Decisión]:** una unidad con un tema musical y técnico propio, que termina en música: una obra, una sección o un fragmento real. Como las unidades didácticas de una programación de conservatorio.

**Cuándo existe:** solo si introduce algo nuevo que lo que viene después da por hecho. Si no, sus lecciones van a otro tramo.

**Partes de un tramo:**
- Una **apertura**: un paso corto que dice qué se va a aprender y para qué obra.
- Sus **lecciones**.
- Una **comprobación del tramo**: corta y mezclada, al final (ver 16).

**Cuántos:** de 13 a 15 por curso, según lo que pida el nivel.

## 6. Lecciones

**Qué es [Decisión]:** un aprendizaje con sentido propio que se hace de una sentada: de 10 a 30 minutos de contenido. Si incluye práctica de varios días (montar una sección), la lección termina igual y lo que queda por practicar pasa al **atril** (ver 20.2).

**Nombre:** las lecciones se nombran por lo que enseñan («El dedo guía»), nunca por su tipo.

## 7. Pasos

Un paso es una pantalla: una sola cosa que aprender o hacer. **No hay plantilla.** El currículo usa estos tipos, combinados según lo que enseñe cada lección:

| Tipo | Qué es | Lo que suele llevar |
|---|---|---|
| **Explicación** | Uno o dos párrafos sobre un concepto | Texto, a veces un dibujo o una nota en el pentagrama |
| **Cómo se hace** | La técnica explicada para hacerla | Texto breve, puntos clave, el error típico (en boca del guía) |
| **Ejercicio** | Práctica con una finalidad concreta | Tablatura, partitura o las dos; metrónomo si sirve; «está bien cuando…» |
| **Lectura** | Leer en el pentagrama y tocar | Partitura principal, con la tablatura a un toque |
| **Ritmo** | Leer, contar, palmear y tocar un ritmo | Partitura rítmica y metrónomo |
| **Escucha** | Oír algo con una pregunta en la cabeza | Audio (grabación de referencia o audio generado) |
| **Oído** | Una pregunta de oído que corrige la app | Sonido y respuesta |
| **Teoría con preguntas** | Concepto y preguntas cortas que corrige la app | Texto y preguntas |
| **Acordes** | Una forma de acorde | Diagrama de mástil con un color por dedo |
| **Progresión** | Varios acordes en orden, con su función | Diagramas, cifrado, audio y metrónomo |
| **Análisis** | Mirar una obra: forma, armonía y frases | Partitura con marcas |
| **Aplicación** | La técnica dentro de un fragmento real | El fragmento de la obra y por qué aparece ahí |
| **Obra** | Una sección o la obra entera | Notación, cómo practicarla y digitación cuando importa |
| **Contexto** | Compositor, época, historia: breve | Texto corto y, si lo hay, un audio |
| **Para saber** | «Existe esto; todavía no es para ti» | Un párrafo; nada que practicar |
| **Comprobación** ◇ | Para lo que quizá ya sabe: si sale, se da por hecho | Una tarea corta |
| **Repaso** | Lo inserta la academia por dentro | La tarea y tres botones (ver 16) |

En los anexos cada paso se escribe en una línea: **tipo · qué enseña o qué hace · recursos**. El conocimiento previo es el paso anterior salvo que diga «↩ necesita»; lo que prepara, si no es evidente, va con «→ prepara».

**Recursos:** 𝄞 partitura · T tablatura · ⌗ diagrama de acordes · ♪ audio · ⏱ metrónomo · ✎ preguntas que corrige la app · ◇ comprobable.

---

## 8. Técnica: progresión a lo largo de los cursos

| Área | C1 | C2 | C3 | C4 | C5 | C6 | C7 |
|---|---|---|---|---|---|---|---|
| **Postura y ergonomía** | Postura clásica (soporte o banqueta), cuatro apoyos; uñas; relajación | Peso del brazo en la cejilla; postura en posiciones altas | El pulgar izquierdo que se mueve con la mano; sin tensión en el XII | Economía de movimiento a velocidad | Resistencia en obras largas; calentamiento propio | Prevenir sobrecarga en el trémolo largo | Autonomía: planifica su estudio |
| **Mano derecha** | Apoyando y tirando con sonido clásico; preparación; melodía apoyando con bajo tirando; p-i-m-a y p-a-m-i; nota destacada; alternancia i-m y m-a | Melodía en *a* dentro del arpegio (tresillos); arpegio con pulgar melódico; trémolo p-a-m-i lento | Equilibrio de tres planos; arpegios en posiciones altas; pizzicato | Velocidad en escalas (i-m, m-a, a-m-i), arpegios rápidos, rasgueado barroco y clásico, campanela | Arpegios largos y extendidos; plan de sonido de una obra | Trémolo a tempo y sin acentos; resistencia | Resolver la mano derecha de una obra nueva |
| **Mano izquierda** | Presión justa; dedo guía; cambio a posiciones altas; media cejilla; ligados ascendentes y descendentes | Cejilla completa y móvil; posiciones II-VII; extensiones pequeñas | Mástil hasta el XII; ligados con dedo fijo; mordente y trino; portamento y glissando | Ligados largos; extensiones; cambios rápidos; escalas en terceras y sextas | Armónicos octavados; cejillas con cambios rápidos; vibrato | Cuatro voces; cejillas en posiciones altas sin cortar el trémolo | Digitar con criterio propio |
| **Sonido y color** | Punto de contacto; ángulo de la uña; tasto, normal y ponticello | Sonido igual con y sin cejilla | Color al servicio de cada voz | Articulación por estilos | Paleta de color de una obra entera | Color en el trémolo | Sonido propio |

## 9. Teoría

| C1 | C2 | C3 | C4 | C5 | C6 | C7 |
|---|---|---|---|---|---|---|
| Pentagrama y clave de sol con el 8; tono y semitono en el mástil; escala mayor; intervalos con su calidad; triadas mayor y menor; armaduras de 0 a 4 sostenidos; las tres menores; tono relativo y homónimo; compases simples y 6/8 | Círculo de quintas; todas las armaduras; cuatriadas (séptima de dominante, mayor con 7.ª, menor con 7.ª); inversiones y cifrado; tresillo; síncopa | Notas de adorno; modulación a tonos vecinos; forma binaria, ternaria y rondó; la cifra de la vihuela | Modos; la suite barroca y sus danzas; ornamentación barroca; forma sonata; secuencias | Armonía cromática; tema con variaciones; formas grandes | Armonía del siglo XIX tardío y del XX; impresionismo | Análisis completo y estilo histórico |

## 10. Solfeo

El solfeo de la academia es **práctico**: leer tocando, leer ritmo, cantar donde ayuda al oído. No es el Lenguaje Musical completo del conservatorio. Se calibra con él **[Dato: contenidos mínimos de Lenguaje Musical de 1.º y 4.º de Elementales del CPM de Elche, 2026]**. Por ejemplo, en 1.º: compases de 2/4, 3/4 y 4/4, figuras hasta la semicorchea, puntillo, síncopa, contratiempo y dictados en Do mayor. En 4.º: grupos irregulares, compases de 2/2, 3/2, 2/8 y 4/8, intervalos aumentados y disminuidos, todas las armaduras, las cuatro escalas menores y la clave de Fa.

| C1 | C2 | C3 | C4 | C5 | C6 | C7 |
|---|---|---|---|---|---|---|
| Pulso; redonda a corchea y semicorcheas por parejas; puntillo de blanca y negra; 2/4, 3/4, 4/4 y 6/8; contratiempo; contar en voz alta; cantar 1-3-5 y la tónica | Tresillo; síncopa; 2/2 y 3/8; silencios a contratiempo; cantar intervalos de la escala | Ritmos distintos en el bajo y en la melodía; hemiolia; puntillo de corchea | Cambios de compás; ritmos de danza barroca y latinoamericana; grupos irregulares | Dos contra tres; rubato sobre el pulso | Ritmo flexible en obras largas | Agógica con criterio propio |

## 11. Oído

| C1 | C2 | C3 | C4 | C5 | C6 | C7 |
|---|---|---|---|---|---|---|
| Mayor o menor; cadencia conclusiva o suspensiva; 3.ª, 5.ª y 8.ª; ¿sube o baja?; cantar la tónica; I, IV y V en una progresión | Todos los intervalos melódicos; las cuatro triadas; dictado rítmico corto | Intervalos armónicos; I-IV-V-vi; dictado a dos voces breve | Modos; dominantes secundarias; dictado del bajo | Progresiones cromáticas; sacar melodías de oído | Transcribir fragmentos cortos | Reconocer formas y modulaciones al escuchar |

El oído va siempre detrás de la teoría que nombra lo que se oye, y delante de la obra donde aparece **[Decisión]**. Se entrena en contexto tonal **[Consenso]**.

## 12. Armonía

| C1 | C2 | C3 | C4 | C5 | C6 | C7 |
|---|---|---|---|---|---|---|
| Grados y funciones (tónica, subdominante, dominante); I-IV-V7-I en Do, Sol, Re, La y Mi; la sensible y la séptima; cadencia perfecta, plagal y semicadencia; mayor y menor homónimos (el Si7 sirve a los dos) | ii-V-I; dominante de la dominante (V/V); acordes móviles y transporte | Dominantes secundarias; modulación a la dominante y al relativo | Secuencias por quintas (la *Passacaglia*); napolitana | Sexta aumentada; modulación lejana | Armonía de Barrios y Villa-Lobos | Rearmonizar progresiones sencillas |

## 13. Lectura

| C1 | C2 | C3 | C4 | C5 | C6 | C7 |
|---|---|---|---|---|---|---|
| 1.ª posición completa, cuerda a cuerda; dos voces con plicas; sostenidos de Sol, Re, La y Mi mayor; primera obra leída desde la partitura (con la tablatura a mano) | Posiciones II y V; armaduras con bemoles; lectura de acordes | Posición VII; tres voces; ornamentos escritos | Posición IX; 3-4 alteraciones; leer un preludio barroco | Todas las posiciones hasta la XII | Lectura fluida de obras del curso 5 | Aprender cualquier obra del curso 6 desde la partitura |

**Reglas que no cambian:** la tablatura es permanente; la lectura no bloquea; la partitura es la recomendada cuando el objetivo es leer.

## 14. Repertorio

- **Varias obras por curso, cada una por una razón**, y repartidas por estilos (Renacimiento, Barroco, Clasicismo, Romanticismo, siglos XX y XXI), como hacen el RCM (listas por época) y las programaciones de conservatorio **[Dato]**.
- **Papeles de una obra:**
  - **principal:** la que vertebra varios tramos;
  - **de aplicación:** donde vive una técnica recién aprendida;
  - **de lectura:** más fácil, para leer desde la partitura;
  - **estudio:** una técnica dentro de una pieza;
  - **de musicalidad o memoria;**
  - **conocida:** la que ya sabe, para comprobar, analizar o pulir;
  - **del recital de cierre.**
- **Fragmentos:** una obra puede aparecer primero como fragmento en una lección de técnica y después entera.
- **Derechos:**
  - Las obras de **dominio público** (Sor, Giuliani, Tárrega, Bach, Dowland, Sanz, Mertz, Llobet; Barrios desde 2025 en España, a los 80 años de su muerte) se transcriben dentro de la app, con partitura y tablatura.
  - Las que tienen **derechos** (Brouwer, Ponce, Villa-Lobos, Torroba, los arreglos modernos) se usan **con su edición publicada**: la academia da la lección, el contexto y los fragmentos que se pueden comentar, y dice dónde conseguir la partitura.
  - Los años de cada autor se comprueban antes de transcribir **[Por verificar en cada caso]**.
- **Las obras de los niveles RCM 1-4** se han elegido por su nivel **[Dato]** y por lo que suele trabajar su colección **[Consenso]**. Lo que pide cada una compás a compás se comprueba con la partitura antes de implementarla; si no cumple su función, entra la alternativa anotada en su ficha.

## 15. Obras

Las fichas completas van en cada anexo. Aquí, las decisiones generales y la de *Lágrima*.

### 15.1 *Lágrima*: lo que pidió decidir antes de implementar
| Qué | Decisión | Naturaleza |
|---|---|---|
| **Versión** | La de dos secciones, A-B-A: 16 compases y la vuelta a la A, en 3/4, *Andante*. Se deja fuera la tercera sección de la edición de 1911 (SONETO), que casi nadie toca; aparece solo como paso «Para saber» | Forma: **[Dato]** (IMSLP, Wikipedia). Elección: **[Decisión]** |
| **Partitura de referencia** | La edición de **Ildefonso Alier (Madrid, plancha I. 5230 A)**, publicada en vida de Tárrega, cotejada con el **manuscrito** que tiene IMSLP. Las ediciones modernas de IMSLP (Goldau, 2016; Perol-Schneider, 2012) sirven solo para contrastar, por su licencia | **[Decisión]**. Que la primera edición de Alier sea fiable compás a compás: **[Por verificar]**. Un estudio de la Universidad de Denver advierte que muchas primeras ediciones de Tárrega no son fiables |
| **Partitura y tablatura en la app** | Transcripción propia desde Alier, en la notación de la app, con **las dos vistas**. Principal mientras la aprende: **tablatura**. Cuando su lectura llegue: partitura, empezando por la A | **[Decisión]** |
| **Digitación** | La de Tárrega en la edición. Donde no la marque, se elige con criterio (dedo guía, preparar la nota siguiente, evitar saltos), se explica por qué y se dan las alternativas con su fuente. No se inventa | **[Decisión]** |
| **Secciones** | **A:** c. 1-8, Mi mayor; melodía en negras y blancas con puntillo sobre acompañamiento en corcheas. **B:** c. 9-16, Mi menor; la voz principal en corcheas. **A** da capo | **[Dato]**, Wikipedia. Lo que pide cada sección compás a compás: **[Por verificar]** |
| **Nivel** | RCM 4 y 1.º de Profesionales en Madrid; en la academia, curso 1 | **[Dato]** y **[Decisión]** |
| **Papel en el currículo** | Obra principal del curso 1: la A en el tramo 5, la B en el 8 y la obra entera en el recital de cierre, de memoria. **No se marca como conocida** | **[Decisión]**, de acuerdo con su corrección |
| **Competencias** | Sonido clásico; melodía por encima del acompañamiento; cambio de posición con dedo guía; media cejilla (B); el cambio de modo Mi mayor ↔ Mi menor; frase y dinámica; memoria | **[Decisión]**, sobre lo que pide la obra. Se confirma con la partitura |
| **Paso previo a implementarla** | Descargar el escaneo de Alier de IMSLP. IMSLP me pide una verificación de persona que no puedo pasar, así que la descarga la hace usted (o la hago en el navegador del panel si usted pasa la verificación) | — |

## 16. Evaluación

**Principio:** la evaluación responde a «¿lo he aprendido de verdad?» sin que el alumno tenga que entender cómo funciona. **Nada bloquea** [regla cerrada].

| Momento | Lo que ve | Lo que pasa por dentro |
|---|---|---|
| **Al acabar un paso** | «Lo tengo, continuar». En los pasos de práctica, también «Necesito más práctica», que lo deja en el atril | Se registra el paso hecho; si era práctica, cuenta como el primer acierto |
| **Paso que corrige la app** (teoría, oído, notas) | Las preguntas y el resultado | Aciertos sobre el total; con el 90 % se da por aprendido (umbral del Plan) |
| **Repaso** | Aparece solo dentro de «Continuar», sin anunciarse como examen: «Toca la parte A de *Lágrima* sin calentar antes». Tres botones: **Salió bien · Regular · No salió** | Es la comprobación en frío de siempre, sin el registro por aspectos. «No salió» programa otro repaso y, si se repite, una lección de refuerzo |
| **Comprobación del tramo** | 3 a 6 tareas cortas y mezcladas: tocar algo del tramo sin calentar, unas preguntas, leer cuatro compases | Confirma el tramo. Si algo falla, se insertan refuerzos en «Continuar»; no se repite el tramo |
| **Cierre del curso** | El recital (tres obras de tres estilos, una o más de memoria) y una prueba corta de técnica, primera vista, oído y teoría. Grabarse, opcional | Cierra el curso. El modelo es la prueba de acceso a Profesionales: tres obras de tres estilos, una de memoria (programación de La Rioja, 4.º de Elementales) **[Dato]** |

**Lo que ya sabe:** al empezar un curso, «Lo que ya sabes» (la evaluación inicial de la Fase 3, por dentro) le deja saltar lo que ya domina. Una obra que ya toca entra como **conocida**: se comprueba, se analiza, se pule o se usa para memoria. Nunca se reaprende.

**Cuántos repasos [Decisión]:** como mucho dos por sesión de «Continuar», y nunca dos seguidos de lo mismo. Lo dominado se repasa cada vez menos (los intervalos de 3, 7, 21, 45, 90 y 180 días que ya calcula `dominio.js`).

## 17. Progresión

- **Dentro de un curso:** el orden de los tramos es pedagógico. El currículo intercala técnica, teoría, lectura, oído y obra en el orden que mejor prepara lo siguiente, no por bloques de materia.
- **Entre cursos:** cada curso empieza con un tramo de partida que da por sabido el cierre del anterior y comprueba lo esencial.
- **Las áreas comunes** (lectura, teoría, oído) avanzan en cada curso a su ritmo. Si van por detrás, se insertan refuerzos, sin frenar el curso.

## 18. Relaciones entre contenidos

Cada paso puede decir **qué necesita**, **qué prepara** y **dónde se aplica**, y cada obra, **en qué pasos se trabaja**. Las relaciones se escriben en el contenido una sola vez y la app calcula el sentido contrario, como ya hace hoy con las obras.

**Las grandes cadenas del programa:**
1. **El cambio de modo:**
   - el tono homónimo y el Si7 que sirve a Mi mayor y a Mi menor (C1);
   - *Lágrima* (Mi mayor → Mi menor, C1);
   - el *Romance* (Mi menor → Mi mayor, el camino inverso, C2);
   - *Adelita* (C3);
   - *Recuerdos de la Alhambra* (La menor → La mayor, C6).
2. **El arpegio:**
   - p-i-m-a, la nota destacada, su *Estudio en Mi menor* (C1);
   - la melodía en *a* del *Romance* (C2);
   - Sor op. 35 n.º 22 (C3);
   - el *Preludio* BWV 999 (C4);
   - el arpegio extendido de *Julia Florida* (C5);
   - el *Estudio n.º 1* de Villa-Lobos (C7).
3. **El dedo guía y los cambios de posición:**
   - *Lágrima* (C1);
   - las cejillas móviles del *Romance* (C2);
   - el portamento de *Adelita* (C3);
   - los cambios rápidos del curso 4;
   - las posiciones altas de *Recuerdos* (C6).
4. **El trémolo:**
   - «Para saber» en el C1 (él ya hace el flamenco);
   - p-a-m-i lento en el C2;
   - velocidad media en el C4;
   - *Recuerdos* en el C6;
   - *Una limosna por el amor de Dios* de Barrios, también llamada *El último trémolo*, en el C7.
5. **La secuencia por quintas:**
   - la cadencia I-IV-V (C1);
   - el círculo de quintas (C2);
   - la *Passacaglia* de Händel (C4: es una secuencia por quintas; su progresión ya la conoce);
   - Bach y Barrios (C5).
6. **La lectura:**
   - las notas de la 1.ª posición (C1), con Sor op. 60 y op. 44;
   - la II y la V (C2);
   - la VII (C3);
   - un preludio barroco leído (C4).
7. **La música antigua:**
   - la *Españoleta* de Sanz y su guitarra barroca (C1);
   - Dowland (C2);
   - la vihuela de Milán y Narváez, con su cifra, que es una tablatura (C3);
   - el estilo barroco (C4).

## 19. Criterios para avanzar

| Nivel | Se da por hecho cuando… | ¿Bloquea? |
|---|---|---|
| Paso | Él dice «Lo tengo», o la app corrige con el 90 % | No |
| Lección | Todos sus pasos hechos; lo de práctica larga puede seguir en el atril | No |
| Tramo | Su comprobación sale | No: «Continuar» sigue, con refuerzos si hace falta |
| Curso | El recital de cierre y la prueba corta | No: el curso siguiente se ve y se puede abrir; «Continuar» lo recomienda al cerrar este |

**«Está bien cuando…»:** cada ejercicio y cada obra dicen en una o dos frases sencillas cómo saber que está bien hecho. Por ejemplo: «la melodía se oye por encima del bajo sin que el bajo desaparezca». Sustituye al criterio y sus dimensiones en pantalla. La lógica de aspectos sigue disponible por dentro si un día se quiere usar.

## 20. Arquitectura futura de la experiencia guiada

### 20.1 Navegación
Carril lateral con cinco entradas: **Curso** (inicio) · **Obras** · **Biblioteca** · **Progreso** · **Ajustes**. Salen **Hoy**, **Diario** y **Profesor**.

### 20.2 Pantallas
- **Curso (inicio):**
  - el curso actual, el tramo y la lección en una frase («Tramo 5 · *Lágrima*, parte A · Lección: el dedo guía»);
  - un único botón principal: **Comenzar curso** o **Continuar**;
  - debajo, el mapa de la ruta (el de la B+), para ver el progreso y abrir cualquier paso;
  - a un lado, el **atril**.
- **Lección:** un paso por pantalla, con puntos de avance arriba, «Atrás» y el botón del paso («Siguiente», «Lo tengo», «Necesito más práctica»). Nada administrativo.
- **Atril:** lo que está practicando en varios días, como mucho 3 cosas (una sección de una obra, un ejercicio largo). Desde aquí se abre para practicar. «Continuar» no espera por el atril, salvo que el paso siguiente lo necesite: entonces lo dice y lleva a él.
- **Obras:** la biblioteca de repertorio, simplificada (punto 15 de su mensaje):
  - título, compositor y nivel;
  - su estado («Sin empezar», «Aprendiendo», «La toco», «En repaso»);
  - partitura y tablatura, audio si lo hay y secciones;
  - «Practicar» y «Sobre esta obra» (texto breve y opcional);
  - en los pasajes donde la digitación importa, su explicación.
  
  Lo de las competencias y las relaciones se queda dentro, como «Se trabaja en el curso 1, tramo 5».
- **Progreso:**
  - los cursos y tramos hechos;
  - lo que toca repasar;
  - un perfil sencillo por áreas (palabras, no números): «Lectura: 1.ª posición» o «Teoría: escalas y triadas».
- **Ajustes:** preferencias, datos, copias, encargo de clase y «Lo que ya sabes» (la evaluación inicial).

### 20.3 El guía (mascota)
- **Su función** (punto 28): introducir lecciones, explicar, dar consejos, avisar de errores frecuentes, decir por qué algo importa y ayudar cuando algo no se entiende.
- **En los datos:** cada paso puede llevar mensajes del guía con un tipo (`introduce`, `consejo`, `error-frecuente`, `por-que`, `contexto`, `animo`) y un momento: al entrar, tras «Necesito más práctica» o al terminar.
- **En la pantalla:** un componente `Guia` con cuatro estados (neutro, explica, avisa, celebra) que hoy se dibuja con un signo provisional. Mañana se cambia por un dibujo o un modelo 3D (Blender) sin tocar los datos.
- **Una tensión que usted decide:** la B+ dice «Archivo de Tinta como identidad, sin convertirlo en ilustración», y un personaje es una ilustración. Lo provisional cumple las dos cosas: una figura sobria de trazo de tinta, sin cara de videojuego. El nombre y el aspecto se deciden más adelante.

### 20.4 Su profesor
- Un **encargo de clase** opcional (qué, hasta cuándo, el tempo o el formato si los pide) que se pone en Ajustes o en una tarjeta del curso.
- Mientras dure, aparece encima de «Continuar»: «Encargo del martes: *Lágrima*, compases 9-12».
- Es la parte útil de la pantalla Profesor. La regla «el profesor tiene prioridad» se cumple sin una pantalla propia.

### 20.5 Diagramas de acordes
- **Componente SVG nuevo:** cuerdas, trastes, la cejilla y la ceja de la guitarra, el traste inicial si no es el 1, 0 para la cuerda al aire y × para la que no se toca.
- **Datos:** `{ cuerdas: [×,0,2,2,1,0], dedos: [-,-,2,3,1,-], cejilla: { traste, desde, hasta }, traste: 1 }`.
- **Color por dedo:** 1, 2, 3 y 4, cada uno con su color de la paleta B+, y la cejilla en el color del dedo 1.
- **El número del dedo va dentro del punto:** el color ayuda, pero nunca es lo único que informa (accesibilidad).
- Los colores concretos se deciden después, en la implementación.

### 20.6 Audio, velocidad y BPM (investigado; se deja para después)
- **Lo que ya existe:**
  - el metrónomo de la app (Web Audio);
  - el sonido de las preguntas de oído;
  - el generador de la vault (`Tablaturas/generar.js` con FluidSynth y GeneralUser GS), que ya convierte una notación en MP3 con guitarra de nailon.
- **Lo mínimo y local:**
  - un campo `audio` en el paso o la obra: `{ tipo: generado | referencia | propio, archivo o enlace, bpm }`;
  - el reproductor nativo del navegador (`<audio>`), que cambia la velocidad sin cambiar la altura (`playbackRate` con `preservesPitch`), sin librerías;
  - los audios generados, pre-renderizados con el generador que ya existe.
- **Las grabaciones de referencia** de intérpretes tienen derechos: se enlazan, no se copian.
- **Recomendación:** dejar preparado el campo y hacer el reproductor en una fase posterior. No retrasa el currículo.

### 20.7 Datos y código (lo que cambiará, para la implementación)
- **Contenido:**
  - una entidad **lección** dentro del tramo;
  - el **paso** con un `tipo` (los de la sección 7) y bloques de contenido (texto, notación, diagrama, audio, preguntas, guía);
  - relaciones `necesita`, `prepara` y `aplicaEn`.
- **Lo que se aprovecha:** las competencias, obras, ejercicios y notaciones actuales se reutilizan.
- **Estado del alumno:**
  - dónde está en cada curso (el último paso);
  - el atril;
  - los encargos.
- **Historial:** un evento `paso` (hecho, más práctica) y el evento `practica` para los repasos. El historial antiguo se conserva y se migra con copia, como siempre.
- **Lógica:**
  - `ruta.js` da «el paso siguiente» en lineal;
  - `dominio.js` programa los repasos;
  - `evaluacion.js` hace «Lo que ya sabes»;
  - `planificador.js` deja de mandar en la pantalla.
- **Antes de implementar nada:** actualizar la copia de la vault (Fase 2) a la Fase 3, con su aprobación.

## 21. Lo que se implementará más adelante
| Qué | Cuándo |
|---|---|
| Implementar este currículo y la experiencia guiada | Cuando usted lo apruebe, por fases y curso a curso (el 1 primero) |
| Reproductor de audio con velocidad | Fase posterior, con el campo ya preparado |
| Mástil interactivo, afinador | Fase 4 del Plan |
| Grabarse desde la app | Fase 5 |
| El aspecto definitivo del guía (dibujo o 3D) | Cuando quiera; los datos ya lo admiten |
| El programa flamenco con el mismo modelo | Fase 6 |
| Revisión independiente de la interfaz | Al terminar la implementación de la experiencia guiada (la de la Fase 3 quedó sin hacer) |
| Fuera de alcance, como antes | Móvil, nube, cuentas, transcripción, IA que escuche, tienda, red social, gamificación y pagos |

---

## Decisiones que necesita tomar usted
1. **Las reglas cerradas que cambian** (tabla 0.3).
2. **Siete cursos y un Horizonte** (3.1), con sus nombres y saltos.
3. **El modelo de evaluación:** «Lo tengo», el atril, los repasos con tres botones, la comprobación del tramo y el recital de cierre (16).
4. **La navegación de cinco entradas** y el encargo de clase en lugar de la pantalla Profesor (20).
5. ***Lágrima*:** versión, edición y papel (15.1).
6. **La *Españoleta*:** transcribirla de la fuente original de Sanz (1674), ver [[curso-1 (v1)]].
7. **Las obras de cada curso**, en sus anexos.
8. **El guía:** función y estructura ahora; aspecto y nombre más adelante (20.3).

**Las decisiones pendientes de la Fase 3** (INFORME-FASE-3, apartado J) quedan así:
- **Las obras eje de los tramos 3 y 4, la edición de la *Españoleta* y la escala de Mi menor:** las resuelve el curso 1 nuevo.
- **Las de la evaluación y la estimación:** las simplifica el apartado 16.
- **Las de la pantalla (metrónomo en teoría, el nombre «mordente», la «a» tirando):** pasan a la implementación del curso 1.

---

## Fuentes de esta fase
- RCM, *Classical Guitar Syllabus, 2018 Edition*. Ficha: https://shop.rcmusic.com/products/classical-guitar-syllabus-2018-edition · Fe de erratas (2023): https://teacherportal.rcmusic.com/getattachment/613d4490-c640-4aa3-b40d-c0bec1484314/rcm-guitar-syllabus-2018-errata.pdf · Recursos: https://teacherportal.rcmusic.com/getattachment/fdd13586-e6f4-47db-bbd7-7da4cb363e50/syllabus-guitar-resources-2018.pdf
- Obras y estudios de los libros RCM 2018, nivel a nivel (Da Capo Academy): https://www.dacapomusic.ca/blog/rcm-classical-guitar-repertoire-and-etudes-all-pieces. El PDF oficial del temario no se pudo descargar (la web lo bloquea), así que las pruebas técnicas y auditivas del RCM no se han comprobado una a una.
- Conservatorio de La Rioja, programación didáctica de guitarra 2025-26 (Elementales y Profesionales, repertorio orientativo por curso, principios metodológicos): https://www.conservatoriorioja.com/pdfs/programaciones-didacticas/instrumentos/guitarra.pdf
- Mater Salvatoris (Madrid), programación de guitarra de Profesionales 2026-27: https://madrid.matersalvatoris.org/wp-content/uploads/programacion-guitarra-ensenanzas-profesionales-2026-2027.pdf
- Castilla y León, Decreto 60/2007 (currículo de Elementales y Profesionales): https://www.educa.jcyl.es/otrasensenanzas/en/ensenanzas-artisticas/planes-estudio/curriculo-ensenanzas-elementales-musica.files/315772-Decreto%2060%202007%20curr%C3%ADculo.pdf
- CPM de Elche, Lenguaje Musical, contenidos mínimos de 1.º y 4.º de Elementales (2026): https://portal.edu.gva.es/cpmelx/wp-content/uploads/sites/1933/2024/09/LENGUAJE-MUSICAL-E.E.-1o.pdf · https://portal.edu.gva.es/cpmelx/wp-content/uploads/sites/1933/2024/09/LENGUAJE-MUSICAL-E.E.-4o.pdf
- *Lágrima*: IMSLP, https://imslp.org/wiki/L%C3%A1grima_(T%C3%A1rrega,_Francisco) · Wikipedia, https://en.wikipedia.org/wiki/L%C3%A1grima_(T%C3%A1rrega) · Sobre las primeras ediciones de Tárrega (Universidad de Denver): https://digitalcommons.du.edu/sbs/vol7/iss1/2
- Dedos guía (Carlevaro, Duncan): Douglas Niedt, https://douglasniedt.com/Tech_Tip_Guide_Fingers.html
- Práctica, memoria y lectura: las del Plan (Soderstrom y Bjork, 2015; Stafford y Haasnoot, 2017; Duke, Simmons y Cash, 2009; Zhukov, 2014), en [[Plan de la academia]].
