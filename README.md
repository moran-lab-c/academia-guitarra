# Academia de guitarra

App local y personal para aprender guitarra clásica: Curso → Tramo → Lección → Paso, con un botón «Continuar». Funciona con Node 22 o superior y un navegador, sin dependencias.

**Rama de trabajo:** `revision-fase-2`. Los datos personales de práctica no están en este repositorio.

## Para leerlo sin descargar nada
Todos estos enlaces son texto plano y se abren sin iniciar sesión.

**Empieza por aquí**
- [Contexto y reglas del proyecto](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/CLAUDE.md)
- [Estado de la implementación y lo que falta](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/docs/IMPLEMENTACION-V3.1.md)
- [Arquitectura del código](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/docs/Arquitectura%20de%20la%20academia.md)

**El currículo aprobado (V3.1), la fuente de verdad**
- [Currículo maestro](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/docs/curriculo/CURRICULO-MAESTRO.md)
- Niveles: [1](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/docs/curriculo/curso-1.md) · [2](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/docs/curriculo/curso-2.md) · [3](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/docs/curriculo/curso-3.md) · [4](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/docs/curriculo/curso-4.md) · [5](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/docs/curriculo/curso-5.md) · [6](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/docs/curriculo/curso-6.md) · [7](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/docs/curriculo/curso-7.md)
- [Repertorio](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/docs/curriculo/repertorio.md) · [Ejercicios](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/docs/curriculo/ejercicios.md) · [Cobertura](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/docs/curriculo/cobertura.md) · [Auditoría de la V3](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/docs/curriculo/AUDITORIA-V3.md)

**El código principal**
- [Lanzador: Abrir academia.cmd](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/Abrir%20academia.cmd)
- [Servidor](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/servidor/servidor.js)
- [Arranque de la interfaz](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/web/inicio.js)
- [Lógica de «Continuar»](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/logica/curriculo.js)
- [Pantalla del nivel](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/web/vistas/nivel.js) · [Pantalla del paso](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/web/vistas/aprender.js) · [Obras](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/web/vistas/obras.js)
- [Generador del currículo](https://raw.githubusercontent.com/moran-lab-c/academia-guitarra/revision-fase-2/herramientas/generar-curriculo.mjs)
- [Todos los archivos](https://github.com/moran-lab-c/academia-guitarra/tree/revision-fase-2)

## Cómo se abre
Doble clic en `Abrir academia.cmd`, o `npm start`. Pruebas: `npm test`. Las versiones anteriores del currículo están en `docs/curriculo/v1/` y `v2/`, solo como historial.
