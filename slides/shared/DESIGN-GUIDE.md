# Guía de diseño — decks del taller (LÉEME antes de editar cualquier bloque)

Fuente de verdad visual: `../shared/theme.css`. **No escribas CSS nuevo** en los HTML de bloque salvo un ajuste puntual local (y si lo necesitas seguido, va a `theme.css`, no aquí).

## Principios (rol: diseñador de slides, no de contenido)

1. **No cambies el mensaje ni el texto.** Reescribir contenido está prohibido. Tu trabajo es hacerlo más **visual, intuitivo y con mejor flujo**: convertir bullets densos en diagramas, tablas, tarjetas, timelines, loops.
2. **Un concepto por slide.** Si un slide tiene 2 ideas, respíralo: divídelo o jerarquiza.
3. **Muestra, no describas.** Una tabla, un diagrama ASCII/HTML o un snippet anotado gana a un párrafo. Prefiere los componentes de `theme.css`.
4. **Menos texto, más estructura.** Máx ~5 bullets por slide. Los datos de impacto van como métrica grande (`.metric`).
5. **Paleta semántica, respétala:** ámbar = escucha/acento, cyan = demo, verde = hands-on/"funcionó", rojo = error/anti-patrón, muted = secundario.
6. **Nada de librerías externas nuevas.** Solo reveal.js (ya cargado) + `theme.css`. Todo self-contained.

## Componentes disponibles (en theme.css) — úsalos

- `.stack-wrap/.stack/.layer` — pila de capas de una app
- `.cards` (grid, set `--n`) + `.card` (`.icon/.t/.d`) — rejilla de tarjetas
- `.flow/.step/.arrow` — pasos horizontales encadenados
- `.ladder/.rung` (`.step-num/.body`) — escalera vertical / escalación
- `.loop/.node/.cyc` — ciclo (build→measure→learn, critique)
- `.metric` (`.big/.lbl`) — dato de impacto grande
- `.versus` (`.good/.bad`) — comparación bueno/malo
- `.cols` — dos columnas
- `.mode escucha|demo|hands`, `.check`, `.dim`, `.block-header` — firma del deck
- Modificadores de color: `.c-cyan .c-green .c-amber .c-red`

## Esqueleto EXACTO de cada archivo de bloque (copiar verbatim)

Cambia solo: `<title>`, el bloque `data-prev/data-hub/data-next` (los `href`), y las `<section>` internas.

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TÍTULO DEL BLOQUE — taller · the new founder</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.1.0/reveal.min.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../shared/theme.css">
</head>
<body>
<div class="reveal">
<div class="slides">

  <!-- ... tus <section> aquí ... -->

</div>
</div>

<!-- navegación entre decks (ajusta href: prev = bloque anterior, next = siguiente) -->
<a class="deck-nav prev" href="XX-anterior.html">◄ bloque anterior</a>
<a class="deck-nav hub"  href="index.html">agenda</a>
<a class="deck-nav next" href="XX-siguiente.html">bloque siguiente ►</a>

<script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.1.0/reveal.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.1.0/plugin/markdown/markdown.min.js"></script>
<script>
  Reveal.initialize({
    hash: true, transition: 'fade', transitionSpeed: 'fast',
    slideNumber: 'c/t', controls: true, progress: true, center: true,
    width: 1280, height: 720, margin: 0.045, minScale: 0.2, maxScale: 2.8,
    plugins: [ RevealMarkdown ]
  });
</script>
<!-- navegación continua entre bloques (bordes → salta de deck). Cargar DESPUÉS del init. -->
<script src="../shared/deck-nav.js"></script>
</body>
</html>
```

`margin/minScale/maxScale` hacen que el mismo deck escale nítido en **celular, laptop, display y TV 4K**. `deck-nav.js` hace que al llegar al final de un bloque y avanzar (flecha/espacio/control/swipe) saltes al siguiente bloque, y al retroceder desde el primer slide vayas al anterior — sin dejar de tener los botones de esquina.

- Si el bloque es el primero, omite `deck-nav prev`. Si es el último, en `deck-nav next` apunta a `index.html` con texto `volver a la agenda ►`.
- El **primer slide de cada bloque** es siempre su `.block-header` (portada del bloque) — consérvalo tal cual del original.
- Todo slide de contenido conserva su `<span class="mode ...">` original.

## Responsive (celular · laptop · display · TV) — obligatorio

reveal escala el canvas fijo 1280×720 de forma uniforme a cualquier pantalla. Tu trabajo es que **nada se desborde ese canvas** para que el escalado se vea perfecto en todos lados:

- **Ningún slide debe exceder 1280×720.** Si el contenido no cabe, reduce con `clamp()`, baja el `font-size`, aprieta gaps, o **divide en dos slides**. Nunca dejes contenido cortado.
- **Cero scroll horizontal** dentro de un slide. Usa los componentes (ya traen `flex-wrap`, `max-width`, `min-width`).
- Prefiere unidades relativas (`em`, `%`, `clamp()`) sobre `px` fijos grandes.
- El `center: true` de reveal centra vertical: deja aire, no llenes de borde a borde.
- No fijes anchos en px que asuman una pantalla. Deja que los componentes fluyan.

## Pixel-perfect y moderno — checklist antes de terminar

Sé obsesivo con el detalle (el usuario lo exige). Cada slide debe verse **moderno, profesional, NO clunky** — al nivel de la agenda (`index.html`): jerarquía clara, mucho aire, tipografía consistente, acentos de color con intención, micro-interacciones sutiles en hover. Verifica:

- [ ] Cabe en 1280×720 sin corte ni scroll (piénsalo a escala TV y a escala celular).
- [ ] Un solo foco visual por slide; jerarquía obvia (título → visual → remate).
- [ ] Alineaciones consistentes, gaps parejos, nada apretado ni descentrado.
- [ ] Colores semánticos correctos (ámbar/cyan/verde/rojo/muted).
- [ ] Si algo se ve pobre o "de más", mejóralo: conviértelo en tarjeta/diagrama/timeline.
- [ ] Los 3 links `.deck-nav` (prev/hub/next) presentes con hrefs correctos y `deck-nav.js` incluido.

**Verificación con screenshot (hazlo):** hay un Chrome headless por CLI. Con el server corriendo en `http://localhost:7331/`, puedes capturar tu deck a varios viewports y leer el PNG para comprobar el render real:

```
export CHROME_DEVTOOLS_AXI_PORT=9224
chrome-devtools-axi resize 1920 1080   # TV/display
chrome-devtools-axi open "http://localhost:7331/taller/NN-tu-archivo.html#/2"   # slide 2
chrome-devtools-axi wait 500
chrome-devtools-axi screenshot "<ruta-absoluta>/check.png"
```

Cambia `#/0,1,2…` para recorrer cada slide y `resize` a `390 844` (celular) para ver el peor caso. Revisa cada PNG y corrige lo que se desborde o se vea feo. (Si el CLI no responde, razona el layout a 1280×720 y a escala; no bloquees por eso.)

## Qué NO tocar

- El texto/copy de los slides (palabras, orden del mensaje).
- Los archivos `../shared/harness.md` y `../shared/patterns.md` (son compartidos con el repo privado del curso). Si un bloque los usa vía `data-markdown`, puedes **reemplazar ese `data-markdown` por una versión HTML más visual del mismo contenido** dentro del bloque, pero **no edites los .md**.
- El esqueleto `<head>`/`<script>` de arriba.
