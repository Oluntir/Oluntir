# JavaScript-Behavior-Resolver

DEV_026 löst die frameworkneutralen Einträge aus
`javascript-behavior-plan.json` gegen ein konkretes Frameworkprofil auf.
Der Resolver verbindet damit drei Aussagen:

1. Die Source enthält eine statisch erkannte Verhaltens-Evidenz.
2. Die Evidenz besitzt eine neutrale Oluntir-Semantik.
3. Ein vorhandenes Frameworkprofil kann dafür einen konkreten Adapter und
   seine Paketabhängigkeiten benennen.

## Profile

| Profil | Signale | Abhängigkeiten | Adapter |
|---|---|---|---|
| Bootstrap 4 | `data-toggle="..."`, `data-ride="carousel"` | jQuery, Bootstrap-JavaScript, Bootstrap-CSS | Collapse, Modal, Tab, Dropdown, Carousel |
| Bootstrap 5 | `data-bs-toggle="..."`, `data-bs-ride="carousel"` | Bootstrap-JavaScript, Bootstrap-CSS | Collapse, Modal, Tab, Dropdown, Carousel, Offcanvas |

Bootstrap 4 und Bootstrap 5 werden nicht über gemeinsame Trigger geraten.
Eine explizite Profil-/Versionskombination mit inkompatibler Hauptversion wird
abgelehnt. Bei Bootstrap 4 ist Offcanvas als nicht unterstützt markiert.

## Auflösungsstatus

- `resolved`: Trigger und erforderliche Dateien wurden gefunden; ein Adapter ist
  eindeutig zugeordnet.
- `profile-required`: Für eine Interaktion fehlt ein passendes Profil.
- `trigger-unresolved`: Das Profil ist bekannt, aber das erwartete Markupsignal
  fehlt.
- `invalid-dependency`: Eine erforderliche Script- oder Style-Gruppe fehlt.
- `unsupported-by-profile`: Das Profil bietet keinen Adapter für das Verhalten.
- `evidence-only`: technische Runtime-Evidenz ohne freigegebenen konkreten
  Adapter, zum Beispiel Observer, Timer oder Netzwerkanfrage.

`resolved` bedeutet ausschließlich „planerisch zugeordnet“. Der Resolver führt
keinen JavaScript-Code aus und schreibt nichts in DOM, GrapesJS-Projektmodell
oder Storage.

## Gate und Bridge

Jedes Ergebnis enthält weiterhin:

- `activation.allowed: false`;
- `runtime.enabled: false`;
- `runtimeActivation: false`;
- `documentMutation: false`;
- `repeatSynchronization: false`;
- `unitIdUntouched: true`.

Die Datei `javascript-behavior-resolution.json` wird im jeweiligen Source-
Package erzeugt. Die Frontend-Bridge lädt sie ausschließlich über die lokale
API. Eine spätere Ausführung benötigt ein separates Runtime-/Action-Gate und
ist nicht Bestandteil von DEV_026.
