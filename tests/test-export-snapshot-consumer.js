const assert = require('assert');
const fs = require('fs');
const source = fs.readFileSync('editor/js/core/export.js', 'utf8');
assert.ok(source.includes('exportSitePackagePrepared(editor, mode, exportSnapshot)'), 'Prepared export does not accept the frozen snapshot');
assert.ok(source.includes('exportSnapshot ? page.html : getPageModelHtml(editor, page)'), 'Page HTML is not read from the snapshot');
assert.ok(source.includes('new Map(exportSnapshot.assets.map'), 'Assets are not read from the snapshot');
assert.ok(source.includes("if (!exportSnapshot) await refreshUploadedAssetsFromDb()"), 'Live asset database must not replace snapshot assets');
console.log('EXPORT-SNAPSHOT-CONSUMER-TEST ERFOLGREICH');
