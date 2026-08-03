/* Oluntir image lightbox. Copyright (c) 2026 Sebastian Lenth. MIT. */
(function () {
  'use strict';
  var viewer = null;
  var state = null;
  function enabledImages(trigger) {
    var group = trigger.getAttribute('data-oluntir-lightbox-group') || '';
    if (!group) return [trigger];
    return Array.prototype.slice.call(document.querySelectorAll('img[data-oluntir-lightbox="true"][data-oluntir-lightbox-group="' + CSS.escape(group) + '"]'));
  }
  function source(image) { return image.currentSrc || image.getAttribute('data-stable-path') || image.getAttribute('src') || ''; }
  function fileName(image) {
    var explicit = image.getAttribute('data-filename') || image.getAttribute('download') || '';
    if (explicit) return explicit;
    var path = source(image).split('?')[0].split('#')[0];
    try { return decodeURIComponent(path.substring(path.lastIndexOf('/') + 1)); } catch (_) { return path.substring(path.lastIndexOf('/') + 1); }
  }
  function flag(image, name) { return String(image.getAttribute(name) || '').toLowerCase() === 'true'; }
  function ensureViewer() {
    if (viewer && viewer.isConnected) return viewer;
    viewer = document.createElement('div');
    viewer.className = 'oluntir-image-lightbox'; viewer.hidden = true; viewer.setAttribute('aria-hidden', 'true');
    viewer.innerHTML = '<div class="oluntir-image-lightbox__backdrop" data-oluntir-lightbox-close></div>' +
      '<section class="oluntir-image-lightbox__dialog" role="dialog" aria-modal="true" aria-label="Bildansicht">' +
      '<header><span></span><button type="button" data-oluntir-lightbox-close aria-label="Bildansicht schließen">×</button></header>' +
      '<div class="oluntir-image-lightbox__stage"><button type="button" data-oluntir-lightbox-prev aria-label="Vorheriges Bild">‹</button><img alt="" decoding="async"><button type="button" data-oluntir-lightbox-next aria-label="Nächstes Bild">›</button></div>' +
      '<footer><span data-oluntir-lightbox-caption></span><span data-oluntir-lightbox-counter></span><a data-oluntir-lightbox-download download aria-label="Bild herunterladen" title="Bild herunterladen"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M11 3h2v10.17l3.59-3.58L18 11l-6 6-6-6 1.41-1.41L11 13.17V3zm-5 16h12v2H6v-2z"/></svg></a></footer></section>';
    document.body.appendChild(viewer);
    viewer.addEventListener('click', function (event) {
      if (event.target.closest('[data-oluntir-lightbox-close]')) close();
      else if (event.target.closest('[data-oluntir-lightbox-prev]')) move(-1);
      else if (event.target.closest('[data-oluntir-lightbox-next]')) move(1);
    });
    return viewer;
  }
  function render() {
    if (!state || !state.items.length) return;
    var image = state.items[state.index];
    var display = viewer.querySelector('.oluntir-image-lightbox__stage img');
    var label = image.getAttribute('alt') || image.getAttribute('title') || '';
    display.src = source(image); display.alt = label;
    var caption = viewer.querySelector('[data-oluntir-lightbox-caption]');
    caption.textContent = flag(image, 'data-oluntir-lightbox-caption') ? (label || fileName(image)) : '';
    caption.hidden = !caption.textContent;
    var counter = viewer.querySelector('[data-oluntir-lightbox-counter]');
    counter.textContent = state.items.length > 1 ? (state.index + 1) + ' / ' + state.items.length : '';
    counter.hidden = !counter.textContent;
    var download = viewer.querySelector('[data-oluntir-lightbox-download]');
    download.hidden = !flag(image, 'data-oluntir-lightbox-download');
    download.href = source(image); download.setAttribute('download', fileName(image) || 'bild');
    viewer.querySelector('[data-oluntir-lightbox-prev]').hidden = state.items.length < 2;
    viewer.querySelector('[data-oluntir-lightbox-next]').hidden = state.items.length < 2;
    viewer.querySelector('footer').hidden = caption.hidden && counter.hidden && download.hidden;
  }
  function open(trigger) {
    if (!trigger) return; ensureViewer();
    var items = enabledImages(trigger);
    state = { items: items, index: Math.max(0, items.indexOf(trigger)), returnFocus: trigger };
    render(); viewer.hidden = false; viewer.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('oluntir-image-lightbox-open');
    viewer.querySelector('[data-oluntir-lightbox-close]').focus();
  }
  function close() {
    if (!viewer || viewer.hidden) return;
    var focus = state && state.returnFocus;
    viewer.hidden = true; viewer.setAttribute('aria-hidden', 'true');
    viewer.querySelector('.oluntir-image-lightbox__stage img').removeAttribute('src');
    document.documentElement.classList.remove('oluntir-image-lightbox-open'); state = null;
    if (focus && focus.focus) focus.focus();
  }
  function move(delta) { if (!state || state.items.length < 2) return; state.index = (state.index + delta + state.items.length) % state.items.length; render(); }
  function editorDesignMode() {
    if (!window.frameElement) return false;
    try {
      var parentEditor = window.parent && window.parent.OluntirEditor;
      if (parentEditor) {
        var previewActive = !!(parentEditor.Commands && parentEditor.Commands.isActive && parentEditor.Commands.isActive('preview'));
        return !previewActive;
      }
    } catch (_) {
      return true;
    }
    return !!(document.documentElement && document.documentElement.getAttribute('data-oluntir-editor-canvas') === 'true') ||
      !!(document.body && document.body.classList.contains('gjs-dashed'));
  }
  function lightboxImageForTarget(target) {
    if (!target || !target.closest) return null;
    var direct = target.closest('img[data-oluntir-lightbox="true"]');
    if (direct) return direct;
    if (target.closest('a[data-oluntir-gallery-download], a.portfolio-download, [data-oluntir-lightbox-download]')) return null;
    var item = target.closest('[data-oluntir-gallery-item], [data-pb-gallery-item], .pb-gallery-item');
    return item && item.querySelector ? item.querySelector('img[data-oluntir-lightbox="true"]') : null;
  }
  document.addEventListener('click', function (event) {
    var image = lightboxImageForTarget(event.target);
    if (!image || editorDesignMode()) return;
    event.preventDefault(); event.stopImmediatePropagation(); event.stopPropagation(); open(image);
  }, true);
  document.addEventListener('keydown', function (event) {
    if (!state) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
  }, true);
  window.OluntirImageLightboxRuntime = { open: open, close: close };
})();
