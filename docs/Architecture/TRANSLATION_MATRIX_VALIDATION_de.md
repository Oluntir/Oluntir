# Übersetzungsmatrix-Validierung

Die Validierung prüft Matrixprofile, Regelkonflikte, Analyzer-Ergebnisse und
Compile-Pläne unabhängig vom Analyzer und Resolver.

Geprüft werden unter anderem:

- ungültige oder doppelte Regeln;
- widersprüchliche Regel-Signaturen;
- inkonsistente Frameworkzuordnung;
- reduzierte Sicherheit und Informationsverlust;
- nicht erkannte Regeln;
- ungelöste Compile-Einträge;
- verbotene Mutation-Flags.

Die Validierung erzeugt ausschließlich Snapshots und Diagnosen. Ein gesetztes
`mutationEnabled` wird als Vertragsfehler behandelt.
