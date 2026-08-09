# Setup del taller (Mac · Apple Silicon)

Deja el entorno listo **antes de empezar**. Todo es copy-paste en la terminal (Warp).
Pega cada bloque en orden. Tarda ~15 min.

> Si algo ya lo tienes instalado, ese paso simplemente no hace nada. Puedes seguir sin problema.

---

## 1. Homebrew (el gestor de paquetes)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

## 2. oh-my-zsh (shell cómodo)

```bash
RUNZSH=no CHSH=no sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

## 3. Las herramientas (una sola línea)

```bash
brew install git gh nvm pnpm ripgrep jq supabase/tap/supabase
brew install --cask warp cursor
```

`git` y `gh` = versionado + GitHub · `supabase` = el CLI con el que el agente crea la base en el demo · `warp` = la terminal · `cursor` = el IDE (alternativa: VS Code).

## 4. Node LTS (vía nvm)

```bash
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s /opt/homebrew/opt/nvm/nvm.sh ] && . /opt/homebrew/opt/nvm/nvm.sh' >> ~/.zshrc
source ~/.zshrc && nvm install --lts
```

## 5. El agente

Elige uno (o instala los dos, funcionan en paralelo):

```bash
# Claude Code (Anthropic)
npm install -g @anthropic-ai/claude-code

# Codex (OpenAI)
npm install -g @openai/codex
```

## 6. Clona el material del taller

```bash
git clone https://github.com/eyalcumartesi/tnf-taller.git
cd tnf-taller
```

Desde esta carpeta abres el agente (`claude` o `codex`) y tienes todo el material a mano.

## 7. Las cuentas del demo (gratis, créalas ya)

En el demo del harness deployamos una waitlist de verdad. Necesitas tres cuentas; las tres son gratis y conviene crearlas **ahora**, no en medio del demo:

- **GitHub** — la cuenta que usas con `gh auth login` (más abajo, en *Identifícate*). Es la base: Supabase y Vercel se conectan a ella.
- **[Supabase](https://supabase.com)** — base de datos + auth. Entra con **"Continue with GitHub"**. No crees el proyecto todavía: eso es el paso 3 del demo.
- **[Vercel](https://vercel.com/signup)** — el deploy. Entra con **"Continue with GitHub"** y, cuando te lo pida, **autoriza la Vercel GitHub App** (permite instalarla en tus repos). Así en el demo puedes importar tu repo con un clic, sin frenar a autorizar nada.

> Las tres conectadas con la misma cuenta de GitHub = cero fricción en el demo: el repo, la base y el deploy se hablan solos.

---

## Verifica que todo responde

```bash
node -v && pnpm -v && git --version
gh --version && claude --version && supabase --version   # y/o: codex --version
```

Cada comando imprime una versión. Si es así, vas bien.

## Identifícate

```bash
claude                 # primera vez: abre el login (Claude Code)
codex                  # primera vez: abre el login (Codex)
gh auth login
supabase login         # abre el browser → Authorize (auto-captura el token, no copias nada)
pnpm dlx vercel login  # device flow → Authorize en el browser
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

> **Por qué `supabase login` y `vercel login` ahora.** En el demo el agente crea la base y deploya **por CLI, por ti** (tú no tocas la terminal). Esos CLIs no pueden hacer el login solos (abren el browser), así que los dejas logueados aquí, una vez, y en el demo el agente corre todo sin frenarse. Ambos son un clic de *Authorize* (ya estás con GitHub), sin pegar tokens.

> Tu `CLAUDE.md` global (el stack por defecto) lo armas al inicio del demo del harness, en el **paso 0** de `DEMO.md`. Ahí el agente lo genera por ti desde `CLAUDE_EXAMPLE.md`.

---

## ¿Qué necesita cada bloque?

Casi todo se instala una sola vez y temprano. Por eso lo hacemos ahora.

| Bloque | Necesita |
|---|---|
| 01 · 02 | nada, solo mirar |
| 03 · qué es un agente | `claude` |
| 04 · git | `git` · `gh` |
| 05 · el harness | `claude` · `node` · `pnpm` · `supabase` · cuentas + CLIs (Supabase/Vercel) logueados |
| 06 · orquestar | `claude` · `git worktree` |
| 07 · herramientas | `node` · `pnpm` |
| 08 · negocio | nada |
