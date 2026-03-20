# Skill: Crear un módulo NestJS

## Cuándo usar
Cuando necesites crear un nuevo módulo en el backend de Convit AI.

## Estructura obligatoria
Cada módulo vive en `backend/src/modules/<nombre>/` y debe contener al menos:

```
modules/<nombre>/
  <nombre>.module.ts      → Definición del módulo
  <nombre>.controller.ts  → Endpoints REST
  <nombre>.service.ts     → Lógica de negocio
  dto/                    → DTOs de entrada/salida
    create-<nombre>.dto.ts
  entities/               → Entidades/schemas
    <nombre>.entity.ts
```

## Patrón del module
```typescript
import { Module } from '@nestjs/common';
import { NombreController } from './nombre.controller';
import { NombreService } from './nombre.service';

@Module({
  controllers: [NombreController],
  providers: [NombreService],
  exports: [NombreService],
})
export class NombreModule {}
```

## Patrón del controller
```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { NombreService } from './nombre.service';

@Controller('nombre')
export class NombreController {
  constructor(private readonly nombreService: NombreService) {}

  // Endpoints aquí
}
```

## Patrón del service
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class NombreService {
  // Lógica de negocio aquí
}
```

## Reglas
- Nombres de archivos en **kebab-case**
- Clases en **PascalCase**
- Siempre exportar el service desde el module (para que otros módulos lo usen)
- DTOs usan **class-validator** para validación
- Si el módulo toca datos de paciente, los DTOs DEBEN incluir `patientId` y `tenantId`
- Registrar el módulo en `app.module.ts`

## Patrón de DTO con validación
```typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateNombreDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  patientId: string;

  // campos específicos...
}
```

## Checklist
- [ ] Archivos creados: module, controller, service
- [ ] DTOs con class-validator
- [ ] Module registrado en app.module.ts
- [ ] tenantId/patientId incluidos si aplica
- [ ] Service exportado desde el module
