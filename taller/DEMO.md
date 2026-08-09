# Demo: la waitlist, de cero a producción

Vamos a construir una **waitlist** real y **deployarla a Vercel**. Esta guía es todo el copy-paste del demo: la sigues de arriba hacia abajo y no te falta nada. **Tú no tocas la terminal:** el agente escribe el código y corre todos los comandos (crear el proyecto, el repo, la base de datos, el deploy); tú le dictas los prompts, creas los archivos desde el IDE y aprietas los botones de las cuentas (Supabase, Vercel). Lo único que tecleas en la terminal es `claude` para abrir el agente.

Qué armamos: una landing pública con un formulario de email y un panel con login que lista los inscriptos. En vivo, sobre tu propia carpeta y tu propio repo.

> **Antes de esto** ya dejaste el entorno listo (Homebrew, node, pnpm, `gh`, el agente) y creaste las cuentas gratis de **Supabase** y **Vercel** conectadas con tu GitHub: ver `SETUP.md`. Aquí solo las usamos.

**Regla madre: déjalo lean.** 3-5 skills, 2-4 MCP, 1-2 subagentes. Cada dependencia es una promesa de mantenimiento futuro.

Mapa del demo (cada paso está abajo, en orden):

| # | paso | dónde |
|---|------|-------|
| 0 | tu config global (el stack por defecto) | agente |
| 1 | el agente arranca tu proyecto | agente + IDE |
| 2 | config del proyecto (`CLAUDE.md`) | agente |
| 3 | Supabase: base de datos + auth | supabase.com + IDE |
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

## Paso 1 · el agente arranca tu proyecto

Tu proyecto va en **tu propia carpeta y tu propio repo**, no dentro de `tnf-taller`. No lo creas tú a mano en la terminal: se lo pides al agente que ya tienes abierto (el del Paso 0, parado en `tnf-taller`). Pégale esto:

```
Armá mi proyecto de la waitlist por mí, corriendo tú los comandos (yo no toco la terminal):

1. Andá a mi home (~), NO lo crees dentro de tnf-taller (así waitlist queda al
   lado, no como un repo git dentro de otro).
2. Scaffoldeá un Next.js limpio (App Router + TS + Tailwind) en la carpeta `waitlist`:
   pnpm create next-app@latest waitlist --ts --tailwind --app --eslint --no-src-dir --import-alias "@/*" --use-pnpm --yes
   (--yes acepta los defaults de lo que no paso, así no frena a preguntar; y
   create-next-app ya inicia el repo git y hace el primer commit en main, no lo repitas).
3. Entrá a ~/waitlist y subí ese commit a GitHub creando el repo privado:
   gh repo create waitlist --private --source=. --push
4. Cuando termine, avisame para abrir la carpeta en el IDE.
```

Cuando el agente termine, **abre la carpeta `~/waitlist` en tu IDE** (Cursor/VS Code → *File → Open Folder*). Desde la terminal integrada del IDE (que ya abre parada en esa carpeta) lanza el agente ahí:

```bash
claude   # o: codex
```

Ese `claude` es el **único texto que tecleas en la terminal** en todo el demo. De aquí en más todo se lo pides al agente, lo creas en el IDE o lo aprietas en los dashboards.

---

## Paso 2 · config del proyecto (`CLAUDE.md`)

El scaffold de Next.js 16 ya te dejó **dos archivos**: un `CLAUDE.md` que solo importa `@AGENTS.md`, y un `AGENTS.md` con reglas clave de Next 16 (que `next dev` reescribe solo). **No los borres**: ese import es lo que le recuerda al agente que Next 16 cambió cosas respecto a lo que "sabe". Solo le sumamos la config del proyecto.

Pídele al agente que agregue el bloque del proyecto al `CLAUDE.md`, **dejando la línea `@AGENTS.md` arriba**:

```
Agrega esto al CLAUDE.md que ya existe, conservando la línea `@AGENTS.md` de arriba:

# waitlist

## qué es
landing con formulario de email + panel con login que lista los inscriptos.

## cómo se corre
- dev: pnpm dev
- base de datos: pnpm db:push
- e2e: Playwright vía MCP (browser real); no hay runner `pnpm test`, no lo inventes

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
2. Arriba del dashboard dale al botón **Connect**: ese diálogo tiene los tres valores. En **Connection string → Session pooler** copia la URI (puerto `5432`, empieza con `postgres.TU-PROYECTO@...pooler.supabase.com`). Es tu `DATABASE_URL`. (También sale por **Settings → Database**.)
3. En el mismo diálogo **Connect → App Frameworks** copia el **Project URL** y la **Publishable key** (`sb_publishable_...`). Esa key opaca es el reemplazo actual de la vieja "anon"; funciona igual con `@supabase/ssr`. Si tu proyecto todavía te muestra una **anon public** (en *Settings → API Keys → Legacy API Keys*), esa también sirve.

**En tu IDE**, crea un archivo nuevo `.env.local` en la raíz del proyecto (click derecho en la carpeta → *New File*) y pega esos tres valores:

```
DATABASE_URL="postgresql://postgres.TU-PROYECTO:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://TU-PROYECTO.supabase.co"
# la Publishable key (sb_publishable_...); si tu proyecto aún usa la anon, va aquí igual
NEXT_PUBLIC_SUPABASE_ANON_KEY="TU-PUBLISHABLE-KEY"
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
- importante: drizzle-kit no lee `.env.local` solo (eso es de Next.js), así que instala
  `dotenv` (`pnpm add -D dotenv`) y en `drizzle.config.ts` carga ese archivo a mano
  (`dotenv.config({ path: ".env.local" })`) para que `pnpm db:push` encuentre el
  `DATABASE_URL`. Instálalo sí o sí: pnpm no deja importar `dotenv` si no es dependencia
  directa del proyecto, así que sin `pnpm add` el push revienta con "Cannot find module 'dotenv'"

Landing pública en la home:
- un formulario con un campo de email que valida el formato
- al enviar, guarda el inscripto en `signups` y muestra un mensaje de confirmación
- no permite emails duplicados

Ruta `/panel`, protegida con login de Supabase:
- una página de login (email + contraseña) con signInWithPassword de Supabase
- si no hay sesión, /panel redirige al login; con sesión, lista los inscriptos
  ordenados por fecha, con el total arriba
- importante: usa `@supabase/ssr` para refrescar la sesión en cada request. En Next 16
  el `middleware.ts` se renombró a `proxy.ts` (con `export function proxy`), así que crea
  un `proxy.ts` en la raíz con la lógica de `updateSession` de @supabase/ssr. Sin eso el
  guard de /panel corre en el servidor, no ve la cookie de sesión y te manda al login
  aunque ya hayas entrado. Si terminas con un `middleware.ts` funciona igual, pero Next 16
  lo marca como deprecado, así que prefiere `proxy.ts`

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

Verifica que aparezca: escribe `/crear-pr` en el agente. Lo usarás en el Paso 8 para subir la waitlist a GitHub antes de deployar.

---

## Paso 6 · e2e con Playwright

Un MCP le da un browser real al agente: abre la página, la navega y verifica el comportamiento real (lee el accessibility tree, no adivina). Que el agente se conecte solo; tú no tocas la terminal. Pégale esto:

```
Conectá Playwright como MCP para este proyecto, corriendo tú los comandos.
Estás parado en ~/waitlist, así que corrélos acá (el MCP se registra con scope
local, keyed a esta carpeta, que es la correcta):

1. pnpm dlx playwright install chrome
   (baja el Chrome que Playwright usa por defecto, ~1 min; sin él el MCP arranca
   con `channel: chrome` y revienta con "Chromium distribution 'chrome' is not
   found" si no tengo Google Chrome instalado, p. ej. solo Safari).
2. claude mcp add playwright -- pnpm dlx @playwright/mcp@latest

Cuando termine, avisame para relanzar el agente (los MCP se cargan al arrancar).
```

**Cierra el agente y vuelve a abrirlo** (`/exit` o Ctrl-C dos veces, y teclea `claude` de nuevo en la misma carpeta): los MCP se cargan al arrancar, así que el que registró no aparece en la sesión que ya tenías abierta hasta relanzarla. Confirma con `/mcp` que sale `playwright`. Luego pídele el test:

```
Antes de correr el test, verifica que `pnpm dev` esté levantado en
localhost:3000 (si no, levántalo); el browser de Playwright abre esa URL real.

Escribe un test e2e del alta en la waitlist con Playwright: abre la home,
ingresa un email, envía y verifica el mensaje de confirmación. Después
loguéate con el usuario de Supabase que ya creé y verifica que ese mismo
email aparece en /panel. Córrelo hasta que pase.

importante: la tabla `signups` tiene el email único y apunta a mi Supabase
real, así que genera un email distinto en cada corrida (p. ej.
`test+${Date.now()}@demo.com`); si reusas un email fijo, la segunda corrida
choca con el duplicado, no sale el mensaje de confirmación y el test falla.
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

La app anda local, pero en GitHub tu `main` todavía tiene solo el Next.js vacío del Paso 1: el código de la waitlist vive en tu máquina. Antes de deployar hay que subirlo, y aquí usas por fin el skill del Paso 5.

1. **Sube la waitlist a `main`** con el skill que armaste. En el agente:

   ```
   /crear-pr
   ```

   Arma la rama, el commit y abre el PR. Mergéalo a `main` con el botón **Merge** en la página del PR en GitHub, o pídeselo al agente:

   ```
   Mergeá el PR a main (gh pr merge --merge --delete-branch) y borrá la rama.
   ```

   Ahora `main` tiene la waitlist de verdad, que es lo que Vercel va a deployar.
2. Entra a [vercel.com/new](https://vercel.com/new) → **Import** tu repo `waitlist` de GitHub. Si no ves tu repo, dale a **Adjust GitHub App Permissions** y dale acceso — esto ya lo autorizaste al crear la cuenta en `SETUP.md`, así que debería aparecer directo.

   > Hazlo por el **dashboard**, no por `pnpm dlx vercel`: el CLI deploya de una y **no** te muestra la sección de Environment Variables del paso 3, así que el primer build revienta con `supabaseUrl is required` (justo lo que el dashboard te deja evitar cargando las variables antes de buildear).
3. En esa misma pantalla de import (**Configure Project**, antes de tocar **Deploy**) abre la sección **Environment Variables** y agrega las tres de tu `.env.local`:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   > Cárgalas **ahí, en el import**, no en *Settings*: ese menú de Settings recién existe después de crear el proyecto. Y tienen que estar antes del primer build: la home usa el cliente de Supabase al pre-renderizar, así que sin las variables el primer deploy **falla en el build** (`supabaseUrl is required`).
4. **Deploy.** Vercel construye y te da una URL pública.
5. Vuelve a Supabase → **Authentication → URL Configuration** y agrega tu URL de Vercel (`https://tu-waitlist.vercel.app`) a **Site URL** y **Redirect URLs**. (Con login de email+contraseña casi no hace falta, pero lo dejas listo por si luego usas magic links.)
6. Abre tu URL, da de alta un email y entra al `/panel` con **el mismo usuario de Supabase** del Paso 3. Está en producción.

> Como usas el mismo Supabase para local y para producción, la tabla `signups` y tu usuario del panel ya existen (los creaste en los pasos 3 y 4): producción solo necesita las mismas variables.

**A partir de ahora, cada `push` a `main` re-deploya solo.** Eso es CI/CD, y lo vemos a fondo en el curso. Sincroniza tu `main` local con lo que acabas de mergear pidiéndoselo al agente:

```
Sincronizá mi main local con GitHub: git checkout main && git pull.
```

De aquí en más, cualquier cambio futuro: **/crear-pr → merge → Vercel re-deploya solo.**

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
