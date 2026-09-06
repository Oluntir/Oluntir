# Release Notes – Oluntir 2.1.0 BETA

Oluntir 2.1.0 BETA is an experimental continuation of the stable 1.3.1 line.
It consolidates productive framework support on Bootstrap 4.6.2 and 5.3.8.

## 2.1.0 BETA – key changes

- Two separate Repeat workflows: create/edit the current source and insert a named source from the project-wide library.
- Bidirectional Repeat synchronization source ↔ instances and instance → sibling instances using stable Oluntir identities.
- Compatibility hydration for existing Alpha projects when unambiguous Oluntir correlations are present.
- Bidirectional Shared Content for header, navigation and footer.
- Shared Content performance fix: redundant GrapesJS events with unchanged central content exit before target mutation and `editor.store()`; update/style events outside shared regions are filtered early.
- Visible version labels in the main UI and tool monitor changed to **2.1.0 BETA**.

## Historical Alpha changes since 1.3.1

- portable Windows x64 Node.js 24.18.0 runtime and local Analyzer API;
- universal Source-Package import for folders, ZIP, TAR, TAR.GZ/TGZ, browser
  files and URLs through the local API;
- per-package source directories, manifests, SHA-256 inventories and recovery
  JSON;
- static HTML, CSS and JavaScript analysis with OIR, evidence and capability
  manifests;
- source-bound Bootstrap profiles, translation matrix and JavaScript behavior
  resolver;
- controlled GrapesJS bridge for user-selectable source structures;
- Bootstrap support gate: Bootstrap 4/5 are concrete profiles, unknown sources
  are analysis-only;
- framework-owned gallery structures, image lightbox, preview improvements and
  export regression fixes.

Imported-source JavaScript execution remains disabled. Explicitly defined
Repeat areas are inserted and synchronized productively through stable
identities; header, navigation and footer use only the Shared Content Manager.

## Main changes

- more reliable persistence of shared header, navigation and footer regions;
- project-wide quick editing without rebuilding the navigation;
- transfer of text, font size and explicit presentation values into exports;
- undo and redo for text and image changes;
- new gallery insertion points between complete page areas;
- more reliable export snapshots and responsive image output;
- consolidated framework and icon sources for Bootstrap 4 and 5;
- productive Repeat areas with target selection, clear/reset workflow,
  structural insertion positions and persistent instance linkage.

## Compatibility

Existing projects continue to load through the available migration and identity routines. A portable project backup is recommended before major changes.

## Known limitation

An explicitly selected footer text color may appear differently in the editor than in the exported result. The export preserves the explicitly selected value.
