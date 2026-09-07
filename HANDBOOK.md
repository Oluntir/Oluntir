# Oluntir 2.2.1 – Technical handbook

This handbook describes the current Bootstrap-focused release line. Oluntir
1.3.1 remains the stable compatibility baseline.

## 1. Runtime

Oluntir starts from `index.html`. GrapesJS remains unchanged under
`vendor/grapesjs/`. Oluntir-specific integration is contained under
`editor/integrations/grapesjs/`. The optional local Analyzer API uses the
portable runtime under `runtime/node/` and never requires a global PATH runtime.

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
- Source analysis adds static HTML/CSS/JavaScript evidence, source profiles,
  capability manifests and a read-only knowledge compiler under `analyzer/`.
- Translation and behavior modules create immutable plans and resolutions;
  they do not execute imported code or mutate documents.

## 3a. Bootstrap support boundary

`frameworks/bootstrap4/` and `frameworks/bootstrap5/` are the only concrete
framework distributions. Bootstrap 5 is primary and Bootstrap 4 is legacy.
Unknown source packages can remain in the generic analysis pipeline, but the
support policy classifies them as `analysis-only`.

## 3b. Source Packages and Frontend Bridge

The local API imports folders, archives, browser files and URLs into isolated
package directories. Each package receives a manifest, inventory, source hash,
recovery JSON and analysis outputs. The GrapesJS adapter exposes recognized
structures as user-selectable blocks. Source JavaScript is not executed.

## 4. Shared content

`shared-content-manager.js` manages header, navigation and footer. The GrapesJS project model is authoritative and component objects are resolved fresh for writes rather than cached long-term. Fingerprints and a `centralChanged` fast exit skip redundant target mutations and stores.

## 5. Repeat library and publish transactions

`repeat-engine-v2.js` remains the persistent data model for Repeat families and
stable Oluntir identities. `repeat-library-manager.js` adds the central
Published/Draft source, page usage, revisions and Repeat history. All normal page
occurrences are materialized instances and are locked against direct content
editing.

**Edit** opens an internal GrapesJS single-object workspace. Changes are applied
only to the draft; there is no project-wide Repeat distribution while typing.
**“Apply to all occurrences”** writes the draft to all active instances in a
controlled transaction and updates their revision/fingerprint. The workspace is
removed from GrapesJS page data before persistence and export.

The orange hover toolbar on a page instance opens central editing or removes only
that occurrence. Remove and publish are Oluntir transactions recorded in a bounded
Repeat Undo/Redo history. The list workflow materializes additional instances via
source → target page → insertion mode → confirmed Canvas target. Resolver,
dependency-graph, action-contract and targeted-synchronization contracts remain
the technical safety layer; per-keystroke live synchronization is disabled in the
product path.

## 6. Logging

`oluntir-logger.js` writes categorized JSONL files to a selected `logs` directory after opt-in. `oluntir-logging-consent.js` manages consent. `oluntir-runtime-actions.js` routes actual editor events through the Semantic Action Engine.

## 7. Diagnostics

`developer-diagnostics-center.js` displays runtime, action, queue, shared-content and log snapshots. Dependency-graph analysis runs only on explicit request.

## 8. Export

`export.js` creates HTML, SSI and PHP output, resolves shared regions for the selected target, collects local assets and removes editor-only metadata.

## 9. Tests

`tests/run-tests.sh` runs syntax, architecture, resolver, logging, action, shared-content, gallery and structure tests. Focused tests can also be executed directly with Node.

Analyzer tests cover source inventory, static analyzers, profiles, behavior
resolution, package recovery, the GrapesJS bridge, Bootstrap support and the
portable runtime.

## 10. Architecture rules

- Extend existing modules; do not create a parallel architecture.
- Resolvers analyze and do not mutate documents.
- The Action Engine orchestrates and contains no feature business logic.
- The Dependency Graph describes dependencies and effects.
- Do not rebuild complete projects or pages for local changes.
- Logging remains local, optional and limited to the selected directory.
- Documentation states purpose and limits before API and implementation details.
