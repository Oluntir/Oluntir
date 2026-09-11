(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirTemplateEmbedIsolator = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const SCHEMA_VERSION = 1;
  const ISOLATABLE_TAGS = new Set(['iframe', 'object', 'embed']);
  const META = Object.freeze({
    isolated: 'data-oluntir-embed-isolated',
    tag: 'data-oluntir-embed-tag',
    activeAttr: 'data-oluntir-embed-active-attr',
    hadActive: 'data-oluntir-embed-had-active',
    originalSource: 'data-oluntir-embed-original-source',
    originalSrcdoc: 'data-oluntir-embed-original-srcdoc',
    originalStyle: 'data-oluntir-embed-original-style',
    hadStyle: 'data-oluntir-embed-had-style',
    originalTabindex: 'data-oluntir-embed-original-tabindex',
    hadTabindex: 'data-oluntir-embed-had-tabindex',
    placeholder: 'data-oluntir-embed-placeholder'
  });

  function text(value) { return String(value == null ? '' : value); }
  function escapeAttr(value) {
    return text(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  function decodeHtmlAttr(value) {
    return text(value)
      .replace(/&quot;/g, '"')
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&');
  }
  function encodePayload(value) { return encodeURIComponent(text(value)); }
  function decodePayload(value) { try { return decodeURIComponent(text(value)); } catch (_) { return text(value); } }

  function getAttr(tag, name) {
    const re = new RegExp(`\\s${name.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
    const match = text(tag).match(re);
    return match ? (match[1] != null ? match[1] : match[2] != null ? match[2] : match[3] || '') : null;
  }
  function hasAttr(tag, name) {
    const re = new RegExp(`\\s${name.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}(?:\\s*=|\\s|/?>)`, 'i');
    return re.test(text(tag));
  }
  function removeAttr(tag, name) {
    const re = new RegExp(`\\s+${name.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}(?:\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+))?`, 'ig');
    return text(tag).replace(re, '');
  }
  function setAttr(tag, name, value) {
    let out = removeAttr(tag, name);
    const insertion = ` ${name}="${escapeAttr(value)}"`;
    if (/\/\s*>$/.test(out)) return out.replace(/\s*\/\s*>$/, `${insertion} />`);
    return out.replace(/\s*>$/, `${insertion}>`);
  }

  function sourceFor(tagName, tag) {
    const candidates = tagName === 'object'
      ? ['data']
      : ['src', 'data-src', 'data-lazy-src', 'data-original', 'data-url'];
    for (const name of candidates) {
      const value = getAttr(tag, name);
      if (value != null && value !== '') return { attr: name, value };
    }
    const srcdoc = tagName === 'iframe' ? getAttr(tag, 'srcdoc') : null;
    if (srcdoc != null) return { attr: 'srcdoc', value: srcdoc };
    return { attr: tagName === 'object' ? 'data' : 'src', value: '' };
  }

  function providerLabel(source, tagName) {
    const value = text(source).trim();
    if (/^https?:\/\//i.test(value)) {
      try { return new URL(value).hostname.replace(/^www\./i, '') || 'Externer Inhalt'; } catch (_) {}
    }
    if (/^\/\//.test(value)) {
      try { return new URL(`https:${value}`).hostname.replace(/^www\./i, '') || 'Externer Inhalt'; } catch (_) {}
    }
    if (tagName === 'object') return 'Eingebettetes Objekt';
    if (tagName === 'embed') return 'Plugin / Embed';
    return 'Externer Inhalt';
  }

  function placeholderSvg(source, tagName) {
    const provider = providerLabel(source, tagName).slice(0, 72);
    const safeProvider = provider.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 800 450" preserveAspectRatio="none"><rect width="800" height="450" fill="#f1f3f5"/><rect x="18" y="18" width="764" height="414" rx="14" fill="none" stroke="#adb5bd" stroke-width="3" stroke-dasharray="12 10"/><circle cx="400" cy="186" r="48" fill="#dee2e6" stroke="#868e96" stroke-width="3"/><path d="M374 186h52M400 160v52M367 158c20 15 46 15 66 0M367 214c20-15 46-15 66 0" fill="none" stroke="#6c757d" stroke-width="4" stroke-linecap="round"/><text x="400" y="274" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" font-weight="700" fill="#343a40">Externer Inhalt im Editor deaktiviert</text><text x="400" y="310" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#6c757d">${safeProvider}</text><text x="400" y="344" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" fill="#868e96">Preview / Export verwendet die Originalquelle</text></svg>`;
  }

  function placeholderUri(source, tagName) {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(placeholderSvg(source, tagName))}`;
  }

  function editorStyle(value) {
    const base = text(value).trim().replace(/;\s*$/, '');
    return `${base}${base ? '; ' : ''}pointer-events: none !important;`;
  }

  function isolateOpeningTag(tagName, rawTag) {
    if (!ISOLATABLE_TAGS.has(tagName)) return { tag: rawTag, isolated: false };
    if (getAttr(rawTag, META.isolated) === '1') return { tag: rawTag, isolated: false };

    const source = sourceFor(tagName, rawTag);
    const activeAttr = tagName === 'object' ? 'data' : 'src';
    const originalActive = getAttr(rawTag, activeAttr);
    const originalSrcdoc = tagName === 'iframe' ? getAttr(rawTag, 'srcdoc') : null;
    const originalStyle = getAttr(rawTag, 'style');
    const originalTabindex = getAttr(rawTag, 'tabindex');
    const displaySource = source.value || (originalSrcdoc != null ? 'Inline-Embed' : tagName);
    const placeholder = placeholderUri(displaySource, tagName);

    let tag = rawTag;
    if (tagName === 'iframe') tag = removeAttr(tag, 'srcdoc');
    tag = setAttr(tag, activeAttr, placeholder);
    tag = setAttr(tag, 'style', editorStyle(originalStyle != null ? originalStyle : ''));
    tag = setAttr(tag, 'tabindex', '-1');
    tag = setAttr(tag, META.isolated, '1');
    tag = setAttr(tag, META.tag, tagName);
    tag = setAttr(tag, META.activeAttr, activeAttr);
    tag = setAttr(tag, META.hadActive, originalActive != null ? '1' : '0');
    tag = setAttr(tag, META.originalSource, encodePayload(originalActive != null ? originalActive : ''));
    if (originalSrcdoc != null) tag = setAttr(tag, META.originalSrcdoc, encodePayload(originalSrcdoc));
    tag = setAttr(tag, META.hadStyle, originalStyle != null ? '1' : '0');
    tag = setAttr(tag, META.originalStyle, encodePayload(originalStyle != null ? originalStyle : ''));
    tag = setAttr(tag, META.hadTabindex, originalTabindex != null ? '1' : '0');
    tag = setAttr(tag, META.originalTabindex, encodePayload(originalTabindex != null ? originalTabindex : ''));
    tag = setAttr(tag, META.placeholder, encodePayload(placeholder));

    return {
      tag,
      isolated: true,
      item: {
        tagName,
        sourceAttribute: source.attr,
        source: source.value || '',
        provider: providerLabel(displaySource, tagName)
      }
    };
  }

  function isolateHtml(html) {
    const items = [];
    const output = text(html).replace(/<(iframe|object|embed)\b[^>]*>/gi, (raw, name) => {
      const result = isolateOpeningTag(String(name).toLowerCase(), raw);
      if (result.isolated && result.item) items.push(result.item);
      return result.tag;
    });
    return Object.freeze({ html: output, count: items.length, items: items.slice() });
  }

  function restoreOpeningTag(rawTag) {
    if (getAttr(rawTag, META.isolated) !== '1') return rawTag;
    const tagName = (getAttr(rawTag, META.tag) || '').toLowerCase();
    const activeAttr = getAttr(rawTag, META.activeAttr) || (tagName === 'object' ? 'data' : 'src');
    const hadActive = getAttr(rawTag, META.hadActive) === '1';
    const originalSource = decodePayload(decodeHtmlAttr(getAttr(rawTag, META.originalSource) || ''));
    const originalSrcdoc = getAttr(rawTag, META.originalSrcdoc);
    const hadStyle = getAttr(rawTag, META.hadStyle) === '1';
    const originalStyle = decodePayload(decodeHtmlAttr(getAttr(rawTag, META.originalStyle) || ''));
    const hadTabindex = getAttr(rawTag, META.hadTabindex) === '1';
    const originalTabindex = decodePayload(decodeHtmlAttr(getAttr(rawTag, META.originalTabindex) || ''));
    let tag = rawTag;
    if (hadActive) tag = setAttr(tag, activeAttr, originalSource);
    else tag = removeAttr(tag, activeAttr);
    if (tagName === 'iframe' && originalSrcdoc != null) tag = setAttr(tag, 'srcdoc', decodePayload(decodeHtmlAttr(originalSrcdoc)));
    if (hadStyle) tag = setAttr(tag, 'style', originalStyle);
    else tag = removeAttr(tag, 'style');
    if (hadTabindex) tag = setAttr(tag, 'tabindex', originalTabindex);
    else tag = removeAttr(tag, 'tabindex');
    Object.values(META).forEach(name => { tag = removeAttr(tag, name); });
    return tag;
  }

  function restoreHtml(html) {
    return text(html).replace(/<(iframe|object|embed)\b[^>]*data-oluntir-embed-isolated\s*=\s*(?:"1"|'1'|1)[^>]*>/gi, raw => restoreOpeningTag(raw));
  }


  function runtimeScript() {
    return `(function () {\n  'use strict';\n  function decode(value) { try { return decodeURIComponent(String(value || '')); } catch (_) { return String(value || ''); } }\n  function editorStyle(value) { var base = String(value || '').trim().replace(/;\\s*$/, ''); return base + (base ? '; ' : '') + 'pointer-events: none !important;'; }\n  function restore(root) {\n    var scope = root && root.querySelectorAll ? root : document;\n    scope.querySelectorAll('[data-oluntir-embed-isolated="1"]').forEach(function (element) {\n      var tagName = String(element.getAttribute('data-oluntir-embed-tag') || element.tagName || '').toLowerCase();\n      var activeAttr = String(element.getAttribute('data-oluntir-embed-active-attr') || (tagName === 'object' ? 'data' : 'src'));\n      var hadActive = element.getAttribute('data-oluntir-embed-had-active') === '1';\n      var originalSource = decode(element.getAttribute('data-oluntir-embed-original-source'));\n      var originalSrcdoc = element.getAttribute('data-oluntir-embed-original-srcdoc');\n      var hadStyle = element.getAttribute('data-oluntir-embed-had-style') === '1';\n      var originalStyle = decode(element.getAttribute('data-oluntir-embed-original-style'));\n      var hadTabindex = element.getAttribute('data-oluntir-embed-had-tabindex') === '1';\n      var originalTabindex = decode(element.getAttribute('data-oluntir-embed-original-tabindex'));\n      if (hadActive) element.setAttribute(activeAttr, originalSource); else element.removeAttribute(activeAttr);\n      if (tagName === 'iframe' && originalSrcdoc != null) element.setAttribute('srcdoc', decode(originalSrcdoc));\n      if (hadStyle) element.setAttribute('style', originalStyle); else element.removeAttribute('style');\n      if (hadTabindex) element.setAttribute('tabindex', originalTabindex); else element.removeAttribute('tabindex');\n      ['data-oluntir-embed-isolated','data-oluntir-embed-tag','data-oluntir-embed-active-attr','data-oluntir-embed-had-active','data-oluntir-embed-original-source','data-oluntir-embed-original-srcdoc','data-oluntir-embed-original-style','data-oluntir-embed-had-style','data-oluntir-embed-original-tabindex','data-oluntir-embed-had-tabindex','data-oluntir-embed-placeholder'].forEach(function (name) { element.removeAttribute(name); });\n    });\n  }\n  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { restore(document); }, { once: true }); else restore(document);\n})();\n`;
  }

  return Object.freeze({
    SCHEMA_VERSION,
    META,
    isolateHtml,
    restoreHtml,
    placeholderUri,
    runtimeScript
  });
});
