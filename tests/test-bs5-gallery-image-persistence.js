const fs = require('fs');
const assert = require('assert');

const linkEditor = fs.readFileSync('editor/js/features/link-editor.js', 'utf8');
const quickEdit = fs.readFileSync('editor/js/features/quick-edit.js', 'utf8');

assert(linkEditor.includes("value.indexOf('assets/user_upload/') === 0"), 'Gallery replacement must preserve assets/user_upload as stable project paths');
[
  'data-pb-gallery-desktop',
  'data-pb-gallery-tablet',
  'data-pb-gallery-mobile',
  'data-pb-gallery-desktop-path',
  'data-pb-gallery-tablet-path',
  'data-pb-gallery-mobile-path',
  'data-download'
].forEach((name) => assert(linkEditor.includes(name), `Gallery replacement must update ${name}`));
assert(quickEdit.includes("a['data-stable-path'] || a.src"), 'Quick editing must display the stable image source before the runtime/blob source');
assert(quickEdit.includes("imageAttributes['data-stable-path'] = requestedSource"), 'Quick editing must preserve the stable source when applying image changes');
console.log('BS5 gallery image persistence contract: OK');
