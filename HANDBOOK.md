# Oluntir 1.3.1 – Technical handbook

## 1. Runtime

Oluntir starts from `index.html`. GrapesJS remains unchanged under `vendor/grapesjs/`. Oluntir-specific integration is contained under `editor/integrations/grapesjs/`.

## 2. Project model

Pages and components are stored in the GrapesJS project model. `layout-identities.js` adds stable internal identities. These identities remain in project data and are removed before final export.

## 3. Semantic pipeline

- `semantic-dictionary.js`: known roles, capabilities and cardinality.
- `identity-resolver.js`: semantic resolution of component context.
- `context-resolver.js`: identity and ancestor context.
- `structure-resolver.js`: immutable structure snapshots.
- `relationship-resolver.js`: functional groups and members.
- `project-dependency-graph.js`: nodes, edges and dirty propagation.
- `semantic-action-engine.js`: isolated action orchestration.
- `semantic-validator.js`: semantic checks.

## 4. Shared content

`shared-content-manager.js` manages header, navigation and footer. Changes are stored centrally. Only the required target page is updated during page selection. Fingerprints skip unchanged writes, and component references are cached per page.

## 5. Repeat Foundation

`repeat-engine-v2.js` contains the technical model for repeatable structures. Complete visible repeat management is not part of 1.3.1.

## 6. Logging

`oluntir-logger.js` writes categorized JSONL files to a selected `logs` directory after opt-in. `oluntir-logging-consent.js` manages consent. `oluntir-runtime-actions.js` routes actual editor events through the Semantic Action Engine.

## 7. Diagnostics

`developer-diagnostics-center.js` displays runtime, action, queue, shared-content and log snapshots. Dependency-graph analysis runs only on explicit request.

## 8. Export

`export.js` creates HTML, SSI and PHP output, resolves shared regions for the selected target, collects local assets and removes editor-only metadata.

## 9. Tests

`tests/run-tests.sh` runs syntax, architecture, resolver, logging, action, shared-content, gallery and structure tests. Focused tests can also be executed directly with Node.

## 10. Architecture rules

- Extend existing modules; do not create a parallel architecture.
- Resolvers analyze and do not mutate documents.
- The Action Engine orchestrates and contains no feature business logic.
- The Dependency Graph describes dependencies and effects.
- Do not rebuild complete projects or pages for local changes.
- Logging remains local, optional and limited to the selected directory.
- Documentation states purpose and limits before API and implementation details.
