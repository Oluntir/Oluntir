# Project Dependency Graph

## Purpose

Builds explicit nodes and edges and propagates dirty state. It is built only when requested.

## Responsibility

Implementation: `editor/js/core/project-dependency-graph.js`. The module owns only the responsibility described above.

## Integration

The module is loaded from `index.html` and is tested by the matching files under `tests/`. Consumers must use its public API instead of copying its internal analysis logic.

## Limits

- No undocumented GrapesJS DOM dependency.
- No parallel project model.
- No claim beyond the implemented API.
- Changes to contracts require matching tests and documentation.
