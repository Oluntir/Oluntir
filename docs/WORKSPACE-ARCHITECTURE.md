# Oluntir workspace architecture

Starting with version 1.1.0, Oluntir uses its own workspace manager for larger tools. GrapesJS remains the editor engine but no longer supplies the visible image-manager interface.

## Principles

- `OluntirWorkspaceManager` opens and closes large tools.
- Quick setup and quick editing are hidden while a workspace is active.
- Closing restores the editor interface.
- Modules do not depend on internal `.gjs-*` structures.
- The image manager is the first workspace module.

## Image manager

The image manager uses the asset services and IndexedDB. For large collections, only the first 60 cards are created. Additional cards are appended while scrolling. Preview images load shortly before they enter the visible area.
