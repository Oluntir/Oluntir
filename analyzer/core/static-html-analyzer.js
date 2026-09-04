(function (root, factory) {
  const api = factory(
    typeof require === 'function' ? require('./source-inventory.js') : root.OluntirAnalyzerSourceInventory
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirAnalyzerStaticHtmlAnalyzer = api;
})(typeof window !== 'undefined' ? window : globalThis, function (inventoryApi) {
  'use strict';

  const VERSION = '0.2.0';
  const VOID_ELEMENTS = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);

  function lineMap(text) {
    const starts = [0];
    for (let i = 0; i < text.length; i += 1) if (text.charCodeAt(i) === 10) starts.push(i + 1);
    return starts;
  }

  function position(starts, offset) {
    let low = 0, high = starts.length - 1;
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (starts[mid] <= offset) low = mid + 1; else high = mid - 1;
    }
    const index = Math.max(0, high);
    return { offset, line: index + 1, column: offset - starts[index] + 1 };
  }

  function findTagEnd(text, start) {
    let quote = null;
    for (let i = start + 1; i < text.length; i += 1) {
      const ch = text[i];
      if (quote) {
        if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'") quote = ch;
      else if (ch === '>') return i;
    }
    return -1;
  }

  function parseAttributes(raw, absoluteStart) {
    const result = [];
    let i = 0;
    while (i < raw.length) {
      while (i < raw.length && /\s/.test(raw[i])) i += 1;
      if (i >= raw.length || raw[i] === '/' || raw[i] === '>') break;
      const nameStart = i;
      while (i < raw.length && !/[\s=/>]/.test(raw[i])) i += 1;
      const name = raw.slice(nameStart, i);
      if (!name) { i += 1; continue; }
      while (i < raw.length && /\s/.test(raw[i])) i += 1;
      let value = null;
      let quote = null;
      if (raw[i] === '=') {
        i += 1;
        while (i < raw.length && /\s/.test(raw[i])) i += 1;
        if (raw[i] === '"' || raw[i] === "'") {
          quote = raw[i]; i += 1;
          const valueStart = i;
          while (i < raw.length && raw[i] !== quote) i += 1;
          value = raw.slice(valueStart, i);
          if (raw[i] === quote) i += 1;
        } else {
          const valueStart = i;
          while (i < raw.length && !/[\s>]/.test(raw[i])) i += 1;
          value = raw.slice(valueStart, i);
        }
      }
      result.push({ name, normalizedName: name.toLowerCase(), value, quote, offset: absoluteStart + nameStart });
    }
    return result;
  }

  function classifyReference(tagName, attrs) {
    const map = Object.create(null);
    attrs.forEach(attr => { map[attr.normalizedName] = attr.value; });
    const rel = String(map.rel || '').toLowerCase().split(/\s+/);
    const type = String(map.type || '').toLowerCase();
    if (tagName === 'link' && rel.includes('stylesheet') && map.href) return [{ kind: 'stylesheet', attribute: 'href', value: map.href }];
    if (tagName === 'link' && rel.some(item => item.includes('icon')) && map.href) return [{ kind: 'favicon', attribute: 'href', value: map.href }];
    if (tagName === 'link' && rel.includes('preload') && map.as === 'font' && map.href) return [{ kind: 'font-preload', attribute: 'href', value: map.href }];
    if (tagName === 'script' && map.src) return [{ kind: 'script', attribute: 'src', value: map.src }];
    if (tagName === 'img' && map.src) return [{ kind: 'image', attribute: 'src', value: map.src }];
    if ((tagName === 'video' || tagName === 'audio' || tagName === 'source' || tagName === 'track') && map.src) return [{ kind: 'media', attribute: 'src', value: map.src }];
    if (tagName === 'a' && map.href) return [{ kind: rel.includes('download') || Object.prototype.hasOwnProperty.call(map, 'download') ? 'download' : 'hyperlink', attribute: 'href', value: map.href }];
    if (map.style) return [{ kind: 'inline-style', attribute: 'style', value: map.style }];
    return [];
  }

  function srcsetReferences(attrs) {
    const attr = attrs.find(item => item.normalizedName === 'srcset' && item.value);
    if (!attr) return [];
    return attr.value.split(',').map(part => part.trim()).filter(Boolean).map(candidate => ({
      kind: 'srcset-candidate', attribute: 'srcset', value: candidate.split(/\s+/)[0], descriptor: candidate.split(/\s+/).slice(1).join(' ') || null
    }));
  }

  function assetKind(reference) {
    if (reference.kind === 'stylesheet') return 'stylesheet';
    if (reference.kind === 'script') return 'script';
    if (reference.kind === 'font-preload') return 'font';
    if (reference.kind === 'image' || reference.kind === 'favicon' || reference.kind === 'srcset-candidate') return 'image';
    if (reference.kind === 'media') return 'media';
    if (reference.kind === 'download') return 'download';
    return null;
  }

  function analyze(input, options) {
    const settings = options || {};
    const html = String(input == null ? '' : input);
    const file = String(settings.file || 'index.html');
    const inventory = settings.inventory || inventoryApi.create({ inventoryId: settings.inventoryId || `inventory:${file}`, createdAt: settings.createdAt || null });
    const starts = lineMap(html);
    const document = inventoryApi.add(inventory, 'documents', 'document', {
      path: file, mediaType: 'text/html', byteLength: html.length, analyzer: { id: 'static-html', version: VERSION }
    });
    const stack = [];
    const assetByUri = new Map();
    let cursor = 0;

    while (cursor < html.length) {
      const open = html.indexOf('<', cursor);
      if (open < 0) break;
      if (html.startsWith('<!--', open)) {
        const endComment = html.indexOf('-->', open + 4);
        if (endComment < 0) {
          inventoryApi.add(inventory, 'diagnostics', 'diagnostic', { code: 'HTML_UNCLOSED_COMMENT', severity: 'warning', documentId: document.id, location: position(starts, open) });
          break;
        }
        cursor = endComment + 3; continue;
      }
      const end = findTagEnd(html, open);
      if (end < 0) {
        inventoryApi.add(inventory, 'diagnostics', 'diagnostic', { code: 'HTML_UNCLOSED_TAG', severity: 'warning', documentId: document.id, location: position(starts, open) });
        break;
      }
      const token = html.slice(open + 1, end);
      if (/^\s*[!?]/.test(token)) { cursor = end + 1; continue; }
      const closing = /^\s*\//.test(token);
      const match = token.match(/^\s*\/?\s*([^\s/>]+)/);
      if (!match) { cursor = end + 1; continue; }
      const tagName = match[1].toLowerCase();
      if (closing) {
        for (let s = stack.length - 1; s >= 0; s -= 1) {
          if (stack[s].tagName === tagName) { stack.length = s; break; }
        }
        cursor = end + 1; continue;
      }
      const nameIndex = token.indexOf(match[1]);
      const attrsRawStart = nameIndex + match[1].length;
      const attrs = parseAttributes(token.slice(attrsRawStart), open + 1 + attrsRawStart);
      const node = inventoryApi.add(inventory, 'nodes', 'node', {
        documentId: document.id,
        nodeType: 'element',
        tagName,
        parentId: stack.length ? stack[stack.length - 1].id : null,
        source: { start: position(starts, open), end: position(starts, end + 1) },
        selfClosing: /\/\s*$/.test(token) || VOID_ELEMENTS.has(tagName)
      });
      attrs.forEach(attr => inventoryApi.add(inventory, 'attributes', 'attribute', {
        documentId: document.id, nodeId: node.id, name: attr.name, normalizedName: attr.normalizedName,
        value: attr.value, quote: attr.quote, source: position(starts, attr.offset)
      }));

      const refs = classifyReference(tagName, attrs).concat(srcsetReferences(attrs));
      refs.forEach(ref => {
        const reference = inventoryApi.add(inventory, 'references', 'reference', Object.assign({ documentId: document.id, nodeId: node.id }, ref));
        const kind = assetKind(ref);
        if (kind && ref.value) {
          const key = `${kind}:${ref.value}`;
          let asset = assetByUri.get(key);
          if (!asset) {
            asset = inventoryApi.add(inventory, 'assets', 'asset', { kind, uri: ref.value, referenceIds: [] });
            assetByUri.set(key, asset);
          }
          asset.referenceIds.push(reference.id);
          reference.assetId = asset.id;
        }
      });

      if (!node.selfClosing) stack.push({ id: node.id, tagName });
      cursor = end + 1;
    }

    return inventory;
  }

  return Object.freeze({ VERSION, analyze });
});
