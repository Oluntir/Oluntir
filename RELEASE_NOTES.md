# Release Notes – Oluntir 1.2.1

**Release date:** 2026-07-31  
**Release type:** Stability and architecture release

## Overview

Oluntir 1.2.1 introduces stable internal identities as the foundation for model-based synchronisation and Repeat Engine V2. The existing export, image, rich-text, and page workflows were also hardened against real existing projects while keeping the visible editor workflow familiar.

## Highlights

### Stable project and layout identities

Pages and suitable GrapesJS components receive persistent internal IDs. They survive save, import, and reload, never overwrite ordinary HTML IDs, and are not used as the export source. Copied components receive new internal identities.

### Project favicon without specialist knowledge

The star icon in the secondary toolbar accepts one PNG, JPG, WebP, GIF, or SVG file. Oluntir automatically creates ICO, browser PNGs, Apple Touch Icon, Android icons, and `site.webmanifest`. Existing favicon state is recognised and displayed; replacement discards all previous generated variants.

### Clear new-page workflow

New pages inherit shared project regions but not page-specific content from the start page. An empty `<main>` displays **“+ Insert section here”** in the editor. The hint disappears after the first section and is never exported.

### Stable export

HTML, SSI, and PHP are generated directly from the GrapesJS project model. Export no longer visibly switches pages or writes transient Canvas state back into the project, preserving images, order, and include placement.

### Responsive image packages

Used upload images are exported together with desktop, tablet, and mobile variants. Missing variants produce an explicit error instead of an incomplete website package.

## Updating from 1.2.0

1. Back up the project in 1.2.0.
2. Extract Oluntir 1.2.1 into a new directory.
3. Open the existing `.oluntir` project.
4. Review pages, shared content, images, and exports.
5. Save explicitly to persist newly added internal IDs.
6. Test HTML, SSI, and PHP export at least once.

The migration does not alter visible content and is idempotent.

## Known limitation

Repeat Engine V2 is technically prepared but does not yet provide a complete visible management interface in 1.2.1.
