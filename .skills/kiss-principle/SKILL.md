---
name: kiss-principle
description: Enforce the KISS (Keep It Simple, Stupid) principle across all code, architecture, naming, comments, and responses. Use always when writing, modifying, or reviewing code, designing solutions, naming variables/functions/classes, writing comments, or providing explanations. Prioritize simplicity and human readability above all else.
---

# KISS Principle

Every decision — code, architecture, naming, comments, responses — must optimize for **simplicity and human understanding**.

## Core Rules

1. **Prefer obvious over clever**: If a solution requires explanation, simplify it.
2. **Fewer abstractions**: Only abstract when there's concrete, immediate duplication. Never abstract preemptively.
3. **Short functions, clear names**: A function should do one thing. Its name should say what that thing is.
4. **Flat over nested**: Reduce nesting levels. Use early returns, guard clauses, and extraction.
5. **Minimal dependencies**: Every dependency is a complexity cost. Justify each one.
6. **No premature optimization**: Write clear code first. Optimize only with evidence.

## When Writing Code

- Choose the most straightforward data structure.
- Avoid patterns (factory, strategy, observer…) unless the problem genuinely demands them.
- Prefer standard library solutions over custom implementations.
- If a one-liner is harder to read than three lines, use three lines.
- Avoid deeply nested ternaries or chained conditionals.

## When Naming

- Names should read like prose: `getUserById`, not `fetchUEntityFromStoreByPK`.
- Avoid abbreviations unless universally understood (`id`, `url`, `config`).
- Boolean names should be questions: `isActive`, `hasPermission`, `canEdit`.

## When Commenting

- Don't comment what the code does — make the code say it.
- Comment only **why** something non-obvious exists.
- Delete commented-out code; that's what version control is for.

## When Reviewing Code

Apply this checklist:

- [ ] Can a new team member understand this in under 2 minutes?
- [ ] Is there unnecessary abstraction or indirection?
- [ ] Are names self-explanatory?
- [ ] Can any function be split or simplified?
- [ ] Are there dependencies that could be removed?
- [ ] Is there dead code or speculative generality?

Flag violations as:
- **Simplificar**: The code works but is more complex than needed.
- **Renombrar**: A name is unclear or misleading.
- **Eliminar**: Code, abstraction, or dependency is unnecessary.

## When Designing Architecture

- Start with the simplest thing that works.
- Add layers only when pain is felt, not anticipated.
- Prefer composition over inheritance.
- A monolith is simpler than microservices until proven otherwise.

## Decision Test

Before any implementation, ask:

> "Is there a simpler way to achieve the same result?"

If yes, use it. If unsure, use the simpler option.
