/* ══════════════════════════════════════════════════════════════════
   deck-nav.js — navegación CONTINUA entre decks del taller
   Al llegar al final de un bloque y avanzar (flecha/espacio/control/
   swipe), salta al bloque siguiente. Al retroceder desde el primer
   slide, va al bloque anterior y aterriza en su ÚLTIMO slide.
   Los destinos se leen de los links .deck-nav.next / .deck-nav.prev.
   Cargar DESPUÉS de Reveal.initialize().
   ══════════════════════════════════════════════════════════════════ */
(function () {
  function href(sel) { var a = document.querySelector(sel); return a ? a.getAttribute("href") : null; }
  var NEXT = href("a.deck-nav.next");
  var PREV = href("a.deck-nav.prev");

  function goNext() { if (NEXT) window.location.href = NEXT; }
  // aterrizar en el último slide del bloque anterior: índice alto → reveal lo clampa
  function goPrev() { if (PREV) window.location.href = PREV.split("#")[0] + "#/999"; }

  var R = window.Reveal;
  if (!R) return;

  // ── teclado: interceptar en captura para preemptar a reveal en los bordes ──
  document.addEventListener("keydown", function (e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    var fwd = e.key === "ArrowRight" || e.key === "PageDown" || e.key === " " || e.key === "Spacebar";
    var back = e.key === "ArrowLeft" || e.key === "PageUp";
    if (fwd && NEXT && R.isLastSlide()) { e.preventDefault(); e.stopImmediatePropagation(); goNext(); }
    else if (back && PREV && R.isFirstSlide()) { e.preventDefault(); e.stopImmediatePropagation(); goPrev(); }
  }, true);

  function onReady() {
    // ── controles en pantalla de reveal: al borde, saltan de bloque ──
    var right = document.querySelector(".navigate-right");
    var down = document.querySelector(".navigate-down");
    var left = document.querySelector(".navigate-left");
    var up = document.querySelector(".navigate-up");
    [right, down].forEach(function (el) { if (el) el.addEventListener("click", function () { if (R.isLastSlide()) goNext(); }); });
    [left, up].forEach(function (el) { if (el) el.addEventListener("click", function () { if (R.isFirstSlide()) goPrev(); }); });

    // ── swipe táctil en los bordes (celular) ──
    var sx = null, sy = null;
    document.addEventListener("touchstart", function (e) {
      if (e.touches.length === 1) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }
    }, { passive: true });
    document.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      sx = null;
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return; // no es swipe horizontal claro
      if (dx < 0 && NEXT && R.isLastSlide()) goNext();
      else if (dx > 0 && PREV && R.isFirstSlide()) goPrev();
    }, { passive: true });
  }

  if (typeof R.isReady === "function" && R.isReady()) onReady();
  else R.on("ready", onReady);
})();
