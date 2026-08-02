#!/usr/bin/env sh
set -eu
node --check editor/js/core/semantic-dictionary.js
node --check editor/js/core/identity-resolver.js
node --check editor/js/core/context-resolver.js
node --check editor/js/core/layout-identities.js
node --check editor/js/core/structure-resolver.js
node --check editor/js/core/semantic-validator.js
node --check editor/js/core/project-dependency-graph.js
node --check editor/js/core/oluntir-logger.js
node --check editor/js/core/semantic-action-engine.js
node --check editor/js/core/repeat-engine-v2.js
node --check editor/js/core/repeat-contract-resolver.js
node --check editor/js/core/repeat-dependency-graph.js
node --check editor/js/core/targeted-synchronization-service.js
node --check editor/js/core/repeat-action-contracts.js
node --check editor/js/core/repeat-sync-access-adapter.js
node --check editor/js/core/repeat-synchronization-runtime.js
node --check editor/js/core/repeat-auto-synchronization.js
node --check editor/js/core/editor.js
node --check editor/js/core/export.js
node tools/test-grapesjs-adapter.js
node tests/test-semantic-dictionary.js
node tests/test-identity-resolver.js
node tests/test-context-resolver.js
node tests/test-structure-resolver.js
node tests/test-relationship-resolver.js
node tests/test-project-dependency-graph.js
node tests/test-oluntir-logger.js
node tests/test-oluntir-logger-files.js
node tests/test-oluntir-logging-consent.js
node tests/test-foundation-consent-contract.js
node tests/test-foundation-consent-version.js
node tests/test-foundation-consent-installation.js
node tests/test-runtime-actions.js
node tests/test-semantic-action-engine.js
node tests/test-repeat-engine-v2-contracts.js
node tests/test-repeat-contract-resolver.js
node tests/test-repeat-dependency-graph.js
node tests/test-targeted-synchronization-service.js
node tests/test-repeat-sync-access-adapter.js
node tests/test-repeat-sync-identity-mapping.js
node tests/test-repeat-structural-rollback.js
node tests/test-repeat-synchronization-runtime.js
node tests/test-repeat-auto-synchronization.js
node tests/test-repeat-action-contracts.js
node tests/test-developer-diagnostics-center.js
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

node tests/test-asset-readiness-contract.js
node tests/test-export-readiness-asset-commit.js
node tests/test-export-readiness-atomic-contract.js
node tests/test-export-readiness-commit-token.js
node tests/test-export-snapshot-transaction.js
node tests/test-export-snapshot-consumer.js
node tests/test-export-readiness.js
