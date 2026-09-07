> **Language:** English · [Deutsch](README_de.md)

# Oluntir 2.2.1

Oluntir is a local, browser-based website editor built on GrapesJS 0.23.2. It manages multi-page Bootstrap projects, local assets, shared page regions, project-wide reusable content, and open exports without requiring a cloud account or proprietary server runtime.

**Status:** Release 2.2.1  
**Framework focus:** Bootstrap 4.6.2 and Bootstrap 5.3.8  
**Working model:** local and project-based

## Core features

- visual GrapesJS editing for HTML, Bootstrap, and project-bound components;
- multi-page projects with portable `.oluntir` project files;
- page management, local assets, favicon, images, and galleries;
- responsive image variants for desktop, tablet, and mobile;
- Shared Content for header, navigation, and footer;
- a central library for project-wide repeatable sections;
- central Repeat editing with controlled publishing to all occurrences;
- targeted insertion and removal of individual Repeat occurrences;
- Repeat undo/redo for publish and remove transactions;
- single- and dual-monitor workspaces;
- HTML, Apache SSI, and PHP include export;
- export to a local folder, ZIP, or TAR;
- optional local logging and diagnostics after explicit consent.

## Repeatable sections

Repeatable sections are managed as central **Repeat families**. A family has one central draft and can be materialized on any number of project pages.

The typical workflow is:

1. Create and name a Repeat source.
2. Insert additional occurrences on target pages from the Repeat library.
3. Edit the family through **Central editing** in the single-object Canvas.
4. Use **Apply to all occurrences** to publish the new version in one controlled operation.

Repeat occurrences on normal pages are protected from direct content editing. An orange toolbar opens central editing or removes only the selected occurrence. Header, navigation, and footer remain separate and are managed through Shared Content.

## Bootstrap support

Oluntir provides concrete editor profiles for:

- **Bootstrap 4.6.2**
- **Bootstrap 5.3.8**

Built-in blocks use native Bootstrap markup. Bootstrap-4-specific elements such as Jumbotron, Media Object, and Custom Forms are available only in the BS4 profile. Bootstrap 5 uses the current structures and helpers of its generation.

Both profiles include responsive HTML5 video blocks with multiple playback sources, poster support, and a download fallback.

## Template and source analysis

The local Oluntir API Analyzer can statically inspect Bootstrap templates and Source Packages. It analyzes HTML, CSS, and JavaScript evidence, determines Bootstrap generation and component structures, and can expose suitable detected structures as controlled editor blocks.

Unknown or unsupported frameworks may be analyzed but remain `analysis-only`. Imported source JavaScript is not executed automatically.

## Shared Content

Header, navigation, and footer are managed project-wide as Shared Content. Changes can be made on a project page and propagated to the remaining pages. During export, shared regions can be resolved directly or emitted as Apache SSI or PHP includes.

## Export

Oluntir produces deployable websites without a proprietary runtime. Supported outputs are:

- resolved HTML;
- Apache SSI;
- PHP includes;
- local folder export;
- ZIP archives;
- TAR archives.

Local framework, image, font, and project assets are collected according to the selected export mode. Editor-only Oluntir metadata is removed from final output.

## Start

1. Extract the archive.
2. Open `index.html` in a current Chromium-based desktop browser.
3. Choose the privacy and logging options.
4. Open an existing project or create a new one.
5. Select the Bootstrap profile and start editing.

The bundled portable Analyzer runtime can be started separately when local Source-Package analysis is required.

## Documentation

- [Features](FEATURES.md)
- [Handbook](HANDBOOK.md)
- [First start](docs/FIRST_START.md)
- [Why Oluntir?](docs/WHY_OLUNTIR.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Repeat Engine V2](docs/042_REPEAT_ENGINE_V2.md)
- [Shared Content](docs/SHARED-CONTENT-MANAGER.md)
- [Release notes](RELEASE_NOTES.md)
- [Changelog](CHANGELOG.md)
- [Documentation index](docs/index.md)

## Project boundaries

Oluntir 2.2.1 is product-focused on Bootstrap 4 and Bootstrap 5. Foreign frameworks are not silently treated as Bootstrap. The Analyzer may inspect additional sources, but active editor integration requires an explicitly supported profile.

## Licensing

See [LICENSING.md](LICENSING.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), and the files under `LICENSES/`.
