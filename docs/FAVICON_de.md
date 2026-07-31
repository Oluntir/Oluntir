# Projekt-Favicon in Oluntir 1.2.1

Oluntir kann aus einer einzigen Bilddatei automatisch alle gebräuchlichen Favicon-Varianten erzeugen. Die Einstellung gilt für das gesamte Projekt und wird in der `.oluntir`-Projektdatei gespeichert.

## Favicon festlegen

1. Öffne das Projekt in Oluntir.
2. Klicke in der zweiten oberen Werkzeugleiste auf das Stern-Symbol **„Projekt-Favicon festlegen“**.
3. Klicke auf **„Bild auswählen und Favicons erzeugen“**.
4. Wähle eine PNG-, JPG-, WebP-, GIF- oder SVG-Datei aus.
5. Warte auf die Meldung, dass die Favicon-Varianten erzeugt und gespeichert wurden.
6. Kontrolliere die Vorschau und schließe den Dialog mit **„Fertig“**.
7. Speichere das Projekt oder exportiere es direkt.

## Empfohlenes Ausgangsbild

Am besten eignet sich ein quadratisches Bild mit transparentem Hintergrund und mindestens 512 × 512 Pixeln. Nichtquadratische Bilder werden proportional verkleinert und mittig auf einer transparenten quadratischen Fläche platziert. Das Bild wird nicht verzerrt oder abgeschnitten.

## Automatisch erzeugte Dateien

Oluntir erzeugt:

```text
images/favicon.ico
images/favicon-16x16.png
images/favicon-32x32.png
images/favicon-48x48.png
images/apple-touch-icon.png
images/android-chrome-192x192.png
images/android-chrome-512x512.png
```

Die benötigten `<link>`-Einträge werden automatisch in jede exportierte HTML-, SSI- und PHP-Seite geschrieben. Die Dateien werden bei Ordner-, ZIP- und TAR-Export mit ausgegeben.

## Favicon ersetzen

Öffne den Favicon-Dialog erneut und wähle ein anderes Bild. Alle Varianten werden neu erzeugt und ersetzen die bisherigen Projektdateien.

## Favicon entfernen

Klicke im Dialog auf **„Favicon entfernen“**. Oluntir entfernt die projektweit erzeugten Varianten und verwendet beim Export wieder das mitgelieferte Standard-Favicon.

## Projektübertragung

Das Favicon ist Bestandteil des portablen `.oluntir`-Projekts beziehungsweise Projektbackups. Beim Öffnen auf einem anderen Computer werden die erzeugten Dateien zusammen mit den übrigen lokalen Assets wiederhergestellt.
