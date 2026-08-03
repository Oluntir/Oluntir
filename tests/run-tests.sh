#!/usr/bin/env sh
set -eu
node --check editor/js/core/semantic-dictionary.js
node --check editor/js/core/identity-resolver.js
node --check editor/js/core/context-resolver.js
node --check editor/js/core/layout-identities.js
node --check editor/js/core/structure-resolver.js
node --check editor/js/core/semantic-validator.js
node --check editor/js/core/project-dependency-graph.js
node --check editor/js/core/project-state-store.js
node --check editor/js/core/oluntir-preview-api.js
node --check editor/js/core/template-structure-api.js
node --check editor/js/core/oluntir-logger.js
node --check editor/js/core/semantic-action-engine.js
node --check editor/js/core/repeat-engine-v2.js
node --check editor/js/core/repeat-contract-resolver.js
node --check editor/js/core/repeat-dependency-graph.js
node --check editor/js/core/targeted-synchronization-service.js
node --check editor/js/core/repeat-action-contracts.js
node --check editor/js/core/repeat-foundation-readiness.js
node --check editor/js/core/repeat-sync-access-adapter.js
node --check editor/js/core/editor.js
node --check editor/js/core/export.js
node tools/test-grapesjs-adapter.js
node tests/test-semantic-dictionary.js
node tests/test-identity-resolver.js
node tests/test-context-resolver.js
node tests/test-structure-resolver.js
node tests/test-template-first-semantics.js
node tests/test-relationship-resolver.js
node tests/test-project-dependency-graph.js
node tests/test-project-state-store.js
node tests/test-template-structure-api.js
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
node tests/test-repeat-action-contracts.js
node tests/test-1.3.1-repeat-foundation-readiness.js
node tests/test-bs4-gallery-controls.js
node tests/test-gallery-item-lifecycle.js
node tests/test-oluntir-document-api.js
node tests/test-bootstrap-row-insertion-slots.js
node tests/test-gallery-area-slots.js
node tests/test-inter-container-gallery-slots.js
node tests/test-visible-gallery-area-inserts.js
node tests/test-interactive-preview-navigation.js
node tests/test-page-identity-deletion-and-insertion-order.js
node tests/test-structure-insertion-target.js
node tests/test-structure-insertion-active-root.js
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

node tests/test-fix9-regression-recovery.js

node tests/test-structure-insertion-position-modes.js
node tests/test-dev011-gallery-main-area-insertion.js
node tests/test-dev011-fix1-main-origin-area-slots.js

node tests/test-dev011-fix2-unresolved-main-boundaries.js
node tests/test-dev011-fix3-sorted-area-rendering.js
node tests/test-dev011-fix4-area-preview-marker.js
node tests/test-dev011-fix5-full-width-area-preview-marker.js
node tests/test-dev011-fix6-visible-area-preview-and-no-empty-container.js

node tests/test-dev011-fix7-collapsed-boundaries-and-canvas-marker.js

node tests/test-dev011-fix8-area-slot-hover-resolution.js

node tests/test-dev011-fix9-preview-resolution-independent-of-insert.js

node tests/test-dev011-fix10-shared-area-slot-resolution.js
node tests/test-dev011-fix11-preview-regression.js

node tests/test-dev011-fix12-main-section-boundary-insertion.js

node tests/test-dev011-fix13-canvas-dom-productive-resolution.js

node tests/test-dev011-fix14-dom-element-component-bridge.js
node tests/test-dev011-fix15-runtime-area-insertion-resolution.js

node tests/test-dev011-fix16-stable-boundary-index.js


node tests/test-dev011-fix17-stable-owner-area-slot.js
node tests/test-dev012-image-undo-redo.js

node tests/test-dev012-fix2-image-redo-stack.js






node tests/test-1.3.1-presentation-translation.js

node tests/test-1.3.1-export-presentation-translation.js
node tests/test-1.3.1-export-presentation-readonly.js

node tests/test-1.3.1-presentation-attribute-atomicity.js

node tests/test-empty-project-gallery-insertion.js
node tests/test-empty-project-gallery-insertion.js
node tests/test-empty-project-gallery-context-regression.js
node tests/test-bs5-gallery-image-manager-regression.js
node tests/test-framework-gallery-editor-contract.js

node tests/test-framework-gallery-wizard.js
