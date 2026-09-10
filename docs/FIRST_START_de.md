# Erster Start – Oluntir 2.3.0

1. Oluntir 2.3.0 in einen eigenen Ordner entpacken.
2. `index.html` in einem aktuellen Chromium-basierten Desktop-Browser öffnen.
3. **Ein Monitor**, **Zwei Monitore** oder die Startabfrage wählen.
4. Ein Projekt erstellen oder eine portable `.oluntir`-Sicherung wiederherstellen.
5. Vor umfangreicher Arbeit das Speichern prüfen und eine externe Sicherung erstellen.

## Zusätzliche Bootstrap-Templates

Für zusätzliche Bootstrap-4-/Bootstrap-5-Templates wird nicht die normale Editoroberfläche, sondern `template-manager.html` verwendet:

1. Template-ZIP und Namen wählen.
2. Template analysieren.
3. Analyse prüfen.
4. den `templates`-Ordner der aktuellen Oluntir-Installation auswählen.
5. Template aufnehmen und Verifikation abwarten.
6. Oluntir über den grünen Abschlussbutton öffnen.

Importierte Templates werden ausschließlich unter `templates/<name>/` gespeichert. Die Standardprofile unter `frameworks/bootstrap4` und `frameworks/bootstrap5` bleiben unverändert.

## Browserberechtigungen

Ordnerzugriff, Pop-ups und Bildschirmplatzierung werden vom Browser kontrolliert. Die erste Auswahl des `templates`-Ordners muss im Browserdialog bewusst erfolgen; Chromium darf einen absoluten lokalen Pfad nicht zuverlässig automatisch vorpositionieren. Bereits freigegebene Handles können innerhalb der Verwaltung wiederverwendet werden.

## Projektordner

Der Bildmanager kann einen physischen Projektordner verbinden. Den Projektstamm auswählen. Oluntir verwendet oder erstellt automatisch `assets/user_upload/`; diesen Unterordner nicht direkt auswählen.
