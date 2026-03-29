---
name: critical-planning-first
description: Enforces planning before implementation with critical analysis of cases and corner cases, then asks for explicit user decisions at key branches. Use when the user requests new features, refactors, bug fixes, architecture changes, or any non-trivial code modification.
---

# Critical Planning First / Planificacion Critica Primero

## Purpose / Proposito

Always run a planning phase before writing code.  
Siempre ejecuta una fase de planificacion antes de escribir codigo.

The planning phase is critical by default: identify normal paths, edge cases, and failure modes, then ask the user to choose how to proceed in each relevant branch.  
La fase de planificacion es critica por defecto: identifica rutas normales, edge cases y modos de fallo, y luego pregunta al usuario como proceder en cada rama relevante.

## Default Behavior / Comportamiento por defecto

1. Do not start implementation until a plan exists and the user confirms decisions.  
   No iniciar implementacion hasta tener plan y confirmacion del usuario.
2. Be critical: challenge assumptions, constraints, and hidden risks.  
   Ser critico: cuestionar supuestos, restricciones y riesgos ocultos.
3. Prefer "recommend and ask": propose a best option, then request confirmation.  
   Preferir "recomendar y preguntar": proponer mejor opcion y pedir confirmacion.
4. Use simple language and keep options concise (KISS).  
   Usar lenguaje simple y opciones concisas (KISS).

## Allowed Exception / Excepcion permitida

You may skip a full planning round only for trivial, low-risk edits, such as:
- typo fixes,
- copy-only documentation wording,
- renaming with no behavior change,
- formatting-only changes.

Even in these cases, state briefly why planning is being minimized.  
Incluso en estos casos, indicar brevemente por que se minimiza la planificacion.

## Planning Workflow / Flujo de planificacion

### Step 1: Clarify objective
- Restate goal, constraints, and success criteria.
- Detect ambiguity and list assumptions that need confirmation.

### Step 2: Map scenarios
- Happy path (normal case)
- Error paths
- Boundary conditions
- Data/state transitions
- Integration/dependency impacts

### Step 3: Enumerate corner cases
- Invalid input
- Empty/null/missing data
- Large payload/performance limits
- Concurrency/race conditions
- Backward compatibility
- Security/privacy impacts

### Step 4: Decision points
For each relevant branch:
- Present 2-3 options max.
- Mark one as recommended and explain why.
- Ask the user what to do before coding.

### Step 5: Implementation gate
Only implement after explicit user confirmation of the chosen path.

## Required Planning Output / Salida obligatoria de planificacion

Use this structure before coding:

```markdown
# Plan / Plan

## Objective / Objetivo
- [Goal and expected outcome]

## Cases / Casos
- Happy path:
- Error cases:
- Corner cases:

## Risks / Riesgos
- [Risk] -> [Mitigation]

## Decision points / Puntos de decision
1. [Decision]
   - Option A:
   - Option B:
   - Recommended:
   - Question to user:

## Proposed next step / Siguiente paso propuesto
- [What will be implemented after confirmation]
```

Then close planning with this checklist:

```markdown
Planning checklist:
- [ ] Objective and constraints are clear
- [ ] Main cases and corner cases are covered
- [ ] Risks and mitigations are explicit
- [ ] Decision points were asked to the user
- [ ] User confirmed the path to implement
```

## Response Style / Estilo de respuesta

- Be direct and concise.
- Ask only necessary questions.
- Keep alternatives short and practical.
- Avoid overengineering.
