# Sprint 5 – Frontend: Cliente Next.js

**Estado:** TODO

## Objetivo
Implementar el cliente web (Next.js + React) que consume la API del backend para permitir a médicos consultar información clínica, chatear con la IA y gestionar documentos.

> **Nota:** El frontend puede ser un repositorio separado. Este backlog define las funcionalidades requeridas.

---

## Tareas

### S5-01: Scaffold Next.js — TODO
- Crear proyecto Next.js con TypeScript
- Configurar estructura de carpetas (app router o pages)
- Configurar tailwind o sistema de estilos
- Configurar variables de entorno (`NEXT_PUBLIC_API_URL`)
- **Criterio de aceptación:** Proyecto Next.js funcional con página de inicio

### S5-02: Pantalla de login / selección de tenant — TODO
- Formulario de autenticación (según estrategia definida en S1-08)
- Selección de clínica/tenant si aplica
- Guardar sesión (token/headers)
- **Depende de:** S1-08 (Auth)
- **Criterio de aceptación:** Puedo autenticarme y acceder al sistema

### S5-03: Pantalla de inicio de chat — TODO
- Input para DNI / Número de Seguridad Social del paciente
- Selector de tipo de identificador (DNI, SSN, otro)
- Botón "Iniciar consulta"
- Al enviar: llamar a `POST /chat/start`
- Mostrar bienvenida si paciente nuevo
- Mostrar contexto inicial si paciente existente
- **Depende de:** S3-02 (Flujo inicio de chat)
- **Criterio de aceptación:** Puedo introducir un DNI y empezar una consulta

### S5-04: Interfaz de chat — TODO
- Área de mensajes con scroll
- Input de texto para preguntas
- Mensajes del usuario (derecha) y del asistente (izquierda)
- Indicador de carga mientras el sistema responde
- **Depende de:** S3-01, S3-03
- **Criterio de aceptación:** Puedo mantener una conversación fluida con la IA

### S5-05: Visualización de fuentes — TODO
- Cada respuesta del asistente muestra las fuentes utilizadas
- Fuentes agrupadas por scope (biblioteca global, documento paciente, resumen chat)
- Click en fuente → abre visor de documento o detalle
- Indicador visual del tipo de fuente
- **Depende de:** S3-07 (Fusión de fuentes)
- **Criterio de aceptación:** Puedo ver de dónde viene cada pieza de información

### S5-06: Upload de documentos — TODO
- Formulario de upload con drag & drop
- Selección de tipo: biblioteca global o documento de paciente
- Si tipo paciente: selector de paciente
- Barra de progreso
- Mostrar estado de indexación (pending, indexed, failed)
- **Depende de:** S2-01 (Upload real)
- **Criterio de aceptación:** Puedo subir un PDF y ver su estado de indexación

### S5-07: Listado y visor de documentos — TODO
- Lista de documentos con filtros (global vs paciente, estado de indexación)
- Visor de PDF inline o en nueva pestaña
- Descarga de documentos
- **Depende de:** S2-05, S2-06
- **Criterio de aceptación:** Puedo buscar, ver y descargar documentos

### S5-08: Gestión de pacientes — TODO
- Lista de pacientes del tenant
- Búsqueda por nombre o identificador
- Detalle de paciente con historias clínicas y documentos
- Crear nuevo paciente
- **Depende de:** S1-01, S1-02, S1-06
- **Criterio de aceptación:** Puedo ver y gestionar la lista de pacientes

### S5-09: Cierre de chat y resúmenes — TODO
- Botón "Cerrar consulta" en el chat
- Indicador de que se está generando el resumen
- Mostrar resumen generado
- Lista de resúmenes ("Chat 1", "Chat 2") por historia clínica
- **Depende de:** S3-05 (Generación de resumen)
- **Criterio de aceptación:** Puedo cerrar un chat y ver el resumen generado

---

## Dependencias
- Backend API funcional (Sprints 1-3 mínimo)
- Decisión sobre repositorio separado o monorepo
- Definición de diseño UI/UX
