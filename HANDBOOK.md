# Oluntir 2.3.0 – Handbook

This handbook describes how to work with Oluntir 2.3.0. Implementation details are documented in `docs/ARCHITECTURE.md` and the topic-specific files under `docs/`.

## 1. Start a project

Oluntir runs locally from `index.html`. At startup, open an existing project or create a new one. Projects can be saved as portable `.oluntir` files and continued later.

A bundled portable local Analyzer runtime is available when Source-Package analysis is needed.

## 2. Pages and workspace

A project may contain multiple pages. The top page controls create, select, rename, and remove pages.

Oluntir supports single- and dual-monitor operation. In dual-monitor mode, tool areas can move into a separate window while the Canvas remains in the main window.

## 3. Edit content

The Canvas is based on GrapesJS. Content can be inserted from blocks and edited directly or through traits, layers, and styles.

Typical content includes:

- text and headings;
- images and responsive image variants;
- galleries and lightbox content;
- Bootstrap components;
- HTML5 video;
- project-bound Source components.

## 4. Bootstrap profiles

Oluntir 2.3.0 supports Bootstrap 4.6.2 and Bootstrap 5.3.8 as concrete editor profiles.

Bootstrap 4 and Bootstrap 5 are treated separately. Generation-specific components and utilities are offered only in the matching profile. Built-in blocks use native Bootstrap markup.

## 5. Shared Content

Header, navigation, and footer are managed as Shared Content. Changes can be made on a participating page and promoted into the shared state so the other pages receive the same content.

Shared Content is intentionally separate from user-defined Repeat sections.

## 6. Repeatable sections

Repeatable sections are intended for project-wide content that should appear on multiple pages but does not belong to header, navigation, or footer.

### Create a Repeat

1. select the source section;
2. name and save the Repeat family;
3. choose the target page and insertion position;
4. confirm the position in the Canvas;
5. insert the section.

### Edit a Repeat centrally

The Repeat library lists the available families and where they are used. **Central editing** opens only the selected Repeat in a single-object Canvas.

Changes remain in the draft until **Apply to all occurrences** publishes the new version to every active occurrence.

### Repeat occurrences on pages

Occurrences on normal project pages are protected from direct content editing. On hover, an orange toolbar provides:

- **Edit** to open central editing;
- **Remove** to remove only that occurrence.

Publish and remove operations use a dedicated Repeat undo/redo history.

## 7. Images, galleries, and video

The Image Manager handles local images and responsive variants. Galleries can be inserted into suitable layout regions.

HTML5 video blocks support multiple playback sources, poster images, and a download fallback. Bootstrap 4 and Bootstrap 5 use the native responsive layout mechanism of the selected profile.

## 8. Source Packages and Analyzer

The local Analyzer can import and statically inspect template and framework sources. It evaluates HTML, CSS, and JavaScript evidence, Bootstrap generation, and component structures.

Detected structures may be exposed as source-bound editor blocks when supported by the active profile. Imported source JavaScript is not executed automatically.

## 9. Export

Oluntir supports:

- resolved HTML;
- Apache SSI;
- PHP includes;
- local folder export;
- ZIP;
- TAR.

Export collects required local assets and removes editor-only Oluntir metadata from published output.

## 10. Logging and diagnostics

Logging is optional and is enabled only after explicit consent. Logs are written to a local directory chosen by the user.

Diagnostics help inspect project, runtime, Shared Content, Repeat, and Analyzer state.

## 11. Project maintenance

Create a `.oluntir` project backup before major changes. Existing projects are continued through stable Oluntir identities; ambiguous relationships are not guessed.

## Further documentation

- [Features](FEATURES.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Repeat Engine V2](docs/042_REPEAT_ENGINE_V2.md)
- [Shared Content Manager](docs/SHARED-CONTENT-MANAGER.md)
- [Image Manager](docs/IMAGE_MANAGER.md)
- [Multi-monitor](docs/MULTI_MONITOR.md)
- [Release notes](RELEASE_NOTES.md)

## 11. Managing additional Bootstrap templates

Additional templates are imported through `template-manager.html` and stored below `templates/<name>/`. The bundled profiles below `frameworks/` are not modified.

Recommended flow:

1. Choose a template ZIP and name.
2. Run **Analyze template**.
3. Review the detected Bootstrap base plus HTML/section, asset and JavaScript results.
4. Select this Oluntir installation's `templates` folder.
5. Accept the template.
6. Wait for registry/file verification to complete.
7. Open Oluntir through the green completion button.

Registered templates can be removed in the same manager. If a folder is deleted manually, the manager detects it and can clean the stale registry record. Valid template folders copied manually below `templates/` can be registered.

## 12. Imported template behavior

The compiler analyzes template JavaScript statically and creates behavior, dependency and runtime plans. Third-party template JavaScript does not run inside the normal editable GrapesJS canvas.

`iframe`, `object` and `embed` are neutralized by scalable SVG placeholders in edit mode. This covers maps, video/social embeds and other third-party widgets. Original source and size/style information are retained; preview may reactivate the original source only in the canvas DOM.
