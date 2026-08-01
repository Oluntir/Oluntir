> **Sprache:** Deutsch · [English](049_STRUCTURE_RESOLVER.md)  
> **Entwicklungsstand:** Oluntir 1.3.0

# Structure Resolver

Der Structure Resolver liest vollständige semantische Strukturen aus dem GrapesJS-Projektmodell. Er ergänzt die zuvor vorhandene Auflösung einzelner Komponenten und Kontexte um einen unveränderlichen Struktur-Snapshot für eine Seite oder das gesamte Projekt.

## Zweck

Der Resolver beantwortet ausschließlich strukturelle Fragen:

- Welche Parent-/Child-Beziehungen bestehen?
- Welche semantischen Bereiche und Strukturarten wurden erkannt?
- Welche Rollen besitzen die erkannten Knoten?
- Welche Cardinality-Angaben gelten?
- Welche stabilen Oluntir-Identitäten gehören zu den Knoten?

Er verändert weder Komponenten noch Attribute, Klassen, Inhalte oder die Seitenreihenfolge.

## Einordnung

```text
Semantic Dictionary
        ↓
Identity Resolver
        ↓
Context Resolver
        ↓
Layout Identities
        ↓
Structure Resolver
        ↓
Semantic Validator
        ↓
Repeat Engine / Shared Content / Export
```

Der Structure Resolver enthält keine Framework-, Editor-, Export- oder Korrekturlogik. Bootstrap-4- und Bootstrap-5-Besonderheiten werden nicht in dieser Schicht behandelt.

## API

Die browserseitige API wird als `OluntirStructureResolver` bereitgestellt:

```javascript
const pageStructure = OluntirStructureResolver.resolvePage(page);
const projectStructure = OluntirStructureResolver.resolveProject(editor);
```

Das CommonJS-Modul exportiert dieselben Funktionen für automatisierte Tests.

### `resolvePage(page)`

Erzeugt einen read-only Snapshot einer Seite mit:

- `schemaVersion`
- `scope: "page"`
- `pageId`
- `roots`
- flacher `nodes`-Liste
- `recognizedStructures`
- `semanticAreas`
- `roles`
- `cardinality`

Jeder Strukturknoten enthält:

- `identity`
- `pageId`
- `parentIdentity`
- `depth`
- `structuralKind`
- `componentType`
- `role`
- `cardinality`
- `capabilities`
- `children`

### `resolveProject(editor)`

Löst alle über `editor.Pages.getAll()` verfügbaren Seiten auf und liefert:

- `schemaVersion`
- `scope: "project"`
- `pageCount`
- `pages`

## Unveränderlichkeit

Alle zurückgegebenen Snapshots, Knoten, Kindlisten, Capabilities und Zusammenfassungen werden mit `Object.freeze()` geschützt. Der Resolver schreibt nicht in das GrapesJS-Modell und führt keine Persistierung aus.

## Integrationsstatus

Version 1.3.0 stellt die gemeinsame Strukturauflösung als eigenständige Kern-API bereit. Repeat Engine, Shared Content, Export und Semantic Validator werden in diesem Entwicklungsstand noch nicht auf die API umgestellt. Dadurch bleibt die Einführung klein, testbar und regressionsarm.

## Tests

`tests/test-structure-resolver.js` prüft insbesondere:

- verschachtelte Parent-/Child-Beziehungen,
- Tiefe und Elternidentitäten,
- Struktur-, Bereichs-, Rollen- und Cardinality-Zusammenfassungen,
- Projektauflösung über mehrere Seiten,
- Unveränderlichkeit der Ergebnisse,
- unveränderten GrapesJS-Komponentenbaum nach der Auflösung.

Der anschließende lokale Anwendungstest bestätigte eine problemlose Benutzung und einen weiterhin funktionierenden Export.
