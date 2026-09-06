> **Language:** English · [Deutsch](README_de.md)

# Oluntir 2.0.1-alpha

Oluntir is a local browser-based website editor built on GrapesJS 0.23.2. It manages multi-page projects, local assets, shared page regions and exports without a server-side application runtime.

**Branch:** `Oluntir-2.0.1-alpha`
**Baseline:** Oluntir 1.3.1
**Date:** September 4, 2026
**Status:** Alpha / Bootstrap-focused

Oluntir 1.3.1 remains the stable compatibility baseline. This branch is an
experimental continuation and is not a replacement for the stable release.

## 2.0 Alpha – Development status

The 2.0 Alpha branch develops the Oluntir API translation matrix and the
source-analysis pipeline. DEV_016 through DEV_021 provide canonical vocabulary,
Bootstrap profiles, a read-only analyzer, resolver, validation and abstract
materialization plans. DEV_022 adds a universal local Source-Package importer
and Frontend Bridge for framework and template sources.
DEV_023 adds a source-backed component catalog: recognized HTML structures can
be inserted as selectable GrapesJS blocks. Local assets are resolved through
the local API.
DEV_024 adds the JavaScript behavior and runtime contract with static evidence
and explicit script selection.
DEV_025 adds a framework-neutral behavior matrix and immutable behavior plan.
This does not enable execution.
DEV_026 adds separate Bootstrap 4 and Bootstrap 5 profiles plus a read-only
behavior resolver for triggers, adapters and dependencies. Each Source Package
receives a `javascript-behavior-resolution.json`; resolved entries are still
not executed.
DEV_027 adds source-bound framework profiles. Each analysis creates a profile
from its own Bootstrap source, binds it to the source hash and never reuses it
for other packages. New versions receive a new analysis and profile identity.

Resource activation and deliberate user insertion for a selected Source Package
are available. Imported JavaScript files remain disabled. Explicitly defined
repeatable regions are productively and transactionally synchronized in
2.0.1-alpha.

DEV028 connects source-bound profiles to the persistent GrapesJS editor through
a controlled adapter. Source components can be inserted by the user; Repeat
synchronization is enabled for explicitly defined instances and protected by
the resolver, dependency graph, action contracts and targeted synchronization
service. Source JavaScript is still not executed automatically.

### Repeat synchronization in 2.0.1-alpha

A repeat definition separates source, instance and component identity through
stable Oluntir IDs. Source changes propagate only to linked instances. The
targeted service is transactional: after plan and write validation it updates
the targets, and on failure rolls back targets already changed. Export then
reads the consistent project model. Navigation, header and footer remain
separate Shared Content concerns.

The independent `2.0.1-alpha` branch consolidates the productive framework
context on Bootstrap 4 and Bootstrap 5. Generic import, analysis and recovery
foundations remain available; concrete foreign-framework profiles and fixtures
are not part of this branch. Bootstrap 5 is primary and Bootstrap 4 is retained
as the legacy profile. Unknown packages can be analyzed, but are classified as
`analysis-only` and are not silently mapped to Bootstrap.

## Supported profiles and exports

- Bootstrap 4.6.2
- Bootstrap 5.3.8
- HTML, Apache SSI and PHP include export
- folder, ZIP and TAR output

## Main capabilities

- visual editing with GrapesJS;
- multi-page projects and portable `.oluntir` project files;
- shared header, navigation and footer content;
- targeted and persistent quick editing of shared content;
- gallery and layout insertion inside containers and between page areas;
- responsive desktop, tablet and mobile image variants;
- undo and redo for text and image changes;
- project favicon, lightbox and download links;
- single- and dual-monitor workspace;
- stable internal layout identities;
- productive Repeat synchronization for explicitly defined areas through stable
  page, component and target-position identities;
- optional local logging after explicit consent.

## Start

1. Extract the archive.
2. Open `index.html` in a current Chromium-based desktop browser.
3. Accept the licensing, privacy and security documents.
4. Open or create a project.

## Known limitation

An explicitly selected footer text color may look different in the editor from the exported result. The export preserves the explicitly selected value.

## Documentation

- [Documentation index](docs/index.md)
- [Technical handbook](HANDBOOK.md)
- [Features](FEATURES.md)
- [Release notes](RELEASE_NOTES.md)
- [Technical changes from 1.3.1](docs/CHANGELOG_1.3.1_TO_2.0.1_ALPHA.md)
- [2.0.1-alpha cleanup list](docs/REMOVAL_LIST_2.0.1_ALPHA.md)
- [Security](SECURITY.md)
- [Privacy](PRIVACY.md)
- [Release audit](audit/OLUNTIR_1.3.1_AUDIT.md)

## License

Oluntir-owned source code is licensed under MIT. Third-party components and the
portable Node.js runtime retain their own licenses. See [LICENSING.md](LICENSING.md),
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), `LICENSES/` and `compliance/`.
