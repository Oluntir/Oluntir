# DEV030/2.0.1-alpha – Bootstrap-Konsolidierung

Dieser eigenständige Stand basiert auf dem DEV030-Konsolidierungspaket und
bereinigt den produktiven Frameworkkontext auf Bootstrap 4 und Bootstrap 5.
Die Branch-Basis ist damit klar von früheren Alternativ-Framework-Experimenten
getrennt.

## Support-Gate

Source Packages bleiben technisch importier- und analysierbar. Nach der Analyse
erhält jedes Paket jedoch einen Supportstatus:

- `supported`: ausschließlich `bootstrap4` und `bootstrap5`; Editorprofil,
  GrapesJS-Bridge, Source-Blöcke und ausgewählte Runtime-Dateien sind zulässig.
- `analysis-only`: eine nicht als Bootstrap 4/5 klassifizierte Source; generische
  Inventar-, Evidence-, OIR-, Translation- und Behavior-Daten bleiben erhalten,
  aber keine produktive Editoraktivierung und keine Runtime-Materialisierung.

Der Analyzer enthält in diesem Branch nur konkrete Bootstrap-Erkennungs- und
Verhaltensregeln. Es gibt keinen stillen Bootstrap-Fallback für unbekannte
Sources.

Die interne Oluntir-„Repeat Foundation“ ist davon unabhängig. Sie bleibt als
interne Architektur- und Consent-Bezeichnung erhalten. In 2.0.1-alpha ist die
produktive Synchronisation für ausdrücklich definierte Repeat-Instanzen nach
erfolgreicher Vertrags-, Plan- und Schreibprüfung freigeschaltet.

## Bewusst nicht Bestandteil von DEV030

Die bekannte Schwäche der generischen Source-Komponentenerkennung — etwa
schlechte Labels oder verschachtelte Demo-Strukturen — wird in DEV030 nicht
umgebaut. Ein Component Boundary Resolver folgt als eigener Entwicklungsschritt.

Die automatische Ausführung importierter Source-JavaScript-Dateien bleibt
gesperrt. Das ist von der Repeat-Synchronisation des Oluntir-Projektmodells
getrennt:

```text
productiveSynchronizationEnabled = true
automaticSynchronizationEnabled = true
mutationPerformed = false
```

## Rückführungsentscheidung

Es wurde kein alter DEV-Stand zurückkopiert und kein Rollback ausgeführt.
Generische Source-, Evidence-, OIR-, Compiler-, Translation-, Behavior- und
GrapesJS-Module bleiben erhalten. Entfernt wurden nur die konkreten
Fremdframework-Quellen, -Profile, -Fixtures und -Lizenznachweise. Die Änderung
liegt im zentralen Support-Gate für die produktive Aktivierung.
