> **Language:** English · [Deutsch](WHY_OLUNTIR_de.md)  
> **Version:** 1.2.0 · **Updated:** 2026-07-30

# Why Oluntir?

Oluntir exists because a website is more than the page currently open in an editor. Real projects contain pages, images, framework versions, shared navigation and layout regions, export rules, backups, and decisions that must remain understandable over time.

Oluntir therefore treats a website as a coherent, portable project instead of a collection of unrelated HTML files.

## Why GrapesJS?

GrapesJS provides the visual canvas, component model, blocks, responsive views, and direct editing experience. Oluntir uses **GrapesJS 0.23.2** as an unchanged, versioned Open Source editor engine.

Oluntir-specific behavior is added through its own integration and adapter layer. GrapesJS is not modified. Project management, workspaces, assets, Shared Content, persistence, export, and multi-monitor behavior remain separated from internal GrapesJS DOM structures. This makes responsibilities clearer and future engine updates easier to review.

## Why local projects?

Oluntir is local-first by design:

- project files remain under the user's control;
- projects can be copied, archived, backed up, and restored;
- no mandatory cloud account or database is required;
- browser persistence supports the current workspace without replacing the physical project structure;
- a saved project can be continued on another computer or in another supported browser.

## Why Shared Content?

Navigation, headers, footers, and other recurring content elements and regions should not have to be maintained independently on every page. Oluntir stores them centrally and references them through visible `<ope-include>` elements.

A change may begin on any page, be transferred to the central Shared Content, and then be applied to the other pages. The export format is selected later: resolved HTML, Apache SSI, or PHP includes.

## Why a two-monitor workspace?

A large page canvas and detailed tools compete for screen space. Oluntir can keep the canvas in the main window while moving the complete right tool column, Quick Edit, and Quick Setup to a dedicated tool window.

The preferred mode and window geometry are stored locally. If the second window cannot be opened or disappears, Oluntir returns safely to single-monitor operation.

## Why open export formats?

Oluntir does not require a proprietary runtime for the published website. Exports consist of regular HTML, CSS, JavaScript, local assets, and—when selected—standard SSI or PHP include statements.

The internal project model remains independent of the chosen output. A project can therefore target different environments without being rebuilt from scratch.

## Why Open Source?

Open Source keeps the project's behavior, dependencies, and decisions inspectable. It supports community contributions, independent security review, long-term maintenance, and freedom from a single vendor.

## The core idea

Oluntir is not merely another visual HTML editor. It is a local Open Source website project environment—from first page and image management through shared content, workspace restoration, and open export.

## Related documentation

- [Architecture](ARCHITECTURE.md)
- [Project principles](PROJECT-PRINCIPLES.md)
- [First start](FIRST_START.md)
- [Multi-monitor workspace](MULTI_MONITOR.md)
- [Image Manager](IMAGE_MANAGER.md)
- [Release notes 1.2.0](../RELEASE_NOTES.md)
