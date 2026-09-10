> **Language:** English · [Deutsch](WHY_OLUNTIR_de.md)
> **Version:** 2.3.0

# Why Oluntir?

Oluntir treats a website as a coherent, portable project rather than only the HTML page currently open in an editor. Pages, assets, Bootstrap generation, shared regions, repeatable content, and export rules remain connected in one project context.

## Why GrapesJS?

GrapesJS provides the Canvas, component model, blocks, responsive views, and direct editing. Oluntir uses GrapesJS 0.23.2 as an unchanged editor engine and adds project management, Shared Content, the Repeat library, assets, Analyzer, and export through its own integration layers.

## Why local?

Oluntir is local-first:

- projects and assets remain under the user's control;
- no mandatory cloud account is required;
- projects can be copied, backed up, and continued on another computer;
- published websites do not require an Oluntir runtime.

## Why Shared Content?

Header, navigation, and footer are typical shared page regions. Oluntir manages them centrally so they do not need to be maintained independently on every page.

## Why a Repeat library?

Project-wide recurring content sections need a different workflow from header or footer. Oluntir therefore manages user-defined Repeat sections in a central library. One source is edited centrally and then published to all occurrences in a controlled operation.

This keeps page instances consistent without project-wide synchronization on every keystroke.

## Why Bootstrap 4 and 5?

Oluntir focuses active editor integration on two explicit framework profiles: Bootstrap 4.6.2 and Bootstrap 5.3.8. Components, utilities, and template structures can therefore be recognized and edited according to their generation without mixing framework models.

## Why open export formats?

Oluntir exports regular HTML, CSS, JavaScript, and local assets. Shared content can also be emitted as Apache SSI or PHP includes. Folder, ZIP, and TAR output remain independent of a proprietary runtime.

## Why a local Analyzer?

Bootstrap templates differ in structure, components, and assets. The Analyzer statically inspects sources and gives Oluntir a traceable basis for detection and controlled editor integration. Foreign source JavaScript is not executed automatically.

## Core idea

Oluntir combines a visual editor, project management, Bootstrap awareness, reusable content, local assets, and open export into a portable website workspace.

## Further reading

- [README](../README.md)
- [Features](../FEATURES.md)
- [Handbook](../HANDBOOK.md)
- [Architecture](ARCHITECTURE.md)
