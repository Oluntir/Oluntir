# Oluntir workspace architecture

Oluntir 2.2.0 BETA uses `OluntirWorkspaceManager` for large application-owned tools. GrapesJS remains the visual editor engine, while Oluntir owns the visible Image Manager and multi-monitor workspace. The current branch also coordinates the local Source-Package and Bootstrap profile services without recreating the editor.

## Responsibilities

- open and close full editor workspaces;
- hide and restore conflicting quick areas;
- keep workspace modules independent from internal GrapesJS markup;
- coordinate the Image Manager;
- support relocation of editor tool containers through the GrapesJS adapter;
- restore all moved areas on failure or window closure.

## Multi-monitor boundary

`multi-monitor-manager.js` owns the secondary window, stored bounds, status, and fallback. GrapesJS itself is not recreated in the second window. The canvas and editor instance remain in the main window; only approved tool containers are moved and synchronized.

## Persistence

General workspace settings use `indexeddb-settings-store.js`. Asset data remains in its separate versioned database. Preferred and active monitor mode are intentionally different states.
