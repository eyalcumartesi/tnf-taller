# Demo: tu waitlist, de cero a producción

Vas a construir una **waitlist** real y ponerla **online**, sin hablar de tecnología. Tú describes el **qué**; el agente hace el **cómo**.

**Qué es una waitlist:** una página pública con un formulario de email, y una página privada (con login) que lista a los que se anotaron.

**Cómo funciona este demo:**
- Tú **no tocas la terminal**. El agente escribe el código y corre los comandos por ti.
- Lo único que escribes en la terminal es `claude`, para abrir el agente.
- Tú solo le das los **specs** de tu app, en lenguaje natural. Nada de nombres de librerías.

Antes de esto ya hiciste el `SETUP.md`: instalaste todo y creaste las cuentas de **Supabase** y **Vercel** con tu GitHub, y dejaste sus CLIs logueados.

> **La idea del demo:** el global carga toda la tecnología. Tú solo describes la app. Eso es *spec-driven*: dices qué quieres, el agente lo construye.

Mapa del demo:

| # | paso | qué haces tú |
|---|------|--------------|
| 0 | tu config global | se la pides al agente, una vez |
| 1 | los specs de tu app | describes la app; el agente la construye y la deploya |
| 2 | pruebas e2e con Playwright | le pides que verifique los flujos solo |
| 3 | tu code-review | un segundo agente revisa el código con ojos frescos |

---

## Paso 0 · tu config global

Esto le enseña al agente tu **stack** y tu **flujo de trabajo** (cómo levanta un proyecto, cómo lo deploya) para **todos** tus proyectos. Lo armas una vez y no lo repites nunca más.

Abre el agente desde la carpeta `tnf-taller` (la que clonaste en el setup) y pégale esto:

```
Lee taller/CLAUDE_EXAMPLE.md de este repo y úsalo como base para mi ~/.claude/CLAUDE.md global.
```

Listo. De aquí en más, cuando le pidas algo, el agente **ya sabe el cómo**. Tú solo dices el **qué**.

Ahora abre una terminal nueva en tu **home** y escribe `claude`. Ese `claude` es lo único que tecleas en todo el demo.

---

## Paso 1 · los specs de tu app

Este es el corazón del demo. Fíjate: **no vas a nombrar ni una sola tecnología.** Solo describes la app y tu login. El agente hace todo lo demás (crea el proyecto, la base de datos, el login, la construye y la deploya), porque tu global ya sabe cómo.

Cambia el email y la clave por los tuyos y pégale:

```
Construye mi app y ponla online. Yo no toco la terminal: haces todo tú
(el proyecto, la base de datos, el login y el deploy), como dice mi global.

Qué es:
Una "waitlist" — una página pública donde la gente deja su email para
anotarse, y una página privada donde yo veo la lista de anotados.

Cómo la quiero:
- La página principal: un formulario con un campo de email. Al enviar, guarda
  el email y muestra un mensaje de gracias. No acepta emails repetidos.
- Al anotarse, además del gracias, muéstrame mi posición en la lista
  ("eres el #142") y una pequeña animación de celebración.
- Referidos: al anotarme, dame un enlace propio para invitar. Cada persona
  que se anote con mi enlace me sube de posición en la lista.
- Una página privada en /panel: pide login. Adentro, la lista de anotados
  ordenada por fecha, con el total arriba.

Mi login del panel:  EMAIL=yo@demo.com   CLAVE=una-que-recuerde

Cuando termines y esté deployada, pásame la URL.
```

Eso es todo lo que escribes. El agente va a: crear tu proyecto y tu repo, provisionar la base y el login, construir la app tal como la describiste, y deployarla. Puede tardar unos minutos y hará varias cosas seguidas; déjalo trabajar.

> **Compara:** no dijiste "Next", ni "Supabase", ni "Drizzle". Dijiste **qué es la app**. El global tiene el cómo. Eso es lo que te libera: describes, no configuras.

> **Si un CLI se traba en vivo**, el agente te avisará y lo terminan por el dashboard: Supabase → *New project* + copiar las claves; Vercel → importar el repo en [vercel.com/new](https://vercel.com/new) y pegar las env vars antes de *Deploy*.

Cuando te pase la URL, ábrela, anota un email y entra a `/panel` con tu login. **Está en producción.**

---

## Paso 2 · pruebas e2e con Playwright

La app anda, pero ¿lo comprobó alguien? Un **MCP** le da al agente un browser real: abre la página, la navega y verifica que de verdad funciona. Se conecta solo; tú no tocas la terminal. Pégale:

```
Conecta Playwright como MCP para este proyecto (yo no toco la terminal).
Estás parado en la carpeta de mi app, corre los comandos ahí:

1. pnpm dlx playwright install chrome   (baja el Chrome de Playwright, ~1 min)
2. claude mcp add playwright -- pnpm dlx @playwright/mcp@latest

Cuando termines, avísame para relanzar el agente.
```

**Cierra el agente y vuelve a abrirlo** (escribe `/exit`, y luego `claude` de nuevo en la misma carpeta): los MCP se cargan al arrancar. Confirma con `/mcp` que aparece `playwright`. Luego pídele el test:

```
Verifica primero que la app esté corriendo en localhost:3000 (si no, levántala).

Escribe una prueba e2e con Playwright: abre la página, ingresa un email, envía
y verifica el mensaje de gracias. Después entra a /panel con mi login y verifica
que ese email aparece en la lista. Córrela hasta que pase.

Usa un email distinto en cada corrida (ej. test+${Date.now()}@demo.com), porque
no se aceptan repetidos.
```

> Pásale el email y la clave de tu login para que pueda entrar al panel en la prueba.

Si algo no coincide, el agente itera solo hasta que pasa. Esa es la idea: **no le crees el "listo" — que lo demuestre.**

---

## Paso 3 · tu code-review

Nunca aceptes el primer resultado. La idea: un **segundo agente**, con ojos frescos, revisa el código que escribió el primero. Como no lo escribió, no lo defiende.

```
   el agente principal termina
            │
            ▼
   ┌────────────────────────┐
   │   agente "critico"      │  ojos frescos · solo lee, no arregla
   └────────────────────────┘
            │
            ▼
   marca los problemas ──▶ el principal corrige ──▶ recién ahí revisas tú
```

Tienes dos formas, de menos a más:

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
- el email se valida antes de guardarlo, y el alta maneja el duplicado
- el guard de /panel corre en el server, nunca confía en el cliente
- secretos solo desde variables de entorno, nunca escritos a mano en el código
- reusa el schema de la tabla, no lo redefinas

Cada hallazgo: `archivo:línea` + qué viola + el fix en una línea. Si dudas, descártalo.
Si no hay nada, dilo y listo.
```

Con eso lo corres cuando quieras: `usa el subagente critico para revisar el diff`. Control total, corre cuando tú decides.

Cualquier cambio futuro: se lo pides al agente en lenguaje natural, y como el repo está conectado a Vercel, **cada push a main re-deploya solo.**

---

## Lo que armaste

| capa | qué | dónde quedó |
|------|-----|-------------|
| 0 · global  | tu stack y tu flujo por defecto | `~/.claude/CLAUDE.md` |
| 1 · la app  | waitlist real, en producción | Supabase + Vercel |
| 2 · e2e     | Playwright verifica los flujos | `claude mcp add playwright` |
| 3 · review  | tu code-review con ojos frescos | `.claude/agents/critico.md` + `/code-review` |

De la idea al producto en vivo, describiendo el **qué**: una waitlist real, deployada, que se actualiza sola en cada push.
