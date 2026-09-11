(function (root, factory) {
  const api = factory(
    typeof require === 'function' ? require('./source-inventory.js') : root.OluntirAnalyzerSourceInventory
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirAnalyzerStaticCssAnalyzer = api;
})(typeof window !== 'undefined' ? window : globalThis, function (inventoryApi) {
  'use strict';

  const VERSION = '0.3.0';

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

  function stripCommentsPreserveLength(text, diagnostics, documentId, starts) {
    let out = '';
    let cursor = 0;
    while (cursor < text.length) {
      const open = text.indexOf('/*', cursor);
      if (open < 0) { out += text.slice(cursor); break; }
      out += text.slice(cursor, open);
      const close = text.indexOf('*/', open + 2);
      if (close < 0) {
        diagnostics.push({ code: 'CSS_UNCLOSED_COMMENT', severity: 'warning', documentId, location: position(starts, open) });
        out += ' '.repeat(text.length - open);
        break;
      }
      out += ' '.repeat(close + 2 - open);
      cursor = close + 2;
    }
    return out;
  }

  function scanBlockEnd(text, openIndex) {
    let depth = 1;
    let quote = null;
    for (let i = openIndex + 1; i < text.length; i += 1) {
      const ch = text[i];
      if (quote) {
        if (ch === '\\') i += 1;
        else if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'") quote = ch;
      else if (ch === '{') depth += 1;
      else if (ch === '}') {
        depth -= 1;
        if (depth === 0) return i;
      }
    }
    return -1;
  }

  function splitDeclarations(body, bodyOffset) {
    const items = [];
    let start = 0, quote = null, paren = 0;
    for (let i = 0; i <= body.length; i += 1) {
      const ch = body[i];
      if (quote) {
        if (ch === '\\') i += 1;
        else if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'") quote = ch;
      else if (ch === '(') paren += 1;
      else if (ch === ')') paren = Math.max(0, paren - 1);
      else if ((ch === ';' || i === body.length) && paren === 0) {
        const raw = body.slice(start, i);
        const colon = raw.indexOf(':');
        if (colon >= 0) {
          const name = raw.slice(0, colon).trim();
          let value = raw.slice(colon + 1).trim();
          const important = /\s*!important\s*$/i.test(value);
          if (important) value = value.replace(/\s*!important\s*$/i, '').trim();
          if (name) items.push({ name, normalizedName: name.toLowerCase(), value, important, offset: bodyOffset + start + raw.indexOf(name) });
        }
        start = i + 1;
      }
    }
    return items;
  }

  function urlReferences(value) {
    const refs = [];
    const re = /url\(\s*(?:(["'])(.*?)\1|([^\s)]+))\s*\)/gi;
    let match;
    while ((match = re.exec(value))) {
      const uri = match[2] || match[3] || '';
      if (uri && !/^data:/i.test(uri)) refs.push(uri);
    }
    return refs;
  }

  function assetKind(uri) {
    const clean = String(uri).split(/[?#]/)[0].toLowerCase();
    if (/\.(woff2?|ttf|otf|eot)$/.test(clean)) return 'font';
    if (/\.(png|jpe?g|gif|webp|avif|svg|ico)$/.test(clean)) return 'image';
    if (/\.(mp4|webm|ogg|mp3|wav)$/.test(clean)) return 'media';
    return 'stylesheet-asset';
  }

  function analyze(input, options) {
    const settings = options || {};
    const css = String(input == null ? '' : input);
    const file = String(settings.file || 'styles.css');
    const inventory = settings.inventory || inventoryApi.create({ inventoryId: settings.inventoryId || `inventory:${file}`, createdAt: settings.createdAt || null });
    const starts = lineMap(css);
    const document = inventoryApi.add(inventory, 'documents', 'document', {
      path: file, mediaType: 'text/css', byteLength: css.length, analyzer: { id: 'static-css', version: VERSION }
    });
    const stylesheet = inventoryApi.add(inventory, 'stylesheets', 'stylesheet', { documentId: document.id, path: file, ruleIds: [] });
    const pendingDiagnostics = [];
    const text = stripCommentsPreserveLength(css, pendingDiagnostics, document.id, starts);
    pendingDiagnostics.forEach(item => inventoryApi.add(inventory, 'diagnostics', 'diagnostic', item));
    const assetByUri = new Map(inventory.assets.map(asset => [`${asset.kind}:${asset.uri}`, asset]));

    function addReference(kind, value, ruleId, declarationId, offset) {
      const reference = inventoryApi.add(inventory, 'references', 'reference', {
        documentId: document.id, stylesheetId: stylesheet.id, ruleId: ruleId || null, declarationId: declarationId || null,
        kind, value, source: position(starts, offset)
      });
      if (kind === 'css-import') return reference;
      const aKind = assetKind(value);
      const key = `${aKind}:${value}`;
      let asset = assetByUri.get(key);
      if (!asset) {
        asset = inventoryApi.add(inventory, 'assets', 'asset', { kind: aKind, uri: value, referenceIds: [] });
        assetByUri.set(key, asset);
      }
      asset.referenceIds.push(reference.id);
      reference.assetId = asset.id;
      return reference;
    }

    function parseRange(start, end, parentRuleId) {
      let cursor = start;
      while (cursor < end) {
        while (cursor < end && /\s/.test(text[cursor])) cursor += 1;
        if (cursor >= end) break;
        const semicolon = text.indexOf(';', cursor);
        const brace = text.indexOf('{', cursor);
        if (text[cursor] === '@' && (brace < 0 || (semicolon >= 0 && semicolon < brace))) {
          const stop = semicolon >= 0 && semicolon < end ? semicolon : end;
          const header = text.slice(cursor, stop).trim();
          const m = header.match(/^@([\w-]+)\s*(.*)$/s);
          if (m) {
            const rule = inventoryApi.add(inventory, 'cssRules', 'css-rule', {
              documentId: document.id, stylesheetId: stylesheet.id, parentRuleId: parentRuleId || null,
              ruleType: 'at-rule', name: m[1].toLowerCase(), prelude: m[2].trim(), source: { start: position(starts, cursor), end: position(starts, stop + 1) }
            });
            stylesheet.ruleIds.push(rule.id);
            if (rule.name === 'import') {
              const im = rule.prelude.match(/^(?:url\(\s*)?["']?([^"'\s)]+)["']?\s*\)?/i);
              if (im) addReference('css-import', im[1], rule.id, null, cursor);
            }
          }
          cursor = stop + 1;
          continue;
        }
        if (brace < 0 || brace >= end) {
          if (text.slice(cursor, end).trim()) inventoryApi.add(inventory, 'diagnostics', 'diagnostic', { code: 'CSS_UNPARSED_TRAILING_CONTENT', severity: 'warning', documentId: document.id, location: position(starts, cursor) });
          break;
        }
        const close = scanBlockEnd(text, brace);
        if (close < 0 || close > end) {
          inventoryApi.add(inventory, 'diagnostics', 'diagnostic', { code: 'CSS_UNCLOSED_BLOCK', severity: 'warning', documentId: document.id, location: position(starts, brace) });
          break;
        }
        const header = text.slice(cursor, brace).trim();
        const body = text.slice(brace + 1, close);
        if (header.startsWith('@')) {
          const m = header.match(/^@([\w-]+)\s*(.*)$/s);
          const name = m ? m[1].toLowerCase() : 'unknown';
          const prelude = m ? m[2].trim() : header;
          const rule = inventoryApi.add(inventory, 'cssRules', 'css-rule', {
            documentId: document.id, stylesheetId: stylesheet.id, parentRuleId: parentRuleId || null,
            ruleType: 'at-rule', name, prelude, source: { start: position(starts, cursor), end: position(starts, close + 1) }
          });
          stylesheet.ruleIds.push(rule.id);
          if (['media', 'container', 'supports', 'layer', 'keyframes', '-webkit-keyframes'].includes(name)) parseRange(brace + 1, close, rule.id);
          else {
            splitDeclarations(body, brace + 1).forEach(dec => {
              const d = inventoryApi.add(inventory, 'declarations', 'declaration', Object.assign({ documentId: document.id, stylesheetId: stylesheet.id, ruleId: rule.id, customProperty: dec.name.startsWith('--'), source: position(starts, dec.offset) }, dec));
              urlReferences(dec.value).forEach(uri => addReference('css-url', uri, rule.id, d.id, dec.offset));
            });
          }
        } else {
          const selectors = header.split(',').map(item => item.trim()).filter(Boolean);
          const rule = inventoryApi.add(inventory, 'cssRules', 'css-rule', {
            documentId: document.id, stylesheetId: stylesheet.id, parentRuleId: parentRuleId || null,
            ruleType: 'qualified-rule', selectorText: header, selectors, source: { start: position(starts, cursor), end: position(starts, close + 1) }
          });
          stylesheet.ruleIds.push(rule.id);
          splitDeclarations(body, brace + 1).forEach(dec => {
            const d = inventoryApi.add(inventory, 'declarations', 'declaration', Object.assign({ documentId: document.id, stylesheetId: stylesheet.id, ruleId: rule.id, customProperty: dec.name.startsWith('--'), source: position(starts, dec.offset) }, dec));
            urlReferences(dec.value).forEach(uri => addReference('css-url', uri, rule.id, d.id, dec.offset));
          });
        }
        cursor = close + 1;
      }
    }

    parseRange(0, text.length, null);
    return inventory;
  }

  return Object.freeze({ VERSION, analyze });
});
