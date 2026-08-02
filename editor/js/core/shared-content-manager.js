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
  let exportPreparing = false;
  let exportCommitSequence = 0;
  let completedExportCommitSequence = 0;
  let lastRegionsJson = '';
  const pageRegionCache = new WeakMap();
  const pageAppliedFingerprints = new WeakMap();
  const modelAuthoritativePages = new WeakSet();

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
      const raw = element ? element.outerHTML : '';
      const semantics = window.OluntirTemplateSemantics;
      result[name] = semantics && typeof semantics.normalizeReferencedIds === 'function'
        ? semantics.normalizeReferencedIds(raw)
        : raw;
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

    const semantics = window.OluntirTemplateSemantics;
    return semantics && typeof semantics.normalizeReferencedIds === 'function'
      ? semantics.normalizeReferencedIds(template.innerHTML)
      : template.innerHTML;
  }

  function currentRegions() {
    if (!window.OluntirIncludes || typeof window.OluntirIncludes.getState !== 'function') return null;
    const state = window.OluntirIncludes.getState();
    return state && state.regions ? state.regions : null;
  }

  function parseRegionElement(html, selector) {
    const template = document.createElement('template');
    template.innerHTML = String(html || '').trim();
    return template.content.querySelector(selector);
  }

  function componentAttributes(component) {
    if (!component || typeof component.getAttributes !== 'function') return {};
    return Object.assign({}, component.getAttributes() || {});
  }

  function elementAttributes(element) {
    const result = {};
    if (!element || !element.attributes) return result;
    Array.from(element.attributes).forEach((attribute) => {
      result[attribute.name] = attribute.value;
    });
    return result;
  }

  function sameAttributes(left, right) {
    return JSON.stringify(left || {}) === JSON.stringify(right || {});
  }

  function updateRegionComponent(component, tagName, html) {
    const value = String(html || '').trim();
    if (!value) return false;
    const selector = String(tagName || '').toLowerCase();
    const element = parseRegionElement(value, selector);
    if (!element || !component || componentTagName(component) !== selector || typeof component.components !== 'function') return false;

    const nextInnerHtml = String(element.innerHTML || '');
    const currentInnerHtml = typeof component.getInnerHTML === 'function'
      ? String(component.getInnerHTML() || '')
      : '';
    const nextAttributes = elementAttributes(element);
    const currentAttributes = componentAttributes(component);
    let changed = false;

    if (currentInnerHtml !== nextInnerHtml) {
      component.components(nextInnerHtml);
      const presentationApi = window.OluntirPresentationApi;
      if (presentationApi && typeof presentationApi.hydrateTree === 'function') presentationApi.hydrateTree(component);
      changed = true;
    }
    if (!sameAttributes(currentAttributes, nextAttributes) && typeof component.set === 'function') {
      component.set('attributes', nextAttributes);
      const presentationApi = window.OluntirPresentationApi;
      if (presentationApi && typeof presentationApi.hydrate === 'function') presentationApi.hydrate(component, false);
      changed = true;
    }
    return changed;
  }

  function applyToPage(page) {
    if (!enabled() || !page) return false;
    const regions = currentRegions();
    if (!regions) return false;
    const root = page.getMainComponent && page.getMainComponent();
    if (!root) return false;

    // Update only the three shared subtrees. Replacing the complete page root
    // detaches the GrapesJS frame and is especially expensive for the index page.
    const fingerprint = regionFingerprint(regions);
    if (pageAppliedFingerprints.get(page) === fingerprint) return false;
    const components = pageRegionComponents(page, root);

    applying = true;
    try {
      let changed = false;
      const headerHtml = String(regions.header || '').trim();
      const headerElement = parseRegionElement(headerHtml, 'header');
      const headerOwnsNavigation = Boolean(headerElement && headerElement.querySelector('nav'));

      if (headerHtml) changed = updateRegionComponent(components.header, 'header', headerHtml) || changed;
      if (!headerOwnsNavigation && String(regions.navigation || '').trim()) {
        changed = updateRegionComponent(components.navigation, 'nav', regions.navigation) || changed;
      }
      if (String(regions.footer || '').trim()) {
        changed = updateRegionComponent(components.footer, 'footer', regions.footer) || changed;
      }
      pageAppliedFingerprints.set(page, fingerprint);
      return changed;
    } finally {
      applying = false;
    }
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
    if (changed && options && options.propagate === true) applyToAll(page);
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
    if (applying || exportPreparing || !enabled() || isRichTextEditing()) return;
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

  function componentTagName(component) {
    if (!component || typeof component.get !== 'function') return '';
    return String(component.get('tagName') || '').toLowerCase();
  }

  function childComponents(component) {
    if (!component || typeof component.components !== 'function') return [];
    const collection = component.components();
    if (!collection) return [];
    if (Array.isArray(collection)) return collection;
    if (Array.isArray(collection.models)) return collection.models;
    return typeof collection.forEach === 'function' ? (() => {
      const result = [];
      collection.forEach((item) => result.push(item));
      return result;
    })() : [];
  }

  function findComponentByTag(component, tagName) {
    if (!component) return null;
    if (componentTagName(component) === tagName) return component;
    const children = childComponents(component);
    for (let index = 0; index < children.length; index += 1) {
      const match = findComponentByTag(children[index], tagName);
      if (match) return match;
    }
    return null;
  }

  function pageRegionComponents(page, root) {
    const cached = pageRegionCache.get(page);
    if (cached && cached.root === root) return cached;
    const resolved = {
      root,
      header: findComponentByTag(root, 'header'),
      navigation: findComponentByTag(root, 'nav'),
      footer: findComponentByTag(root, 'footer')
    };
    pageRegionCache.set(page, resolved);
    return resolved;
  }

  function commitSelectedCanvasToShared(page, options) {
    if (!enabled() || !editor || !page || !editor.Pages || editor.Pages.getSelected() !== page) return false;

    // Quick Setup mutates the GrapesJS model directly. During the following
    // render turn the Canvas DOM can still contain the previous markup. Never
    // copy that stale DOM back into the already updated model on page switch.
    if (modelAuthoritativePages.has(page)) {
      modelAuthoritativePages.delete(page);
      const changed = flushPage(page, { propagate: true });
      const targetPage = options && options.targetPage;
      const targetUpdated = Boolean(targetPage && targetPage !== page && applyToPage(targetPage));
      return changed || targetUpdated;
    }

    let canvasDocument = null;
    try { canvasDocument = editor.Canvas && editor.Canvas.getDocument ? editor.Canvas.getDocument() : null; } catch (_) { /* no canvas */ }
    if (!canvasDocument) return flushPage(page);

    const root = page.getMainComponent && page.getMainComponent();
    if (!root) return false;

    const canvasHeader = canvasDocument.querySelector('header');
    const headerOwnsNavigation = Boolean(canvasHeader && canvasHeader.querySelector('nav'));
    const targets = [
      { name: 'header', tagName: 'header', element: canvasHeader },
      { name: 'navigation', tagName: 'nav', element: headerOwnsNavigation ? null : canvasDocument.querySelector('nav') },
      { name: 'footer', tagName: 'footer', element: canvasDocument.querySelector('footer') }
    ];

    let committed = false;
    applying = true;
    try {
      targets.forEach((target) => {
        if (!target.element) return;
        const regionComponents = pageRegionComponents(page, root);
        const component = target.tagName === 'header' ? regionComponents.header
          : target.tagName === 'nav' ? regionComponents.navigation
            : regionComponents.footer;
        if (!component || typeof component.components !== 'function') return;
        const canvasInnerHtml = String(target.element.innerHTML || '');
        const modelInnerHtml = typeof component.getInnerHTML === 'function'
          ? String(component.getInnerHTML() || '')
          : '';
        if (canvasInnerHtml !== modelInnerHtml) {
          component.components(canvasInnerHtml);
          committed = true;
        }
      });
    } finally {
      applying = false;
    }

    if (flushTimer) {
      window.clearTimeout(flushTimer);
      flushTimer = 0;
    }
    pendingFlushPage = null;

    const regions = parseRegions(pageHtml(page));
    const hasAnyRegion = Object.keys(REGION_SELECTORS).some((name) => String(regions[name] || '').trim());
    if (!hasAnyRegion || !window.OluntirIncludes || typeof window.OluntirIncludes.updateLayoutRegions !== 'function') {
      return committed;
    }

    const before = regionFingerprint(currentRegions());
    window.OluntirIncludes.updateLayoutRegions(regions);
    const after = regionFingerprint(currentRegions());
    lastRegionsJson = after;
    const changed = before !== after;
    if (changed || committed) pageAppliedFingerprints.set(page, after);

    // Synchronize only the page that is about to become visible. Updating every
    // project page during a page switch rebuilds large component trees and can
    // block GrapesJS long enough to lose or delay the selection, especially for
    // the index page. Other pages receive the current central regions when they
    // are selected; export already consumes the same central shared-content state.
    const targetPage = options && options.targetPage;
    const targetUpdated = Boolean(targetPage && targetPage !== page && applyToPage(targetPage));

    return changed || committed || targetUpdated;
  }



  function componentParent(component) {
    return component && typeof component.parent === 'function' ? component.parent() : null;
  }

  function sharedRegionInfo(component) {
    let current = component;
    let nav = null;
    while (current) {
      const tagName = componentTagName(current);
      if (tagName === 'nav') nav = current;
      if (tagName === 'header') return { name: 'header', root: current };
      if (tagName === 'footer') return { name: 'footer', root: current };
      current = componentParent(current);
    }
    return nav ? { name: 'navigation', root: nav } : null;
  }

  function componentIndex(parent, component) {
    const children = childComponents(parent);
    for (let index = 0; index < children.length; index += 1) {
      if (children[index] === component) return index;
      const left = children[index] && typeof children[index].getId === 'function' ? children[index].getId() : null;
      const right = component && typeof component.getId === 'function' ? component.getId() : null;
      if (left && right && left === right) return index;
    }
    return -1;
  }

  function relativeComponentPath(root, component) {
    const path = [];
    let current = component;
    while (current && current !== root) {
      const parent = componentParent(current);
      if (!parent) return null;
      const index = componentIndex(parent, current);
      if (index < 0) return null;
      path.unshift(index);
      current = parent;
    }
    return current === root ? path : null;
  }

  function componentAtPath(root, path) {
    let current = root;
    for (let index = 0; index < path.length; index += 1) {
      const children = childComponents(current);
      current = children[path[index]] || null;
      if (!current) return null;
    }
    return current;
  }

  function copyEditableState(source, target) {
    if (!source || !target) return false;
    let changed = false;
    const sourceInner = typeof source.getInnerHTML === 'function' ? String(source.getInnerHTML() || '') : '';
    const targetInner = typeof target.getInnerHTML === 'function' ? String(target.getInnerHTML() || '') : '';
    if (sourceInner !== targetInner && typeof target.components === 'function') {
      target.components(sourceInner);
      changed = true;
    }

    const protectedAttributes = /^(id|data-oluntir-|data-gjs-|data-pb-unit|data-pb-page)/i;
    const sourceAttributes = componentAttributes(source);
    const targetAttributes = componentAttributes(target);
    const nextAttributes = Object.assign({}, targetAttributes);
    Object.keys(nextAttributes).forEach((name) => {
      if (!protectedAttributes.test(name) && !Object.prototype.hasOwnProperty.call(sourceAttributes, name)) delete nextAttributes[name];
    });
    Object.keys(sourceAttributes).forEach((name) => {
      if (!protectedAttributes.test(name)) nextAttributes[name] = sourceAttributes[name];
    });
    if (!sameAttributes(targetAttributes, nextAttributes) && typeof target.set === 'function') {
      target.set('attributes', nextAttributes);
      changed = true;
    }

    const presentationApi = window.OluntirPresentationApi;
    if (presentationApi && typeof presentationApi.copy === 'function') {
      if (presentationApi.copy(source, target)) changed = true;
    } else {
      const sourceStyle = source && typeof source.getStyle === 'function' ? Object.assign({}, source.getStyle() || {}) : {};
      const targetStyle = target && typeof target.getStyle === 'function' ? Object.assign({}, target.getStyle() || {}) : {};
      if (JSON.stringify(sourceStyle) !== JSON.stringify(targetStyle)) {
        if (typeof target.setStyle === 'function') target.setStyle(sourceStyle);
        else if (typeof target.addStyle === 'function') target.addStyle(sourceStyle);
        changed = true;
      }
    }
    return changed;
  }

  function styleAttributeValue(component) {
    if (!component || typeof component.getStyle !== 'function') return '';
    const styles = Object.assign({}, component.getStyle() || {});
    return Object.keys(styles)
      .filter((name) => styles[name] != null && String(styles[name]).trim() !== '')
      .sort()
      .map((name) => `${name}: ${String(styles[name]).trim()}`)
      .join('; ');
  }

  function persistEditableStyleInMarkup(component) {
    const presentationApi = window.OluntirPresentationApi;
    if (presentationApi && typeof presentationApi.capture === 'function' && typeof presentationApi.apply === 'function') {
      const before = component && typeof component.getAttributes === 'function'
        ? String((component.getAttributes() || {}).style || '').trim().replace(/;\s*$/, '')
        : '';
      const presentation = presentationApi.capture(component);
      presentationApi.apply(component, presentation, { persistInline: true });
      const after = component && typeof component.getAttributes === 'function'
        ? String((component.getAttributes() || {}).style || '').trim().replace(/;\s*$/, '')
        : '';
      return before !== after;
    }
    if (!component || typeof component.getAttributes !== 'function' || typeof component.set !== 'function') return false;
    const attributes = Object.assign({}, component.getAttributes() || {});
    const nextStyle = styleAttributeValue(component);
    const currentStyle = String(attributes.style || '').trim().replace(/;\s*$/, '');
    if (currentStyle === nextStyle) return false;
    if (nextStyle) attributes.style = nextStyle;
    else delete attributes.style;
    component.set('attributes', attributes);
    return true;
  }

  function renderComponent(component) {
    try {
      if (component && component.view && typeof component.view.render === 'function') component.view.render();
    } catch (_) { /* GrapesJS refresh fallback below */ }
    try {
      if (editor && typeof editor.refresh === 'function') editor.refresh({ tools: true });
    } catch (_) { /* optional */ }
  }

  function commitSharedComponentChange(component, page, options) {
    if (!enabled() || !editor || !component || !page) return false;
    const info = sharedRegionInfo(component);
    if (!info) return false;
    const path = relativeComponentPath(info.root, component);
    if (!path) return false;

    if (flushTimer) {
      window.clearTimeout(flushTimer);
      flushTimer = 0;
    }
    pendingFlushPage = null;
    modelAuthoritativePages.add(page);
    // GrapesJS stores component styles in CssComposer. Shared Content persists
    // HTML regions, so mirror the edited component style into its markup before
    // the central snapshot and target-page propagation are created.
    persistEditableStyleInMarkup(component);
    renderComponent(component);

    let changed = false;
    applying = true;
    try {
      if (options && options.propagate === false) return false;
      editor.Pages.getAll().forEach((targetPage) => {
        if (targetPage === page) return;
        const root = targetPage.getMainComponent && targetPage.getMainComponent();
        if (!root) return;
        const regions = pageRegionComponents(targetPage, root);
        const targetRoot = info.name === 'header' ? regions.header : info.name === 'navigation' ? regions.navigation : regions.footer;
        const target = targetRoot && componentAtPath(targetRoot, path);
        if (target && copyEditableState(component, target)) {
          const presentationApi = window.OluntirPresentationApi;
          if (presentationApi && typeof presentationApi.hydrate === 'function') presentationApi.hydrate(target, false);
          changed = true;
        }
      });
    } finally {
      applying = false;
    }

    // Refresh the central shared snapshot once, but do not rebuild every page.
    const centralChanged = flushPage(page, { propagate: false });
    pageAppliedFingerprints.set(page, regionFingerprint(currentRegions()));
    if (typeof editor.store === 'function') {
      window.clearTimeout(commitSharedComponentChange.storeTimer || 0);
      commitSharedComponentChange.storeTimer = window.setTimeout(() => {
        Promise.resolve(editor.store()).catch((error) => {
          console.warn('Schnellbearbeitung konnte nicht gespeichert werden:', error);
        });
      }, 0);
    }
    return changed || centralChanged;
  }

  function commitModelChange(page, options) {
    if (!enabled() || !editor || !page) return false;
    if (flushTimer) {
      window.clearTimeout(flushTimer);
      flushTimer = 0;
    }
    pendingFlushPage = null;
    modelAuthoritativePages.add(page);
    const changed = flushPage(page, { propagate: !options || options.propagate !== false });
    if (typeof editor.store === 'function') {
      Promise.resolve().then(() => editor.store()).catch((error) => {
        console.warn('Schnellbearbeitung konnte nicht sofort gespeichert werden:', error);
      });
    }
    return changed;
  }

  async function prepareForExport(page) {
    if (!enabled() || !page) {
      return Object.freeze({ committed: false, pendingFlush: false, commitToken: null });
    }

    const commitToken = ++exportCommitSequence;
    exportPreparing = true;
    try {
      if (flushTimer) {
        window.clearTimeout(flushTimer);
        flushTimer = 0;
      }
      pendingFlushPage = null;

      // Export is model-first and read-only with regard to presentation. The
      // quick-edit translation already persists the edited component through
      // semantic data-oluntir-presentation-* attributes and matching inline CSS.
      // Do not walk the complete shared tree here: capturing every GrapesJS
      // model style would freeze framework/default values (for example black
      // footer headings) as inline CSS and would visibly change the canvas just
      // before export. materializeHtml() resolves only explicitly translated
      // presentation metadata when the immutable export snapshot is created.
      const committed = flushPage(page, { propagate: true });
      applyToAll(page);

      // GrapesJS may emit component events while the model is committed. Keep
      // scheduling suppressed through the next render turn and then discard any
      // debounce that belongs to this already committed transaction.
      await new Promise((resolve) => {
        if (typeof window.requestAnimationFrame === 'function') {
          window.requestAnimationFrame(() => resolve());
        } else {
          window.setTimeout(resolve, 0);
        }
      });

      if (flushTimer) {
        window.clearTimeout(flushTimer);
        flushTimer = 0;
      }
      pendingFlushPage = null;
      completedExportCommitSequence = commitToken;

      return Object.freeze({ committed: Boolean(committed), pendingFlush: false, commitToken });
    } finally {
      exportPreparing = false;
    }
  }

  function verifyExportCommit(commitToken) {
    const token = Number(commitToken || 0);
    return Boolean(token > 0 && completedExportCommitSequence >= token && !exportPreparing);
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
    commitSelectedCanvasToShared,
    commitModelChange,
    commitSharedComponentChange,
    prepareForExport,
    verifyExportCommit,
    applyToPage,
    applyToAll,
    getRegionsFromPage: (page) => Object.assign({}, parseRegions(pageHtml(page))),
    getPageHtml: pageHtml,
    getDiagnostics: () => {
      const selected = editor && editor.Pages && editor.Pages.getSelected ? editor.Pages.getSelected() : null;
      const centralFingerprint = regionFingerprint(currentRegions());
      const selectedFingerprint = selected ? regionFingerprint(parseRegions(pageHtml(selected))) : null;
      return Object.freeze({
        enabled: enabled(), applying: Boolean(applying), exportPreparing: Boolean(exportPreparing), pendingFlush: Boolean(flushTimer || pendingFlushPage),
        exportCommitSequence, completedExportCommitSequence,
        centralFingerprint, selectedFingerprint, selectedPageId: selected && selected.getId ? selected.getId() : null,
        selectedUpToDate: Boolean(selected && centralFingerprint === selectedFingerprint)
      });
    }
  };
})();
