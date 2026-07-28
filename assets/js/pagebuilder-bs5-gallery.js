(function () {
  const RESPONSIVE_WIDTHS = { mobile: 1200, tablet: 1600, desktop: 1920 };

  function itemsFor(trigger) {
    const gallery = trigger && trigger.closest('[data-pb-bs5-gallery]');
    return gallery ? Array.from(gallery.querySelectorAll('.pb-bs5-gallery-open')) : [];
  }

  function responsiveSources(item) {
    return {
      mobile: item && (item.dataset.pbGalleryMobile || '') || '',
      tablet: item && (item.dataset.pbGalleryTablet || '') || '',
      desktop: item && (item.dataset.pbGalleryDesktop || item.getAttribute('href') || item.dataset.full || '') || ''
    };
  }

  function requiredPixelWidth(modal) {
    const stage = modal && modal.querySelector('.pb-gallery-stage');
    const cssWidth = Math.max(stage ? stage.clientWidth : 0,
      Math.min(window.innerWidth || document.documentElement.clientWidth || 1200, 1920));
    return Math.min(Math.ceil(cssWidth * Math.max(window.devicePixelRatio || 1, 1)), RESPONSIVE_WIDTHS.desktop);
  }

  function bestSource(item, modal) {
    const sources = responsiveSources(item);
    const needed = requiredPixelWidth(modal);
    if (needed <= RESPONSIVE_WIDTHS.mobile && sources.mobile) return sources.mobile;
    if (needed <= RESPONSIVE_WIDTHS.tablet && sources.tablet) return sources.tablet;
    return sources.desktop || sources.tablet || sources.mobile;
  }

  function applyResponsiveImage(image, item, modal) {
    const sources = responsiveSources(item);
    const candidates = [];
    if (sources.mobile) candidates.push(`${sources.mobile} ${RESPONSIVE_WIDTHS.mobile}w`);
    if (sources.tablet) candidates.push(`${sources.tablet} ${RESPONSIVE_WIDTHS.tablet}w`);
    if (sources.desktop) candidates.push(`${sources.desktop} ${RESPONSIVE_WIDTHS.desktop}w`);
    if (candidates.length) {
      image.setAttribute('srcset', candidates.join(', '));
      image.setAttribute('sizes', '(max-width: 1199.98px) calc(100vw - 2rem), min(92vw, 1920px)');
    } else {
      image.removeAttribute('srcset');
      image.removeAttribute('sizes');
    }
    const src = bestSource(item, modal);
    if (src) image.src = src;
    image.alt = item.dataset.alt || item.dataset.filename || '';
  }

  function preloadNeighbours(items, index, modal) {
    [-1, 1].forEach(function (offset) {
      if (!items.length) return;
      const item = items[(index + offset + items.length) % items.length];
      const preload = new Image();
      preload.src = bestSource(item, modal);
    });
  }

  function render(modal, item, index) {
    if (!modal || !item) return;
    const items = itemsFor(item);
    const image = modal.querySelector('[data-pb-gallery-modal-image]');
    const download = modal.querySelector('[data-pb-gallery-modal-download]');
    const title = modal.querySelector('.modal-title');
    if (image) applyResponsiveImage(image, item, modal);
    if (download) {
      download.href = item.dataset.download || item.getAttribute('href') || '';
      download.setAttribute('download', item.dataset.filename || 'bild');
    }
    if (title) title.textContent = item.dataset.alt || item.dataset.filename || 'Bildansicht';
    modal.dataset.pbGalleryIndex = String(index);
    modal._pbGalleryTrigger = item;
    preloadNeighbours(items, index, modal);
  }

  function show(trigger, index) {
    const items = itemsFor(trigger);
    if (!items.length) return;
    const normalized = (index + items.length) % items.length;
    const item = items[normalized];
    const selector = item.getAttribute('data-bs-target');
    const modal = selector ? document.querySelector(selector) : null;
    render(modal, item, normalized);
  }

  // Capture-Phase ist im GrapesJS-Canvas wichtig: Dort kann die Editor-Selektion
  // den normalen Bubbling-Click bereits abfangen. So wird das Bild gesetzt, bevor
  // Bootstrap das Modal sichtbar macht.
  document.addEventListener('click', function (event) {
    const trigger = event.target.closest && event.target.closest('.pb-bs5-gallery-open');
    if (trigger) {
      show(trigger, itemsFor(trigger).indexOf(trigger));
      return;
    }
    const nav = event.target.closest && event.target.closest('[data-pb-gallery-nav]');
    if (!nav) return;
    event.preventDefault();
    const modal = nav.closest('.pb-bs5-gallery-modal');
    const active = modal && modal._pbGalleryTrigger;
    if (!active) return;
    const direction = nav.getAttribute('data-pb-gallery-nav') === 'prev' ? -1 : 1;
    show(active, Number(modal.dataset.pbGalleryIndex || 0) + direction);
  }, true);

  // Sicherheitsnetz: Bootstrap liefert den auslösenden Link als relatedTarget.
  document.addEventListener('show.bs.modal', function (event) {
    const modal = event.target;
    if (!modal || !modal.classList.contains('pb-bs5-gallery-modal')) return;
    const trigger = event.relatedTarget || modal._pbGalleryTrigger;
    if (trigger && trigger.matches('.pb-bs5-gallery-open')) {
      show(trigger, itemsFor(trigger).indexOf(trigger));
    }
  });

  window.addEventListener('resize', function () {
    document.querySelectorAll('.pb-bs5-gallery-modal.show').forEach(function (modal) {
      if (modal._pbGalleryTrigger) show(modal._pbGalleryTrigger, Number(modal.dataset.pbGalleryIndex || 0));
    });
  });
})();
