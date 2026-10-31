# Academia de guitarra: contexto para continuar

Claude Code lee este archivo al empezar cada sesión, en este equipo o en la nube. Aquí está lo imprescindible. El detalle está en los documentos que se citan.

## Estado

- **Rama de trabajo:** `revision-fase-2`. **No está fusionada en `main`.** Se fusiona solo si él lo pide.
- **Hecho:** Fases 1, 2, 2.1 (cerrada: no se reabre) y 3 (cerrada, a falta de su aprobación).
- **Veredicto propuesto de la Fase 3:** APROBADA CON OBSERVACIONES.
- **Las decisiones que le tocan a él** están en `INFORME-FASE-3.md`, apartados J y Q.
- **La revisión independiente de la interfaz de la Fase 3 quedó sin terminar.** Él decide si se hace.
- **Implementación del currículo V3.1:** empezada el 30/10/2026 con su aprobación. Estado y pendientes en `docs/IMPLEMENTACION-V3.1.md`.
- **Enriquecimiento del contenido:** empezado el 30/10/2026 con un tramo de referencia, el 4 del Nivel 1. Aprobado el 30/10/2026 tras reescribirlo: ahora se enriquece el Curso 1 entero, tramo a tramo (`docs/INFORME-CURSO-1.md`). Consolidación del Curso 1 en `docs/INFORME-CONSOLIDACION-CURSO-1.md`. Cursos 2 y 3 enriquecidos el 31/10/2026: `docs/INFORME-CURSOS-2-Y-3.md`. Cursos 1-3 cerrados: `docs/INFORME-CIERRE-CURSOS-1-3.md`; solo se corrigen errores objetivos. Sistema en `docs/ENRIQUECIMIENTO.md`.

## Qué leer antes de tocar nada

1. `INFORME-FASE-3.md`: el estado, lo hecho y lo pendiente.
2. `docs/Arquitectura de la academia.md`: el código, el modelo de datos, las reglas y las pruebas.
3. `docs/PLAN-FASE-3.md` y `docs/revision-fase-3/` (pedagogia.md y qa.md).
4. `docs/Plan de la academia.md`: el plan pedagógico. `INFORME-FASE-2.1.md` tiene las decisiones cerradas.

## Cómo se trabaja

- **Idioma:** español de España, tratándole de usted. Las pantallas de la app hablan de tú al alumno.
- **Sus datos reales no están en el repositorio y no se tocan nunca.** El servidor se prueba solo con datos y puerto temporales:
  `ACADEMIA_PUERTO=8830 ACADEMIA_DATOS=<carpeta temporal> node servidor/servidor.js`
- **Herramientas:** Node 22, módulos ES y sin npm ni dependencias.
  - VexFlow está copiado en `web/vendor/vexflow/`.
  - Las pruebas: `npm test` (`node --test`), también con `TZ=Europe/Madrid`.
- **Commits:** en español, y se suben a la rama de trabajo. Sin pull requests salvo que los pida.
- **Ningún identificador de modelo** en commits ni documentos.
- **Antes de dar algo por hecho:**
  - las pruebas, en verde;
  - el validador del catálogo, sin errores;
  - lo visible, comprobado en el navegador.
- **Si algo pide una decisión arquitectónica importante,** se para y se documenta, sin improvisar.

## El currículo V3.1 (aprobado y congelado el 30/10/2026)

- `docs/curriculo/` es la **fuente de verdad**. No hay más auditorías ni rediseños; solo se corrigen errores objetivos que impidan implementar.
- `contenido/curriculo/` se genera con `node herramientas/generar-curriculo.mjs`. No se edita a mano: una prueba exige que coincida con los documentos.
- La experiencia principal es Curso → Tramo → Lección → Paso → «Continuar». Hoy, Diario, Profesor, dominio y comprobaciones en frío **no se ven**; su lógica sigue por dentro.
- Lo marcado *por verificar* no se da por verificado sin comprobar la fuente. No se inventa contenido.
- Las reglas de abajo siguen vigentes salvo lo que cambia el apartado 14 del maestro.

## Reglas cerradas (no se cambian sin que él lo diga)

- **Programa** es el gran recorrido; **ruta** es el camino interno de un curso.
- **Los pasos futuros se ven.** «Recomendado» nunca significa bloqueado: nada se bloquea artificialmente.
- **Las obras:**
  - preparan pasos, requieren competencias y generan refuerzos;
  - las relaciones van en los dos sentidos;
  - el repertorio que ya sabe no se reaprende.
- **La lectura no bloquea.** Sor es un recurso de lectura y nunca sustituye a *Lágrima*. *Lágrima* es la obra final, con el criterio de la opción 1, y **no se marca como conocida**.
- **La tablatura es permanente.** El selector es «Partitura | Tab | Ambas», y la partitura tiene prioridad cuando el objetivo es leer.
- **El profesor tiene prioridad.**
- **Estados:** realizada, aprendida, consolidada y dominada.
- **Las prioridades del planificador no se rediseñan.**
- **El tempo** es un dato de progreso, no un requisito automático de dominio. Manda el tempo del profesor.
- **La evaluación:**
  - es modular, con un perfil por áreas y nunca un número único;
  - la evidencia del repertorio va competencia por competencia;
  - no bloquea nada.
- **Contenido:** calidad antes que cantidad. Lo dudoso se marca `porVerificar` y no se da como dato.
- **Diseño:** el sistema visual B+, primero el escritorio, sin rediseño.
- **Fuera de alcance:** móvil, nube, cuentas, transcripción, IA que escuche, grabación avanzada, tienda, red social, gamificación, pagos y contenido masivo sin verificar.
