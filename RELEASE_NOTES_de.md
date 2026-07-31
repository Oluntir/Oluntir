# Release Notes – Oluntir 1.2.1

**Veröffentlichung:** 31.07.2026  
**Release-Typ:** Stabilitäts- und Architekturrelease

## Überblick

Oluntir 1.2.1 führt ein stabiles internes ID-System ein und schafft damit die belastbare Grundlage für modellbasierte Synchronisation und Repeat Engine V2. Gleichzeitig wurde die bestehende Export-, Bild-, Rich-Text- und Seitenlogik gegen reale Bestandsprojekte stabilisiert. Der sichtbare Funktionsumfang bleibt bewusst vertraut.

## Höhepunkte

### Stabile Projekt- und Layout-Identitäten

Seiten und geeignete GrapesJS-Komponenten erhalten dauerhafte interne IDs. Diese IDs überleben Speichern, Import und erneutes Öffnen, überschreiben keine normalen HTML-IDs und werden nicht als Exportquelle verwendet. Kopierte Komponenten erhalten neue interne Identitäten.

### Projekt-Favicon ohne Spezialwissen

Über das Stern-Symbol in der zweiten Werkzeugleiste genügt eine einzige PNG-, JPG-, WebP-, GIF- oder SVG-Datei. Oluntir erzeugt daraus automatisch:

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

Ein vorhandenes Favicon wird mit Vorschau und Quelldaten erkannt. Beim Ersetzen werden die bisherigen Varianten vollständig verworfen.

### Verständliche neue Seiten

Neue Seiten übernehmen die gemeinsamen Bereiche des Projekts, aber keinen individuellen Inhalt der Startseite. Ein leeres `<main>` zeigt im Editor **„+ Hier Section einfügen“**. Der Hinweis verschwindet nach der ersten Section und erscheint nicht im Export.

### Stabiler Export

HTML, SSI und PHP werden direkt aus dem GrapesJS-Projektmodell erzeugt. Der Export wechselt nicht mehr sichtbar zwischen Seiten und schreibt keine kurzfristigen Canvas-Zustände zurück. Dadurch bleiben Bilder, Reihenfolge und Include-Positionen stabil.

### Responsive Bildpakete

Verwendete Uploadbilder werden mit Desktop-, Tablet- und Mobile-Variante exportiert. Ein unvollständiger Variantenbestand führt zu einer klaren Fehlermeldung statt zu einem unvollständigen Website-Paket.

## Aktualisierung von 1.2.0

1. Projekt in 1.2.0 sichern.
2. Oluntir 1.2.1 in einen neuen Ordner entpacken.
3. Bestehendes `.oluntir`-Projekt öffnen.
4. Seiten, Shared Content, Bilder und Exporte prüfen.
5. Projekt explizit speichern; dadurch werden fehlende interne IDs dauerhaft übernommen.
6. HTML-, SSI- und PHP-Export mindestens einmal testen.

Die Migration verändert keine sichtbaren Inhalte und ist idempotent.

## Bekannte Grenze

Repeat Engine V2 ist technisch vorbereitet, besitzt in 1.2.1 aber noch keine vollständige sichtbare Verwaltungsoberfläche.
