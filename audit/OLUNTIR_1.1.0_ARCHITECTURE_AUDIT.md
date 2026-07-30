# Oluntir 1.1.0 architecture audit

## Scope

Refactoring of the GrapesJS integration and image selector without changing the export file model or IndexedDB persistence model.

## Architecture

- Bundled GrapesJS 0.23.2 copied unchanged to `vendor/grapesjs/0.23.2/`.
- GrapesJS-specific access is isolated in `editor/integrations/grapesjs/`.
- Image Select owns its complete modal UI under `editor/modules/image-select/`.
- Asset logic is separated under `editor/services/`.
- Stable export paths remain below `assets/user_upload/`.
- Binary image data remains in IndexedDB until project/export materialization.

## Runtime design

The built-in `open-assets` command is replaced after editor initialization by the Oluntir adapter. The replacement opens an Oluntir-owned modal and invokes the original selection callback with the selected GrapesJS asset model. No GrapesJS vendor source or internal Asset Manager DOM is modified.
