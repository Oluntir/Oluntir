# Logging

## Purpose

Buffers, redacts, rotates and writes local JSONL diagnostics after explicit opt-in.

## Responsibility

Implementation: `editor/js/core/oluntir-logger.js`. The module owns only the responsibility described above.

## Integration

The module is loaded from `index.html` and is tested by the matching files under `tests/`. Consumers must use its public API instead of copying its internal analysis logic.

## Limits

- No undocumented GrapesJS DOM dependency.
- No parallel project model.
- No claim beyond the implemented API.
- Changes to contracts require matching tests and documentation.
