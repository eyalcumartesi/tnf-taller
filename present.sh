#!/usr/bin/env bash
# arranca el deck del taller y abre el navegador solo.
# uso: ./present.sh
set -e

PORT=7331
URL="http://localhost:${PORT}/taller/"
ROOT="$(cd "$(dirname "$0")" && pwd)/slides"

echo "→ sirviendo slides en ${URL}"

# abrir el navegador cuando el server ya responda (en segundo plano)
(
  until curl -s "http://localhost:${PORT}/" >/dev/null 2>&1; do sleep 0.2; done
  open "${URL}"
) &

# server en primer plano; Ctrl+C lo detiene
python3 -m http.server "${PORT}" --directory "${ROOT}"
