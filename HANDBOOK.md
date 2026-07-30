> **Language:** English (reference) · [Deutsch](HANDBOOK_de.md)

# Oluntir Technical Handbook

**Version:** 1.1.0  
**Language:** English  
**Status:** Stable  
**Applies to:** Oluntir 1.1.0  
**Last updated:** 2026-07-29

## 1. Purpose

Oluntir edits and exports static website projects locally in a browser.

## 2. Project types

Classic projects store complete page HTML. Projects with recurring content elements and regions store shared layout content separately and reference it through Oluntir elements.

## 3. Oluntir document model

An Oluntir reference uses `<ope-include src="..."></ope-include>`. Oluntir is the internal representation and is resolved only for preview and export.

## 4. Recurring content elements and regions

Layout areas normally include header, navigation, and footer. Additional sections may be registered. Paths must be unique and all referenced areas must exist.

## 5. Code view

The Oluntir mode is editable and displays formatted source, syntax highlighting, and line numbers. The rendered HTML mode is read-only. Sensitive content inside `pre`, `code`, `script`, `style`, and `textarea` must not be reformatted destructively.

## 6. Export

The export format and output target are separate decisions. Available formats are resolved HTML, Apache SSI (`.shtml`), and PHP includes (`.php`). Available targets are folder, ZIP, and TAR.

## 7. Validation

Before export, the project is checked for missing project metadata, missing include targets, duplicate include paths, and cyclic resolution where applicable.

## 8. Storage and backup

Projects may use browser storage and exported backups. Browser storage is not a substitute for external backups. Export a project before replacing the application build or clearing browser data.

## 9. Project structure

The application source is separated into editor core, assets, frameworks, plugins, templates, documentation, and compliance records. Generated website projects use their own page and asset layout.

## 10. Known limitations

Browser file-system capabilities vary. Oluntir validation is not a complete HTML validator. Version 1.0.0 is the stable release covered by this handbook.

## 11. Licensing

See `LICENSE`, `LICENSING.md`, `THIRD_PARTY_NOTICES.md`, and `compliance/`.
