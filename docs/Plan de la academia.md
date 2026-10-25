---
status: active
project: personal
type: plan
created: 2026-10-24
---
# Plan de la academia de guitarra (Fase 0, revisada)

Investigación y diseño pedagógico de la academia personal de guitarra de David. **Revisada el 24/10/2026** con sus correcciones; la primera versión es de esa misma tarde. **Segunda revisión, esa noche:** la tablatura es permanente (3.7), el dominio mira varios aspectos de calidad con criterios justificados y ajustables (7), y el pentagrama y el metrónomo vuelven al MVP (1.4, 14, 16). **Tercera revisión (25/10/2026, al aprobar la Fase 2):** aprobó la dirección visual B+ y la academia en **programas, cursos, ruta y pasos** (3.1, 8, 13): la clásica y la flamenca pasan a llamarse **programas**, las etapas **cursos** y las unidades **tramos** de la ruta de cada curso; donde este plan diga todavía «ruta clásica», «etapa» o «unidad», se lee así. La parte técnica (carpetas, módulos, datos, servidor, lo que ya funciona) está en [[Arquitectura de la academia]]. Índice: [[Academia]].

**Etiquetas:**
- **[Dato]** comprobable en una fuente.
- **[Evidencia]** investigación publicada, con su fuerza.
- **[Consenso]** práctica pedagógica extendida, sin estudio que la mida.
- **[Recomendación]** consejo mío.
- **[Decisión]** elección de diseño del sistema (se puede cambiar).
- **[Estimación]** nivel, duración o equivalencia calculados por mí.

## Cambios respecto a la primera versión
| Tema | Antes | Ahora | Por qué |
|---|---|---|---|
| Por qué 7 etapas | Se justificaba con la distancia del nivel 4 al 10 del RCM | Cada etapa es un **salto de capacidad** distinto (3.3); el RCM y los conservatorios solo calibran la dificultad de cada obra | Encajar con un conservatorio no es una razón pedagógica para su objetivo |
| Duraciones | 9-15 meses por etapa, casi como plazo | Solo orientación; se avanza cuando se domina | Petición suya; además, su técnica y su lectura irán a ritmos muy distintos |
| Áreas | 8 | 10 de la ruta clásica y comunes (añadidas **ritmo** y **diapasón**; escalas y arpegios juntos) y 5 propias del flamenco (3.2) | Faltaban dos capacidades que un guitarrista de tablatura suele tener flojas |
| Niveles por área | Se mostraban | **Deciden** el reparto de cada sesión, el material de cada área y si una obra se estudia con tablatura o partitura (3.4, 3.7, 8) | Petición suya: que no sea solo una estadística |
| Lectura | Requisito para pasar de etapa (L3 para la 1, etc.) | La lectura **no frena** la ruta: tiene su propio nivel y recibe más tiempo cuando va por detrás | Con su perfil, le habría dejado en la etapa más baja por un solo punto flojo |
| Partitura y tablatura | Hitos de «primera obra aprendida desde partitura» (etapa 1) y «la tablatura deja de ser la fuente principal» (etapa 3) | **Eliminados.** Las dos notaciones, siempre disponibles cuando el contenido las tiene; la app **recomienda** una según el objetivo, la lectura, la dificultad y el profesor, y nunca quita la otra (3.7) | Correcciones suyas (tarde y noche) |
| Dominado | Cumplir el criterio y volver a cumplirlo 14 días después | **Tres aciertos en frío y sin ayuda**, con intervalos crecientes, valorando **los aspectos de calidad que pide cada cosa** (notas, ritmo, continuidad, limpieza, sonido, dinámica, fraseo, memoria…); el tempo es una herramienta, no el criterio; los números, justificados y ajustables (7) | Un solo acierto tras 14 días puede ser suerte y no mide la estabilidad; y solo el tempo no dice si algo está bien tocado |
| Diagnóstico | La etapa de inicio la marcaba el área más floja | **Cada área por separado**, adaptativo, y la ruta se sitúa por su técnica y su repertorio; lo que ya sabe se comprueba, no se repite (6) | Corrección suya |
| Biblioteca | Objetivo de 150-250 obras | **Sin límite**: crece archivo a archivo; admite obras suyas y de su profesor, con marcas (objetivo futuro, aspiracional, en preparación…) y el porqué de cada recomendación (9) | Petición suya |
| Pentagrama y metrónomo (mi propuesta n.º 6) | En el MVP | **Se mantienen en el MVP**, y con ellos la tablatura en pantalla (las dos salen de la misma notación) | En la primera revisión los quité al entender que su «punto 6» era esta propuesta; se refería al punto 6 de su propia revisión. Restaurado el 24/10/2026 por la noche |
| Tecnología | Preact y htm; contenido en módulos de JavaScript; un solo archivo de progreso; service worker | **Sin librerías** en la interfaz; contenido en **JSON** (y Markdown para textos largos); progreso en **dos archivos** (estado + historial mensual); sin service worker por ahora | Detalle en [[Arquitectura de la academia]] |
| ¿Qué hago hoy? | Hasta 90 minutos, reparto con ajustes | Hasta **2 horas**, con un orden de prioridades explícito, objetivos a largo plazo y lo que está «a punto de olvidarse» (8) | Petición suya |
| Datos sin comprobar | ABRSM pide teoría de grado 5 para los grados 6-8; «60-90 minutos al día es lo de Profesionales» | Quitados | No los había comprobado y no hacían falta |

## Resumen
- **Dos rutas independientes:** clásica (principal, 7 etapas y un Horizonte de objetivos futuros) y flamenca (secundaria, 6 etapas). Comparten una biblioteca común (lectura, ritmo, teoría, armonía, oído, diapasón), pero cada cosa dice a qué formación pertenece y ninguna ruta pide nada de la otra.
- **Nivel por área**, calculado a partir de lo que domina, y que manda de verdad en la planificación.
- **Partitura y tablatura, siempre las dos.** La tablatura no se retira nunca; la app recomienda una u otra según el objetivo y el momento, y él cambia cuando quiere, también fragmento a fragmento. La lectura es un pilar propio que crece cada día.
- **Completado** («lo he hecho») frente a **dominado** («lo sé hacer»): tres aciertos en frío, sin ayuda y espaciados, con los aspectos de calidad que pida cada cosa.
- **El profesor manda:** sus encargos van primero en «¿Qué hago hoy?».
- **App local** con los datos en archivos de la vault, copias automáticas, exportar e importar. Sin servicios de pago.

---

## 1. Conclusiones de la investigación

### 1.1 Cómo se organizan los currículos reconocidos
| Sistema | Estructura | Qué evalúa en cada nivel |
|---|---|---|
| **Royal Conservatory of Music (RCM), guitarra 2018** | Preparatorio, niveles 1-10 y diploma ARCT; libros de repertorio y estudios del Preparatorio al 8 | Repertorio por listas, estudios, pruebas técnicas, oído y primera vista; en el nivel 9, cuatro obras, dos estudios y pruebas técnicas **[Dato]** |
| **ABRSM, guitarra desde 2019** | Grados 1-8 | Tres obras (listas A, B y C), escalas y arpegios, primera vista y pruebas auditivas **[Dato]** |
| **Trinity College London, guitarra clásica** | Initial y grados 1-8 | Obras, trabajo técnico (escalas y arpegios o estudios) y pruebas a elegir: primera vista, oído, improvisación y conocimiento musical; en los grados 6-8, primera vista obligatoria **[Dato]** |
| **Conservatorio en España, guitarra** | 4 cursos de Elementales y 6 de Profesionales; en Castilla y León, Decreto 60/2007 (modificado por el 24/2018) **[Dato]** | Repertorio orientativo por cursos y épocas, obras de memoria, primera vista, análisis y, en algunos centros, cifra de vihuela y tablatura de laúd (programación de Mater Salvatoris, Madrid) **[Dato]** |
| **Conservatorio en Andalucía, guitarra flamenca** | 6 cursos de Profesionales, cada uno con sus palos (CPM Javier Perianes, Huelva, 2022-23) **[Dato]** | Obra y estudios o falsetas de memoria, armonía y escalas, estilos por tradición oral, audiciones y, en 6.º, un concierto de al menos 25 minutos y acompañar un baile **[Dato]** |

**Lo que comparten [Consenso]:** separan obras, trabajo técnico y formación musical; piden estilos distintos; la primera vista se examina con material mucho más fácil que las obras del mismo nivel. **Lo que se toma de ellos:** la calibración de la dificultad de las obras y el orden de los palos. **Lo que no:** su organización por cursos, sus requisitos de examen y su ritmo, pensados para quien quiere ser profesional.

**Equivalencias de obras [Dato]** (RCM 2018 y programación de Madrid): *Lágrima*, nivel 4 y 1.º de Profesionales; *Adelita* y la *Bourrée* BWV 996, nivel 6 y 1.º-3.º; *Preludio* BWV 999, nivel 7 y 4.º; *Julia Florida* y el *Preludio saudade* de *La Catedral*, nivel 8 (*Julia Florida*, también 4.º); *Recuerdos de la Alhambra*, 5.º-6.º; *Capricho árabe*, *La Catedral* completa y los *Estudios* 1, 2, 8 y 11 de Villa-Lobos, 6.º.

### 1.2 Qué dice la investigación sobre la práctica
- **La cantidad importa, pero no lo explica todo:** la práctica deliberada explica en torno al 21 % de las diferencias de nivel en música (Macnamara, Hambrick y Oswald, 2014), con estimaciones mayores en otros análisis **[Evidencia sólida, cifras discutidas]**. Se mide la calidad, no solo los minutos.
- **Retiene más quien toca bien, no quien toca mucho:** en Duke, Simmons y Cash (2009), con 17 pianistas avanzados, el tiempo y las repeticiones no predijeron la ejecución del día siguiente; el porcentaje de intentos correctos, sí **[Evidencia, correlacional y con muestra pequeña]**. Por eso cuentan las pasadas limpias.
- **Lo que sale bien durante la práctica no prueba que se haya aprendido** (Soderstrom y Bjork, 2015) **[Evidencia sólida]**. Base de las comprobaciones «en frío», antes de calentar ese pasaje.
- **Repartir la práctica en el tiempo funciona mejor que concentrarla**, también en habilidades motoras (Stafford y Haasnoot, 2017) **[Evidencia sólida en general; poca específica de música]**. Base de los repasos espaciados y de la lectura en dosis diarias.
- **Intercalar obras o secciones puede ayudar a retener** (Carter y Grahn, 2016, con 10 clarinetistas) **[Evidencia preliminar]**: se intercala en las sesiones largas.
- **La primera vista se entrena aparte:** el ritmo y el reconocimiento de patrones la mejoran, y las horas de práctica informal no la predicen (Zhukov, 2014 y 2016, sobre todo con pianistas) **[Evidencia]**.
- **El oído se entrena mejor en contexto tonal**, combinando intervalos y grados **[Consenso, poca evidencia experimental]**.

### 1.3 Métodos y materiales de referencia
- **Técnica clásica [Consenso]:** Carlevaro (*Escuela de la guitarra* y sus cuadernos), Shearer (*Learning the Classic Guitar*), Tennant (*Pumping Nylon*), Pujol (*Escuela razonada*), Iznaola (*Kitharologus*) y los 120 arpegios del op. 1 de Giuliani.
- **Estudios progresivos [Dato]:** Sor (op. 60, 31, 35, 6), Aguado, Carcassi (op. 60), Giuliani (op. 48, 50, 51, 100), Coste (op. 38), Sagreras, Brouwer (*Estudios sencillos*), Villa-Lobos (*Doce estudios*).
- **Lectura [Consenso]:** Benedict (*Sight Reading for the Classical Guitar*), Leavitt (*Reading Studies for Guitar*, *Melodic Rhythms*), Noad (*Solo Guitar Playing*). En guitarra se lee **por posiciones**, porque la misma nota está en varias cuerdas.
- **Flamenco:** las programaciones de conservatorio, Óscar Herrero (*Tratado de guitarra flamenca*), Juan Martín (*El arte flamenco de la guitarra*), Graf-Martinez (*Flamenco Guitar Method*), Paco Peña (*Toques flamencos*) y Manuel Granados (*Teoría musical de la guitarra flamenca*). Su material: [[Flamenco]], [[Ejercicios]], [[Online Flamenco]].
- **Partituras:** dominio público en IMSLP; los arreglos y obras modernas tienen derechos.

### 1.4 Lo que propongo cambiar de su planteamiento (tras su revisión)
1. **Nivel por área en vez de un número único** **[Decisión]**.
2. **Etapas grandes con unidades de 6-10 semanas**, para que el avance se note **[Decisión]**.
3. **Biblioteca sin límite, pero solo con datos comprobados:** cada obra dice de dónde sale su nivel y si es dato o estimación **[Decisión]**.
4. **Solfeo práctico:** leer tocando, ritmo, y canto donde ayude al oído; no el lenguaje musical completo del conservatorio **[Recomendación]**.
5. **Su profesor manda** **[Decisión]**.
6. **El pentagrama, la tablatura en pantalla y el metrónomo, en el MVP**, no en la Fase 4: sin ellos no se puede trabajar su mayor carencia, la lectura, ni cambiar de una notación a otra **[Decisión]**.
7. **Grabarse** desde la app (Fase 5), antes que esperar al análisis por IA **[Recomendación]**.
8. **La ruta guía, no encierra:** la biblioteca está siempre abierta y nada se bloquea por un área floja **[Decisión]**.
9. **Datos en disco, en la vault**, y no solo en el navegador **[Decisión]**.
10. **Tipografía cinética en momentos con intención** (entrar a un curso, a una obra, empezar la sesión, un logro) y nunca mientras se lee o se toca **[Decisión suya, 24/10/2026; antes: «solo donde enseña»]**.
11. **Sesiones largas con pausa** (5 minutos cada 50) **[Recomendación]**.

---

## 2. Perfil del alumno

18 años; toca desde la primavera de 2025 con una Yamaha C40; clase los martes de 18:00 a 19:00; 60-90 minutos al día (a veces 20-45). Lee tablatura con soltura; pentagrama, muy poco. Formación sobre todo flamenca: compás y bases de bulerías, soleá, alegrías (en Do), tangos y fandangos; picado (le cuesta la velocidad), trémolo, arpegio, alzapúa y ligados; falsetas propias ([[Soleá]], [[Bulerías]], [[Alegrías]]). Obras: *Agua Marina* (Paco Cepero) casi entera, partes de *Entre dos aguas*, *Stairway to Heaven*, *Lágrima* en parte, su [[Estudio en Mi menor]] y empezada la [[Passacaglia (Händel)]]. Por identificar: *El Romancero gitano* y *Nocturnal Smatter*. **Objetivo:** ser muy buen guitarrista por gusto.

**Hipótesis por área (la confirma el diagnóstico) [Estimación]:**
| Área | Hipótesis | Por qué |
|---|---|---|
| Técnica | 1-2 | Lo flamenco se transfiere; falta el sonido clásico y el equilibrio de voces |
| Escalas y arpegios | 1 | Las toca, sin conocerlas como tonalidades |
| Repertorio clásico | 1 | *Lágrima* en parte |
| Interpretación | 1 | Sin datos de fraseo y memoria en clásico |
| Lectura | 0-1 | Lee muy poco pentagrama |
| Ritmo | 1-2 | Pulso y compás flamenco buenos; leer ritmo, poco |
| Teoría y armonía | 0-1 | Acordes y cadencias de oído, sin teoría |
| Oído | ? | Se mide |
| Diapasón | 0-1 | Conoce trastes, no necesariamente notas |
| Flamenco (compás, técnica, toque) | 1-2 | Bases de varios palos y falsetas |

---

## 3. Currículo propuesto

### 3.1 Estructura (aprobada el 25/10/2026)
**Programa → Curso → Ruta del curso (tramos) → Paso → competencias, ejercicios, lecciones y obras**, y al final de cada curso, su **obra final** **[Decisión, aprobada por él]**.
- **Programa:** el clásico (principal) y el flamenco. Cada uno con sus cursos; no se mezclan (antes se llamaban «rutas»).
- **Curso:** un salto de capacidad (las antiguas etapas: 7 clásicos y 6 flamencos, 3.3). **Integral:** trabaja todas las áreas, cada una con su peso; nunca hay un curso por materia.
- **Ruta del curso:** el camino que se recorre dentro de un curso, en **tramos** (las antiguas unidades, 6-10 semanas de orientación), cada uno con su obra eje y su cierre.
- **Paso:** cada punto del camino. Tiene una clase (habilidad, aplicación, obra, evaluación o preparación) y un área, y dice qué trabaja, qué contiene, en qué se apoya y qué obras prepara.
- **Competencia (habilidad):** algo concreto que se sabe hacer, con su criterio de dominio. Pertenece a **un área** y a **un programa** (o es común) y tiene un **nivel** dentro de su área. **Como son las mismas competencias de cada área, aprender la teoría de un paso sube el nivel de teoría**: el currículo integrado y los niveles por área no se contradicen.
- **Obra final del curso:** reúne lo trabajado y lo dice («Esta obra reúne…»), con sus requisitos (la del curso 1, *Lágrima* completa, de memoria y grabada) y un paso de preparación antes. El validador exige que todo lo que pide se trabaje en la ruta de ese curso o de uno anterior.
- **Ruta y obras, en los dos sentidos:** cada paso dice qué obras (o qué parte) prepara; cada obra, qué trabaja, qué necesita, qué ya tiene, qué hay que reforzar y qué no está consolidado, con enlace a dónde se trabaja cada cosa. Si una obra necesita algo flojo, la ruta pone un **refuerzo** justo antes.
- **Visible no es recomendado:** todos los pasos se ven y se pueden abrir y practicar; «recomendado» significa que la app ya lo propone. Nada se bloquea. Estados: ✓ hecho (o dominado), ↻ repaso, ● ahora o recomendado, ○ próximo, ○ más adelante, ★ obra final.
- **El ciclo de cada tramo:** objetivo → conocimiento → ejercicio → aplicación → obra → necesidades → refuerzo → vuelta a la obra → avanzar, con conexiones secundarias entre pasos.
- **Lo que ya sabía no se reinicia:** si marca una obra como conocida (una parte, entera o dominada), no se vuelve a aprender: se comprueba con una pasada en frío; si sale, queda aprendida y la ruta sigue; si algo falla, la ruta dice qué reforzar. Estados de una obra: sin empezar · empezada · aprendida · dominada · la conoces, por comprobar (también «dominada de antes») · en repaso; y, si es obra final, sirve de evaluación.
- **La lectura no frena:** sus pasos se recomiendan, pero no cierran tramos ni cursos, y la tablatura sigue siempre a mano (3.7).
- **Biblioteca común:** lo que comparten los dos programas.

### 3.2 Áreas
| Grupo | Áreas |
|---|---|
| Ruta clásica | Técnica · Escalas y arpegios · Repertorio · Interpretación (musicalidad, estilo, memoria, tocar de principio a fin) |
| Comunes | Lectura · Ritmo · Teoría · Armonía · Oído · Diapasón (notas en el mástil, posiciones, relación pentagrama-mástil, armónicos, el instrumento) |
| Ruta flamenca | Compás · Técnica flamenca · Toque (falsetas y obras) · Acompañamiento · Armonía flamenca |

Cada cosa lleva su marca: **Clásica**, **Flamenca** o **Común** **[Decisión]**.

### 3.3 Las etapas y por qué son 7 (clásica) y 6 (flamenca)
Una etapa existe si exige algo **cualitativamente nuevo** que las obras siguientes dan por hecho **[Decisión]**:
| Etapa | Salto | Por qué va aquí |
|---|---|---|
| 1 · Sonido y control | Del sonido de tablatura y flamenco al sonido clásico: melodía por encima del acompañamiento, presión justa, primera posición limpia | Todo lo demás se apoya en el sonido |
| 2 · Cejilla y posiciones | Cejilla completa y posiciones bajas; arpegio con melodía | La mayoría del repertorio intermedio pide cejilla |
| 3 · Dos voces y todo el mástil | Voces independientes y posiciones hasta la XII | La polifonía es la capacidad propia de la guitarra clásica |
| 4 · Velocidad y estilos | Escalas y arpegios rápidos; Renacimiento y Barroco con su estilo | La velocidad necesita una base limpia; el estilo, la polifonía |
| 5 · Obras de concierto | Sostener obras de 4-6 minutos que mezclan técnicas | Combinar lo anterior sin perder el control |
| 6 · Trémolo y gran forma | Trémolo a tempo de obra, resistencia, formas largas | El trémolo es una técnica especializada; pide todo lo anterior |
| 7 · Autonomía | Digitar e interpretar solo; obras mayores | Es el punto de «muy buen guitarrista aficionado» |

Lo que queda más allá (*Asturias*, la *Chacona*, *Un sueño en la floresta*) es el **Horizonte**: se ve desde el principio, con lo que le falta. En flamenco, las 6 etapas siguen la secuencia de palos de la programación de Huelva **[Dato]**, porque cada familia de palos trae un compás, una armonía y un acompañamiento nuevos; se adaptan a que ya conoce varias bases.

**Duración, solo como orientación [Estimación]:** etapa 1, 6-9 meses; las demás, 9-15 meses. **Se pasa de etapa cuando se domina su núcleo, ni antes ni después.**

### 3.4 Niveles por área
- **Cada área tiene su nivel** (1-7 en las clásicas y comunes; 1-6 en las flamencas), calculado así: se alcanza el nivel N cuando todas las competencias de núcleo del área hasta N están completadas y al menos el 80 % dominadas. Debajo se ve el avance hacia el siguiente (por ejemplo, «Lectura 1 · 40 % hacia el 2») **[Decisión]**.
- **Repertorio** (y **Toque** en flamenco) se mide por obras: nivel N cuando hay al menos dos obras de nivel N o superior completadas.
- **El diagnóstico** puede dar una **estimación** por área («Técnica 2, a confirmar»), que vale hasta que una comprobación la desmienta.
- **La etapa de la ruta** es la de su técnica y su repertorio (el «nivel de referencia»): lectura, teoría u oído flojos no le bajan de etapa.
- **Para qué sirven** (y no solo para mirarlos): reparten los minutos de cada sesión (un área por detrás del nivel de referencia recibe más tiempo), eligen el material de cada área (se trabaja en su nivel, no en el de la etapa), pesan en qué notación se recomienda (sin quitar la otra) y filtran qué obras son estudiables ahora.

### 3.5 Progresión por áreas en la ruta clásica
Las áreas comunes avanzan a su ritmo; esta tabla dice qué nivel suele acompañar a cada etapa, que es el que usa el planificador como referencia **[Decisión]**.

| Área | 1 · Sonido y control | 2 · Cejilla y posiciones | 3 · Dos voces y mástil | 4 · Velocidad y estilos | 5 · Obras de concierto | 6 · Trémolo y gran forma | 7 · Autonomía |
|---|---|---|---|---|---|---|---|
| **Técnica** | Apoyando y tirando con sonido clásico; preparar el dedo; equilibrio melodía-acompañamiento; presión mínima; media cejilla | Cejilla completa; cambios de posición guiados hasta la V; ligados con dedo fijo; apagar bajos | Posiciones hasta la XII; voces independientes; mordente y trino; armónicos naturales; color (ponticello, tasto) | Velocidad; ligados largos; extensiones; rasgueado clásico; campanelas; trémolo a velocidad media | Armónicos octavados; cejillas con cambios rápidos; resistencia en obras de 4-6 min | Trémolo a tempo de obra; tres y cuatro voces; dinámica fina con velocidad | Resolver la técnica de una obra nueva por su cuenta |
| **Escalas** | Mayores y menores en 1.ª posición (Do, Sol, Mi, La m, Mi m), una y dos octavas; cromática | Dos octavas con cambio de posición, hasta 2 alteraciones | Tres octavas; hasta 3-4 alteraciones | A velocidad; en terceras y sextas; ligadas | Todas las tonalidades; en octavas | Escalas de las propias obras, digitadas por él | Mantenimiento |
| **Arpegios** | p-i-m-a y p-a-m-i; Giuliani op. 1 (primeros); destacar la melodía | Melodía en *a* y en *p*; con cejilla | En posiciones altas; sin cortes en los cambios | Rápidos; de cuatro notas en todas las posiciones | Extendidos; campanela | Combinados con trémolo; resistencia | Al nivel de los *Estudios* de Villa-Lobos |
| **Repertorio** | Piezas de 1-3 min en 1.ª posición (*Lágrima*, Sor, Aguado, Sanz, Dowland) | Piezas de 2-4 min con cejilla y arpegio (*Romance*, Carcassi op. 60, Brouwer) | Polifonía y posiciones (*Adelita*, *Bourrée* BWV 996, Sor op. 35 n.º 22) | Estilos y velocidad (BWV 999, vihuelistas, Llobet) | Obras de concierto medianas (*Julia Florida*, Scarlatti, *Marieta*) | Obras largas (*Recuerdos*, BWV 995/998) | Obras mayores (*Capricho árabe*, *La Catedral*, Villa-Lobos) |
| **Lectura** (referencia; avanza aparte) | 1.ª posición, cuerdas agudas y graves; figuras básicas | 1.ª posición completa, alteraciones, dos voces | Posiciones II y V; armaduras hasta 2 | Posición VII; 3 alteraciones; ornamentos | Todas las posiciones hasta la IX; polifonía | Lectura fluida de obras de la etapa 5 | Aprender cualquier obra de la etapa 6-7 desde partitura |
| **Ritmo** | Pulso con metrónomo; corcheas y semicorcheas; 2/4, 3/4, 4/4; puntillo; contar en voz alta | 6/8 y compases compuestos; síncopa; tresillos; silencios a contratiempo | Ritmos distintos en bajo y melodía; hemiolia | Cambios de compás; ritmos de danza barroca y latinoamericana | Dos contra tres; rubato sobre el pulso | Ritmo flexible en obras largas | Agógica con criterio propio |
| **Teoría** | Pentagrama, tono y semitono, intervalos básicos, escala mayor, triadas mayor y menor | Todas las escalas y armaduras; círculo de quintas; las tres menores; cuatro triadas; inversiones; cuatriadas | Modulación; notas de adorno; formas binaria, ternaria y rondó | Modos (y el modo flamenco); suite y sonata; ornamentación barroca | Armonía cromática; formas grandes | Armonía del siglo XX | Estilo histórico y análisis completo |
| **Armonía** | I-IV-V7-I; sensible y séptima; cadencia perfecta; mayor y menor homónimos | Funciones (tónica, subdominante, dominante); cadencias; ii-V-I; V/V | Dominantes secundarias; modulación a tonos vecinos | Napolitano; secuencias por quintas | Sexta aumentada; modulación lejana | Armonía de Barrios y Villa-Lobos | Rearmonizar e improvisar sobre progresiones sencillas |
| **Oído** | Mayor o menor; cantar la tónica; 3.ª, 5.ª y 8.ª; cadencia conclusiva o suspensiva | Todos los intervalos melódicos; cuatro triadas; dictados cortos | Intervalos armónicos; I-IV-V-vi; dictado a dos voces | Modos; dominantes secundarias; dictado del bajo | Progresiones cromáticas; sacar melodías de oído | Transcribir fragmentos | Reconocer formas y modulaciones al escuchar |
| **Diapasón** | Notas de la 1.ª posición; nota-cuerda-traste; afinar; uñas | Notas hasta el traste V; la misma nota en otra cuerda; formas de cejilla en cualquier traste | Mástil hasta la XII; armónicos naturales (dónde y qué nota); intervalos como formas | Escalas y arpegios por posiciones; dónde pulsar para cada color | Armónicos octavados; digitaciones alternativas; transportar | Digitar con criterio | Autonomía total |
| **Musicalidad** | Melodía por encima; piano y forte; frase con principio y final | Crescendo y diminuendo; legato y staccato; carácter | Peso distinto en cada voz; color; articulación | Estilo de cada época | Rubato con pulso; el arco de toda una obra | Interpretación propia razonada | Voz propia |
| **Interpretación** | Una pieza entera sin parar; una de memoria | Dos de memoria; grabarse | Repertorio vivo de 3-4 obras; grabación mensual | Programa de 10 min; seguir tras un error | Programa de 15-20 min | Obras largas de memoria; 20-25 min | Recital personal de 25-30 min, grabado |

**Comprobación de coherencia:** ningún paso pide algo que no esté antes (la cejilla completa, en la 2, antes de las posiciones de la 3; el trémolo, lento en la 2, a media velocidad en la 4 y a tempo en la 6; las dominantes secundarias, en la 3, después de las funciones de la 2; el oído va detrás de la teoría que nombra lo que se oye).

### 3.6 Ficha de concepto (currículo integrado)
Cada objeto musical importante tiene una ficha que lo enlaza todo. Ejemplo, *Mi mayor*:
- **Guitarra:** acorde abierto (cuerdas 6 a 1: 0-2-2-1-0-0) y con cejilla en la VII (forma de La).
- **Notas y construcción:** Mi, Sol♯, Si: fundamental, tercera mayor (4 semitonos) y quinta justa (7). En el acorde abierto suenan Mi2, Si2, Mi3, Sol♯3, Si3 y Mi4.
- **Oído:** de Mi mayor a Mi menor solo cambia Sol♯ por Sol (3.ª cuerda, del traste 1 al aire).
- **Armonía y tonalidad:** I de Mi mayor, V de La mayor y de La menor, IV de Si mayor.
- **Escala:** Mi, Fa♯, Sol♯, La, Si, Do♯, Re♯.
- **Lectura:** las seis notas del acorde abierto van desde debajo de la 3.ª línea adicional inferior hasta el 4.º espacio (la guitarra se escribe una octava más aguda de lo que suena).
- **Aplicación y ejercicio:** Mi–La–Si7–Mi. En Si7 (Si, Re♯, Fa♯, La), Re♯ sube medio tono a Mi y La baja medio tono a Sol♯; esas dos notas forman un tritono, por eso el acorde pide resolver. Ejercicio: la progresión a ♩=60, un acorde por compás, con pulgar y luego en arpegio; criterio: ocho compases sin cortar el pulso; después, cantar la fundamental de cada acorde mientras se toca.
- **En la ruta flamenca** (ficha enlazada, no mezclada): Mi es el reposo del modo flamenco «por arriba».

### 3.7 Partitura y tablatura: las dos, siempre
**Principio [Decisión, corrección suya del 24/10/2026]:** la tablatura es permanente. Siempre que el contenido tenga las dos, el selector **Partitura | Tablatura** está a la vista, en cualquier etapa y nivel. **Las etapas cambian lo que la app recomienda, nunca lo que permite.** La lectura sigue siendo un pilar propio (nivel, competencias y tiempo diario); lo que no hace es quitarle la tablatura a nada.

- **Una sola fuente, dos vistas:** la notación propia de la app guarda cada nota con su cuerda y su traste, y de ahí salen la partitura y la tablatura; por eso se cambia de una a otra sin perder el sitio. Si una obra solo está fuera (IMSLP, un libro), la app dice dónde; si falta una de las dos, lo dice («por hacer»).
- **Cada obra, ejercicio o sección dice** qué tiene (las dos, solo partitura o solo tablatura), su **formato principal** si lo tiene (aquel para el que está pensado), y el **motivo pedagógico**. Una sección puede llevar los suyos y la lectura que pide.
- **El formato depende del objetivo:** técnica, ligados, arpegios, patrones, posiciones, mano derecha, escalas, flamenco, coordinación y fragmentos de obra, en **tablatura**; lo que tiene como objetivo leer, en **partitura**.
- **Cómo se elige la recomendación** (manda la primera que aplique):
  1. Lo que pida **su profesor** en un encargo.
  2. El **formato principal** del contenido.
  3. El **propósito del bloque** de la sesión: un bloque de lectura, partitura (con la tablatura para comprobar); uno de técnica, tablatura.
  4. **Su preferencia** de estudio, si la ha puesto.
  5. **Su lectura frente a la obra o al fragmento**, junto con lo que le exige técnicamente y si ya la conoce:
     | Situación | Recomienda |
     |---|---|
     | Su lectura llega a la que pide y la técnica no le desborda | Partitura |
     | Su lectura llega, pero la obra le exige técnicamente bastante más que su nivel | Tablatura mientras la monta; después, partitura |
     | Le falta hasta un nivel de lectura y ya la toca | Partitura: leer algo que ya conoce es de lo mejor para leer |
     | Le falta hasta un nivel y es nueva | Tablatura, y partitura en los pasajes que pueda leer |
     | Le falta más | Tablatura; la lectura avanza por su lado |
     Los umbrales («un nivel», «bastante más») son **[Decisión, ajustable]**: no hay estudio que los fije.
- **No es una regla por nivel:** pesan su lectura, la dificultad real, el objetivo de la obra y de la sesión, el fragmento, si toca aprender o leer, su preferencia y el profesor.
- **Los cuatro casos que pidió:**
  - **A.** Ejercicio técnico que solo tiene tablatura: se ve la tablatura y la app dice que la partitura no está.
  - **B.** Obra con las dos: cambia cuando quiera; lo elegido se recuerda en esa obra.
  - **C.** Fragmento difícil de leer en una obra recomendada en partitura: cambia ese fragmento a tablatura sin cambiar la obra.
  - **D.** Según mejora su lectura, la app recomienda partitura en más obras y fragmentos (primero en los que ya toca); «Ver tablatura» sigue a un toque.
- **Su elección manda** y se recuerda (por obra, ejercicio o sección); la recomendación solo lleva una estrella ★ con su porqué, y «Volver a la recomendada» la recupera.
- **Aviso cuando hace falta:** *«Tu técnica permite esta obra, pero tu lectura (1,4) todavía está por debajo de la que pide para estudiarla solo con partitura (3). La app te recomienda tablatura; la partitura sigue disponible.»*
- **Puentes:** los pasajes de sus obras que ya puede leer entran como ejercicios de lectura sobre su propio repertorio.

### 3.8 Solfeo práctico
Cada ejercicio de lectura une **lo escrito, lo que se oye y lo que se toca** **[Decisión]**:
- **Lee y toca:** una línea en el pentagrama, que se toca en la guitarra en la posición indicada.
- **Ritmo:** se lee, se cuenta en voz alta, se palmea y se toca en una cuerda al aire.
- **¿Dónde está?:** una nota del pentagrama → su sitio (o sitios) en el mástil, y al revés.
- **Patrones:** escalas, arpegios e intervalos vistos como dibujos en el pentagrama, para leer grupos y no nota a nota.
- **Compás y tonalidad:** reconocer el compás y la armadura, decir la tonalidad y tocar su escala.
- **Canta y toca:** cantar un intervalo o la tónica antes de tocarlo (entrena el oído; no es solfeo cantado de conservatorio).
- **Cada símbolo se presenta con su sentido** (por qué un puntillo alarga, qué hace una armadura) y se toca en el momento.
- **Primera vista,** cuando corresponde, con material por debajo de su nivel de lectura **[Consenso]**.

---

## 4. Ruta clásica: repertorio de cada etapa

La progresión de cada área está en 3.5; aquí van las obras que calibran cada etapa. Entre paréntesis, el nivel que les dan las fuentes: **RCM n** (libros de 2018), **EPM n** (curso de Profesionales en Madrid), **est.** (estimación mía). Es material de partida para la Fase 3: cada obra entrará en la app con sus datos completos y su razón pedagógica.

### Etapa 1 · Sonido y control
| Unidad | Obra eje | Técnica | Escala | Teoría y armonía | Oído |
|---|---|---|---|---|---|
| **1. Melodía acompañada en Mi mayor** | *Lágrima*, parte A (Tárrega, RCM 4) | Melodía apoyando sobre acompañamiento tirando; preparar el dedo; presión mínima | Mi mayor, 1.ª posición, 2 octavas | Tono y semitono; fórmula de la escala mayor; triada mayor; I-IV-V7-I en Mi | Mayor o menor; V7→I |
| **2. El cambio de modo** | *Lágrima*, parte B (Mi menor) | Media cejilla; cambio de posición con dedo guía | Mi menor natural, armónica y melódica | La menor armónica y la sensible; tono homónimo y relativo; el Si7 sirve a Mi mayor y a Mi menor | Oír el paso de mayor a menor; cantar 1-3-5 |
| **3. El arpegio clásico** | Su [[Estudio en Mi menor]]; Giuliani, op. 1 | p-i-m-a y p-a-m-i; destacar una nota dentro del arpegio | La menor (las tres) | Inversiones y cifrado; análisis armónico de su estudio | 3.ª, 5.ª y 8.ª |
| **4. Escalas y ligados** | Tárrega, *Estudio en Do* (RCM 3); Aguado, lecciones (RCM 1-4) | i-m y m-a; ligados; sincronizar las manos | Do y Sol mayor; cromática | Intervalos con su calidad; armaduras de 0 a 2; triadas de Do mayor | Escala mayor y menor |
| **5. Polifonía antigua** | Sanz, *Españoleta* (RCM 2-3), o Dowland, *Lady Laiton's Almain* / *Mrs. Winter's Jump* (RCM 4) | Control de voces; apagar; mordente | Re mayor | 3/4 y 6/8 (hemiolia); cadencias | Conclusiva o suspensiva |

**Alternativas:** Sor, op. 60 n.º 1 (RCM Prep), n.º 5 y 7 (RCM 3), op. 31 n.º 1 y op. 35 n.º 1-2 (RCM 2), op. 31 n.º 4 y op. 35 n.º 13 (RCM 4); Giuliani, op. 50 n.º 1, 13, 17 y 22 (RCM 1-4); Carulli, op. 241 (RCM Prep-4); Carcassi, op. 59 (RCM 2-3); Dowland, *Orlando Sleepeth* (RCM 2); Mertz, *Romanze* (RCM 2) y *Andante* (RCM 3); Händel, *Preludio en Do* (RCM 3); Brouwer, *Estudios sencillos* 1-5 (est.). **Hito:** *Lágrima* completa, con la melodía destacada, de memoria y grabada.

### Etapa 2 · Cejilla y posiciones
*Romance* anónimo (RCM 5); Carcassi, op. 60 n.º 7 y 10 (RCM 5); Giuliani, op. 48 n.º 1 y op. 51 n.º 10 (RCM 5); Sor, op. 6 n.º 2, op. 35 n.º 8 y op. 44 n.º 15 (RCM 5); Aguado, contradanzas op. 8 n.º 5 y op. 11 n.º 4 (RCM 5); Coste, *La chasse* op. 51 n.º 9 (RCM 5); Dowland, *My Lord Willoughby's Welcome Home* (RCM 5, EPM 1-2); Brouwer, *Estudios sencillos* 6-7 y 10-12 (EPM 1); Tárrega, *Sueño* y *Rosita* (EPM 1); Barrios, *El sueño de la muñequita* y *Minueto en Do* (EPM 1); Torroba, *Alba de Tormes* (EPM 1); M. D. Pujol, *Preludio* de la *Suite del Plata n.º 1* (RCM 5). **Hito:** dos obras con cejilla, de memoria.

### Etapa 3 · Dos voces y todo el mástil
Tárrega, *Adelita* (RCM 6, EPM 1-3), *Estudio en Mi mayor* (RCM 6), *Pavana*, *Endecha* y *Oremus* (EPM 2); Bach, *Bourrée* BWV 996 (RCM 6, EPM 1-3); Sor, op. 35 n.º 17 y 22, op. 6 n.º 1 y *Minueto* op. 22 (RCM 6); Giuliani, op. 100 n.º 12-13 (RCM 6); Mertz, *Nocturno* op. 4 n.º 1 (RCM 6); Coste, op. 38 n.º 1 (RCM 6); Ponce, *Preludios* 6 y 10 (RCM 6); Barrios, *Preludio* (RCM 6); Weiss, *Courante* (RCM 6); Milán, *Pavana III*, y Narváez, *Fantasía XIV* (RCM 6); Sanz, *Españoleta* y *Canarios* (EPM 2); Lauro, *Vals criollo n.º 2* (EPM 2); Brouwer, *Estudios sencillos* 13-14 y *Canción de cuna* (EPM 2); Torroba, *Torija* (EPM 2). **Hito:** una obra a dos voces con las voces claramente separadas, grabada.

### Etapa 4 · Velocidad y estilos
Bach, *Preludio* BWV 999 (RCM 7, EPM 4) y *Minuetos* BWV 1007 (RCM 7); Carcassi, op. 60 n.º 19 (RCM 7); Sor, op. 31 n.º 20, op. 6 n.º 8 y op. 47 n.º 4 (RCM 7); Giuliani, op. 100 n.º 11 y op. 50 n.º 26 (RCM 7); Barrios, *Estudio inconcluso* (RCM 7) y *Medallón antiguo* (EPM 3); Tárrega, *Vals en Re* y *Pavana* (RCM 7), *Preludio n.º 1* (EPM 3); Llobet, *El testament d'Amèlia* (RCM 7); Narváez, *Canción del Emperador* y *Guárdame las vacas* (RCM 7); Santiago de Murcia, *Preludio y allegro* (RCM 7); Sanz, *Canarios* (RCM 7); Villa-Lobos, *Preludio n.º 3* (EPM 3); Ponce, *Scherzino mexicano* (EPM 3); Tansman, *Sarabanda* de la *Cavatina*, y Walton, *Bagatela n.º 2* (RCM 7); Coste, *Berceuse* (RCM 7); Torroba, *Burgalesa* (EPM 3). **Hito:** programa de 10 minutos de tres épocas.

### Etapa 5 · Obras de concierto
Barrios, *Julia Florida* (RCM 8, EPM 4), *Preludio saudade* de *La Catedral*, *Vals de la primavera*, *Villancico de Navidad* y *Arabescos* (RCM 8); Scarlatti, K. 208 (RCM 8, EPM 4) y K. 322 (RCM 8); Bach, *Allemande* (RCM 8) y *Courante* (EPM 4) de la BWV 996, *Preludio* BWV 1007 y *Giga* BWV 1009 (RCM 8); Tárrega, *Marieta* (RCM 8, EPM 4), *Mazurka en Sol* y *Preludio n.º 5* (EPM 4); Sor, op. 6 n.º 11 y op. 35 n.º 16 (RCM 8), *Les Adieux* (EPM 4); Carcassi, op. 60 n.º 23 (RCM 8); Coste, op. 38 n.º 13 (RCM 8); Mertz, *Das Fischermädchen* (RCM 8); Torroba, *Sonatina* (2.º mov., RCM 8); Villa-Lobos, *Preludio n.º 4* y *Suite popular brasileña* (EPM 4); Lauro, *Angostura* (EPM 4); Dowland, gallardas (RCM 8); Ponce, *Preludio, Balletto y Giga* (EPM 4); Brouwer, *Guajira criolla* y *Zapateo* (EPM 4); Weiss, *Fantasía en re menor* (EPM 4). **Hito:** programa de 15-20 minutos.

### Etapa 6 · Trémolo y gran forma
Tárrega, *Recuerdos de la Alhambra* (EPM 5-6) y *María* (EPM 5); Bach, *Preludio* BWV 998, *Allemande*, *Courante* y *Gavotas* BWV 995 y *Sarabanda* BWV 996 (EPM 5); Weiss, *Preludio y Giga* (EPM 5); Narváez, *Diferencias sobre Conde Claros* (EPM 5); Mertz, *Tarantela* (EPM 5); Sor, *Andante largo* op. 5 (EPM 5); Barrios, *Vals n.º 3* y *Preludio en do menor* (EPM 5); M. D. Pujol, *Candombe en mi* (RCM 7, EPM 5); Sainz de la Maza, *Habanera* (EPM 5); Brouwer, *Danza característica*, y Tansman, *Danza pomposa* (EPM 5); Villa-Lobos, *Preludio n.º 1* (est.). **Hito:** *Recuerdos* (o una obra larga equivalente) de memoria.

### Etapa 7 · Autonomía
Tárrega, *Capricho árabe* y *Recuerdos* (EPM 6); Barrios, *La Catedral* completa y *Vals* op. 8 n.º 4 (EPM 6); Villa-Lobos, *Estudios* 1, 2, 8 y 11 y *Preludio n.º 5* (EPM 6); Bach, *Preludio* BWV 996, *Preludio* BWV 997 y *Fuga* BWV 1000/1001 (EPM 6); Sor, *Folías de España* op. 15a y *Variaciones sobre Marlborough* op. 28 (EPM 6); Giuliani, *Variaciones sobre un tema de Händel* op. 107 (EPM 6); Rodrigo, *En los trigales*; Mompou, *Canción*; Falla, *Homenaje*; Torroba, *Madroños*; Lauro, *Carora* y *María Luisa*; Brouwer, *Tres apuntes*; Walton, *Bagatelas* 3-4; Dowland, *Lachrimae*; Mudarra, *Fantasía X* (todas EPM 6). **Hito:** recital personal de 25-30 minutos, grabado, con digitaciones propias en al menos una obra.

### Horizonte
(todas est.) Albéniz, *Asturias*, *Sevilla* y *Granada*; Granados, *Danza española n.º 5*; Tárrega, *Gran jota*; Barrios, *Un sueño en la floresta*; Bach, *Chacona* BWV 1004; Turina, *Fandanguillo* y *Sevillana*; Rodrigo, *Invocación y danza*; Villa-Lobos, *Estudios* 7 y 12; Brouwer, *El decamerón negro*; Britten, *Nocturnal*. La [[Passacaglia (Händel)]] se sitúa en el diagnóstico mirando la partitura.

**Cómo se muestra un objetivo:** *«Recuerdos de la Alhambra: todavía no. Necesitas (A) trémolo p-a-m-i regular, dos minutos a tempo de obra sin tensión; (B) cejillas en V-VII sostenidas sin cortar el trémolo; (C) cambios de posición sin romperlo. La armonía ya la conoces: pasa de La menor a La mayor, como Lágrima de Mi menor a Mi mayor.»*

---

## 5. Ruta flamenca

**Principios [Decisión]:** se estudia por su cuenta y no pide nada de la clásica. Comparte la biblioteca común y reconoce lo que se transfiere (trémolo, arpegio, picado), pero cada competencia dice si es clásica, flamenca o común. Las falsetas siguen la regla de siempre: las que él mande, tal como suenan ([[Guitarra]]). Palos y obras de referencia de la programación de Huelva **[Dato]**; equivalencias mías **[Estimación]**. Su lectura es la tablatura y el cifrado de rasgueos; el pentagrama, opcional.

| Área | F1 · Compás y mano derecha | F2 · Festeros y binarios | F3 · Soleá, alegrías y levante | F4 · Tientos, tangos y soleá por bulería | F5 · Seguiriyas, granaína y bulerías | F6 · Concierto e improvisación |
|---|---|---|---|---|---|---|
| **Compás** | Soleá, alegrías y bulería (12), tangos (4), fandangos y sevillanas (3), contados y palmeados con sus acentos | Rumba y tanguillos; farruca; bulería por medio a tempo | Soleá y alegrías de concierto; taranta (toque libre) | Tientos; soleá por bulería; contratiempos | Seguiriya (compás irregular); bulería de concierto | Cambios de palo y libertad en los toques libres |
| **Técnica flamenca** | Rasgueados (de cuatro, abanico, continuo), picado i-m, pulgar, alzapúa, arpegio, trémolo p-i-a-m-i, golpe | Rasgueo festero; picado más rápido | Picado veloz; trémolo fluido; alzapúa a tempo | Pulgar y alzapúa avanzados; arpegio rápido | Velocidad y resistencia | Todo a nivel de concierto |
| **Toque** | Sus bases; dos falsetas por palo con cierre; *Agua Marina* | Una rumba entera (*Entre dos aguas*); farruca (*Punta y tacón*, Sabicas) | *Bronce gitano* (Sabicas), *Taranta* (Niño Ricardo), *La romería* (Paco Peña) | Obras de Paco de Lucía y Moraíto | *Reflejo de luna* (granaína, Paco de Lucía); seguiriya; bulería | *Rondeña* (Montoya), *Fuente y caudal*, *En la caleta*, *Aire choquero*, *Cuando canta el gallo* (Paco de Lucía), *Morente* (Vicente Amigo); falsetas propias |
| **Acompañamiento** | Compás para un cante sencillo (sevillanas, fandangos de Huelva) | Acompañar un cante festero | Acompañar baile por alegrías o soleá | Acompañar cante en los tres palos | Acompañar un baile | Cante y baile en varios palos |
| **Armonía flamenca** | Modo flamenco por arriba (Mi) y por medio (La); cadencia andaluza; ruedas | Mayor y menor en los festeros; por minera | Levante (Fa♯); alegrías en Mi, La y Do | Dominantes secundarias | Análisis de toques | Todos los tonos |

**Hitos:** F1, cuatro palos con compás estable y dos falsetas por palo; F2, una rumba entera; F3, una soleá de concierto; F4, acompañar cante en tres palos; F5, acompañar un baile; F6, un concierto de 25 minutos con falsetas propias.

---

## 6. Evaluación inicial

**Principio:** mide **cada área por separado**, empieza en su hipótesis (no desde cero) y sube o baja según acierte, para no hacerle pasar por lo básico que ya domina **[Decisión]**. Se hace en varios días si quiere (guarda por dónde va).

1. **Cuestionario (10 min):** obras que toca y cómo, técnicas, teoría que cree saber, clases, uñas y objetivos; identificar *El Romancero gitano* y *Nocturnal Smatter*. Da el punto de partida de cada área.
2. **Pruebas que corrige la app:** lectura (notas en un pentagrama sencillo, con aciertos y tiempo de respuesta), ritmo (marcar un ritmo con la barra espaciadora sobre un metrónomo, tras calibrar el retraso del equipo), teoría, armonía, oído y diapasón (nombrar notas en un mástil dibujado).
3. **Técnica con protocolo**, autoevaluada con criterios medibles (tempo máximo limpio tres veces seguidas, lista de tensión y sonido), separada en **clásica** (escalas apoyando, arpegios, trémolo p-a-m-i, ligados, cejillas, cambios de posición) y **flamenca** (picado, rasgueados, alzapúa, pulgar, trémolo p-i-a-m-i, compás de cada palo con metrónomo).
4. **Repertorio:** dos obras clásicas y dos toques o falsetas flamencas que ya toque, con una rúbrica (notas, ritmo, sonido, fluidez, dinámica, memoria). Grabación opcional, como **grabación del día 1**.

**Pruebas adaptativas:** en cada área empieza en el nivel de la hipótesis; si la supera, sube; si falla, baja; se para en el primer nivel que no supera. Cada prueba superada cuenta como **primer acierto en frío** de sus competencias, que quedan **completadas (convalidadas)**; con dos comprobaciones más en los días siguientes pasan a dominadas sin estudiarlas desde cero.

**Transferencias flamenco → clásica:** algunas competencias clásicas dicen de cuál flamenca se benefician (picado → escalas apoyando i-m; trémolo p-i-a-m-i → trémolo p-a-m-i; arpegio flamenco → arpegio clásico). El diagnóstico usa eso para empezar más arriba esas pruebas; **no convalida nada sin probarlo**, y el resultado queda marcado como clásico o flamenco.

**Mi punto de partida** (ejemplo de cómo se verá):
> Técnica clásica: 2 (estimado) · Repertorio clásico: 1 · Lectura: 0, empieza por el nivel 1 · Ritmo: 2 · Teoría: 1 · Armonía: 1 · Oído: 1 · Diapasón: 1 · Flamenco: técnica F2, compás F2, toque F1.
> **Lo que ya tienes:** … · **Lo que se comprueba estos días:** … · **Lo que se refuerza:** … · **Lo que se aprende:** … · **Te puedes saltar:** …
> **Ruta clásica:** empiezas en la etapa 2 por técnica y repertorio, y la lectura empieza en el nivel 1, con más tiempo diario hasta que se acerque.

---

## 7. Progreso y dominio

**Estados (los cinco que pidió):** pendiente · en progreso · **completado** («lo he hecho») · **dominado** («lo sé hacer») · necesita repaso.

**Cada intento registrado [Decisión]:** pasadas seguidas, ayuda (ninguna; leyendo la partitura o la tablatura; con referencia: audio, vídeo o profesor), tempo si usa metrónomo, y **la calidad de cada aspecto que pide esa cosa**: bien, con fallos o mal. Si es una **comprobación en frío** (primer intento del día, sin calentar ese pasaje), se marca.

**Los aspectos:** notas correctas · ritmo y pulso · sin paradas · limpieza (sin trastear ni ruidos) · control y relajación · sonido · dinámica · articulación · fraseo y musicalidad · de memoria. **Cada cosa pide los suyos**, porque no se domina igual una escala que una obra:
| Tipo | Aspectos por defecto |
|---|---|
| Ejercicio o competencia de ejecución | Notas, ritmo, limpieza y control (y lo que pida su ficha: un ejercicio de sonido mira sonido, limpieza y control, sin tempo) |
| Obra | Notas, ritmo, sin paradas, limpieza, sonido, dinámica y fraseo; la memoria, cuando la pide |
| Interpretación | Sin paradas, fraseo y dinámica |
| Conocimiento (notas, intervalos…) | Aciertos en una tanda completa y, si lo pide, tiempo de respuesta |

**Cuándo un intento «cumple»:** todos sus aspectos bien, las pasadas que pide (en ejercicios, 3 seguidas al trabajarlo y 2 en frío; en obras, 1) y sin más ayuda de la permitida (en obras se puede tener la notación delante, salvo si pide memoria). Lo que no se valora cuenta como «con fallos»: nunca se da por bueno. **«Casi»:** un solo aspecto con fallos, o una pasada menos. Algo mal, o dos fallos: no cumple. En los ejercicios que corrige la app, cumple con el 90 % de aciertos.

**El tempo es una herramienta, no el criterio:** se apunta para ver cómo sube, pero solo decide si el criterio lo hace **obligatorio** (o lo hace él o su profesor). Entonces, por debajo del 90 % del tempo no cumple, y entre el 90 y el 100 % cuenta como un fallo. Hoy ningún contenido tiene tempo obligatorio.

**De dónde salen los números** (todos ajustables):
| Número | Base |
|---|---|
| Tres aciertos en frío, espaciados | Lo que sale bien practicando no prueba que se haya aprendido (Soderstrom y Bjork, 2015) y repartir en el tiempo retiene más (Stafford y Haasnoot, 2017) **[Evidencia]**; que sean tres, **[Decisión]** |
| Intervalos de 3, 7, 21, 45, 90 y 180 días | Repaso espaciado con intervalos crecientes **[Consenso]**; los días exactos, **[Decisión]**: no hay estudio que los fije para música |
| 3 pasadas seguidas bien al trabajar | El porcentaje de intentos correctos predice la retención mejor que el tiempo (Duke, Simmons y Cash, 2009) **[Evidencia preliminar]**; «tres veces seguidas antes de subir» es la regla habitual de profesores **[Consenso]** |
| Subir 4 pulsaciones tras tres pasadas limpias | **[Consenso]** de la práctica con metrónomo |
| 90 % de aciertos | El aprendizaje para el dominio usa el 80-90 % (Slavin, 1987); el 90 %, porque reconocer notas o intervalos tiene que llegar a ser casi automático **[Decisión]** |
| 80 % dominado para dar un nivel o pasar de etapa | El mismo margen del aprendizaje para el dominio (80-90 %, Slavin, 1987), en su extremo bajo para que una sola competencia rebelde no frene todo un nivel **[Decisión]** |
| Repartos del planificador (+25 % por nivel de desfase, 15 % para comprobaciones, tope del 25 % por área) | Reparto del tiempo, no criterio de dominio: **[Decisión]** de partida, que se ajusta mirando cómo le va |
| Sin tempos mínimos por defecto | No encontré tempos de escalas publicados y comprobables para su nivel (RCM, ABRSM); los que aparecen (el jurado de guitarra de la Universidad de Western Ontario, Rockschool-AMEB) son de otros contextos. Inventarlos sería poner una cifra arbitraria |

**Ajustables:** en cada obra o ejercicio, él o su profesor pueden cambiar el tempo (y si es obligatorio), las pasadas, las pasadas en frío, la memoria y el porcentaje de aciertos. Queda quién lo cambió y por qué, y el dominio se recalcula con el criterio nuevo.

**Las reglas (sencillas):**
1. **Completado:** el primer intento que cumple, como sea (con ayuda, después de calentar).
2. **Comprobaciones en frío:** a partir de ahí, la app las programa sola: **a los 3 días, a los 7 y después a los 21, 45, 90 y 180** (cada acierto alarga el intervalo). En frío se piden **dos pasadas seguidas limpias** (una en obras enteras).
3. **Dominado:** completado y **dos comprobaciones en frío superadas**, la primera al menos 3 días después y la segunda al menos 7 días después de la anterior. Es decir, tres aciertos sin ayuda y espaciados: como mínimo, unos 10 días.
4. **Un fallo en frío** baja dos pasos la solidez y adelanta la siguiente comprobación; si estaba dominado, pasa a **necesita repaso**. Un «casi» no suma ni resta, pero adelanta la comprobación.
5. **Practicar sin estar en frío** mantiene la competencia viva y cuenta como práctica, pero no prueba retención.
6. **Lo que se queda sin comprobar** el doble de su intervalo pasa a necesita repaso: no se sabe si sigue ahí.
7. **Lo que está a punto de olvidarse** (más del 80 % de su intervalo sin comprobar) entra en las sesiones.

En la app se ve así: *«Escala de Mi mayor · Completado · Solidez 2 de 3 · Próxima comprobación en frío: jueves».*

**Obras:** el mismo sistema con la pasada completa y sus aspectos; cada sección (parte A, parte B) lleva su propio dominio, y practicar un fragmento suelto cuenta como práctica, pero no completa la obra entera. Se ve el tempo de cada sección a lo largo del tiempo. **Repertorio vivo:** las obras terminadas (3-5) rotan en las comprobaciones para no perderse.

**Pasar de etapa:** núcleo de la etapa (técnica y repertorio) completado y el 80 % dominado, más el examen de etapa (Fase 5). Las demás áreas no lo bloquean; el planificador les da más tiempo si van por detrás.

**Lo que se guarda son los hechos, no los estados:** cada intento queda en el historial y los estados se calculan; si se cambian las reglas, se recalcula todo sin perder nada.

---

## 8. «¿Qué hago hoy?»

Elige el tiempo (20, 30, 45, 60, 90 o 120 minutos) y el programa (el clásico por defecto, el flamenco o los dos en bloques separados). Cada bloque dice **para qué es** («Lo necesitas para la parte A de *Lágrima*») y, al abrirlo, sus motivos **[Decisión]**.

**Orden de prioridades (aprobado el 25/10/2026):**
1. **Encargos del profesor.** Van primero y con sus minutos. Si no queda tiempo para nada más, la sesión es solo eso. El planificador nunca los sustituye: si había previsto una escala y el profesor le ha mandado una obra para esta semana, la obra ocupa su sitio.
2. **Comprobaciones críticas**, en frío y al principio, **2-4 minutos** (6 en sesiones de 90 o más): lo vencido de su ruta y de las obras que estudia, y lo que el diagnóstico da por sabido en ella. Nunca se comen una sesión corta: siempre queda sitio para la ruta. Lo demás espera a otro día, con un aviso («3 repasos esperan a otro día»).
3. **El objetivo actual de la ruta:** el paso en el que está, el siguiente abierto si cabe, y la obra de su tramo (o una pasada de comprobación si ya la conocía).
4. **Lo que necesita una obra:** el refuerzo que la ruta ha puesto antes de ella.
5. **Debilidades importantes:** la lectura, si va por detrás, recibe más tiempo sin frenar nada; si no, una dosis diaria. Si un paso de lectura de la ruta ya entra hoy, esa es la lectura del día.
6. **El resto:** obras en estudio fuera de la ruta, los demás pasos abiertos y las demás áreas del curso, con el tiempo repartido según:
   - el **reparto base** de la etapa (más repertorio cuanto más avanzada);
   - el **desfase con el nivel de referencia**: cada nivel que un área va por detrás de su técnica o su repertorio le da un 25 % más de peso (hasta el doble);
   - el **déficit de la semana**: lo que lleva menos minutos de los que le tocan sube, y lo que va sobrado baja;
   - los **puntos flojos**: fallos recientes en frío o valoraciones bajas;
   - los **objetivos**: lo que piden las obras marcadas «en preparación» sube algo más que lo de «objetivo futuro».

   Si hay más áreas que bloques, entran las de más peso y las demás suben de peso para los días siguientes: así rota solo. Dentro de cada área, lo de su ruta, lo flojo y lo que piden sus objetivos, en el nivel de esa área y con los requisitos cumplidos; en repertorio, la obra en estudio que lleva más tiempo sin tocarse.

**Forma de la sesión:** bloques de 5 minutos como mínimo; 20 min → 3 bloques, 30 → 4, 45 → 5, 60 → 6, 90 → 7, 120 → 8. Calentamiento de 3 minutos (5 a partir de 45). Una pausa de 5 minutos cada 50 en las sesiones de 90 o más. Orden en la sesión: calentamiento → comprobaciones en frío → encargos → pasos de la ruta → técnica y escalas → lectura → ritmo → diapasón → teoría y armonía → oído → refuerzo → obra → una pasada para acabar tocando música, con la pausa donde caiga. Con 45 minutos o más, el repertorio se parte en trabajo y pasada (estudio intercalado).

**Ejemplo de motivos que verá:** «Encargo de clase del martes» · «La lectura va dos niveles por detrás de tu técnica: le toca más tiempo» · «Comprobación en frío: tócalo sin calentarlo antes» · «Lleva cinco días sin tocarse» · «Lo necesitas para *Recuerdos* (en preparación)».

**Registro:** al acabar cada bloque, pasadas, ayuda, los aspectos de calidad que pida (bien, con fallos o mal; con un botón de «todo bien»), tempo si lo ha usado, valoración de 1 a 5 y una nota. Cada bloque con notación dice en cuál se recomienda y por qué. Todo va al diario.

---

## 9. Biblioteca de repertorio

- **Sin límite:** cada obra es un archivo; añadir obras no toca el programa **[Decisión]**.
- **Solo datos comprobados:** compositor y título seguros; el nivel, con su fuente y su marca (dato o estimación). Una obra sin clasificar se admite, pero no se recomienda por nivel hasta que se clasifique.
- **Obras suyas y de su profesor:** se añaden desde la app con los mismos datos y quedan marcadas como «mía» o «del profesor»; se guardan en sus datos, no en el catálogo, para que una actualización nunca las toque.
- **Datos de cada obra:** compositor, título, catálogo, época, estilo, clase (obra, estudio, ejercicio, falseta, toque, arreglo), dificultad estimada, etapa recomendada, lectura que pide, prerrequisitos, técnicas que pide y que desarrolla, tonalidad, compás, posiciones, duración, objetivos pedagógicos, dificultades, digitaciones alternativas, relación con otras obras y unidades, **notación** (qué formatos tiene y dónde: en la app, fuera o por hacer; formato principal y su motivo, también por sección), criterio de dominio y, cuando se estudie, su análisis.
- **Por qué está y por qué se recomienda:** cada obra enlaza las competencias que desarrolla. La recomendación cruza eso con sus puntos de trabajo actuales y lo explica: *«Te conviene ahora porque desarrolla el arpegio con melodía, la media cejilla y el cambio de modo, que son tus puntos de trabajo. Te recomiendo tablatura (pide lectura 3; tienes 1,4); la partitura sigue disponible.»*
- **Marcas que pone él:** objetivo futuro (se planifica a largo plazo) · aspiracional (un sueño: se ve, sin planificar) · en preparación (se trabajan ya sus requisitos) · en estudio · aprendida · repertorio vivo · aparcada.
- **Lo que calcula la app:** estudiable ahora · cerca (le falta poco, y dice qué) · demasiado difícil por ahora (y qué le falta). **Una obra difícil nunca desaparece**: se ve con lo que le falta.

---

## 10-12. Arquitectura, datos y persistencia

Todo el detalle técnico está en [[Arquitectura de la academia]]. Las decisiones, en corto:
- **App web local sin librerías**, servida por un servidor pequeño de Node (sin dependencias, como el de la [[Agenda]]) en `http://127.0.0.1:7421`, que se abre como ventana propia de Brave.
- **Contenido separado de la lógica:** currículo, repertorio, ejercicios, teoría, lectura, oído y flamenco son archivos de datos; la lógica (dominio, niveles, lectura, planificador, recomendaciones) son módulos puros con pruebas.
- **Sus datos, en la vault** (`08 - Guitarra/Academia/datos/`): un archivo de estado (perfil, preferencias, encargos, objetivos, marcas de obras, obras propias) y un historial mensual al que solo se añade (cada práctica, comprobación, sesión y nota). Copias diarias comprimidas, exportar e importar. **Del navegador no depende nada importante.** La copia fuera del ordenador (OneDrive u otra carpeta) queda **preparada, no activada**: primero todo en local; se enciende cuando él lo decida.

---

## 13. Diseño UX/UI

- **La interfaz de la Fase 1 era provisional:** estructura y funciones, sin diseño. Antes del diseño definitivo (Fases 2 y 7) le enseñé tres propuestas y elegimos juntos.
- **Las tres propuestas (24/10/2026):** **A · Atril** (claro, papel y tinta azul, la partitura en el centro, barra superior), **B · Estudio** (grafito oscuro con un color por área, mucha información ordenada, barra lateral) y **C · Itinerario** (claro, pensado para el móvil, la ruta como viaje, barra inferior). Las tres tienen las mismas funciones: el selector Partitura | Tablatura en cada sesión y obra, el metrónomo dentro de la sesión y la lectura como bloque propio. Están en el lienzo de diseño de Claude (artifact privado: https://claude.ai/artifact/FSEGmVj6xbzbrTMQMfkgNL). **Eligió la B como base** (24/10/2026, noche) y pidió una versión evolucionada, **B+** (grafito, atril de papel, tipografía cinética con intención, identidad de Archivo de Tinta) y organizar la academia en cursos con su ruta (prototipo: https://claude.ai/artifact/KtfQ9H35KULD6Sw32wY5Xe). **Aprobado el 25/10/2026**, y con él la Fase 2.
- **B+ (aprobada):** para ordenador primero; grafito oscuro (fondo `#1D1D1B`, superficies `#242422` y `#2E2E2B`, texto `#E6E3DC`, nunca negro puro ni blanco puro); la partitura y la tablatura sobre una superficie de papel tipo atril (`#F6F5F1`); verde `#3DFF6E` solo para «ahora»; ocre `#D9A54A` para repasos, refuerzos y encargos; un tono por área en marcas pequeñas. Letra: Archivo Black (títulos y momentos), Archivo (interfaz), Source Serif 4 en cursiva (títulos de obras) y Courier Prime (datos). Tipografía cinética solo en momentos con intención (entrar en un curso por primera vez, el título de «Hoy» una vez al día) y nada animado mientras se practica; con «reducir movimiento», nada se anima. Nada de aspecto de videojuego, panel corporativo ni app de móvil; Archivo de Tinta como identidad, sin ilustración. El tema claro queda preparado.
- **Navegación (Fase 2):** carril lateral con Hoy · Curso · Obras · Biblioteca · Progreso · Diario · Profesor · Ajustes, y el selector del programa (Clásico | Flamenco) debajo del logo. **Prioridades acordadas:** claridad, velocidad, concentración, facilidad de uso, información musical y estética; animaciones solo cuando aporten (el pulso del metrónomo, contar el compás).

---

## 14. Plan de fases
| Fase | Qué | Estado |
|---|---|---|
| 0 · Investigación y plan | Este documento | Revisada el 24/10/2026 |
| 1 · Arquitectura | Estructura, modelo de datos, servidor, guardado, copias, exportar e importar, lógica de dominio, niveles, lectura, planificador y recomendaciones, interfaz mínima | Ver [[Arquitectura de la academia]] |
| 2 · MVP | Diseño elegido, inicio, evaluación inicial, ruta clásica (etapa 1 completa), progreso, ¿Qué hago hoy?, **partitura y tablatura en pantalla, metrónomo**, persistencia y exportar/importar, ya con contenido real | **En curso** desde el 25/10/2026, de forma controlada con sus prioridades (componentes B+, navegación, Curso → Ruta → Paso, Obra → necesidades → ejercicios, estados, base de «¿Qué hago hoy?», notación preparada). Hecha esa parte; lo que falta está en [[Arquitectura de la academia]] («Pendiente») |
| 3 · Contenido | Repertorio, ejercicios, escalas, teoría, lectura, oído, armonía y técnica, etapa a etapa | Pendiente |
| 4 · Herramientas musicales | Mástil interactivo, diagramas de acordes, afinador y lo que haga falta además del pentagrama, la tablatura y el metrónomo (que van en el MVP) | Pendiente |
| 5 · Evaluación | Exámenes de unidad y de etapa, rúbricas, grabación de audio | Pendiente |
| 6 · Flamenco | La ruta flamenca completa | Pendiente |
| 7 · Diseño avanzado | Pulido visual (con su aprobación artística) | Pendiente |
| 8 · Pruebas | Todo, a fondo | Pendiente |
| 9 · Revisión | Como profesor, alumno, diseñador y desarrollador | Pendiente |

Cada fase acaba comprobando que funciona, buscando errores, corrigiendo, documentando y comprobando que no se ha roto nada. Las pruebas automáticas se pasan en todas. Para el diseño, los agentes **UI Designer** y **UX Architect**; para las pruebas, **test-engineer**.

---

## 15. Riesgos
| Riesgo | Cómo se evita |
|---|---|
| Autoevaluación demasiado generosa | Criterios con números, comprobaciones en frío espaciadas, grabaciones y el profesor |
| Que la app finja que le oye | Cada prueba dice si es automática, autoevaluada, del profesor o con grabación |
| Que la lectura se quede atrás para siempre | El desfase con la técnica le da más tiempo cada día; los puentes con su repertorio la hacen útil |
| Que falte tablatura de una obra | Su generador de tablaturas, el profesor o la edición; la ficha dice si la hay |
| Mesetas largas | Unidades cortas, tempos que se ven subir, objetivos visibles |
| Choque con el profesor | El profesor manda; la app enseña alternativas sin imponerlas |
| Sobrecarga por repetición | Bloques cortos, pausas, comprobación de tensión |
| Contenido inventado | Fuente y naturaleza obligatorias; el validador rechaza lo que no las tenga |
| Planificador opaco | Cada bloque explica por qué está; las reglas son pocas y con pruebas |
| Pérdida de datos | Archivos en la vault, escritura segura, copias diarias, exportar; copia fuera del ordenador si la aprueba |
| Cambios de formato con los años | Versión del formato, migraciones con pruebas y copia antes de cada cambio |

---

## 16. Propuesta del MVP (Fase 2)
- **Entra:** inicio; evaluación inicial (cuestionario, pruebas automáticas con un pentagrama sencillo para la de lectura, protocolos de técnica clásica y flamenca, rúbrica de repertorio) y **Mi punto de partida**; ruta clásica con la etapa 1 completa y la 2 con sus unidades; mi progreso; ¿Qué hago hoy?; diario; encargos del profesor; repertorio con las obras de las etapas 1-3 y los objetivos futuros; **partitura y tablatura dibujadas en la app** a partir de una sola notación, con el selector y su recomendación; **metrónomo** dentro de la sesión; el diseño que elija; persistencia, copias, exportar e importar.
- **No entra todavía:** la ruta flamenca completa (Fase 6; mientras, se puede registrar práctica flamenca), el resto de herramientas musicales (mástil, diagramas, afinador: Fase 4), la grabación (Fase 5), el pulido visual (Fase 7), la copia fuera del ordenador (preparada, sin activar) y la transcripción de vídeos.
- **Se considera terminado cuando:** todo funciona sin errores; los datos sobreviven a cerrar la app, Brave y el servidor; exportar, borrar e importar devuelve lo mismo; completado y dominado se comportan como dice el apartado 7; ninguna unidad aparece bloqueada sin motivo; las rutas no se mezclan; el planificador cuadra los minutos, respeta los encargos y los repasos; y la interfaz aguanta en móvil, tablet y ordenador.

---

## Fuentes
- RCM, *Classical Guitar Syllabus, 2018 Edition*: https://shop.rcmusic.com/products/classical-guitar-syllabus-2018-edition
- Obras de los libros RCM 2018 por nivel (Da Capo Academy): https://www.dacapomusic.ca/blog/rcm-classical-guitar-repertoire-and-etudes-all-pieces
- Trinity College London, guitarra clásica: https://sogwww.trinitycollege.co.uk/qualifications/music/grade-exams/classical-guitar/exams-at-a-glance
- ABRSM, guitarra grado 8 desde 2019: https://www.chimesmusic.com/latest/abrsm-guitar-grade-8-from-2019/
- Castilla y León, Decreto 60/2007: https://www.educa.jcyl.es/otrasensenanzas/en/ensenanzas-artisticas/planes-estudio/curriculo-ensenanzas-elementales-musica.files/315772-Decreto%2060%202007%20curr%C3%ADculo.pdf
- Programación de guitarra, Profesionales, Mater Salvatoris (Madrid): https://madrid.matersalvatoris.org/wp-content/uploads/programacion-guitarra-ensenanzas-profesionales-2026-2027.pdf
- Programación de guitarra flamenca, CPM Javier Perianes (Huelva): https://blogsaverroes.juntadeandalucia.es/cpmjavierperianes/files/2022/11/programacion-guitarra-flamenca-total-2022-23.pdf
- Macnamara y otros (2014): https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4101876/
- Duke, Simmons y Cash (2009), resumen: https://www.structural-learning.com/research-briefings/practise-the-hard-bit
- Carter y Grahn (2016): https://pmc.ncbi.nlm.nih.gov/articles/PMC4989027
- Soderstrom y Bjork (2015): https://hwb.gov.wales/api/storage/1031b700-acaf-4eda-a4bc-758715e85ff2/Learning%20versus%20Performance%20An%20Integrative%20Review.pdf
- Stafford y Haasnoot (2017): https://eprints.whiterose.ac.uk/97780
- Lectura a primera vista (Zhukov y otros): https://periodicos.ufmg.br/index.php/permusi/article/download/19816/27341/100349 · https://journals.sagepub.com/doi/abs/10.1177/0305735615610925
- Oído funcional e intervalos (fuentes pedagógicas): https://www.musical-u.com/learn/whats-the-point-of-scale-ear-training/
- Slavin (1987), aprendizaje para el dominio: https://www.gwern.net/doc/psychology/1987-slavin.pdf
- Tempos de escalas en otros contextos (por qué no se usan como mínimo): jurado de guitarra de Western Ontario, https://music.uwo.ca/departments/music-performance/juryRequirements/GUITAR · Rockschool-AMEB, https://rockschool.ameb.edu.au/wp-content/uploads/2020/04/Technical-Exercises-Acoustic-2019-Online.pdf
