> **Sprache:** Deutsch · [English (reference)](OLUNTIR-INCLUDE-SYSTEM.md)

# Oluntir Include-System (Oluntir)

## Zweck

Oluntir speichert sich inhaltlich wiederholende Elemente und Bereiche serverneutral. Apache SSI und PHP sind ausschließlich Exportformate und nicht Bestandteil des internen Projektmodells.

## Projektmodell

Ein Projekt wird als klassisches HTML-Projekt oder als Projekt mit sich inhaltlich wiederholenden Elementen und Bereichen angelegt. Bei aktivierten sich inhaltlich wiederholenden Elementen und Bereichen verwaltet Oluntir:

- `includes/layout/header.html`;
- `includes/layout/navigation.html`;
- `includes/layout/footer.html`;
- zusätzliche Dateien unter `includes/sections/`.

## Interne Referenz

```html
<ope-include src="includes/sections/hero.html"></ope-include>
```

## Resolver

Ein zentraler Include-Resolver verarbeitet alle Oluntir-Referenzen. Dadurch wird die Pfad- und Validierungslogik nur einmal implementiert.

## Exportformate

- **HTML ohne sich inhaltlich wiederholende Elemente und Bereiche:** Alle Referenzen werden aufgelöst. Es wird kein `includes/`-Ordner benötigt.
- **Apache SSI:** Seiten erhalten `.shtml`; Referenzen werden als SSI-Direktiven ausgegeben.
- **PHP Includes:** Seiten erhalten `.php`; Referenzen werden als PHP-Includes ausgegeben.

Das interne Oluntir-Format ist kein öffentliches Exportziel.

## Backup

Projektart, Layout-Inhalte, zusätzliche Bereiche, IDs und Seitenzuordnungen werden im Projekt-Backup gespeichert und gemeinsam wiederhergestellt.

## Voraussetzungen

Apache SSI benötigt eine aktivierte SSI-Konfiguration des Webservers. PHP-Ausgaben benötigen eine PHP-Laufzeit.
