# 2.0.1-alpha cleanup and removal list

This is a controlled cleanup list. It distinguishes files that should not be
distributed from historical or architectural files that must remain available.
It is not an instruction to delete files blindly.

## Remove from a release ZIP, but keep in the Git working tree

| Item | Reason |
|---|---|
| `.git/` | Repository metadata is not part of the application runtime and can add tens of megabytes. |
| `.github/` | Keep in GitHub, but omit from an end-user runtime package unless source distribution is explicitly intended. |

## Obsolete documentation candidates

These may be archived outside the release package after the current documents
are available:

- `audit/OLUNTIR_1.3.0_AUDIT.md`
- `tests/MANUAL_TEST_1.2.1_de.md`
- old, superseded DEV reports that only describe an intermediate failed or
  discarded implementation

`audit/OLUNTIR_1.3.1_AUDIT.md` should normally remain as the historical stable
baseline. It should not be rewritten as an alpha audit.

## Remove if found in the working tree

The following names and paths are outside the Bootstrap-only product scope:

- `frameworks/tailwind*/`
- `frameworks/foundation*/`
- `frameworks/foundation-sites*/`
- `examples/test-source/tailwind*/`
- `examples/test-source/foundation-6*/`
- `examples/test-source/foundation-sites-6.9.0-official/`
- `Oluntir-Tailwind-*.zip`
- `Oluntir-Foundation-*.zip`
- `Oluntir-Foundation-Sites-*.zip`
- framework-specific Tailwind/Foundation6 license records that are no longer
  referenced by `compliance/` or `THIRD_PARTY_NOTICES*`

The current complete folder was checked: no concrete Tailwind or Foundation6
framework directory remains.

## Do not remove these similarly named items

The word `Foundation` does not automatically mean Foundation6. Keep:

- `DEV_010_RUNTIME_FOUNDATION_DE.md` — portable runtime history;
- `docs/REPEAT_FOUNDATION.md` and `docs/REPEAT_FOUNDATION_de.md` — repeatable
  element architecture;
- `editor/js/core/repeat-foundation-readiness.js` — repeat contract gate;
- `tests/test-foundation-consent-*.js` — Repeat Foundation consent contracts;
- `analyzer/tests/test-analyzer-foundation.js` — analyzer/compiler foundation
  test.

## Do not remove the generic 2.0 architecture

The following are required for the current Bootstrap implementation and future
version-specific analysis:

- `analyzer/` contracts, static analyzers, evidence store, OIR and compiler;
- `editor/js/core/source-package-bridge.js`;
- `editor/js/core/source-package-grapesjs-adapter.js`;
- translation matrix, analyzer, resolver, validation and materialization-plan
  modules;
- JavaScript behavior, matrix and resolver modules;
- `runtime/` and the local API launchers;
- Bootstrap 4/5 framework directories;
- Repeat Foundation contracts, while their productive execution gate remains
  disabled.

## Verification after cleanup

Run the following checks before committing the cleanup:

```sh
git status --short
git ls-files | grep -Ei 'tailwind|foundation-sites|foundation-6|frameworks/foundation'
python3 tools/validate-structure.py
bash tests/run-tests.sh
```

The framework-path command should produce no concrete foreign-framework path.
The structure and full test commands must finish successfully.
