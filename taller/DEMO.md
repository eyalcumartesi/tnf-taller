# Demo: la waitlist, de cero a producción

Vamos a construir una **waitlist** real y **deployarla a Vercel**. Esta guía es todo el copy-paste del demo: la sigues de arriba hacia abajo y no te falta nada. El agente escribe el código; tú pegas comandos y aprietas los botones de las cuentas (Supabase, Vercel).

Qué armamos: una landing pública con un formulario de email y un panel con login que lista los inscriptos. En vivo, sobre tu propia carpeta y tu propio repo.

> **Antes de esto** ya dejaste el entorno listo (Homebrew, node, pnpm, `gh`, el agente): ver `SETUP.md`.

**Regla madre: déjalo lean.** 3-5 skills, 2-4 MCP, 1-2 subagentes. Cada dependencia es una promesa de mantenimiento futuro.

Mapa del demo (cada paso está abajo, en orden):

| # | paso | dónde |
|---|------|-------|
| 0 | tu config global (el stack por defecto) | agente |
| 1 | abres tu carpeta y arrancas el proyecto | terminal |
| 2 | config del proyecto (`CLAUDE.md`) | agente |
| 3 | Supabase: base de datos + auth | supabase.com + `.env.local` |
| 4 | construyes la waitlist (Drizzle, form, panel, login) | agente |
| 5 | tooling: el skill `crear-pr` | agente |
| 6 | e2e con Playwright | agente |
| 7 | el loop: `/code-review` | agente |
| 8 | deploy a Vercel | vercel.com |

---

## Paso 0 · tu config global (una vez, antes de todo)

Abre el agente **desde la carpeta `tnf-taller`** que clonaste en el setup (ahí vive el ejemplo) y pídele que arme tu config global:

```
Lee taller/CLAUDE_EXAMPLE.md de este repo y usalo como base para mi ~/.claude/CLAUDE.md global.
```

Eso fija tu stack (Next.js, shadcn, Supabase, pnpm, Drizzle, Vercel) y tus principios en **todos** tus proyectos. No lo repites nunca más: es la capa exterior que gobierna todo el harness.

---

## Paso 1 · abre tu carpeta y arranca el proyecto

Tu proyecto va en **tu propia carpeta y tu propio repo**, no dentro de `tnf-taller`. Abre la terminal (Warp) y pega:

```bash
# 1. crea la carpeta y entra
mkdir waitlist && cd waitlist

# 2. arranca un Next.js limpio (App Router + TypeScript + Tailwind)
pnpm create next-app@latest . --ts --tailwind --app --eslint --no-src-dir --import-alias "@/*" --use-pnpm

# 3. versiona y sube a GitHub (crea el repo privado en el mismo comando)
git init && git add -A && git commit -m "init: next.js base"
gh repo create waitlist --private --source=. --push
```

Ahora abre el agente **desde esta carpeta**:

```bash
claude   # o: codex
```

Desde aquí trabaja el resto del demo.

---

## Paso 2 · config del proyecto (`CLAUDE.md`)

Pídele al agente que cree el `CLAUDE.md` del proyecto:

```
Crea un CLAUDE.md en la raíz con esto:

# waitlist

## qué es
landing con formulario de email + panel con login que lista los inscriptos.

## cómo se corre
- dev: pnpm dev
- tests: pnpm test
- base de datos: pnpm db:push

## este repo
- una tabla: signups (email, fecha). Defínela en Drizzle (schema.ts), no en el panel de Supabase
- el panel vive detrás de login (Supabase auth)
- rama por feature, nunca push directo a main
```

El global carga el peso (el stack); el del proyecto queda finito (qué es la app y cómo se corre).

---

## Paso 3 · Supabase (base de datos + auth)

Necesitamos una base de datos Postgres (para Drizzle) y auth (para el login del panel). Las dos vienen de un proyecto de Supabase.

1. Entra a [supabase.com](https://supabase.com) → **New project**. Elige un nombre, una región cercana y **guarda la contraseña** de la base de datos.
2. **Settings → Database → Connection string → URI** y elige **Session pooler** (puerto `5432`, empieza con `postgres.TU-PROYECTO@aws-...pooler.supabase.com`). Es tu `DATABASE_URL`.
3. **Settings → API** → copia **Project URL** y la clave **anon public**.

Crea `.env.local` en la raíz con esos tres valores:

```bash
DATABASE_URL="postgresql://postgres.TU-PROYECTO:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://TU-PROYECTO.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="TU-ANON-KEY"
```

> **Usa el Session pooler, no el Transaction pooler (6543).** Es el único que sirve para las dos cosas del demo: `pnpm db:push` (migraciones de Drizzle) en tu máquina y la app corriendo en Vercel (es IPv4; la conexión directa es IPv6 y Vercel no la alcanza). El de transacciones rompe el `db:push`.

> `.env.local` ya está en el `.gitignore` de Next.js: nunca subas tus claves al repo.

**Crea tu usuario del panel (para que el login funcione en el demo).** El `/panel` vive detrás de login, así que necesitas una cuenta con la que entrar:

4. **Authentication → Providers → Email**: deja activado *Email*, y **apaga "Confirm email"** (así puedes entrar sin abrir un correo de confirmación en vivo).
5. **Authentication → Users → Add user → Create new user**: pon un email y una contraseña que recuerdes. Este es el usuario con el que entrarás al panel.

> Con "Confirm email" apagado y el usuario ya creado a mano, el login del `/panel` funciona al instante, sin pasos de correo en medio del demo.

---

## Paso 4 · construye la waitlist

Este es el prompt grande. Le das el **qué**; el **cómo** (Drizzle, shadcn, Supabase) ya lo sabe por el global. Pégalo en el agente:

```
Construye una waitlist con el stack del global (Next.js, shadcn, Supabase, Drizzle).

Base de datos:
- una tabla `signups` (email único + fecha de alta) definida en Drizzle (schema.ts)
- configura drizzle-kit y agrega el script `pnpm db:push`; corre el push contra mi Supabase

Landing pública en la home:
- un formulario con un campo de email que valida el formato
- al enviar, guarda el inscripto en `signups` y muestra un mensaje de confirmación
- no permite emails duplicados

Ruta `/panel`, protegida con login de Supabase:
- una página de login (email + contraseña) con signInWithPassword de Supabase
- si no hay sesión, /panel redirige al login; con sesión, lista los inscriptos
  ordenados por fecha, con el total arriba

Deja el login funcionando de punta a punta con el usuario que ya creé en Supabase.
Usa las variables de mi .env.local. Al terminar, corre `pnpm dev` y verifica tú
mismo el alta y que puedes entrar al panel con mi email y contraseña.
```

Por qué así: le das el **qué** (tabla, form, panel, login) sin dictarle el **cómo**, y le das los criterios (valida formato, sin duplicados, total arriba) con los que se verifica solo.

Cuando termine, revisa en `http://localhost:3000` que el alta funciona.

---

## Paso 5 · tooling: el skill `crear-pr`

Empaqueta "armar un PR" una vez. Se auto-carga cuando pidas un PR. Pídele al agente:

```
Crea un skill en .claude/skills/crear-pr/SKILL.md con este contenido:

---
name: crear-pr
description: Empaqueta cambios en un PR. Úsalo cuando el usuario pida abrir o armar un PR.
---

Cuando el usuario pida un PR:

1. git add -A y muestra el diff resumido para confirmar
2. crea una rama nueva descriptiva (feat/..., fix/...)
3. commit con un mensaje claro en imperativo
4. git push -u origin la rama
5. gh pr create con título y cuerpo (qué cambia y por qué)
```

Verifica que aparezca: escribe `/crear-pr` en el agente.

---

## Paso 6 · e2e con Playwright

Un MCP le da un browser real al agente: abre la página, la navega y verifica el comportamiento real (lee el accessibility tree, no adivina). Conéctalo:

```bash
claude mcp add playwright -- pnpm dlx @playwright/mcp@latest
```

Confirma con `/mcp`. Luego pídele el test:

```
Escribe un test e2e del alta en la waitlist con Playwright: abre la home,
ingresa un email, envía y verifica el mensaje de confirmación. Después
loguéate con el usuario de Supabase que ya creé y verifica que el email
aparece en /panel. Córrelo hasta que pase.
```

> Pásale al agente el email y la contraseña del usuario que creaste en el Paso 3 para que pueda loguearse en el test.

Se auto-verifica: si no coincide con lo esperado, itera solo.

---

## Paso 7 · el loop: `/code-review`

Nunca aceptes el primer output. Un subagente fresco critica el diff sin el sesgo de quien lo escribió.

Nativo, sobre el diff actual:

```
/code-review
```

Y para corregir con la crítica en mano:

```
Corrige el output aplicando cada punto de la crítica. Después lo reviso yo.
```

El critique con **1 agente**; en el bloque siguiente lo escalamos a varios.

---

## Paso 8 · deploy a Vercel

Ya tienes el repo en GitHub y la app andando local. Ahora a producción.

1. Entra a [vercel.com/new](https://vercel.com/new) → **Import** tu repo `waitlist` de GitHub. (O desde la terminal: `pnpm dlx vercel` y sigue el link.)
2. Antes de deployar, en **Settings → Environment Variables** agrega las tres de tu `.env.local`:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Deploy.** Vercel construye y te da una URL pública.
4. Vuelve a Supabase → **Authentication → URL Configuration** y agrega tu URL de Vercel (`https://tu-waitlist.vercel.app`) a **Site URL** y **Redirect URLs**. (Con login de email+contraseña casi no hace falta, pero lo dejas listo por si luego usas magic links.)
5. Abre tu URL, da de alta un email y entra al `/panel` con **el mismo usuario de Supabase** del Paso 3. Está en producción.

> Como usas el mismo Supabase para local y para producción, la tabla `signups` y tu usuario del panel ya existen (los creaste en los pasos 3 y 4): producción solo necesita las mismas variables.

**A partir de ahora, cada `push` a `main` re-deploya solo.** Eso es CI/CD, y lo vemos a fondo en el curso.

```bash
git add -A && git commit -m "feat: waitlist en producción" && git push
```

---

## Lo que armaste

| capa | qué | dónde quedó |
|------|-----|-------------|
| 0 · global  | `CLAUDE.md` global desde el ejemplo | `~/.claude/CLAUDE.md` |
| 1 · config  | `CLAUDE.md` del proyecto | raíz del repo |
| 2 · tooling | skill `crear-pr` | `.claude/skills/crear-pr/SKILL.md` |
| e2e         | Playwright MCP | `claude mcp add playwright` |
| loop        | critique del diff | `/code-review` |
| producción  | app deployada + CI/CD | Vercel + Supabase |

De la idea al producto en vivo: una waitlist real, con harness, deployada y con deploy automático en cada push.
