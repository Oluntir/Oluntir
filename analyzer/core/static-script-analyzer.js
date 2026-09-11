(function (root, factory) {
  const api = factory(typeof require === 'function' ? require('./source-inventory.js') : root.OluntirAnalyzerSourceInventory);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirAnalyzerStaticScriptAnalyzer = api;
})(typeof window !== 'undefined' ? window : globalThis, function (inventoryApi) {
  'use strict';
  const VERSION = '0.4.0';
  function pos(text, offset) { const before = text.slice(0, offset); const lines = before.split('\n'); return { offset, line: lines.length, column: lines[lines.length - 1].length + 1 }; }
  function matches(text, re, kind, documentId, inventory, extra) {
    let m; while ((m = re.exec(text))) {
      const valueIndex = extra && extra.valueIndex;
      const record = Object.assign({ documentId, kind, value: m[valueIndex || 1] || m[0], source: pos(text, m.index) }, extra || {});
      delete record.valueIndex;
      inventoryApi.add(inventory, 'references', 'reference', record);
    }
  }
  function analyze(input, options) {
    const settings = options || {}, text = String(input == null ? '' : input), file = String(settings.file || 'script.js');
    const inventory = settings.inventory || inventoryApi.create({ inventoryId: settings.inventoryId || `inventory:${file}`, createdAt: settings.createdAt || null });
    const document = inventoryApi.add(inventory, 'documents', 'document', { path: file, mediaType: /\.tsx?$/i.test(file) ? 'text/typescript' : 'text/javascript', byteLength: text.length, analyzer: { id: 'static-script', version: VERSION } });
    matches(text, /(?:import\s+(?:[^'";]+?\s+from\s+)?|export\s+[^'";]+?\s+from\s+|require\s*\(\s*)['"]([^'"]+)['"]/g, 'module-import', document.id, inventory);
    matches(text, /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g, 'dynamic-import', document.id, inventory);
    matches(text, /(?:querySelector(?:All)?|matches|closest)\s*\(\s*['"]([^'"]+)['"]\s*\)/g, 'dom-selector', document.id, inventory);
    matches(text, /addEventListener\s*\(\s*['"]([^'"]+)['"]/g, 'event-listener', document.id, inventory);
    matches(text, /dispatchEvent\s*\(\s*new\s+CustomEvent\s*\(\s*['"]([^'"]+)['"]/g, 'custom-event', document.id, inventory);
    matches(text, /classList\.(?:add|remove|toggle|replace|contains)\s*\(\s*['"]([^'"]+)['"]/g, 'class-manipulation', document.id, inventory);
    matches(text, /dataset\.([A-Za-z_$][\w$]*)/g, 'dataset-access', document.id, inventory);
    matches(text, /new\s+(MutationObserver|IntersectionObserver|ResizeObserver)\s*\(/g, 'observer', document.id, inventory);
    matches(text, /\b(fetch|XMLHttpRequest)\s*\(\s*['"]([^'"]+)['"]/g, 'network-request', document.id, inventory, { valueIndex: 2 });
    matches(text, /\b(setTimeout|setInterval|requestAnimationFrame)\s*\(/g, 'timer', document.id, inventory);
    matches(text, /(?:appendChild|insertBefore|replaceChild|removeChild|insertAdjacentHTML|innerHTML\s*=)/g, 'dom-mutation', document.id, inventory);
    return inventory;
  }
  return Object.freeze({ VERSION, analyze });
});
