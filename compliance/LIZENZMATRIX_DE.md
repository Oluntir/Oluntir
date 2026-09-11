# Oluntir – Lizenz- und Abhängigkeitsmatrix (normative deutsche Fassung)

Diese deutschsprachige Matrix ist die vollständige normative Quelle. Übersetzungen werden daraus erzeugt und nicht unabhängig gepflegt.

| Komponente | Version | Einsatz | Plattform/Architektur | Lizenz/SPDX | Open Source | Laufzeitlieferung | Drittbestandteile | Pflichten | Offline | Freigabe |
|---|---:|---|---|---|---|---|---|---|---|---|
| Oluntir API Analyzer | Entwicklungsstand | Analyzer, OIR, lokale API, Oberfläche | plattformneutral | MIT | Ja | Ja | keine externen npm-Pakete | MIT-Lizenz beilegen | Ja | freigegeben |
| Node.js | 24.18.0 LTS | portable JavaScript-Laufzeit | Windows x64, Linux x64, macOS x64, macOS ARM64 | MIT einschließlich gebündelter Dritt-Lizenzen | Ja | Ja | siehe vollständige Node.js-LICENSE | vollständige upstream LICENSE unverändert beilegen; Prüfsummen dokumentieren | Ja | technisch freigegeben, Distributionsprüfung je Zielpaket erforderlich |

## Verbindliche Prüffelder je Release-Artefakt

- Herkunft und exakte Version
- Betriebssystem und CPU-Architektur
- SHA-256 des Upstream-Archivs
- SHA-256 der ausgelieferten Runtime-Datei
- vollständiger Lizenztext
- enthaltene Drittbestandteile und deren Lizenzhinweise
- keine Downloads oder Installationen zur Laufzeit
- keine Nutzung einer globalen PATH-Runtime
- Ergebnis des Offline-Starttests
- Ergebnis des Cross-Platform-OIR-Vergleichs
