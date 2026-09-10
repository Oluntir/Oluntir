'use strict';

const assert = require('assert');
const isolator = require('../templates/embed-isolator.js');

(function () {
  const google = 'https://www.google.com/maps/embed?pb=abc&x=1';
  const osm = 'https://www.openstreetmap.org/export/embed.html?bbox=1,2,3,4';
  const html = `
    <iframe class="map-frame" src="${google}" style="width:100%;height:500px" allowfullscreen></iframe>
    <iframe src="${osm}" width="100%" height="400"></iframe>
    <object data="https://widgets.example.test/plugin.svg" width="640" height="360"></object>
    <embed src="https://cdn.example.test/widget.swf" width="320" height="200">
  `;

  const isolated = isolator.isolateHtml(html);
  assert.strictEqual(isolated.count, 4, 'Alle iframe/object/embed-Elemente müssen pauschal isoliert werden.');
  assert.ok(/<iframe class="map-frame"[^>]*src="data:image\/svg\+xml/i.test(isolated.html), 'Iframe muss als SVG-Placeholder geladen werden.');
  assert.ok(isolated.html.includes('data-oluntir-embed-isolated="1"'));
  assert.ok(isolated.html.includes('width:100%;height:500px'), 'Originalgröße/-style des Frames muss erhalten bleiben.');
  assert.ok(/style="[^"]*pointer-events:\s*none\s*!important/i.test(isolated.html), 'Isolierte Embeds dürfen im Editor keine Pointer-Events abfangen.');
  assert.ok(isolated.html.includes('tabindex="-1"'), 'Isolierte Embeds dürfen im Editor keinen Tastaturfokus abfangen.');
  assert.ok(isolated.html.includes('width="100%" height="400"'), 'Width/Height-Attribute müssen erhalten bleiben.');
  assert.ok(isolated.items.some(item => item.provider === 'google.com'));
  assert.ok(isolated.items.some(item => item.provider === 'openstreetmap.org'));

  const restored = isolator.restoreHtml(isolated.html);
  assert.ok(restored.includes(`src="${google.replace(/&/g, '&amp;')}"`) || restored.includes(`src="${google}"`), 'Google-Quelle muss wiederherstellbar sein.');
  assert.ok(restored.includes(`src="${osm}"`), 'OSM-Quelle muss wiederherstellbar sein.');
  assert.ok(restored.includes('data="https://widgets.example.test/plugin.svg"'));
  assert.ok(restored.includes('src="https://cdn.example.test/widget.swf"'));
  assert.ok(!restored.includes('data-oluntir-embed-isolated'), 'Editor-Metadaten dürfen nach Wiederherstellung nicht übrig bleiben.');
  assert.ok(restored.includes('style="width:100%;height:500px"'), 'Originalstyle muss bei Preview/Export exakt wiederhergestellt werden.');
  assert.ok(!/pointer-events:\s*none/i.test(restored), 'Editor-only Pointer-Isolation darf nicht in Preview/Export gelangen.');

  const srcdoc = '<iframe srcdoc="&lt;p&gt;Inline&lt;/p&gt;" style="height:300px"></iframe>';
  const isolatedSrcdoc = isolator.isolateHtml(srcdoc);
  assert.strictEqual(isolatedSrcdoc.count, 1);
  assert.ok(!/\ssrcdoc=/.test(isolatedSrcdoc.html), 'Aktives srcdoc muss im Editiermodus entfernt werden.');
  assert.ok(/src="data:image\/svg\+xml/.test(isolatedSrcdoc.html));

  console.log('TEMPLATE-EMBED-ISOLATION-TEST ERFOLGREICH');
})();
