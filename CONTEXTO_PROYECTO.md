# CONTEXTO DEL PROYECTO - Cisco Academy Management System

## 1. Descripción general del sistema

El proyecto se llama **Cisco Academy Management System**. Es una aplicación web para apoyar la gestión administrativa y académica de la Academia Cisco UTN.

El sistema está desarrollado con:

* Frontend: React + Vite
* Backend: Node.js + Express
* ORM: Sequelize
* Base de datos: MySQL
* Autenticación: JWT con cookies
* Estado global frontend: Context API

La finalidad del sistema es permitir a la coordinación de la Academia Cisco UTN gestionar cursos, participantes, instructores, pagos, certificados, reportes y documentos administrativos asociados a cada curso.

## 2. Necesidad real de la usuaria principal

La usuaria principal es la ingeniera **Ludmila Storodub**, coordinadora de la Academia Cisco UTN.

Durante la revisión funcional, se identificó que la necesidad real no es simplemente tener CRUDs aislados. La ingeniera necesita un flujo más práctico para gestionar cursos reales de la academia.

El problema actual es que el sistema obliga a ingresar datos de cursos manualmente, como si cada curso se creara desde cero. Esto no se ajusta a la realidad de la Academia Cisco, porque los cursos son genéricos y repetitivos.

Ejemplo de cursos base:

* CCNA1 v7 Introduction to Networks
* CCNA2 v7 Switching, Routing and Wireless Essentials
* CCNA3 v7 Enterprise Networking, Security and Automation
* CCNP ENCOR
* CCNP ENARSI
* Programación en Python
* JavaScript Essentials 1
* DevNet Associate
* CyberOps Associate
* IT Essentials
* IoT Fundamentals

Estos cursos pueden dictarse varias veces en distintos periodos.

Ejemplo:

* CCNA1 ENE-MAR2026
* CCNA1 MAY-JUL2026
* CCNA1 SEP-NOV2026

Por eso, el sistema debe evolucionar desde un enfoque de CRUD hacia un enfoque de **gestión de ediciones de cursos**.

## 3. Enfoque funcional decidido

Se decidió usar la base de datos actual, sin crear nuevas tablas por ahora.

La tabla `course` se usará de esta manera:

### Cursos plantilla

Son cursos base precargados mediante script.

Características:

* `status = 'Plantilla'`
* No representan un curso dictado todavía.
* Sirven como catálogo base.
* No deben aparecer en la lista normal de cursos.
* Deben aparecer únicamente en la pantalla "Iniciar nuevo curso".

Ejemplo:

```txt
course_name: CCNA1 v7 Introduction to Networks (ITN)
status: Plantilla
detail_id: 1
```

### Ediciones de curso

Son cursos reales que se van a dictar o ya se dictaron.

Características:

* `status = 'Planificado'`, `'En inscripción'`, `'En ejecución'` o `'Finalizado'`
* Se crean a partir de una plantilla.
* Copian datos clave del curso base, como el `detail_id`.
* Tienen fechas reales, periodo y estado.

Ejemplo:

```txt
course_name: CCNA1 v7 Introduction to Networks (ITN) - MAY-JUL2026
status: Planificado
start_date: 2026-05-15
end_date: 2026-07-15
detail_id: 1
```

## 4. Objetivo principal del nuevo avance

El sistema debe transformarse para que la ingeniera Ludmila pueda:

1. Entrar a una pantalla llamada **Iniciar nuevo curso**.
2. Seleccionar un curso base desde una lista desplegable.
3. Ver un resumen del curso seleccionado.
4. Ingresar únicamente datos variables:

   * Periodo
   * Fecha de inicio del curso
   * Fecha final del curso
   * Fechas de inscripción
   * Fechas de matrícula
   * Estado
5. Guardar la nueva edición del curso.
6. Ver la edición creada en el listado normal de cursos.
7. Evitar que las plantillas aparezcan como cursos reales.

Esto debe reemplazar progresivamente el flujo manual de "crear curso desde cero".

## 5. Flujo esperado: Iniciar nuevo curso

Pantalla: `Iniciar nuevo curso`

Flujo:

```txt
1. Seleccionar curso base:
   - CCNA1 v7 Introduction to Networks
   - CCNA2 v7 Switching, Routing and Wireless Essentials
   - CCNA3 v7 Enterprise Networking, Security and Automation
   - Programación en Python
   - CyberOps Associate
   - etc.

2. Mostrar resumen del curso seleccionado:
   - Nombre
   - Estado de plantilla
   - Detalle asociado
   - Información relacionada si existe

3. Ingresar datos de la edición:
   - Periodo: MAY-JUL2026
   - Fecha inicio
   - Fecha final
   - Inicio de inscripción
   - Fin de inscripción
   - Inicio de matrícula
   - Fin de matrícula
   - Estado

4. Guardar.

5. El backend crea un nuevo registro en `course`.
```

## 6. Documentos administrativos proporcionados

Se revisaron documentos reales usados por la Academia Cisco UTN, entre ellos:

* Informe final del curso
* Oficio de entrega del informe
* Tabulador
* Cronograma
* Reporte de facturación
* Formulario de inscripción
* Memorandos de planificación e informe
* Planificación del curso

Estos documentos muestran que cada curso tiene un expediente administrativo completo.

Ejemplo extraído del informe final:

```txt
Módulo: CCNA1v7 Introducción a las Redes (ITN)
Curso: CCNA1v7 Introducción a las Redes
Nombre en inglés: CCNA1v7 Introduction to Networks (ITN)
Nombre clase: UTN_CCNA1_ENE-MAR2026-CUZME
Instructor: Ing. Fabián Geovanny Cuzme Rodríguez
Duración: 50 horas
Fecha inicio: 27 de enero de 2026
Fecha final: 22 de marzo de 2026
Número de alumnos: 18
```

El oficio de entrega indica que al finalizar el curso se entregan documentos como:

* Informe final
* Tabulador
* Documentos personales
* Certificados

Esto confirma que el sistema debería evolucionar hacia un concepto de **expediente del curso**.

## 7. Concepto propuesto: Expediente del curso

Cada edición de curso debería tener una pantalla tipo expediente.

Ejemplo:

```txt
Expediente: CCNA1 ENE-MAR2026

Datos generales:
- Curso base
- Periodo
- Instructor
- Modalidad
- Fechas
- Horario
- Estado
- Total de horas
- Número de participantes

Documentos:
- Planificación
- Cronograma
- Formulario de inscripción
- Reporte de facturación
- Tabulador
- Informe final
- Memorando de planificación
- Memorando de informe
- Oficio de entrega
```

La primera versión del expediente no necesariamente debe generar PDFs automáticamente. Puede empezar organizando las secciones y permitiendo visualizar, subir o marcar documentos como pendientes/completos.

## 8. Reportes prioritarios solicitados

La ingeniera Ludmila también solicitó reportes. Los reportes deben ser útiles administrativamente, no solo listados CRUD.

### Reporte 1: Cursos planificados, ejecutados y finalizados

Debe mostrar:

* Curso
* Periodo
* Modalidad
* Fecha de inicio
* Fecha final
* Instructor
* Estado
* Número de registrados
* Número de matriculados
* Número de aprobados/reprobados si existe
* Total recaudado si existe

Este reporte debe parecerse conceptualmente a la sección pública de cursos realizados de la página Cisco UTN, donde se presentan cursos con modalidad, fecha inicio, fecha final e instructor.

### Reporte 2: Participantes por curso

Debe mostrar:

* Curso
* Participante
* Cédula
* Teléfono
* Tipo de participante
* Estado de inscripción
* Estado de matrícula
* Aprobación
* Pago total
* Certificado requerido

Este reporte se relaciona con el tabulador y los documentos de cierre del curso.

## 9. Avances ya realizados

Hasta el momento se realizaron avances importantes:

### Autenticación y registro

* Login funcionando.
* Registro funcionando.
* Se habilitó la ruta pública de registro.
* Se agregó mensaje de confirmación al registrar usuario.
* Se corrigió la creación de usuarios para evitar registros sin estado.
* Se empezó a manejar rol por defecto para usuarios registrados.
* Se revisó la conexión entre frontend, backend y base de datos.

### Trabajo con ramas

* Se creó una rama `develop` para desarrollo.
* `main` se usará como rama estable.
* La idea es trabajar en `develop`, probar, y luego hacer merge hacia `main`.

### Inicio del módulo de curso desde plantilla

Se empezó a implementar la funcionalidad de iniciar curso desde plantilla:

* Endpoint para obtener cursos plantilla.
* Endpoint para iniciar curso desde plantilla.
* Pantalla frontend `StartCoursePage`.
* Select de cursos base.
* Formulario para periodo y fechas.
* Creación de nueva edición de curso.

## 10. Reglas importantes de desarrollo

1. No reestructurar la base de datos por ahora.
2. Usar la tabla `course` con `status = 'Plantilla'` para cursos base.
3. Usar la tabla `course` con otros estados para ediciones reales.
4. No mostrar cursos con `status = 'Plantilla'` en el listado normal de cursos.
5. Los cursos plantilla solo deben aparecer en "Iniciar nuevo curso".
6. No eliminar el módulo anterior de cursos todavía; primero ocultar o reemplazar gradualmente el flujo.
7. Mantener consistencia con la arquitectura actual:

   * `api/`
   * `context/`
   * `pages/`
   * `components/`
   * `controllers/`
   * `routes/`
   * `models/`
8. Evitar cambios masivos sin revisar archivos existentes.
9. No inventar rutas ni estructuras nuevas sin validar el código real.
10. Priorizar entregables visibles para la ingeniera Ludmila.

## 11. Entregables de alto valor esperados

Los avances que más valor aportan son:

### Entregable 1: Iniciar nuevo curso desde plantilla

Debe permitir crear una edición de curso sin llenar todo manualmente.

### Entregable 2: Listado de cursos reales sin plantillas

El módulo normal de cursos no debe mostrar plantillas.

### Entregable 3: Expediente del curso

Cada curso real debe tener una pantalla de expediente con datos generales y documentos relacionados.

### Entregable 4: Reporte de cursos

Reporte administrativo de cursos por estado, periodo e instructor.

### Entregable 5: Reporte de participantes por curso

Reporte orientado a tabulador, pagos, aprobación y certificados.

## 12. Prioridad actual

La prioridad inmediata es avanzar de forma fuerte en:

```txt
1. Finalizar "Iniciar nuevo curso desde plantilla".
2. Ocultar plantillas del listado normal.
3. Crear navegación clara hacia "Iniciar nuevo curso".
4. Crear una pantalla de expediente del curso.
5. Crear al menos dos reportes funcionales.
```

El objetivo es que, cuando la ingeniera Ludmila vea el sistema, ya no parezca un conjunto de CRUDs, sino una herramienta real para la gestión académica y documental de cursos Cisco UTN.