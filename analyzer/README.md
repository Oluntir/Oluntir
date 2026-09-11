# Oluntir Analyzer – 2.3.0

Der Analyzer ist die statische Analysebasis für Bootstrap-4-/Bootstrap-5-Quellen. In 2.3.0 wird die produktive Template-Aufnahme über den modularen Browser-Compiler und `template-manager.html` geführt; die portable Analyzer-Runtime bleibt für Diagnose-, Entwicklungs- und Source-Analyseaufgaben erhalten.

## Produktgrenze

- Bootstrap 4 und Bootstrap 5 sind die produktiv unterstützten Frameworkfamilien.
- Fremdframeworks dürfen analysiert werden, werden aber nicht automatisch als Bootstrap integriert.
- Templateimporte verändern `frameworks/` nicht.
- Produktiv aufgenommene Templates liegen unter `templates/<name>/`.
- HTML-, CSS-, Asset- und JavaScript-Analyse erfolgt statisch.
- Importiertes Template-JavaScript wird nicht im bearbeitbaren GrapesJS-Canvas ausgeführt.
- Aktive Fremd-Embeds werden im Editor isoliert.

## Analyseziele

Der Analyzer/Compiler ermittelt u. a. Bootstrap-Version, Primär-/Hilfsseiten, semantische Bereiche, Bausteinfamilien, Repeat-Kandidaten, Asset-Beziehungen, Script-Bibliotheken, Dependencies und DOM-/Section-Zuordnungen.

Siehe auch `../docs/TEMPLATE-SYSTEM_de.md` und `../docs/ARCHITECTURE_de.md`.
