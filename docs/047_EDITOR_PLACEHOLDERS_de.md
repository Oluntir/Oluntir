# Editor-Platzhalter auf neuen Seiten

## Verhalten

Neu angelegte Seiten übernehmen die gemeinsamen Projektbereiche Header, Navigation und Footer. Individueller Inhalt der Startseite wird nicht kopiert. Das neue `<main>` bleibt zunächst leer.

Im Editor wird ein leeres `<main>` als kompakte 64-Pixel-Einfügezone mit folgendem Hinweis dargestellt:

```text
+ Hier Section einfügen
```

Der Hinweis soll verständlich machen, dass ein Block oder eine Section in diesen Bereich gezogen werden kann.

## Nach dem Einfügen

Sobald die erste Section eingefügt wurde, ist `<main>` nicht mehr leer. Die Editorregel greift dann nicht mehr und der Platzhalter verschwindet automatisch. Die ursprünglichen Layoutklassen und Flex-Regeln der Seite gelten wieder unverändert.

## Exportvertrag

Der Platzhalter besteht ausschließlich aus editorinternem CSS (`main:empty::before`). Er ist keine GrapesJS-Komponente, wird nicht im `.oluntir`-Projekt gespeichert und erscheint nicht in HTML-, SSI- oder PHP-Exporten.

## Abgrenzung zum unteren Scrollbereich

Die Einfügezone einer leeren Seite liegt innerhalb des leeren `<main>`. Der zusätzliche Scrollnachlauf langer Seiten liegt hinter der vollständigen Seite beziehungsweise hinter dem Footer. Beide Hilfen verändern weder die reale Seitenstruktur noch den Export.
