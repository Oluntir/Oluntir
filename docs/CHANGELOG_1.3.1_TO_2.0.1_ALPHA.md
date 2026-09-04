# Technical changes from Oluntir 1.3.1 to 2.0.1-alpha

**Baseline:** 1.3.1 commit `1b8c199`  
**Current branch:** `Oluntir-2.0.1-alpha`  
**Current commit:** `e6c4e5b`  
**Scope:** Bootstrap 4.6.2 and Bootstrap 5.3.8

This document describes implemented changes. Historical DEV reports remain
available as development records; they are not a substitute for this current
technical overview.

## 1. Runtime and distribution

- Added a portable Windows x64 Node.js 24.18.0 runtime at
  `runtime/node/win32-x64/node.exe`.
- Added runtime integrity metadata and a runtime manifest.
- Added Windows CMD launchers, a development launcher and a Unix shell
  launcher for the local Analyzer API.
- Added the Windows portable-package builder and its runtime checks.
- Added the Node.js upstream license to `LICENSES/runtime/`.
- The local Analyzer API is designed for offline, loopback-only operation.

## 2. Universal Source-Package pipeline

- Added the Source Package contract and isolated package storage.
- Added import paths for local folders, ZIP, TAR, TAR.GZ/TGZ, browser file
  selections and URLs routed through the local API.
- Each imported package receives its own source directory, package identity,
  inventory and SHA-256 information.
- Added `source-recovery.json` generation and restoration with embedded file
  content for recovery after source loss or damage.
- Added package manifests, source hashes, file serving and package listing.
- Added defensive archive-path handling and package size limits.
- Added analysis results such as capability manifests, source profiles,
  behavior manifests, behavior plans and component catalogs.

## 3. Analyzer and compiler architecture

- Added the source-inventory contract and schema.
- Added static HTML analysis for documents, elements, attributes, positions,
  assets and references.
- Added static CSS analysis for selectors, declarations, at-rules, custom
  properties, media/container queries, fonts and keyframes.
- Added static JavaScript analysis for selectors, events, state changes,
  observers, timers, network requests and mutation patterns.
- Added capability evidence, evidence storage, framework evidence and a
  framework support policy.
- Added the OIR project model and a declarative knowledge compiler.
- Added versioned contracts and schemas for all major analyzer outputs.
- Analysis remains read-only and does not execute imported source code.

## 4. Source-bound framework profiles

- Added source-profile generation from the analyzed package itself.
- A profile is bound to the package identity and source hash.
- A later framework version receives a new analysis and profile identity.
- Profiles are not placed into a global reusable foreign-framework registry.
- Unknown or ambiguous capabilities remain explicit diagnostics instead of
  being silently mapped to Bootstrap.

## 5. Translation matrix

- Added the canonical translation-matrix contract and vocabulary.
- Added Bootstrap 4 and Bootstrap 5 matrix profiles.
- Added read-only translation analysis, resolution, validation and an abstract
  materialization plan.
- Added explicit handling for confidence, ambiguity, dependencies, lossiness,
  reversibility and unsupported capabilities.
- Materialization produces abstract operations only. It does not mutate a
  GrapesJS document.

## 6. JavaScript behavior pipeline

- Added a versioned JavaScript behavior contract and behavior manifest.
- Added framework-neutral behavior semantics for accordion, modal, tabs,
  dropdown, carousel, offcanvas and related runtime evidence.
- Added a behavior matrix and immutable behavior plan.
- Added a read-only behavior resolver for triggers, adapters and dependencies.
- Bootstrap 4 `data-toggle` and Bootstrap 5 `data-bs-toggle` are resolved
  separately.
- Imported scripts are not executed automatically.

## 7. GrapesJS and frontend integration

- Added a controlled Source-Package Bridge for the existing framework
  selection.
- Added a GrapesJS adapter that turns recognized source structures into
  user-selectable blocks without creating a parallel component architecture.
- Local package assets are served through the local API.
- The editor waits for source-profile discovery before final framework
  initialization.
- Built-in Bootstrap blocks and variants are registered only for built-in
  Bootstrap profiles.
- Imported source blocks are connected only when the support policy permits
  editor use.
- `unitId` and existing project identity structures remain untouched.

## 8. Bootstrap consolidation

- The productive framework context is limited to Bootstrap 4.6.2 and
  Bootstrap 5.3.8.
- Bootstrap 5 is the current primary profile; Bootstrap 4 remains the legacy
  profile.
- Generic import, evidence, OIR, compiler, translation and behavior
  infrastructure remains available.
- Non-Bootstrap packages may be analyzed, but are classified as
  `analysis-only` and are not activated as editor profiles.
- No silent Bootstrap fallback is used for unknown sources.
- Earlier Tailwind and Foundation6 product sources, profiles, fixtures and
  license records are not part of the consolidated branch.

## 9. Editor, gallery and export changes

- Added framework-owned gallery behavior; the separate Oluntir gallery
  component path is no longer the source of gallery structures.
- Stabilized gallery insertion in empty projects, blank pages, existing
  containers and between complete page areas.
- Added framework-specific gallery asset handling for Bootstrap 4 and 5.
- Added click-to-enlarge image behavior with a local lightbox and export
  assets.
- Improved preview exit behavior, ESC handling and preview status feedback.
- Improved export availability for incomplete reusable regions.
- Preserved HTML, Apache SSI and PHP include export paths, local assets,
  responsive image variants and removal of editor-only metadata.
- Added or strengthened export, asset, gallery, block-search and framework
  switch regression coverage.

## 10. Repeat Foundation and safety gates

- Extended Repeat Foundation readiness with explicit checks for the resolver,
  dependency graph, action contracts and targeted synchronization service.
- The following states remain enforced:

  ```text
  productiveSynchronizationEnabled = false
  automaticSynchronizationEnabled = false
  executionEnabled = false
  mutationPerformed = false
  ```

- Repeatable-element architecture is retained, but productive synchronization
  is not enabled by this branch.

## 11. Tests and compliance

- Added tests for analyzer contracts, source packages, recovery, profiles,
  behavior resolution, GrapesJS bridging, Bootstrap support, export, gallery,
  runtime selection and framework switching.
- Added structure validation for Bootstrap 4/5 assets and local references.
- Updated third-party notices, source attribution, license matrices and
  portable-runtime documentation.
- The current branch contains only the concrete Bootstrap framework assets.

## Compatibility boundary

Existing 1.3.1 project and export structures remain the compatibility baseline.
New analyzer and source-package metadata is additive. Productive repeat
synchronization, imported-source JavaScript execution and automatic document
mutation remain outside the enabled compatibility surface.
