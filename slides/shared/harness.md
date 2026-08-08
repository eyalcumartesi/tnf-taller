# el harness

el caballo ya tiene la fuerza.

sin arnés y sin riendas, esa fuerza se desperdicia.

---

## harness = arnés + riendas del LLM

- **instrucciones** — reglas del proyecto, system prompt
- **contexto** — qué sabe del proyecto y qué no
- **herramientas** — MCP, skills, tests, Playwright
- **verificación** — cómo se comprueba que lo que hizo sirve

mientras mejor el harness, más confiable el output.

---

## global vs. por proyecto

| global | por proyecto |
|--------|--------------|
| tu forma de trabajar | las reglas de ESTE código |
| se configura una vez | vive en el repo |
| yo se los entrego listo | lo armamos juntos |

---

## spec-driven: las riendas escritas

el trabajo duro se mueve **antes** de programar:

1. spec clara → qué se construye y cómo se sabe que está "done"
2. tareas atómicas → cada una verificable
3. el agente ejecuta contra la spec, no contra tu memoria

sin spec, el agente divaga. con spec, cada iteración cierra una tarea.

---

## los ojos del agente: Playwright MCP

sin browser, el agente programa a ciegas.

con Playwright + e2e tests:

- construye el feature
- **lo prueba él mismo en el browser**
- te deja hasta un video comprobando que funciona

de "confía en mí" → a "aquí está la prueba"
