# DEV_028 – Universelle GrapesJS-Bridge

## Ergebnis

Das universelle, source-gebundene Frameworkprofil ist über eine eigene Adapter-Schicht an den persistenten GrapesJS-Editor angeschlossen.

- lokales Source-Profil mit `sourcePackageId`, `sourceHash` und `profileId`;
- lokale CSS-/Asset-Verweise über die Source-Package-API;
- quellengebundene Source-Komponenten als auswählbare GrapesJS-Blöcke;
- bestehende Oluntir-Blöcke und sichtbare Frontend-Werkzeuge unverändert;
- Nutzung des normalen GrapesJS-Projektmodells für Speichern, Laden sowie Undo/Redo;
- Blockierung bei Profil-/Package-/Hash-Abweichungen.

## Grenzen

DEV028 ist eine kontrollierte Nutzungsfreigabe, keine automatische Dokumentübersetzung:

- `mutationPerformed: false`
- `executionEnabled: false`
- `documentMutation: false`
- `repeatSynchronization: false`
- Source-JavaScript wird nicht automatisch ausgeführt;
- keine Vergabe oder Überschreibung von `unitId`;
- Einfügung ausschließlich durch den Benutzer über den GrapesJS-BlockManager.

Das Source Package bleibt die Quelle der Wahrheit. Das Profil wird nicht in die globale Framework-Matrix übernommen und darf nicht für andere Packages oder Source-Hashes wiederverwendet werden.

## Selbstkontrolle

- JavaScript-Syntaxprüfung bestanden;
- Adapter-Vertragstest und vollständige statische Testsuite bestanden;
- Strukturprüfung bestanden;
- Browser-/Runtime-Test weiterhin bewusst nicht ausgeführt.

Der bekannte Logger-Mock-Hinweis `directory.getFileHandle is not a function` tritt weiterhin nur während des bestehenden Tests auf; der zugehörige Test besteht.
