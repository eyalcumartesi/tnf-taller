# Follow-along: armamos el harness

Lo construimos sobre un proyecto real: una **waitlist**. Cada paso arma una capa del harness, de afuera hacia adentro, hasta cerrar el critique pattern.

> Tu `CLAUDE.md` global (stack: Next.js, shadcn, Supabase, pnpm, Drizzle) ya lo instalaste en el setup. Aquí solo va lo del proyecto.

Regla madre: dejalo lean. 3-5 skills, 2-4 MCP, 1-2 subagentes. Cada dep es una promesa de mantenimiento futuro.

---

## El proyecto: una waitlist

Prompt de arranque. Pégalo en el agente:

```
Construye una waitlist.

Landing pública en la home:
- un formulario con un campo de email que valida el formato
- al enviar, guarda el inscripto en una tabla `signups` (email + fecha) y muestra un mensaje de confirmación
- no permite emails duplicados

Ruta `/panel`, protegida con login:
- lista los inscriptos ordenados por fecha, con el total arriba

Deja el login funcionando de punta a punta y agrega un test e2e del flujo de alta.
```

Por qué así: le das el **qué** (formulario, tabla, panel, login) sin dictarle el **cómo**. El stack ya lo sabe por el global. Los criterios (valida formato, sin duplicados, total arriba, e2e) le dan con qué verificarse solo.

---

## Paso 1 · config (las reglas)

El repo ya trae su `CLAUDE.md`. Si arrancas de cero, crea uno en la raíz con esto:

```markdown
# waitlist

## qué es
landing con formulario de email + panel con login que lista los inscriptos.

## cómo se corre
- dev: pnpm dev
- tests: pnpm test
- base de datos: pnpm db:push

## este repo
- una tabla: signups (email, fecha). Definila en Drizzle (schema.ts), no en el panel de Supabase
- el panel vive detras de login (Supabase auth)
- rama por feature, nunca push directo a main
```

---

## Paso 2 · tooling (un skill)

Empaqueta "armar un PR" una vez. Se auto-carga cuando pidas un PR.

```bash
mkdir -p .claude/skills/crear-pr
```

Crea `.claude/skills/crear-pr/SKILL.md`:

```markdown
---
name: crear-pr
description: Empaqueta cambios en un PR. Usalo cuando el usuario pida abrir o armar un PR.
---

Cuando el usuario pida un PR:

1. git add -A y muestra el diff resumido para confirmar
2. crea una rama nueva descriptiva (feat/..., fix/...)
3. commit con un mensaje claro en imperativo
4. git push -u origin la rama
5. gh pr create con titulo y cuerpo (que cambia y por que)
```

Verifica que aparezca: escribe `/crear-pr`.

---

## Paso 3 · e2e (Playwright)

Un MCP que le da un browser real al agente. Conéctalo:

```bash
claude mcp add playwright -- pnpm dlx @playwright/mcp@latest
```

Confirma con `/mcp`. Luego pídele el test. Pégalo en el agente:

```
Escribe un test e2e del alta en la waitlist con Playwright: abre la home,
ingresa un email, envia y verifica el mensaje de confirmacion. Despues
loguea y verifica que el email aparece en /panel. Correlo hasta que pase.
```

---

## Paso 4 · el loop (critique pattern)

Nunca aceptes el primer output. Un subagente fresco critica el diff sin el sesgo de quien lo escribió.

Nativo, sobre el diff actual:

```
/code-review
```

O a mano, con un subagente:

```
Usa un subagente para revisar mis cambios contra el plan.
Ve solo el diff y los criterios. Lista problemas concretos por severidad.
No arregles nada todavia.
```

Y para corregir con la crítica en mano:

```
Corrige el output aplicando cada punto de la critica. Despues lo reviso yo.
```

---

## Lo que armaste

| capa | qué | comando clave |
|------|-----|---------------|
| 1 · config  | CLAUDE.md del proyecto | ya en el repo |
| 2 · tooling | skill crear-pr | `.claude/skills/crear-pr/SKILL.md` |
| 3 · e2e     | Playwright MCP | `claude mcp add playwright` |
| 4 · loop    | critique del diff | `/code-review` |

El critique con 1 agente. En el bloque siguiente lo escalamos a varios.
