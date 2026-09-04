# Quellengebundene Frameworkprofile

DEV_027 führt quellengebundene Profile für die universelle Übersetzungs-API
ein. Ein Profil wird nach jeder Source-Analyse neu erzeugt. Es ist kein
globales Frameworkwissen und darf nicht für andere Source Packages verwendet
werden.

## Identität und Gültigkeit

Jedes Profil ist an folgende Werte gebunden:

```text
sourcePackageId + sourceHash + profileId
```

Der `sourceHash` umfasst die sortierten Pfade und Inhalte der analysierten
Source-Dateien. Ändert sich die Source oder wird eine neue Frameworkversion
importiert, entsteht ein neues Profil. Das alte Profil darf nur noch für einen
vergleichenden Update-Bericht verwendet werden.

## Automatische Analyse

Der Profile-Builder sammelt unter anderem:

- HTML-, PHP-, Twig-, Vue-, Svelte-, Astro-, JSX-, TSX- und MDX-Klassen;
- CSS-/SCSS-Deklarationen und Selektoren;
- Utility-Strukturen für Layout, Abstände, Ausrichtung, Typografie und
  Sichtbarkeit;
- responsive, Status- und Dark-Mode-Varianten;
- Framework- und Versionshinweise aus Source und Analyse-Evidenz;
- unbekannte Klassen und Merkmale mit ihrer Quell-Evidenz.

Aus diesen Daten werden nur solche Matrixregeln erzeugt, die durch die Source
belegt sind. Nicht erkennbare Merkmale landen in `unknownFeatures` und werden
nicht stillschweigend umgesetzt.

## Übersetzung

`source-framework-profile.json` besitzt dieselbe Regelstruktur, die die
Übersetzungs-API für einen Matrixplan benötigt. Die Editor-API erhält das
Profil ausdrücklich als Eingabe. Es wird nicht in die globale Bootstrap-
Registry eingetragen.

Vor jeder Nutzung werden Package-ID und Source-Hash geprüft. Ein fremdes,
veraltetes oder manipuliertes Profil wird abgewiesen.

## Manuelle Ergänzungen

Eine spätere manuelle Übersetzung wird ebenfalls an Source Package und Hash
gebunden gespeichert. Sie ergänzt nur die unbekannte Evidenz dieses Profils;
sie verändert weder globale Frameworkregeln noch andere Versionen.

Alle Ergebnisse bleiben in DEV_027 read-only. Es gibt keine Source-Ausführung,
keine automatische GrapesJS-Mutation, keine `unitId`-Vergabe und keine
Synchronisation.
