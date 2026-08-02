> **Language:** English · [Deutsch](README_de.md)

# Oluntir 1.3.1

Oluntir is a local browser-based website editor built on GrapesJS 0.23.2. It manages multi-page projects, local assets, shared page regions and exports without a server-side application runtime.

**Release:** 1.3.1  
**Date:** August 2, 2026  
**Status:** Stable

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
- an inactive Repeat Foundation with no visible or productive synchronization;
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
- [Security](SECURITY.md)
- [Privacy](PRIVACY.md)
- [Release audit](audit/OLUNTIR_1.3.1_AUDIT.md)

## License

Oluntir-owned source code is licensed under MIT. Third-party components retain their own licenses. See [LICENSING.md](LICENSING.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and `compliance/`.
