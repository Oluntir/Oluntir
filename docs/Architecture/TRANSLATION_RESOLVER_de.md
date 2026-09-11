# Translation Resolver

Der Translation Resolver erstellt aus Matrixprofil und Analyzer-Evidenz einen
read-only Übersetzungs- bzw. Compile-Plan. Er entscheidet nicht stillschweigend
zwischen mehreren Regeln: Mehrdeutigkeiten werden als solche zurückgegeben.

Der Compile-Plan enthält unter anderem Regel-ID, kanonische Semantik,
Framework, Evidenz, Ausgabe-Descriptoren, Fähigkeiten, Abhängigkeiten,
Reversibilität und mögliche Informationsverluste.

`resolve`, `compile` und `compileSource` führen keine Materialisierung aus.
Insbesondere gibt es keinen Zugriff auf DOM, GrapesJS, `unitId` oder den
Repeat-Synchronisationsdienst.
