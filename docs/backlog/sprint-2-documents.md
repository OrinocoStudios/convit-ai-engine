# Sprint 2 – Documentos: Upload Real, Storage e Ingesta

**Estado:** TODO

## Objetivo
Implementar el flujo completo de upload de archivos (PDFs y documentos pequeños), almacenamiento local/S3, e ingesta al Brain Service para indexación RAG.

---

## Tareas

### S2-01: Upload real de archivos (multipart) — TODO
- Implementar `@nestjs/platform-express` con Multer para upload de archivos
- Endpoint `POST /documents/upload` con multipart/form-data
- Campos: `file` (archivo), `kind` (global_library | patient), `patientId` (si kind=patient)
- Validar tipos MIME permitidos (PDF, imágenes, texto)
- Límite de tamaño configurable (.env)
- **Depende de:** S1-03 (Documents metadata CRUD — DONE)
- **Criterio de aceptación:** Puedo subir un PDF y se guarda el archivo + metadata en MongoDB

### S2-02: Storage local (filesystem) — TODO
- Implementar servicio `StorageService` con estrategia filesystem local
- Guardar archivos en directorio configurable (`STORAGE_PATH` en .env)
- Generar `storageKey` único por archivo (UUID + extensión)
- Método `save(file)` → `storageKey`
- Método `getStream(storageKey)` → ReadStream
- Método `delete(storageKey)`
- Preparar interfaz para futura migración a S3
- **Criterio de aceptación:** Los archivos se guardan en disco y puedo recuperarlos

### S2-03: Ingesta al Brain Service — biblioteca global — TODO
- Después del upload exitoso de un documento `global_library`:
  1. Guardar archivo en storage
  2. Guardar metadata en MongoDB
  3. Llamar al Brain Service para ingesta: `POST /documents/upload` o endpoint de ingesta
  4. Pasar `tenantId`, `documentId`, scope=`GLOBAL_LIBRARY`
- Manejar errores de ingesta (retry o marcar documento como "pending_indexing")
- Agregar campo `indexingStatus` al schema ClinicalDocument (`pending`, `indexed`, `failed`)
- **Depende de:** S2-01, S2-02, S1-09 (RAG Service base)
- **Criterio de aceptación:** Subo un PDF global y aparece indexado en el Brain Service

### S2-04: Ingesta al Brain Service — documentos de paciente — TODO
- Mismo flujo que S2-03 pero con scope=`PATIENT_DOCUMENT`
- Pasar `tenantId` + `patientId` al Brain Service
- Validar aislamiento: el documento solo se indexa bajo ese paciente
- Documentos pequeños: flag `smallFile` para acceso vía tool calls
- **Depende de:** S2-01, S2-02, S1-09
- **Criterio de aceptación:** Subo un documento de paciente y las queries RAG con ese patientId lo encuentran

### S2-05: Endpoint de descarga/visualización de documentos — TODO
- `GET /documents/:id/download` → stream del archivo
- Validar permisos: `x-tenant-id` debe coincidir con el documento
- Si kind=patient, validar acceso al paciente
- **Depende de:** S2-02
- **Criterio de aceptación:** Puedo descargar un documento que subí

### S2-06: Listado mejorado de documentos — TODO
- Agregar paginación a `GET /documents`
- Agregar filtro por `indexingStatus`
- Incluir `indexingStatus` en la respuesta
- **Criterio de aceptación:** Puedo ver el estado de indexación de cada documento

### S2-07: Tests de integración para upload — TODO
- Test upload multipart con archivo mock
- Test validación de tipos MIME
- Test flujo completo: upload → storage → metadata
- Mock del Brain Service para tests de ingesta
- **Depende de:** S2-01 a S2-04

---

## Dependencias
- S1-09 (RAG Service base) debe estar completado
- Brain Service debe soportar ingesta de documentos
- Definir contrato exacto de ingesta con Brain Service (Pinky)
