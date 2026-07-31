# Layout-Identitäten

`editor/js/core/layout-identities.js` stellt stabile Page-, Section-, Row-, Slot-, Component- und Repeat-IDs bereit. Die Migration ist ergänzend und idempotent: vorhandene IDs bleiben erhalten, fehlende werden ergänzt und beim Kopieren entstandene Duplikate werden ausschließlich an der Kopie ersetzt.

Das Modul ist framework-neutral. Bootstrap-Klassen dienen nur der Klassifikation. Vorhandene HTML-`id`-Attribute bleiben unangetastet. `stripInternalAttributes()` entfernt interne IDs erst aus einer finalen Exportkopie und verändert niemals Projektdaten.
