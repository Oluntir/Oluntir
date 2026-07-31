# Oluntir 1.2.1 – Responsive Upload Export Fix

## Fehler
Der Export sammelte nur die im Seitenmarkup unmittelbar referenzierte Uploaddatei. Bei normalen Bildkomponenten war dies typischerweise `assets/user_upload/desktop/<datei>`. Die beim Upload erzeugten Varianten unter `tablet/` und `mobile/` wurden deshalb nicht in das Exportpaket übernommen.

## Korrektur
Nach dem Einsammeln aller tatsächlich referenzierten Uploadpfade wird jeder Pfad aus den Verzeichnissen `desktop`, `tablet` oder `mobile` auf seine vollständige responsive Dreiergruppe erweitert. Die Regel gilt sowohl für `assets/user_upload/` als auch für kompatible Legacy-Pfade unter `images/uploads/`.

## Vertrag
Ein verwendetes responsives Bild wird immer gemeinsam exportiert als:

- Desktop
- Tablet
- Mobile

Fehlende Varianten führen zu einem verständlichen Exportabbruch und nicht zu einem unvollständigen Paket.
