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
brew install git gh nvm pnpm ripgrep jq
brew install --cask warp cursor
```

`git` y `gh` = versionado + GitHub · `warp` = la terminal · `cursor` = el IDE (alternativa: VS Code).

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

---

## Verifica que todo responde

```bash
node -v && pnpm -v && git --version
gh --version && claude --version   # y/o: codex --version
```

Cada comando imprime una versión. Si es así, vas bien.

## Identifícate

```bash
claude                 # primera vez: abre el login (Claude Code)
codex                  # primera vez: abre el login (Codex)
gh auth login
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

---

## ¿Qué necesita cada bloque?

Casi todo se instala una sola vez y temprano. Por eso lo hacemos ahora.

| Bloque | Necesita |
|---|---|
| 01 · 02 | nada, solo mirar |
| 03 · qué es un agente | `claude` |
| 04 · git | `git` · `gh` |
| 05 · el harness | `claude` · `node` · `pnpm` |
| 06 · orquestar | `claude` · `git worktree` |
| 07 · herramientas | `node` · `pnpm` |
| 08 · negocio | nada |
