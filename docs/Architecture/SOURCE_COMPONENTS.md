# Source-backed Frontend Components

DEV_023 connects the existing Source Analyzer to the existing GrapesJS block
selection. The analyzer creates a `component-catalog.json` from HTML
structures that actually exist in an imported Source Package.

The catalog is not a second component universe. Every entry retains its source
document, source position and evidence. It does not receive a manually chosen
`unitId`; GrapesJS creates that identity when the user deliberately inserts the
block into the project model.

Entries are marked `sourceBacked: true` and
`mutationPolicy: user-insert-only`. Analysis does not execute imported scripts
or change an existing document.

After an imported framework profile is selected, the Frontend Bridge loads the
catalog through the local API and registers the entries as normal GrapesJS
blocks. Local `src`, `href` and `poster` references are mapped to the API file
route for the associated Source Package. Automatic document mutation from an
imported source remains disabled; Repeat synchronization starts only after the
user explicitly defines a repeatable region.

The catalog is regenerated from restored source data after every import or
JSON recovery, so it remains derived data rather than an independent source of
truth.
