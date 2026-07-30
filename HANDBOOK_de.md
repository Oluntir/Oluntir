> **Sprache:** Deutsch · [English (reference)](HANDBOOK.md)

# Technisches Handbuch Oluntir

**Version:** 1.1.0  
**Status:** Aktuell

## Zweck

Oluntir bearbeitet und exportiert statische Website-Projekte lokal im Browser.

## Projektarten

Klassische Projekte speichern vollständiges HTML. Projekte mit sich inhaltlich wiederholenden Elementen und Bereichen referenzieren zentral gepflegte Inhalte über `<ope-include>`.

## Oluntir und Export

Oluntir ist das interne Dokumentmodell. Der zentrale Resolver erzeugt daraus vollständig aufgelöstes HTML, Apache SSI oder PHP Includes. Exportformat und Exportziel werden getrennt ausgewählt.

## Codeansicht

Die Oluntir-Ansicht ist editierbar und formatiert. Die Ansicht des gerenderten HTML ist schreibgeschützt.

## Validierung

Vor dem Export werden fehlende Ziele, doppelte Pfade und zyklische Referenzen geprüft.

## Einschränkungen

Dateisystemfunktionen hängen vom Browser ab. Browserdaten ersetzen keine externe Projektsicherung.
