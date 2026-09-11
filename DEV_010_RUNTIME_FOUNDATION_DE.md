# DEV_010 – Portable Node-Runtime Foundation

## Ziel

Der Analyzer verwendet ausschließlich eine mitgelieferte, je Plattform geprüfte Node.js-Runtime. Eine installierte Node-Version oder ein PATH-Eintrag ist weder erforderlich noch zulässig.

## Umgesetzt

- Plattformmanifest für Windows x64, Linux x64, macOS x64 und macOS ARM64
- feste Node.js-LTS-Version und offizielle Upstream-Prüfsummen
- plattformbezogene Startdateien ohne PATH-Fallback
- zufälliger lokaler Port statt festem Port 4177
- Sitzungstoken für alle lokalen API-Aufrufe
- Bindung ausschließlich an `127.0.0.1`
- Content Security Policy und weitere lokale HTTP-Sicherheitsheader
- Integritätsprüfung der ausgelieferten Runtime
- Release-Buildwerkzeug für Download, SHA-256-Prüfung, Entpacken und Lizenzübernahme
- normative deutsche Lizenzmatrix

## Auswirkungen

Der frühere Fehler „Node.js wurde nicht gefunden“ wird in vollständigen Distributionspaketen beseitigt. Fehlt die mitgelieferte Runtime, wird ausdrücklich ein unvollständiges oder beschädigtes Oluntir-Paket gemeldet. Auf eine Systeminstallation wird nicht zurückgegriffen.

## Noch kein fertiges Plattformrelease

Dieses Quellpaket enthält bewusst keine ungeprüft aus der Entwicklungsumgebung kopierte Runtime. Die offiziellen Binärartefakte werden je Zielsystem durch den Release-Build aus den im Manifest festgelegten Upstream-Paketen erzeugt. Erst danach ist das jeweilige Plattformpaket test- und auslieferungsfähig.
