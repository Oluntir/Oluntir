# Projekt-Favicon

## Zweck

Das Projekt-Favicon gilt für alle Seiten und Exportarten. Anwender wählen nur ein Ausgangsbild; Oluntir erzeugt die technischen Varianten automatisch.

## Bedienung

1. Stern-Symbol in der zweiten oberen Werkzeugleiste öffnen.
2. **„Bild auswählen und Favicons erzeugen“** wählen.
3. PNG, JPG, WebP, GIF oder SVG auswählen.
4. Vorschau und Status prüfen.
5. Dialog mit **„Fertig“** schließen und Projekt speichern.

Ist bereits ein Favicon vorhanden, zeigt der Dialog Vorschau, Quelldatei, Dateityp und Zeitpunkt der letzten Änderung. Die Aktion lautet dann **„Favicon durch neues Bild ersetzen“**.

## Erzeugte Dateien

```text
images/favicon.ico
images/favicon-16x16.png
images/favicon-32x32.png
images/favicon-48x48.png
images/apple-touch-icon.png
images/android-chrome-192x192.png
images/android-chrome-512x512.png
site.webmanifest
```

Alle Dateien und die notwendigen `<link>`-Einträge werden in HTML-, SSI- und PHP-Ausgaben übernommen.

## Bildaufbereitung

Empfohlen wird ein quadratisches Motiv mit transparentem Hintergrund und mindestens 512 × 512 Pixeln. Nichtquadratische Bilder werden proportional eingepasst und auf transparenter quadratischer Fläche zentriert; sie werden nicht verzerrt oder abgeschnitten.

## Ersetzen und Entfernen

Beim Ersetzen löscht Oluntir zuerst sämtliche bisher erzeugten Varianten und erzeugt danach den vollständigen Satz neu. **„Favicon entfernen“** entfernt die projektspezifischen Varianten; anschließend gilt wieder das mitgelieferte Standard-Favicon.

## Persistenz

Metadaten und erzeugte Dateien sind Bestandteil des portablen `.oluntir`-Projekts und werden auf einem anderen Rechner zusammen mit den übrigen lokalen Assets wiederhergestellt.
