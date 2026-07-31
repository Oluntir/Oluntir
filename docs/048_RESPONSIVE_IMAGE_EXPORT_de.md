# Responsiver Bildexport

## Assetstruktur

Oluntir verwaltet hochgeladene Bilder als Variantenverbund:

```text
assets/user_upload/desktop/<datei>
assets/user_upload/tablet/<datei>
assets/user_upload/mobile/<datei>
```

Kompatible ältere Projekte können weiterhin diese Struktur verwenden:

```text
images/uploads/desktop/<datei>
images/uploads/tablet/<datei>
images/uploads/mobile/<datei>
```

## Exportverhalten

Sobald eine Variante im Seitenmodell referenziert wird, nimmt Oluntir alle drei vorhandenen Varianten derselben Datei in den Export auf. Das gilt für HTML, SSI, PHP, Ordner, ZIP und TAR.

## Vollständigkeitsprüfung

Fehlt Desktop, Tablet oder Mobile im internen Asset-Speicher, wird der Export mit einer konkreten Liste der fehlenden Pfade abgebrochen. Dadurch entsteht kein Paket, dessen responsive Darstellung später unbemerkt Bilder verliert.

## Nicht-destruktive Verarbeitung

Der Export liest die Bildreferenzen aus dem GrapesJS-Projektmodell und normalisiert Pfade nur in einer temporären Exportkopie. Canvas-Blob-URLs oder kurzfristige Vorschauzustände werden nicht in das geöffnete Projekt zurückgeschrieben.
