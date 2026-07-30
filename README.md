> **Language:** English (reference) · [Deutsch](README_de.md)

# Oluntir

**Version:** 1.2.0  
**Status:** Stable  
**Release date:** 2026-07-30

**Open Source website editor with project management, a two-monitor workspace, and local export.**

Oluntir is an offline-first, browser-based editor for static websites. It creates and maintains HTML, CSS, and JavaScript projects locally without requiring a database or a server-side application runtime.

## GrapesJS as the editor engine

Oluntir uses **GrapesJS 0.23.2** as its central visual editor engine. GrapesJS remains an unchanged, versioned Open Source vendor dependency below `vendor/grapesjs/`; Oluntir does not modify the engine itself. Oluntir-specific behavior is isolated behind the integration and compatibility layer in `editor/integrations/grapesjs/`. This keeps Oluntir's project, asset, workspace, export, and multi-monitor architecture independent from internal GrapesJS DOM structures.

## Highlights of version 1.2.0

- **Two-monitor workspace:** the GrapesJS canvas stays in the main window while the complete right tool column and Oluntir quick-edit areas can be moved to a separate tool window.
- **Safe restoration:** blocked pop-ups, closed windows, unavailable screens, invalid saved positions, and single-monitor computers fall back safely without discarding the preferred monitor mode.
- **Persistent workspace settings:** monitor mode, startup choice, window size, and position are stored in a dedicated IndexedDB settings store.
- **Workspace-based image manager:** search, filters, grid/list views, details, responsive variants, replacement, deletion, and project-folder synchronization.
- **Project-folder connection:** users select the project root; Oluntir explains the process first and then automatically uses or creates `assets/user_upload/`.
- **Gallery viewers:** independent Modal and true Lightbox modes with keyboard navigation, focus management, captions, counters, original-image download, and a protected bottom safe area.
- **Sticky and clearer controls:** persistent upper toolbar, improved dark-theme contrast, and explicit controls for moving or recalling the tool column.

## Main capabilities

- Bootstrap 4.6.2 and Bootstrap 5.3.8 project profiles;
- classic HTML projects and projects with recurring content elements and regions;
- page management, browser persistence, project backup, restore, and portable `.oluntir` project files;
- Shared Content Manager for header, navigation, footer, and optional shared regions;
- editable Oluntir include model with visible `<ope-include>` references;
- export to resolved HTML, Apache SSI, or PHP includes;
- folder, ZIP, and TAR export targets;
- German and English user interface and documentation;
- quick setup, quick editing, block search, responsive editor views, galleries, and image management;
- locally bundled framework, font, image, editor, and website assets.

## Start locally

1. Extract the release archive.
2. Open `index.html` in a current desktop browser.
3. Choose single-monitor or two-monitor operation when prompted.
4. Continue an existing project or create a new project.
5. Keep a separate project backup before major changes or migrations.

Folder access and multi-window behavior depend on browser permissions. A later attempt to open the tool window can be treated as a pop-up; opening it directly from a user action is the most reliable path.

## Project-folder connection

In the Image Manager, choose **Connect project folder** and select the root folder of the current Oluntir project—not `assets` and not `user_upload`. Oluntir then uses or creates:

```text
assets/user_upload/
```

Browser permissions can be lost after a restart, on another computer, or after clearing site data. The IndexedDB asset store and the physical project folder therefore remain separate persistence layers.

## Repository structure

```text
assets/       Local fonts, images, and project assets
editor/       Oluntir UI, services, workspaces, and core functions
frameworks/   Versioned Bootstrap profiles
plugins/      Bundled editor and website libraries
vendor/       Unchanged, versioned third-party editor dependencies
docs/         User and technical documentation
compliance/   License and asset records
templates/    Edition and project templates
examples/     Example material
.github/      Repository templates and automation
```

## Documentation

- [Documentation index](docs/index.md)
- [Why Oluntir?](docs/WHY_OLUNTIR.md)
- [Architecture overview](docs/ARCHITECTURE.md)
- [Project principles](docs/PROJECT-PRINCIPLES.md)
- [Versioning](docs/VERSIONING.md)
- [First start](docs/FIRST_START.md)
- [Multi-monitor workspace](docs/MULTI_MONITOR.md)
- [Image Manager](docs/IMAGE_MANAGER.md)
- [Workspace architecture](docs/WORKSPACE-ARCHITECTURE.md)
- [GrapesJS integration](docs/GRAPESJS-INTEGRATION.md)
- [Project structure](docs/PROJECT-STRUCTURE.md)
- [Oluntir include system](docs/OLUNTIR-INCLUDE-SYSTEM.md)
- [Technical handbook](HANDBOOK.md)
- [Release notes](RELEASE_NOTES.md)

## Licensing and security

Original Oluntir source code is licensed under the MIT License. Bundled libraries, fonts, and other third-party components retain their respective licenses. See [LICENSE](LICENSE), [LICENSING.md](LICENSING.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), and [compliance/LICENSE_MATRIX.md](compliance/LICENSE_MATRIX.md).

Security reports are handled according to [SECURITY.md](SECURITY.md). Contribution requirements are documented in [CONTRIBUTING.md](CONTRIBUTING.md).
