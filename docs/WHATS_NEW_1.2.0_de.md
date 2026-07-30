# Neu in Oluntir 1.2.0

## Ein echter Zwei-Monitor-Arbeitsbereich

Der Seiten-Canvas bleibt auf dem Hauptmonitor; die vollständige rechte Werkzeugspalte und die Schnellbearbeitung wechseln in ein separates Fenster. Oluntir merkt sich den bevorzugten Modus und kann bei geänderter Umgebung sicher auf einen Monitor zurückkehren.

## Verständlicher Bildmanager-Ablauf

Der Bildmanager arbeitet als Oluntir-Workspace. Vor dem Verbinden des physischen Speichers erklärt ein Infofenster, welcher Ordner gewählt werden muss. Oluntir erstellt oder verwendet `assets/user_upload/` automatisch.

## Modal und echte Lightbox

Modal bleibt ein gerahmter Dialog. Lightbox ist wieder ein dunkler, rahmenloser Bildbetrachter. Beide bieten Bildbezeichnung, Zähler, Tastaturnavigation und Originalbild-Download mit ausreichend Abstand unter den Bedienelementen.

## Stärkere Anwendungsarchitektur

GrapesJS bleibt die Editor-Engine. Oluntir verantwortet Workspaces, Persistenz, Assets, Export und externe Fenster über klare Service- und Adaptergrenzen.
