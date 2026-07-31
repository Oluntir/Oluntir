# Shared Content und Includes

Die Synchronisation von gemeinsamem Header, Navigation und Footer bleibt Aufgabe von `shared-content-manager.js`. Wiederverwendbare Bereiche und OPE-Include-Positionen bleiben Aufgabe von `includes.js`. Layout-Identitäten verschieben, duplizieren oder entfernen diese Strukturen nicht.

Der Export rendert weiterhin die ausgewählte GrapesJS-Seite, normalisiert sie und ruft danach `OluntirIncludes.preparePage()` für HTML, SSI oder PHP auf. Interne Identity-Attribute werden unmittelbar davor ausschließlich aus dem Exportstring entfernt.
