// Oluntir 1.1.0: vollständige lokale DE/EN-Oberfläche.
(function () {
  'use strict';
  const STORAGE_KEY = 'oluntir-language-v1';

  const messages = {
    de: {
      'toolbar.framework':'Framework:', 'toolbar.page':'Seite:', 'toolbar.newPage':'+ Neue Seite',
      'toolbar.rename':'Umbenennen', 'toolbar.delete':'Löschen', 'toolbar.gallery':'+ Bildergalerie',
      'toolbar.folderGallery':'+ Galerie aus Ordner', 'toolbar.uploadImage':'+ Bild hochladen',
      'toolbar.exportFolder':'Export in Ordner', 'toolbar.interface':'Oberfläche', 'toolbar.save':'Speichern',
      'toolbar.backupSave':'Backup speichern', 'tool.favicon':'Projekt-Favicon festlegen', 'tool.monitorToggle':'Werkzeugspalte auslagern oder zurückholen', 'tool.monitorFocus':'Werkzeugfenster in den Vordergrund holen', 'toolbar.frameworkTitle':'Bootstrap-Profil auswählen',
      'toolbar.newPageTitle':'Neue Seite anlegen', 'toolbar.renameTitle':'Seite umbenennen',
      'toolbar.deleteTitle':'Seite löschen', 'toolbar.galleryTitle':'Mehrere Bilder als Galerie einfügen (Klick zum Vergrößern)',
      'toolbar.folderGalleryTitle':'Alle Bilder aus einem Ordner automatisch als Galerie einfügen',
      'toolbar.uploadImageTitle':'Bilder zum Asset-Manager hinzufügen',
      'toolbar.exportFolderTitle':'Website in einen frei benennbaren lokalen Ordner exportieren',
      'toolbar.exportZipTitle':'Website als frei benennbares ZIP-Archiv exportieren',
      'toolbar.exportTarTitle':'Website als frei benennbares TAR-Archiv exportieren',
      'language.group':'Sprache', 'language.de':'Deutsch', 'language.en':'Englisch',
      'firefox.title':'Eingeschränkter Ordnerexport in Firefox',
      'firefox.text':'Firefox unterstützt aufgrund seiner Sicherheitsrichtlinien keinen direkten Website-Ordnerexport. Für diese Funktion empfehlen wir einen Chromium-basierten Browser wie Microsoft Edge, Google Chrome, Brave oder Vivaldi.',
      'firefox.fallback':'Der vollständige Export als ZIP oder TAR steht weiterhin zur Verfügung.',
      'firefox.hide':'Hinweis nicht erneut anzeigen', 'common.understood':'Verstanden',
      'common.close':'Schließen', 'common.cancel':'Abbrechen', 'common.apply':'Übernehmen',
      'common.reset':'Standard', 'common.done':'Fertig', 'common.working':'Arbeite …',
      'ui.title':'Oberfläche konfigurieren', 'ui.subtitle':'Schrift, Abstände und Scrollbalken der Editor-Bereiche anpassen.',
      'ui.presets':'Schnellauswahl', 'ui.compact':'Kompakt', 'ui.balanced':'Ausgewogen', 'ui.comfortable':'Komfortabel',
      'ui.fontSize':'Schriftgröße in den Editor-Bereichen', 'ui.cardGap':'Abstand zwischen Kacheln',
      'ui.cardPadding':'Innenabstand der Kacheln', 'ui.scrollbar':'Breite der Scrollbalken',
      'ui.preview':'Vorschau', 'ui.previewGallery':'Responsive Bildergalerie', 'ui.previewCards':'Cards mit Bild',
      'ui.reset':'Standard wiederherstellen',
      'search.label':'Bausteine durchsuchen', 'search.placeholder':'z. B. Galerie, Card, Navbar …',
      'search.clear':'Suche zurücksetzen', 'search.available':'{count} Bausteine verfügbar',
      'search.found':'{count} Baustein{suffix} gefunden', 'search.none':'Keine passenden Bausteine',
      'tool.ui':'Oberfläche konfigurieren', 'tool.save':'Projekt im Browser speichern',
      'tool.backupSave':'Projekt-Backup als Datei speichern', 'tool.backupLoad':'Projekt-Backup aus Datei laden',
      'tool.quickSetup':'Schnell konfigurieren', 'tool.quickEdit':'Schnellbearbeitung öffnen',
      'quickSetup.heading':'Schnell konfigurieren', 'quickSetup.subtitle':'Direkte Bootstrap-Optionen',
      'quickSetup.advanced':'Erweiterte Einstellungen',
      'quickSetup.advancedText':'Für freie CSS-, Klassen-, Attribut- und Stiländerungen stehen weiterhin die normalen GrapesJS-Panels zur Verfügung.',
      'quickEdit.heading':'Schnellbearbeitung', 'quickEdit.subtitle':'Die wichtigsten Eigenschaften des gewählten Elements',
      'quickEdit.advanced':'Erweiterte Einstellungen', 'quickEdit.applied':'Schnellbearbeitung übernommen',
      'page.newPrompt':'Name der neuen Seite (z. B. „Über uns“):', 'page.renamePrompt':'Neuer Seitenname:',
      'page.lastCannotDelete':'Die letzte verbleibende Seite kann nicht gelöscht werden.',
      'page.noneSelected':'Es ist keine Seite ausgewählt.', 'page.deleteConfirm':'Seite „{name}“ wirklich löschen?',
      'page.created':'Seite „{name}“ angelegt.', 'page.deleted':'Seite „{name}“ gelöscht.',
      'framework.switchConfirm':'Zum Profil „{label}“ wechseln?\n\nBootstrap-4- und Bootstrap-5-Projekte werden getrennt gespeichert. Oluntir wird neu geladen.',
      'backup.loaded':'Backup im passenden Frameworkprofil geladen.',
      'panel.blocks':'Bausteine', 'panel.layers':'Ebenen', 'panel.styles':'Gestaltung', 'panel.traits':'Eigenschaften',
      'device.desktop':'Desktop', 'device.tablet':'Tablet', 'device.mobile':'Mobil',
      'grapes.preview':'Vorschau', 'grapes.fullscreen':'Vollbild', 'grapes.code':'Code anzeigen',
      'grapes.undo':'Rückgängig', 'grapes.redo':'Wiederholen', 'grapes.import':'Importieren',
      'grapes.clear':'Canvas leeren', 'grapes.components':'Komponenten anzeigen'
    },
    en: {
      'toolbar.framework':'Framework:', 'toolbar.page':'Page:', 'toolbar.newPage':'+ New page',
      'toolbar.rename':'Rename', 'toolbar.delete':'Delete', 'toolbar.gallery':'+ Image gallery',
      'toolbar.folderGallery':'+ Gallery from folder', 'toolbar.uploadImage':'+ Upload image',
      'toolbar.exportFolder':'Export to folder', 'toolbar.interface':'Interface', 'toolbar.save':'Save',
      'toolbar.backupSave':'Save backup', 'tool.favicon':'Set project favicon', 'tool.monitorToggle':'Move tool column out or back', 'tool.monitorFocus':'Bring tool window to front', 'toolbar.frameworkTitle':'Select Bootstrap profile',
      'toolbar.newPageTitle':'Create a new page', 'toolbar.renameTitle':'Rename page',
      'toolbar.deleteTitle':'Delete page', 'toolbar.galleryTitle':'Insert multiple images as a gallery (click to enlarge)',
      'toolbar.folderGalleryTitle':'Automatically insert all images from a folder as a gallery',
      'toolbar.uploadImageTitle':'Add images to the asset manager',
      'toolbar.exportFolderTitle':'Export website to a freely named local folder',
      'toolbar.exportZipTitle':'Export website as a freely named ZIP archive',
      'toolbar.exportTarTitle':'Export website as a freely named TAR archive',
      'language.group':'Language', 'language.de':'German', 'language.en':'English',
      'firefox.title':'Limited folder export in Firefox',
      'firefox.text':'Firefox does not support direct website folder export due to its security restrictions. Use a Chromium-based browser such as Microsoft Edge, Google Chrome, Brave or Vivaldi for this function.',
      'firefox.fallback':'Full ZIP and TAR export remains available.', 'firefox.hide':'Do not show this notice again',
      'common.understood':'Understood', 'common.close':'Close', 'common.cancel':'Cancel',
      'common.apply':'Apply', 'common.reset':'Default', 'common.done':'Done', 'common.working':'Working …',
      'ui.title':'Configure interface', 'ui.subtitle':'Adjust type size, spacing and scrollbars in the editor panels.',
      'ui.presets':'Presets', 'ui.compact':'Compact', 'ui.balanced':'Balanced', 'ui.comfortable':'Comfortable',
      'ui.fontSize':'Editor panel type size', 'ui.cardGap':'Space between tiles',
      'ui.cardPadding':'Tile inner spacing', 'ui.scrollbar':'Scrollbar width', 'ui.preview':'Preview',
      'ui.previewGallery':'Responsive image gallery', 'ui.previewCards':'Cards with image',
      'ui.reset':'Restore defaults',
      'search.label':'Search blocks', 'search.placeholder':'e.g. gallery, card, navbar …',
      'search.clear':'Clear search', 'search.available':'{count} blocks available',
      'search.found':'{count} block{suffix} found', 'search.none':'No matching blocks',
      'tool.ui':'Configure interface', 'tool.save':'Save project in browser',
      'tool.backupSave':'Save project backup as file', 'tool.backupLoad':'Load project backup from file',
      'tool.quickSetup':'Quick setup', 'tool.quickEdit':'Open quick editing',
      'quickSetup.heading':'Quick setup', 'quickSetup.subtitle':'Direct Bootstrap options',
      'quickSetup.advanced':'Advanced settings',
      'quickSetup.advancedText':'The standard GrapesJS panels remain available for custom CSS, classes, attributes and style changes.',
      'quickEdit.heading':'Quick editing', 'quickEdit.subtitle':'The most important properties of the selected element',
      'quickEdit.advanced':'Advanced settings', 'quickEdit.applied':'Quick editing applied',
      'page.newPrompt':'Name of the new page (e.g. “About us”):', 'page.renamePrompt':'New page name:',
      'page.lastCannotDelete':'The last remaining page cannot be deleted.',
      'page.noneSelected':'No page is selected.', 'page.deleteConfirm':'Really delete page “{name}”?',
      'page.created':'Page “{name}” created.', 'page.deleted':'Page “{name}” deleted.',
      'framework.switchConfirm':'Switch to profile “{label}”?\n\nBootstrap 4 and Bootstrap 5 projects are stored separately. Oluntir will reload.',
      'backup.loaded':'Backup loaded in the matching framework profile.',
      'panel.blocks':'Blocks', 'panel.layers':'Layers', 'panel.styles':'Design', 'panel.traits':'Properties',
      'device.desktop':'Desktop', 'device.tablet':'Tablet', 'device.mobile':'Mobile',
      'grapes.preview':'Preview', 'grapes.fullscreen':'Fullscreen', 'grapes.code':'View code',
      'grapes.undo':'Undo', 'grapes.redo':'Redo', 'grapes.import':'Import',
      'grapes.clear':'Clear canvas', 'grapes.components':'Show components'
    }
  };

  // Exakte Begriffe, die in dynamisch erzeugten Panels und Blockdefinitionen vorkommen.
  const deToEn = {
    'Schnellbearbeitung':'Quick editing', 'Schnell konfigurieren':'Quick setup',
    'Direkte Bootstrap-Optionen':'Direct Bootstrap options',
    'Die wichtigsten Eigenschaften des gewählten Elements':'The most important properties of the selected element',
    'Erweiterte Einstellungen':'Advanced settings', 'Übernehmen':'Apply', 'Standard':'Default',
    'Schließen':'Close', 'Abbrechen':'Cancel', 'Inhalt':'Content', 'Darstellung':'Appearance',
    'Verhalten':'Behaviour', 'Responsive':'Responsive', 'Text':'Text', 'Titel':'Title',
    'Beschriftung':'Label', 'Linkziel':'Link URL', 'Linkziel-Fenster':'Link target',
    'Gleiches Fenster':'Same window', 'Neues Fenster':'New window', 'Farbe':'Colour',
    'Eigene Farbe':'Custom colour', 'Textfarbe':'Text colour', 'Hintergrundfarbe':'Background colour',
    'Rahmenfarbe':'Border colour', 'Schriftart':'Font family', 'Schriftgröße':'Font size',
    'Schriftstärke':'Font weight', 'Zeilenhöhe':'Line height', 'Zeichenabstand':'Letter spacing',
    'Ausrichtung':'Alignment', 'Links':'Left', 'Zentriert':'Centred', 'Rechts':'Right',
    'Breite':'Width', 'Höhe':'Height', 'Bildquelle':'Image source', 'Alternativtext':'Alternative text',
    'Bildanpassung':'Image fit', 'Ausfüllen':'Cover', 'Einpassen':'Contain', 'Strecken':'Stretch',
    'Original':'Original', 'Eckenradius':'Corner radius', 'Schatten':'Shadow', 'Keiner':'None',
    'Leicht':'Light', 'Normal':'Normal', 'Groß':'Large', 'Sehr groß':'Very large',
    'Klein':'Small', 'Sehr klein':'Very small', 'Volle Breite':'Full width',
    'Grid / Spalten schnell konfigurieren':'Quick grid / column setup',
    'Responsive Bildergalerie konfigurieren':'Configure responsive image gallery',
    'Navigation konfigurieren':'Configure navigation', 'Footer konfigurieren':'Configure footer',
    'Cards schnell konfigurieren':'Quick card setup', 'Layout':'Layout',
    'Tablet-Spaltenbreite':'Tablet column width', 'Mobil-Spaltenbreite':'Mobile column width',
    'Automatisch':'Automatic', 'Abstand':'Spacing', 'Vertikale Ausrichtung':'Vertical alignment',
    'Oben':'Top', 'Mitte':'Middle', 'Unten':'Bottom', 'Anzahl Beispielbilder':'Number of sample images',
    'Desktop: Bilder je Reihe':'Desktop: images per row', 'Tablet: Bilder je Reihe':'Tablet: images per row',
    'Mobil: Bilder je Reihe':'Mobile: images per row', 'Bildabstand':'Image spacing',
    'Bildformat':'Image ratio', 'Quadrat':'Square', 'Abgerundete Ecken':'Rounded corners',
    'Bildunterschriften':'Captions', 'Lightbox':'Lightbox', 'Variante':'Variant',
    'Logo und Menü zentriert':'Centred logo and menu', 'Offcanvas rechts (BS5)':'Offcanvas right (BS5)',
    'Projekt-/Markenname':'Project / brand name', 'Farbschema':'Colour scheme',
    'Hell':'Light', 'Dunkel':'Dark', 'Primärfarbe':'Primary colour', 'Position':'Position',
    'Logo-Platzhalter':'Logo placeholder', 'Suchfeld':'Search field', 'CTA-Schaltfläche':'CTA button',
    'Spalten':'Columns', 'Social-Links':'Social links', 'Anzahl Cards':'Number of cards',
    'Desktop: Cards je Reihe':'Desktop: cards per row', 'Tablet: Cards je Reihe':'Tablet: cards per row',
    'Mobil: Cards je Reihe':'Mobile: cards per row', 'Badge':'Badge', 'Kopfzeile':'Header',
    'Fußzeile':'Footer', 'Button':'Button', 'Buttontext':'Button text', 'Buttonfarbe':'Button colour',
    'Rahmen':'Border', 'Bild oben':'Image on top', 'Horizontal':'Horizontal', 'Bild-Overlay':'Image overlay',
    'Button · Schnellbearbeitung':'Button · Quick editing',
    'Inhalt, Link und sichtbare Gestaltung':'Content, link and visible appearance',
    'Überschrift · Schnellbearbeitung':'Heading · Quick editing', 'Text · Schnellbearbeitung':'Text · Quick editing',
    'Bild · Schnellbearbeitung':'Image · Quick editing', 'Bildquelle, Beschreibung und sichtbare Form':'Image source, description and visible shape',
    'Card · Schnellbearbeitung':'Card · Quick editing', 'Oberfläche der ausgewählten Card':'Appearance of the selected card',
    'Zum Beispiel 100%, 480px oder 30rem':'For example 100%, 480px or 30rem',
    'Zum Beispiel 0.5rem, 12px oder 50%':'For example 0.5rem, 12px or 50%',
    'Zum Beispiel 0.375rem, 12px oder 0':'For example 0.375rem, 12px or 0',
    'Blöcke':'Blocks', 'Layout':'Layout', 'Inhalte':'Content', 'Formulare':'Forms',
    'Komponenten':'Components', 'Helfer':'Helpers', 'Hilfsklassen':'Helpers', 'Dienstprogramme':'Utilities',
    'Typografie':'Typography', 'Bilder':'Images', 'Tabellen':'Tables', 'Abbildungen':'Figures',
    'Übersicht':'Overview', 'Formularfeld':'Form control', 'Auswahl':'Select', 'Checkboxen & Optionsfelder':'Checks & radios',
    'Eingabegruppe':'Input group', 'Schwebende Beschriftungen':'Floating labels', 'Validierung':'Validation',
    'Schaltflächen':'Buttons', 'Schaltflächengruppe':'Button group', 'Schließen-Schaltfläche':'Close button',
    'Listen-Gruppe':'List group', 'Navigationen & Tabs':'Navs & tabs', 'Platzhalter':'Placeholders',
    'Fortschritt':'Progress', 'Ladeanzeigen':'Spinners', 'Werkzeugtipps':'Tooltips',
    'Farbe & Hintergrund':'Color & background', 'Farbige Links':'Colored links', 'Fokusrahmen':'Focus ring',
    'Symbol-Link':'Icon link', 'Seitenverhältnis':'Ratio', 'Stapel':'Stacks', 'Gestreckter Link':'Stretched link',
    'Textkürzung':'Text truncation', 'Vertikale Linie':'Vertical rule', 'Visuell verborgen':'Visually hidden',
    'Hintergrund':'Background', 'Rahmen':'Borders', 'Farben':'Colors', 'Anzeige':'Display',
    'Interaktionen':'Interactions', 'Objektanpassung':'Object fit', 'Deckkraft':'Opacity', 'Überlauf':'Overflow',
    'Schatten':'Shadows', 'Größen':'Sizing', 'Abstände':'Spacing', 'Vertikale Ausrichtung':'Vertical align',
    'Sichtbarkeit':'Visibility',
    'Components':'Components', 'Helpers':'Helpers', 'Utilities':'Utilities', 'Galerie':'Gallery',
    'Navigation · Varianten':'Navigation · Variants', 'Footer · Varianten':'Footer · Variants',
    'Seitenbereiche · Varianten':'Page sections · Variants', 'Cards · Varianten':'Cards · Variants',
    'Grid mit Quick Setup':'Grid with quick setup', 'Responsive Galerie – Quick Setup':'Responsive gallery – quick setup',
    'Navbar · Dunkel':'Navbar · Dark', 'Navbar · Zentriert':'Navbar · Centred',
    'Navbar · Suche + CTA':'Navbar · Search + CTA', 'Footer · 3 Spalten':'Footer · 3 columns',
    'Footer · 4 Spalten':'Footer · 4 columns', 'Hero · Text + Bild':'Hero · Text + image',
    'Cards · Bild-Overlay':'Cards · Image overlay', 'Responsive Bildergalerie':'Responsive image gallery',
    'Bildergalerie BS5':'Image gallery BS5', 'Überschrift':'Heading', 'Eigenschaften':'Properties',
    'Gestaltung':'Design', 'Ebenen':'Layers', 'Bausteine':'Blocks'
  };
  const enToDe = Object.fromEntries(Object.entries(deToEn).map(([de,en]) => [en,de]));

  function initialLanguage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'de' || stored === 'en') return stored;
    return String(navigator.language || '').toLowerCase().startsWith('de') ? 'de' : 'en';
  }
  let language = initialLanguage();

  function t(key, vars) {
    let value = (messages[language] && messages[language][key]) || messages.de[key] || key;
    Object.keys(vars || {}).forEach((k) => { value = value.replaceAll(`{${k}}`, String(vars[k])); });
    return value;
  }

  function translateText(value) {
    const source = String(value == null ? '' : value);
    if (!source) return source;
    const map = language === 'en' ? deToEn : enToDe;
    if (map[source]) return map[source];
    // Kategorien wie "BS5 · Galerie" oder zusammengesetzte kurze Beschriftungen.
    let result = source;
    Object.entries(map)
      .sort((a,b) => b[0].length - a[0].length)
      .forEach(([from,to]) => { result = result.replaceAll(from, to); });
    return result;
  }

  function translateHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = String(html || '');
    const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const raw = node.nodeValue;
      const trimmed = raw.trim();
      if (!trimmed) return;
      node.nodeValue = raw.replace(trimmed, translateText(trimmed));
    });
    template.content.querySelectorAll('[title],[aria-label],[placeholder]').forEach((el) => {
      ['title','aria-label','placeholder'].forEach((attr) => {
        if (el.hasAttribute(attr)) el.setAttribute(attr, translateText(el.getAttribute(attr)));
      });
    });
    return template.innerHTML;
  }

  function apply(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    scope.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
    scope.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    scope.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    document.documentElement.lang = language;
    document.querySelectorAll('[data-lang]').forEach((btn) => {
      const active = btn.dataset.lang === language;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    window.dispatchEvent(new CustomEvent('oluntir:languagechange', { detail: { language } }));
  }

  function setLanguage(next) {
    if (next !== 'de' && next !== 'en') return;
    language = next;
    localStorage.setItem(STORAGE_KEY, next);
    apply(document);
  }

  window.OluntirI18N = {
    t, apply, setLanguage, translateText, translateHtml,
    getLanguage: () => language
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach((btn) => btn.addEventListener('click', () => setLanguage(btn.dataset.lang)));
    apply(document);
  });
})();
