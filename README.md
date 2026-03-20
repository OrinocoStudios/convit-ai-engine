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
	•	Chat con IA contextual por paciente
	•	Subida de documentos (PDF, informes, etc.)
	•	Búsqueda de documentos
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

6.1 Consulta clínica
	1.	Usuario selecciona paciente
	2.	Realiza una pregunta
	3.	Backend:
	•	Recupera contexto (RAG)
	•	Consulta LLM
	4.	Devuelve:
	•	Respuesta
	•	Fuentes utilizadas

⸻

6.2 Ingesta de documentos
	1.	Usuario sube documento
	2.	Backend:
	•	Guarda metadata
	•	Envía a RAG
	3.	RAG:
	•	Parsea
	•	Divide en chunks
	•	Genera embeddings
	4.	Guarda en DB

⸻

7. Contrato crítico (RAG)

interface RetrieveContextResponse {
  chunks: {
    content: string;
    source: string;
    documentId: string;
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
	•	patientId
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
	•	Se pueden subir documentos por paciente
	•	Se pueden hacer consultas con respuesta + fuentes
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
