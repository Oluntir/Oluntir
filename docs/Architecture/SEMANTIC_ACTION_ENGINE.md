# Semantic Action Engine

## Purpose

Provides action definitions, handlers, phases, middleware, queues, batches, transactions, errors and metrics.

## Responsibility

Implementation: `editor/js/core/semantic-action-engine.js`. The module owns only the responsibility described above.

## Integration

The module is loaded from `index.html` and is tested by the matching files under `tests/`. Consumers must use its public API instead of copying its internal analysis logic.

## Limits

- No undocumented GrapesJS DOM dependency.
- No parallel project model.
- No claim beyond the implemented API.
- Changes to contracts require matching tests and documentation.
