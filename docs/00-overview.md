# Convit AI – Overview

## Objetivo
Plataforma interna para hospitales que permite consultar información clínica mediante IA, con contexto organizado por **clínica (tenant)**, **biblioteca RAG global**, **paciente**, **historia clínica** y **resúmenes de conversación** persistidos aparte.

## Principios
- La IA NO toma decisiones clínicas
- La IA resume y cita
- Los datos no salen del hospital
- Toda respuesta es auditable

## Modelo de contexto (resumen)
- **Biblioteca RAG global**: PDFs médicos compartidos en el tenant; cualquier doctor puede aportar contenido.
- **Pacientes**: compartidos entre doctores del mismo tenant.
- **Por paciente**: documentos pequeños recuperables también vía **tool calls** del agente.
- **Historias clínicas**: agrupan el hilo asistencial; bajo cada una, la UI muestra “Chat 1 / Chat 2 / …” que en backend son **resúmenes de chats** almacenados en **otra base de datos**, no solo chunks del corpus principal.

## MVP
- Chat con contexto por paciente e historia clínica
- Biblioteca global + documentos por paciente
- Búsqueda y visor según ámbito
- Deploy local

## Regla clave
La IA no responde, la IA cita
