# Benutzer-Uploads

Dieser Ordner ist der reale Zielort für von Benutzern hochgeladene Bilder.

Während der Bearbeitung bleiben die Bilddaten aus Performance- und Stabilitätsgründen in IndexedDB. Browser dürfen ohne ausdrückliche Freigabe nicht selbständig in den entpackten Oluntir-Quellordner schreiben.

Im Bildmanager steht deshalb die Funktion **„Projektordner verbinden & Uploads schreiben“** bereit. Nach Auswahl des Stammordners `Oluntir-main` werden alle vorhandenen IndexedDB-Bilder in diese Struktur geschrieben:

- `assets/user_upload/desktop/`
- `assets/user_upload/tablet/`
- `assets/user_upload/mobile/`
- `assets/user_upload/original/`

Weitere Uploads werden während derselben Sitzung automatisch in den verbundenen Projektordner synchronisiert. Der Website-Export schreibt verwendete Bilder unabhängig davon weiterhin aus IndexedDB in das Exportpaket.
