const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

function component(tag, attributes = {}, kids = []) {
  return {
    attributes,
    get(name) { if (name === 'tagName') return tag; if (name === 'attributes') return this.attributes; },
    getAttributes() { return this.attributes; },
    addAttributes(patch) { Object.assign(this.attributes, patch); },
    removeAttributes(names) { names.forEach(name => delete this.attributes[name]); },
    components() { return { models: kids }; }
  };
}
const context = { window: {}, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync('editor/js/core/image-lightbox-api.js', 'utf8'), context);
const api = context.window.OluntirImageLightboxApi;
const image = component('img', { src: 'assets/user_upload/desktop/test.jpg' });
const card = component('div', { class: 'card' }, [component('div', {}, [image])]);
assert.strictEqual(api.resolveImageComponent(card), image, 'nested card image not resolved');
assert.strictEqual(api.apply(card, true), true, 'lightbox activation failed');
assert.strictEqual(image.attributes['data-oluntir-lightbox'], 'true');
assert.strictEqual(api.isEnabled(card), true);
api.apply(card, true, { download: true, caption: true });
assert.strictEqual(api.isDownloadEnabled(card), true);
assert.strictEqual(api.isCaptionEnabled(card), true);
api.apply(card, false);
assert.ok(!('data-oluntir-lightbox' in image.attributes), 'lightbox attribute not removed');

const exportSource = fs.readFileSync('editor/js/core/export.js', 'utf8');
assert.ok(exportSource.includes('css/oluntir-image-lightbox.css'));
assert.ok(exportSource.includes('js/oluntir-image-lightbox.js'));
assert.ok(exportSource.includes('<script src="js/oluntir-image-lightbox.js"></script>'));
const quick = fs.readFileSync('editor/js/features/quick-edit.js', 'utf8');
assert.ok(quick.includes("field('lightbox','Klickvergrößerung'"));
const manager = fs.readFileSync('editor/modules/image-select/image-select-ui.js', 'utf8');
assert.ok(manager.includes('Klickvergrößerung aktivieren'));
assert.ok(manager.includes('Download-Button anzeigen'));
assert.ok(manager.includes('Bildname anzeigen'));
const runtime = fs.readFileSync('assets/js/oluntir-image-lightbox.js', 'utf8');
assert.ok(runtime.includes('data-oluntir-lightbox-download'));
assert.ok(runtime.includes('data-oluntir-lightbox-caption'));
assert.ok(runtime.includes('<svg viewBox=\"0 0 24 24\"'), 'framework-independent SVG download icon missing');
assert.ok(!runtime.includes('>⇩</a>'), 'fallback text download icon still present');
assert.ok(!runtime.includes('id="oluntir-image-lightbox-title"'));
assert.ok(runtime.includes("window.parent.OluntirEditor"), 'editor canvas detection missing');
assert.ok(runtime.includes("Commands.isActive('preview')"), 'preview-mode exception missing');
const apiSource = fs.readFileSync('editor/js/core/image-lightbox-api.js', 'utf8');
assert.ok(apiSource.includes("data-oluntir-editor-canvas"), 'editor canvas marker missing');
console.log('global image lightbox contract OK');
