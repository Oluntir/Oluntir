# Repeat Engine V2 – Oluntir 2.2.1

`editor/js/core/repeat-engine-v2.js` manages repeat families through stable Oluntir identities. DOM positions, CSS selectors, and changing `unitId` are not identities.

## Central repeat library

2.2.1 replaces per-keystroke live propagation with an Oluntir-owned central model:

1. A repeatable section is registered once as a named repeat family.
2. Every occurrence on a project page is a materialized instance of that family.
3. Direct content editing on page instances is locked.
4. Central editing opens an internal, non-persisted GrapesJS workspace containing only the selected repeat draft.
5. Changes remain in the draft until **Apply to all occurrences** starts one Oluntir transaction and publishes the snapshot to all active instances.

GrapesJS remains the visual editor and component model, but it does not own the project-wide repeat network. Definitions, occurrences, revisions, draft/published snapshots, and transactions belong to Oluntir.

## Project-wide catalog

The library shows the human-readable name, all pages using the family, occurrence count, published revision, and pending draft state. The same catalog can open central editing or materialize another instance through source → target page → insertion position → insert.

## Canvas controls

Normal project pages show an orange top-centered Oluntir toolbar on hover with **Edit** and **Remove**. Remove deletes only that occurrence and updates the central usage list. Header, navigation, and footer stay outside Repeat and remain Shared Content.

## Undo/redo

Instance removal stores definition, instance ID, page, parent identity, insertion index, and rollback snapshot. The repeat history can therefore restore and remove the same occurrence again. Publish transactions are also recorded in a bounded Repeat undo/redo history.

## Persistence and existing projects

Existing 2.1.0 BETA/Alpha projects continue to hydrate from stable Oluntir correlation markers. On first 2.2 use, the former source becomes the initial published central snapshot and its page occurrence is registered as a normal instance. The internal `oluntir-repeat-workspace` page is stripped before project persistence/export; only the Oluntir draft state is persisted.

## Performance model

Central editing performs no project-wide repeat propagation while typing. The expensive component reconciliation runs only once when the user explicitly publishes the draft, avoiding the former near-linear live cost per additional occurrence.

Every materializing Repeat action (`publish`, publish undo/redo, instance insert/remove, and remove undo/redo) also runs inside a short-lived Oluntir project-mutation context. While that context is active, the Shared Content Manager ignores only the internally generated GrapesJS `component:add`/`component:remove` events. A Repeat publish therefore cannot recursively trigger an additional project-wide header/navigation/footer safety scan. Normal structural user events and direct Shared Content updates are not suppressed.
