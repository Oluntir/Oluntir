#!/usr/bin/env sh
set -eu
node --check editor/js/core/layout-identities.js
node --check editor/js/core/repeat-engine-v2.js
node --check editor/js/core/editor.js
node --check editor/js/core/export.js
node tools/test-grapesjs-adapter.js
node tests/test-layout-identities.js
python3 tools/validate-structure.py
