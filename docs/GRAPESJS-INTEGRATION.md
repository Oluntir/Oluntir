# GrapesJS integration in Oluntir 2.2.1

GrapesJS 0.23.2 is stored unchanged below `vendor/grapesjs/0.23.2/`. Oluntir-specific behavior is isolated in `editor/integrations/grapesjs/`.

The Source-Package GrapesJS adapter exposes recognized structures as
user-selectable blocks. It does not execute imported scripts and does not create
a parallel Oluntir component architecture. Concrete framework activation is
limited to Bootstrap 4.6.2 and 5.3.8.

## Boundary

Oluntir modules use the adapter for editor commands, asset selection, panels, and approved tool-container relocation. Internal `.gjs-*` structures must not become general application dependencies. Multi-monitor support moves existing tool containers; it does not fork or instantiate another GrapesJS editor.

## Update procedure

1. Add a new GrapesJS version in a separate vendor directory.
2. Keep the previous version until regression testing is complete.
3. Update central dependency configuration and paths only after verification.
4. Run structure, adapter, JavaScript syntax, import, restore, export, Image Manager, gallery, and multi-monitor tests.
5. Document compatibility differences and any migration requirement.

## Required checks

- editor initialization and canvas;
- public adapter commands and callbacks;
- Components, Styles, Layers, and Traits in single and dual mode;
- quick-edit synchronization;
- IndexedDB hydration and export;
- image variants, replacement, and deletion safeguards;
- tool-window closure and fallback;
- both Bootstrap profiles and all export modes.
