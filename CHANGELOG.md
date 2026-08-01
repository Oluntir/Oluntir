# Changelog

## 1.3.0 — 2026-08-01

### Architecture
- Added the Semantic Dictionary and Identity, Context, Structure and Relationship Resolvers.
- Added an explicitly built read-only Project Dependency Graph.
- Added the Semantic Action Engine with lifecycle, action definitions, handlers, phases, queue, batching, deduplication, transactions, failures and metrics.
- Retained the Semantic Validator and Repeat Engine V2 technical foundation.

### Shared content and performance
- Changed shared header, navigation and footer synchronization to targeted region updates.
- Added fingerprints and lazy synchronization.
- Avoided full-page and full-project rebuilds during normal page switching.

### Logging and diagnostics
- Added optional local logging with a ring buffer, JSONL files, rotation and redaction.
- Added Runtime Actions for editor, page, shared-content, gallery and export events.
- Added installation-bound versioned consent for licensing, privacy and security documents.
- Added the Developer Diagnostics Center with manual graph analysis and snapshot export.

### Editor and export
- Consolidated framework and icon sources for Bootstrap 4 and 5.
- Stabilized project favicon, editor placeholders and responsive image variants.
- Locally tested HTML, SSI and PHP export including shared content.

### Documentation
- Consolidated main documentation for 1.3.0.
- Added architecture and AI knowledge documentation.
- Added a release audit.

## Earlier versions
History up to 1.2.1 remains available in Git history and the existing migration documents.
