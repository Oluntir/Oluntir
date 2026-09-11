# JavaScript-Verhaltensvertrag

DEV_024 überführt statische JavaScript-Evidenz in ein neutrales
`behavior-manifest.json`. Erfasst werden unter anderem Events, Custom Events,
DOM-Selektoren, Klassen-/Dataset-Zustände, Observer, Timer, Netzwerkanfragen
und DOM-Mutationsmuster.

Die Analyse liest Source-Dateien ausschließlich als Text. Sie führt kein
importiertes JavaScript aus und verändert kein Dokument.

## Runtime-Vertrag

Jedes Verhalten erhält:

- eine stabile `behaviorId` und ein neutrales `behaviorType`;
- Evidenz mit Datei und Quellposition;
- erkannte Script- und Style-Abhängigkeiten;
- Seiteneffekte und Reversibilitätsbewertung;
- Runtime-Anforderungen und Aktivierungsstatus.

Scripts sind standardmäßig deaktiviert. Die Frontend-Bridge akzeptiert nur
explizit benannte Dateien, die im Source-Package-Manifest vorhanden sind.
Nicht aufgelöste Style-Abhängigkeiten bleiben für die spätere
Verhaltensmatrix markiert.

## Architekturgrenze

Das Manifest beschreibt Evidenz und Risiken, nicht bereits erlaubte Runtime-
Ausführung. Die JavaScript-Verhaltensmatrix muss vor einer Aktivierung noch
Trigger, Ziel, Zustand, Version, Abhängigkeiten und kompatible Implementierung
auflösen. Automatische Dokumentmutation und Repeat-Synchronisation bleiben
gesperrt.
