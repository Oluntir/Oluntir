> **Language:** English (reference) · [Deutsch](DOCUMENTATION-STYLE_de.md)

# Documentation Guidelines

**Version:** 2.2.1
**Language:** English
**Status:** Release
**Stable baseline:** Oluntir 1.3.1
**Last updated:** 2026-09-07

## Purpose

English files are the reference. German translations use the `_de.md` suffix. Documentation describes implemented behavior, prerequisites, architecture, limitations, tests, and version scope. Marketing claims, ideology, and unimplemented promises are excluded.

## Scope

This document describes the behavior included in Oluntir 2.2.1.

## Verification

Test the function with a newly created project and a restored project. Where export is affected, test folder and archive output and compare the generated file structure with the selected format.

## Limitations

Browser capabilities and imported project content may affect behavior. Report reproducible deviations with the browser version, project type, steps, and console output.
## Audience separation

- `README`, `FEATURES`, `HANDBOOK`, and `WHY_OLUNTIR` describe stable product capabilities, workflows, scope, and user-relevant limitations. They do not list individual bug fixes, icon tweaks, cache changes, regression details, or internal event names.
- `RELEASE_NOTES` summarizes release-level changes and major compatibility information.
- `CHANGELOG`, DEV reports, audits, architecture documents, and test documents may contain implementation details, regression fixes, internal identifiers, and development history.
- Historical documents are not rewritten to look current; they remain explicitly historical.

