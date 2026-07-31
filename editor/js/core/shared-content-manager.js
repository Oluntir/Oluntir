(function () {
  'use strict';

  const REGION_SELECTORS = {
    header: 'header',
    navigation: 'nav',
    footer: 'footer'
  };

  let editor = null;
  let applying = false;
  let flushTimer = 0;
  let pendingFlushPage = null;
  let lastRegionsJson = '';

  function enabled() {
    const includes = window.OluntirIncludes;
    if (!includes || typeof includes.getState !== 'function') return false;
    const state = includes.getState();
    return Boolean(state && state.enabled);
  }

  function pageHtml(page) {
    if (!page || typeof page.getMainComponent !== 'function') return '';
    const component = page.getMainComponent();
    if (!component) return '';
    if (typeof component.getInnerHTML === 'function') {
      return String(component.getInnerHTML() || '');
    }
    if (editor && typeof editor.getHtml === 'function') {
      try { return String(editor.getHtml({ component }) || ''); } catch (_) { /* fallback */ }
    }
    return typeof component.toHTML === 'function' ? String(component.toHTML() || '') : '';
  }

  function parseRegions(html) {
    const template = document.createElement('template');
    template.innerHTML = String(html || '');
    const result = {};
    Object.keys(REGION_SELECTORS).forEach((name) => {
      const element = template.content.querySelector(REGION_SELECTORS[name]);
      result[name] = element ? element.outerHTML : '';
    });
    return result;
  }

  function regionFingerprint(regions) {
    return JSON.stringify({
      header: String(regions && regions.header || ''),
      navigation: String(regions && regions.navigation || ''),
      footer: String(regions && regions.footer || '')
    });
  }

  function replaceRegions(html, regions) {
    const template = document.createElement('template');
    template.innerHTML = String(html || '');

    function replace(name) {
      const value = String(regions && regions[name] || '').trim();
      if (!value) return;
      const replacementTemplate = document.createElement('template');
      replacementTemplate.innerHTML = value;
      const replacement = replacementTemplate.content.firstElementChild;
      if (!replacement) return;

      const selector = REGION_SELECTORS[name];
      const matches = Array.from(template.content.querySelectorAll(selector));
      const current = matches.shift();
      if (current) {
        current.replaceWith(replacement);
      } else if (name === 'footer') {
        template.content.appendChild(replacement);
      } else {
        template.content.insertBefore(replacement, template.content.firstChild);
      }

      // A shared structural region may occur only once per page. This also
      // repairs pages created by older RC2 builds that inserted duplicates.
      matches.forEach((duplicate) => duplicate.remove());
    }

    replace('header');

    // Navigation can either be a standalone region or be contained in the
    // shared header. Never add a second standalone navigation when the header
    // already owns one.
    const header = template.content.querySelector('header');
    const headerOwnsNavigation = Boolean(header && header.querySelector('nav'));
    if (headerOwnsNavigation) {
      Array.from(template.content.querySelectorAll('nav')).forEach((nav) => {
        if (!header.contains(nav)) nav.remove();
      });
    } else {
      replace('navigation');
    }

    replace('footer');

    // Reusable pages always need an explicit content region between the shared
    // navigation/header and footer. Older or incompletely initialized pages can
    // contain only the shared regions; without <main> the existing editor-only
    // main:empty placeholder has no target and therefore disappears entirely.
    if (!template.content.querySelector('main')) {
      const main = document.createElement('main');
      const footer = template.content.querySelector('footer');
      if (footer) template.content.insertBefore(main, footer);
      else template.content.appendChild(main);
    }

    return template.innerHTML;
  }

  function currentRegions() {
    if (!window.OluntirIncludes || typeof window.OluntirIncludes.getState !== 'function') return null;
    const state = window.OluntirIncludes.getState();
    return state && state.regions ? state.regions : null;
  }

  function applyToPage(page) {
    if (!enabled() || !page) return false;
    const regions = currentRegions();
    if (!regions) return false;
    const before = pageHtml(page);
    const after = replaceRegions(before, regions);
    if (before === after) return false;

    const component = page.getMainComponent && page.getMainComponent();
    if (!component || typeof component.components !== 'function') return false;
    applying = true;
    try {
      component.components(after);
    } finally {
      applying = false;
    }
    return true;
  }

  function applyToAll(excludedPage) {
    if (!editor || !editor.Pages || !enabled()) return 0;
    let changed = 0;
    editor.Pages.getAll().forEach((page) => {
      if (page === excludedPage) return;
      if (applyToPage(page)) changed += 1;
    });
    return changed;
  }

  function flushPage(page, options) {
    if (!enabled() || !page || !window.OluntirIncludes || typeof window.OluntirIncludes.updateLayoutRegions !== 'function') {
      return false;
    }
    const regions = parseRegions(pageHtml(page));
    const hasAnyRegion = Object.keys(REGION_SELECTORS).some((name) => String(regions[name] || '').trim());
    if (!hasAnyRegion) return false;

    const before = regionFingerprint(currentRegions());
    window.OluntirIncludes.updateLayoutRegions(regions);
    const after = regionFingerprint(currentRegions());
    lastRegionsJson = after;
    const changed = before !== after;
    if (changed && !(options && options.propagate === false)) applyToAll(page);
    return changed;
  }

  function flushSelected() {
    if (!editor || !editor.Pages) return false;
    return flushPage(editor.Pages.getSelected());
  }

  function isRichTextEditing() {
    return typeof window.OluntirIsRichTextEditing === 'function' && window.OluntirIsRichTextEditing();
  }

  function flushPending(options) {
    const page = pendingFlushPage;
    if (flushTimer) {
      window.clearTimeout(flushTimer);
      flushTimer = 0;
    }
    pendingFlushPage = null;
    if (!page || isRichTextEditing()) return false;
    return flushPage(page, options);
  }

  function scheduleFlush() {
    // Bind the delayed transaction to the page on which the component event
    // actually occurred. A page switch during the debounce window must never
    // make the timer read shared regions from the newly selected page.
    if (applying || !enabled() || isRichTextEditing()) return;
    pendingFlushPage = editor && editor.Pages ? editor.Pages.getSelected() : null;
    window.clearTimeout(flushTimer);
    flushTimer = window.setTimeout(() => {
      flushTimer = 0;
      const page = pendingFlushPage;
      pendingFlushPage = null;
      if (!page || isRichTextEditing()) return;
      flushPage(page);
    }, 60);
  }

  function bind(nextEditor) {
    if (!nextEditor || editor === nextEditor) return;
    editor = nextEditor;
    lastRegionsJson = regionFingerprint(currentRegions());

    // GrapesJS fires these events for direct text edits, component changes,
    // drag-and-drop operations and trait updates. A short debounce combines the
    // many events generated by one user action into a single shared-state update.
    ['component:update', 'component:add', 'component:remove', 'component:styleUpdate'].forEach((eventName) => {
      editor.on(eventName, scheduleFlush);
    });

    editor.on('load', () => {
      const selected = editor.Pages && editor.Pages.getSelected();
      if (selected) {
        const stateFingerprint = regionFingerprint(currentRegions());
        const pageFingerprint = regionFingerprint(parseRegions(pageHtml(selected)));
        if (stateFingerprint === regionFingerprint({ header: '', navigation: '', footer: '' }) && pageFingerprint !== stateFingerprint) {
          flushPage(selected);
        } else {
          applyToAll(selected);
          applyToPage(selected);
        }
      }
    });
  }

  window.OluntirSharedContentManager = {
    bind,
    isEnabled: enabled,
    flushPage,
    flushSelected,
    flushPending,
    applyToPage,
    applyToAll,
    getRegionsFromPage: (page) => Object.assign({}, parseRegions(pageHtml(page))),
    getPageHtml: pageHtml
  };
})();
