# JavaScript-Verhaltensmatrix

DEV_025 übersetzt das aus DEV_024 abgeleitete
`behavior-manifest.json` in einen frameworkneutralen
`javascript-behavior-plan.json`.

## Ebenentrennung

| Ebene | Aussage |
|---|---|
| Behavior Manifest | Dieses Verhalten wurde in der Source statisch nachgewiesen. |
| Behavior Matrix | Dieses Verhalten besitzt eine neutrale Semantik und ist planbar. |
| Frameworkprofil | Eine konkrete Framework-Implementierung ist aufgelöst. |
| Runtime-Gate | Die Ausführung wurde ausdrücklich freigegeben. |

Die Matrix kennt neutrale Verhaltensarten wie
`interaction.accordion.toggle`, `interaction.modal.toggle`,
`interaction.tabs.select`, `interaction.dropdown.toggle`,
`interaction.carousel.navigate` und `interaction.offcanvas.toggle`. Auch
technische Runtime-Evidenzen wie Events, Observer, Timer, Netzwerkanfragen und
DOM-Mutationsmuster werden eingeordnet.

## Verhaltensplan

Jeder Plan-Eintrag enthält:

- `behaviorId` und `behaviorType`;
- kanonische neutrale `semanticId`;
- erkannte Zustände;
- Quell-Evidenz;
- erforderliche Script-Dateien und noch offene Style-Abhängigkeiten;
- Status der Frameworkprofilauflösung;
- expliziten Aktivierungsstatus.

Ein erkannter Eintrag ist in DEV_025 noch nicht ausführbar. `runtime.enabled`
und `activation.allowed` bleiben false. Ein Frameworkprofil, die vollständige
Abhängigkeitsauflösung und die späteren Runtime-/Action-Gates sind vor einer
Aktivierung erforderlich.

Die Matrix verändert weder das GrapesJS-Projektmodell noch `unitId` und führt
keine automatische Synchronisation aus.
