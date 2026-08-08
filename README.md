# The New Founder — de la idea al producto con AI

Repo central del taller y el curso. Todo vive aquí: slides, material, configs y tareas.

## Estructura

```
/slides/          → los decks (reveal.js, HTML + markdown)
  /taller/        → deck del workshop de 2 horas
  /curso/         → un deck por módulo
  /shared/        → slides reutilizables entre taller y curso
  /assets/        → imágenes y diagramas
/taller/          → material del workshop (cheatsheet, prompts, 10 errores)
/curso/           → módulos del curso, cada uno con su tarea
/configs/         → lo que te entrego: global config, system prompt, project rules
/recursos/        → links, docs y lecturas
```

## Cómo ver los slides

Los slides cargan markdown externo, así que necesitan un servidor (no funcionan abriendo el archivo directo).

```bash
npx serve .
# abre http://localhost:3000/slides/taller/
```

En producción se deployan solos a Vercel con cada push a `main` (sí, eso es CI/CD — lo vamos a ver en el curso).

## Navegación del deck

| Tecla | Acción |
|-------|--------|
| `→` / `←` | siguiente / anterior |
| `Esc` | vista general de todos los slides |
| `S` | vista de presentador (notas + timer) |
| `F` | pantalla completa |

## Los tres modos de cada slide

- `~ escucha` — concepto. Manos fuera del teclado.
- `$ demo` — yo muestro, tú observas.
- `⚡ hands-on` — ejecutas algo. Cada hands-on dice exactamente qué deberías ver si funcionó.

## Cómo usar este repo si eres estudiante

1. Clónalo: `git clone <url>`
2. Antes de cada clase: `git pull` (material nuevo llega por PR — míralos, así se ven los cambios bien descritos)
3. Tu proyecto personal va en **tu propio repo**, no aquí. Este es la referencia.
4. ¿Duda o typo? Abre un issue o manda un PR. Sí, en serio.
