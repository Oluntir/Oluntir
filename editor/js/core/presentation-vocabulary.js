(function () {
  'use strict';

  const VOCABULARY = Object.freeze({
    color: Object.freeze({ css: 'color', group: 'typography' }),
    fontSize: Object.freeze({ css: 'font-size', group: 'typography' }),
    fontWeight: Object.freeze({ css: 'font-weight', group: 'typography' }),
    fontFamily: Object.freeze({ css: 'font-family', group: 'typography' }),
    lineHeight: Object.freeze({ css: 'line-height', group: 'typography' }),
    letterSpacing: Object.freeze({ css: 'letter-spacing', group: 'typography' }),
    textAlign: Object.freeze({ css: 'text-align', group: 'typography' }),
    textDecoration: Object.freeze({ css: 'text-decoration', group: 'typography' }),
    backgroundColor: Object.freeze({ css: 'background-color', group: 'surface' }),
    borderColor: Object.freeze({ css: 'border-color', group: 'surface' }),
    borderRadius: Object.freeze({ css: 'border-radius', group: 'surface' }),
    width: Object.freeze({ css: 'width', group: 'geometry' }),
    height: Object.freeze({ css: 'height', group: 'geometry' }),
    objectFit: Object.freeze({ css: 'object-fit', group: 'media' })
  });

  const CSS_TO_TERM = Object.freeze(Object.keys(VOCABULARY).reduce((result, term) => {
    result[VOCABULARY[term].css] = term;
    return result;
  }, {}));
  const ATTRIBUTE_PREFIX = 'data-oluntir-presentation-';

  function semanticAttributeName(term) {
    const entry = VOCABULARY[term];
    return ATTRIBUTE_PREFIX + (entry ? entry.css : String(term || '').replace(/[A-Z]/g, match => '-' + match.toLowerCase()));
  }

  function semanticAttributeCandidates(term) {
    const canonical = semanticAttributeName(term);
    const legacyCamel = ATTRIBUTE_PREFIX + term;
    const legacyLower = legacyCamel.toLowerCase();
    return Array.from(new Set([canonical, legacyCamel, legacyLower]));
  }


  function parseInlineStyle(value) {
    const result = {};
    String(value || '').split(';').forEach((entry) => {
      const separator = entry.indexOf(':');
      if (separator < 1) return;
      const name = entry.slice(0, separator).trim().toLowerCase();
      const propertyValue = entry.slice(separator + 1).trim();
      if (name && propertyValue) result[name] = propertyValue;
    });
    return result;
  }

  function normalizeCssMap(input) {
    const result = {};
    Object.keys(input || {}).forEach((name) => {
      const cssName = VOCABULARY[name] ? VOCABULARY[name].css : String(name || '').trim().toLowerCase();
      if (!CSS_TO_TERM[cssName]) return;
      const value = input[name];
      if (value == null || String(value).trim() === '') return;
      result[cssName] = String(value).trim();
    });
    return result;
  }

  function semanticAttributes(attributes) {
    const result = {};
    const source = attributes || {};
    const caseInsensitive = {};
    Object.keys(source).forEach((name) => { caseInsensitive[String(name).toLowerCase()] = source[name]; });
    Object.keys(VOCABULARY).forEach((term) => {
      let value;
      semanticAttributeCandidates(term).some((name) => {
        const direct = source[name];
        const fallback = caseInsensitive[String(name).toLowerCase()];
        const candidate = direct != null ? direct : fallback;
        if (candidate == null || String(candidate).trim() === '') return false;
        value = candidate;
        return true;
      });
      if (value != null) result[VOCABULARY[term].css] = String(value).trim();
    });
    return result;
  }

  function capture(component) {
    if (!component) return {};
    const attributes = typeof component.getAttributes === 'function' ? component.getAttributes() || {} : {};
    const semantic = semanticAttributes(attributes);
    const inline = parseInlineStyle(attributes.style);
    const modelStyle = typeof component.getStyle === 'function' ? component.getStyle() || {} : {};
    return normalizeCssMap(Object.assign({}, semantic, inline, modelStyle));
  }

  function serialize(presentation) {
    const normalized = normalizeCssMap(presentation);
    return Object.keys(normalized).sort().map((name) => `${name}: ${normalized[name]}`).join('; ');
  }

  function updateAttributes(component, normalized, persistInline) {
    const attributes = typeof component.getAttributes === 'function' ? Object.assign({}, component.getAttributes() || {}) : {};
    Object.keys(attributes).forEach((name) => {
      if (String(name).toLowerCase().indexOf(ATTRIBUTE_PREFIX) === 0) delete attributes[name];
    });
    Object.keys(normalized).forEach((cssName) => {
      const term = CSS_TO_TERM[cssName];
      if (term) attributes[semanticAttributeName(term)] = normalized[cssName];
    });
    if (persistInline !== false) {
      const existingInline = parseInlineStyle(attributes.style);
      const retainedInline = {};
      Object.keys(existingInline).forEach((name) => {
        if (!CSS_TO_TERM[name]) retainedInline[name] = existingInline[name];
      });
      const value = Object.keys(Object.assign({}, retainedInline, normalized)).sort()
        .map((name) => `${name}: ${Object.assign({}, retainedInline, normalized)[name]}`).join('; ');
      if (value) attributes.style = value;
      else delete attributes.style;
    }
    if (typeof component.set === 'function') component.set('attributes', attributes);
    else if (typeof component.addAttributes === 'function') component.addAttributes(attributes);
  }

  function apply(component, presentation, options) {
    if (!component) return false;
    const normalized = normalizeCssMap(presentation);
    const before = capture(component);
    const changed = JSON.stringify(before) !== JSON.stringify(normalized);
    if (typeof component.setStyle === 'function') component.setStyle(normalized);
    else if (typeof component.addStyle === 'function') component.addStyle(normalized);
    updateAttributes(component, normalized, !options || options.persistInline !== false);
    return changed;
  }

  function copy(source, target) {
    return apply(target, capture(source), { persistInline: true });
  }

  function childComponents(component) {
    if (!component || typeof component.components !== 'function') return [];
    const collection = component.components();
    if (!collection) return [];
    if (Array.isArray(collection)) return collection;
    if (Array.isArray(collection.models)) return collection.models;
    const result = [];
    if (typeof collection.forEach === 'function') collection.forEach((item) => result.push(item));
    return result;
  }

  function hydrate(component, recursive) {
    if (!component) return false;
    const attributes = typeof component.getAttributes === 'function' ? component.getAttributes() || {} : {};
    const semantic = semanticAttributes(attributes);
    let changed = false;
    if (Object.keys(semantic).length) {
      const current = typeof component.getStyle === 'function' ? normalizeCssMap(component.getStyle() || {}) : {};
      const next = Object.assign({}, current, semantic);
      if (JSON.stringify(current) !== JSON.stringify(next)) {
        if (typeof component.setStyle === 'function') component.setStyle(next);
        else if (typeof component.addStyle === 'function') component.addStyle(next);
        changed = true;
      }
      updateAttributes(component, next, true);
    }
    if (recursive !== false) childComponents(component).forEach((child) => { if (hydrate(child, true)) changed = true; });
    return changed;
  }


  function persist(component, recursive) {
    if (!component) return false;
    let changed = apply(component, capture(component), { persistInline: true });
    if (recursive !== false) childComponents(component).forEach((child) => { if (persist(child, true)) changed = true; });
    return changed;
  }

  function materializeHtml(html, options) {
    const value = String(html || '');
    if (typeof document === 'undefined' || !document.createElement) return value;
    const template = document.createElement('template');
    template.innerHTML = value;
    const stripMetadata = !options || options.stripMetadata !== false;
    const all = Array.from(template.content.querySelectorAll('*'));
    all.forEach((element) => {
      const inline = parseInlineStyle(element.getAttribute('style') || '');
      const semantic = {};
      Object.keys(VOCABULARY).forEach((term) => {
        semanticAttributeCandidates(term).forEach((attribute) => {
          const attrValue = element.getAttribute(attribute);
          if (attrValue != null && String(attrValue).trim() !== '') semantic[VOCABULARY[term].css] = String(attrValue).trim();
          if (stripMetadata) element.removeAttribute(attribute);
        });
      });
      const merged = Object.assign({}, inline, semantic);
      const serialized = Object.keys(merged).sort().map((name) => `${name}: ${merged[name]}`).join('; ');
      if (serialized) element.setAttribute('style', serialized);
      else element.removeAttribute('style');
    });
    const output = template.innerHTML;
    return output;
  }

  function terms(presentation) {
    const css = normalizeCssMap(presentation);
    const result = {};
    Object.keys(css).forEach((name) => { const term = CSS_TO_TERM[name]; if (term) result[term] = css[name]; });
    return result;
  }

  window.OluntirPresentationApi = Object.freeze({
    schemaVersion: 2,
    vocabulary: VOCABULARY,
    attributePrefix: ATTRIBUTE_PREFIX,
    capture,
    apply,
    copy,
    hydrate,
    hydrateTree(component) { return hydrate(component, true); },
    persist(component) { return persist(component, false); },
    persistTree(component) { return persist(component, true); },
    materializeHtml,
    serialize,
    terms,
    normalize: normalizeCssMap,
    supports(term) { return Boolean(VOCABULARY[term] || CSS_TO_TERM[term]); }
  });
})();
