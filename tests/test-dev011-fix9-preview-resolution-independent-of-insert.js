'use strict';

const fs = require('fs');
const assert = require('assert');

const adapter = fs.readFileSync('editor/integrations/grapesjs/grapesjs-adapter.js', 'utf8');
const documentApi = fs.readFileSync('editor/js/core/oluntir-document-api.js', 'utf8');
const previewApi = fs.readFileSync('editor/js/core/oluntir-preview-api.js', 'utf8');

assert(adapter.includes('resolvePreviewInsertionTarget(target)'), 'separate preview target resolver missing');
assert(adapter.includes('resolveAreaInsertionTarget(target)'), 'shared area target resolver missing');
assert(adapter.includes('canPreviewInsertionTarget(target)'), 'preview capability contract missing');
assert(adapter.includes('const resolved = adapter.resolvePreviewInsertionTarget(target);'), 'scroll/highlight do not use preview resolver');
assert(documentApi.includes('function canPreviewTarget(target)'), 'document preview contract missing');
assert(documentApi.includes('canPreviewTarget,'), 'document preview contract not exported');
assert(previewApi.includes('const validForPreview ='), 'preview API does not accept read-only preview targets');
assert(previewApi.includes('if (!validForInsert && !validForPreview)'), 'preview validation still depends only on insertion validity');

console.log('DEV_011-FIX9-PREVIEW-RESOLUTION-INDEPENDENT-OF-INSERT-TEST ERFOLGREICH');
