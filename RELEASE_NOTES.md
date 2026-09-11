# Release Notes – Oluntir 2.3.0

Oluntir 2.3.0 extends the Bootstrap-focused editor with a modular template runtime and a universal compiler for additional Bootstrap 4/5 templates. The bundled Bootstrap profiles remain unchanged and protected.

## 2.3.0 highlights

### More stable footer editing and template management

The blue GrapesJS component toolbar now deletes complex shared regions using a stable target snapshot captured at toolbar-click time. This addresses the selected footer directly even when embedded or deeply nested content changes focus. Template management also separates “Remove” from folder selection: the remove action no longer opens Explorer and only reuses an already authorized `templates` directory. The synthetic `runtime-test` template has been removed from the distribution.

### Modular template architecture

Imported templates are stored only below `templates/<name>/`. `frameworks/bootstrap4` and `frameworks/bootstrap5` remain untouched. A static registry loads accepted templates during normal `index.html` startup without re-running the analyzer.

### Template management

`template-manager.html` handles analysis, acceptance, validation and removal. Valid template folders copied manually can be registered; manually removed folders are detected and stale registry entries can be cleaned up. Bundled standard templates remain visible, versioned and protected.

### Universal Bootstrap template compiler

The compiler analyzes arbitrary BS4/BS5 templates without template-specific rules. Sample HTML, sections, semantic block families, repeat candidates, CSS, assets and JavaScript are analyzed once during import and stored as a static template module.

### JavaScript analysis and activation planning

JavaScript is analyzed for libraries, plugins, dependencies, DOM selectors, events and section mappings. Behavior, dependency and runtime manifests are generated. Imported template JavaScript does not run in the editable GrapesJS canvas, keeping Undo/Redo, deletion, Shared Content and autosave isolated from third-party DOM mutations.

### External embeds and maps

`iframe`, `object` and `embed` are generically isolated in edit mode. Active third-party sources such as Google Maps, OpenStreetMap, video/social embeds and similar plugin frames are replaced by scalable SVG placeholders. Width, height, classes and styles are retained; placeholders capture neither pointer events nor keyboard focus while editing. Original sources are preserved for preview/publishing contracts.

### Existing core features

2.3.0 retains multi-page project management, Shared Content for header/navigation/footer, the central Repeat library, image/gallery management, responsive media, dual-monitor workspace and HTML/SSI/PHP plus folder/ZIP/TAR export.

## Compatibility

The productive framework base remains Bootstrap 4.6.2 and Bootstrap 5.3.8. The new compiler targets templates based on those Bootstrap generations. Existing projects continue to use stable Oluntir identities.

## More information

- [README](README.md)
- [Features](FEATURES.md)
- [Template system](docs/TEMPLATE-SYSTEM.md)
- [Handbook](HANDBOOK.md)
- [Changelog](CHANGELOG.md)
