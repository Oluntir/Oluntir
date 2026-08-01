> **Language:** English · [Deutsch](README_de.md)

# Oluntir 1.3.0

Oluntir is a local browser-based website editor built on GrapesJS 0.23.2. It manages multi-page projects, local assets, shared page regions and exports without a server-side application runtime.

**Release:** 1.3.0  
**Date:** August 1, 2026  
**Status:** Release

## Supported profiles and output

- Bootstrap 4.6.2
- Bootstrap 5.3.8
- HTML, Apache SSI and PHP include export
- folder, ZIP and TAR output

## Main capabilities

- visual editing with GrapesJS;
- multi-page projects and shared regions;
- stable internal layout identities;
- shared header, navigation and footer content;
- fingerprint-based lazy synchronization without full-project rebuilds;
- responsive image variants, gallery and project favicon;
- single- and dual-monitor workspace;
- portable `.oluntir` project files;
- optional local diagnostic logging after explicit consent;
- installation-bound consent for licensing, privacy and security documents;
- Developer Diagnostics Center for runtime, action, log and graph snapshots.

## Semantic core

```text
Semantic Dictionary
→ Identity Resolver
→ Context Resolver
→ Structure Resolver
→ Relationship Resolver
→ Project Dependency Graph
→ Semantic Action Engine
→ Semantic Validator / Shared Content / Repeat Engine / Export
```

The Structure Resolver, Relationship Resolver and Project Dependency Graph are read-only when explicitly invoked. The Semantic Action Engine is present as an isolated orchestration core. Version 1.3.0 does not yet route all production modules through it.

## Start

1. Extract the archive.
2. Open `index.html` in a current Chromium-based desktop browser.
3. Accept the licensing, privacy and security documents.
4. Optionally select the existing `logs` subdirectory and enable local logging.
5. Open or create a project.

Consent is bound to the extracted application directory. Starting another extracted copy requires separate consent.

## Documentation

- [Documentation index](docs/index.md)
- [Technical handbook](HANDBOOK.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Release notes](RELEASE_NOTES.md)
- [Privacy](PRIVACY.md)
- [Security](SECURITY.md)
- [AI knowledge base](docs/AI/000_PROJECT.md)
- [Release audit](audit/OLUNTIR_1.3.0_AUDIT.md)

## License

Oluntir-owned source code is licensed under MIT. Third-party components retain their own licenses. See [LICENSING.md](LICENSING.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and `compliance/`.
