> **Language:** English (reference) · [Deutsch](README_de.md)

# Oluntir

**Version:** 1.0.0  
**Language:** English  
**Status:** Stable  
**Applies to:** Oluntir 1.0.0  
**Last updated:** 2026-07-29

> **Release status:** This package is the stable release for Oluntir 1.0. It is intended for production use and publication.

Oluntir is a browser-based editor for static websites. It runs locally and creates HTML, CSS, and JavaScript projects without requiring a database or a server-side application runtime.

## Features

- local browser operation;
- Bootstrap 4.6.2 and Bootstrap 5.3.8 project profiles;
- page management, project save, restore, and backup;
- classic HTML projects and projects with reusable areas;
- Shared Content Manager with immediate cross-page synchronization of header, navigation, and footer;
- the Oluntir Include (Oluntir) document model with visible `<ope-include>` references;
- export to resolved HTML, Apache SSI, or PHP includes;
- folder, ZIP, and TAR export targets;
- German and English user interface;
- quick setup, quick editing, block search, and responsive editor views;
- bundled local framework, font, image, and editor assets.

## Project types

### Classic HTML project

Each page stores complete HTML. Export produces standalone `.html` files.

### Project with reusable areas

Header, navigation, footer, and optional sections are maintained centrally. Pages use Oluntir references such as:

```html
<ope-include src="includes/layout/navigation.html"></ope-include>
```

A shared include resolver converts Oluntir references into resolved HTML, Apache SSI directives, or PHP include statements. When a new page is created, Oluntir uses the current shared header, navigation, and footer layout and adds an empty `<main>` element for page-specific content. Changes made to these shared layout regions on any page are written back immediately to the central Oluntir state and propagated to all other pages.

## Start locally

1. Extract the release archive.
2. Open `index.html` in a current browser.
3. Continue an existing project or create a new project.
4. Edit pages and select the required export format and target.

Browser support for file and folder access varies, especially when the application is opened through `file://`. Oluntir displays notices for known restrictions.

## Repository structure

```text
assets/       Local fonts, images, and project assets
editor/       User interface and core functions
frameworks/   Versioned Bootstrap profiles
plugins/      Bundled editor and website libraries
docs/         Technical documentation
compliance/   License and asset records
templates/    Edition and project templates
examples/     Example material
.github/      Repository templates and automation
```

## Documentation

- [Project structure](docs/PROJECT-STRUCTURE.md)
- [Oluntir include system](docs/OLUNTIR-INCLUDE-SYSTEM.md)
- [Shared Content Manager](docs/SHARED-CONTENT-MANAGER.md)
- [Offline assets](docs/OFFLINE-ASSETS.md)
- [Documentation guidelines](docs/DOCUMENTATION-STYLE.md)
- [Technical handbook](HANDBOOK.md)

## Licensing

Original Oluntir source code is licensed under the MIT License. Bundled libraries, fonts, and other third-party components retain their respective licenses. See [LICENSE](LICENSE), [LICENSING.md](LICENSING.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), and the [license matrix](compliance/LICENSE_MATRIX.md).

## Contributions and reports

Contribution requirements are documented in [CONTRIBUTING.md](CONTRIBUTING.md). Security reports are handled according to [SECURITY.md](SECURITY.md).

### Empty reusable-area projects

A new reusable-area project starts with an empty page. Oluntir does not insert a predefined header, navigation, or footer. After the user adds these elements, the Shared Content Manager treats them as the project-wide shared source and applies their current state to newly created pages. If the header already contains a navigation element, it remains part of the header.
