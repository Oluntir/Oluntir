const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'editor', 'js', 'core', 'export.js');
const source = fs.readFileSync(file, 'utf8');
const exportFn = source.slice(source.indexOf('async function exportSitePackage'));

const checks = [
  ['page model helper exists', source.includes('function getPageModelHtml(editor, page)')],
  ['page model uses getInnerHTML', source.includes("typeof component.getInnerHTML === 'function'")],
  ['export loop reads page model', exportFn.includes('normalizeExportHtml(getPageModelHtml(editor, page))')],
  ['export does not select pages', !exportFn.split('\n').some(line => !line.trim().startsWith('//') && /editor\.Pages\.select\s*\(\s*page\s*\)/.test(line))],
  ['export does not normalize model', !exportFn.includes('normalizeStableAssetReferences(editor)')],
  ['export does not write canvas refs', !exportFn.includes('commitCanvasAssetReferencesToModel(editor)')],
  ['export does not store project', !exportFn.includes('await editor.store()')],
];

const failed = checks.filter(([, ok]) => !ok);
checks.forEach(([name, ok]) => console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`));
if (failed.length) process.exit(1);
console.log('EXPORT-MODEL-READONLY-TEST ERFOLGREICH');
