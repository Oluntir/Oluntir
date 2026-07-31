# Oluntir 1.2.1 – Projekt-Favicon

Umgesetzt wurde eine projektweite Favicon-Verwaltung in der sekundären GrapesJS-Werkzeugleiste. Aus einer Quelldatei werden clientseitig sieben Dateien erzeugt. Das Projektmodell speichert nur versionierte Metadaten; die Binärdateien werden über den vorhandenen Asset-Store und das portable Projektformat transportiert. Der Export liest die erzeugten Blobs ohne Canvas-Umschaltung und überschreibt ausschließlich die vorgesehenen Favicon-Dateien im Exportpaket.

## Vertragsgrenzen

- Keine Änderung an Seitenkomponenten oder Layout-IDs.
- Keine Änderung an Shared Content oder Include-Positionen.
- Keine Canvas-Seitenauswahl während des Exports.
- Keine Base64-Einbettung in HTML oder Projektmodell.
