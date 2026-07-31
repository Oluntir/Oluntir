# Oluntir 1.2.1 Implementation Audit

## Preserved contracts
- GrapesJS Project Data remains the persistent source.
- Existing `getRenderedCanvasHtmlForExport()` and `normalizeExportHtml()` remain in place.
- `OluntirIncludes.preparePage()` still derives HTML, SSI and PHP outputs.
- Shared Content and OPE includes are not migrated or reconstructed by identities.

## Added modules
- `layout-identities.js`: classification, additive migration, duplicate repair, lookup and export sanitizing.
- `repeat-engine-v2.js`: identity-based definitions, target resolution and merge/add behavior.

## Known boundary
The 1.2.1 release exposes Repeat Engine V2 as a technical JavaScript API. The prompt explicitly excludes new badges, tutorials and additional UI. Browser-based manual regression of real `.oluntir` fixtures remains required before publishing.
