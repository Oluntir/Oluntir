> **Language:** English (reference) · [Deutsch](SHARED-CONTENT-MANAGER_de.md)

# Shared Content Manager

**Version:** 1.0.0  
**Status:** Stable  
**Last updated:** 2026-07-29

The Shared Content Manager keeps the layout regions of reusable-area projects synchronized across all pages.

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

The manager suppresses its own propagation events to prevent update loops.

## New pages

New pages use the current central header, navigation, and footer. The page-specific `<main>` element is created empty. Existing include files are reused; no duplicate shared content is generated.

## Public browser API

```javascript
window.OluntirSharedContentManager.flushSelected();
window.OluntirSharedContentManager.flushPage(page);
window.OluntirSharedContentManager.applyToPage(page);
window.OluntirSharedContentManager.applyToAll(excludedPage);
```
