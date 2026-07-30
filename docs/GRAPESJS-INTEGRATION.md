# GrapesJS integration in Oluntir 1.1.0

GrapesJS is stored unchanged below `vendor/grapesjs/<version>/`. Oluntir-specific behavior is isolated in `editor/integrations/grapesjs/`.

The Image Select UI is owned by Oluntir and uses only the public command, modal, asset, and page APIs exposed by the adapter. Internal `.gjs-*` markup is not patched.

## Update procedure

1. Add the new vendor version in a separate version directory.
2. Change the central paths in `index.html` only after verification.
3. Update `editor/config/editor-dependencies.js`.
4. Run the compatibility, syntax, reference, import, export, and Image Select regression tests.
5. Keep the previous vendor version until the regression is complete.

## Required checks

- Editor initialization
- `open-assets` adapter command
- Image selection callback
- IndexedDB hydration and export
- Responsive image variants
- Replace while retaining stable paths
- Delete unused and delete all confirmation paths
