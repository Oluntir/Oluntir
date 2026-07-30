(() => {
  'use strict';

  function text(value) {
    return document.createTextNode(String(value == null ? '' : value));
  }

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.appendChild(text(content));
    return node;
  }

  /**
   * Eigenständige Listenkarte. Bewusst ohne innerHTML, damit weder Browser-
   * Sanitizer noch gecachte Alt-Markups den Inhalt verschlucken können.
   */
  function card(item, selected, previewUrl, mode = 'manage', formatBytes = (value) => String(value || 0)) {
    const row = document.createElement('div');
    row.className = `oluntir-is-list-card${selected ? ' is-selected' : ''}`;
    row.dataset.path = item.path;
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.setAttribute('aria-pressed', selected ? 'true' : 'false');
    row.title = mode === 'assign' ? 'Bild auswählen' : 'Bilddetails anzeigen';
    row.dataset.listRow = 'true';

    const media = element('div', 'oluntir-is-list-media');
    const image = document.createElement('img');
    image.alt = '';
    image.decoding = 'async';
    image.loading = 'lazy';
    image.dataset.assetPath = item.path;
    image.addEventListener('load', () => {
      media.classList.add('is-loaded');
      media.style.aspectRatio = 'auto';
    }, { once: true });
    image.addEventListener('error', () => {
      media.classList.add('is-error');
    }, { once: true });
    image.src = previewUrl || item.path;
    media.appendChild(image);

    const info = element('div', 'oluntir-is-list-info');
    info.appendChild(element('strong', '', item.name));

    const resolutionLine = element('span');
    resolutionLine.appendChild(text(`${item.variant.label} · `));
    const resolution = element('span', '', 'Auflösung wird gelesen …');
    resolution.dataset.resolution = '';
    resolutionLine.appendChild(resolution);
    info.appendChild(resolutionLine);

    const usageText = item.used ? `${item.used}× verwendet` : 'Nicht verwendet';
    const sizeText = item.bytes ? ` · ${formatBytes(item.bytes)}` : '';
    info.appendChild(element('span', '', usageText + sizeText));

    row.appendChild(media);
    row.appendChild(info);

    if (item.user) {
      const trash = element('span', 'oluntir-is-trash fa fa-trash');
      trash.setAttribute('aria-hidden', 'true');
      trash.title = 'Bild löschen';
      row.appendChild(trash);
    }

    return row;
  }

  window.OluntirImageListView = { card };
})();
