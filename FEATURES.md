# Features – Oluntir 2.2.1

This page describes the user-visible product capabilities of Oluntir 2.2.1. Implementation details and bug history belong in the changelog, release notes, and architecture/DEV documentation.

## Editor and projects

- local visual editor based on GrapesJS 0.23.2;
- multi-page website projects;
- portable `.oluntir` project files;
- create, rename, select, and remove pages;
- single- and dual-monitor workspace;
- project favicon and local project assets.

## Content and media

- text, image, gallery, and component editing;
- responsive image variants for desktop, tablet, and mobile;
- local image management and reuse of existing assets;
- lightbox and gallery integration;
- responsive HTML5 video with WebM, MP4, and Ogg sources, poster, and download fallback;
- Bootstrap-specific responsive video layout for BS4 and BS5.

## Shared Content

- project-wide management of header, navigation, and footer;
- changes may be promoted from any participating page into the shared state;
- shared regions are kept consistent across project pages;
- output as resolved HTML, Apache SSI, or PHP includes.

## Repeatable sections

- central Repeat library with human-readable names;
- page and occurrence usage overview;
- central editing in a single-object Canvas;
- draft/published workflow;
- **Apply to all occurrences** for controlled project-wide publishing;
- protected page instances with an orange control toolbar;
- targeted removal and restoration of individual occurrences;
- Repeat undo/redo for publish and remove transactions;
- insert additional occurrences through Repeat → target page → insertion position;
- compact, sortable, expandable library lists;
- migration of existing projects through stable Oluntir identities.

## Bootstrap 4 and 5

- Bootstrap 4.6.2 as the legacy profile;
- Bootstrap 5.3.8 as the primary profile;
- native Bootstrap blocks instead of an Oluntir parallel component system;
- BS4-specific support including Jumbotron, Media Object, and Custom Forms;
- current BS5 component and utility structures;
- generation-aware Bootstrap detection using version, Data API, and structural evidence.

## Source Packages and Analyzer

- local Source-Package import from folders, archives, browser files, and URLs;
- static HTML, CSS, and JavaScript evidence analysis;
- detection of Bootstrap generation, components, and capabilities;
- source-bound profiles and capability information;
- suitable detected structures can be exposed as controlled GrapesJS blocks;
- unknown frameworks remain `analysis-only`;
- imported source JavaScript is not executed automatically.

## Export

- HTML export;
- Apache SSI export;
- PHP include export;
- local folder output;
- ZIP and TAR archives;
- collection of local framework, image, font, and project assets;
- removal of editor-only Oluntir metadata from final output.

## Workspace support

- global undo/redo for normal editor actions;
- dedicated Repeat history for project-wide Repeat transactions;
- optional local logs after consent;
- diagnostics for project, runtime, and analyzer state;
- GrapesJS block search, layers, traits, and style views.
