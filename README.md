> **Language:** English · [Deutsch](README_de.md)

# Oluntir 2.2.1

Oluntir is a local browser-based website editor built on GrapesJS 0.23.2. It manages multi-page projects, local assets, shared page regions and exports without a server-side application runtime.

**Branch:** `Oluntir-2.2.1`
**Baseline:** Oluntir 1.3.1
**Date:** September 7, 2026
**Status:** Release / Bootstrap-focused

Oluntir 1.3.1 remains the stable compatibility baseline. 2.2.1 continues
the Bootstrap-focused 2.x release line with a central Repeat library.

## 2.2.1 – current state

- Repeat targets now work at genuine page-level content boundaries outside `<main>` (for example a standalone Hero directly before the footer); shared header/nav/footer remain protected. ZIP/TAR export icons are explicitly badged.
- Bootstrap usage coverage is extended: the BS4 profile now includes Jumbotron, Media object and Custom forms as native Bootstrap 4 markup; BS5 remains limited to components actually present in 5.3.8.
- Native HTML5 video blocks are available for BS4 and BS5: BS4 uses `embed-responsive`, BS5 uses the `ratio` helper. Both include WebM, MP4 and Ogg sources, a poster, `controls`, `preload="metadata"`, `playsinline`, and a visible download fallback. The three source paths can be edited independently in the video properties.
- The Oluntir API Analyzer now weights Bootstrap version, Data API and generation-specific class evidence and recognizes more Bootstrap components as source-backed structures.
- The Repeat library is split into two compact workflows: **selection editing** for central changes and **library insertion** for materializing a family on project pages. Both use slim scroll lists; sorting is available through **Newest** and **A–Z**, with an expandable full-list mode.
- The central editor uses compact icon actions for Repeat undo, Repeat redo, and discarding the draft. Page insertion remains exclusively in the lower insertion workflow.
- After global GrapesJS undo/redo, Oluntir re-synchronizes the active right-side tool view so **Open Blocks** remains reliably accessible.

- If an imported/continued project is missing central repeat metadata, Oluntir reconstructs repeat families only from stable repeat markers on materialized page instances; nav/header/footer are excluded.

- Header, navigation and footer remain bidirectional Shared Content.
- Repeatable areas are managed as **central Repeat families**; all page occurrences are materialized instances.
- Direct content editing on normal page instances is locked. The orange hover toolbar opens central editing or removes exactly that occurrence.
- The central Repeat library lists names, used pages, occurrence counts and revisions.
- A Repeat is edited in an internal single-object Canvas. Changes remain a draft until **“Apply to all occurrences”** is triggered.
- This central single-object Canvas remains fully editable; edit locks apply only to materialized Repeat instances on normal project pages.
- Publish and remove operations are Oluntir transactions with Repeat Undo/Redo.
- During controlled Repeat publish/undo/redo/insert/remove transactions, internally generated GrapesJS add/remove events are isolated from the Shared Content structural safety watcher; normal navigation/footer structural changes remain fully observed.
- The insert workflow remains: library source → target page → insertion mode → Canvas target → insert.
- Existing projects migrate through stable Oluntir correlations into the central Published/Draft model.
- Leaving the central Repeat canvas uses a safe PageManager handoff: select the destination project page first, then remove the temporary workspace.
- Technical error notifications stay visible for 12 seconds; normal notices for 5 seconds.

## Historical development foundation from 2.0 Alpha

The preceding 2.0 Alpha branch developed the Oluntir API translation matrix and the
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
are available. Imported JavaScript files remain disabled. Explicitly defined repeatable regions are centrally managed in 2.2.1.
Page occurrences remain unchanged while editing and are updated only by an
explicit publish transaction.

DEV028 connects source-bound profiles to the persistent GrapesJS editor through
a controlled adapter. Source components can be inserted by the user. The Repeat
contract foundation built in Alpha—resolver, dependency graph, action contracts
and targeted synchronization service—remains in place; 2.2.1 uses it for
controlled publish transactions instead of synchronizing every edit. Source
JavaScript is still not executed automatically.

### Repeat library in 2.2.1

A Repeat family owns one central Published/Draft content state. All occurrences
on project pages are materialized instances and are locked against direct
content editing there. The central library shows names, page usage, occurrence
counts and revisions. **Edit** opens an internal single-object Canvas. Changes
remain local until **“Apply to all occurrences”** publishes the family in one
controlled Oluntir transaction.

On normal pages an orange top-centered hover toolbar provides **Edit** to open
the central source and **Remove** to delete just that occurrence while updating
the usage list. Publish and remove operations have a dedicated Repeat Undo/Redo
history. Navigation, header and footer remain separate Shared Content concerns.

The independent `2.2.1` branch consolidates the productive framework
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

### Repeatable areas

**Create/edit:** select source area → set source name → save source → choose target page → choose insertion mode → confirm Canvas target → insert.

**Insert from list:** select a named stored source → choose target page → choose insertion mode → confirm Canvas target → insert. Internal Repeat IDs remain technical correlation keys and are not exposed as user-facing names.


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
- central Repeat library with materialized page instances and explicit publish transactions;
- project-wide page usage, revisions and Repeat Undo/Redo for publish/remove operations;
- separate central editing and list/insert workflows;
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
- [Historical technical changes through 2.1.0 BETA](docs/CHANGELOG_1.3.1_TO_2.1.0_BETA.md)
- [Historical 2.1.0 BETA cleanup list](docs/REMOVAL_LIST_2.1.0_BETA.md)
- [Security](SECURITY.md)
- [Privacy](PRIVACY.md)
- [Historical 2.1.0 BETA release audit](audit/OLUNTIR_2.1.0_BETA_AUDIT.md)

## License

Oluntir-owned source code is licensed under MIT. Third-party components and the
portable Node.js runtime retain their own licenses. See [LICENSING.md](LICENSING.md),
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), `LICENSES/` and `compliance/`.
