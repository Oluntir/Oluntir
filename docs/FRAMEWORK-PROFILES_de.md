> **Sprache:** Deutsch · [English (reference)](FRAMEWORK-PROFILES.md)

# Framework-Profile

Oluntir enthält lokale Profile für:

- Bootstrap 4.6.2;
- Bootstrap 5.3.8.

Das gewählte Profil bestimmt verfügbare Komponenten sowie die in Vorschau und Export verwendeten Framework-Dateien. Profilwechsel müssen mit vorhandenen Seiteninhalten geprüft werden, da Bootstrap-Versionen unterschiedliche Klassen und Komponentenstrukturen verwenden.

## Bootstrap-Abdeckung

Die produktiven Profile verwenden ausschließlich Framework-eigenes Markup. Bootstrap 5.3.8 deckt die aktuelle Komponenten-, Formular-, Helper- und Utility-Linie ab. Für Bootstrap 4.6.2 ergänzt Oluntir die noch fehlenden nativen Bereiche **Jumbotron**, **Media object** und **Custom forms**. Entfernte BS4-Komponenten werden im BS5-Profil nicht künstlich emuliert.

Die Source-Analyse unterscheidet die Generationen über gewichtete Evidenz: Versionsbanner bzw. versionierte Pfade, `data-bs-*` gegenüber `data-*`, jQuery als BS4-Runtime-Indiz sowie generationsspezifische Klassen. Ein generischer Dateiname `bootstrap.css` allein genügt nicht für eine Generationszuordnung.


## Importierte Templates

Oluntir 2.3.0 verwendet das integrierte Bootstrap-4.6.2- bzw. Bootstrap-5.3.8-Profil als technische Basis importierter Templates. Template-spezifisches HTML, CSS, Assets und analysierte Runtime-Metadaten liegen unter `templates/<id>/`; die Framework-Ordner werden nicht verändert.
