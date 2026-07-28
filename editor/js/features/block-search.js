// Oluntir: performante lokale Suche für die Bausteinbibliothek.
// Die Suche arbeitet ohne MutationObserver und verändert den von GrapesJS
// verwalteten Block-Container nicht strukturell.
(function () {
  'use strict';
  const tr = (key, vars) => window.OluntirI18N ? window.OluntirI18N.t(key, vars) : key;

  const NORMALIZE_MAP = {
    ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss',
    à: 'a', á: 'a', â: 'a', è: 'e', é: 'e', ê: 'e',
    ì: 'i', í: 'i', î: 'i', ò: 'o', ó: 'o', ô: 'o',
    ù: 'u', ú: 'u', û: 'u'
  };

  const SYNONYMS = {
    bild: ['foto', 'image', 'picture', 'grafik'],
    bilder: ['fotos', 'images', 'gallery', 'galerie'],
    galerie: ['gallery', 'foto', 'bilder', 'portfolio', 'lightbox'],
    navigation: ['navbar', 'menu', 'menue', 'nav'],
    navbar: ['navigation', 'menu', 'menue', 'nav'],
    fusszeile: ['footer', 'seitenende'],
    footer: ['fusszeile', 'seitenende'],
    schaltflaeche: ['button', 'btn', 'knopf'],
    button: ['schaltflaeche', 'btn', 'knopf'],
    karte: ['card', 'cards', 'kachel'],
    card: ['karte', 'cards', 'kachel'],
    spalte: ['column', 'col', 'grid'],
    zeile: ['row', 'grid'],
    formular: ['form', 'input', 'eingabe'],
    text: ['absatz', 'paragraph', 'typografie'],
    ueberschrift: ['heading', 'headline', 'titel'],
    slider: ['carousel', 'slideshow'],
    accordions: ['accordion', 'faq'],
    accordion: ['faq', 'aufklappbar'],
    hero: ['header', 'buehne', 'intro'],
    suche: ['search', 'filter']
  };

  function normalize(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[äöüßàáâèéêìíîòóôùúû]/g, (char) => NORMALIZE_MAP[char] || char)
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function expandedTerms(query) {
    const base = normalize(query).split(' ').filter(Boolean);
    const all = new Set(base);
    base.forEach((term) => {
      (SYNONYMS[term] || []).forEach((item) => all.add(normalize(item)));
    });
    return Array.from(all);
  }

  function blockSearchText(block) {
    const category = block.get('category');
    const categoryText = typeof category === 'string'
      ? category
      : category && (category.get
        ? category.get('label') || category.get('id')
        : category.label || category.id);
    const attributes = block.get('attributes') || {};

    return normalize([
      block.get('id'),
      block.get('label'),
      categoryText,
      attributes.title,
      attributes['data-keywords'],
      block.get('keywords')
    ].filter(Boolean).join(' '));
  }

  function escapeSelector(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(String(value));
    }
    return String(value).replace(/["\\]/g, '\\$&');
  }

  window.registerOluntirBlockSearch = function registerOluntirBlockSearch(editor) {
    if (!editor || editor.__openOluntirBlockSearch) return;
    editor.__openOluntirBlockSearch = true;

    const manager = editor.BlockManager;
    let root = null;
    let input = null;
    let status = null;
    let clearButton = null;
    let currentQuery = '';
    let entries = [];
    let filterTimer = 0;
    let rebuildTimer = 0;

    function rebuildIndex() {
      if (!root) return;
      entries = manager.getAll().map((block) => {
        const id = String(block.get('id'));
        const element = root.querySelector(`.gjs-block[data-id="${escapeSelector(id)}"]`);
        return element ? { element, text: blockSearchText(block) } : null;
      }).filter(Boolean);
    }

    function updateCategories(hasQuery) {
      if (!root) return;
      root.querySelectorAll('.gjs-block-category').forEach((category) => {
        const blocks = category.querySelectorAll('.gjs-block');
        let visible = false;
        for (let index = 0; index < blocks.length; index += 1) {
          if (!blocks[index].hidden) {
            visible = true;
            break;
          }
        }
        category.hidden = hasQuery && !visible;
      });
    }

    function applyFilter() {
      filterTimer = 0;
      if (!root) return;

      const terms = expandedTerms(currentQuery);
      const hasQuery = terms.length > 0;
      let visibleCount = 0;

      entries.forEach((entry) => {
        const matches = !hasQuery || terms.some((term) => entry.text.includes(term));
        if (entry.element.hidden === matches) entry.element.hidden = !matches;
        if (entry.element.getAttribute('aria-hidden') !== (matches ? 'false' : 'true')) {
          entry.element.setAttribute('aria-hidden', matches ? 'false' : 'true');
        }
        if (matches) visibleCount += 1;
      });

      updateCategories(hasQuery);

      if (status) {
        status.textContent = hasQuery
          ? (visibleCount
            ? tr('search.found', { count: visibleCount, suffix: visibleCount === 1 ? '' : (window.OluntirI18N && window.OluntirI18N.getLanguage() === 'en' ? 's' : 'e') })
            : tr('search.none'))
          : tr('search.available', { count: entries.length });
      }
      if (clearButton) clearButton.hidden = !currentQuery;
    }

    function scheduleFilter() {
      window.clearTimeout(filterTimer);
      filterTimer = window.setTimeout(applyFilter, 60);
    }

    function scheduleRebuild() {
      window.clearTimeout(rebuildTimer);
      rebuildTimer = window.setTimeout(() => {
        rebuildIndex();
        applyFilter();
      }, 100);
    }

    function mount() {
      const container = manager.getContainer();
      if (!container || !container.parentElement) return false;
      if (container.parentElement.querySelector(':scope > .pb-block-search')) return true;

      root = container;
      const search = document.createElement('div');
      search.className = 'pb-block-search';
      search.innerHTML = `
        <label class="pb-block-search-label" for="pb-block-search-input">${tr('search.label')}</label>
        <div class="pb-block-search-row">
          <span class="pb-block-search-icon" aria-hidden="true">⌕</span>
          <input id="pb-block-search-input" type="search" autocomplete="off"
            placeholder="${tr('search.placeholder')}" aria-describedby="pb-block-search-status">
          <button type="button" class="pb-block-search-clear" title="${tr('search.clear')}" aria-label="${tr('search.clear')}" hidden>×</button>
        </div>
        <div id="pb-block-search-status" class="pb-block-search-status" aria-live="polite"></div>`;

      // Als Geschwisterelement einfügen. Dadurch bleibt GrapesJS alleiniger Besitzer
      // seines Block-Containers und Klick-/Drag-Ereignisse werden nicht gestört.
      container.parentElement.insertBefore(search, container);

      input = search.querySelector('input');
      status = search.querySelector('.pb-block-search-status');
      clearButton = search.querySelector('.pb-block-search-clear');

      input.addEventListener('input', () => {
        currentQuery = input.value;
        scheduleFilter();
      });
      input.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        input.value = '';
        currentQuery = '';
        applyFilter();
        input.blur();
      });
      clearButton.addEventListener('click', () => {
        input.value = '';
        currentQuery = '';
        applyFilter();
        input.focus();
      });

      rebuildIndex();
      applyFilter();
      window.addEventListener('oluntir:languagechange', () => {
        search.querySelector('.pb-block-search-label').textContent = tr('search.label');
        input.placeholder = tr('search.placeholder');
        clearButton.title = tr('search.clear'); clearButton.setAttribute('aria-label', tr('search.clear'));
        applyFilter();
      });
      return true;
    }

    function mountWithRetry(attempt) {
      if (mount()) return;
      if (attempt >= 10) return;
      window.setTimeout(() => mountWithRetry(attempt + 1), 100);
    }

    editor.on('load', () => window.requestAnimationFrame(() => mountWithRetry(0)));
    editor.on('block:add block:remove block:update', scheduleRebuild);
    window.requestAnimationFrame(() => mountWithRetry(0));
  };
})();
