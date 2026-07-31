# Shared Content and Includes

Shared header, navigation and footer synchronization remains owned by `shared-content-manager.js`. Reusable sections and OPE include positions remain owned by `includes.js`. Layout identities do not move, duplicate or remove these structures.

Export still renders the selected GrapesJS page, normalizes it and then calls `OluntirIncludes.preparePage()` for HTML, SSI or PHP. Internal identity attributes are removed immediately before that call from the export string only.
