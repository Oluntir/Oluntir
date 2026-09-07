'use strict';

const assert = require('assert');

function loadBlocks(version) {
  const registered = [];
  global.window = {};
  delete require.cache[require.resolve('../editor/js/features/bootstrap-blocks.js')];
  require('../editor/js/features/bootstrap-blocks.js');
  const editor = { BlockManager: { add(id, config) { registered.push({ id, config }); } } };
  window.registerBootstrapBlocks(editor, version);
  return registered;
}

function block(registered, id) {
  const found = registered.find(item => item.id === id);
  assert(found, `Block ${id} fehlt.`);
  return String(found.config.content || '');
}

const bs4 = block(loadBlocks('bs4'), 'bs4-content-video');
assert(bs4.includes('embed-responsive embed-responsive-16by9'), 'BS4-Video muss Bootstrap-4 embed-responsive verwenden.');
assert(bs4.includes('class="embed-responsive-item"'), 'BS4-Video muss das native embed-responsive-item verwenden.');
assert(!bs4.includes('ratio ratio-16x9'), 'BS4-Video darf keine Bootstrap-5-Ratio-Klasse verwenden.');

const bs5 = block(loadBlocks('bs5'), 'bs5-content-video');
assert(bs5.includes('ratio ratio-16x9'), 'BS5-Video muss den Bootstrap-5-Ratio-Helper verwenden.');
assert(!bs5.includes('embed-responsive-16by9'), 'BS5-Video darf den entfernten Bootstrap-4-Embed-Helper nicht verwenden.');

for (const [label, html] of [['BS4', bs4], ['BS5', bs5]]) {
  assert(/<video\b/i.test(html), `${label}: video-Element fehlt.`);
  assert(/\bcontrols\b/i.test(html), `${label}: controls fehlt.`);
  assert(/preload="metadata"/i.test(html), `${label}: preload=metadata fehlt.`);
  assert(/\bplaysinline\b/i.test(html), `${label}: playsinline fehlt.`);
  assert(/poster="assets\/images\/logo\.svg"/i.test(html), `${label}: Poster-Fallback fehlt.`);
  assert(/type="video\/webm"/i.test(html), `${label}: WebM-Fallback fehlt.`);
  assert(/type="video\/mp4"/i.test(html), `${label}: MP4-Fallback fehlt.`);
  assert(/type="video\/ogg"/i.test(html), `${label}: Ogg-Fallback fehlt.`);
  assert(/data-oluntir-video-fallback="inline"/i.test(html), `${label}: HTML5-Fallback-Link fehlt.`);
  assert(/data-oluntir-video-fallback="download"/i.test(html), `${label}: sichtbarer Download-Fallback fehlt.`);
}

const capabilities = require('../analyzer/core/capability-evidence-analyzer.js');
const videoCaps = capabilities.analyze([{ path: 'index.html', content: bs5 }]);
assert(videoCaps.some(item => item.id === 'media.video'), 'Analyzer muss HTML5-Video als media.video erkennen.');

const capabilityCatalog = require('../analyzer/core/capability-catalog.js');
assert(capabilityCatalog.get('media.video'), 'Capability-Katalog muss media.video enthalten.');

const fs = require('fs');
const exportSource = fs.readFileSync('editor/js/core/export.js', 'utf8');
assert(exportSource.includes('stripBootstrapVideoEditorMetadata'), 'Export muss editorinterne Video-Metadaten entfernen.');
assert(exportSource.includes('[data-oluntir-bootstrap-video], [data-oluntir-video-source], [data-oluntir-video-fallback]'), 'Export-Cleanup muss alle Video-Editor-Marker erfassen.');

const frameworkEvidence = require('../analyzer/core/framework-evidence-analyzer.js');
const bs4Evidence = frameworkEvidence.analyze([{ path: 'bootstrap.css', content: bs4 }]);
assert(bs4Evidence.some(item => item.id === 'bootstrap4' && item.detected), 'BS4-Video-Markup muss zur Bootstrap-4-Evidenz beitragen.');
const bs5Evidence = frameworkEvidence.analyze([{ path: 'bootstrap.css', content: bs5 }]);
assert(bs5Evidence.some(item => item.id === 'bootstrap5' && item.detected), 'BS5-Video-Markup muss zur Bootstrap-5-Evidenz beitragen.');

class FakeComponent {
  constructor(tagName, attributes, children) {
    this.props = { tagName };
    this.attributes = Object.assign({}, attributes || {});
    this.children = children || [];
    this.handlers = {};
    this.children.forEach(child => { child._parent = this; });
  }
  get(name) { return this.props[name]; }
  set(name, value, options) {
    if (name && typeof name === 'object') {
      Object.keys(name).forEach(key => this.set(key, name[key], value));
      return;
    }
    this.props[name] = value;
    if (!(options && options.silent)) this.emit(`change:${name}`);
  }
  getAttributes() { return this.attributes; }
  addAttributes(patch) { Object.assign(this.attributes, patch || {}); }
  removeAttributes(names) {
    (Array.isArray(names) ? names : [names]).forEach(name => delete this.attributes[name]);
  }
  components() { return { models: this.children, forEach: fn => this.children.forEach(fn) }; }
  parent() { return this._parent || null; }
  on(events, handler) { String(events).split(/\s+/).filter(Boolean).forEach(event => { (this.handlers[event] ||= []).push(handler); }); }
  emit(event) { (this.handlers[event] || []).forEach(handler => handler()); }
  getView() { return null; }
}

const webm = new FakeComponent('source', { 'data-oluntir-video-source': 'webm', src: 'old.webm', type: 'video/webm' });
const mp4 = new FakeComponent('source', { 'data-oluntir-video-source': 'mp4', src: 'old.mp4', type: 'video/mp4' });
const ogg = new FakeComponent('source', { 'data-oluntir-video-source': 'ogg', src: 'old.ogv', type: 'video/ogg' });
const inlineFallback = new FakeComponent('a', { 'data-oluntir-video-fallback': 'inline', href: 'old.mp4' });
const video = new FakeComponent('video', { 'data-oluntir-bootstrap-video': 'bs5', poster: 'poster.jpg', preload: 'metadata' }, [webm, mp4, ogg, inlineFallback]);
const frame = new FakeComponent('div', {}, [video]);
const downloadFallback = new FakeComponent('a', { 'data-oluntir-video-fallback': 'download', href: 'old.mp4' });
const note = new FakeComponent('p', {}, [downloadFallback]);
const container = new FakeComponent('div', {}, [frame, note]);
const section = new FakeComponent('section', {}, [container]);
void section;

const editorHandlers = {};
const editor = {
  on(event, handler) { (editorHandlers[event] ||= []).push(handler); },
  trigger() {}
};

global.window = { setTimeout(fn) { fn(); return 0; } };
delete require.cache[require.resolve('../editor/js/features/bootstrap-video.js')];
require('../editor/js/features/bootstrap-video.js');
window.registerBootstrapVideoEditing(editor);
(editorHandlers['component:selected'] || []).forEach(handler => handler(video));

const traitNames = (video.get('traits') || []).map(trait => trait.name);
assert(traitNames.includes('oluntirVideoWebm') && traitNames.includes('oluntirVideoMp4') && traitNames.includes('oluntirVideoOgg'), 'Video-Eigenschaften müssen drei Fallback-Quellen anbieten.');
video.set('oluntirVideoMp4', 'media/neu.mp4');
assert.strictEqual(mp4.getAttributes().src, 'media/neu.mp4', 'MP4-Trait muss die native <source>-Quelle ändern.');
assert.strictEqual(inlineFallback.getAttributes().href, 'media/neu.mp4', 'Inline-Fallback muss der bevorzugten MP4-Quelle folgen.');
assert.strictEqual(downloadFallback.getAttributes().href, 'media/neu.mp4', 'Sichtbarer Download-Fallback muss der bevorzugten MP4-Quelle folgen.');

console.log('BOOTSTRAP-VIDEO-FALLBACKS-TEST ERFOLGREICH');
