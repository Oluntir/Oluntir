# Translation Matrix

## Purpose

The Translation Matrix translates canonical Oluntir semantics into framework-
and version-specific evidence and output descriptors. It is a data contract for
the future analyzer and compiler. It does not mutate the document, the DOM or
GrapesJS components.

## Implementation

`editor/js/core/translation-matrix.js` owns the schema, canonical terms,
descriptor validation, immutable profiles and read-only rule lookup.

## Contract

Every rule identifies:

- a stable `ruleId`;
- a canonical `semanticId`;
- a framework family, framework ID and version range;
- a direction (`detect`, `emit` or `bidirectional`);
- detection and output descriptors;
- capabilities, constraints and dependencies;
- priority, confidence, reversibility and loss information;
- provenance for analyzer and profile sources.

Rule IDs are not component IDs and are not `unitId` values. A translation rule
must never replace, generate or alter a document identity.

## Boundaries

- UI language translation remains the responsibility of `i18n.js`.
- CSS-property normalization remains the responsibility of
  `presentation-vocabulary.js`.
- Template-first role resolution remains the responsibility of
  `template-semantics.js`.
- Framework-specific rules are supplied as read-only data profiles. DEV_017
  provides the initial profiles for Bootstrap 4.6.2 and Bootstrap 5.3.8.
- Mutation remains explicitly disabled (`mutationEnabled: false`).

## Integration order

The matrix is intentionally introduced before concrete Bootstrap rules:

1. DEV_016: schema and canonical vocabulary;
2. DEV_017: Bootstrap 4 and 5 profile data;
3. DEV_018: analyzer evidence and capability manifests;
4. DEV_019: read-only translation resolver and compile plan;
5. DEV_020: conflict, fallback and diagnostics validation.

Changes to the contract require matching tests and documentation.
