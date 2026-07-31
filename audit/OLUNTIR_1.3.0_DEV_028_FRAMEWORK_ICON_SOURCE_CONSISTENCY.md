# DEV_028 – Framework-specific gallery icon sources

- Bootstrap 4 uses only Font Awesome 4.7 (`fa`).
- Bootstrap 5 uses only Font Awesome 5 Free solid (`fas`).
- Removed all historical SVG, mask, pseudo-element, Unicode and CSS-geometry gallery icon overrides.
- Embedded the FA4 WOFF2 in the BS4 stylesheet to make GrapesJS iframe and `file://` rendering independent of relative font paths.
- Replaced the BS5 placeholder/Arial compatibility CSS with an actual Font Awesome stylesheet and bundled webfonts.
- Rebuilt the embedded export asset bundle.
