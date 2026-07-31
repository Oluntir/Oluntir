# Oluntir 1.2.1 – RTE cursor stability fix

## Fehlerbild

Während direkter Texteingabe im GrapesJS-Canvas sprang die Einfügemarke nach dem ersten oder zweiten Zeichen an den Zeilenanfang. Dadurch wurde beispielsweise aus `Hallo` die sichtbare Folge `ollaH`. In Shared Footer-/Header-Inhalten trat derselbe Effekt auf.

## Ursache

`component:update` wurde bei jedem eingegebenen Zeichen ausgelöst. Darauf reagierten zwei modellverändernde Automatismen:

1. Die allgemeine Projektpersistenz schrieb nach kurzer Verzögerung Canvas-Inhalte zurück in das Komponentenmodell.
2. Der Shared-Content-Manager las Header/Footer aus und übertrug geänderte Regionen auf alle Seiten.

Beide Vorgänge können das aktive `contenteditable`-Element ersetzen und damit die Browserauswahl beziehungsweise Cursorposition verlieren.

## Korrektur

- Globaler RTE-Zustand über `rte:enable` und `rte:disable`.
- Keine automatische Projektpersistenz während aktiver Texteingabe.
- Keine Shared-Content-Propagation während aktiver Texteingabe.
- Einmaliger Shared-Content-Flush und Projektsnapshot nach `rte:disable`.
- `component:update` sichert weiterhin Bildkomponenten zeitnah, aber keine Textkomponenten pro Tastendruck.

## Vertrag

Die Korrektur verändert weder HTML-/SSI-/PHP-Export noch Layout-IDs oder Bildpfade. Sie verhindert ausschließlich modellverändernde Hintergrundläufe während einer aktiven Rich-Text-Sitzung.
