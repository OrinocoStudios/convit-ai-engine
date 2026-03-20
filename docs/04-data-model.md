# Modelo de datos

Patient
- id
- tenantId
- name

Document
- id
- tenantId
- patientId
- type

Chunk
- id
- tenantId
- patientId
- documentId

Conversation
- id
- patientId

Message
- id
- conversationId
- content

AuditLog
- id
- patientId
- action
