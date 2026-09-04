(function () {
  'use strict';
  const RESPONSIVE_WIDTHS = { mobile: 1200, tablet: 1600, desktop: 1920 };
  let viewer = null;
  let state = null;

  function updateVisibleViewport() {
    const viewport = window.visualViewport;
    const height = viewport ? viewport.height : window.innerHeight;
    const top = viewport ? viewport.offsetTop : 0;
    const safeHeight = Math.max(320, Math.floor(height));
    const desktopGap = Math.max(18, Math.floor(safeHeight * 0.05));
    document.documentElement.style.setProperty('--pb-gallery-visible-height', `${safeHeight}px`);
    document.documentElement.style.setProperty('--pb-gallery-visible-top', `${Math.max(0, Math.floor(top))}px`);
    document.documentElement.style.setProperty('--pb-gallery-visible-gap', `${desktopGap}px`);
  }
  updateVisibleViewport();
  window.addEventListener('resize', updateVisibleViewport, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateVisibleViewport, { passive: true });
    window.visualViewport.addEventListener('scroll', updateVisibleViewport, { passive: true });
  }

  function galleryFor(node) { return node && node.closest ? node.closest('[data-pb-gallery]') : null; }
  function itemsFor(node) {
    const gallery = galleryFor(node);
    return gallery ? Array.from(gallery.querySelectorAll('.pb-gallery-trigger')) : [];
  }
  function boolAttr(gallery, name, fallback) {
    if (!gallery || !gallery.hasAttribute(name)) return fallback;
    return gallery.getAttribute(name) !== 'false';
  }
  function visibleImageFor(item) {
    const wrapper = item && item.closest ? item.closest('[data-oluntir-gallery-item], [data-pb-gallery-item], .pb-gallery-item') : null;
    return wrapper && wrapper.querySelector ? wrapper.querySelector('picture img, img') : null;
  }
  function visibleImageSource(item) {
    const image = visibleImageFor(item);
    if (!image) return '';
    return image.currentSrc || image.getAttribute('data-stable-path') || image.getAttribute('src') || '';
  }
  function sources(item) {
    return {
      mobile: item && item.dataset.pbGalleryMobile || '',
      tablet: item && item.dataset.pbGalleryTablet || '',
      desktop: visibleImageSource(item) || (item && (item.dataset.pbGalleryDesktop || item.getAttribute('href'))) || ''
    };
  }
  function bestSource(item) {
    const visible = visibleImageSource(item);
    if (visible) return visible;
    const source = sources(item);
    const cssWidth = Math.min(window.innerWidth || 1200, 1920);
    const needed = Math.min(Math.ceil(cssWidth * Math.max(window.devicePixelRatio || 1, 1)), RESPONSIVE_WIDTHS.desktop);
    if (needed <= RESPONSIVE_WIDTHS.mobile && source.mobile) return source.mobile;
    if (needed <= RESPONSIVE_WIDTHS.tablet && source.tablet) return source.tablet;
    return source.desktop || source.tablet || source.mobile;
  }
  function ensureViewer() {
    if (viewer && viewer.isConnected) return viewer;
    viewer = document.createElement('div');
    viewer.className = 'pb-gallery-viewer';
    viewer.hidden = true;
    viewer.setAttribute('aria-hidden', 'true');
    viewer.innerHTML = `
      <div class="pb-gallery-viewer-backdrop" data-pb-gallery-close></div>
      <section class="pb-gallery-viewer-dialog" role="dialog" aria-modal="true" aria-labelledby="pb-gallery-viewer-title">
        <header class="pb-gallery-viewer-header">
          <h2 id="pb-gallery-viewer-title">Bildansicht</h2>
          <button type="button" class="pb-gallery-viewer-close" data-pb-gallery-close aria-label="Bildansicht schließen">×</button>
        </header>
        <div class="pb-gallery-viewer-stage">
          <button type="button" class="pb-gallery-viewer-nav pb-gallery-viewer-prev" data-pb-gallery-nav="prev" aria-label="Vorheriges Bild">‹</button>
          <img class="pb-gallery-viewer-image" alt="" decoding="async">
          <button type="button" class="pb-gallery-viewer-nav pb-gallery-viewer-next" data-pb-gallery-nav="next" aria-label="Nächstes Bild">›</button>
        </div>
        <footer class="pb-gallery-viewer-footer">
          <div class="pb-gallery-viewer-caption" aria-live="polite"></div>
          <div class="pb-gallery-viewer-counter" aria-live="polite"></div>
          <a class="pb-gallery-viewer-download" href="#" download>Originalbild herunterladen</a>
        </footer>
      </section>`;
    document.body.appendChild(viewer);
    viewer.addEventListener('click', function (event) {
      if (event.target.closest('[data-pb-gallery-close]')) { close(); return; }
      const nav = event.target.closest('[data-pb-gallery-nav]');
      if (nav) move(nav.dataset.pbGalleryNav === 'prev' ? -1 : 1);
    });
    return viewer;
  }
  function focusable() {
    return viewer ? Array.from(viewer.querySelectorAll('button:not([disabled]), a[href]:not([hidden])')) : [];
  }
  function applyMode(mode) {
    viewer.classList.toggle('pb-gallery-viewer--modal', mode === 'modal');
    viewer.classList.toggle('pb-gallery-viewer--lightbox', mode === 'lightbox');
  }
  function render() {
    if (!state || !state.items.length) return;
    const item = state.items[state.index];
    const image = viewer.querySelector('.pb-gallery-viewer-image');
    const title = viewer.querySelector('#pb-gallery-viewer-title');
    const caption = viewer.querySelector('.pb-gallery-viewer-caption');
    const counter = viewer.querySelector('.pb-gallery-viewer-counter');
    const download = viewer.querySelector('.pb-gallery-viewer-download');
    const label = item.dataset.caption || item.dataset.alt || item.dataset.filename || `Bild ${state.index + 1}`;
    image.src = bestSource(item);
    image.alt = item.dataset.alt || label;
    title.textContent = label;
    caption.textContent = state.caption ? label : '';
    caption.hidden = !state.caption;
    counter.textContent = state.counter ? `${state.index + 1} / ${state.items.length}` : '';
    counter.hidden = !state.counter;
    download.href = item.dataset.download || item.getAttribute('href') || image.src;
    download.setAttribute('download', item.dataset.filename || 'originalbild');
    download.setAttribute('title', `Originalbild herunterladen: ${label}`);
    const disablePrev = !state.loop && state.index === 0;
    const disableNext = !state.loop && state.index === state.items.length - 1;
    viewer.querySelector('[data-pb-gallery-nav="prev"]').disabled = disablePrev;
    viewer.querySelector('[data-pb-gallery-nav="next"]').disabled = disableNext;
    [-1, 1].forEach(function (offset) {
      let index = state.index + offset;
      if (state.loop) index = (index + state.items.length) % state.items.length;
      if (index >= 0 && index < state.items.length) { const preload = new Image(); preload.src = bestSource(state.items[index]); }
    });
  }
  function open(trigger, index) {
    const gallery = galleryFor(trigger);
    const mode = gallery && gallery.dataset.pbGalleryViewer || 'modal';
    if (!gallery || mode === 'none') return;
    const items = itemsFor(trigger);
    if (!items.length) return;
    ensureViewer();
    updateVisibleViewport();
    state = {
      gallery: gallery,
      items: items,
      index: Math.max(0, Math.min(index, items.length - 1)),
      mode: mode,
      caption: boolAttr(gallery, 'data-pb-gallery-caption', true),
      counter: boolAttr(gallery, 'data-pb-gallery-counter', true),
      loop: boolAttr(gallery, 'data-pb-gallery-loop', true),
      returnFocus: trigger
    };
    applyMode(mode);
    render();
    viewer.hidden = false;
    viewer.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('pb-gallery-viewer-open');
    viewer.querySelector('.pb-gallery-viewer-close').focus();
  }
  function close() {
    if (!viewer || viewer.hidden) return;
    const returnFocus = state && state.returnFocus;
    viewer.hidden = true;
    viewer.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('pb-gallery-viewer-open');
    const image = viewer.querySelector('.pb-gallery-viewer-image');
    image.removeAttribute('src'); image.removeAttribute('srcset');
    state = null;
    if (returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus();
  }
  function move(delta) {
    if (!state) return;
    let next = state.index + delta;
    if (state.loop) next = (next + state.items.length) % state.items.length;
    if (next < 0 || next >= state.items.length) return;
    state.index = next; render();
  }
  function jump(index) { if (state && index >= 0 && index < state.items.length) { state.index = index; render(); } }

  function editorDesignMode() {
    if (!window.frameElement) return false;
    try {
      var parentEditor = window.parent && window.parent.OluntirEditor;
      if (parentEditor && parentEditor.Commands && parentEditor.Commands.isActive) {
        return !parentEditor.Commands.isActive('preview');
      }
    } catch (_) { return true; }
    return document.documentElement.getAttribute('data-oluntir-editor-canvas') === 'true' &&
      !(document.documentElement.getAttribute('data-oluntir-preview-active') === 'true');
  }

  document.addEventListener('click', function (event) {
    if (editorDesignMode()) return;
    const openButton = event.target.closest && event.target.closest('[data-pb-gallery-open-index]');
    if (openButton) {
      event.preventDefault(); event.stopPropagation();
      const gallery = galleryFor(openButton);
      const items = gallery ? Array.from(gallery.querySelectorAll('.pb-gallery-trigger')) : [];
      const index = Number(openButton.dataset.pbGalleryOpenIndex || 0);
      if (items[index]) open(items[index], index);
      return;
    }
    const trigger = event.target.closest && event.target.closest('.pb-gallery-trigger');
    if (!trigger) return;
    const item = trigger.closest && trigger.closest('[data-oluntir-gallery-item], [data-pb-gallery-item], .pb-gallery-item');
    if (item && item.querySelector && item.querySelector('img[data-oluntir-lightbox="true"]')) return;
    event.preventDefault();
    open(trigger, itemsFor(trigger).indexOf(trigger));
  }, true);

  document.addEventListener('keydown', function (event) {
    if (editorDesignMode()) return;
    const trigger = event.target.closest && event.target.closest('.pb-gallery-trigger');
    if (!state && trigger && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault(); open(trigger, itemsFor(trigger).indexOf(trigger)); return;
    }
    if (!state) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    else if (event.key === 'Home') { event.preventDefault(); jump(0); }
    else if (event.key === 'End') { event.preventDefault(); jump(state.items.length - 1); }
    else if (event.key === 'Tab') {
      const nodes = focusable(); if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }, true);
})();
