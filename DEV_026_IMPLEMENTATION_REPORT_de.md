# DEV_026 – Frameworkprofile und JavaScript-Behavior-Resolver

## Ergebnis

DEV_026 ergänzt die JavaScript-Verhaltenskette um konkrete, versionierte
Frameworkprofile und einen read-only Behavior-Resolver. Aus dem neutralen
Verhaltensplan wird damit eine überprüfbare Zuordnung zu Adapter, Triggern und
Paketabhängigkeiten.

## Umgesetzt

- Bootstrap-4-Profil mit jQuery- und Bootstrap-Abhängigkeit;
- Bootstrap-5-Profil ohne verpflichtende jQuery-Abhängigkeit;
- getrennte `data-toggle`-/`data-bs-toggle`-Signale;
- Adapterauflösung für Collapse, Modal, Tabs, Dropdown und Carousel;
- Bootstrap-5-Offcanvas; Bootstrap-4-Offcanvas bleibt unsupported;
- Statusmodell für aufgelöste, unklare, fehlende oder nicht unterstützte
  Verhaltensweisen;
- `javascript-behavior-resolution.json` je Source Package;
- lokale API und Frontend-Bridge für den Auflösungsbericht;
- Resolver-Vertrag und Validierung gegen unerlaubte Aktivierung;
- Weitergabe der Framework-Version aus dem Source-Package-Manifest;
- Dokumentation in Deutsch und Englisch.

## Kritische Selbstkontrolle

1. **Frontend-Nutzung:** Die Bridge lädt nur JSON über die lokale API. Es gibt
   keine neuen DOM- oder GrapesJS-Schreibzugriffe und keine Änderung an der
   bestehenden Auswahl-/Einfügefunktion.
2. **Abstimmung:** Es wird keine neue sichtbare Runtime-Funktion aktiviert;
   daher ist keine zusätzliche UX-Entscheidung erforderlich.
3. **Abhängigkeiten:** Manifest → Matrix → Resolver → lokale API → Bridge.
   Bootstrap 4/5 werden getrennt geprüft; inkompatible Hauptversionen werden
   nicht stillschweigend akzeptiert.
4. **Universelle Grenze:** Der Resolver ist frameworkneutral aufgebaut, enthält
   aber bewusst nur Bootstrap-Profile als erste konkrete Adapterprofile. Andere
   Frameworks bleiben über `profile-required` korrekt offen für spätere Profile.
5. **Sicherheit und Identität:** Kein Source-JavaScript wird ausgeführt, keine
   Mutation und keine `unitId` vergeben oder verändert.

## Prüfung

Die statischen und gezielten Vertragstests wurden erfolgreich ausgeführt.
Der Browser-/Runtime-Test bleibt entsprechend der Alpha-Gate-Entscheidung
ausgesetzt.
