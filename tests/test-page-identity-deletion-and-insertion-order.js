const fs = require('fs');
const assert = require('assert');
const editorSource = fs.readFileSync('editor/js/core/editor.js', 'utf8');
const documentSource = fs.readFileSync('editor/js/core/oluntir-document-api.js', 'utf8');
const includesSource = fs.readFileSync('editor/js/core/includes.js', 'utf8');

assert(editorSource.includes('function createUniquePageRecord()'), 'new pages require an independent hidden page identity');
assert(editorSource.includes("{ id: pageRecord.modelId, name, component, oluntirPageId: pageRecord.semanticId }"), 'page model id and semantic id must not be derived from the visible name');
assert(editorSource.includes('persistCurrentProjectStateSoon(0);'), 'page deletion must be persisted immediately');
assert(editorSource.includes('removePageReferences(deletedModelId)'), 'deleted page references must be removed from reusable regions');
assert(includesSource.includes('removePageReferences: (pageId)'), 'includes API must expose page reference cleanup');

assert(documentSource.includes("'shared-header': 0"), 'header must sort first');
assert(documentSource.includes("'main': 1"), 'main must sort between header and footer');
assert(documentSource.includes("'shared-footer': 2"), 'footer must sort last');
assert(documentSource.includes('groups.sort((left, right)'), 'insertion groups must follow visual template order');

console.log('PAGE-IDENTITY-DELETION-AND-INSERTION-ORDER-TEST ERFOLGREICH');
