#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
NODE="$ROOT/runtime/node/linux-x64/bin/node"
if [ ! -x "$NODE" ]; then
  echo "FEHLER: Die portable Oluntir-Runtime fehlt oder ist nicht ausführbar." >&2
  echo "Erwartet: runtime/node/linux-x64/bin/node" >&2
  exit 1
fi
exec "$NODE" "$ROOT/analyzer/bin/portable-bootstrap.js"
