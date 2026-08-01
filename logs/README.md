# Oluntir logs

Dieser Programmordner dokumentiert die vorgesehenen Logdateinamen. Oluntir schreibt jedoch niemals ungefragt in diesen oder einen anderen Ordner.

Beim ersten Aktivieren des Loggings muss der Benutzer ausdrücklich einen lokalen `logs`-Ordner auswählen und die Schreibberechtigung erteilen. Im tatsächlich gewählten Ordner legt Oluntir zusätzlich `.oluntir-logging.json` ab. Diese Datei nennt Zweck, Speicherort, Freigabeumfang, Log-Level, Datenschutz- und Rotationsparameter.

Grundsätze:

- Logging ist standardmäßig deaktiviert.
- Freigegeben wird ausschließlich der ausgewählte `logs`-Ordner.
- Es erfolgt keine automatische Übertragung.
- Seiteninhalte, Passwörter, Tokens und Zugangsdaten werden nicht protokolliert.
- Sensible Schlüssel und Benutzerpfade werden maskiert.
- Die Freigabe kann jederzeit in Oluntir widerrufen werden.
- Vorhandene Logdateien können jederzeit manuell gelöscht werden.
