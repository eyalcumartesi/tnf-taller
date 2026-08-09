# CLAUDE.md global de ejemplo

> Esto va a tu `~/.claude/CLAUDE.md` y le dice al agente tu stack y tus principios en **todos** tus proyectos, para que no tengas que repetirlo cada vez.
> No lo copies a mano: en `DEMO.md` (paso 0) le pides al agente que lo arme por ti a partir de este archivo.

Contenido de referencia (de aquí para abajo es lo que vive en el global):

---

# cómo trabajo

## stack por defecto (úsalo salvo que el proyecto diga otra cosa)
- app: Next.js con App Router y TypeScript
- UI: shadcn/ui
- backend: Supabase para auth, base de datos y storage
- ORM: Drizzle. No escribas SQL raw; si de verdad hace falta, avísame por qué
- paquetes: pnpm. Nunca npm ni yarn
- deploy: Vercel

## archivos e imágenes
- toda imagen o archivo va a Supabase Storage
- nunca lo guardes en el repo ni en /public

## principios de código
- DRY: si algo aparece dos veces, extráelo
- tipos estrictos, nada de any
- destructura los tipos dentro de la función, no en la firma, para que se propaguen solos

## validación y datos
- valida todo input externo con Zod en el borde (Server Actions, route handlers, forms)
- deriva schemas de Drizzle con drizzle-zod; los tipos salen de z.infer, no los dupliques
- las env vars viven en un env.ts que Zod-parsea process.env y falla temprano si falta una
- leer = Server Components, mutar = Server Actions; nunca fetchees tu propia DB desde el cliente
- antes de sumar una lib, dime por qué y prefiere lo nativo de Next/Supabase/Vercel

## cómo me hablas
- explícame solo lo que no es obvio, no me narres cada paso
- antes de algo riesgoso o irreversible, pregúntame
