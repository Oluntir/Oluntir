# Oluntir 1.3.0 DEV_027 – Framework-specific gallery icon sources

## Cause

The gallery inserted from the upper toolbar generated Font Awesome 5 classes (`fas`) while the Bootstrap 4 editor environment provided Font Awesome 4.7 (`fa`). The BS4 canvas did not load that stylesheet, and BS4 also referenced the BS5 gallery runtime. Export used a shared reduced icon subset for both frameworks.

## Correction

### Bootstrap 4

- Gallery source emits `fa fa-arrows-alt` and `fa fa-download`.
- Canvas loads the native Font Awesome 4.7 stylesheet.
- Export ships and links Font Awesome 4.7 CSS plus its WOFF2 font.
- BS4 uses `pagebuilder-bs4-gallery.js` in canvas and export.

### Bootstrap 5

- Gallery source emits `fas fa-arrows-alt` and `fas fa-download`.
- Canvas and export both load the same dedicated FA5-style Oluntir icon subset.
- BS5 keeps `pagebuilder-bs5-gallery.js`.

Existing gallery action elements are normalized on project load so both zoom and download icons match the active framework profile.
