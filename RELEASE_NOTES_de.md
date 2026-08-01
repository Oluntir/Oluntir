# Release Notes – Oluntir 1.3.0

## Umfang

Version 1.3.0 konsolidiert den internen semantischen Kern, die Shared-Content-Synchronisation, das optionale Logging, die Zustimmung und die Entwicklerdiagnose.

## Relevante Änderungen

- read-only Structure und Relationship Resolver;
- expliziter Project Dependency Graph;
- isolierter Semantic-Action-Engine-Kern;
- Fingerprints, Lazy Sync und gezielte Shared-Content-Updates;
- lokales Opt-in-Logging mit Maskierung und Rotation;
- installationsbezogene Zustimmung;
- Developer Diagnostics Center;
- vereinheitlichte Versionsangaben und Dokumentation.

## Verhalten und Kompatibilität

Bestehende 1.2.x-Projekte werden weiterhin über die vorhandenen Migrations- und Identity-Routinen geladen. Vor einer Migration sollte eine portable Projektsicherung erzeugt werden. Interne Oluntir-Identitäten werden nicht in den finalen HTML-, SSI- oder PHP-Export übernommen.

## Bekannte Grenzen

- Die Semantic Action Engine steuert in 1.3.0 noch nicht alle produktiven Fachmodule.
- Der Dependency Graph wird im Diagnostics Center nur auf ausdrücklichen Befehl aufgebaut.
- Repeat Engine V2 ist als technisches Modell vorhanden; die vollständige sichtbare Verwaltung wiederholbarer Elemente ist für Version 2.0 vorgesehen.
- Ordnerzugriff und Logdateien hängen von der File System Access API und einer Benutzerfreigabe ab.
