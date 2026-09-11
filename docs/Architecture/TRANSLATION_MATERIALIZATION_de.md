# Read-only Materialisierungsplan

Der Materialisierungsplan übersetzt ausgabefähige Matrix-Descriptoren in
abstrakte Operationen wie `materialize-class`, `materialize-attribute` und
`materialize-style`.

Er enthält absichtlich keine GrapesJS-Komponente. `targetRef` bleibt eine
undurchsichtige Referenz und wird nicht als `unitId` interpretiert. Jede
Operation trägt `requiresMutationGate: true`.

Der Plan ist deshalb noch keine Ausführung. Es gibt keine `apply`-Methode und
keine Möglichkeit, über dieses Modul DOM, Dokument oder Editor zu verändern.
