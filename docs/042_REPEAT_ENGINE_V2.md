# Repeat Engine V2 – Oluntir 2.1.0 BETA

`editor/js/core/repeat-engine-v2.js` stores Repeat definitions through stable Oluntir identities. DOM positions, CSS selectors and changing `unitId` are not identity mechanisms.

## Synchronization

Supported directions are:

- source → instances;
- instance → source;
- instance → linked sibling instances.

The resolver, dependency graph, action contracts and shared targeted synchronization service validate every productive plan. Changes are read from the GrapesJS project model and written idempotently.

## User workflows

### Repeatable areas

Select source area → set source name → save source → choose target page → choose insertion mode → confirm target in Canvas → insert. This window shows only the current source, not the project-wide list.

### Insert repeatable areas from list

Select a stored source by name → choose target page → choose insertion mode → confirm target in Canvas → insert. Internal definition and Repeat IDs remain technical correlation keys and are not user-facing names.

## Existing projects

Older Alpha projects are hydrated on load only when existing Oluntir correlation markers resolve source or instance unambiguously. Ambiguous bindings are never guessed.
