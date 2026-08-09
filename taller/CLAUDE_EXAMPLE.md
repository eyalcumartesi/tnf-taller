# CLAUDE.md global de ejemplo

> Esto vive en tu `~/.claude/CLAUDE.md` y le dice al agente tu stack y tus reglas en **todos** tus proyectos. Así no las repites nunca.
> No lo copies a mano: en el **Paso 0** del `DEMO.md` le pides al agente que lo arme por ti a partir de este archivo.

De aquí para abajo es lo que vive en el global:

---

# cómo trabajo

## mi stack (úsalo siempre, salvo que el proyecto diga otra cosa)
- app: Next.js con App Router y TypeScript
- UI: shadcn/ui. Inicialízalo (`pnpm dlx shadcn@latest init`) y usa sus componentes; no armes inputs ni botones a mano
- backend: Supabase (auth, base de datos y storage)
- base de datos: Drizzle. Nada de SQL a mano; si de verdad hace falta, avísame por qué
- paquetes: pnpm (nunca npm ni yarn)
- deploy: Vercel

## reglas de este stack (aplican siempre, no me las hagas repetir)
Estas son las cosas del stack que es fácil olvidar. Respétalas por defecto, sin que te las pida:

- **Next 16 renombró el middleware a `proxy.ts`** (con `export function proxy`), no `middleware.ts`. Usa `proxy.ts`.
- **La sesión de Supabase se refresca en cada request:** usa `@supabase/ssr` y pon la lógica de `updateSession` en `proxy.ts`. Sin eso, las páginas con login no ven la sesión y te mandan al login aunque ya hayas entrado.
- **Drizzle no lee `.env.local` solo** (eso es cosa de Next). En `drizzle.config.ts` carga el archivo a mano con `dotenv.config({ path: ".env.local" })` e instala `dotenv` como dependencia (`pnpm add -D dotenv`). Sin eso, `pnpm db:push` no encuentra el `DATABASE_URL`.
- **Conexión a Supabase: usa el Session pooler (puerto 5432, IPv4)**, con la forma `postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres`. Sirve para las migraciones locales y para Vercel. El Transaction pooler (6543) rompe las migraciones.
- **En Vercel, carga las variables de entorno ANTES del primer deploy.** Si deployas sin ellas, el build falla.

## cómo se ve (que quede moderno)
- todo con componentes de shadcn/ui, nada de HTML pelado
- limpio y con aire: buen espaciado, tipografía clara, jerarquía visual
- estados visibles: loading, error y éxito (nada de pantallas mudas)
- que funcione en dark mode y en móvil

## archivos e imágenes
- toda imagen o archivo va a Supabase Storage
- nunca en el repo ni en `/public`

## cómo escribo código
- si algo se repite, extráelo (DRY)
- tipos estrictos, nada de `any`
- valida todo dato que venga de afuera con Zod (forms, Server Actions, route handlers)
- deriva los schemas de Zod desde Drizzle con drizzle-zod; no dupliques tipos
- las env vars viven en un `env.ts` que las valida con Zod y falla temprano si falta una
- leer datos = Server Components; escribir = Server Actions. Nunca consultes tu base desde el cliente
- destructura los tipos dentro de la función, no en la firma
- antes de sumar una librería, dime por qué y prefiere lo nativo de Next/Supabase/Vercel

## cómo me hablas
- explícame solo lo que no es obvio, no me narres cada paso
- antes de algo riesgoso o irreversible, pregúntame
