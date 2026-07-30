(() => {
  'use strict';
  const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB']; const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, i)).toLocaleString('de-DE', { maximumFractionDigits: i ? 1 : 0 })} ${units[i]}`;
  };
  function shell(mode = 'manage') {
    const assignMode = mode === 'assign';
    const root = document.createElement('section');
    root.className = `oluntir-image-select is-mode-${mode}`;
    root.dataset.mode = mode;
    root.innerHTML = `
      <div class="oluntir-is-modebar ${assignMode ? 'is-assign' : 'is-manage'}" role="status">
        <span class="oluntir-is-modebadge"><span class="fa ${assignMode ? 'fa-check-square-o' : 'fa-folder-open-o'}" aria-hidden="true"></span> Modus: ${assignMode ? 'Bild auswählen' : 'Bilder verwalten'}</span>
        <span class="oluntir-is-modehint">${assignMode
          ? 'Das ausgewählte Bild wird dem zuvor angeklickten Bildelement zugewiesen.'
          : 'Kein Bildelement ausgewählt. Zum Setzen eines bestimmten Bildes zuerst den Bildmanager schließen, anschließend das gewünschte Bildelement im Editor anklicken und die Bildauswahl dort erneut öffnen.'}</span>
      </div>
      <header class="oluntir-is-toolbar">
        <label class="oluntir-is-search"><span class="fa fa-search" aria-hidden="true"></span><input data-role="search" type="search" placeholder="Bilder durchsuchen …"></label>
        <select data-role="filter"><option value="all">Alle Bilder</option><option value="used">Verwendet</option><option value="unused">Nicht verwendet</option><option value="svg">SVG</option><option value="raster">Rasterbilder</option></select>
        <select data-role="variants"><option value="primary">Nur Hauptbilder</option><option value="all">Alle Bildversionen</option></select>
        <select data-role="sort"><option value="recent">Zuletzt hinzugefügt</option><option value="name">Name A–Z</option><option value="size">Dateigröße</option><option value="usage">Verwendung</option></select>
        <div class="oluntir-is-view"><button type="button" data-view="grid" class="is-active" title="Rasteransicht"><span class="fa fa-th"></span></button><button type="button" data-view="list" title="Listenansicht"><span class="fa fa-list"></span></button></div>
        <label class="oluntir-is-upload"><span class="fa fa-upload"></span> Bilder hochladen<input data-role="upload" type="file" accept="image/*" multiple hidden></label>
      </header>
      <div class="oluntir-is-main">
        <div class="oluntir-is-list" data-role="list" aria-live="polite"></div>
        <aside class="oluntir-is-details" data-role="details"><p>Wähle ein Bild aus, um Details anzuzeigen.</p></aside>
      </div>
      <footer class="oluntir-is-footer">
        <span data-role="summary">0 Bilder</span>
        <div class="oluntir-is-actions"><button type="button" data-action="sync-folder"><span class="fa fa-folder-open-o"></span> Projektordner verbinden & Uploads schreiben</button><button type="button" data-action="delete-unused">Nicht verwendete Bilder löschen</button><button type="button" data-action="delete-all" class="is-danger"><span class="fa fa-trash"></span> Alle Bilder löschen</button></div>
      </footer>`;
    return root;
  }
  function card(item, selected, previewUrl, mode = 'manage') {
    const el = document.createElement('button');
    el.type = 'button'; el.className = `oluntir-is-card${selected ? ' is-selected' : ''}`; el.dataset.path = item.path; el.setAttribute('aria-pressed', selected ? 'true' : 'false');
    el.title = mode === 'assign' ? 'Bild auswählen' : 'Bilddetails anzeigen';
    el.innerHTML = `<span class="oluntir-is-thumb"><img loading="lazy" decoding="async" src="${escapeHtml(previewUrl || item.path)}" alt=""></span><span class="oluntir-is-card-text"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.variant.label)} · <span data-resolution>Auflösung wird gelesen …</span></span><span>${item.used ? `${item.used}× verwendet` : 'Nicht verwendet'}${item.bytes ? ` · ${formatBytes(item.bytes)}` : ''}</span></span>${item.user ? '<span class="oluntir-is-trash fa fa-trash" aria-hidden="true"></span>' : ''}`;
    return el;
  }
  function details(item, group, sizes, mode = 'manage') {
    if (!item) return '<p>Wähle ein Bild aus, um Details anzuzeigen.</p>';
    const rows = group.map((entry) => {
      const size = sizes.get(entry.path) || { width: 0, height: 0 };
      return `<tr><td>${escapeHtml(entry.variant.label)}</td><td>${size.width ? `${size.width} × ${size.height} px` : 'unbekannt'}</td><td>${formatBytes(entry.bytes)}</td><td><code>${escapeHtml(entry.path)}</code></td></tr>`;
    }).join('');
    const useAction = mode === 'assign' ? '<button type="button" data-action="use">Bild verwenden</button>' : '';
    const modeNote = mode === 'manage'
      ? '<div class="oluntir-is-detail-note"><span class="fa fa-info-circle" aria-hidden="true"></span><span>Eine direkte Zuweisung ist im Verwaltungsmodus nicht möglich. Schließe den Bildmanager, wähle das gewünschte Bildelement im Editor und öffne anschließend dessen Bildauswahl.</span></div>'
      : '';
    return `<div class="oluntir-is-detail-head"><h3>${escapeHtml(item.name)}</h3><span class="oluntir-is-detail-actions">${useAction}<button type="button" data-action="replace"${item.user ? '' : ' disabled'}>Bild ersetzen</button></span></div>${modeNote}<p>${item.used ? `${item.used}× im Projekt verwendet` : 'Nicht verwendet'}</p><div class="oluntir-is-table-wrap"><table><thead><tr><th>Version</th><th>Auflösung</th><th>Größe</th><th>Pfad</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  window.OluntirImageSelectUi = { shell, card, details, formatBytes };
})();
