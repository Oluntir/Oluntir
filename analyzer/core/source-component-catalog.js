'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SCHEMA_VERSION = 1;
const MAX_COMPONENTS = 250;
const MAX_MARKUP_BYTES = 128 * 1024;
const SEMANTIC_TAGS = new Set(['section', 'nav', 'header', 'footer', 'article', 'aside', 'form', 'table', 'ul', 'ol', 'video']);
const COMPONENT_SIGNAL = /(?:card|navbar|hero|accordion|carousel|modal|tab|alert|button|grid|row|container|toast|dropdown|pagination|gallery|slider|component|block|jumbotron|media(?:-body)?|offcanvas|collapse|spinner|progress|breadcrumb|list-group|input-group|form-control|form-check|custom-control|custom-file|custom-select|placeholder|video)/i;

function sha256(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function stripTags(value) { return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
function safeRelativeAsset(documentPath, value) {
  const raw = String(value || '').trim().split('#')[0].split('?')[0];
  if (!raw || /^(?:[a-z]+:|\/\/|data:|#)/i.test(raw)) return null;
  const candidate = path.posix.normalize(path.posix.join(path.posix.dirname(documentPath.replace(/\\/g, '/')), raw.replace(/\\/g, '/')));
  if (!candidate || candidate === '.' || candidate.startsWith('../') || candidate.startsWith('/')) return null;
  return candidate;
}

function sanitizeMarkup(html) {
  return String(html || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

function escapeRegExp(value) { return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function elementEnd(content, start, tagName, selfClosing, fallback) {
  if (selfClosing) return fallback;
  const tag = escapeRegExp(String(tagName || '').toLowerCase());
  if (!tag) return fallback;
  const tokenPattern = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
  tokenPattern.lastIndex = start;
  let depth = 0;
  let match;
  while ((match = tokenPattern.exec(content))) {
    const token = match[0];
    const isClosing = /^<\//.test(token);
    const isSelfClosing = /\/\s*>$/.test(token);
    if (isClosing) {
      depth -= 1;
      if (depth <= 0) return match.index + token.length;
    } else if (!isSelfClosing) {
      depth += 1;
    } else if (depth === 0) {
      return match.index + token.length;
    }
  }
  return fallback;
}

function attributesFor(inventory) {
  const result = new Map();
  (inventory.attributes || []).forEach(attribute => {
    if (!result.has(attribute.nodeId)) result.set(attribute.nodeId, {});
    result.get(attribute.nodeId)[attribute.normalizedName || String(attribute.name).toLowerCase()] = attribute.value;
  });
  return result;
}

function createLabel(markup, tagName, classes) {
  if (String(tagName || '').toLowerCase() === 'video') return 'HTML5 Video';
  const heading = markup.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]\s*>/i);
  const headingText = heading ? stripTags(heading[1]) : '';
  if (headingText) return headingText.slice(0, 80);
  const signal = String(classes || '').split(/\s+/).find(item => COMPONENT_SIGNAL.test(item));
  return signal ? signal.replace(/[-_]+/g, ' ') : `${tagName} Source-Element`;
}

function build(report, sourceRoot, metadata = {}) {
  const inventory = report && report.inventory;
  if (!inventory || inventory.kind !== 'oluntir-source-inventory') throw new Error('Source-Inventar wird für den Komponenten-Katalog benötigt.');
  const documents = new Map((inventory.documents || []).map(document => [document.id, document]));
  const attributes = attributesFor(inventory);
  const candidates = [];
  const candidateNodeIds = new Set();

  (inventory.nodes || []).forEach(node => {
    const attrs = attributes.get(node.id) || {};
    const classes = String(attrs.class || '');
    const semantic = SEMANTIC_TAGS.has(String(node.tagName || '').toLowerCase());
    const signaled = COMPONENT_SIGNAL.test(classes);
    if (!semantic && !signaled) return;
    if (String(node.tagName || '').toLowerCase() === 'div' && !signaled) return;
    const document = documents.get(node.documentId);
    if (!document || !node.source || !node.source.start || !node.source.end) return;
    const sourceFile = path.join(sourceRoot, document.path);
    if (!fs.existsSync(sourceFile) || !fs.statSync(sourceFile).isFile()) return;
    const content = fs.readFileSync(sourceFile, 'utf8');
    const start = Number(node.source.start.offset); const openingEnd = Number(node.source.end.offset);
    if (!Number.isInteger(start) || !Number.isInteger(openingEnd) || openingEnd <= start) return;
    const end = elementEnd(content, start, node.tagName, node.selfClosing, openingEnd);
    if (!Number.isInteger(end) || end <= start || end - start > MAX_MARKUP_BYTES) return;
    const originalMarkup = content.slice(start, end);
    const markup = sanitizeMarkup(originalMarkup);
    if (!markup.trim()) return;
    const componentId = `source-component:${sha256(`${metadata.packageId || 'package'}\0${document.path}\0${start}`).slice(0, 20)}`;
    if (candidateNodeIds.has(componentId)) return;
    candidateNodeIds.add(componentId);
    const assetReferences = [];
    const referencePattern = /\b(?:src|href|poster)\s*=\s*(["'])(.*?)\1/gi;
    let match;
    while ((match = referencePattern.exec(originalMarkup))) {
      const sourcePath = safeRelativeAsset(document.path, match[2]);
      if (!sourcePath) continue;
      const assetFile = path.join(sourceRoot, ...sourcePath.split('/'));
      if (!fs.existsSync(assetFile) || !fs.statSync(assetFile).isFile()) continue;
      if (!assetReferences.some(reference => reference.sourcePath === sourcePath)) {
        assetReferences.push({ attribute: match[0].slice(0, match[0].indexOf('=')), original: match[2], sourcePath });
      }
    }
    candidates.push({
      kind: 'oluntir-source-component-candidate', schemaVersion: SCHEMA_VERSION, componentId,
      label: createLabel(markup, node.tagName, classes), tagName: node.tagName,
      html: markup, sourceBacked: true, editable: true, mutationPolicy: 'user-insert-only',
      source: { document: document.path, nodeId: node.id, startOffset: start, endOffset: end },
      evidence: { semanticTag: semantic, classes: classes.split(/\s+/).filter(Boolean), attributes: attrs },
      assetReferences, requiresScript: /\bdata-[a-z0-9-]+\s*=/.test(originalMarkup) || /\bon[a-z]+\s*=/.test(originalMarkup)
    });
  });

  candidates.sort((a, b) => a.source.document.localeCompare(b.source.document) || a.source.startOffset - b.source.startOffset);
  return {
    kind: 'oluntir-source-component-catalog', schemaVersion: SCHEMA_VERSION,
    packageId: metadata.packageId || null, frameworkId: metadata.frameworkId || null,
    generatedAt: new Date().toISOString(), policy: { readOnlyAnalysis: true, sourceBacked: true, createOluntirComponents: false, documentMutation: 'user-insert-only' },
    components: candidates.slice(0, MAX_COMPONENTS)
  };
}

module.exports = Object.freeze({ SCHEMA_VERSION, build, sanitizeMarkup, safeRelativeAsset });
