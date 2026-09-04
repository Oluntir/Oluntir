#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ARCH=$(uname -m)
case "$ARCH" in
  arm64) TARGET=darwin-arm64 ;;
  x86_64) TARGET=darwin-x64 ;;
  *) echo "FEHLER: Nicht unterstützte macOS-Architektur: $ARCH" >&2; exit 1 ;;
esac
NODE="$ROOT/runtime/node/$TARGET/bin/node"
if [ ! -x "$NODE" ]; then
  echo "FEHLER: Die portable Oluntir-Runtime fehlt oder ist nicht ausführbar." >&2
  echo "Erwartet: runtime/node/$TARGET/bin/node" >&2
  exit 1
fi
exec "$NODE" "$ROOT/analyzer/bin/portable-bootstrap.js"
