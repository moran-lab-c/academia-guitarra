---
status: active
project: personal
type: plan
created: 2026-10-30
---
# Academia de guitarra: currículo maestro, versión 3 (propuesta para su revisión)

**Estado: borrador para revisar. No se ha tocado el código, la interfaz, los datos ni el JSON de producción.** Es la revisión que pidió el 30/10/2026: rehacer la versión 2 para que cada nivel sea de verdad un nivel completo y ninguno quede organizado alrededor de una técnica. La versión 2 está en `v2/` ([[CURRICULO-MAESTRO (v2)]]) y la 1, en `v1/`, con los archivos renombrados para que Obsidian no confunda los enlaces.

| Documento | Qué contiene |
|---|---|
| Este | 1. Auditoría de la versión 2 · 2. Investigación · 3. Filosofía y principios · 4. Perfil de entrada · 5. Cuántos niveles y cómo se llaman · 6. Arquitectura · 7. Matriz global · 8. Progresión técnica · 9. Progresiones de lectura, ritmo, solfeo, teoría, armonía, análisis, oído y repertorio · 10. Experiencia de usuario · 11. Evaluación interna · 12. *Lágrima* · 13. Lo que se conserva del código · 14. Decisiones |
| [[curso-1]] … [[curso-7]] | Cada nivel: ficha, matriz de todas sus áreas (entrada, desarrollo y salida), cómo progresa por dentro, repertorio, tramos, lecciones y pasos, ejercicios y cierre |
| [[cobertura]] | La matriz de cobertura generada desde los cursos y la prueba de que ninguna técnica se concentra en una parte del nivel |
| [[repertorio]] | Cada obra auditada: nivel en las fuentes, qué enseña, qué teoría permite, si entra entera o en fragmento, y qué cambia |
| [[ejercicios]] | Las fichas de los ejercicios y la tabla de cambios de número |

**Etiquetas:**
- **[Dato]** comprobable en una fuente;
- **[Consenso]** práctica pedagógica extendida;
- **[Decisión]** elección mía, revisable;
- **[Estimación]** equivalencia entre sistemas;
- **[Por verificar]** pendiente de comprobar en la partitura o la fuente.

---

## 1. Auditoría de la versión 2

### 1.1 La contradicción principal
La versión 2 decía: «el curso es un nivel, no una asignatura». La frase era correcta y se conserva. Pero el resto del documento la contradecía, y usted tiene razón aunque una parte de su lista no venga de la versión 2.

**Los nombres que cita no son de la versión 2.** «Fundamentos del guitarrista clásico», «Cejilla y posiciones», «Polifonía y mástil completo», «Velocidad y estilos», «Obras de concierto», «Trémolo y gran forma» y «Autonomía» son los de la **versión 1** (en `v1/`). La versión 2 ya los llamaba «Curso N · Nivel N».

**Pero cambiar el nombre no bastó.** Debajo seguía el mismo reparto temático:

| Dónde | Cómo era en la versión 2 |
|---|---|
| El objetivo de cada nivel | Una técnica en titular: el 2, «salir de la primera posición… cejilla completa y móvil»; el 3, «que dos o tres voces suenen»; el 4, «velocidad con control»; el 5, «sostener obras de concierto… el trémolo a tempo»; el 7, «aprender, digitar e interpretar solo» |
| Los avances de «Lo que viene» | Anunciaban el nivel siguiente por su técnica: «El nivel 2 trae la cejilla completa…»; «El nivel 4: velocidad, estilos…» |
| La cejilla | Toda la cejilla completa en los tramos 1-3 del nivel 2; nada antes |
| La velocidad | El maestro decía «en todos, con su referencia», pero en los cursos solo había un tramo de velocidad, el 6 del nivel 4 |
| La polifonía | Concentrada en el nivel 3 (Bach, Narváez, Mertz) |
| El trémolo | Una sola lección por nivel: presencia para decir que estaba, sin progresión dentro del nivel |
| Tramos de asignatura | «La teoría del nivel, entera» (nivel 2), «Lectura y formas» (3), «Rearmonizar, acompañar y escuchar» (7) y «El programa» (6) |
| Niveles altos más finos | 57 pasos en el nivel 6 frente a 187 en el 1; muchas lecciones eran un solo paso: «Obra · X» |
| Postura, sonido, acordes, análisis y digitación | Sin línea propia: la postura y el sonido solo en el nivel 1, los acordes en el 1 y el 2, la digitación desde el 6 |
| Áreas «de cobertura» | Tablatura, creatividad y tocar con otros: un tramo por nivel en casi todos, justo lo que usted pide evitar con el oído y el solfeo |

### 1.2 Contradicciones internas y datos mal usados
1. **Los octavados.** La versión 2 decía «La Rioja los pone en 1.º de Profesionales» (el nivel 2), pero los ponía en el nivel 3. Y la programación de La Rioja solo dice «armónicos», sin especificar. Se retira la atribución: los octavados empiezan en el nivel 3 como **[Decisión]**.
2. **Carlevaro.** La versión 2 citaba a La Rioja, que pone las fórmulas 1-15 en 1.º de Profesionales (nivel 2), y las ponía en el nivel 3. Ahora van al nivel 2, repartidas en tres tandas como en La Rioja **[Dato]**.
3. **La cejilla.** La Rioja la empieza en 3.º de Elementales, y su 4.º pide acordes mayores, menores y de séptima «en perfeccionamiento» **[Dato]**. La versión 2 no daba cejilla completa hasta el nivel 2. Ahora empieza al final del nivel 1, en el V.
4. ***Sueño* de Tárrega.** La versión 2 lo ponía en el nivel 4, citando una fuente (Mater Salvatoris) que lo pone en 1.º de Profesionales. Baja al nivel 2 y es la primera obra de trémolo.
5. **Las escalas del nivel 1.** La Rioja pide en 4.º de Elementales «todas las escalas del modo mayor en dos octavas» **[Dato]**. La versión 2 tenía seis tonalidades, algunas en una octava. Ahora son las mayores del nivel en dos octavas.
6. **La forma sonata.** La versión 2 la enseñaba con dos estudios de Sor (op. 31 n.º 20 y op. 6 n.º 9) sin haber comprobado que lo fueran. Ahora va con obras que la tienen seguro, una en cada escalón: la *Sonatina* de Giuliani (nivel 2), una sonata de Diabelli (4) y la *Sonata* op. 15b de Sor (6).
7. **El oído.** La versión 2 ponía «todos los intervalos melódicos» en el nivel 2. El RCM, al que se equiparan los niveles, los completa en su nivel 8, que aquí es el 5 **[Dato]**. Ahora el oído sigue esa escalera, con más armonía práctica desde el principio.
8. **«Hoy aprenderás a…».** La pantalla de la lección de la versión 2 empezaba así, contra la regla de que no haya «Hoy». Ahora dice «En esta lección…».
9. **El flamenco.** La versión 2 decía que el modo frigio y la cadencia andaluza «se estudian en el programa flamenco». Pero el frigio está en Albéniz, Turina y Falla, que son repertorio clásico. Ahora se enseña en el programa clásico, desde la música clásica, y solo se cita su técnica flamenca como algo que ya sabe (el trémolo y el picado), nunca como contenido.

### 1.3 Lo que se conserva
- **El nivel 1 al detalle:** sonido, melodía y bajo, Mi mayor por dentro, el dedo guía, *Lágrima* en dos partes, el arpegio clásico, Mi menor y la media cejilla, la música antigua y la primera obra leída.
- **La teoría pegada a la guitarra:** el Si7 que sirve a Mi mayor y a Mi menor; el análisis de su *Estudio en Mi menor*.
- **Las cadenas que atraviesan los niveles:**
  - el cambio de modo: *Lágrima* → *Romance* → *Adelita* → *Recuerdos* → *Capricho árabe*;
  - el bajo que vuelve: *Romanesca* → *Guárdame las vacas*; *Españoleta* → *Folías*;
  - Händel: la *Passacaglia* → Giuliani op. 107;
  - Barrios: el *Preludio saudade* → *La Catedral*.
- **Las reglas:** los pasos sin plantilla; las obras durante el nivel; nada bloquea; no se reaprende lo que ya sabe; la tablatura permanente; *por verificar* para lo dudoso.
- **La experiencia de usuario de la versión 2**, con los cambios del apartado 10.
- **Casi todo el repertorio y todos los ejercicios.** Los cambios de nivel están en [[repertorio]] y en [[ejercicios]].

### 1.4 Resumen
| Conservo | Cambio | Retiro | Añado |
|---|---|---|---|
| El nivel 1, las cadenas, los ejercicios, casi todo el repertorio, la experiencia de usuario y las reglas | Los objetivos y los avances temáticos; el reparto de cada técnica, que ahora va por todo el nivel; el oído; el nivel de once obras | Los tramos de asignatura; las afirmaciones sin comprobar (octavados en La Rioja, sonata en dos estudios de Sor); «Hoy» en la lección | Matriz de entrada, desarrollo y salida en cada nivel; líneas de postura, sonido, acordes, análisis y digitación; nueve obras nuevas; la prueba de reparto por tercios |

---

## 2. Investigación

**Lo que se ha leído para esta versión, y para qué ha servido:**

| Fuente | Qué aporta | Qué decisión cambia |
|---|---|---|
| **La Rioja, programación de guitarra 2025-26**, leída otra vez entera **[Dato]** | Cada curso de Profesionales repite la misma lista de técnicas: arpegios, acordes, apagadores, rasgueados, trémolo, desplazamientos, ligados, glissando, ornamentos, cejillas, extensiones, portamento, pizzicato, escalas, armónicos, vibrato, tambora, campanelas, golpes y la interpretación (dinámica, agógica, fraseo, articulación, digitación). Cambia la profundidad, no la lista. Y uno de sus principios: «La música se enseña haciendo música» | **Toda técnica está en todos los niveles** desde que aparece. Es la base del apartado 8 |
| La misma, en Elementales y en las listas de repertorio de 1.º a 6.º **[Dato]** | Cejilla desde 3.º de Elementales; todas las escalas mayores en dos octavas en 4.º; acompañar canciones con acordes en 3.º; Carlevaro 1-15 en 1.º de Profesionales; ligados de tres notas en 4.º de Elementales; la lista de obras de cada curso | La cejilla al nivel 1; Carlevaro al 2; acompañar al 1; nueve obras nuevas; la colocación de *Canarios*, *Sueño*, Brouwer VI, la *Sonatina* de Giuliani, Diabelli, Mudarra y la *Sonata* de Sor |
| **RCM, requisitos de oído de 2024** (anexo que sustituye a los del temario de 2018) **[Dato]** | Nivel a nivel: qué intervalos, acordes y progresiones se reconocen | La escalera de oído (apartado 9.6) |
| **ABRSM, temario de guitarra de 2019**, pruebas de oído de los grados 1-8 **[Dato]** | Cantar ecos; cantar notas leídas; la voz de arriba de dos (grado 6), la de abajo (7) y la grave de tres (8); cadencia perfecta o imperfecta (6), rota (7) y plagal con inversiones (8); ¿adónde modula? (7); estilo y época (5); textura y estructura (6) | El solfeo y el oído de los niveles 1 a 5, ligados a sus obras |
| **BOE, Orden ECI/1890/2007**, currículo de las Profesionales del Ministerio (Ceuta y Melilla) y su horario de guitarra **[Dato]** | En cada curso el alumno tiene a la vez instrumento, lenguaje musical (1.º-2.º), conjunto, armonía (3.º-4.º), análisis o fundamentos de composición e historia (5.º-6.º) | Un curso de conservatorio es exactamente un nivel completo: todas las materias a la vez, cada una a su altura. La teoría se completa hacia el nivel 2, la armonía crece en el 4 y el 5 y el análisis manda en el 6 y el 7 |
| **Trinity College**, pruebas complementarias **[Dato]** | La primera vista va unos dos grados por debajo del examen; la improvisación es una prueba reconocida | Las obras leídas vienen de uno o dos niveles por debajo; la creatividad tiene su línea propia |
| Las de la versión 2 (ABRSM en escalas y primera vista, RCM y Da Capo en repertorio, Mater Salvatoris, Lenguaje Musical de Elche, Carlevaro, Niedt) | Lo mismo que en la versión 2 | Se mantienen |

**Lo que comparten todos los sistemas [Consenso]:**
- cada nivel trae a la vez obras de varias épocas, técnica, lectura y oído;
- la teoría avanza con el instrumento;
- ninguno organiza un nivel alrededor de una técnica.

**Lo que es propio de esta academia [Decisión]:**
- la teoría, la armonía y el oído van dentro de la guitarra, explicados desde la obra que se toca;
- la tablatura es permanente;
- se parte de su nivel real;
- la creatividad, la historia y tocar con otros tienen su propia línea.

---

## 3. Filosofía y principios

**La regla que manda sobre todo lo demás:**

> **Un curso es un nivel completo de formación del guitarrista clásico. NO EXISTEN CURSOS DEDICADOS A UNA TÉCNICA.** No hay curso de cejilla, de polifonía, de velocidad, de trémolo, de obras de concierto, de armonía ni de lectura. Las técnicas y las materias aparecen y evolucionan dentro de los niveles.

**Los principios:**
1. **Todas las áreas en todos los niveles**, con la profundidad de cada uno. Lo que cambia de un nivel a otro es la profundidad, la dificultad y el repertorio, nunca la lista de áreas. Lo comprueba la matriz de [[cobertura]].
2. **Cada técnica, por todo el nivel.** Cada técnica aparece al principio, a la mitad y al final de cada nivel, salvo el primer contacto en el nivel 1. Se comprueba por tercios en [[cobertura]].
3. **Ninguna técnica aparece sin preparación.** Cada una tiene su escalón previo (apartado 8).
4. **Se aprende guitarra tocando guitarra.** Cada tramo tiene su música desde la primera lección. Las obras largas entran primero en fragmento. El cierre de un nivel reúne obras ya tocadas.
5. **La teoría sirve para entender lo que se toca.**
   - Si suena una progresión, se explican sus acordes.
   - Si se toca una tonalidad, su escala, sus grados y sus funciones.
   - Si aparece una dominante, qué hace; si modula, adónde y cómo.
   - Si una obra pide una técnica, qué relación tiene con la música.
   - Puede haber lecciones solo de teoría, pero siempre dentro de un tramo con música.
6. **El oído y el solfeo progresan de verdad**, con una escalera calibrada (apartado 9) y ligados a las obras del tramo: se canta la melodía antes de tocarla y se reconocen al oído los acordes de la obra.
7. **La digitación se explica cuando importa**, con su razón profesional: dedo guía, dedo fijo o común, preparación, economía, continuidad de voces, legato, color y cambios difíciles. Lo obvio no se explica.
8. **Partitura, tablatura o las dos.** La tablatura es permanente. La partitura manda cuando el objetivo es leer, y la tablatura basta cuando el objetivo es la técnica. La lectura nunca bloquea.
9. **No se reaprende lo que ya sabe**: pasos ◇ con una prueba corta.
10. **La estructura no sigue plantilla.** Un paso puede ser una explicación, una demostración, un ejercicio, una lectura, un ritmo, una pregunta de oído, una progresión, un análisis, una aplicación, una obra, un contexto o una escucha.

---

## 4. Perfil de entrada
- **Técnica y repertorio:** entre RCM 3 y 4. Arpegio, ligados, apoyando y acordes abiertos, aprendidos por tablatura. Trémolo y picado flamencos.
- **Lectura de pentagrama:** Preparatorio.
- **Teoría y oído:** a medias.
- **Obra conocida:** su *Estudio en Mi menor*. *Lágrima* no la sabe tocar.
- **Consecuencia [Decisión]:** el nivel 1 empieza en su técnica real y pone al día la lectura, la teoría y el oído dentro de las mismas obras. Por eso es el más largo.

---

## 5. Cuántos niveles y cómo se llaman

### 5.1 Siete, comprobado otra vez
No he dado por bueno el siete de la versión 2. He contado los escalones desde su entrada en cuatro sistemas:

| Sistema | Su entrada | Escalones hasta el final de la formación previa a la superior | Cuántos |
|---|---|---|---|
| RCM | nivel 3-4 | 4, 5, 6, 7, 8, 9 y 10 | 7 |
| ABRSM | grado 3-4 | 4, 5, 6, 7, 8, ARSM y DipABRSM | 7 |
| Conservatorio (La Rioja) | 3.º-4.º de Elementales | 4.º de Elementales y 1.º a 6.º de Profesionales | 7 |
| Conservatorio (BOE) | — | Cada curso de Profesionales tiene su propio horario de materias | Confirma que cada escalón es un curso entero |

**Las alternativas, y por qué no:**
- **Seis, juntando los niveles 6 y 7.** No, porque entre ellos hay un salto real: del *Capricho árabe* y la primera digitación propia a *Una limosna*, *Asturias* y montar solo una obra nueva. Los tres sistemas los separan.
- **Ocho, partiendo el nivel 1, que es el más largo.** No: lo que lo alarga es la puesta al día de la lectura, la teoría y el oído. Sacarla a un curso aparte crearía justo un curso de lectura y teoría, que es lo que la regla prohíbe. El nivel 1 se queda largo y salta lo que ya sabe con los pasos ◇.
- **Más niveles en general.** Partirían escalones reconocidos sin un salto de competencia.

**Los saltos de competencia, nivel a nivel (lo que cada uno puede hacer y el anterior no):**

| Nivel | Equivale a **[Estimación]** | El salto |
|---|---|---|
| 1 | RCM 4 · ABRSM 4 · 4.º de Elementales | De tocar por tablatura a tocar, leer, entender y oír lo mismo; sonido clásico; recital con una obra de memoria |
| 2 | RCM 5 · ABRSM 5 · 1.º de Profesionales | Hasta la VII con cejilla en cualquier traste; vibrato y trémolo en una obra; teoría básica completa; las sextas y el V7 al oído |
| 3 | RCM 6 · ABRSM 6 · 2.º de Profesionales | Tres voces y hasta la IX; trino y octavados; primeras ráfagas; dominantes secundarias; cantar la voz de arriba de dos |
| 4 | RCM 7 · ABRSM 7 · 3.º de Profesionales | Todo el mástil con velocidad controlada; *Recuerdos* empezada; modos, suite, sonata y secuencias; la cadencia rota y la modulación al oído |
| 5 | RCM 8 · ABRSM 8 · 4.º de Profesionales | Obras de concierto de cuatro a ocho minutos; *Recuerdos* entera; cuatro voces; sexta aumentada; progresiones de cuatro acordes al oído |
| 6 | RCM 9 · ARSM · 5.º de Profesionales | Obras mayores; digitación y análisis propios; el siglo XX y el frigio; transcribir de oído |
| 7 | RCM 10 · DipABRSM · 6.º de Profesionales | Autonomía: montar, digitar y presentar solo; *Una limosna*, *Asturias*; recital propio |

**Cuánto dura cada nivel [Estimación]:** en el conservatorio, un curso. Para él, entre nueve y dieciocho meses, según lo que practique. La app no pone plazos.

### 5.2 Los nombres
**Mi propuesta [Decisión]:** **Nivel 1, Nivel 2… Nivel 7**, sin subtítulo.
- Un nombre como «Fundamentos» describe mal el nivel 1: él no es principiante.
- «Básico, Intermedio I, Intermedio II, Avanzado I, II y III» son seis etiquetas para siete niveles, y las tres últimas no dicen nada.
- Un número no sugiere ninguna técnica ni ninguna materia.
- En los datos y en el código se sigue llamando `curso`: solo cambia lo que se ve.

La equivalencia (por ejemplo, «≈ 2.º de Profesionales») se ve en Progreso, no en el nombre.

---

## 6. Arquitectura
- **Programa clásico → Nivel (el `curso` de los datos) → Tramo → Lección → Paso.**
- **El tramo es una unidad de formación musical, no una asignatura [Decisión].**
  - Se nombra por su música: «Tramo 7 · Mi menor y la parte B de *Lágrima*».
  - Mezcla las áreas porque pertenecen al mismo aprendizaje. Un tramo puede partir de una obra (una técnica, una posición, el sonido, su armonía, la lectura, el fraseo y su aplicación) o de una tonalidad (su escala, su arpegio, su progresión, el oído, la lectura y una pieza).
  - No hace falta que cada tramo lo mezcle todo; el nivel entero, sí.
  - Hay de 10 a 14 tramos por nivel, cada uno con entre 2 y 7 lecciones.
- **La lección** enseña una cosa de una sentada. Se nombra por lo que enseña. Lleva entre llaves las áreas que trabaja, solo para el diseño y la matriz; el alumno no ve áreas ni asignaturas.
- **El paso** es una pantalla, sin plantilla.
- **El cierre del nivel** es un tramo con el recital (obras ya tocadas, de varias épocas), una prueba corta y «Lo que viene», que anuncia el nivel siguiente área por área.

**Leyenda de los pasos** (en los cursos, cada paso es una línea):
- **Tipos:** Explicación · Cómo se hace · Ejercicio · Lectura · Primera vista · Ritmo · Solfeo · Escucha · Oído · Teoría · Acordes · Progresión · Análisis · Digitación · Aplicación · Obra · Repaso · Contexto · Tablatura · Diapasón · ¿Sabías que…? · Consejo del profesor · Fíjate en… · Esto te sirve para… · Comprobación del tramo.
- **Recursos:** 𝄞 partitura · T tablatura · ⌗ diagrama de acordes (un color por dedo) · ♪ audio · ⏱ metrónomo · ✎ preguntas que corrige la app.
- **◇:** si ya lo sabe, una prueba corta lo da por hecho, sin pantallas de evaluación.
- **↩:** el paso necesita algo de antes; «Continuar» lo dice y lleva a ello.

---

## 7. Matriz global de progresión
Lo que domina al salir de cada nivel, área por área. **Se genera** desde la última columna de la matriz de cada curso, así que no puede contradecirlos. Cada fila es una progresión de principio a fin del programa.

<!-- GLOBAL:inicio -->
| Área | Nivel 1 | Nivel 2 | Nivel 3 | Nivel 4 | Nivel 5 | Nivel 6 | Nivel 7 |
|---|---|---|---|---|---|---|---|
| **Postura y ergonomía** | Toca 20 minutos sin tensión en hombros ni pulgar | Una cejilla de un minuto sin dolor | Toca en la IX sin torcer la muñeca | Diez minutos de programa sin tensión acumulada | Toca *Recuerdos* dos veces seguidas sin tensión | Un programa de veinte minutos sin molestias | Treinta minutos de recital sin molestias |
| **Sonido** | Una nota larga con sonido redondo; elige el color de una frase | La melodía del *Romance* por encima de los tresillos | Tres voces con tres volúmenes | Una escala rápida con el mismo sonido que lenta | Un plan de color escrito y cumplido | Explica y toca tres colores de una misma frase | Grabaciones en las que reconoce su sonido |
| **Mano derecha** | Arpegio con la melodía destacada a ♩=72 en corcheas | Arpegio con melodía en *a* a ♩=72 en tresillos | Ráfagas de cuatro notas limpias; el rasgueado de los *Canarios* | Una escala de tres octavas a la velocidad de referencia del grado 7 | El arpegio de *Julia Florida* igual en todas las cuerdas | El *Estudio n.º 1* con el arpegio igual | *Una limosna* entera y *Asturias* a tempo |
| **Mano izquierda** | Cambia de acorde y de posición sin cortar el sonido | Un cambio de posición que no se oye | Sostiene una voz mientras las otras se mueven | Un cambio rápido que no corta la frase | Sostiene cuatro voces en un coral | Sostiene cuatro voces con cambios de posición | Monta la izquierda de una obra nueva sin guía |
| **Escalas** | Las escalas mayores del nivel en dos octavas a una velocidad propia anotada | Las escalas del nivel con cambio de posición y velocidad anotada | Mi mayor en tres octavas a una velocidad anotada | Las escalas del nivel con su velocidad anotada | Cualquier escala a la velocidad de referencia del grado 8 | Las escalas de la *Sonata* de Sor a tempo | Las escalas de las variaciones a tempo |
| **Arpegios** | Triadas de Mi, Sol y La, dos octavas | Los dos arpegios de séptima, de memoria | Arpegio de Mi mayor en tres octavas | El arpegio del BWV 999 sin huecos | Los arpegios del nivel a tempo | Los arpegios del nivel con su velocidad anotada | Los arpegios del nivel con su velocidad anotada |
| **Ligados y ornamentos** | Ligados iguales de volumen; el mordente de la *Españoleta* a tempo | Ligados de tres notas iguales | Trino regular a ♩=60 en fusas | Ligados de cuatro notas iguales a tempo | Ligados de concierto sin perder el pulso | El *Estudio del ligado* a tempo | Ornamentos que puede justificar con fuentes |
| **Acordes y cejilla** | Media cejilla limpia; una cejilla completa breve en el V | Cuatro acordes con cejilla seguidos y limpios | Una cejilla parcial que no corta ninguna voz | Tres cejillas seguidas sin hueco | La cejilla del VII bajo el trémolo de *Recuerdos* | Una cejilla larga que no se apaga | Elige cejilla o cuerda al aire y lo justifica |
| **Posiciones y diapasón** | Nombra cualquier nota de la 1.ª posición y sabe en qué posición está | Encuentra una nota en tres sitios | Encuentra cualquier nota hasta el traste XII | Encuentra cualquier nota de todo el mástil | Toca una frase en dos posiciones y elige | Elige posición y la justifica por el color | Dos digitaciones de un pasaje con su porqué |
| **Trémolo** | Tres notas iguales a ♩=40 en semicorcheas | Una obra corta de trémolo a tempo lento y regular | Trémolo regular sobre I-IV-V-I | Esa parte a tempo medio, regular | *Recuerdos* de memoria, con el trémolo regular | La primera sección de *Una limosna* con el bajo ligado | La obra entera, regular y cantada |
| **Armónicos y otros recursos** | Los armónicos de su *Estudio en Mi menor* claros | Vibrato en una nota larga cuando la frase lo pide | Una escala de una octava en octavados | La melodía en octavados de Llobet | Un arpegio con armónicos artificiales | Los colores de Falla y Turina con intención | Cada efecto con una intención |
| **Polifonía** | Dos planos con volúmenes distintos | Ninguna voz se corta antes de tiempo | Tres voces en las que se distingue cada una | Distingue y hace oír la imitación | Hace oír las voces escondidas del BWV 1007 | Hace oír la entrada de cada voz en Mudarra | Las voces de la *Fantasía n.º 7* claras |
| **Lectura y primera vista** | Lee a primera vista 8 compases fáciles en 1.ª posición | Primera vista de 8 compases, como el grado 4 del ABRSM | Primera vista de 8-12 compases, como el grado 5 del ABRSM | Primera vista como el grado 6 del ABRSM (9/8, 5/8 y 5/4) | Primera vista como el grado 7 del ABRSM (7/8 y 7/4) | Primera vista como el grado 8 del ABRSM | Prepara y toca una pieza nueva en cinco minutos |
| **Tablatura** | Pasa una frase de tablatura a partitura | Pasa cuatro compases de un sistema a otro | Lee unos compases de Milán en su cifra original | Compara una cifra original con la transcripción | Anota en tablatura su digitación de un pasaje | Su digitación de un pasaje, en tablatura, clara para otro | Lee unos compases del original |
| **Ritmo** | Cuenta en voz alta mientras toca | Tresillos y corcheas mezclados sin acelerar | La hemiolia de Lauro a tempo | Un grupo de cinco o siete sin acelerar | Dos contra tres a tempo | El recitativo del *Capricho* con pulso interior | El *Fandanguillo* con sus cambios de compás |
| **Solfeo** | Canta la melodía de *Lágrima* afinada | Canta una línea corta leída | Canta una melodía de ocho compases leída | Canta el bajo de una progresión | Canta el bajo mientras toca la melodía | Canta una frase leída sin ayuda | Canta una frase antes de decidir su digitación |
| **Teoría** | Construye una escala y su triada en cualquier tonalidad del nivel | La teoría de un grado 5 del ABRSM | Explica la forma de cada obra del nivel | Explica la forma de una sonata clásica | Explica cómo está hecha una obra de variaciones | Explica el lenguaje de Falla y de Villa-Lobos | El análisis completo de *La Catedral* |
| **Armonía** | Dice qué función tiene cada acorde de sus obras | Armoniza una melodía de ocho compases | Encuentra una modulación en una obra | Encuentra una napolitana y una secuencia en una obra | Encuentra una sexta aumentada y una modulación lejana | Encuentra una cadencia andaluza y un paralelismo en una obra | Rearmoniza una frase y explica qué cambia |
| **Análisis** | Hace el mapa de una obra corta | Explica la forma de la *Sonatina* de Giuliani | El mapa armónico y formal de la *Bourrée* | El análisis de un primer movimiento clásico | El mapa de *Julia Florida* con sus puntos de apoyo | El análisis del BWV 997, hecho por él | Explica qué hace distinta cada versión de una obra |
| **Oído** | Reconoce mayor o menor, los intervalos del nivel y la calidad de una triada; repite de oído una melodía corta | Reconoce las 6.ª, el V7 y si la música va al IV o al V; dice de qué época es una obra | Reconoce las 2.ª, la séptima disminuida y si una cadencia termina o queda abierta; toca de oído la voz de arriba de dos | Reconoce las 7.ª, la cadencia rota y adónde modula una frase; toca de oído la voz de abajo de dos | Reconoce el tritono, las progresiones de cuatro acordes y las cadencias con inversión; toca de oído la voz grave de tres | Reconoce las cuatriadas y su inversión; transcribe el bajo de una variación | Reconoce las 9.ª y las cuatriadas de séptima; sigue la forma y las modulaciones de una obra entera |
| **Musicalidad** | Una frase que sube y se resuelve | Un crescendo largo que llega a su sitio | Una danza barroca y una mazurca con su carácter | Toca una obra de cada época con su estilo | Una obra larga con un solo arco | Explica en dos frases la interpretación de cada obra del programa | Un recital que suena a él |
| **Interpretación y memoria** | Recital corto con *Lágrima* de memoria | Recital con dos obras de memoria | Recital grabado de tres épocas | Diez minutos sin parar pase lo que pase | Toca el programa ante alguien | El programa, grabado | Recital personal de veinticinco a treinta minutos |
| **Repertorio** | Once obras cortas de cinco épocas, tocadas enteras | Doce obras de cinco épocas, dos de ellas leídas | Once obras, de la vihuela a Lauro | Doce obras, con una sonata y la primera parte de *Recuerdos* | Trece obras de concierto de cinco épocas | Doce obras mayores y un dúo | Nueve obras de final de Profesionales |
| **Digitación** | Explica la digitación de un cambio de *Lágrima* | Elige entre dos digitaciones y dice por qué | Explica por qué una voz va en una cuerda y no en otra | Elige la digitación más rápida y dice por qué | Explica por qué una edición digita distinto que otra | Digita un pasaje y lo defiende con los criterios | Una obra entera digitada por él |
| **Cómo estudiar** | Estudia una frase nueva sin ayuda | Usa el metrónomo para medir, no para empujar | Monta una obra a tres voces voz a voz | Sube un pasaje de tempo sin perder limpieza | Prepara una obra larga por secciones | Su plan, escrito y cumplido | Monta el *Estudio n.º 11* sin pasos guiados |
| **Creatividad** | Improvisa frases que suenan a pregunta y respuesta | Tres variaciones reconocibles de una melodía | Ornamenta una repetición en estilo | Cuatro diferencias propias sobre la romanesca | Un preludio propio de ocho compases | Una variación propia sobre Händel | Su arreglo de una canción |
| **Tocar con otros** | Mantiene el pulso de la pista | Toca su voz sin perder la del otro | Acompaña sin perder la melodía grabada | Lleva la melodía o el bajo de una danza en dúo | Respira con quien canta | Lleva y acompaña según el momento del dúo | Acompaña una voz grabada con su arreglo |
| **Historia y estilo** | Sitúa cada obra en su época | Distingue al oído una obra clásica de una romántica | Reconoce el estilo de cada obra del nivel | Reconoce al oído Renacimiento, Barroco, Clasicismo y Romanticismo | Explica qué hace distinta cada obra del programa | Sitúa cada obra y explica qué la hace de su época | Presenta cada obra en dos frases |
<!-- GLOBAL:fin -->

---

## 8. Progresión técnica
Cómo crece cada técnica, nivel a nivel. **La columna «Se prepara con» demuestra que ninguna aparece de repente.** En negrita, el nivel en que empieza.

| Técnica | 1 | 2 | 3 | 4 | 5 | 6 | 7 | Se prepara con |
|---|---|---|---|---|---|---|---|---|
| Apoyando | **Sonido igual; la melodía** | La *a* apoyando dentro del arpegio | Apoyando por voces | En escalas rápidas | *p* apoyando con la melodía (Villa-Lobos) | Apoyando o tirando según el color | Elección propia | Lo que ya sabe (◇) |
| Tirando y preparación | **Preparación; nota destacada** | a-m-i; Carlevaro 1-15 | Tres planos | Arpegio continuo rápido | Arpegio extendido | Villa-Lobos | *Allegro solemne* | Su arpegio (◇) |
| Pulgar | **El bajo; melodía y bajo** | Pulgar melódico; apagar bajos | *p* con voz propia | Los bajos del arpegio continuo (BWV 999) | La melodía en el bajo | *p* de concierto | El pulgar de *Asturias* | Lo que ya sabe |
| Arpegios | **Giuliani op. 1; triadas de dos octavas** | Melodía en *a*; séptimas de dominante y disminuida | En posición; tres octavas | Continuo con cambio de acorde | Extendido; los del grado 8 | Villa-Lobos | Barrios y Villa-Lobos | Su arpegio (◇) |
| Escalas y velocidad | **Mayores en dos octavas; menores; sextas; velocidad anotada** | Con cambio de posición; décimas y octavas | Tres octavas; terceras; **primeras ráfagas** | Ráfagas largas; ritmos; a-m-i | Todas; cromática en octavas | De concierto clásicas | Velocidad de concierto | La alternancia y los cruces del nivel 1 preparan las ráfagas del 3 |
| Ligados | **Dos notas; dedo fijo** | Tres notas; dobles y mixtos | Tres y cuatro | Largos y rápidos; escalas ligadas; glosas | Cromáticos por todo el mástil | *Estudio del ligado*; el bajo ligado | Dentro del trémolo | Lo que ya sabe (◇) |
| Ornamentos | **Mordente** | La apoyatura, explicada en el minueto | Trino medido; adornos de Sanz | Ornamentación barroca | El trino de Scarlatti | Ornamentar en estilo (Weiss) | Históricamente informados | Los ligados preparan cada ornamento |
| Cejilla | Media cejilla; **completa en el V** | En todos los trastes; formas móviles | Parciales; bajo el trémolo, lenta | Encadenadas; con extensión; bajo el trémolo, a tempo medio | Altas bajo el trémolo a tempo | Sostenidas en cuatro voces; con scordatura | Como decisión de digitación | La media cejilla prepara la del V; la del V, la de los trastes difíciles |
| Cambios de posición | **Dedo guía hasta la V-VII** | Sustitución, deslizamiento y salto; hasta la VII | Hasta la IX | Rápidos; hasta el XII | Cantando; todo el mástil | Por el color | Propios | El dedo guía de *Lágrima* |
| Extensiones | Dedo común | **Pequeñas (1-4)** | Mantenimiento | Mayores; con cejilla | En el arpegio extendido | En cuatro voces | Propias | El dedo común del nivel 1 |
| Acordes | **Abiertos mayores, menores y de séptima; dedo común** | Formas móviles; cuatriadas | En la polifonía; progresiones de danza | Napolitana; secuencias | Sexta aumentada; cuatro voces | Paralelos; cadencia andaluza | Rearmonizar; arreglar | Lo que ya sabe (◇) |
| Rasgueado | **Sencillo, para acompañar** | Clásico, con varios dedos | Barroco (*Canarios*) | Mantenimiento (ninguna obra del nivel lo pide) | Efectos del siglo XX (Brouwer) | Turina | *Fandanguillo* | El acompañamiento del nivel 1 |
| Trémolo | **Primer contacto, en cuerdas al aire** | Con bajo que cambia; *Sueño* | Sobre una progresión; con cejilla, lento | Con ráfagas; *Recuerdos*, la parte en La menor | *Recuerdos* entera, a tempo | Con el bajo ligado; *Una limosna*, primera sección | *Una limosna* entera | El trémolo flamenco que ya hace (otra técnica, la misma mano) |
| Armónicos | **Naturales en XII, VII y V** | IV, IX y XIX; afinar | **Octavados** | Octavados en una melodía | Artificiales | Como resonancia (Falla) | Al servicio de la obra | Los naturales preparan el octavado, y este, el artificial |
| Vibrato | Escucharlo en *Lágrima* | **Empieza (*Romance*)** | En *Adelita* | Según el estilo (Llobet) | El del lied | Color propio | Propio | El oído del nivel 1 |
| Glissando y portamento | El signo, en la tablatura | **Glissando y arrastre** | **Portamento expresivo** | Portamento romántico (*Marieta*) | Glissando expresivo (Villa-Lobos) | Elección propia | Elección propia | El dedo guía, que ya desliza |
| Campanela | Dejar sonar cuerdas al aire | — | **Escala en campanela; *Canarios*** | Santiago de Murcia | Mantenimiento | Mudarra (el arpa) | Propia | Apagar y dejar sonar voces, en el nivel 1 |
| Polifonía | **Melodía y bajo** | Dos voces independientes | Contrapunto a dos y tres voces | Imitación | Implícita (Bach); cuatro voces | Cuatro voces sostenidas; fantasía imitativa | De concierto | Los dos planos del nivel 1 |
| Efectos | Tasto y ponticello | **Pizzicato** | **Tambora y golpe** | Campanela como color | Efectos del siglo XX | Turina | *Asturias*, *Fandanguillo* | El color del nivel 1 |
| Scordatura | — | — | — | — | Transportar; todo el mástil | **La 6.ª en Re (*Capricho árabe*)** | En el repertorio | El diapasón completo del nivel 5 |

---

## 9. Progresiones de las áreas de comprensión y de repertorio
Las tablas salen de la columna «Qué desarrolla» de cada nivel (generadas, como la matriz global). Debajo de cada una, de dónde sale la calibración.

### 9.1 Lectura y primera vista
<!-- AREA:Lectura y primera vista:inicio -->
**Lectura y primera vista**

| Nivel | Qué desarrolla | Qué domina al salir |
|---|---|---|
| 1 | 1.ª posición en las seis cuerdas; sostenidos y un bemol; una y dos voces; la primera obra leída | Lee a primera vista 8 compases fáciles en 1.ª posición |
| 2 | Posiciones II y V; bemoles; acordes escritos; dos obras leídas enteras | Primera vista de 8 compases, como el grado 4 del ABRSM |
| 3 | Posición VII; tres voces; ornamentos escritos; obras leídas | Primera vista de 8-12 compases, como el grado 5 del ABRSM |
| 4 | Posición IX; tres y cuatro alteraciones; un preludio barroco leído; clave de fa | Primera vista como el grado 6 del ABRSM (9/8, 5/8 y 5/4) |
| 5 | Todas las posiciones; un preludio de chelo leído; un sistema de piano | Primera vista como el grado 7 del ABRSM (7/8 y 7/4) |
| 6 | Una obra mayor aprendida solo con la partitura; primera vista con dos voces | Primera vista como el grado 8 del ABRSM |
| 7 | Cualquier obra del nivel 6 desde la partitura; preparar una pieza en cinco minutos; leer una reducción de piano | Prepara y toca una pieza nueva en cinco minutos |
<!-- AREA:Lectura y primera vista:fin -->
**Calibración:** la primera vista sigue los parámetros del ABRSM, del grado 1-3 en el nivel 1 al grado 8 en el 6 **[Dato]**. Las obras leídas vienen de uno o dos niveles por debajo **[Decisión]**, como en Trinity **[Dato]**.

### 9.2 Tablatura
<!-- AREA:Tablatura:inicio -->
**Tablatura**

| Nivel | Qué desarrolla | Qué domina al salir |
|---|---|---|
| 1 | Tablatura con ritmo; sus símbolos; la cifra de Sanz | Pasa una frase de tablatura a partitura |
| 2 | Traducir de tablatura a partitura y al revés; la tablatura de laúd (¿Sabías que…?) | Pasa cuatro compases de un sistema a otro |
| 3 | La cifra de la vihuela; la cifra de Sanz con rasgueos | Lee unos compases de Milán en su cifra original |
| 4 | La cifra de Narváez; tablaturas italianas de la guitarra barroca (¿Sabías que…?) | Compara una cifra original con la transcripción |
| 5 | La cifra de *Conde Claros*; la tablatura para anotar digitaciones propias | Anota en tablatura su digitación de un pasaje |
| 6 | Anotar sus digitaciones propias; la cifra de Mudarra | Su digitación de un pasaje, en tablatura, clara para otro |
| 7 | Leer el original de Dowland en tablatura francesa de laúd | Lee unos compases del original |
<!-- AREA:Tablatura:fin -->

### 9.3 Ritmo y solfeo
<!-- AREA:Ritmo:inicio -->
**Ritmo**

| Nivel | Qué desarrolla | Qué domina al salir |
|---|---|---|
| 1 | Figuras hasta la semicorchea; puntillo; 2/4, 3/4, 4/4 y 6/8; síncopa; hemiolia | Cuenta en voz alta mientras toca |
| 2 | Tresillo; 3/8 y 2/2; síncopa completa; silencios a contratiempo | Tresillos y corcheas mezclados sin acelerar |
| 3 | Puntillo de corchea; 9/8 y 12/8; la hemiolia del vals venezolano; bajo y melodía con ritmos distintos | La hemiolia de Lauro a tempo |
| 4 | Grupos irregulares; cambios de compás; 5/8 y 7/8 | Un grupo de cinco o siete sin acelerar |
| 5 | Dos contra tres; 7/4; rubato sobre un pulso firme | Dos contra tres a tempo |
| 6 | Ritmo libre y recitativo; agógica de danza; la habanera; el compás de amalgama de las soleares | El recitativo del *Capricho* con pulso interior |
| 7 | Agógica propia; los cambios de compás de Turina; el ritmo ternario del fandango | El *Fandanguillo* con sus cambios de compás |
<!-- AREA:Ritmo:fin -->
<!-- AREA:Solfeo:inicio -->
**Solfeo**

| Nivel | Qué desarrolla | Qué domina al salir |
|---|---|---|
| 1 | Cantar 1-3-5; ecos de dos compases; cantar una melodía antes de tocarla | Canta la melodía de *Lágrima* afinada |
| 2 | Cantar los intervalos de la escala; cantar seis notas leídas; dictado rítmico | Canta una línea corta leída |
| 3 | Cantar una melodía leída con acompañamiento; cantar la voz superior de dos voces | Canta una melodía de ocho compases leída |
| 4 | Cantar la voz inferior de dos; cantar el bajo de una progresión; la clave de fa | Canta el bajo de una progresión |
| 5 | La voz grave de tres; cantar una voz mientras se toca otra | Canta el bajo mientras toca la melodía |
| 6 | Oído interno: leer en silencio y cantar; cantar una frase antes de digitarla | Canta una frase leída sin ayuda |
| 7 | Cantar para decidir el fraseo; leer una frase en silencio y saber cómo suena | Canta una frase antes de decidir su digitación |
<!-- AREA:Solfeo:fin -->
**Calibración:** el ritmo, con el Lenguaje Musical de Elementales (Elche) y la primera vista del ABRSM. El solfeo, con las pruebas de oído del ABRSM:
- ecos de dos compases (grados 1-3);
- cinco y seis notas leídas (grados 4-5);
- la voz de arriba de dos (6);
- la de abajo (7);
- la grave de tres (8) **[Dato]**.

### 9.4 Teoría y armonía
<!-- AREA:Teoría:inicio -->
**Teoría**

| Nivel | Qué desarrolla | Qué domina al salir |
|---|---|---|
| 1 | Tono y semitono; intervalos con su calidad; escala mayor; las tres menores; triadas; grados; armaduras hasta cuatro sostenidos y un bemol; relativo y homónimo | Construye una escala y su triada en cualquier tonalidad del nivel |
| 2 | Círculo de quintas; todas las armaduras; intervalos aumentados y disminuidos; enarmonía; las cuatro triadas; cuatriadas; inversiones y cifrado; términos de tempo | La teoría de un grado 5 del ABRSM |
| 3 | Notas de adorno; tonalidades vecinas; binaria, ternaria y rondó; antecedente y consecuente; los modos (primer vistazo) | Explica la forma de cada obra del nivel |
| 4 | Modos; la suite y sus danzas; la imitación; la forma sonata | Explica la forma de una sonata clásica |
| 5 | Tema con variaciones; el lied; el estilo del Clasicismo y del Romanticismo; la sonata de Scarlatti | Explica cómo está hecha una obra de variaciones |
| 6 | Lenguajes del siglo XX: pentatónica, tonos enteros, modalismo, paralelismos; la sonata completa | Explica el lenguaje de Falla y de Villa-Lobos |
| 7 | Análisis completo; estilo histórico; interpretación históricamente informada | El análisis completo de *La Catedral* |
<!-- AREA:Teoría:fin -->
<!-- AREA:Armonía:inicio -->
**Armonía**

| Nivel | Qué desarrolla | Qué domina al salir |
|---|---|---|
| 1 | Tónica, subdominante y dominante; I-IV-V7-I en cinco tonalidades; cadencias; el V7 común a mayor y menor | Dice qué función tiene cada acorde de sus obras |
| 2 | ii-V-I; V/V; I-vi-IV-V; transportar con formas móviles; armonizar una melodía | Armoniza una melodía de ocho compases |
| 3 | Dominantes secundarias; modulación a la dominante y al relativo; bajo cifrado (primer contacto) | Encuentra una modulación en una obra |
| 4 | Secuencia por quintas; napolitana; pedal; armonía modal; cadencia rota | Encuentra una napolitana y una secuencia en una obra |
| 5 | Sexta aumentada; modulación lejana; cromatismo; novena de dominante | Encuentra una sexta aumentada y una modulación lejana |
| 6 | La armonía de Barrios y Villa-Lobos; impresionismo; el modo frigio y la cadencia andaluza en la música española de concierto | Encuentra una cadencia andaluza y un paralelismo en una obra |
| 7 | Rearmonizar; la armonía de Albéniz; la armonía al servicio de la interpretación | Rearmoniza una frase y explica qué cambia |
<!-- AREA:Armonía:fin -->
**Calibración:**
- La teoría básica se completa en el nivel 2, como el grado 5 de teoría que el ABRSM exige para los grados 6-8 **[Dato]**.
- La armonía crece en los niveles 4 y 5, que equivalen a 3.º y 4.º de Profesionales, los cursos con Armonía en el BOE **[Dato]**. Sus contenidos (tríadas y séptimas en todos los grados, novena de dominante, cadencias, modulación diatónica y cromática, progresiones) son los de esa asignatura **[Dato]**.

### 9.5 Análisis
<!-- AREA:Análisis:inicio -->
**Análisis**

| Nivel | Qué desarrolla | Qué domina al salir |
|---|---|---|
| 1 | Frases; forma ABA y binaria; las cadencias dentro de la obra | Hace el mapa de una obra corta |
| 2 | La forma sonatina; la variación; la modulación a la dominante | Explica la forma de la *Sonatina* de Giuliani |
| 3 | La frase que pregunta y responde; el contrapunto; la textura | El mapa armónico y formal de la *Bourrée* |
| 4 | Sonata; suite; diferencias; el ritmo armónico | El análisis de un primer movimiento clásico |
| 5 | La forma larga; la variación; el mapa de una obra de ocho minutos | El mapa de *Julia Florida* con sus puntos de apoyo |
| 6 | Análisis propio y completo de una sonata y de un preludio barroco | El análisis del BWV 997, hecho por él |
| 7 | Una obra en tres movimientos; comparar interpretaciones | Explica qué hace distinta cada versión de una obra |
<!-- AREA:Análisis:fin -->
**Calibración:** el análisis pasa a mandar en los niveles 6 y 7, como Análisis o Fundamentos de composición en 5.º y 6.º de Profesionales **[Dato]**.

### 9.6 Oído
<!-- AREA:Oído:inicio -->
**Oído**

| Nivel | Qué desarrolla | Qué domina al salir |
|---|---|---|
| 1 | Pulso en 2, 3 o 4; mayor o menor; 3.ª m y M, 4.ª, 5.ª y 8.ª melódicas; calidad de la triada; ¿qué ha cambiado?; repetir una melodía corta en la guitarra | Reconoce mayor o menor, los intervalos del nivel y la calidad de una triada; repite de oído una melodía corta |
| 2 | Añade las 6.ª; intervalos a la vez; el V7; I-IV-I o I-V-I; estilo y época | Reconoce las 6.ª, el V7 y si la música va al IV o al V; dice de qué época es una obra |
| 3 | Añade las 2.ª; séptima disminuida; i-iv-i e i-V-i; cadencia perfecta o imperfecta; textura | Reconoce las 2.ª, la séptima disminuida y si una cadencia termina o queda abierta; toca de oído la voz de arriba de dos |
| 4 | Añade las 7.ª; triada aumentada; I-IV-V; cadencia perfecta, imperfecta o rota; los acordes de la cadencia; ¿modula a V, IV o vi? | Reconoce las 7.ª, la cadencia rota y adónde modula una frase; toca de oído la voz de abajo de dos |
| 5 | Añade el tritono; progresiones de cuatro acordes; cadencias con inversiones y plagal; la voz grave de tres; sacar una melodía de oído | Reconoce el tritono, las progresiones de cuatro acordes y las cadencias con inversión; toca de oído la voz grave de tres |
| 6 | Cuatriadas mayores y menores con su 1.ª inversión; progresiones con I, IV, V y vi; transcribir fragmentos cortos | Reconoce las cuatriadas y su inversión; transcribe el bajo de una variación |
| 7 | Novenas; cuatriadas mayor y menor de séptima; progresiones de cinco acordes con el 6/4 cadencial; la forma y las modulaciones de una obra entera | Reconoce las 9.ª y las cuatriadas de séptima; sigue la forma y las modulaciones de una obra entera |
<!-- AREA:Oído:fin -->
**Calibración [Dato]:** la escalera de intervalos, acordes y progresiones es la del RCM de 2024, nivel a nivel, que sustituye a la de su temario de 2018:

| Nivel | Equivale a | Intervalos, acordes y progresiones |
|---|---|---|
| 1 | RCM 4 | 3.ª menor y mayor, 4.ª, 5.ª y 8.ª, melódicos; triada mayor o menor; si una nota es la fundamental, la 3.ª o la 5.ª |
| 2 | RCM 5 | Las 6.ª; melódicos y después a la vez; el V7; I-IV-I o I-V-I |
| 3 | RCM 6 | Las 2.ª; la séptima disminuida; i-iv-i e i-V-i |
| 4 | RCM 7 | Las 7.ª; la triada aumentada; I-IV-V |
| 5 | RCM 8 | El tritono; progresiones de cuatro acordes (I-IV-V-I, I-IV-V-vi, I-vi-IV-V, I-vi-IV-I) |
| 6 | RCM 9 | Cuatriadas mayores y menores en estado fundamental y en 1.ª inversión; progresiones con I, IV, V y vi |
| 7 | RCM 10 | Las 9.ª; cuatriadas con 7.ª mayor y con 7.ª menor; cinco acordes con el 6/4 cadencial |

Las cadencias, la modulación, la voz que se canta y lo que se describe de una obra (dinámica, carácter, estilo y época, textura, estructura) siguen al ABRSM, del grado 4 al 8 **[Dato]**. Cada pregunta de oído usa, siempre que se puede, la música del tramo.

### 9.7 Repertorio
<!-- AREA:Repertorio:inicio -->
**Repertorio**

| Nivel | Qué desarrolla | Qué domina al salir |
|---|---|---|
| 1 | Once obras cortas de cinco épocas | Once obras cortas de cinco épocas, tocadas enteras |
| 2 | Doce obras de cinco épocas | Doce obras de cinco épocas, dos de ellas leídas |
| 3 | Once obras, con dos de lectura | Once obras, de la vihuela a Lauro |
| 4 | Doce obras de seis estilos, con dos leídas | Doce obras, con una sonata y la primera parte de *Recuerdos* |
| 5 | Trece obras de concierto, con una leída | Trece obras de concierto de cinco épocas |
| 6 | Doce obras mayores, con un dúo y una leída | Doce obras mayores y un dúo |
| 7 | Nueve obras de final de Profesionales, con una leída | Nueve obras de final de Profesionales |
<!-- AREA:Repertorio:fin -->
**El detalle y la auditoría obra por obra, en [[repertorio]].** Hay cinco épocas en los siete niveles, dos obras leídas por nivel, obras cortas en todos y fragmentos que preparan las obras largas.

---

## 10. Experiencia de usuario
Se conserva la de la versión 2, con estos cambios: «Nivel N» en vez de «Curso N · Nivel N», los estados visibles en lenguaje normal, «En esta lección» en vez de «Hoy» y la digitación explicada.

### 10.1 Navegación
Carril con cuatro entradas: **Curso** (el centro: su nivel y «Continuar») · **Obras** (la biblioteca de repertorio) · **Progreso** · **Ajustes**.
- **Salen:** Hoy, Diario, Profesor, Competencia, Área y cualquier pantalla de sesiones, minutos o registro.
- Biblioteca y Obras son una sola entrada.

### 10.2 La pantalla del curso
El alumno entiende en un vistazo qué nivel hace, por dónde va, qué toca ahora y qué tiene que hacer para seguir.
```
Nivel 1                                              [ ▶ CONTINUAR ]
Ahora: Tramo 5 · Lágrima, parte A — El dedo guía
████████████░░░░░░░░  38 %

Tramo 1   ● ● ● ● ● ●            Hecho
Tramo 2   ● ● ● ● ●              Hecho
…
Tramo 5   ● ● ◐ ○ ○              ← ahora
Tramo 6   ○ ○ ○ ○ ○
…
En práctica: Lágrima A · Españoleta          Para repasar: 1
```
- Un punto por lección; al pasar por encima, su título.
- Ninguna etiqueta interna: ni áreas, ni dominio, ni criterios.

### 10.3 Qué hace ▶ CONTINUAR
| Situación | Lleva a |
|---|---|
| No ha empezado el nivel | La primera lección; el botón dice **Comenzar** |
| A mitad de una lección | El paso exacto donde lo dejó |
| Terminó una lección | La siguiente lección |
| Terminó un tramo | La comprobación del tramo y después el tramo siguiente |
| Terminó el nivel | El cierre y, al acabar, «Empezar el nivel 2» |
| Hay un repaso pendiente | Lo intercala antes de la lección siguiente, como mucho dos seguidos |
| El paso necesita algo de antes (↩) | Lo dice («Antes, termina la A de *Lágrima*») y lleva a ello |
| Vuelve después de semanas sin entrar | Un repaso corto de lo último que estaba en práctica, y sigue donde estaba |
| Hay un encargo de su profesor | Una tarjeta encima del botón; el botón no cambia |

No hay sesiones, minutos ni «¿qué hago hoy?»: es una ruta. Puede practicar una obra cuando quiera desde Obras.

### 10.4 La lección
- El título y «En esta lección…».
- Después, los pasos uno a uno, con puntos de avance arriba, **Atrás** y el botón del paso.
- El selector **Partitura | Tab | Ambas** aparece solo en los pasos con notación, con el formato recomendado ya puesto según el objetivo del paso (leer: partitura; técnica: tablatura o las dos). Él lo cambia cuando quiera, también fragmento a fragmento.
- El metrónomo, solo en los pasos que lo usan, como herramienta secundaria.
- **Botones al terminar un paso de práctica:** **Hecho** o **Sigo practicando**. El segundo lo deja en práctica, en el atril.

### 10.5 Qué se muestra y qué no
| Se muestra | No se muestra (la app lo usa por dentro) |
|---|---|
| **Hecho** · **En práctica** · **Para repasar** | Realizada, aprendida, consolidada y dominada |
| En los repasos: **Bien · Regular · No salió** | Dominio, solidez, criterio, comprobación en frío |
| El progreso del nivel (%), las obras en práctica y los repasos pendientes | Métricas por aspecto, perfil por áreas, evidencias por competencia |
| La equivalencia aproximada del nivel, en Progreso | Prioridades del planificador; sesiones; minutos; registro de práctica |

### 10.6 Obras (la biblioteca)
- **Lo que se ve al abrir una obra:**
  - título, compositor, nivel y progreso;
  - partitura, tablatura o las dos;
  - secciones, y «Practicar» (toda o por secciones);
  - «Sobre esta obra», en unas líneas;
  - la digitación explicada donde importa: el pasaje, los dedos y por qué;
  - la explicación de los fragmentos que lo merecen;
  - «Se trabaja en el nivel 1, tramo 5».
- **Lo que no se ve:** competencias, criterios ni estados internos.

### 10.7 La digitación explicada
- En los datos, un paso o un fragmento de obra puede llevar una **digitación** con el pasaje, los dedos de las dos manos y **por qué**.
- **Se explica solo cuando hay una razón profesional:** dedo guía, dedo fijo o común, preparación, economía de movimiento, continuidad de voces, legato, color, campanela o cambios difíciles.
- **En pantalla:** los números en la partitura y en la tablatura, y debajo un recuadro breve con el porqué.
- **Desde el nivel 6** él digita y compara; la app guarda su digitación junto a la de la edición.

### 10.8 El guía
- Cuatro tipos de mensaje: **Consejo del profesor**, **¿Sabías que…?**, **Esto te sirve para…** y **Fíjate en…**.
- En los datos, cada paso puede llevarlos con su tipo y su texto.
- En pantalla, un recuadro sobrio. Más adelante se cambia por un personaje sin tocar el currículo ni los datos.

### 10.9 Diagramas de acordes
- **Componente SVG:**
  - mástil con cuerdas y trastes;
  - la posición inicial (el número del traste);
  - **0** para la cuerda al aire y **×** para la que no se toca;
  - la cejilla como una barra;
  - un punto por dedo con su número dentro y **un color distinto para cada dedo** (1, 2, 3, 4 y el pulgar si se usa);
  - **la cejilla en el color del dedo 1**.
- **Se usa en:** acordes, progresiones, formas móviles y cambios de acorde (los dos diagramas con el dedo que se queda marcado).
- Los colores se eligen en la implementación, con la paleta B+, sin depender solo del color (por el número).

### 10.10 Audio y metrónomo
- Secundarios. El metrónomo actual se queda dentro de los pasos que lo usan.
- El audio, con un campo preparado (generado, por enlace o propio) y el reproductor del navegador, más adelante.
- No retrasan el currículo.

---

## 11. Evaluación interna
| Momento | Lo que ve él | Lo que hace la app por dentro |
|---|---|---|
| Paso | **Continuar**, o **Hecho** / **Sigo practicando** | Guarda el progreso; lo que sigue en práctica pasa al atril |
| Preguntas que corrige la app | Las preguntas y el resultado | Con el 90 %, hecho |
| Repaso | Dentro de «Continuar», como un paso más («Toca la A de *Lágrima* sin calentar»), con **Bien · Regular · No salió** | La comprobación en frío y el dominio de siempre, invisibles; «No salió» añade un refuerzo |
| Final del tramo | Una comprobación corta y variada | Si algo falla, añade refuerzos; no se repite el tramo |
| Cierre del nivel | Recital y prueba corta de técnica, primera vista, oído y teoría | Cierra el nivel y propone el siguiente |
| Lo que ya sabe | Pasos ◇ que se resuelven con una prueba corta; obras conocidas que se comprueban y no se reaprenden | La evaluación inicial de la Fase 3, sin su pantalla |

**Nada bloquea:** todo se ve y se puede abrir. «Continuar» solo recomienda.

---

## 12. *Lágrima*: por qué no se ve la partitura
Sin cambios respecto a la versión 2 (apartado 7):
1. **`Abrir academia.cmd` arranca la copia de la vault, que está en la Fase 2**, sin VexFlow ni notación.
2. **En la Fase 3 tampoco se vería.** La ficha `tarrega-lagrima.json` no tiene `notacion.fuente`, así que `web/vistas/obra.js` solo escribe «Fuera de la app: IMSLP».

**El arreglo, en la implementación:**
- actualizar la copia de la vault;
- transcribir *Lágrima* desde la edición de Alier a `contenido/notacion/`, con la A (c. 1-8), la B (c. 9-16), la vuelta a la A y la digitación de Tárrega donde la marque;
- enlazarla con `notacion.fuente`.

El escaneo de IMSLP lo tiene que descargar usted, porque pide una verificación de persona.

---

## 13. Lo que se conserva del código
**Se reutiliza:**
- servidor, guardado y copias;
- validador;
- notación estructurada y VexFlow;
- el selector Partitura | Tab | Ambas;
- metrónomo;
- preguntas de teoría y de oído;
- evaluación inicial;
- dominio y repasos, por dentro;
- diseño B+: atril, mapa de la ruta y tokens;
- la separación entre el programa clásico y el flamenco.

**Sale de la interfaz:**
- el planificador;
- el registro por aspectos;
- las pantallas de criterio y de dominio.

**El programa flamenco no se toca:** este trabajo es solo del clásico. La arquitectura le servirá después, pero el currículo flamenco tendrá su propio programa.

---

## 14. Decisiones que necesita tomar usted
1. **Siete niveles**, con la justificación del apartado 5.1.
2. **Los nombres «Nivel 1 … Nivel 7»**, sin subtítulo, y la equivalencia solo en Progreso (5.2).
3. **El tramo como unidad de formación con su música** y la regla de que cada técnica recorra todo el nivel (6 y [[cobertura]]).
4. **Los cambios de técnica:**
   - la cejilla completa empieza en el nivel 1;
   - Carlevaro pasa al 2;
   - la velocidad empieza en el 3;
   - *Sueño* baja al 2;
   - la parte en La menor de *Recuerdos* entra en el 4 y *Una limosna* empieza en el 6.
5. **Los cambios de repertorio** de [[repertorio]], apartado 1.
6. **El oído calibrado con el RCM**: va más despacio que la versión 2 en los intervalos y mete antes la armonía práctica.
7. **Los estados visibles «Hecho · En práctica · Para repasar»** (10.5). Cambian una regla cerrada: los estados de la app siguen existiendo, pero el alumno ya no los ve.
8. **Las demás reglas cerradas que cambia el rediseño**, las mismas que en las versiones 1 y 2 ([[CURRICULO-MAESTRO (v1)]], apartado 0.3):
   - las prioridades del planificador;
   - la pantalla Profesor;
   - el dominio y la comprobación en frío visibles;
   - *Lágrima* como obra final única (ahora es la principal del nivel 1 y entra en su recital).
9. **El grano de los niveles 5 a 7**: tienen menos lecciones, porque sus obras son más largas. Se pueden partir en secciones si lo quiere ([[cobertura]]).

**Donde no estoy de acuerdo del todo, o veo un riesgo:**
- **Muchas obras por nivel** (de diez a catorce, con las leídas) es lo que pide y lo que hace un conservatorio. Pero para un aficionado que estudia en sus ratos libres, cada nivel puede alargarse más de un año. Mi propuesta: el cierre exige solo tres o cuatro obras, y las demás se pueden cambiar por alternativas o dejar para el repertorio vivo, sin bloquear nada.
- **El trémolo desde el nivel 1** no es lo que hace un conservatorio: La Rioja lo pone en Profesionales. Lo mantengo porque él ya hace el trémolo flamenco y sería desaprovecharlo, pero es una decisión, no un dato.
- **Cantar.** El solfeo cantado es lo que más resistencia suele dar a un adulto. Lo dejo en pasos cortos y siempre ligado a la obra, porque los cuatro sistemas lo piden y es lo que hace que la lectura se oiga por dentro.

---

## Fuentes nuevas de esta versión
- RCM, *Musicianship Addendum* (2024), requisitos de oído de los niveles Preparatorio a 10: https://teacherportal.rcmusic.com/getattachment/ca8bb6d9-8334-4eef-b876-c8e1f17afaea/rcm-musicianship-addendum-2024.pdf
- BOE n.º 154, de 28/06/2007, Orden ECI/1890/2007, currículo de las Profesionales en Ceuta y Melilla, con el horario por especialidad (guitarra incluida) y los contenidos de Armonía y de Conjunto: https://www.boe.es/boe/dias/2007/06/28/pdfs/A27813-27868.pdf
- Trinity College London, pruebas complementarias (primera vista, oído, improvisación): https://www.trinitycollege.com/site/?id=3173 · ejemplo de prueba de improvisación: https://blog.trinitycollege.co.uk/classical-jazz-supporting-tests-improvisation
- ABRSM, *Guitar Syllabus from 2019*, pruebas de oído de los grados 1-8 (la misma copia que en la versión 2): https://www.newschool.ie/wp-content/uploads/2019/09/complete_guitar_syllabus.pdf
- Conservatorio de La Rioja, programación de guitarra 2025-26, leída otra vez entera, con las listas de repertorio de cada curso. El enlace está en [[CURRICULO-MAESTRO (v1)]].
- Las demás fuentes, en [[CURRICULO-MAESTRO (v2)]] y [[CURRICULO-MAESTRO (v1)]].
