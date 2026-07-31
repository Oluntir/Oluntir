# Layout Identities

`editor/js/core/layout-identities.js` provides stable Page, Section, Row, Slot, Component and Repeat IDs. Migration is additive and idempotent: existing IDs are retained, missing IDs are added, and duplicate IDs introduced by copying are replaced only on the duplicate.

The module is framework-neutral. Bootstrap classes are used only for classification. Existing HTML `id` attributes are untouched. `stripInternalAttributes()` removes internal IDs from a final export copy; it never mutates project data.
