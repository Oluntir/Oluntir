# Features – Oluntir 2.3.0

This page describes the user-visible product capabilities of Oluntir 2.3.0. Implementation detail and bug history belong in the changelog, release notes and architecture/DEV documentation.

## Editor and projects

- local visual editor based on GrapesJS 0.23.2;
- multi-page websites and portable `.oluntir` project files;
- page creation, rename, selection and removal;
- single- and dual-monitor workspace;
- global Undo/Redo for normal editor actions;
- project favicon and local project assets.

## Content and media

- text, image, gallery and component editing;
- responsive image variants for desktop, tablet and mobile;
- local asset reuse;
- lightbox and gallery integration;
- responsive HTML5 video with WebM, MP4 and Ogg sources, poster and download fallback;
- Bootstrap-specific BS4/BS5 video presentation.

## Shared Content

- project-wide header, navigation and footer management;
- changes can be committed from participating pages into the shared state;
- shared regions remain consistent across project pages;
- resolved HTML, Apache SSI or PHP include output.

## Repeatable regions

- central Repeat library with user-readable names;
- page/occurrence visibility;
- central editing in a dedicated single-object canvas;
- draft/published workflow;
- controlled project-wide publishing;
- protected page instances;
- targeted occurrence removal/recovery;
- dedicated Repeat Undo/Redo;
- insertion onto selected target pages and positions.

## Bootstrap 4 and 5

- protected Bootstrap 4.6.2 standard profile;
- protected Bootstrap 5.3.8 standard profile;
- native Bootstrap blocks instead of a parallel component framework;
- generation-specific components and utilities;
- Bootstrap generation detection from version, Data API and structural evidence.

## Modular template management

- separate `template-manager.html` for additional Bootstrap templates;
- imported templates live only under `templates/<name>/`;
- imports never modify `frameworks/bootstrap4` or `frameworks/bootstrap5`;
- static `registry.json`/`registry.js` for fast startup without re-analysis;
- discover/register manually copied template folders;
- detect manually removed folders and clean stale registry entries;
- remove imported templates through the manager;
- bundled standard profiles remain visible, versioned and protected.

## Universal Bootstrap template compiler

- ZIP import for arbitrary Bootstrap 4/5 templates;
- structure-independent file analysis;
- primary HTML pages separated from documentation/helper pages;
- semantic sections, regions and block families;
- repeat candidates and variants recorded as structural metadata;
- images, fonts, media and unreferenced demo/placeholder assets retained;
- template/vendor CSS separated from Bootstrap CSS;
- expensive analysis runs during import while normal startup loads only compiled output.

## Universal JavaScript analysis

- analysis of local and referenced JavaScript;
- script load order, libraries, plugins and dependencies;
- DOM selectors mapped to HTML pages and section families;
- unknown plugins remain analyzable without per-template hard-coding;
- behavior classification into section, global, dependency, helper/configuration and unresolved groups;
- `behavior-manifest.json`, `dependencies.json`, `runtime-plan.json` and `javascript-activation-plan.json`;
- duplicate Bootstrap/jQuery runtimes excluded by the activation plan;
- imported template JavaScript does not run in the editable GrapesJS canvas.

## External embeds and plugin frames

- generic edit-mode isolation for `iframe`, `object` and `embed`;
- provider-independent handling for Google Maps, OpenStreetMap, video/social embeds and similar widgets;
- active external source replaced by a scalable SVG placeholder;
- tag, classes, style, width and height remain intact;
- original source and `srcdoc` retained for preview/publishing;
- preview restoration affects only the canvas DOM, not the stored editor model;
- `embed-isolation.json` records the compiler contract.

## Export

- HTML, Apache SSI and PHP include output;
- local folder, ZIP and TAR export;
- local framework/image/font/project asset collection;
- editor-only Oluntir metadata removed from published output.

## Assistance and diagnostics

- optional local logs after consent;
- project/runtime/analyzer diagnostics;
- GrapesJS block search, layers, traits and style views;
- progress overlay during template analysis and acceptance;
- template acceptance is only reported successful after registry and entry files are read back and verified.
