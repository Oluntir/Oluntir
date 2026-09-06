> **Language:** English (reference) · [Deutsch](SHARED-CONTENT-MANAGER_de.md)

# Shared Content Manager

**Version:** 2.1.0 BETA
**Status:** BETA
**Stable baseline:** Oluntir 1.3.1
**Last updated:** 2026-09-06

The Shared Content Manager keeps the layout regions of projects with recurring content elements and regions synchronized across all pages.

## Managed regions

- header;
- navigation;
- footer.

Each region has one central representation in the Oluntir project state. Pages display resolved copies while they are edited, but changes are written back to the central state and propagated to every other page.

## Synchronization lifecycle

1. GrapesJS reports a component change.
2. The manager reads the current page layout regions.
3. Changed regions are stored through `OluntirIncludes.updateLayoutRegions()`.
4. All other pages are updated from the central state.
5. Before page selection, deletion, save, or creation, the selected page is flushed again.

The manager suppresses its own propagation events. In 2.1.0 BETA a component commit exits immediately when the central Shared Content fingerprint did not change, preventing target mutations and extra `editor.store()` calls for redundant GrapesJS events.

## New pages

New pages use the current central header, navigation, and footer. The page-specific `<main>` element is created empty. Existing include files are reused; no duplicate shared content is generated.

## Public browser API

```javascript
window.OluntirSharedContentManager.flushSelected();
window.OluntirSharedContentManager.flushPage(page);
window.OluntirSharedContentManager.applyToPage(page);
window.OluntirSharedContentManager.applyToAll(excludedPage);
```
