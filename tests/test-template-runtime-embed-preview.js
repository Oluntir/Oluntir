'use strict';

const assert = require('assert');
const runtime = require('../editor/js/core/template-runtime.js');

function fakeElement(tag, attrs) {
  const store = new Map(Object.entries(attrs || {}));
  return {
    tagName: tag.toUpperCase(),
    getAttribute(name) { return store.has(name) ? store.get(name) : null; },
    setAttribute(name, value) { store.set(name, String(value)); },
    removeAttribute(name) { store.delete(name); },
    attrs: store
  };
}

(function () {
  const original = 'https://www.openstreetmap.org/export/embed.html?bbox=1';
  const placeholder = 'data:image/svg+xml;charset=UTF-8,%3Csvg%2F%3E';
  const element = fakeElement('iframe', {
    'data-oluntir-embed-isolated': '1',
    'data-oluntir-embed-tag': 'iframe',
    'data-oluntir-embed-active-attr': 'src',
    'data-oluntir-embed-had-active': '1',
    'data-oluntir-embed-original-source': encodeURIComponent(original),
    'data-oluntir-embed-placeholder': encodeURIComponent(placeholder),
    'data-oluntir-embed-had-style': '1',
    'data-oluntir-embed-original-style': encodeURIComponent('width:100%;height:400px'),
    'data-oluntir-embed-had-tabindex': '0',
    'data-oluntir-embed-original-tabindex': '',
    src: placeholder,
    style: 'width:100%;height:400px; pointer-events: none !important;',
    tabindex: '-1'
  });
  const doc = { querySelectorAll() { return [element]; } };

  assert.strictEqual(runtime.setEmbeddedContentActive(doc, true), 1);
  assert.strictEqual(element.getAttribute('src'), original, 'Preview muss die Originalquelle nur im Canvas-DOM reaktivieren.');
  assert.strictEqual(element.getAttribute('style'), 'width:100%;height:400px', 'Preview muss den Originalstyle reaktivieren.');
  assert.strictEqual(element.getAttribute('tabindex'), null, 'Preview muss den Editor-only Fokus-Guard entfernen.');
  assert.strictEqual(runtime.setEmbeddedContentActive(doc, false), 1);
  assert.strictEqual(element.getAttribute('src'), placeholder, 'Nach Preview muss der SVG-Platzhalter wieder aktiv sein.');
  assert.ok(/pointer-events:\s*none\s*!important/i.test(element.getAttribute('style')), 'Editiermodus muss das Embed wieder pointer-transparent machen.');
  assert.strictEqual(element.getAttribute('tabindex'), '-1', 'Editiermodus muss Fokus auf das Embed wieder blockieren.');

  console.log('TEMPLATE-RUNTIME-EMBED-PREVIEW-TEST ERFOLGREICH');
})();
