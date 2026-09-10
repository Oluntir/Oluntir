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
  let pendingSharedComponent = null;
  let pendingFlushOptions = null;
  let exportPreparing = false;
  let exportCommitSequence = 0;
  let completedExportCommitSequence = 0;
  let lastRegionsJson = '';
  const pageAppliedFingerprints = new WeakMap();
  const modelAuthoritativePages = new WeakSet();

  function diagnostic(event, details) {
    const payload = Object.assign({ event }, details || {});
    if (window.OluntirLogger && typeof window.OluntirLogger.info === 'function') {
      window.OluntirLogger.info('shared-content', event, payload);
    }
    return payload;
  }

  function enabled() {
    const includes = window.OluntirIncludes;
    if (!includes || typeof includes.getState !== 'function') return false;
    const state = includes.getState();
    return Boolean(state && state.enabled);
  }

  function suppressStructuralEventForRepeatMutation(eventName) {
    const manager = window.OluntirRepeatLibraryManager;
    if (!manager || typeof manager.isProjectMutationActive !== 'function' || !manager.isProjectMutationActive()) return false;
    if (typeof manager.noteSharedStructuralEventSuppressed === 'function') manager.noteSharedStructuralEventSuppressed(eventName);
    return true;
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
      const selector = REGION_SELECTORS[name];
      const matches = Array.from(template.content.querySelectorAll(selector));
      if (!value) {
        matches.forEach((current) => current.remove());
        return;
      }
      const replacementTemplate = document.createElement('template');
      replacementTemplate.innerHTML = value;
      const replacement = replacementTemplate.content.firstElementChild;
      if (!replacement) return;

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

  function applyToPage(page, options) {
    if (!enabled() || !page) return false;
    const regions = currentRegions();
    if (!regions) return false;
    const root = page.getMainComponent && page.getMainComponent();
    if (!root) return false;

    // Fast path: the cache stores only the last shared snapshot fingerprint,
    // never GrapesJS component objects. All edits in shared regions flow through
    // this manager, so an equal fingerprint means that no model mutation is
    // required. Page switches can still request a forced structural check.
    const fingerprint = regionFingerprint(regions);
    const force = Boolean(options && options.force === true);
    if (!force && pageAppliedFingerprints.get(page) === fingerprint) return false;

    // Resolve region roots fresh for every actual write. This preserves the v18
    // stale-reference fix without serializing and reparsing the complete page or
    // retrying a full subtree replacement after every small text edit.
    const components = pageRegionComponents(page, root);
    const missingRegions = [];

    applying = true;
    try {
      let changed = false;
      const headerHtml = String(regions.header || '').trim();
      const navigationHtml = String(regions.navigation || '').trim();
      const footerHtml = String(regions.footer || '').trim();
      const headerElement = parseRegionElement(headerHtml, 'header');
      const headerOwnsNavigation = Boolean(headerElement && headerElement.querySelector('nav'));

      if (headerHtml) {
        if (components.header) changed = updateRegionComponent(components.header, 'header', headerHtml) || changed;
        else missingRegions.push('header');
      }
      if (!headerOwnsNavigation && navigationHtml) {
        if (components.navigation) changed = updateRegionComponent(components.navigation, 'nav', navigationHtml) || changed;
        else missingRegions.push('navigation');
      }
      if (footerHtml) {
        if (components.footer) changed = updateRegionComponent(components.footer, 'footer', footerHtml) || changed;
        else missingRegions.push('footer');
      }

      if (!missingRegions.length) {
        pageAppliedFingerprints.set(page, fingerprint);
      } else {
        pageAppliedFingerprints.delete(page);
        diagnostic('shared-target-apply-incomplete', {
          pageId: page && page.getId ? page.getId() : null,
          force,
          changed,
          missingRegions
        });
      }
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
    const clearRegions = Array.isArray(options && options.clearRegions) ? options.clearRegions.filter((name) => REGION_SELECTORS[name]) : [];
    const hasAnyRegion = Object.keys(REGION_SELECTORS).some((name) => String(regions[name] || '').trim());
    const current = currentRegions() || {};
    const clearsExistingRegion = clearRegions.some((name) => String(current[name] || '').trim() && !String(regions[name] || '').trim());
    if (!hasAnyRegion && !clearsExistingRegion) return false;

    const before = regionFingerprint(current);
    window.OluntirIncludes.updateLayoutRegions(regions, { allowEmpty: clearRegions });
    const after = regionFingerprint(currentRegions());
    lastRegionsJson = after;
    const changed = before !== after;
    const propagatedPages = changed && options && options.propagate === true ? applyToAll(page) : 0;
    diagnostic('page-flushed', {
      pageId: page && page.getId ? page.getId() : null,
      changed,
      propagatedPages,
      propagate: Boolean(options && options.propagate === true)
    });
    return changed;
  }

  function flushSelected() {
    if (!editor || !editor.Pages) return false;
    return flushPage(editor.Pages.getSelected(), { propagate: true });
  }

  function isRichTextEditing() {
    return typeof window.OluntirIsRichTextEditing === 'function' && window.OluntirIsRichTextEditing();
  }

  function flushPending(options) {
    const page = pendingFlushPage;
    const sharedEdit = pendingSharedComponent;
    const scheduledOptions = pendingFlushOptions;
    if (flushTimer) {
      window.clearTimeout(flushTimer);
      flushTimer = 0;
    }
    pendingFlushPage = null;
    pendingSharedComponent = null;
    pendingFlushOptions = null;
    if (!page || isRichTextEditing()) return false;
    if (sharedEdit && sharedEdit.page === page) {
      return commitSharedComponentChange(sharedEdit.component, page, {
        propagate: !options || options.propagate !== false,
        render: false
      });
    }
    return flushPage(page, Object.assign({}, scheduledOptions || {}, options || {}));
  }

  function scheduleFlush(component, options) {
    // Bind the delayed transaction to the page on which the component event
    // actually occurred. A page switch during the debounce window must never
    // make the timer read shared regions from the newly selected page.
    if (applying || exportPreparing || !enabled() || isRichTextEditing()) return;
    pendingFlushPage = editor && editor.Pages ? editor.Pages.getSelected() : null;
    pendingSharedComponent = null;
    pendingFlushOptions = Object.assign({}, options || {});
    if (pendingFlushPage && component && sharedRegionInfo(component) && !pendingFlushOptions.structural) {
      pendingSharedComponent = { page: pendingFlushPage, component };
    }
    window.clearTimeout(flushTimer);
    flushTimer = window.setTimeout(() => {
      flushTimer = 0;
      const page = pendingFlushPage;
      const sharedEdit = pendingSharedComponent;
      const scheduledOptions = pendingFlushOptions;
      pendingFlushPage = null;
      pendingSharedComponent = null;
      pendingFlushOptions = null;
      if (!page || isRichTextEditing()) return;
      if (sharedEdit && sharedEdit.page === page) {
        // The delayed path can be reached while the RTE selection is settling.
        // Rendering here resets the browser caret and makes editing appear
        // unresponsive. The component model is already current for this event.
        commitSharedComponentChange(sharedEdit.component, page, { propagate: true, render: false });
      } else {
        flushPage(page, Object.assign({ propagate: true }, scheduledOptions || {}));
      }
    }, 60);
  }

  function removedSharedRegions(component) {
    const tagName = componentTagName(component);
    if (tagName === 'footer') return ['footer'];
    if (tagName === 'header') return ['header', 'navigation'];
    if (tagName === 'nav') return ['navigation'];
    return [];
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
    // Never retain GrapesJS component object references across mutations.
    // GrapesJS may replace nested component models (especially nav/footer
    // descendants) while getMainComponent() still returns the same root. A
    // long-lived object cache can therefore point to detached subtrees and make
    // propagation appear successful although the live target page is untouched.
    return {
      root,
      header: findComponentByTag(root, 'header'),
      navigation: findComponentByTag(root, 'nav'),
      footer: findComponentByTag(root, 'footer')
    };
  }

  function commitSelectedCanvasToShared(page, options) {
    if (!enabled() || !editor || !page || !editor.Pages || editor.Pages.getSelected() !== page) return false;

    // Compatibility API name retained for callers, but the persistent source is
    // exclusively the GrapesJS project model. Canvas DOM is a render target and
    // may lag behind the model during RTE shutdown or a page/frame transition;
    // therefore it must never be copied back into shared components here.
    if (flushTimer) {
      window.clearTimeout(flushTimer);
      flushTimer = 0;
    }
    pendingFlushPage = null;
    pendingSharedComponent = null;
    pendingFlushOptions = null;
    modelAuthoritativePages.delete(page);

    if (!window.OluntirIncludes || typeof window.OluntirIncludes.updateLayoutRegions !== 'function') return false;
    const regions = parseRegions(pageHtml(page));
    const hasAnyRegion = Object.keys(REGION_SELECTORS).some((name) => String(regions[name] || '').trim());
    if (!hasAnyRegion) {
      diagnostic('model-commit-without-shared-regions', {
        pageId: page.getId ? page.getId() : null,
        source: 'grapesjs-project-model'
      });
      return false;
    }

    const before = regionFingerprint(currentRegions());
    window.OluntirIncludes.updateLayoutRegions(regions);
    const after = regionFingerprint(currentRegions());
    lastRegionsJson = after;
    const changed = before !== after;
    pageAppliedFingerprints.set(page, after);

    const targetPage = options && options.targetPage;
    const propagatedPages = changed ? applyToAll(page) : 0;
    // When the central snapshot changed, applyToAll() already handled the target.
    // Otherwise the fingerprint fast path is sufficient; region component
    // objects themselves are never cached anymore, so a forced second write is
    // unnecessary and was a major source of page-switch CPU churn.
    const targetUpdated = Boolean(
      !changed && targetPage && targetPage !== page && applyToPage(targetPage)
    );
    diagnostic('model-commit', {
      pageId: page.getId ? page.getId() : null,
      targetPageId: targetPage && targetPage.getId ? targetPage.getId() : null,
      source: 'grapesjs-project-model',
      canvasWriteBack: false,
      changed,
      propagatedPages,
      targetUpdated
    });

    return changed || targetUpdated;
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
    if (!path) {
      diagnostic('shared-component-path-missing', {
        pageId: page.getId ? page.getId() : null,
        region: info.name,
        componentTag: componentTagName(component)
      });
      return flushPage(page, { propagate: !options || options.propagate !== false });
    }

    if (flushTimer) {
      window.clearTimeout(flushTimer);
      flushTimer = 0;
    }
    pendingFlushPage = null;
    pendingSharedComponent = null;
    pendingFlushOptions = null;
    // GrapesJS stores component styles in CssComposer. Shared Content persists
    // HTML regions, so mirror a real edited component style into its markup before
    // the central snapshot is created. The persistence write itself may emit
    // component:update/component:styleUpdate. Suppress those self-generated events
    // so one footer edit can never schedule the next 60-ms Shared Content commit.
    const previousApplying = applying;
    applying = true;
    try {
      persistEditableStyleInMarkup(component);
    } finally {
      applying = previousApplying;
    }
    if (!options || options.render !== false) renderComponent(component);

    // Resolve the authoritative central state before touching any target page.
    // GrapesJS can emit multiple component:update events for one logical edit
    // (and can bubble a child edit to the shared root). If the central shared
    // snapshot did not change, there is no new information to propagate. This
    // fast exit prevents redundant target subtree rebuilds and editor.store()
    // calls, which were the main CPU hotspot in the v21 runtime logs.
    const modelRegions = parseRegions(pageHtml(page));
    const modelRegionHtml = info.root && typeof info.root.toHTML === 'function'
      ? String(info.root.toHTML() || '').trim()
      : '';
    if (modelRegionHtml) {
      const semantics = window.OluntirTemplateSemantics;
      modelRegions[info.name] = semantics && typeof semantics.normalizeReferencedIds === 'function'
        ? semantics.normalizeReferencedIds(modelRegionHtml)
        : modelRegionHtml;
    }
    const beforeCentral = regionFingerprint(currentRegions());
    window.OluntirIncludes.updateLayoutRegions(modelRegions);
    const afterCentral = regionFingerprint(currentRegions());
    lastRegionsJson = afterCentral;
    const centralChanged = beforeCentral !== afterCentral;
    pageAppliedFingerprints.set(page, afterCentral);

    if (!centralChanged) {
      diagnostic('shared-component-committed', {
        pageId: page.getId ? page.getId() : null,
        region: info.name,
        path,
        centralChanged: false,
        targetPagesChanged: false,
        targetedPages: 0,
        fallbackPages: 0,
        propagatedPages: 0,
        skippedUnchanged: true
      });
      return false;
    }

    let changed = false;
    const targetedPages = [];
    const fallbackPages = [];
    applying = true;
    try {
      if (options && options.propagate === false) return centralChanged;
      editor.Pages.getAll().forEach((targetPage) => {
        if (targetPage === page) return;
        const root = targetPage.getMainComponent && targetPage.getMainComponent();
        if (!root) return;
        const regions = pageRegionComponents(targetPage, root);
        const targetRoot = info.name === 'header' ? regions.header : info.name === 'navigation' ? regions.navigation : regions.footer;
        const target = targetRoot && componentAtPath(targetRoot, path);
        if (!target) {
          fallbackPages.push(targetPage);
          return;
        }
        targetedPages.push(targetPage);
        if (copyEditableState(component, target)) {
          const presentationApi = window.OluntirPresentationApi;
          if (presentationApi && typeof presentationApi.hydrate === 'function') presentationApi.hydrate(target, false);
          changed = true;
        }
      });
    } finally {
      applying = false;
    }

    // Text/RTE changes have already been copied to the exact corresponding
    // component path above. Do not follow that cheap targeted write with a full
    // header/nav/footer subtree rebuild on every page. Only malformed or older
    // targets where the path cannot be resolved use the structural fallback.
    targetedPages.forEach((targetPage) => pageAppliedFingerprints.set(targetPage, afterCentral));
    let propagatedPages = 0;
    if (!options || options.propagate !== false) {
      fallbackPages.forEach((targetPage) => {
        if (applyToPage(targetPage, { force: true })) propagatedPages += 1;
      });
    }
    diagnostic('shared-component-committed', {
      pageId: page.getId ? page.getId() : null,
      region: info.name,
      path,
      centralChanged,
      targetPagesChanged: changed,
      targetedPages: targetedPages.length,
      fallbackPages: fallbackPages.length,
      propagatedPages,
      skippedUnchanged: false
    });
    if (typeof editor.store === 'function') {
      window.clearTimeout(commitSharedComponentChange.storeTimer || 0);
      commitSharedComponentChange.storeTimer = window.setTimeout(() => {
        Promise.resolve(editor.store()).catch((error) => {
          console.warn('Schnellbearbeitung konnte nicht gespeichert werden:', error);
        });
      }, 180);
    }
    return changed || centralChanged || propagatedPages > 0;
  }

  function commitModelChange(page, options) {
    if (!enabled() || !editor || !page) return false;
    if (flushTimer) {
      window.clearTimeout(flushTimer);
      flushTimer = 0;
    }
    pendingFlushPage = null;
    pendingSharedComponent = null;
    pendingFlushOptions = null;
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
      pendingSharedComponent = null;
      pendingFlushOptions = null;

      // Export is model-first and read-only with regard to presentation. The
      // quick-edit translation already persists the edited component through
      // semantic data-oluntir-presentation-* attributes and matching inline CSS.
      // Do not walk the complete shared tree here: capturing every GrapesJS
      // model style would freeze framework/default values (for example black
      // footer headings) as inline CSS and would visibly change the canvas just
      // before export. materializeHtml() resolves only explicitly translated
      // presentation metadata when the immutable export snapshot is created.
      const committed = flushPage(page, { propagate: true });
      // flushPage() already propagates when the central snapshot changed. If it
      // did not change, cached target fingerprints make a second unconditional
      // full project walk unnecessary.
      if (!committed) applyToAll(page);

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
      pendingSharedComponent = null;
      pendingFlushOptions = null;
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
    // Normal content updates in <main> are irrelevant to Shared Content and
    // previously caused repeated full shared-region reads. Restrict update and
    // style events to components that actually belong to header/nav/footer.
    ['component:update', 'component:styleUpdate'].forEach((eventName) => {
      editor.on(eventName, (component) => {
        if (!component || !sharedRegionInfo(component)) return;
        scheduleFlush(component);
      });
    });
    // Keep add/remove globally observed as a structural safety net: a shared
    // root or child can be inserted/removed before/after its parent relation is
    // fully settled, so these events may still require a page-level flush.
    ['component:add', 'component:remove'].forEach((eventName) => {
      editor.on(eventName, (component) => {
        // Repeat Library project mutations are explicit Oluntir transactions.
        // Their structural add/remove events are generated by materializing a
        // known non-shared Repeat family and must not recursively wake the
        // project-wide Shared Content safety scan. Normal user add/remove events
        // remain observed so header/nav/footer structure stays protected.
        if (suppressStructuralEventForRepeatMutation(eventName)) return;
        // Structural mutations must be committed from the resulting page model,
        // never from the added/removed component object itself. In particular a
        // removed <footer> still has its old toHTML() and would otherwise write
        // itself straight back into the central Shared Content state.
        scheduleFlush(null, {
          structural: true,
          clearRegions: eventName === 'component:remove' ? removedSharedRegions(component) : []
        });
      });
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
