# ADR-0001: Identificadores clínicos del paciente (DNI / SSN)

## Estado

Aceptada / implementada en backend.

## Contexto

Los médicos identifican pacientes por documento nacional (DNI u homólogo) o número de seguridad social (NSS/SSN). El sistema también necesita un **`patientId` estable** (ObjectId de MongoDB) para relaciones internas, auditoría y llamadas al Cerebro.

## Decisión

- En MongoDB, el paciente expone **`dni`** y **`ssn`** como campos opcionales en el DTO, con regla de negocio: **al menos uno** debe informarse al crear.
- Cada campo tiene **índice único parcial por `tenantId`**: puede haber pacientes sin DNI ni SSN solo si la lógica de negocio lo permite en el futuro; en la práctica el servicio valida “al menos uno”.
- La API pública de integración usa **`patientId`** (id interno) en rutas que ya conocen al paciente; la **búsqueda por documento** es `GET /patients/search?identity=<valor>` (coincidencia en `dni` o `ssn` dentro del tenant).
- El Cerebro (Pinky) recibe el **`patientId` interno** en las consultas RAG cuando el contexto es por paciente; la resolución DNI/SSN → id ocurre en el Back.

## Consecuencias

- Positivo: alineación con flujo clínico real sin mezclar “número de documento” con el id Mongo.
- Positivo: unicidad por clínica sin colisiones entre tenants.
- Negativo: los clientes deben hacer lookup por `identity` antes de usar rutas con `:patientId` si parten solo del DNI.

## Referencias

- Esquema: `backend/src/modules/patients/schemas/patient.schema.ts`
- Búsqueda: `backend/src/modules/patients/patients.controller.ts`
