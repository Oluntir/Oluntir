# Projektmigration 1.2.1

Beim Öffnen eines 1.2.0-Projekts wird zuerst das vollständige GrapesJS-Modell geladen. Danach werden fehlende Identitäten ergänzt, ohne Klassen, HTML-IDs, Inhalte, Bilder, Links, Shared Content oder Includes zu verändern. Der migrierte Zustand wird erst beim nächsten expliziten oder automatischen Speichern persistent.

Die Migration ist idempotent. Beim zweiten Laden bleiben alle Identitäten unverändert. Durch kopierte Komponenten entstandene doppelte Identitäten werden durch neue IDs ausschließlich im Duplikat-Unterbaum aufgelöst.
