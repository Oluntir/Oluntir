# Modular Template System – Oluntir 2.3.0

## Goal

The template system adds Bootstrap 4/5 templates without template-specific changes to the bundled framework profiles or editor core.

## Directory contract

```text
frameworks/
├── bootstrap4/
└── bootstrap5/

templates/
├── registry.json
├── registry.js
└── <template-id>/
    ├── template.json
    ├── template.js
    ├── components.json
    ├── analysis.json
    ├── assets.json
    ├── behavior-manifest.json
    ├── dependencies.json
    ├── runtime-plan.json
    ├── javascript-activation-plan.json
    ├── embed-isolation.json
    └── source/
```

Imports may write only below `templates/`; `frameworks/` stays unchanged.

## Import/compiler flow

1. Choose a template ZIP and name.
2. Separate primary sample HTML from documentation/helper pages.
3. Detect the Bootstrap 4/5 base.
4. Analyze sections, regions, variants, repeat candidates and semantic block families.
5. Resolve CSS, asset and JavaScript dependencies.
6. Isolate active third-party embeds for edit mode.
7. Compile a static template definition.
8. On explicit acceptance, write `templates/<id>/`.
9. Write, read back and verify the registry and entry files.

## Registry

`registry.json` is the human-readable registry. `registry.js` mirrors it for direct `file://` startup. The manager updates both together.

A manually deleted template folder must not break Oluntir. The manager detects the missing folder and can remove its stale registry record. Valid template folders copied manually can be registered from their `template.json`.

## JavaScript

The analyzer is generic and contains no per-template name rules. It resolves script roles, libraries, plugins, load order, dependencies, DOM selectors, events and section mappings. Unknown plugins remain analyzable as unknown providers/invocations.

Template JavaScript does not run in the editable canvas. The activation plan is prepared for controlled preview/publishing runtime use and avoids known framework duplication and detected high-risk scripts.

## Embed isolation

`iframe`, `object` and `embed` are isolated regardless of provider. In edit mode the active source is replaced by a local SVG while the original element is preserved, allowing template CSS to keep controlling width, height, classes and layout. Editor placeholders are pointer-transparent and non-focusable so selection and block tools reach the surrounding Oluntir structure.

Original source, active source attribute and optional `srcdoc` are retained. Preview reactivation changes only the canvas DOM and restores the SVG placeholder when preview ends, leaving the stored GrapesJS model deterministic.

## Performance principle

Expensive analysis occurs only during import. Normal editor startup loads the static registry, compiled template definition, blocks and approved assets. Imported JavaScript and external embeds must not continuously mutate the editable DOM.
