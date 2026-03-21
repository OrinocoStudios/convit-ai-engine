# convit-ai-engine

⸻

🏥 Convit AI – MVP Definition

1. Objetivo

Convit AI es una plataforma interna para hospitales que permite:
	•	Consultar información clínica de pacientes
	•	Acceder a documentos médicos de forma rápida
	•	Obtener resúmenes asistidos por IA
	•	Mantener seguridad total de los datos (on-premise)

⸻

2. Principios clave
	•	❗ La IA NO toma decisiones clínicas
	•	✅ La IA resume, organiza y cita información
	•	🔒 Los datos no salen del entorno del hospital
	•	📄 Toda respuesta debe ser trazable y auditable

Regla principal:
“La IA no responde, la IA cita.”

⸻

3. Alcance MVP

Funcionalidades incluidas
	•	Chat con IA contextual por paciente e historia clínica
	•	Biblioteca RAG global de PDFs compartidos (por tenant)
	•	Documentos por paciente (incl. vía tool calls para archivos pequeños)
	•	Subida y búsqueda de documentos según ámbito (global vs paciente)
	•	Resúmenes de conversaciones por historia (“Chat N”) en almacenamiento dedicado
	•	Visor de documentos
	•	Deploy en entorno del hospital (Docker)

⸻

Fuera de MVP (fase posterior)
	•	Panel administrativo completo
	•	Gestión avanzada de usuarios
	•	Integraciones con sistemas hospitalarios (HIS/EMR)

⸻

4. Arquitectura

Enfoque
	•	🟢 Monolito modular (NestJS)
	•	❌ No microservicios (evitar complejidad prematura)

⸻

Componentes
	•	Frontend: React / Next.js
	•	Backend: NestJS
	•	Base de datos:
	•	Neo4j (relaciones)
	•	Vector DB (pgvector o similar)
	•	AI:
	•	LLM local (Qwen / GPT-OSS)
	•	Storage:
	•	S3 compatible o filesystem local

⸻

Flujo principal

Usuario → Backend → RAG → DB → LLM → Respuesta + fuentes

⸻

4.1 Modelo jerárquico del RAG (por clínica)

El conocimiento recuperable por el sistema se organiza así:

```
Clínica (tenant)
├── Biblioteca RAG global — PDFs médicos compartidos
│   └── Cualquier doctor del tenant puede subir contenido
│
└── Pacientes (visibles/compartidos entre los doctores del tenant)
    └── Paciente
        ├── Documentos — archivos pequeños; el agente puede acceder vía tool call
        └── Historias clínicas
            └── Historia clínica (ej. abierta por un doctor)
                ├── “Chat 1”, “Chat 2”, … — entradas de UI
                └── En backend: resúmenes de conversaciones persistidos en otra base de datos
                    (no son solo chunks del mismo índice RAG que los PDFs; conviven como contexto
                     de historia clínica)
```

Notas de diseño:
	•	La **biblioteca global** aporta protocolos, guías y material compartido; no está ligada a un paciente concreto.
	•	Los **documentos del paciente** son de tamaño reducido y están pensados para recuperación dirigida (p. ej. tool calls), no necesariamente el mismo pipeline masivo que los PDFs de la biblioteca.
	•	Cada **historia clínica** acota el hilo asistencial; los “Chat N” son **resúmenes de chats** guardados en **otra base de datos** y se usan como capa de memoria/resumen dentro del contexto de esa historia.
	•	Una consulta puede combinar contexto global del tenant, documentos del paciente e historial resumido de la historia activa, siempre con **fuentes trazables**.


⸻

5. Módulos backend

/modules
  /auth
  /patients
  /documents
  /rag
  /chat
  /audit


⸻

6. Flujos clave

6.1 Consulta clínica (dentro de una historia)
	1.	Usuario selecciona paciente e historia clínica activa (si aplica)
	2.	Realiza una pregunta
	3.	Backend / Brain Service:
	•	Recupera contexto según ámbito: biblioteca global del tenant, documentos del paciente (incl. tool calls si aplica), resúmenes de chats asociados a esa historia (otra DB)
	•	Consulta LLM con política de citas
	4.	Devuelve:
	•	Respuesta
	•	Fuentes utilizadas (documento, historia, o identificador de resumen según proceda)

⸻

6.2 Ingesta — biblioteca RAG global
	1.	Doctor sube PDF compartido (ámbito tenant, sin paciente)
	2.	Backend guarda metadata e ingesta en el índice/corpus global
	3.	RAG: parseo, chunks, embeddings; trazabilidad por `tenantId` y `documentId`

⸻

6.3 Ingesta — documento de paciente
	1.	Usuario sube archivo pequeño asociado al paciente
	2.	Backend guarda metadata (`tenantId`, `patientId`) y registra para RAG y/o exposición a tool calls
	3.	RAG o herramientas recuperan fragmentos con aislamiento estricto por tenant + paciente

⸻

6.4 Resúmenes de chat (“Chat N”)
	1.	Las conversaciones largas se persisten y resumen; los “Chat 1 / Chat 2” de la UI son **entradas de resumen** ligadas a la historia clínica
	2.	Esos resúmenes viven en **una base de datos distinta** al corpus principal de embeddings (operacional / memoria de conversación)
	3.	Al contestar, el sistema puede inyectar esos resúmenes como contexto acotado a la historia, sin confundirlos con fuentes documentales salvo que el contrato lo unifique en `sources`

⸻

7. Contrato crítico (RAG)

interface RetrieveContextResponse {
  chunks: {
    content: string;
    source: string;
    documentId: string;
    scope: 'GLOBAL_LIBRARY' | 'PATIENT_DOCUMENT' | 'CHAT_SUMMARY';
  }[];
}


⸻

8. Reglas de IA (obligatorias)
	•	❌ No inventar información
	•	❌ No responder sin contexto suficiente
	•	✅ Siempre incluir fuentes
	•	✅ Priorizar datos del paciente

⸻

9. Auditoría (mínimo necesario)

Guardar:
	•	Pregunta del usuario
	•	patientId (si aplica)
	•	clinicalHistoryId (si la consulta es por historia clínica)
	•	Ámbitos / scopes utilizados (global, paciente, historia)
	•	Contexto utilizado
	•	Respuesta generada
	•	Timestamp

⸻

10. Riesgos principales

🔴 Riesgo clínico
	•	Respuestas incorrectas o incompletas

Mitigación:
	•	Mostrar fuentes siempre
	•	Limitar el alcance de la IA

⸻

🔴 Seguridad de datos
	•	Fuga de información médica

Mitigación:
	•	Deploy on-premise
	•	Sin dependencias externas

⸻

🔴 Performance
	•	Modelos locales lentos

Mitigación:
	•	Modelos optimizados
	•	Control de tamaño de contexto

⸻

11. Plan de ejecución (4 sprints)

Sprint 1 – Base
	•	Backend modular
	•	Auth básica
	•	Gestión de pacientes
	•	Integración RAG

⸻

Sprint 2 – Documentos
	•	Upload
	•	Procesamiento
	•	Listado

⸻

Sprint 3 – Chat
	•	Endpoint chat
	•	Integración LLM
	•	UI chat

⸻

Sprint 4 – Calidad + deploy
	•	Auditoría
	•	Docker
	•	Mejora de UX

⸻

12. Definición de “Done”

El MVP está listo si:
	•	Se pueden subir PDFs a la biblioteca global y documentos por paciente (con reglas de tamaño/acceso definidas)
	•	Se pueden crear historias clínicas y asociar resúmenes de chat (“Chat N”) persistidos en la DB correspondiente
	•	Se pueden hacer consultas con respuesta + fuentes que distingan origen (global / paciente / resumen de historia)
	•	Funciona en entorno local (hospital)
	•	Soporta uso concurrente básico

⸻

13. Decisión estratégica clave

Convit AI no es un chatbot.

Es:

🧠 Un sistema de acceso seguro, rápido y trazable a información clínica

⸻

14. Prioridad real del sistema

❌ No optimizar:
	•	UI compleja
	•	Features innecesarias

✅ Optimizar:
	•	Calidad del contexto (RAG)
	•	Precisión de fuentes
	•	Trazabilidad

⸻
