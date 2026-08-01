# Oluntir 1.3.0 DEV_029 – Structure Resolver

## Scope

DEV_029 adds a read-only Structure Resolver to the existing semantic core architecture.

## Added

- `editor/js/core/structure-resolver.js`
- `tests/test-structure-resolver.js`
- `docs/049_STRUCTURE_RESOLVER.md`
- `docs/049_STRUCTURE_RESOLVER_de.md`

## Changed

- Resolver script loading in `index.html`
- Structure Resolver test integration in `tests/run-tests.sh`
- Architecture, handbook, README, changelog and documentation indexes

## Contracts

- `OluntirStructureResolver.resolvePage(page)`
- `OluntirStructureResolver.resolveProject(editor)`
- Schema version: `1`
- Read-only immutable snapshots
- No framework, editor, export or automatic correction logic

## Explicitly unchanged

- Gallery and icon implementation
- Bootstrap framework profiles
- Repeat Engine behavior
- Shared Content behavior
- Export behavior
- Semantic Validator behavior
- User interface

## Verification

Automated Structure Resolver and semantic core tests pass. The resolver test verifies that resolving a structure does not modify the component tree. Local user verification confirmed normal application use and successful export.

## Known unrelated test state

The complete legacy test runner still reports the pre-existing BS4 gallery visibility assertion. DEV_029 does not modify that completed gallery/icon area.
