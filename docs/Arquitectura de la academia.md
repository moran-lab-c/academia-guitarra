---
status: active
project: personal
type: reference
created: 2026-10-24
---
# Arquitectura de la academia (Fases 1 y 2)

Cómo está hecha la app de la academia de guitarra: tecnología, carpetas, módulos, datos, planificador y lo que funciona ya. La parte pedagógica (programas, cursos, ruta, dominio, lectura, «¿Qué hago hoy?») está en [[Plan de la academia]]. Índice: [[Academia]].

**Estado (25/10/2026, madrugada):** Fase 2 empezada de forma controlada tras su aprobación (B+, programas, Curso → Ruta → Paso, obras conectadas a la ruta, obra final, repasos con prioridad controlada, pasos visibles aunque no recomendados, partitura y tablatura permanentes). Hecha la parte que pidió: componentes B+, navegación, Curso → Ruta → Paso, Obra → necesidades → ejercicios, estados visuales y la base de «¿Qué hago hoy?». **64 pruebas automáticas en verde** y todas las pantallas probadas en el navegador. Técnicamente válido; lo artístico lo aprueba él. Lo que falta, en «Pendiente».

## Cómo se abre
- Doble clic en `08 - Guitarra/Academia/Abrir academia.cmd`: arranca el servidor sin ventana (si no estaba) y abre la app en una ventana propia de Brave (`http://127.0.0.1:7421`).
- Desde Brave también se puede instalar como aplicación (menú > Instalar).
- Pruebas: en `app/`, `node --test`.
- Tras cambiar `servidor/` o lo que el servidor usa de `logica/` (esquema, validador, migraciones), hay que reiniciar el servidor; para lo demás basta con recargar la página.

## Tecnología y por qué
| Pieza | Elección | Por qué |
|---|---|---|
| Interfaz | Módulos de JavaScript que el navegador ejecuta tal cual, **sin librerías ni compilación** | Funciona igual dentro de cinco años, sin paquetes que se queden viejos |
| Diseño | **B+** en CSS propio: `tokens.css` (colores, letras, radios, movimiento), `base.css` (armazón y piezas comunes) y `componentes.css` (ruta, atril, títulos, registro). Letras de Google Fonts: Archivo Black, Archivo, Source Serif 4 y Courier Prime | Un solo sitio para cada color o medida; el tema claro queda preparado (`data-tema="claro"`) sin tocar las pantallas |
| Animaciones | CSS y la API de animaciones del navegador, sin librerías; nada se anima con «reducir movimiento» | Solo en momentos con intención: el título de «Hoy» una vez al día y la entrada a un curso la primera vez; nunca mientras se practica |
| Servidor | Node 24, **sin dependencias**, como el de la [[Agenda]] | Guarda en disco y sirve la app; solo escucha en 127.0.0.1 |
| Contenido | **JSON**, un archivo por obra, por curso o por ruta (y Markdown para los textos largos, cuando los haya) | La app puede escribir obras con el mismo formato, el validador lo comprueba y cualquier programa futuro (por ejemplo, la transcripción) puede producirlo |
| Datos del usuario | Archivos en la vault: `estado.json` + historial mensual en JSONL | Ver «Dónde se guardan sus datos» |
| Pentagrama y tablatura en pantalla | **Pendiente** (el modelo, el selector y la recomendación ya están). Propuesta: VexFlow 5 (MIT), copiado dentro de la app, sin npm | Las dos vistas salen de la misma notación de la app (cuerda y traste por nota), así que el formato de los datos no depende de la librería |
| Metrónomo | **Pendiente.** Web Audio del navegador, programando los golpes por adelantado | Es la forma de que no se retrase aunque la pantalla vaya cargada |
| Service worker | No, por ahora | Todo es local: sin Internet ya funciona. Solo añadiría el riesgo de ver código viejo |

## Estructura de carpetas
```
08 - Guitarra/Academia/
  Academia.md · Plan de la academia.md · Arquitectura de la academia.md   (notas)
  Abrir academia.cmd                      el lanzador
  datos/                                  SUS DATOS (fuera de app/: actualizar la app no los toca)
    estado.json                           perfil, preferencias, encargos, objetivos, marcas, obras conocidas, obras propias
    historial/AAAA-MM.jsonl               cada práctica, comprobación, sesión y nota (solo se añade)
    copias/                               dia-DD.json.gz (31 huecos), mes-AAAA-MM.json.gz, antes-de-migrar-…, antes-de-importar-…
    adjuntos/                             archivos que suba
  app/
    package.json                          sin dependencias; «npm test» = node --test
    servidor/  servidor.js · almacen.js · catalogo.js        HTTP, guardado, copias y migraciones, lectura del contenido
    logica/                               reglas puras, las usan servidor, interfaz y pruebas
      esquema.js        formato de sus datos (esquema 2) y su validación
      migraciones.js    pasos entre versiones del formato (1 → 2: «ruta» pasa a «programa»)
      catalogo.js       índice del contenido y de sus relaciones; mezcla las obras propias
      validarCatalogo.js comprobación del contenido (también cursos, tramos, pasos y obra final)
      fechas.js         días en hora local
      dominio.js        completado, dominado, repasos
      niveles.js        nivel de cada área y curso que marcan los niveles
      ruta.js           la ruta de cada curso: estado de cada paso, sitio actual, refuerzos, ruta ↔ obra, obras conocidas
      notacion.js       qué formatos tiene cada cosa, cuál se recomienda y por qué; valida la notación propia
      recomendador.js   viabilidad y porqué de cada obra
      planificador.js   «¿Qué hago hoy?»
      progreso.js       junta todo lo calculado (el «contexto»)
    contenido/                            currículo y biblioteca: solo datos
      programas.json · areas.json
      cursos/       clasica.json (7 cursos), flamenca.json (6)
      rutas/        clasica-c1.json, flamenca-f1.json           (tramos y pasos de la ruta de cada curso)
      competencias/ clasica.json, comun.json, flamenca.json
      repertorio/   clasica/*.json, flamenca/*.json              (una obra por archivo)
      ejercicios/   clasica.json, comun.json
      notacion/     la notación propia (una pieza por archivo; de ella salen partitura y tablatura)
      (teoria/, lectura/, oido/, diagnostico/ llegan con su contenido)
    web/                                  la interfaz
      index.html · manifest.webmanifest · iconos/
      estilos/   tokens.css · base.css · componentes.css
      inicio.js                           carril lateral, selector de programa, direcciones y dibujo
      nucleo/    dom.js (crear elementos) · rutas.js (direcciones #/…) · almacen.js (datos y sincronización)
      componentes/ ruta.js (mapa de la ruta y mini-ruta) · marcas.js (colores e iconos de área, glifos de estado, chips) ·
                   atril.js · titulo.js (tipografía cinética) · notacion.js (selector Partitura | Tablatura) ·
                   registro.js (por aspectos) · criterio.js · comunes.js
      vistas/    hoy (inicio), curso, paso, obra, ejercicio, repertorio (Obras), biblioteca, progreso, area,
                 competencia, profesor, diario, ajustes, evaluaciones
      demo/      base.html, componentes.html (muestrario de las piezas B+, con datos de ejemplo)
    pruebas/   dominio, niveles, notacion, planificador, recomendador, catalogo, ruta, servidor (.test.js) y ayuda.js
```

## Cómo se comunican los módulos
1. **Contenido → servidor:** `servidor/catalogo.js` lee todos los JSON de `contenido/`, les pone su tipo (por el prefijo del id) y los valida con `logica/validarCatalogo.js`.
2. **Servidor → interfaz:** `GET /api/catalogo`, `/api/estado` y `/api/eventos`. La interfaz (`web/nucleo/almacen.js`) los guarda en memoria y mezcla las obras propias del estado con el catálogo.
3. **Cálculo:** `logica/progreso.js` (`contexto`) calcula, a partir de catálogo + estado + historial, el dominio de cada cosa, los niveles por área, el curso actual de cada programa, la ruta de cada curso (`ctx.ruta(curso)`, con memoria) y los puntos de trabajo. Las pantallas y el planificador solo leen ese contexto.
4. **Cambios:** `cambiar()` modifica el estado (marcas, obras conocidas, encargos, preferencias, obras propias) y lo manda con `PUT /api/estado`; `registrar()` añade eventos con `POST /api/eventos`.
5. **La lógica es la misma en todas partes:** los módulos de `logica/` no saben si los usa el navegador, el servidor o una prueba.

## Dónde se guardan sus datos y por qué
- **En la vault, en `datos/`:** sobreviven a borrar los datos de Brave, a reinstalar el navegador y a actualizar la app; se leen con cualquier editor dentro de veinte años; y Claude Code puede leer su semana para ajustarle el plan.
- **`estado.json`** (pequeño, se reescribe entero): perfil, preferencias, encargos del profesor, objetivos, marca de cada obra, **si ya la conocía**, el formato que eligió ver en cada obra o sección, los criterios que haya ajustado, el tramo elegido y obras o ejercicios propios. Cada escritura va a un temporal y se renombra (un apagón no lo deja a medias); lleva un número de versión: si otra ventana o Claude lo cambió antes, la app se entera, parte de lo nuevo y vuelve a aplicar sus cambios encima.
- **`historial/AAAA-MM.jsonl`**: cada práctica, comprobación, sesión, nota, diagnóstico y examen, una línea por evento. **Solo se añade**: un reenvío no duplica (cada evento tiene id) y una línea dañada no estropea las demás. Partido por meses para que se lea rápido.
- **`copias/`**: al arrancar y en la primera escritura de cada día, una copia comprimida del día (31 huecos que se van reutilizando, así que nunca hay que borrar nada) y la del mes (se queda). Antes de importar o de cambiar de versión, otra copia, y el historial anterior se aparta, no se borra.
- **Cambio de versión del formato:** al arrancar, si sus datos son de un esquema anterior, el servidor guarda una copia (`antes-de-migrar-1-a-2`) y los convierte. **Si algo antiguo no pasa la validación, la academia arranca igual, avisa y no toca nada** (desde el 25/10/2026, con su prueba). Sus datos reales pasaron al esquema 2 el 25/10/2026 a la 01:26, con copia.
- **Exportar e importar:** un solo JSON con todo; importar enseña antes un resumen y guarda una copia de lo que había.
- **En el navegador** solo queda lo que espera a guardarse si el servidor está apagado (se manda solo al volver) y qué entradas animadas ya ha visto (para no repetirlas).
- **Copia fuera del ordenador:** solo preparada (`preferencias.copiaExterna`: carpeta y cada cuántos días); no hay nada encendido ni conectado a OneDrive. Primero, todo en local.

## Modelo de datos

### Contenido (catálogo)
Todo lleva `id` estable con prefijo (`programa:`, `curso:`, `tramo:`, `paso:`, `comp:`, `obra:`, `ej:`, `leccion:`, `diag:`), `programa` (`clasica`, `flamenca` o `comun`) y, en cada dato discutible, `naturaleza` (`dato`, `evidencia`, `consenso`, `recomendacion`, `decision`, `estimacion`) y, si la hay, su fuente.
| Entidad | Campos principales |
|---|---|
| **Programa** (`programas.json`) | nombre, principal, descripción. Clásico y flamenco; no se mezclan |
| **Curso** (`cursos/`) | programa, número, nombre, salto (qué capacidad nueva exige), hito, duración orientativa, **obra final** (obra, requisitos: memoria y grabación; justificación «Esta obra reúne…»; naturaleza), borrador |
| **Ruta del curso** | No se escribe: es el orden de sus tramos y pasos. `ruta.js` la calcula con el estado de cada paso |
| **Tramo** (`rutas/`) | curso, orden, título, objetivos, obra eje, **pasos** (en orden: el camino es el orden de la lista), borrador, cierre (el tramo final, con el paso de preparación de la obra final) |
| **Paso** (en el archivo de su ruta) | clase (`habilidad`, `aplicacion`, `obra`, `evaluacion`, `preparacion`), área, título, objetivo, **trabaja** (competencias), **contenido** (ejercicios, lecciones, obras u `obra:x#A` para una sección), **requiere** (pasos de los que depende de verdad), papel (`lectura` para una obra que es para leer), núcleo |
| **Área** (`areas.json`) | id, nombre, programa, max (nivel máximo), descripción |
| **Competencia (habilidad)** | programa, área, subárea, nivel, nombre, descripción, propósito, errores comunes, requiere (prerrequisitos), transfiere (de qué competencia del otro programa se beneficia), núcleo, **criterio** |
| **Obra** | programa, clase (obra, estudio, ejercicio, falseta, toque, arreglo), compositor, título, catálogo, época, estilo, tonalidad, compás, duración, **nivel** (curso recomendado y referencias con su sistema y naturaleza), **dificultad** (1-7), **lectura necesaria**, **pide** y **desarrolla** (competencias), objetivos, dificultades, posiciones, **secciones** (cada una con lo que pide y desarrolla, su lectura necesaria y, si hace falta, su notación), relacionadas, **notación**, criterio, origen (catálogo, usuario, profesor) |
| **Ejercicio** | programa, área, título, objetivo, duración, instrucciones, tempo (regla de subida, con su naturaleza), progresión, errores, trabaja (competencias), lectura necesaria, **notación**, criterio |
| **Notación** (en cada obra, ejercicio o sección) | `fuente` (archivo de `contenido/notacion/`: de él salen las dos vistas) o, si no hay, `partitura` y `tablatura` = `externa` (con `donde`), `pendiente` o no hay; `principal` (el formato para el que está pensado, o ninguno) y `motivo` |
| **Notación propia** (`contenido/notacion/*.json`) | compás, armadura y compases; cada compás, sus voces; cada nota, cuerda, traste y duración (o acorde, o silencio). El validador comprueba cuerda 1-6, traste 0-24 y duraciones |
| **Criterio** | tipo (ejecución o conocimiento); **dimensiones** (los aspectos que se valoran); pasadas al trabajarlo y en frío; ayuda permitida; tempo (referencia, si es obligatorio, naturaleza y fuente); o aciertos, preguntas y tiempo de respuesta; detalle; naturaleza y **justificación**. Si falta algo, valores por defecto según sea ejercicio, obra o interpretación |
| **Lección** (teoría, Fase 3) | área, competencias que enseña, texto en Markdown |
| **Diagnóstico** | pruebas por área y nivel, con las competencias que confirma |

**Relaciones (se calculan al cargar, no se escriben dos veces):** `catalogo.js` cruza lo que trabaja cada paso y cada ejercicio con lo que pide cada obra y cada sección. Índices: paso → tramo, curso → tramos, competencia → pasos, obra (o sección o ejercicio) → pasos que la contienen, competencia → ejercicios y obra → cursos de los que es obra final. De ahí salen «este paso prepara estas obras», «lo que necesitas para esta obra» y «dónde se trabaja», con sus enlaces.

**Lo que comprueba el validador además de lo de antes:** cada paso con su clase, título, área y lo que trabaja; su contenido existe (también la sección de una obra); está en un solo tramo; sus `requiere` existen y no forman círculos; cada curso con su obra final tiene un paso de preparación; y **todo lo que pide la obra final se trabaja en un paso de ese curso o de uno anterior**.

### Sus datos
| Qué | Dónde y cómo |
|---|---|
| **Usuario** | `estado.perfil` (nombre, guitarra, clase…) y `estado.preferencias` (minutos habituales, **programa principal**, reparto de los dos programas, formato preferido de estudio, tema, calibración de latencia, copia externa) |
| **Lo que eligió ver** | `estado.formatos`: `obra:x` o `obra:x#A` (una sección) → `partitura` o `tablatura`. Se recuerda; «Volver a la recomendada» lo borra |
| **Criterios ajustados** | `estado.ajustes[id]`: tempo (y si es obligatorio), pasadas, pasadas en frío, memoria, aciertos, **quién** (él o el profesor), **por qué** y fecha. El dominio se recalcula con ellos |
| **Encargos del profesor** | `estado.tareasProfesor[]`: id, qué (obra o competencia, o texto libre), detalle, minutos al día, hasta (por defecto, la clase siguiente), programa, formato, estado |
| **Objetivos y marcas de obras** | `estado.obras[id]`: marca (objetivo futuro, aspiracional, en preparación, en estudio, aprendida, repertorio vivo, aparcada) y nota; `estado.objetivos[]` |
| **Obras que ya conocía** | `estado.obras[id].conocida`: nivel (`parcial`, `entera` o `dominada`), las secciones si es parcial y la fecha. No crea progreso falso: hace que la app proponga una pasada de comprobación en vez de aprenderla |
| **Tramo elegido** | `estado.focos.tramo`, si quiere adelantar uno |
| **Obras y ejercicios propios** | `estado.contenidoPropio`: mismo formato que el catálogo, con `origen` y `programa` |
| **Práctica** | evento `practica`: item, área, minutos, modo (trabajo o comprobación), en frío, **calidad** (cada aspecto: bien, con fallos o mal), pasadas, tempo, ayuda, formato en que lo tocó, sección o fragmento, valoración (1-5), nota, encargo y sesión |
| **Ejercicios corregidos por la app** | evento `bateria`: resultados por competencia (aciertos, preguntas, ms) |
| **Sesiones** | evento `sesion`: programa, minutos, bloques (qué, cuánto, si se hizo) |
| **Diario** | los eventos anteriores y `nota` (texto libre) |
| **Diagnóstico y exámenes** | eventos `diagnostico` (niveles estimados por área y pruebas superadas) y `evaluacion` |
| **Dominio, repasos, niveles, estado de la ruta y progreso** | **No se guardan: se calculan** del historial (`dominio.js`, `niveles.js`, `ruta.js`). Si cambian las reglas, se recalcula todo |

### El estado del alumno, calculado
| Qué | Valores | Dónde |
|---|---|---|
| Cada competencia, obra o sección | pendiente · en progreso · completado · dominado · necesita repaso, con su solidez y su próxima comprobación | `dominio.js` |
| Cada paso de la ruta | dominado · hecho · repaso · **actual** · recomendado · próximo · futuro; y los **refuerzos** que la ruta inserta | `ruta.js` (`estadoPaso`, `rutaDelCurso`) |
| Cada tramo | hecho · abierto · por llegar | `ruta.js` |
| Cada obra | sin empezar · empezada · aprendida · dominada · la conoces, por comprobar (y si la tenía dominada de antes) · en repaso; y si es obra de evaluación (obra final) | `ruta.js` (`estadoObra`) |
| Lo que pide una obra frente a lo que tiene | ya la tienes · todavía no consolidada · necesita refuerzo · te falta · por confirmar (diagnóstico), con dónde se trabaja | `ruta.js` (`necesidades`, `situacion`) |
| Progreso por área | nivel, avance hacia el siguiente, hecho frente a dominado, minutos de la semana y si va por detrás | `niveles.js`, `progreso.js` |
| Curso actual de cada programa | el mayor entre el que marcan la técnica y el repertorio y el siguiente al último terminado, pero nunca uno sin ruta (se queda en el último que la tiene y dice cuál está en preparación) | `ruta.js` (`cursoActual`) |

## La ruta, en el código (`logica/ruta.js`)
- **Estado de un paso:** sale del dominio de lo que contiene (lo que trabaja y sus obras o secciones). Hecho cuando todo está completado; dominado cuando todo está dominado; repaso si algo necesita refuerzo. **Una aplicación** (Fase 2.1) lleva sus etapas aparte (`etapas`): *realizada* con evidencia de su obra (algún intento registrado de esa sección o de la obra entera, o una práctica registrada para ese paso: `paso` en el evento, que ponen «Hoy» y la página del paso), *aprendida* con la competencia completada, *consolidada* y *dominada* por las comprobaciones de la competencia. Realizada basta para dar el paso por hecho; sin evidencia no está hecha ni en repaso; si la competencia falla después, pasa a repaso. **La preparación de la obra final** pide la evidencia de la obra entera y su competencia.
- **Tramos:** el primero está abierto; uno se abre cuando se han hecho los pasos que frenan del anterior, cuando él lo elige o cuando ya lo ha empezado. **Los pasos de lectura no frenan**, tampoco una obra para leer (`papel: lectura`): se recomiendan, pero no cierran el tramo, salvo que el tramo lo declare en sus datos (`exige: [pasos]`). El tramo de cierre (la preparación de la obra final) se abre con todos los anteriores completos.
- **Evaluación de un tramo:** sin examen aparte; queda hecha cuando todo lo que frena en el tramo sale bien en frío días después (solidez 2 de 3 o más).
- **Sitio actual:** el primer paso recomendado que no sea de lectura (la lectura atrasada sigue recomendada, pero no marca el sitio, ni siquiera cuando es lo único que queda).
- **Refuerzos:** antes de un paso de obra o de aplicación, si la obra (o la sección) pide algo que falló en frío o necesita repaso, se inserta un refuerzo; si la obra es para leer y pide más lectura que el nivel que trabaja (el alcanzado + 1), un refuerzo de lectura con una competencia de su nivel que aún no tenga hecha; si la comprobación en frío de la obra falló, el de las competencias que miran los aspectos que fallaron (`falloEnFrio`, para cualquier obra). **Uno por necesidad y tramo**, con todos sus orígenes. Se calculan, no se guardan, y no bloquean.
- **Continuidad:** si la ruta no tiene nada que proponer, `continuidad` dice por qué (se esperan las comprobaciones de los cierres, o lo que queda está en preparación) y la sesión consolida. `cursoActual` nunca devuelve un curso sin ruta: se queda en el último que la tiene y `resumen.enPreparacion` dice cuál viene.
- **Obra final:** `progresoFinal` usa el modelo de siempre con el criterio de la obra más sus requisitos exigibles (`REQUISITOS_EXIGIBLES`: de memoria; y `PASADAS_OBRA_FINAL`: entera dos veces seguidas en el mismo intento, para que una pasada aislada no la cierre; la grabación es evidencia opcional, «la he grabado», hasta que forme parte de la evaluación): primera realización, aprendida con requisitos (cierra el curso), consolidada (solidez 2, nivel posterior) y dominada. Recomendada solo cuando la ruta alcanza el tramo de cierre.
- **Ruta ↔ obra:** `relacionesPaso` (qué contiene, en qué se apoya, qué obras o secciones prepara), `necesidades` (desde una obra: lo que pide, ordenado por lo más flojo, con dónde se trabaja cada cosa, y la lectura que pide como dato, sin frenar), `obraEnRutas` (en qué pasos y tramos aparece y de qué curso es obra final) y `dondeSeTrabaja`.
- **Obras conocidas y fallos en frío:** con `conocida`, el paso de obra pasa a «pasada de comprobación»; una pasada en frío que cumple la deja aprendida. Si la última comprobación en frío de cualquier obra falla, `falloEnFrio` dice qué aspectos fallaron y qué competencias de las que pide la sección los trabajan (salen sus refuerzos y la obra pasa a «recuperar», sin reiniciarse); si no consta el aspecto (`indeterminado: 'aspecto'`) o ninguna competencia lo trabaja (`'competencia'`), no inventa diagnóstico: revisión general de la obra, sin refuerzo concreto.

## Dominio y notación, en el código
- `logica/dominio.js`: `criterioDe` junta el criterio del contenido, los valores por defecto (según sea ejercicio, obra o interpretación) y el ajuste suyo o del profesor. `valorarIntento` da ok, casi o no mirando cada aspecto (lo no valorado cuenta como «con fallos»), las pasadas, la ayuda y el tempo solo si es obligatorio. Completado con el primer «ok»; la solidez sube con aciertos en frío y sin ayuda separados al menos 3 y 7 días; dominado con solidez 3; un fallo baja dos pasos; intervalos 3, 7, 21, 45, 90 y 180 días; lo dominado sin comprobar el doble de su intervalo pasa a necesita repaso. Cada sección de una obra (`obra#A`) tiene su propio dominio; un fragmento suelto no completa la obra. Las tandas que corrige la app cuentan en frío si son las primeras del día.
- `logica/notacion.js`: `formatos` dice qué hay de cada formato (en la app, fuera, por hacer, no hay); `recomendarFormato` devuelve el recomendado, la alternativa, lo que se muestra (su elección si la hay) y el porqué, con este orden: profesor > formato principal del contenido > propósito del bloque > su preferencia > su lectura frente a la que pide la obra o la sección, la dificultad técnica y si ya la toca. **Nunca quita la otra opción.** También el aviso de técnica y lectura, los pasajes que ya puede leer y el validador de la notación propia.
- `logica/recomendador.js` (`formatoPara`) le pasa a `notacion.js` su lectura, su técnica, el estado de esa cosa y lo que eligió; lo usan las pantallas y el planificador.

## «¿Qué hago hoy?», en el código (`logica/planificador.js`)
`planificar(ctx, { minutos, programa })` (programa: `clasica`, `flamenca` o `ambas`, en bloques separados) devuelve los bloques, los avisos y el total. Con los mismos datos sale siempre la misma sesión.
1. Pausas (5 minutos cada 50 en sesiones de 90 o más) y calentamiento (3 o 5 minutos).
2. **Encargos del profesor** activos, con sus minutos, antes que nada; si no cabe nada más, la sesión es el encargo.
3. **Comprobaciones en frío** (`colaDeRepasos`): una sola cola con jerarquía (franja 1 lo que necesita la obra activa · 2 ruta y obra activa · 3 lo que falló · 4 lo vencido · 5 a punto de olvidarse) y, dentro, puntuación (riesgo hasta 2 + relación 0-2 + 1 si falló + 1 por semana vencida, hasta 4); cada 4 semanas vencida sube una franja (nunca a la 1). Entra por orden lo que cabe en 4 minutos (6 con 90 o más, de la sesión entera también con «los dos») y siempre dejando sitio para la ruta. Lo demás sigue en la cola con un aviso.
4. **Candidatos por prioridad** (menor = antes): 1 paso actual · 2 obra eje del tramo (o su pasada de comprobación) · 3 refuerzos, uno por necesidad, y 3,5 la vuelta a una obra cuya comprobación falló · 3,6 repertorio activo del curso, si no hay obra principal · 3,7 lectura atrasada · 4 segundo paso · 5 lectura ligada a la ruta · 6 dosis de lectura y obras en estudio · 7 obra recomendada y demás pasos · 8 resto de áreas. **Lectura por necesidad** (`necesidadLectura`): si no hace falta, no entra; si hace falta, el mejor recurso (lo de la ruta en su orden, el refuerzo de lectura, la obra para leer si aporta, la lectura de su nivel); una sola por sesión; un paso de lectura nunca es el paso actual ni el segundo paso. **Cobertura**: cada área del reparto tiene un margen de días según su peso (`margenDias`); pasado, su mejor candidato sube un punto por día hasta 3,4 (detrás de los refuerzos). **Mientras la ruta espera** (`continuidad`): refuerzos 3 · repertorio activo del curso 4 (la obra final delante; su comprobación en frío del día no la saca de la sesión) · consolidación 4,5 · tope de la cobertura 4,9 (un área olvidada de verdad pasa por delante de la lectura) · lectura 5; una obra para leer no es repertorio por defecto. Entran los que caben en bloques de 5 minutos o más y el tiempo se reparte por pesos **[Decisión, ajustables]**: paso 25, siguiente 15, obra 35, refuerzo 18, lectura 12 (más si va por detrás), obra en estudio 25.
5. Con 45 minutos o más, la obra se parte en trabajo y una pasada al final; nunca se parte un encargo.
6. **Para qué y motivos:** cada bloque lleva una línea `paraQue` («Lo necesitas para la parte A de *Lágrima*») y sus motivos al abrirlo.
7. **Notación de cada bloque:** el propósito del área entra en la recomendación de `notacion.js`, y el encargo del profesor puede fijar el formato.

## La interfaz (Fase 2)
- **Carril lateral** (84 px): Hoy, Curso, Obras, Biblioteca, Progreso, Diario, Profesor y Ajustes, con el selector Clásico | Flamenco debajo del logo (guarda `preferencias.programaPrincipal`).
- **Hoy** (inicio): duración (20 a 2 h) y programa (también «los dos»); bloques con su hora, el punto de su área, título, para qué, etiqueta (Ahora, Ruta, Encargo, Refuerzo, Obra…) y minutos; al abrir uno, motivos, instrucciones, partitura | tablatura, criterio y registro. Terminar la sesión la guarda en el diario. A la derecha: dónde estás (mini-ruta), cómo se ha hecho la sesión (las seis prioridades), el encargo y lo siguiente en la ruta. La sesión no cambia mientras se practica: se rehace al cambiar el tiempo o el programa.
- **Curso:** cabecera con el avance por tramos y «Seguir», los cursos del programa, el mapa de la ruta (camino serpenteante con los glifos de estado y la ★ obra final) y tres tarjetas: ahora, áreas que trabaja el curso y sus obras. Un curso en borrador lo dice.
- **Paso:** dónde está y sus vecinos, aviso si no es el recomendado (se puede abrir y practicar igual), lo que vas a hacer, cuándo está bien, de hecho a dominado, para qué sirve (qué obras prepara y qué abre después), en qué se apoya y cómo vas, con registro.
- **Obra:** papel en la ruta y si es obra final, partes, partitura | tablatura sobre el atril, cómo practicarla, en la ruta, progreso, lo que trabaja, lo que necesitas (agrupado y con enlaces), «si ya la sabías tocar» y su criterio.
- **Ejercicio:** para qué (paso y obra), notación sobre el atril, instrucciones y registro de práctica o en frío.
- **Obras:** las del curso con su papel y lo que piden, lo que conviene ahora fuera de la ruta (nunca lo demasiado difícil), el catálogo y añadir obras.
- **Progreso:** cursos, cada área con su nivel y si va por detrás, hecho frente a dominado, minutos de la semana y lo que está a punto de olvidarse.

## API del servidor
`GET /api/salud` · `GET /api/catalogo` · `GET` y `PUT /api/estado` (con versión; 409 si ha cambiado) · `GET` y `POST /api/eventos` · `GET /api/exportar` · `POST /api/importar` (`?simular` para ver el resumen) · `GET` y `POST /api/copias` · `POST /api/copias/restaurar` · `POST /api/adjuntos` (cabecera `x-nombre`) y `GET /adjuntos/…`. Solo atiende a `127.0.0.1` o `localhost` en su puerto, solo escribe con la cabecera `x-academia: 1` (así ninguna web ajena puede escribir) y solo sirve `web/`, los `.js` de `logica/` y los `.md` de `contenido/`. **Claude escribe por esta API**, no en los archivos, para no pisar nada. Variables `ACADEMIA_PUERTO` y `ACADEMIA_DATOS` para levantar uno de prueba con otros datos.

## Cómo crece
- **Un curso o una ruta nueva:** su curso en `cursos/` y un archivo en `rutas/` con sus tramos y pasos. El validador avisa si un paso trabaja algo que no existe, si la obra final pide algo que la ruta no trabaja o si falta el paso de preparación.
- **Una obra, ejercicio o competencia nueva:** un archivo JSON más en su carpeta. El validador avisa si falta un dato, si una referencia no existe o si mezcla programas; los errores salen en Ajustes.
- **Obras suyas o de su profesor:** desde Obras > Añadir una obra; se guardan en sus datos y se clasifican después (curso, pide, desarrolla, con fuente).
- **Un área nueva:** una línea en `areas.json` (y su reparto en el planificador).
- **Un cambio de formato de sus datos:** se sube `ESQUEMA` en `esquema.js` y se añade el paso en `migraciones.js`; el servidor guarda una copia antes de convertir.
- **Teoría, lectura, oído y diagnóstico:** sus carpetas en `contenido/`; los ejercicios que corrige la app escriben eventos `bateria`, que el dominio ya entiende.
- **Transcripción futura:** un programa local que lea un adjunto y deje una propuesta (notas, compás, digitación, confianza) para enseñarla como «sin verificar»; puede partir de `Tablaturas/sacar/`.

## Pruebas (112, todas en verde; `node --test` en `app/`)
Fase 2.1, con las decisiones definitivas: 27 en `fase-2-1.test.js` (aplicación realizada/aprendida/consolidada, refuerzos, obra eje y lectura por necesidad, lectura que no bloquea ni desplaza la práctica instrumental, cola de comprobaciones con jerarquía, cobertura de varias áreas, obra final y cierre del curso, fallos en frío por aspectos, repertorio en espera y curso en preparación, con simulaciones de varios días) y 6 en `persistencia.test.js` (migración fallida: datos intactos, sin escrituras y recuperación al reiniciar; importación fallida sin restos; importación completa; corte de luz). La revisión anterior añadió 15 en `revision.test.js`. Ver `REVISION-FASE-2.md` e `INFORME-FASE-2.1.md`.
Las 53 de la Fase 1 siguen; 5 se adaptaron solo en los nombres (ruta → programa, etapa → curso), sin cambiar lo que comprueban. Nuevas: las 10 de `ruta.test.js` y 1 del servidor.
- **Dominio (13):** un acierto no es dominado aunque pasen 14 días; tres aciertos espaciados sí; una comprobación demasiado pronto no suma; practicar en caliente o con ayuda no prueba retención; un fallo baja la solidez y pasa a necesita repaso; el «casi»; el vencimiento; cuenta la calidad por aspectos, no solo el tempo; los números se ajustan y el tempo solo obliga si se dice; una sección no completa la obra entera; tandas en frío; convalidación del diagnóstico.
- **Niveles (4):** nivel por núcleo y 80 %; estimación del diagnóstico desmentida por un fallo; un área floja no baja el curso.
- **Notación (9):** los casos A, B, C y D que pidió; no es una regla fija de nivel; lo que no hay o está por hacer no se ofrece y se dice; el aviso de técnica y lectura no quita la partitura; los pasajes que ya puede leer; la validación de la notación propia.
- **Planificador (11):** cuadra los minutos de 20 a 120; encargo primero y sin partir, con el formato que pida el profesor; comprobaciones al principio; programas separados y sin repetidos; más tiempo a lo que va por detrás, contando el desfase en niveles enteros; lectura sobre su propio repertorio; lo estimado se confirma; cada bloque con su porqué; determinista.
- **Ruta (10, nuevas):** el modelo representa programas, cursos, rutas, tramos, pasos, obras, secciones y obra final; el validador exige una ruta coherente y una obra final que no la rompa; todo se ve, pero solo se recomienda lo que toca; al hacer el tramo 1 se abre el 2 y su cierre se comprueba en frío; **una lectura más baja no frena** y la tablatura sigue disponible; **ruta ↔ obra** en los dos sentidos; **una obra con algo flojo genera un refuerzo** y la sesión lo incluye; **una obra que ya conocía no se reinicia**; **«¿Qué hago hoy?» respeta las prioridades y el tiempo** (también con 20 minutos); la migración 1 → 2 no pierde nada.
- **Recomendador (4):** viabilidad, porqué, obras en preparación, nada de lo ya estudiado.
- **Catálogo y migraciones (3):** el contenido real sin errores; detecta repetidos, referencias rotas, programas mezclados, círculos y datos sin naturaleza; migraciones en orden.
- **Servidor (10)** (con una carpeta temporal): crea los datos; conflicto de versiones (también con el archivo cambiado a mano); historial sin duplicados; sobrevive a reiniciar; exportar, importar y comparar; copias y restaurar; adjuntos con nombre seguro; host, cabecera y carpetas; un `estado.json` estropeado no se toca; **si la migración falla, arranca, avisa y no toca nada** (nueva).
- **A mano en el navegador (25/10/2026):** las 22 direcciones de la app sin errores; capturas a 1440 px de Hoy, Curso, Paso, Obra, Ejercicio, Obras, Progreso y el curso flamenco, y Hoy a 1024 px. En un servidor de prueba (para no tocar sus datos): registrar el bloque «Ahora» lo deja hecho y la ruta avanza al paso 2; terminar la sesión; 20 minutos y «los dos»; un encargo va primero; marcar *Lágrima* como conocida cambia su bloque a pasada de comprobación; cambiar de tablatura a partitura en un ejercicio que tiene las dos. Ahí salieron y se corrigieron: dos bloques de lectura el mismo día, una obra «demasiado difícil» entre las que convienen, un texto de bloque equivocado, espaciados y alineaciones.

## Implementado ya
Servidor y guardado completos (estado, historial, copias, exportar, importar, restaurar, adjuntos, migraciones con copia y sin bloquear el arranque); validador del contenido (también cursos, tramos, pasos, obra final, notación propia y criterios); lógica de dominio por aspectos con criterios ajustables, niveles por área, cursos, **ruta de cada curso con estados, refuerzos, obras conocidas y relaciones con las obras**, recomendación de notación, recomendaciones de obras y planificador con las prioridades aprobadas; **interfaz B+**: tokens, componentes (mapa de ruta, glifos, chips, atril, títulos cinéticos, selector de notación, registro) y las pantallas Hoy, Curso, Paso, Obra, Ejercicio, Obras, Progreso y Biblioteca, más profesor, diario, ajustes y evaluaciones; contenido de prueba mínimo y real (2 programas, 13 cursos, la ruta del curso 1 clásico con los tramos 1 y 2 completos y el de cierre, la del curso 1 flamenco con su tramo 1, 5 obras, 4 ejercicios y una notación propia), sin rellenar nada que no estuviera comprobado; lanzador.

## Pendiente
| Qué | Cuándo |
|---|---|
| Dibujar partitura y tablatura en pantalla (el modelo, el selector y la recomendación ya están) y el metrónomo | MVP; él decide si van en esta Fase 2 o en una vuelta aparte |
| Evaluación inicial (diagnóstico) con su pantalla y «Mi punto de partida» | MVP (el modelo ya está: eventos `diagnostico` y convalidación) |
| Contenido real: tramos 3-5 del curso 1 (hoy en borrador), cursos 2-7 y 2-6, teoría, lectura, oído, catálogo de obras; la obra final del curso 1 flamenco | Fase 3 (y 6 para el flamenco) |
| Ejercicios que corrige la app (notas, intervalos, ritmo con la barra espaciadora) | Fases 2-3 |
| Pantallas de área, competencia, diario, profesor, ajustes y evaluaciones: funcionan con el estilo B+, pero sin rediseñar | Cuando él lo pida, o en la Fase 7 |
| Vista de tablet y móvil: no se rompe a 1024 px (la columna lateral baja), sin más | Fase 7 (B+ es para ordenador primero) |
| Mástil interactivo, diagramas, afinador | Fase 4 |
| Exámenes de unidad y de curso, rúbricas, grabación de audio | Fase 5 |
| Programa flamenco completo | Fase 6 |
| Subir archivos desde la interfaz (el servidor ya los guarda) | Fase 3 |
| Copia automática fuera del ordenador | Preparada, sin activar: cuando él lo decida |
| Arranque automático con Windows | Si lo quiere (toca el inicio de Windows) |
| Service worker | Solo si hiciera falta |

## Decisiones que todavía necesitan su aprobación
1. **Reglas de la ruta que he fijado yo:** los pasos de lectura no frenan tramos ni cursos; un tramo se cierra cuando todo lo trabajado sale bien en frío días después (solidez 2 de 3), sin examen aparte; el curso actual es el mayor entre el que marcan la técnica y el repertorio y el siguiente al último terminado (nunca uno sin ruta). Cerradas por él en la Fase 2.1: aplicación, lectura por necesidad, cola con jerarquía, cobertura, cierre del curso, fallos por aspectos y repertorio en espera (ver `INFORME-FASE-2.1.md`).
2. **Números del planificador:** los pesos (paso 25, siguiente 15, obra 35, refuerzo 18, lectura 12, obra en estudio 25) y el tope de 4 minutos de comprobaciones (6 con 90 o más).
3. **La obra final del curso 1, *Lágrima*:** la propuse yo; aprobó que haya obra final por curso, no esta en concreto, y la confirmó el 25/10/2026 como obra final pedagógica del curso 1, que integra y evalúa sus competencias. **No está marcada como conocida** (25/10/2026): es una obra que todavía tiene que aprender.
4. **Diseño, detalles que no estaban en la B+:** Profesor en el carril con su propio icono; el selector de programa debajo del logo; el título de «Hoy» animado una vez al día; los colores de error; cómo se ven los tramos en borrador en el mapa.
5. **Partitura y metrónomo en pantalla:** el plan los ponía en el MVP; en su lista de la Fase 2 pidió «mantener preparado» el sistema de notación. Falta que diga si van ya.
6. **Librería para dibujar la notación:** propuesta VexFlow 5; se confirma al construirlo.
7. **Copia fuera del ordenador y arranque con Windows:** cuando quiera. Hoy, solo preparados.
8. **Criterios del contenido:** los aspectos y pasadas son decisiones mías justificadas en el plan (apartado 7) y ajustables; sin tempos obligatorios. Se revisan con su profesor si quiere.
