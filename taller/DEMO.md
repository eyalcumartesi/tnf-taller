# Demo: la waitlist, de cero a producción

Vamos a construir una **waitlist** real y **deployarla a Vercel**. Esta guía es todo el copy-paste del demo: la sigues de arriba hacia abajo y no te falta nada. **Tú no tocas la terminal:** el agente escribe el código y corre todos los comandos por CLI (crear el proyecto, el repo, Supabase, el deploy a Vercel); tú solo le dictas los prompts. Las cuentas ya las creaste y logueaste en el `SETUP.md`; si algo se traba en vivo, cada paso trae un fallback de dashboard. Lo único que tecleas en la terminal es `claude` para abrir el agente.

Qué armamos: una landing pública con un formulario de email y un panel con login que lista los inscriptos. En vivo, sobre tu propia carpeta y tu propio repo.

> **Antes de esto** ya dejaste el entorno listo (Homebrew, node, pnpm, `gh`, el agente) y creaste las cuentas gratis de **Supabase** y **Vercel** conectadas con tu GitHub: ver `SETUP.md`. Aquí solo las usamos.

**Regla madre: déjalo lean.** 3-5 skills, 2-4 MCP, 1-2 subagentes. Cada dependencia es una promesa de mantenimiento futuro.

Mapa del demo (cada paso está abajo, en orden):

| # | paso | dónde |
|---|------|-------|
| 0 | tu config global (el stack por defecto) | agente |
| 1 | el agente arranca tu proyecto | agente + IDE |
| 2 | config del proyecto (`CLAUDE.md`) | agente |
| 3 | Supabase: base de datos + auth | agente · CLI |
| 4 | construyes la waitlist (Drizzle, form, panel, login) | agente |
| 5 | tooling: el skill `crear-pr` | agente |
| 6 | e2e con Playwright | agente |
| 7 | el loop: crítica automática (hook + agente `critico`) | agente |
| 8 | deploy a Vercel | agente · CLI |

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

## Paso 3 · Supabase (base de datos + auth) — el agente lo arma por CLI

Necesitamos Postgres (para Drizzle) y auth (para el login del panel). El agente crea el proyecto y cablea todo con el **CLI de Supabase**, que ya dejaste logueado en el SETUP. Tú no tocas la terminal. Pégale esto (cambia el email y la contraseña del panel por los tuyos):

```
Creá y cableá mi Supabase por CLI, corriendo tú los comandos (yo no toco la terminal).
Voy a entrar al /panel con este usuario:  EMAIL=yo@demo.com  PASSWORD=una-que-recuerde

1. Proyecto: mirá mis orgs con `supabase orgs list` y creá el proyecto:
   supabase projects create waitlist --org-id <mi-org> --db-password <generá una fuerte y guardámela> --region <una cercana, p. ej. us-east-1>
   Esperá a que termine de provisionar (~2 min) antes de seguir.
2. Claves: sacá la Publishable key y la Secret key (service_role) con
   `supabase projects api-keys --project-ref <ref>`.
3. Armá el DATABASE_URL del Session pooler (puerto 5432, IPv4; sirve para db:push y para Vercel):
   postgresql://postgres.<ref>:<db-password>@aws-0-<region>.pooler.supabase.com:5432/postgres
4. Escribí .env.local en la raíz con los tres valores:
   - DATABASE_URL (el del pooler de arriba)
   - NEXT_PUBLIC_SUPABASE_URL = https://<ref>.supabase.co
   - NEXT_PUBLIC_SUPABASE_ANON_KEY = la Publishable key (sb_publishable_...)
5. Auth: dejá el proveedor Email activo y APAGÁ la confirmación de email (así entro sin
   abrir un correo en vivo): poné enable_confirmations=false en supabase/config.toml y
   corré `supabase config push`; si tu versión del CLI no cubre ese setting en el push,
   hacelo por la Management API de auth.
6. Creá mi usuario del panel vía la Admin API con la Secret key (service_role):
   POST /auth/v1/admin/users con el EMAIL y PASSWORD de arriba y email_confirm=true.

Cuando termines, confirmame que .env.local quedó escrito y el usuario creado.
```

> **Usa el Session pooler, no el Transaction pooler (6543).** Es el único que sirve para las dos cosas del demo: `pnpm db:push` (migraciones de Drizzle) en tu máquina y la app en Vercel (es IPv4; la conexión directa es IPv6 y Vercel no la alcanza). El de transacciones rompe el `db:push`.

> `.env.local` ya está en el `.gitignore` de Next.js: el agente nunca sube tus claves al repo.

> **Fallback dashboard (si el CLI se traba en vivo).** Es el mismo resultado, a mano:
> 1. [supabase.com](https://supabase.com) → **New project** (guarda la contraseña).
> 2. Botón **Connect**: en *Connection string → Session pooler* copia el `DATABASE_URL`, y en *App Frameworks* el **Project URL** y la **Publishable key** (`sb_publishable_...`).
> 3. Crea `.env.local` en el IDE (*New File*) y pega esos tres valores.
> 4. **Authentication → Providers → Email**: apaga *Confirm email*.
> 5. **Authentication → Users → Add user**: crea el usuario con tu email y contraseña.

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

## Paso 7 · el loop: tu propia code-review, disparada por un hook

Nunca aceptes el primer output. Dos piezas del harness lo automatizan: un **agente** que critica con ojos frescos, y un **hook** que lo dispara solo cuando el principal termina.

```
   agente principal termina
            │
            │  ⚡ Stop hook  ── "cuando termina → corre el critico"
            ▼
   ┌──────────────────────┐
   │   agente critico      │  contexto fresco · read-only (Read/Grep/Glob)
   │  tu code-review con    │  no escribió el código → no arrastra el sesgo
   │  unos constraints      │
   └──────────────────────┘
            │
            ▼
   crítica del diff ──▶ el principal corrige ──▶ recién ahí revisas tú
```

Las dos piezas, una línea cada una:

- **Agente (subagente):** un revisor aparte, con **contexto fresco** y **read-only** (`Read/Grep/Glob`, no edita nada). Es **tu propia versión de `/code-review`**, pero con los constraints que le pongas. Como no escribió el código, no defiende sus decisiones.
- **Hook:** un **disparador**. El evento "el agente terminó" corre el critico. No lo pides: se dispara solo.

**1 · El atajo nativo (cero setup).** El mismo loop con un comando, sin crear nada:

```
/code-review
```

**2 · Tu agente critico.** Un archivo: el agente con sus constraints adentro. Pídele al agente que lo cree:

```
Crea un subagente en .claude/agents/critico.md con este contenido:

---
name: critico
description: Critica el diff de la waitlist. Read-only, no arregla.
tools: Read, Grep, Glob
---

Eres un revisor con contexto fresco. No escribiste este código; no le debes el
beneficio de la duda. Read-only: encuentras, NO arreglas. El principal arregla.

Toma el diff (git diff contra main) y revísalo SOLO contra estos constraints:
- el email se valida antes de insertar en `signups`, y el alta maneja el duplicado
- el guard de /panel corre en el server (proxy.ts), nunca confía en el cliente
- secretos solo desde process.env, nunca hardcodeados
- nada de `any` ni `as` en el path de datos
- reusa el schema de Drizzle (`signups`), no redefinas la forma

Cada hallazgo: `archivo:línea` + qué viola + el fix en una línea. Si dudas, lo
descartas: el silencio gana al ruido. Si no hay nada, dilo y listo.
```

**3 · El hook que lo dispara solo.** Para que no dependa de que te acuerdes, un `Stop` hook lo lanza cuando el agente termina. Agrega esto a `.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "grep -q '\"stop_hook_active\": *true' && exit 0; printf '{\"decision\":\"block\",\"reason\":\"Antes de terminar: usa el subagente critico para revisar el diff actual y corrige cada punto que marque.\"}'"
          }
        ]
      }
    ]
  }
}
```

> El `grep ... stop_hook_active` es el **freno anti-loop**: cuando el critico ya corrió y el agente vuelve a terminar, el hook lo deja parar en vez de re-dispararse para siempre. Si algo se traba, Ctrl-C y borra el bloque `Stop`.

En Spexs esto es un sistema más grande (reviewer externo, rúbrica aparte, varias lentes por blast-radius). Para este proyecto **déjalo lean**: un agente + un hook alcanza. El salto a varios agentes es el próximo bloque (orquestación).

---

## Paso 8 · deploy a Vercel — el agente lo hace por CLI

La app anda local, pero en GitHub tu `main` todavía tiene solo el Next.js vacío del Paso 1: el código de la waitlist vive en tu máquina. Primero lo subimos a `main` (con el skill del Paso 5) y después el agente deploya con el **CLI de Vercel**, que ya dejaste logueado en el SETUP.

1. **Sube la waitlist a `main`** con el skill que armaste. En el agente:

   ```
   /crear-pr
   ```

   Arma la rama, el commit y abre el PR. Mergéalo a `main` con el botón **Merge** en la página del PR en GitHub, o pídeselo al agente:

   ```
   Mergeá el PR a main (gh pr merge --merge --delete-branch) y borrá la rama.
   ```

   Ahora `main` tiene la waitlist de verdad, que es lo que Vercel va a deployar.
2. **Deploya por CLI.** Tú no tocas la terminal; pégale al agente:

   ```
   Deployá a Vercel por CLI, corriendo tú los comandos (yo no toco la terminal).
   Ya estoy logueado (hice vercel login en el setup). Parado en ~/waitlist:

   1. pnpm dlx vercel link --yes   (crea/linkea el proyecto, autodetecta Next.js)
   2. Cargá las 3 env vars a production, leyendo los valores de mi .env.local:
      pnpm dlx vercel env add DATABASE_URL production
      pnpm dlx vercel env add NEXT_PUBLIC_SUPABASE_URL production
      pnpm dlx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
      IMPORTANTE: cargálas ANTES de deployar. Si deployás sin ellas, el build
      revienta con "supabaseUrl is required" (la home usa Supabase al pre-renderizar).
   3. pnpm dlx vercel git connect   (conecta el repo de GitHub → CI/CD: cada push a main re-deploya)
   4. pnpm dlx vercel deploy --prod   (build + deploy; me da la URL pública)

   Al terminar, decime la URL.
   ```

   > **Por qué el orden importa:** el CLI deploya sin pasar por el dashboard, así que si no cargas las env vars *antes* (`vercel env add`), el primer build falla con `supabaseUrl is required`. Con las variables ya puestas, el CLI es el camino limpio y de paso `vercel git connect` te deja el CI/CD activo sin tocar el dashboard.
3. Con la URL en mano, agrégala en Supabase → **Authentication → URL Configuration** (**Site URL** + **Redirect URLs**), o pídeselo al agente por CLI/Management API. Con login email+contraseña casi no hace falta, pero lo dejas listo por si luego usas magic links.
4. Abre tu URL, da de alta un email y entra al `/panel` con **el mismo usuario de Supabase** del Paso 3. Está en producción.

> Como usas el mismo Supabase para local y para producción, la tabla `signups` y tu usuario del panel ya existen (los creaste en los pasos 3 y 4): producción solo necesita las mismas variables.

> **Fallback dashboard (si el CLI se traba en vivo).** Importa el repo en [vercel.com/new](https://vercel.com/new), y en **Configure Project → Environment Variables** (antes de **Deploy**) agrega las tres de tu `.env.local` (`DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Cárgalas ahí, en el import, no en *Settings*.

**A partir de ahora, cada `push` a `main` re-deploya solo** (eso lo activó `vercel git connect`). Eso es CI/CD, y lo vemos a fondo en el curso. Sincroniza tu `main` local con lo que acabas de mergear pidiéndoselo al agente:

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
| loop        | crítica del diff (agente + hook) | `.claude/agents/critico.md` + `/code-review` |
| producción  | app deployada + CI/CD | Vercel + Supabase |

De la idea al producto en vivo: una waitlist real, con harness, deployada y con deploy automático en cada push.
