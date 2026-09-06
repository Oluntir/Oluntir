# Release Notes – Oluntir 2.2.0 BETA
- Repeat-library insertion now survives normal page switches: the library panel, selected family, and target page are preserved, and a confirmed orange target reliably enables insertion.

Oluntir 2.2.0 BETA is the new Bootstrap-focused development branch based on 2.1.0 BETA.

## 2.2.0 BETA – key changes

- Central Repeat drafts no longer inherit materialized page-instance lock flags. Text RTE, selection, styling and normal GrapesJS component controls are available in the single-object Canvas.

- Existing projects with missing or incomplete repeat metadata are rebuilt from stable repeat-family markers already present on materialized page instances, keeping the central library usable after migration.
- Startup now labels older stored versions as migration sources into 2.2.0 BETA and persists the current version after opening.

- New **central repeat library** with a complete project catalog and page usage per repeat family.
- Repeat content is no longer propagated on every keystroke. Materialized page instances are locked for direct content editing.
- Central editing uses an internal single-object canvas; draft changes are distributed only through **Apply to all occurrences**.
- Publishing updates all occurrences in one Oluntir-controlled transaction; GrapesJS does not own the project-wide repeat network.
- Orange top-centered hover toolbar on every repeat occurrence with **Edit** and **Remove**. Header/navigation/footer remain Shared Content.
- Removing one occurrence updates the central usage catalog and can be restored through Repeat undo/redo; publish transactions are recorded as well.
- Existing projects migrate into the central published/draft model using stable Oluntir correlations.
- The temporary repeat workspace is stripped before project persistence and export.
- Performance isolation: internally generated `component:add`/`component:remove` events from a controlled Repeat project mutation no longer wake the Shared Content project scan. Direct header/navigation/footer edits and normal structural user actions remain fully observed.
- Central Repeat workspace navigation selects the destination project page before removing the temporary GrapesJS page, so the internal workspace is never deleted while it is still selected.
- Error notifications remain visible longer (12 seconds), while normal notices remain visible for 5 seconds.

