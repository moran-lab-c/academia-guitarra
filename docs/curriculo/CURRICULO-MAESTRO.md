---
status: active
project: personal
type: plan
created: 2026-10-30
---
# Academia de guitarra: currículo maestro, versión 3.1 (candidata a aprobación)

**Estado: candidata a aprobación. No se ha tocado el código, la interfaz, los datos ni el JSON de producción.** Sale de la auditoría del 30/10/2026 sobre la versión 3: [[AUDITORIA-V3]]. Las versiones anteriores y lo que cambió, en `v2/` y `v1/`.

| Documento | Qué contiene |
|---|---|
| Este | 1. De dónde sale esta versión · 2. Investigación · 3. Filosofía y principios · 4. Perfil de entrada · 5. Cuántos niveles y cómo se llaman · 6. Arquitectura · 7. Matriz global · 8. Progresión técnica · 9. Progresiones de lectura, ritmo, solfeo, teoría, armonía, análisis, oído y repertorio · 10. Experiencia de usuario · 11. Evaluación interna · 12. *Lágrima* · 13. Lo que se conserva del código · 14. Decisiones |
| [[curso-1]] … [[curso-7]] | Cada nivel: ficha, matriz de todas sus áreas (entrada, desarrollo y salida), cómo progresa por dentro, repertorio, tramos, lecciones y pasos, ejercicios y cierre |
| [[cobertura]] | Presencia, desarrollo y dominio de cada área en cada nivel, generados desde los cursos |
| [[repertorio]] | Cada obra: fuentes, tipo (troncal, aplicación, lectura, fragmento o alternativa), qué enseña, y la carga de cada nivel |
| [[ejercicios]] | Las fichas de los ejercicios |
| [[AUDITORIA-V3]] | El informe de la auditoría, escrito antes de corregir |

**Etiquetas:**
- **[Dato]** comprobable en una fuente;
- **[Consenso]** práctica pedagógica extendida;
- **[Decisión]** elección mía, revisable;
- **[Estimación]** equivalencia entre sistemas;
- **[Por verificar]** pendiente de comprobar en la partitura o la fuente.

---

## 1. De dónde sale esta versión
La arquitectura de la versión 3 se conserva. La auditoría ([[AUDITORIA-V3]]) encontró datos mal leídos, promesas de las matrices sin ningún paso detrás, relleno que yo mismo añadí para cuadrar una tabla, una carga de repertorio irreal y obras largas sin ruta. La versión 3.1 corrige eso y nada más.

---

## 2. Investigación

**Lo que se ha leído para esta versión, y para qué ha servido:**

| Fuente | Qué aporta | Qué decisión cambia |
|---|---|---|
| **La Rioja, programación de guitarra 2025-26** **[Dato]** | Cada curso de Profesionales repite la misma lista de técnicas: arpegios, acordes, apagadores, rasgueados, trémolo, desplazamientos, ligados, glissando, ornamentos, cejillas, extensiones, portamento, pizzicato, escalas, armónicos, vibrato, tambora, campanelas, golpes y la interpretación (dinámica, agógica, fraseo, articulación, digitación). Cambia la profundidad, no la lista. Y uno de sus principios: «La música se enseña haciendo música» | **Toda técnica está en todos los niveles** desde que aparece. Es la base del apartado 8 |
| La misma, en Elementales y en las listas de repertorio de 1.º a 6.º **[Dato]** | Cejilla desde 3.º de Elementales; todas las escalas mayores en dos octavas en 4.º; acompañar canciones con acordes en 3.º; Carlevaro 1-15 en 1.º de Profesionales; ligados de tres notas en 4.º de Elementales; la lista de obras de cada curso | La cejilla al nivel 1; Carlevaro al 2; acompañar al 1; la colocación de *Canarios*, Brouwer VI, la *Sonatina* de Giuliani, Diabelli, Mudarra y la *Sonata* de Sor. Y una exigencia para aprobar cada curso: **cinco obras y tres estudios, una de memoria**, que aquí es el techo de la carga |
| **RCM, requisitos de oído de 2024** (anexo que sustituye a los del temario de 2018) **[Dato]** | Nivel a nivel: qué intervalos, acordes y progresiones se reconocen | La escalera de oído (apartado 9.6) |
| **ABRSM, temario de guitarra de 2019**, pruebas de oído de los grados 1-8 **[Dato]** | Cantar ecos; cantar notas leídas; la voz de arriba de dos (grado 6), la de abajo (7) y la grave de tres (8); cadencia perfecta o imperfecta (6), rota (7) y plagal con inversiones (8); ¿adónde modula? (7); estilo y época (5); textura y estructura (6) | El solfeo y el oído de los niveles 1 a 5, ligados a sus obras |
| **BOE, Orden ECI/1890/2007**, currículo de las Profesionales del Ministerio (Ceuta y Melilla) y su horario de guitarra **[Dato]** | En cada curso el alumno tiene a la vez instrumento, lenguaje musical (1.º-2.º), conjunto, armonía (3.º-4.º), análisis o fundamentos de composición e historia (5.º-6.º) | Un curso de conservatorio es exactamente un nivel completo: todas las materias a la vez, cada una a su altura. La teoría se completa hacia el nivel 2, la armonía crece en el 4 y el 5 y el análisis manda en el 6 y el 7 |
| **Trinity College**, pruebas complementarias **[Dato]** | La primera vista va unos dos grados por debajo del examen; la improvisación es una prueba reconocida | Las obras leídas vienen de uno o dos niveles por debajo; la creatividad tiene su línea propia |
| **ABRSM de 2019, escalas y primera vista**; **RCM 2018 según Da Capo**; **Mater Salvatoris** **[Dato]** | Escalas y arpegios por grado; parámetros de primera vista; nivel de cada obra; memorizar dos o tres obras por curso | Comprobados el 30/10/2026 |
| Lenguaje Musical de Elche; Carlevaro (por descripciones, no por los cuadernos); Niedt | Lo básico de ritmo y teoría; las fórmulas y los traslados; los dedos guía | Se mantienen |

**Los sistemas externos son calibración, no el currículo.** La academia no prepara para ningún examen. «Como el grado N» significa que el contenido se parece; no que sea un requisito.

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
2. **Cada técnica, cuando la música la pide.** Una técnica se reparte por el nivel si hace falta, no para llenar una tabla: si dos apariciones bastan, bastan dos. Lo que no puede ocurrir es que un nivel gire alrededor de una sola.
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
9. **«Ya lo sabe» no significa «no hay que enseñarlo».** Si ya sabe hacerlo, se comprueba con un paso ◇ y no se repite. Si la competencia del nivel pide una versión superior, se desarrolla. Vale sobre todo para arpegios, ligados, apoyando, tirando, acordes, trémolo y picado.
10. **La estructura no sigue plantilla.** Un paso puede ser una explicación, una demostración, un ejercicio, una lectura, un ritmo, una pregunta de oído, una progresión, un análisis, una aplicación, una obra, un contexto o una escucha.
11. **Ninguna obra es una prueba absoluta.** Se reconoce la competencia, también si se demuestra con una obra equivalente.

---

## 4. Perfil de entrada
- **Técnica y repertorio:** entre RCM 3 y 4 **[Estimación]**. Arpegio, ligados, apoyando y acordes abiertos, aprendidos por tablatura. Trémolo y picado flamencos; el picado, con la velocidad todavía por trabajar.
- **Lectura de pentagrama:** Preparatorio.
- **Teoría y oído:** a medias.
- **Obra conocida:** su *Estudio en Mi menor*. *Lágrima* no la sabe tocar.
- **Consecuencia [Decisión]:** el nivel 1 empieza en su técnica real y pone al día la lectura, la teoría y el oído dentro de las mismas obras. Por eso es el más largo.

---

## 5. Cuántos niveles y cómo se llaman

### 5.1 Siete, comprobado otra vez
He contado los escalones desde su entrada. El número de escalones de cada sistema es un dato; decir que dos sistemas se corresponden, una estimación mía: no he encontrado una tabla oficial, y las fuentes discrepan hasta en dos niveles en una misma obra.

| Sistema | Su entrada **[Estimación]** | Escalones hasta el final de la formación previa a la superior | Cuántos |
|---|---|---|---|
| RCM | nivel 3-4 | 4, 5, 6, 7, 8, 9 y 10 | 7 |
| Conservatorio (La Rioja) | 3.º-4.º de Elementales | 4.º de Elementales y 1.º a 6.º de Profesionales | 7 |

El ABRSM no cuenta igual: del grado 4 al 8 hay cinco escalones, y después vienen los diplomas (ARSM y DipABRSM), de otra naturaleza. No lo uso para contar niveles, solo para calibrar por componentes: en escalas, el nivel 1 se parece al grado 3, el 2 al 4-5, el 3 al 6, el 4 al 7 y el 5 al 8; en oído y primera vista la correspondencia es otra.

**Las alternativas, y por qué no:**
- **Seis, juntando los niveles 6 y 7.** No, porque entre ellos hay un salto real: del *Capricho árabe* y la primera digitación propia a *Una limosna*, *Asturias* y montar solo una obra nueva. El RCM y el conservatorio los separan.
- **Ocho, partiendo el nivel 1, que es el más largo.** No: lo que lo alarga es la puesta al día de la lectura, la teoría y el oído. Sacarla a un curso aparte crearía justo un curso de lectura y teoría, que es lo que la regla prohíbe. El nivel 1 se queda largo y salta lo que ya sabe con los pasos ◇.
- **Más niveles en general.** Partirían escalones reconocidos sin un salto de competencia.

**Los saltos de competencia, nivel a nivel (lo que cada uno puede hacer y el anterior no):**

| Nivel | Se parece a **[Estimación]** | El salto |
|---|---|---|
| 1 | RCM 4 · 4.º de Elementales | De tocar por tablatura a tocar, leer, entender y oír lo mismo; sonido clásico; recital con una obra de memoria |
| 2 | RCM 5 · 1.º de Profesionales | Hasta la VII con cejilla en cualquier traste; vibrato y una melodía en trémolo; teoría básica completa; las sextas y el V7 al oído |
| 3 | RCM 6 · 2.º de Profesionales | Tres voces y hasta la IX; trino y octavados; primeras ráfagas; dominantes secundarias; cantar la voz de arriba de dos |
| 4 | RCM 7 · 3.º de Profesionales | Todo el mástil con velocidad controlada; *Recuerdos* empezada; modos, suite, sonata y secuencias; la cadencia rota y la modulación al oído |
| 5 | RCM 8 · 4.º de Profesionales | Obras de concierto de cuatro a ocho minutos; *Recuerdos* entera; cuatro voces; sexta aumentada; progresiones de cuatro acordes al oído |
| 6 | RCM 9 · 5.º de Profesionales | Obras mayores; digitación y análisis propios; el siglo XX y el frigio; transcribir de oído |
| 7 | RCM 10 · 6.º de Profesionales | Autonomía: montar, digitar y presentar solo; *Una limosna*, *Asturias*; recital propio |

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
- **La lección** enseña una cosa de una sentada. Se nombra por lo que enseña. Lleva entre llaves las áreas que **desarrolla** (`~Área` si solo aparece; `!Área` si ahí se demuestra el dominio, en el cierre), solo para el diseño y [[cobertura]]; el alumno no ve áreas ni asignaturas.
- **El paso** es una pantalla, sin plantilla.
- **El cierre del nivel** es un tramo con el recital (obras ya tocadas, de varias épocas), una prueba corta y «Lo que viene», que anuncia el nivel siguiente área por área.

**Leyenda de los pasos** (en los cursos, cada paso es una línea):
- **Tipos:** Explicación · Cómo se hace · Ejercicio · Lectura · Primera vista · Ritmo · Solfeo · Escucha · Oído · Teoría · Acordes · Progresión · Análisis · Digitación · Aplicación · Obra · Repaso · Contexto · Tablatura · Diapasón · ¿Sabías que…? · Consejo del profesor · Fíjate en… · Esto te sirve para… · Comprobación del tramo.
- **Recursos:** 𝄞 partitura · T tablatura (el recurso que se pone primero es el que abre por defecto; el otro está siempre a un toque si existe) · ⌗ diagrama de acordes (un color por dedo) · ♪ audio · ⏱ metrónomo · ✎ preguntas que corrige la app.
- **◇:** si ya lo sabe, una prueba corta lo da por hecho, sin pantallas de evaluación.
- **↩:** el paso se apoya en algo de antes; «Continuar» lo recomienda, sin impedir seguir.
- **Comprobación del tramo:** nombre interno. En pantalla es «Toca el tramo de principio a fin» o unas preguntas, sin nota y sin bloquear nada.

---

## 7. Matriz global de progresión
Lo que domina al salir de cada nivel, área por área. **Se genera** desde la última columna de la matriz de cada curso, así que no puede contradecirlos. Cada fila es una progresión de principio a fin del programa.

<!-- GLOBAL:inicio -->
| Área | Nivel 1 | Nivel 2 | Nivel 3 | Nivel 4 | Nivel 5 | Nivel 6 | Nivel 7 |
|---|---|---|---|---|---|---|---|
| **Postura y ergonomía** | Toca un recital corto sin tensión en hombros ni pulgar | Una cejilla de un minuto sin dolor | Toca en la IX sin torcer la muñeca | Diez minutos de programa sin tensión acumulada | Toca *Recuerdos* dos veces seguidas sin tensión | Un programa de veinte minutos sin molestias | Treinta minutos de recital sin molestias |
| **Sonido** | Una nota larga con sonido redondo; elige el color de una frase | La melodía del *Romance* por encima de los tresillos | Tres voces con tres volúmenes | Una escala rápida con el mismo sonido que lenta | Un plan de color escrito y cumplido | Explica y toca tres colores de una misma frase | Grabaciones en las que reconoce su sonido |
| **Mano derecha** | Arpegio con la melodía destacada a ♩=72 en corcheas | Arpegio con melodía en *a* en tresillos, con la melodía clara, a un tempo estable | Ráfagas de cuatro notas limpias; el rasgueado de los *Canarios* | Una escala de tres octavas limpia y estable, bastante más ágil que en el nivel 3 | El arpegio de *Julia Florida* igual en todas las cuerdas | El *Estudio n.º 1* con el arpegio igual | *Una limosna* entera y *Asturias* a tempo |
| **Mano izquierda** | Cambia de acorde y de posición sin cortar el sonido | Un cambio de posición que no se oye | Sostiene una voz mientras las otras se mueven | Un cambio rápido que no corta la frase | Sostiene cuatro voces en un coral | Sostiene cuatro voces con cambios de posición | Monta la izquierda de una obra nueva sin guía |
| **Escalas** | Mi, Fa y Sol mayor en dos octavas en 1.ª posición; Do, Re y La con un cambio; estables, a un tempo cómodo | Las escalas del nivel con cambio de posición, a un tempo estable | Mi mayor en tres octavas, limpia y estable | Las escalas del nivel limpias y estables | Las escalas del nivel limpias y a un tempo que le permite tocar sus obras | Las escalas de la *Sonata* de Sor a tempo | Las escalas de las variaciones a tempo |
| **Arpegios** | Triadas de Mi, Sol y La, dos octavas | Los dos arpegios de séptima, de memoria | Arpegio de Mi mayor en tres octavas | El arpegio del BWV 999 sin huecos | El arpegio de *Julia Florida* y las séptimas de tres octavas | Los arpegios de sus obras con la mano suelta | Los arpegios de sus obras con la mano suelta |
| **Ligados y ornamentos** | Ligados iguales de volumen; el mordente de la *Españoleta* a tempo | Ligados de tres notas iguales; sabe qué es una apoyatura | Trino regular a ♩=60 en fusas | Ligados de cuatro notas iguales a tempo | Ligados de concierto sin perder el pulso | El *Estudio del ligado* a tempo | Ornamentos que puede justificar con fuentes |
| **Acordes y cejilla** | Media cejilla limpia; una cejilla completa breve en el V | Cuatro acordes con cejilla seguidos y limpios | Una cejilla parcial que no corta ninguna voz | Tres cejillas seguidas sin hueco | Las cejillas de *Recuerdos* bajo el trémolo | Una cejilla larga que no se apaga | Elige cejilla o cuerda al aire y lo justifica |
| **Posiciones y diapasón** | Nombra cualquier nota de la 1.ª posición y sabe en qué posición está | Encuentra una nota en tres sitios | Encuentra cualquier nota hasta el traste XII | Encuentra cualquier nota de todo el mástil | Toca una frase en dos posiciones y elige | Elige posición y la justifica por el color | Dos digitaciones de un pasaje con su porqué |
| **Trémolo** | Tres notas iguales a ♩=40 en semicorcheas | Una melodía de ocho compases en trémolo, lenta y regular | Trémolo regular sobre I-IV-V-I | Esa parte a tempo medio, regular | *Recuerdos* de memoria, con el trémolo regular | La primera sección de *Una limosna*, con el bajo cantando | La obra entera, regular y cantada |
| **Armónicos y otros recursos** | Los armónicos de su *Estudio en Mi menor* claros | Vibrato en una nota larga cuando la frase lo pide | Una escala de una octava en octavados | La melodía en octavados de Llobet | Un arpegio con armónicos artificiales | Los colores de Falla y Turina con intención | Cada efecto con una intención |
| **Polifonía** | Dos planos con volúmenes distintos | Ninguna voz se corta antes de tiempo | Tres voces en las que se distingue cada una | Distingue y hace oír la imitación | Hace oír las voces escondidas del BWV 1007 | Hace oír la entrada de cada voz en Mudarra | Las voces de la *Fantasía n.º 7* claras |
| **Lectura y primera vista** | Lee a primera vista 8 compases fáciles en 1.ª posición | Primera vista de 8 compases en 1.ª posición, como el grado 4 del ABRSM **[Estimación]** | Primera vista de 8-12 compases en 1.ª y 2.ª posición, como el grado 5 del ABRSM **[Estimación]** | Primera vista como el grado 6 del ABRSM **[Estimación]**: 9/8, 5/8 y hasta la V posición | Primera vista como el grado 7 del ABRSM **[Estimación]**: 7/8 y más de 12 compases | Primera vista como el grado 8 del ABRSM **[Estimación]** | Prepara y toca una pieza nueva en cinco minutos |
| **Tablatura** | Lee tablatura con ritmo y reconoce sus símbolos | Pasa cuatro compases de un sistema a otro | Lee unos compases de Milán en su cifra original | Compara una cifra original con la transcripción | Anota en tablatura su digitación de un pasaje | Su digitación de un pasaje, en tablatura, clara para otro | Lee unos compases del original |
| **Ritmo** | Cuenta en voz alta mientras toca | Tresillos y corcheas mezclados sin acelerar | La hemiolia de Lauro a tempo | Un grupo de cinco o siete sin acelerar | Dos contra tres a tempo | El recitativo del *Capricho* con pulso interior | El *Fandanguillo* con sus cambios de compás |
| **Solfeo** | Canta la melodía de *Lágrima* afinada | Canta una línea corta leída | Canta una melodía de ocho compases leída | Canta el bajo de una progresión | Canta el bajo de la folía mientras suena el tema | Canta una frase leída sin ayuda | Canta una frase antes de decidir su digitación |
| **Teoría** | Construye una escala y su triada en cualquier tonalidad del nivel | La teoría de un grado 5 del ABRSM | Explica la forma de cada obra del nivel | Explica la forma de una sonata clásica | Explica cómo está hecha una obra de variaciones | Explica el lenguaje de Falla y de Villa-Lobos | El análisis completo de *La Catedral* |
| **Armonía** | Dice qué función tiene cada acorde de sus obras | Armoniza una melodía de ocho compases | Encuentra una modulación en una obra | Encuentra una napolitana y una secuencia en una obra | Encuentra una sexta aumentada y una modulación lejana | Encuentra una cadencia andaluza y un paralelismo en una obra | Rearmoniza una frase y explica qué cambia |
| **Análisis** | Señala las frases y la forma de una obra corta | Explica la forma de la *Sonatina* de Giuliani | El mapa armónico y formal de la *Bourrée* | El análisis de un primer movimiento clásico | El mapa de *Julia Florida* con sus puntos de apoyo | El análisis del BWV 997, hecho por él | Explica qué hace distinta cada versión de una obra |
| **Oído** | Reconoce mayor o menor, los intervalos del nivel y la calidad de una triada; repite de oído una melodía corta | Reconoce las 6.ª, el V7 y si la música va al IV o al V; dice de qué época es una obra | Reconoce las 2.ª, la séptima disminuida y si una cadencia termina o queda abierta; toca de oído la voz de arriba de dos | Reconoce las 7.ª, la cadencia rota y adónde modula una frase; toca de oído la voz de abajo de dos | Reconoce el tritono, las progresiones de cuatro acordes y las cadencias con inversión; toca de oído la voz grave de tres | Reconoce un acorde y su inversión; transcribe el bajo de una variación | Reconoce las 9.ª y las cuatriadas de séptima; sigue la forma y las modulaciones de una obra entera |
| **Musicalidad** | Una frase que sube y se resuelve | Un crescendo largo que llega a su sitio | Una danza barroca y una mazurca con su carácter | Toca una obra de cada época con su estilo | Una obra larga con un solo arco | Explica en dos frases la interpretación de cada obra del programa | Un recital que suena a él |
| **Interpretación y memoria** | Recital corto con una obra de memoria (*Lágrima* u otra equivalente) | Recital con dos obras de memoria | Recital grabado de tres épocas | Diez minutos sin parar pase lo que pase | Toca el programa ante alguien | El programa, grabado | Recital personal de veinticinco a treinta minutos |
| **Repertorio** | Las tres obras del recital, y las demás tocadas enteras o en lo que pidan | Las obras del recital, dos de memoria | Las obras del recital grabado, dos de memoria | El programa de diez minutos | El programa de quince a veinte minutos | El programa de veinte a veinticinco minutos | Su recital, elegido por él de lo trabajado |
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
| Apoyando | **Sonido igual; la melodía** | La *a* que destaca en el arpegio | La melodía de los tres planos | Apoyando o tirando en escalas rápidas | *p* apoyando con la melodía (Villa-Lobos) | Apoyando o tirando según el color | Elección propia | Lo que ya sabe (◇) |
| Tirando y preparación | **Preparación; nota destacada** | a-m-i; Carlevaro 1-15 | Tres planos | Preparar justo antes de la nota; arpegio continuo | Arpegio extendido | Villa-Lobos | *Allegro solemne* | Su arpegio (◇) |
| Pulgar | **El bajo; melodía y bajo** | Pulgar melódico; apagar bajos | *p* con voz propia | Los bajos del arpegio continuo (BWV 999) | La melodía en el bajo | *p* de concierto | El pulgar de *Asturias* | Lo que ya sabe |
| Arpegios | **Giuliani op. 1; triadas de dos octavas** | Melodía en *a*; séptimas de dominante y disminuida | En posición; tres octavas | Continuo con cambio de acorde | Extendido; los del grado 8 | Villa-Lobos | Barrios y Villa-Lobos | Su arpegio (◇) |
| Escalas y velocidad | **Mayores en dos octavas; menores; sextas** | Con cambio de posición; décimas y octavas | Mi en tres octavas; terceras; **primeras ráfagas** | Ráfagas largas; ritmos; a-m-i; Fa en tres octavas | Sol, Fa♯, La y Mi menor en tres octavas; cromática en octavas | De concierto clásicas | Velocidad de concierto | La alternancia y los cruces del nivel 1 preparan las ráfagas del 3 |
| Ligados | **Dos notas; dedo fijo** | Tres notas; dobles y mixtos | Tres y cuatro | Largos y rápidos; escalas ligadas; glosas | Glosas de *Conde Claros* | *Estudio del ligado* | Según la obra | Lo que ya sabe (◇) |
| Ornamentos | **Mordente** | La apoyatura, explicada en el minueto | Trino medido; adornos de Sanz | Ornamentación barroca | El trino de Scarlatti | Ornamentar en estilo (Weiss) | Históricamente informados | Los ligados preparan cada ornamento |
| Cejilla | Media cejilla; **completa en el V** | En todos los trastes; formas móviles | Parciales; bajo el trémolo, lenta | Encadenadas; con extensión; bajo el trémolo, a tempo medio | Altas bajo el trémolo a tempo | Sostenidas en cuatro voces; con scordatura | Como decisión de digitación | La media cejilla prepara la del V; la del V, la de los trastes difíciles |
| Cambios de posición | **Dedo guía hasta la V-VII** | Sustitución, deslizamiento y salto; hasta la VII | Hasta la IX | Rápidos; hasta el XII | Cantando; todo el mástil | Por el color | Propios | El dedo guía de *Lágrima* |
| Extensiones | — | **Pequeñas (1-4)** | — | Mayores; con cejilla | En el arpegio extendido | En cuatro voces | Propias | El dedo común del nivel 1 |
| Acordes | **Abiertos mayores, menores y de séptima; dedo común** | Formas móviles; cuatriadas | En la polifonía; progresiones de danza | Napolitana; secuencias | Sexta aumentada; cuatro voces | Paralelos; cadencia andaluza | Rearmonizar; arreglar | Lo que ya sabe (◇) |
| Rasgueado | **Sencillo, para acompañar** | Clásico, con varios dedos | Barroco (*Canarios*) | — (ninguna obra lo pide) | Efectos del siglo XX (Brouwer) | Turina | *Fandanguillo* | El acompañamiento del nivel 1 |
| Trémolo | **Primer contacto, en cuerdas al aire** | Con bajo que cambia; una melodía de ocho compases | Sobre una progresión; con cejilla, lento | Con ráfagas; *Recuerdos*, la parte en La menor | *Recuerdos* entera, a tempo; sostenido | Con el bajo como voz; *Una limosna*, primera sección | *Una limosna* entera | El trémolo flamenco que ya hace (otra técnica, la misma mano) |
| Armónicos | **Naturales en XII, VII y V** | IV, IX y XIX; afinar | **Octavados** | Octavados en una melodía | Artificiales | Como resonancia (Falla) | Al servicio de la obra | Los naturales preparan el octavado, y este, el artificial |
| Vibrato | Escucharlo en *Lágrima* | **Empieza (*Romance*)** | En *Adelita* | Según el estilo (Llobet) | El del lied | Color propio | Propio | El oído del nivel 1 |
| Glissando y portamento | El signo, en la tablatura | **Glissando y arrastre** | **Portamento expresivo** | Portamento romántico (*Marieta*) | Glissando expresivo (Villa-Lobos) | Elección propia | Elección propia | El dedo guía, que ya desliza |
| Campanela | Dejar sonar cuerdas al aire | — | **Escala en campanela; *Canarios*** | Santiago de Murcia **[Por verificar]** | — | Mudarra (el arpa) | — | Apagar y dejar sonar voces, en el nivel 1 |
| Polifonía | **Melodía y bajo** | Dos voces independientes | Contrapunto a dos y tres voces | Imitación | Implícita (Bach); cuatro voces | Cuatro voces sostenidas; fantasía imitativa | De concierto | Los dos planos del nivel 1 |
| Efectos | Tasto y ponticello | **Pizzicato** | **Tambora y golpe** | Campanela como color | Efectos del siglo XX | Turina | *Asturias*, *Fandanguillo* | El color del nivel 1 |
| Scordatura | — | — | — | — | — | **La 6.ª en Re (*Capricho árabe*)** | — | Saber el mástil; el paso enseña lo que cambia |
| Picado (alternancia i-m) | ◇ **Se comprueba; sonido clásico, igual en los dos dedos** | Con cambio de posición | **Ráfagas** | Apoyando o tirando a velocidad | Glosas | Escalas de concierto | *Asturias* | Su picado flamenco, que no se da por dominado |

---

## 9. Progresiones de las áreas de comprensión y de repertorio
Las tablas salen de la columna «Qué desarrolla» de cada nivel (generadas, como la matriz global). Debajo de cada una, de dónde sale la calibración.

### 9.1 Lectura y primera vista
<!-- AREA:Lectura y primera vista:inicio -->
**Lectura y primera vista**

| Nivel | Qué desarrolla | Qué domina al salir |
|---|---|---|
| 1 | 1.ª posición en las seis cuerdas; sostenidos y un bemol; una y dos voces; la primera obra leída | Lee a primera vista 8 compases fáciles en 1.ª posición |
| 2 | Posiciones II y V; bemoles; acordes escritos; dos obras leídas enteras | Primera vista de 8 compases en 1.ª posición, como el grado 4 del ABRSM **[Estimación]** |
| 3 | Posición VII; tres voces; ornamentos escritos; obras leídas | Primera vista de 8-12 compases en 1.ª y 2.ª posición, como el grado 5 del ABRSM **[Estimación]** |
| 4 | Posición IX; tres y cuatro alteraciones; un preludio barroco leído; clave de fa | Primera vista como el grado 6 del ABRSM **[Estimación]**: 9/8, 5/8 y hasta la V posición |
| 5 | Todas las posiciones; un preludio de chelo leído; un sistema de piano | Primera vista como el grado 7 del ABRSM **[Estimación]**: 7/8 y más de 12 compases |
| 6 | Una obra aprendida desde la partitura, sin apoyarse en la tablatura; primera vista con dos voces | Primera vista como el grado 8 del ABRSM **[Estimación]** |
| 7 | Una obra entera desde la partitura; preparar una pieza en cinco minutos **[Decisión]**; leer una reducción de piano | Prepara y toca una pieza nueva en cinco minutos |
<!-- AREA:Lectura y primera vista:fin -->
**Calibración:** la primera vista toma del ABRSM la longitud, los compases y las tonalidades, del grado 1-3 en el nivel 1 al grado 8 en el 6 **[Estimación]**; a qué grado corresponde cada posición, **[Por verificar]**. **Leer una obra preparada y leer a primera vista son cosas distintas:** una obra se lee en la V o en la VII mucho antes de poder leer allí sin preparar. Las obras leídas vienen de uno o dos niveles por debajo **[Decisión]**; la primera vista de Trinity va unos dos grados por debajo **[Dato]**.

### 9.2 Tablatura
<!-- AREA:Tablatura:inicio -->
**Tablatura**

| Nivel | Qué desarrolla | Qué domina al salir |
|---|---|---|
| 1 | Tablatura con ritmo; sus símbolos; la cifra de Sanz | Lee tablatura con ritmo y reconoce sus símbolos |
| 2 | Traducir de tablatura a partitura y al revés; la tablatura de laúd (¿Sabías que…?) | Pasa cuatro compases de un sistema a otro |
| 3 | La cifra de la vihuela; la cifra de Sanz con rasgueos | Lee unos compases de Milán en su cifra original |
| 4 | La cifra de Narváez; las cifras de la guitarra barroca (¿Sabías que…?) | Compara una cifra original con la transcripción |
| 5 | La cifra de *Conde Claros*; la tablatura para anotar digitaciones propias | Anota en tablatura su digitación de un pasaje |
| 6 | Anotar sus digitaciones propias; la cifra de Mudarra | Su digitación de un pasaje, en tablatura, clara para otro |
| 7 | Leer el original de Dowland en tablatura francesa de laúd | Lee unos compases del original |
<!-- AREA:Tablatura:fin -->

### 9.3 Ritmo y solfeo
<!-- AREA:Ritmo:inicio -->
**Ritmo**

| Nivel | Qué desarrolla | Qué domina al salir |
|---|---|---|
| 1 | Figuras hasta la semicorchea; puntillo; 2/4, 3/4, 4/4 y 6/8; hemiolia | Cuenta en voz alta mientras toca |
| 2 | Tresillo; 3/8 y 2/2; síncopa completa; silencios a contratiempo | Tresillos y corcheas mezclados sin acelerar |
| 3 | Puntillo de corchea; 9/8 y 12/8; la hemiolia del vals venezolano; bajo y melodía con ritmos distintos | La hemiolia de Lauro a tempo |
| 4 | Grupos irregulares; cambios de compás; 5/8 y 7/8 | Un grupo de cinco o siete sin acelerar |
| 5 | Dos contra tres; 7/4; rubato sobre un pulso firme | Dos contra tres a tempo |
| 6 | Ritmo libre y recitativo; agógica de danza; la habanera | El recitativo del *Capricho* con pulso interior |
| 7 | Agógica propia; los cambios de compás de Turina; el ritmo ternario del fandango | El *Fandanguillo* con sus cambios de compás |
<!-- AREA:Ritmo:fin -->
<!-- AREA:Solfeo:inicio -->
**Solfeo**

| Nivel | Qué desarrolla | Qué domina al salir |
|---|---|---|
| 1 | Cantar 1-3-5; ecos de dos compases; cantar una melodía antes de tocarla | Canta la melodía de *Lágrima* afinada |
| 2 | Cantar los intervalos de la escala; cantar seis notas leídas; dictado rítmico | Canta una línea corta leída |
| 3 | Cantar una melodía leída con acompañamiento; cantar la voz superior de dos voces | Canta una melodía de ocho compases leída |
| 4 | Cantar la voz de arriba leída con la de abajo sonando; cantar el bajo de una progresión; la clave de fa | Canta el bajo de una progresión |
| 5 | La voz grave de tres; cantar una voz mientras suena otra | Canta el bajo de la folía mientras suena el tema |
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
| 5 | Sexta aumentada; modulación lejana; cromatismo | Encuentra una sexta aumentada y una modulación lejana |
| 6 | La armonía de Barrios (novenas) y de Villa-Lobos; impresionismo; el modo frigio y la cadencia andaluza en la música española de concierto | Encuentra una cadencia andaluza y un paralelismo en una obra |
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
| 1 | Frases; forma ABA y binaria; las cadencias dentro de la obra | Señala las frases y la forma de una obra corta |
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
| 6 | Acordes mayores y menores a cuatro notas, en estado fundamental y en 1.ª inversión; progresiones con I, IV, V y vi; transcribir fragmentos cortos | Reconoce un acorde y su inversión; transcribe el bajo de una variación |
| 7 | Novenas; cuatriadas mayor y menor de séptima; progresiones de cinco acordes con el 6/4 cadencial; la forma y las modulaciones de una obra entera | Reconoce las 9.ª y las cuatriadas de séptima; sigue la forma y las modulaciones de una obra entera |
<!-- AREA:Oído:fin -->
**Calibración [Dato]:** la escalera de intervalos, acordes y progresiones es la del RCM de 2024, nivel a nivel, que sustituye a la de su temario de 2018:

| Nivel | Se parece a | Intervalos, acordes y progresiones |
|---|---|---|
| 1 | RCM 4 | 3.ª menor y mayor, 4.ª, 5.ª y 8.ª, melódicos; triada mayor o menor; si una nota es la fundamental, la 3.ª o la 5.ª |
| 2 | RCM 5 | Las 6.ª; melódicos y después a la vez; el V7; I-IV-I o I-V-I |
| 3 | RCM 6 | Las 2.ª; la séptima disminuida; i-iv-i e i-V-i |
| 4 | RCM 7 | Las 7.ª; la triada aumentada; I-IV-V |
| 5 | RCM 8 | El tritono; progresiones de cuatro acordes (I-IV-V-I, I-IV-V-vi, I-vi-IV-V, I-vi-IV-I) |
| 6 | RCM 9 | Acordes mayores y menores a cuatro notas, en estado fundamental y en 1.ª inversión; progresiones con I, IV, V y vi |
| 7 | RCM 10 | Las 9.ª; cuatriadas con 7.ª mayor y con 7.ª menor; cinco acordes con el 6/4 cadencial |

Las cadencias, la modulación, la voz que se canta y lo que se describe de una obra (dinámica, carácter, estilo y época, textura, estructura) siguen al ABRSM, del grado 4 al 8 **[Dato]**. Cada pregunta de oído usa, siempre que se puede, la música del tramo.

### 9.7 Repertorio
<!-- AREA:Repertorio:inicio -->
**Repertorio**

| Nivel | Qué desarrolla | Qué domina al salir |
|---|---|---|
| 1 | Once obras cortas de cinco épocas | Las tres obras del recital, y las demás tocadas enteras o en lo que pidan |
| 2 | Doce obras de cinco épocas: tres troncales, las demás de aplicación o de lectura | Las obras del recital, dos de memoria |
| 3 | Once obras: tres troncales, seis de aplicación y dos de lectura | Las obras del recital grabado, dos de memoria |
| 4 | Cuatro troncales, cuatro de aplicación (una a elegir), dos fragmentos y una leída | El programa de diez minutos |
| 5 | Cuatro troncales, cinco de aplicación, una de dos a elegir y dos de lectura | El programa de quince a veinte minutos |
| 6 | Cuatro troncales, cinco de aplicación (una es un dúo), una de dos a elegir, un fragmento y una leída | El programa de veinte a veinticinco minutos |
| 7 | Cinco troncales, dos de aplicación, una de dos a elegir y una leída | Su recital, elegido por él de lo trabajado |
<!-- AREA:Repertorio:fin -->
**El detalle obra por obra, en [[repertorio]].** Hay cinco épocas en los siete niveles, obras leídas en todos, obras cortas en todos y fragmentos que preparan las obras largas.

**La carga [Decisión]:** las obras se clasifican en troncal, aplicación, lectura, fragmento y alternativa. Las troncales se aprenden enteras (de 3 a 5); de las de aplicación, él termina dos o tres, y de las demás basta el fragmento de la competencia. El techo es el de La Rioja: cinco obras y tres estudios por curso **[Dato]**.

**Las obras largas tienen ruta:** mapa, lo difícil aislado, sección a sección, enlaces, memoria y obra entera, sin plantilla: cada una pide lo suyo.

---

## 10. Experiencia de usuario
La experiencia es lineal: Nivel → Continuar → Lección → Paso → Lo he aprendido o Continuar.

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
| El paso se apoya en algo de antes (↩) | Lo recomienda («Te ayudará terminar antes la A de *Lágrima*») y deja seguir |
| Vuelve después de semanas sin entrar | Un repaso corto de lo último que estaba en práctica, y sigue donde estaba |
| Hay un encargo de su profesor | Una tarjeta encima del botón; el botón no cambia |

No hay sesiones, minutos ni «¿qué hago hoy?»: es una ruta. Puede practicar una obra cuando quiera desde Obras.

### 10.4 La lección
- El título y «En esta lección…».
- Después, los pasos uno a uno, con puntos de avance arriba, **Atrás** y el botón del paso.
- El selector **Partitura | Tab | Ambas** aparece solo en los pasos con notación, con el formato recomendado ya puesto según el objetivo del paso (leer: partitura; técnica: tablatura o las dos). Él lo cambia cuando quiera, también fragmento a fragmento.
- El metrónomo, solo en los pasos que lo usan, como herramienta secundaria.
- **Botones al terminar un paso de práctica:** **Lo he aprendido** (queda como «Hecho») o **Sigo practicando** (queda «En práctica», en el atril).

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
  - **la cejilla en el color del dedo 1**, y la barra cubre solo las cuerdas que pisa (media cejilla, cejilla parcial);
  - si hay scordatura, la afinación indicada encima (por ejemplo, 6.ª en Re).
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
| Paso | **Continuar**, o **Lo he aprendido** / **Sigo practicando** | Guarda el progreso; lo que sigue en práctica pasa al atril |
| Preguntas que corrige la app | Las preguntas y el resultado | Con el 90 % **[Decisión, ajustable]**, hecho |
| Repaso | Dentro de «Continuar», como un paso más («Toca la A de *Lágrima* sin calentar»), con **Bien · Regular · No salió** | La comprobación en frío y el dominio de siempre, invisibles; «No salió» añade un refuerzo |
| Final del tramo | Tocar lo del tramo, o unas preguntas, sin nota ni la palabra «comprobación» | Si algo falla, añade refuerzos; no se repite el tramo |
| Cierre del nivel | Recital de obras elegidas, y un repaso final de técnica, primera vista, oído y teoría | Cierra el nivel y propone el siguiente. Una competencia demostrada con otra obra equivalente cuenta igual |
| Lo que ya sabe | Pasos ◇ que se resuelven con una prueba corta; obras conocidas que se comprueban y no se reaprenden | La evaluación inicial de la Fase 3, sin su pantalla |

**Nada bloquea:** todo se ve y se puede abrir. «Continuar» solo recomienda.

---

## 12. *Lágrima*: por qué no se ve la partitura
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
1. **Siete niveles**, con la justificación del apartado 5.1, ahora basada en el RCM y el conservatorio.
2. **Los nombres «Nivel 1 … Nivel 7»**, sin subtítulo, y la equivalencia solo en Progreso (5.2).
3. **El tramo como unidad de formación con su música** y la regla de que cada técnica recorra todo el nivel (6 y [[cobertura]]).
4. **La progresión técnica** del apartado 8, en especial:
   - la cejilla completa, desde el final del nivel 1;
   - la velocidad, desde el 3;
   - la parte en La menor de *Recuerdos* en el 4 y *Una limosna* empezada en el 6.
5. **La clasificación de obras y la regla de carga** ([[repertorio]], apartados 1 y 2).
6. **El oído calibrado con el RCM** (apartado 9.6).
7. **Los estados visibles «Hecho · En práctica · Para repasar»** (10.5). Cambian una regla cerrada: los estados de la app siguen existiendo, pero el alumno ya no los ve.
8. **Las demás reglas cerradas que cambia el rediseño**, las mismas que en las versiones 1 y 2 ([[CURRICULO-MAESTRO (v1)]], apartado 0.3):
   - las prioridades del planificador;
   - la pantalla Profesor;
   - el dominio y la comprobación en frío visibles;
   - *Lágrima* como obra final única (ahora es la principal del nivel 1 y entra en su recital).
9. **Las obras con derechos** (Brouwer, Villa-Lobos, Lauro, Torroba, Falla, Turina): sin edición, la app no puede dar tablatura. ¿Las compra y se transcriben para su uso, o se quedan con la edición en papel?
10. **Lo marcado [Por verificar]**: se resuelve con la partitura delante, al implementar cada obra. Si una obra no trabaja lo que se le atribuye, entra su alternativa.

**Donde no estoy de acuerdo del todo, o veo un riesgo:**
- **El trémolo desde el nivel 1** no es lo que hace un conservatorio: La Rioja lo pone en Profesionales. Lo mantengo porque él ya hace el trémolo flamenco y sería desaprovecharlo, pero es una decisión, no un dato.
- **Cantar.** El solfeo cantado es lo que más resistencia suele dar a un adulto. Lo dejo en pasos cortos y siempre ligado a la obra, porque el ABRSM, el RCM y el conservatorio lo trabajan y es lo que hace que la lectura se oiga por dentro.

---

## Fuentes
- RCM, *Musicianship Addendum* (2024), requisitos de oído de los niveles Preparatorio a 10: https://teacherportal.rcmusic.com/getattachment/ca8bb6d9-8334-4eef-b876-c8e1f17afaea/rcm-musicianship-addendum-2024.pdf
- BOE n.º 154, de 28/06/2007, Orden ECI/1890/2007, currículo de las Profesionales en Ceuta y Melilla, con el horario por especialidad (guitarra incluida) y los contenidos de Armonía y de Conjunto: https://www.boe.es/boe/dias/2007/06/28/pdfs/A27813-27868.pdf
- Trinity College London, pruebas complementarias (primera vista, oído, improvisación): https://www.trinitycollege.com/site/?id=3173 · ejemplo de prueba de improvisación: https://blog.trinitycollege.co.uk/classical-jazz-supporting-tests-improvisation
- ABRSM, *Guitar Syllabus from 2019*, pruebas de oído de los grados 1-8 (copia en un centro irlandés): https://www.newschool.ie/wp-content/uploads/2019/09/complete_guitar_syllabus.pdf
- Conservatorio de La Rioja, programación de guitarra 2025-26, con las listas de repertorio de cada curso. El enlace está en [[CURRICULO-MAESTRO (v1)]].
- Da Capo Academy, lista de repertorio y estudios del RCM 2018: https://www.dacapomusic.ca/blog/rcm-classical-guitar-repertoire-and-etudes-all-pieces
- Mater Salvatoris (Madrid), programación de Profesionales 2026-27: https://madrid.matersalvatoris.org/wp-content/uploads/programacion-guitarra-ensenanzas-profesionales-2026-2027.pdf
- Las demás fuentes, en [[CURRICULO-MAESTRO (v1)]].
