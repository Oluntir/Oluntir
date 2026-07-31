const fs = require('fs');
const assert = require('assert');

const editor = fs.readFileSync('editor/js/core/editor.js', 'utf8');
const shared = fs.readFileSync('editor/js/core/shared-content-manager.js', 'utf8');

// Regression: reusable pages that contain only header/navigation/footer must
// regain an explicit empty <main>, otherwise the existing main:empty Canvas
// placeholder cannot be rendered.
for (const [name, source] of [['editor fallback', editor], ['shared manager', shared]]) {
  assert(source.includes("if (!template.content.querySelector('main'))"), `${name}: missing <main> repair`);
  assert(source.includes("template.content.insertBefore(main, footer)"), `${name}: <main> is not inserted before footer`);
}

// The established editor-only placeholder design must remain untouched.
assert(editor.includes('main:empty {'), 'missing empty-main workspace rule');
assert(editor.includes("content: '+ Hier Section einfügen';"), 'missing established placeholder text');
assert(editor.includes('outline: 1px dashed rgba(74, 144, 226, .9);'), 'placeholder frame styling changed unexpectedly');
assert(editor.includes('background-color: rgba(241, 247, 255, .72);'), 'placeholder background styling changed unexpectedly');

console.log('NEW-PAGE-PLACEHOLDER-TEST ERFOLGREICH');
