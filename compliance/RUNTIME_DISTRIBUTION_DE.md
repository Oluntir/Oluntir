# Portable Node-Runtime

Oluntir verwendet keine global installierte Node.js-Version. Jedes Releasepaket enthält genau eine zur Zielplattform passende Runtime. Die Startdateien brechen ab, wenn diese fehlt; ein PATH-Fallback ist untersagt.

## Releaseziele

- `win32-x64`
- `linux-x64`
- `darwin-x64`
- `darwin-arm64`

Die Runtime-Version und Upstream-Prüfsummen stehen in `analyzer/runtime/runtime-manifest.json`. Nach dem Entpacken wird zusätzlich `runtime/runtime-integrity.json` mit dem SHA-256 der tatsächlich ausgelieferten ausführbaren Datei erzeugt.
