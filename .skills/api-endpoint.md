# Skill: Crear un endpoint REST

## Cuándo usar
Cuando necesites agregar un nuevo endpoint al backend de Convit AI.

## Contratos existentes (referencia)
Consultar `docs/05-api-contracts.md` para los endpoints definidos en el MVP.

## Patrón de endpoint

### 1. Definir el DTO de entrada
```typescript
// dto/create-something.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSomethingDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;

  // NO incluir tenantId en el body — se obtiene del token
  // Agregar campos específicos...
}
```

### 2. Definir el DTO de respuesta
```typescript
// dto/something-response.dto.ts
export class SomethingResponseDto {
  id: string;
  // campos...
  sources?: SourceDto[];  // Si la respuesta involucra IA, sources es OBLIGATORIO
}
```

### 3. Implementar en el controller
```typescript
@Controller('something')
export class SomethingController {
  constructor(private readonly somethingService: SomethingService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() dto: CreateSomethingDto,
    @Request() req,
  ): Promise<SomethingResponseDto> {
    return this.somethingService.create(dto, req.user);
  }
}
```

### 4. Implementar en el service
```typescript
@Injectable()
export class SomethingService {
  constructor(
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateSomethingDto, user: AuthUser): Promise<SomethingResponseDto> {
    // 1. Validar que patientId pertenece al tenant del user
    // 2. Ejecutar lógica
    // 3. Registrar en audit log
    await this.auditService.log({
      action: 'CREATE_SOMETHING',
      patientId: dto.patientId,
      tenantId: user.tenantId,
      userId: user.id,
    });
    // 4. Retornar respuesta
  }
}
```

## Reglas
- Todo endpoint que toca datos clínicos requiere `@UseGuards(AuthGuard)`
- `tenantId` se extrae del `req.user` (token), NUNCA del body
- `patientId` se valida contra el tenant
- Si el endpoint involucra respuestas de IA, el response DEBE incluir `sources`
- Toda operación se registra en audit log
- Usar DTOs con class-validator — no aceptar objetos sin validar
- Retornar códigos HTTP apropiados (201 para creación, 200 para consulta, etc.)

## Endpoints del MVP
```
POST   /chat                  → Chat con IA por paciente
POST   /documents/upload      → Subir documento
GET    /documents?patientId=  → Listar documentos de un paciente
GET    /patients              → Listar pacientes del tenant
GET    /patients/:id          → Detalle de paciente
```

## Checklist
- [ ] DTO de entrada con class-validator
- [ ] DTO de respuesta definido
- [ ] AuthGuard aplicado
- [ ] tenantId desde token
- [ ] patientId validado
- [ ] Audit log registrado
- [ ] Sources incluidos si hay respuesta de IA
