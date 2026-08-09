# Demo: tu waitlist, de cero a producción

Vas a construir una **waitlist** real y ponerla **online en Vercel**. En vivo, sobre tu carpeta y tu repo.

**Qué es una waitlist:** una página pública con un formulario de email, y un panel privado (con login) que lista a los que se anotaron.

**Cómo funciona este demo:**
- Tú **no tocas la terminal**. El agente escribe el código y corre los comandos por ti.
- Tú solo le pegas los prompts de esta guía, en orden.
- Lo único que escribes en la terminal es `claude`, para abrir el agente.

Antes de esto ya hiciste el `SETUP.md`: instalaste todo y creaste las cuentas de **Supabase** y **Vercel** con tu GitHub.

> **Regla de oro: mantenlo simple.** Pocas piezas. Cada cosa que agregas es algo que después hay que mantener.

Mapa del demo:

| # | paso | dónde |
|---|------|-------|
| 0 | tu config global (tu stack por defecto) | agente |
| 1 | el agente crea tu proyecto | agente + IDE |
| 2 | la config del proyecto (`CLAUDE.md`) | agente |
| 3 | Supabase: base de datos + login | agente |
| 4 | construyes la waitlist | agente |
| 5 | tu primer skill: `crear-pr` | agente |
| 6 | pruebas e2e con Playwright | agente |
| 7 | tu code-review automática | agente |
| 8 | deploy a Vercel | agente |

---

## Paso 0 · tu config global

Esto le enseña al agente tu **stack** (Next, Supabase, etc.) y tus reglas, para **todos** tus proyectos. Lo armas una vez y no lo repites nunca más.

Abre el agente desde la carpeta `tnf-taller` (la que clonaste en el setup) y pégale esto:

```
Lee taller/CLAUDE_EXAMPLE.md de este repo y úsalo como base para mi ~/.claude/CLAUDE.md global.
```

Listo. De aquí en más, cuando le pidas algo, el agente **ya sabe el cómo**. Tú solo dices el **qué**.

---

## Paso 1 · el agente crea tu proyecto

Tu proyecto va en tu propia carpeta (`~/waitlist`), **no** dentro de `tnf-taller`. No la creas tú: se lo pides al agente que ya tienes abierto. Pégale esto:

```
Crea mi proyecto de waitlist por mí (yo no toco la terminal):

1. Ve a mi home (~). No lo crees dentro de tnf-taller.
2. Crea un Next.js limpio en la carpeta `waitlist`:
   pnpm create next-app@latest waitlist --ts --tailwind --app --eslint --no-src-dir --import-alias "@/*" --use-pnpm --yes
   (create-next-app ya inicia git y hace el primer commit; no lo repitas.)
3. Entra a ~/waitlist y sube ese commit a GitHub creando el repo privado:
   gh repo create waitlist --private --source=. --push
4. Cuando termines, avísame para abrir la carpeta en el IDE.
```

Cuando termine, **abre `~/waitlist` en tu IDE** (Cursor o VS Code → *File → Open Folder*). En la terminal del IDE (ya abre en esa carpeta) escribe:

```bash
claude
```

Ese `claude` es lo **único** que escribes en la terminal en todo el demo. De aquí en más, todo se lo pides al agente.

---

## Paso 2 · la config del proyecto

El scaffold te dejó dos archivos: un `CLAUDE.md` que importa `@AGENTS.md`, y un `AGENTS.md` con reglas de Next 16. **No los borres.**

Solo agrégale al `CLAUDE.md` **qué es** esta app. Pégale:

```
Agrega esto al CLAUDE.md que ya existe, dejando la línea `@AGENTS.md` arriba:

# waitlist

## qué es
Una landing con formulario de email + un panel con login que lista los inscriptos.

## cómo se corre
- dev: pnpm dev
- base de datos: pnpm db:push
- e2e: Playwright vía MCP (no hay `pnpm test`, no lo inventes)

## reglas
- una tabla: signups (email, fecha), definida en Drizzle
- el panel va detrás de login (Supabase auth)
- rama por feature, nunca push directo a main
```

El global lleva el peso (el stack y el cómo). Esto solo dice **qué es** la app.

---

## Paso 3 · Supabase: base de datos + login

El agente crea el proyecto de Supabase y lo conecta, todo por CLI (ya lo dejaste logueado en el setup). Tú no tocas la terminal.

Cambia el email y la contraseña por los tuyos y pégale:

```
Crea y conecta mi Supabase por CLI (yo no toco la terminal).
Voy a entrar al /panel con:  EMAIL=yo@demo.com  PASSWORD=una-que-recuerde

1. Mira mis orgs con `supabase orgs list` y crea el proyecto:
   supabase projects create waitlist --org-id <mi-org> --db-password <genera una fuerte y guárdamela> --region <una cercana, ej. us-east-1>
   Espera a que termine de provisionar (~2 min).
2. Saca las claves con `supabase projects api-keys --project-ref <ref>`.
3. Escribe .env.local en la raíz con:
   - DATABASE_URL = el del Session pooler (como dice mi global)
   - NEXT_PUBLIC_SUPABASE_URL = https://<ref>.supabase.co
   - NEXT_PUBLIC_SUPABASE_ANON_KEY = la Publishable key (sb_publishable_...)
4. Deja el login por email activo y apaga la confirmación de email
   (así entro sin abrir un correo en vivo).
5. Crea mi usuario del panel con el EMAIL y PASSWORD de arriba, ya confirmado.

Cuando termines, confírmame que .env.local quedó escrito y el usuario creado.
```

> `.env.local` ya está en el `.gitignore` de Next.js: tus claves nunca suben al repo.

> **Si el CLI se traba en vivo, hazlo a mano en el dashboard:**
> 1. [supabase.com](https://supabase.com) → **New project** (guarda la contraseña).
> 2. Botón **Connect**: en *Session pooler* copia el `DATABASE_URL`; en *App Frameworks*, el **Project URL** y la **Publishable key**.
> 3. Crea `.env.local` en el IDE y pega esos tres valores.
> 4. **Authentication → Providers → Email**: apaga *Confirm email*.
> 5. **Authentication → Users → Add user**: crea el usuario con tu email y contraseña.

---

## Paso 4 · construye la waitlist

Este es el prompt grande, y fíjate lo corto que es: solo le das el **qué**. El **cómo** (Drizzle, shadcn, `proxy.ts`, `dotenv`, `@supabase/ssr`) ya lo sabe por tu global. Pégale:

```
Construye una waitlist con mi stack (Next.js, shadcn, Supabase, Drizzle).
Que se vea moderna y prolija: usa componentes de shadcn, con aire y buena
jerarquía visual (como dice mi global). Nada de HTML pelado.

Base de datos:
- una tabla `signups`: email único + fecha de alta, definida en Drizzle
- configura drizzle-kit, agrega el script `pnpm db:push` y corre el push contra mi Supabase

Landing en la home:
- un formulario con un campo de email que valida el formato
- al enviar, guarda el inscripto y muestra un mensaje de confirmación
- no permite emails duplicados

Ruta `/panel`, protegida con login de Supabase:
- una página de login (email + contraseña)
- sin sesión, /panel manda al login; con sesión, lista los inscriptos
  por fecha, con el total arriba

Usa las variables de mi .env.local y el usuario que ya creé.
Al terminar, corre `pnpm dev` y verifica tú mismo el alta y el login al panel.
```

Compara este prompt con el del Paso 3: aquí casi no hay detalle técnico. **El global ya lo tiene.** Tú solo describes la app.

Cuando termine, abre `http://localhost:3000` y prueba el alta.

---

## Paso 5 · tu primer skill: `crear-pr`

Un **skill** empaqueta una tarea una vez, para reusarla siempre. Este arma un PR y se activa solo cuando pidas uno. Pégale:

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

Para probar que quedó: escribe `/crear-pr` en el agente. Lo usarás en el Paso 8.

---

## Paso 6 · pruebas e2e con Playwright

Un **MCP** le da al agente un browser real: abre la página, la navega y verifica que de verdad funciona. Se conecta solo; tú no tocas la terminal. Pégale:

```
Conecta Playwright como MCP para este proyecto (yo no toco la terminal).
Estás parado en ~/waitlist, corre los comandos acá:

1. pnpm dlx playwright install chrome
   (baja el Chrome que Playwright usa, ~1 min.)
2. claude mcp add playwright -- pnpm dlx @playwright/mcp@latest

Cuando termines, avísame para relanzar el agente.
```

**Cierra el agente y vuelve a abrirlo** (escribe `/exit`, y luego `claude` de nuevo en la misma carpeta): los MCP se cargan al arrancar. Confirma con `/mcp` que aparece `playwright`. Luego pídele el test:

```
Primero verifica que `pnpm dev` esté corriendo en localhost:3000 (si no, levántalo).

Escribe un test e2e con Playwright: abre la home, ingresa un email, envía y
verifica el mensaje de confirmación. Después loguéate con mi usuario de Supabase
y verifica que ese email aparece en /panel. Córrelo hasta que pase.

El email de signups es único, así que usa un email distinto en cada corrida
(ej. test+${Date.now()}@demo.com). Si reusas uno fijo, la segunda corrida falla.
```

> Pásale el email y la contraseña de tu usuario para que pueda loguearse en el test.

Si algo no coincide, el agente itera solo hasta que pasa.

---

## Paso 7 · tu code-review automática

Nunca aceptes el primer resultado. La idea: un **segundo agente**, con ojos frescos, revisa el código que escribió el primero. Como no lo escribió, no lo defiende.

```
   el agente principal termina
            │
            │  ⚡ (opcional) un hook lo dispara solo
            ▼
   ┌────────────────────────┐
   │   agente "critico"      │  ojos frescos · solo lee, no arregla
   └────────────────────────┘
            │
            ▼
   marca los problemas ──▶ el principal corrige ──▶ recién ahí revisas tú
```

Tienes tres niveles, de menos a más:

**1 · Lo nativo (cero setup).** El mismo loop con un comando:

```
/code-review
```

**2 · Tu propio agente `critico`.** Un archivo con tus reglas adentro. Pégale:

```
Crea un subagente en .claude/agents/critico.md con este contenido:

---
name: critico
description: Critica el diff de la waitlist. Solo lee, no arregla.
tools: Read, Grep, Glob
---

Eres un revisor con ojos frescos. No escribiste este código; no le debes el
beneficio de la duda. Solo lees: encuentras, NO arreglas. El principal arregla.

Toma el diff (git diff contra main) y revísalo SOLO contra esto:
- el email se valida antes de insertar en `signups`, y el alta maneja el duplicado
- el guard de /panel corre en el server (proxy.ts), nunca confía en el cliente
- secretos solo desde process.env, nunca escritos a mano en el código
- nada de `any` ni `as` en el path de datos
- reusa el schema de Drizzle (`signups`), no lo redefinas

Cada hallazgo: `archivo:línea` + qué viola + el fix en una línea. Si dudas, descártalo.
Si no hay nada, dilo y listo.
```

Con eso lo corres cuando quieras: `usa el subagente critico para revisar el diff`. Control total, corre cuando tú decides. **Empieza así.**

**3 · El hook que lo dispara solo (opcional).** Si prefieres no depender de acordarte, un `Stop` hook lanza el critico cada vez que el agente termina. El costo: corre en **cada** turno, aun cuando el cambio es trivial. Súmalo solo si te descubres saltándote la revisión. Pégale:

```
Agrega un Stop hook a .claude/settings.json (crea el archivo si no existe; si ya
existe, conserva lo que tenga y solo suma la clave "Stop"). Contenido exacto:

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

> El `grep ... stop_hook_active` es el freno: cuando el critico ya corrió, el hook deja que el agente pare en vez de repetirse para siempre. Si algo se traba, Ctrl-C y borra el bloque `Stop`.

---

## Paso 8 · deploy a Vercel

La app anda en tu máquina, pero en GitHub tu `main` todavía tiene solo el Next.js vacío del Paso 1. Primero subes la waitlist a `main`, y después el agente la deploya por CLI (ya lo dejaste logueado en el setup).

**1. Sube la waitlist a `main`** con tu skill. En el agente:

```
/crear-pr
```

Mergéalo a `main` con el botón **Merge** en la página del PR en GitHub, o pídeselo al agente:

```
Haz merge del PR a main y borra la rama (gh pr merge --merge --delete-branch).
```

**2. Deploya.** Pégale:

```
Deploya a Vercel por CLI (yo no toco la terminal). Ya hice vercel login en el setup.
Parado en ~/waitlist:

1. pnpm dlx vercel link --yes
2. Carga las 3 env vars a production, leyéndolas de mi .env.local
   (hazlo ANTES de deployar, como dice mi global):
   pnpm dlx vercel env add DATABASE_URL production
   pnpm dlx vercel env add NEXT_PUBLIC_SUPABASE_URL production
   pnpm dlx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
3. pnpm dlx vercel git connect   (conecta el repo: cada push a main re-deploya)
4. pnpm dlx vercel deploy --prod

Al terminar, dime la URL.
```

> **Si el CLI se traba en vivo:** importa el repo en [vercel.com/new](https://vercel.com/new) y, en **Environment Variables** (antes de **Deploy**), agrega las tres de tu `.env.local`.

**3. Con la URL en mano**, agrégala en Supabase → **Authentication → URL Configuration** (Site URL + Redirect URLs), o pídeselo al agente.

**4. Abre tu URL**, da de alta un email y entra al `/panel` con el mismo usuario del Paso 3. **Está en producción.**

> Usas el mismo Supabase para local y producción, así que la tabla y tu usuario ya existen. Producción solo necesita las mismas variables.

De aquí en más, cada `push` a `main` re-deploya solo. Sincroniza tu `main` local pidiéndoselo al agente:

```
Sincroniza mi main local con GitHub: git checkout main && git pull.
```

Cualquier cambio futuro: **/crear-pr → merge → Vercel re-deploya solo.**

---

## Lo que armaste

| capa | qué | dónde quedó |
|------|-----|-------------|
| 0 · global  | tu stack por defecto | `~/.claude/CLAUDE.md` |
| 1 · config  | qué es la app | `CLAUDE.md` del repo |
| 2 · tooling | skill `crear-pr` | `.claude/skills/crear-pr/` |
| e2e         | Playwright MCP | `claude mcp add playwright` |
| loop        | tu code-review | `.claude/agents/critico.md` + `/code-review` |
| producción  | app online + re-deploy en cada push | Vercel + Supabase |

De la idea al producto en vivo: una waitlist real, deployada, que se actualiza sola en cada push.
