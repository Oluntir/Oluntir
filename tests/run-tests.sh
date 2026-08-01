#!/usr/bin/env sh
set -eu
node --check editor/js/core/semantic-dictionary.js
node --check editor/js/core/identity-resolver.js
node --check editor/js/core/context-resolver.js
node --check editor/js/core/layout-identities.js
node --check editor/js/core/structure-resolver.js
node --check editor/js/core/semantic-validator.js
node --check editor/js/core/project-dependency-graph.js
node --check editor/js/core/repeat-engine-v2.js
node --check editor/js/core/editor.js
node --check editor/js/core/export.js
node tools/test-grapesjs-adapter.js
node tests/test-semantic-dictionary.js
node tests/test-identity-resolver.js
node tests/test-context-resolver.js
node tests/test-structure-resolver.js
node tests/test-relationship-resolver.js
node tests/test-project-dependency-graph.js
node tests/test-bs4-gallery-controls.js
node tests/test-gallery-overlay-modern.js
node tests/test-gallery-overlay-icons.js
node tests/test-gallery-download-icon.js
node tests/test-layout-identities.js
node tests/test-semantic-validator.js
node tests/test-new-page-placeholder.js
node tests/test-page-switch-frame-integrity.js
node tests/test-shared-content-page-transaction.js
node tests/test-shared-content-canvas-commit.js
node tests/test-shared-content-targeted-regions.js
node tests/test-shared-content-lazy-scaling.js
python3 tools/validate-structure.py
node tests/test-gallery-icons-idle-visible.js
node tests/test-gallery-icon-assets.js

node tests/test-gallery-svg-icons.js
node tests/test-gallery-toolbar-css-icons.js

node tests/test-gallery-framework-icon-sources.js
