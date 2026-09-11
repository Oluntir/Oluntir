(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirTemplateJavaScriptAnalyzer = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const SCHEMA_VERSION = 1;
  const ANALYZER_VERSION = '2.3.0';
  const SCRIPT_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx']);

  // Generic library signatures only. These are framework/plugin signatures, never
  // template names, paths or CSS classes from a concrete imported template.
  const LIBRARY_SIGNATURES = [
    { id: 'bootstrap', type: 'framework', fileRe: /(?:^|\/)bootstrap(?:\.bundle)?(?:\.min)?\.js$/i, providerRe: /(?:Bootstrap\s+v?\d|bootstrap\.(?:Alert|Button|Carousel|Collapse|Dropdown|Modal|Popover|ScrollSpy|Tab|Toast|Tooltip))/i, invocationRe: /^(?:alert|button|carousel|collapse|dropdown|modal|popover|scrollspy|tab|toast|tooltip)$/i },
    { id: 'jquery', type: 'runtime-library', fileRe: /(?:^|\/)jquery(?:-\d+(?:\.\d+)*)?(?:\.min)?\.js$/i, providerRe: /(?:jQuery JavaScript Library|function\s*\(\s*window\s*,\s*noGlobal|\bjQuery\.fn\s*=)/i },
    { id: 'popper', type: 'runtime-library', fileRe: /(?:^|\/)(?:popper|popper\.min)\.js$/i, providerRe: /(?:Popper\.js|@popperjs\/core|\bcreatePopper\b)/i },
    { id: 'swiper', type: 'vendor-plugin', fileRe: /(?:^|\/)swiper(?:\.esm(?:\.bundle)?|\.min)?\.js$/i, providerRe: /(?:Swiper \d|swiperjs\.com|function\s+Swiper\s*\()/i, invocationRe: /^Swiper$/i, semantic: 'carousel' },
    { id: 'swiper-animation', type: 'vendor-plugin', fileRe: /(?:^|\/)SwiperAnimation(?:\.min)?\.js$/i, providerRe: /(?:function\s+SwiperAnimation\s*\(|window\.SwiperAnimation\s*=)/i, invocationRe: /^SwiperAnimation$/i, semantic: 'animation' },
    { id: 'owl-carousel', type: 'vendor-plugin', fileRe: /(?:^|\/)owl\.carousel(?:\.min)?\.js$/i, providerRe: /(?:\$\.fn\.owlCarousel\s*=|jQuery\.fn\.owlCarousel\s*=)/i, invocationRe: /^owlCarousel$/i, semantic: 'carousel' },
    { id: 'slick', type: 'vendor-plugin', fileRe: /(?:^|\/)slick(?:\.min)?\.js$/i, providerRe: /(?:\$\.fn\.slick\s*=|jQuery\.fn\.slick\s*=)/i, invocationRe: /^slick$/i, semantic: 'carousel' },
    { id: 'splide', type: 'vendor-plugin', fileRe: /(?:^|\/)splide(?:\.min)?\.js$/i, providerRe: /(?:function\s+Splide\s*\(|class\s+Splide\b)/i, invocationRe: /^Splide$/i, semantic: 'carousel' },
    { id: 'glide', type: 'vendor-plugin', fileRe: /(?:^|\/)glide(?:\.min)?\.js$/i, providerRe: /(?:function\s+Glide\s*\(|class\s+Glide\b)/i, invocationRe: /^Glide$/i, semantic: 'carousel' },
    { id: 'magnific-popup', type: 'vendor-plugin', fileRe: /(?:^|\/)(?:jquery\.)?magnific-popup(?:\.min)?\.js$/i, providerRe: /(?:\$\.fn\.magnificPopup\s*=|jQuery\.fn\.magnificPopup\s*=)/i, invocationRe: /^magnificPopup$/i, semantic: 'lightbox' },
    { id: 'photoswipe', type: 'vendor-plugin', fileRe: /(?:^|\/)photoswipe(?:-ui-default)?(?:\.min)?\.js$/i, providerRe: /(?:function\s+PhotoSwipe\s*\(|window\.PhotoSwipe\s*=)/i, invocationRe: /^PhotoSwipe$/i, semantic: 'lightbox' },
    { id: 'shuffle', type: 'vendor-plugin', fileRe: /(?:^|\/)shuffle(?:\.min)?\.js$/i, providerRe: /(?:function\s+Shuffle\s*\(|window\.Shuffle\s*=|class\s+Shuffle\b)/i, invocationRe: /^Shuffle$/i, semantic: 'filter' },
    { id: 'isotope', type: 'vendor-plugin', fileRe: /(?:^|\/)isotope(?:\.pkgd)?(?:\.min)?\.js$/i, providerRe: /(?:function\s+Isotope\s*\(|window\.Isotope\s*=)/i, invocationRe: /^(?:Isotope|isotope)$/i, semantic: 'filter' },
    { id: 'masonry', type: 'vendor-plugin', fileRe: /(?:^|\/)masonry(?:\.pkgd)?(?:\.min)?\.js$/i, providerRe: /(?:function\s+Masonry\s*\(|window\.Masonry\s*=)/i, invocationRe: /^Masonry$/i, semantic: 'layout' },
    { id: 'jarallax', type: 'vendor-plugin', fileRe: /(?:^|\/)jarallax(?:-video)?(?:\.min)?\.js$/i, providerRe: /(?:window\.jarallax\s*=|\$\.fn\.jarallax\s*=)/i, invocationRe: /^jarallax$/i, semantic: 'parallax' },
    { id: 'countto', type: 'vendor-plugin', fileRe: /(?:^|\/)jquery\.countTo(?:\.min)?\.js$/i, providerRe: /(?:\$\.fn\.countTo\s*=|jQuery\.fn\.countTo\s*=)/i, invocationRe: /^countTo$/i, semantic: 'counter' },
    { id: 'appear', type: 'vendor-plugin', fileRe: /(?:^|\/)jquery\.appear(?:\.min)?\.js$/i, providerRe: /(?:\$\.fn\.appear\s*=|jQuery\.fn\.appear\s*=)/i, invocationRe: /^appear$/i, semantic: 'viewport-trigger' },
    { id: 'downcount', type: 'vendor-plugin', fileRe: /(?:^|\/)jquery\.downCount(?:\.min)?\.js$/i, providerRe: /(?:\$\.fn\.downCount\s*=|jQuery\.fn\.downCount\s*=)/i, invocationRe: /^downCount$/i, semantic: 'countdown' }
  ];

  const SEMANTIC_RULES = [
    { id: 'carousel', re: /(?:carousel|slider|swiper|slick|splide|glide|owl)/i },
    { id: 'lightbox', re: /(?:lightbox|popup|magnific|photoswipe|fancybox)/i },
    { id: 'filter', re: /(?:filter|shuffle|isotope|mixitup)/i },
    { id: 'modal', re: /(?:modal|dialog)/i },
    { id: 'dropdown', re: /(?:dropdown)/i },
    { id: 'collapse', re: /(?:collapse|accordion)/i },
    { id: 'tooltip', re: /(?:tooltip)/i },
    { id: 'popover', re: /(?:popover)/i },
    { id: 'counter', re: /(?:counter|countto|count-up|countup)/i },
    { id: 'countdown', re: /(?:countdown|downcount)/i },
    { id: 'parallax', re: /(?:parallax|jarallax)/i },
    { id: 'sticky', re: /(?:sticky|affix)/i },
    { id: 'scroll', re: /(?:scroll|backtotop|back-to-top|gototop|go-to-top)/i },
    { id: 'animation', re: /(?:animate|animation|wow|aos)/i }
  ];

  const JQUERY_CORE_METHODS = new Set([
    'add','addBack','addClass','after','ajaxComplete','ajaxError','ajaxSend','ajaxStart','ajaxStop','ajaxSuccess','animate','append','appendTo','attr','before','bind','blur','change','children','click','clone','closest','contents','css','data','delay','delegate','detach','each','empty','end','eq','fadeIn','fadeOut','fadeTo','fadeToggle','filter','find','first','focus','get','has','hasClass','height','hide','hover','html','index','innerHeight','innerWidth','insertAfter','insertBefore','is','keydown','keypress','keyup','last','load','map','mousedown','mouseenter','mouseleave','mousemove','mouseout','mouseover','mouseup','next','nextAll','nextUntil','not','off','offset','on','one','outerHeight','outerWidth','parent','parents','parentsUntil','position','prepend','prependTo','prev','prevAll','prevUntil','prop','ready','remove','removeAttr','removeClass','removeData','removeProp','replaceAll','replaceWith','resize','scroll','scrollLeft','scrollTop','serialize','serializeArray','show','siblings','slice','stop','submit','text','toggle','toggleClass','trigger','triggerHandler','unbind','undelegate','unwrap','val','width','wrap','wrapAll','wrapInner'
  ]);


  const DOM_CORE_METHODS = new Set([
    'querySelector','querySelectorAll','getElementById','getElementsByClassName','getElementsByTagName','addEventListener','removeEventListener','dispatchEvent','appendChild','removeChild','insertBefore','replaceChild','setAttribute','getAttribute','hasAttribute','removeAttribute','closest','matches','contains','focus','blur','click','submit','reset','scrollIntoView'
  ]);

  function text(value) { return String(value == null ? '' : value); }
  function posix(value) { return text(value).replace(/\\/g, '/'); }
  function basename(value) { const p = posix(value).replace(/\/+$/, ''); const i = p.lastIndexOf('/'); return i < 0 ? p : p.slice(i + 1); }
  function dirname(value) { const p = posix(value).replace(/\/+$/, ''); const i = p.lastIndexOf('/'); return i < 0 ? '' : p.slice(0, i); }
  function extname(value) { const base = basename(value); const i = base.lastIndexOf('.'); return i > 0 ? base.slice(i).toLowerCase() : ''; }
  function stableHash(value) { const s = text(value); let h1 = 2166136261 >>> 0; let h2 = 2246822519 >>> 0; for (let i = 0; i < s.length; i += 1) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619) >>> 0; h2 = Math.imul(h2 ^ c, 1597334677) >>> 0; } return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0'); }
  function unique(values) { return Array.from(new Set((values || []).filter(Boolean))); }
  function countLinesBefore(source, offset) { let line = 1; for (let i = 0; i < offset; i += 1) if (source.charCodeAt(i) === 10) line += 1; return line; }
  function sourceLocation(source, offset) { const before = source.slice(0, offset); const lastBreak = before.lastIndexOf('\n'); return { offset, line: countLinesBefore(source, offset), column: offset - lastBreak }; }
  function cleanUrl(value) { return text(value).trim().split('#')[0].split('?')[0]; }
  function localRef(documentPath, value, fileSet) {
    const raw = cleanUrl(value);
    if (!raw || /^(?:[a-z]+:|\/\/|data:|blob:|#)/i.test(raw)) return null;
    const parts = (raw.startsWith('/') ? raw.slice(1) : `${dirname(documentPath)}/${raw}`).replace(/\\/g, '/').split('/');
    const normalized = [];
    parts.forEach(part => { if (!part || part === '.') return; if (part === '..') normalized.pop(); else normalized.push(part); });
    const result = normalized.join('/');
    return fileSet.has(result) ? result : null;
  }

  function extractHtmlScriptEntries(file, fileSet) {
    const html = text(file && file.content);
    const entries = [];
    const re = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
    let match, inlineIndex = 0;
    while ((match = re.exec(html))) {
      const attrs = match[1] || '';
      const srcMatch = /\bsrc\s*=\s*(["'])(.*?)\1/i.exec(attrs);
      const typeMatch = /\btype\s*=\s*(["'])(.*?)\1/i.exec(attrs);
      const module = Boolean(typeMatch && String(typeMatch[2]).toLowerCase() === 'module');
      if (srcMatch) {
        const src = srcMatch[2];
        const resolved = localRef(file.path, src, fileSet);
        entries.push({ kind: resolved ? 'local' : 'external', value: resolved || src, module, inline: false, document: file.path, order: entries.length, source: sourceLocation(html, match.index) });
      } else if (text(match[2]).trim()) {
        inlineIndex += 1;
        entries.push({ kind: 'inline', value: `inline:${file.path}#${inlineIndex}`, module, inline: true, document: file.path, order: entries.length, content: match[2], source: sourceLocation(html, match.index) });
      }
    }
    return entries;
  }

  function scriptLoadModel(files, roles) {
    const list = Array.isArray(files) ? files : [];
    const fileSet = new Set(list.map(file => posix(file.path)));
    const primary = new Set((roles && roles.primaryDocuments) || []);
    const auxiliary = new Set((roles && roles.auxiliaryDocuments) || []);
    const htmlFiles = list.filter(file => /\.s?html?$/i.test(file.path));
    const pages = htmlFiles.map(file => {
      const scope = primary.has(file.path) ? 'primary' : auxiliary.has(file.path) ? 'auxiliary' : 'other';
      return { document: file.path, scope, scripts: extractHtmlScriptEntries(file, fileSet) };
    });
    const primaryPaths = new Set();
    const auxiliaryPaths = new Set();
    pages.forEach(page => page.scripts.forEach(script => { if (script.kind !== 'local') return; if (page.scope === 'primary') primaryPaths.add(script.value); else if (page.scope === 'auxiliary') auxiliaryPaths.add(script.value); }));
    return { pages, primaryPaths, auxiliaryPaths, fileSet };
  }

  function detectVersion(path, content, libraryId) {
    const head = text(content).slice(0, 12000);
    const patterns = [
      libraryId === 'bootstrap' ? /Bootstrap\s+v?([0-9]+(?:\.[0-9]+){1,3})/i : null,
      libraryId === 'jquery' ? /jQuery(?: JavaScript Library)?\s+v?([0-9]+(?:\.[0-9]+){1,3})/i : null,
      libraryId ? new RegExp(`${escapeRegExp(libraryId)}[^\n]{0,40}?v?([0-9]+(?:\.[0-9]+){1,3})`, 'i') : null,
      /@version\s+([0-9]+(?:\.[0-9]+){1,3})/i,
      /version\s*[:=]\s*["']?([0-9]+(?:\.[0-9]+){1,3})/i
    ].filter(Boolean);
    for (const pattern of patterns) { const match = pattern.exec(head); if (match) return match[1]; }
    const fileMatch = basename(path).match(/(?:^|[-_.])v?([0-9]+(?:\.[0-9]+){1,3})(?:[-_.]|$)/i);
    return fileMatch ? fileMatch[1] : null;
  }

  function detectLibrary(path, content) {
    const source = text(content).slice(0, 220000);
    const normalizedPath = posix(path);
    for (const signature of LIBRARY_SIGNATURES) {
      const byFile = Boolean(signature.fileRe && signature.fileRe.test(normalizedPath));
      if (byFile || (signature.providerRe && signature.providerRe.test(source))) {
        return { id: signature.id, type: signature.type, semantic: signature.semantic || null, version: detectVersion(path, content, signature.id), confidence: byFile ? 0.99 : 0.96 };
      }
    }
    return null;
  }

  function looksMinified(source) {
    const value = text(source);
    if (value.length < 600) return false;
    const lines = value.split(/\r?\n/);
    if (lines.length <= 4 && value.length > 1200) return true;
    const average = value.length / Math.max(1, lines.length);
    return average > 280;
  }

  function extractMatches(source, regex, mapper, limit) {
    const result = []; const cap = limit || 400; let match;
    regex.lastIndex = 0;
    while ((match = regex.exec(source)) && result.length < cap) {
      const item = mapper(match);
      if (item) result.push(Object.assign({ source: sourceLocation(source, match.index) }, item));
      if (match[0] === '') regex.lastIndex += 1;
    }
    return result;
  }

  function normalizeSelector(value) {
    let selector = text(value).trim();
    if (!selector || selector.length > 240 || /[<>`]/.test(selector)) return null;
    if (/^(?:window|document|body|html)$/i.test(selector)) return selector.toLowerCase();
    if (!/[.#\[:>+~,*\s]/.test(selector) && !/^[a-z][\w-]*$/i.test(selector)) return null;
    return selector;
  }

  function extractSelectors(source) {
    const result = [];
    const add = item => { if (item && item.selector) result.push(item); };
    extractMatches(source, /(?:document\s*\.)?(?:querySelector|querySelectorAll)\s*\(\s*(["'])(.*?)\1\s*\)/g, m => ({ kind: 'query-selector', selector: normalizeSelector(m[2]) }), 500).forEach(add);
    extractMatches(source, /\.(?:matches|closest|find|children|next|prev|parents|filter)\s*\(\s*(["'])(.*?)\1\s*\)/g, m => ({ kind: 'selector-method', selector: normalizeSelector(m[2]) }), 500).forEach(add);
    extractMatches(source, /(?:\$|jQuery)\s*\(\s*(["'])(.*?)\1\s*\)/g, m => {
      const raw = m[2];
      if (/^\s*</.test(raw)) return null;
      return { kind: 'jquery-selector', selector: normalizeSelector(raw) };
    }, 700).forEach(add);
    extractMatches(source, /getElementById\s*\(\s*(["'])(.*?)\1\s*\)/g, m => ({ kind: 'get-element-id', selector: normalizeSelector(`#${m[2]}`) }), 300).forEach(add);
    extractMatches(source, /getElementsByClassName\s*\(\s*(["'])(.*?)\1\s*\)/g, m => ({ kind: 'get-elements-class', selector: normalizeSelector(`.${m[2]}`) }), 300).forEach(add);
    return result.filter(item => item.selector);
  }

  function extractVariableSelectors(source) {
    const map = new Map();
    const patterns = [
      /(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:document\s*\.)?(?:querySelector|querySelectorAll)\s*\(\s*(["'])(.*?)\2\s*\)/g,
      /(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:\$|jQuery)\s*\(\s*(["'])(.*?)\2\s*\)/g
    ];
    patterns.forEach(re => extractMatches(source, re, m => ({ variable: m[1], selector: normalizeSelector(m[3]) }), 300).forEach(item => { if (item.selector) map.set(item.variable, item.selector); }));
    return map;
  }

  function extractImports(source) {
    const records = [];
    extractMatches(source, /\bimport\s+(?:[^'";]+?\s+from\s+)?["']([^"']+)["']/g, m => ({ kind: 'esm-import', specifier: m[1] }), 200).forEach(x => records.push(x));
    extractMatches(source, /\bexport\s+[^'";]+?\s+from\s+["']([^"']+)["']/g, m => ({ kind: 'esm-export-from', specifier: m[1] }), 100).forEach(x => records.push(x));
    extractMatches(source, /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g, m => ({ kind: 'dynamic-import', specifier: m[1] }), 100).forEach(x => records.push(x));
    extractMatches(source, /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g, m => ({ kind: 'commonjs-require', specifier: m[1] }), 200).forEach(x => records.push(x));
    return records;
  }

  function extractPluginProviders(source) {
    const records = [];
    extractMatches(source, /(?:jQuery|\$)\.fn\.([A-Za-z_$][\w$]*)\s*=/g, m => ({ kind: 'jquery-plugin', symbol: `jquery.fn.${m[1]}`, plugin: m[1] }), 300).forEach(x => records.push(x));
    extractMatches(source, /(?:window|globalThis)\.([A-Z][A-Za-z0-9_$]*)\s*=/g, m => ({ kind: 'global', symbol: m[1] }), 300).forEach(x => records.push(x));
    extractMatches(source, /\bclass\s+([A-Z][A-Za-z0-9_$]*)\b/g, m => ({ kind: 'class', symbol: m[1] }), 200).forEach(x => records.push(x));
    return records;
  }

  function extractInvocations(source, variableSelectors) {
    const records = [];
    const seen = new Set();
    function push(item) {
      if (!item) return;
      const key = `${item.kind}\0${item.plugin || ''}\0${item.selector || ''}\0${item.event || ''}\0${item.source ? item.source.offset : ''}`;
      if (!seen.has(key)) { seen.add(key); records.push(item); }
    }
    extractMatches(source, /new\s+([A-Z][A-Za-z0-9_$]*)\s*\(\s*(["'])(.*?)\2/g, m => ({ kind: 'constructor', plugin: m[1], selector: normalizeSelector(m[3]) }), 300).forEach(push);
    extractMatches(source, /new\s+([A-Z][A-Za-z0-9_$]*)\s*\(\s*([A-Za-z_$][\w$]*)/g, m => ({ kind: 'constructor', plugin: m[1], selector: variableSelectors.get(m[2]) || null, variable: m[2] }), 300).forEach(push);
    extractMatches(source, /(?:\$|jQuery)\s*\(\s*(["'])(.*?)\1\s*\)\s*\.\s*([A-Za-z_$][\w$]*)\s*\(/g, m => {
      if (JQUERY_CORE_METHODS.has(m[3])) return null;
      return { kind: 'jquery-plugin-call', plugin: m[3], selector: normalizeSelector(m[2]) };
    }, 600).forEach(push);
    extractMatches(source, /(?:\$|jQuery)\s*\(\s*(["'])(.*?)\1\s*\)\s*\.\s*on\s*\(\s*(["'])(.*?)\3/g, m => ({ kind: 'jquery-event', event: m[4], selector: normalizeSelector(m[2]) }), 500).forEach(push);
    extractMatches(source, /(?:document\s*\.)?(?:querySelector|querySelectorAll)\s*\(\s*(["'])(.*?)\1\s*\)\s*\.\s*addEventListener\s*\(\s*(["'])(.*?)\3/g, m => ({ kind: 'event-listener', event: m[4], selector: normalizeSelector(m[2]) }), 400).forEach(push);
    extractMatches(source, /(?:\$|jQuery)\s*\(\s*this\s*\)\s*\.\s*([A-Za-z_$][\w$]*)\s*\(/g, m => {
      if (JQUERY_CORE_METHODS.has(m[1])) return null;
      return { kind: 'jquery-this-plugin-call', plugin: m[1], selector: null };
    }, 300).forEach(push);
    extractMatches(source, /\.(find|children|closest|parent|parents|next|prev|filter|eq)\s*\([^)]{0,300}\)\s*\.\s*([A-Za-z_$][\w$]*)\s*\(/g, m => {
      if (JQUERY_CORE_METHODS.has(m[2]) || DOM_CORE_METHODS.has(m[2])) return null;
      return { kind: 'jquery-chain-plugin-call', plugin: m[2], selector: null, via: m[1] };
    }, 400).forEach(push);
    extractMatches(source, /([A-Za-z_$][\w$]*)\s*\.\s*([A-Za-z_$][\w$]*)\s*\(/g, m => {
      const selector = variableSelectors.get(m[1]) || null;
      if (JQUERY_CORE_METHODS.has(m[2]) || DOM_CORE_METHODS.has(m[2])) return null;
      if (!selector && !m[1].startsWith('$')) return null;
      return { kind: 'variable-plugin-call', plugin: m[2], selector, variable: m[1] };
    }, 700).forEach(push);
    extractMatches(source, /([A-Za-z_$][\w$]*)\s*\.\s*on\s*\(\s*(["'])(.*?)\2/g, m => {
      const selector = variableSelectors.get(m[1]);
      return selector ? { kind: 'jquery-event', event: m[3], selector, variable: m[1] } : null;
    }, 400).forEach(push);
    extractMatches(source, /\.addEventListener\s*\(\s*(["'])(.*?)\1/g, m => ({ kind: 'event-listener', event: m[2] }), 500).forEach(push);
    extractMatches(source, /\.on\s*\(\s*(["'])(.*?)\1/g, m => ({ kind: 'jquery-event', event: m[2] }), 700).forEach(push);
    extractMatches(source, /\.(?:data|attr)\s*\(\s*(["'])(data-[^"']+|[A-Za-z][\w-]*)\1/g, m => ({ kind: 'data-access', attribute: m[2].startsWith('data-') ? m[2] : `data-${m[2]}` }), 500).forEach(push);
    extractMatches(source, /\.dataset\.([A-Za-z_$][\w$]*)/g, m => ({ kind: 'data-access', attribute: `data-${m[1].replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}` }), 500).forEach(push);
    extractMatches(source, /\b(MutationObserver|IntersectionObserver|ResizeObserver)\s*\(/g, m => ({ kind: 'observer', plugin: m[1] }), 200).forEach(push);
    extractMatches(source, /\b(fetch|XMLHttpRequest)\b/g, m => ({ kind: 'network', plugin: m[1] }), 200).forEach(push);
    extractMatches(source, /\b(setTimeout|setInterval|requestAnimationFrame)\s*\(/g, m => ({ kind: 'timer', plugin: m[1] }), 300).forEach(push);
    return records;
  }

  function semanticForInvocation(invocation) {
    const value = `${invocation && invocation.plugin || ''} ${invocation && invocation.event || ''}`;
    const signature = invocation && invocation.plugin ? LIBRARY_SIGNATURES.find(item => item.invocationRe && item.invocationRe.test(invocation.plugin)) : null;
    if (signature && signature.semantic) return signature.semantic;
    const match = SEMANTIC_RULES.find(rule => rule.re.test(value));
    if (match) return match.id;
    if (invocation && invocation.kind === 'event-listener' || invocation && invocation.kind === 'jquery-event') return 'event-handler';
    if (invocation && invocation.kind === 'data-access') return 'data-driven';
    if (invocation && invocation.kind === 'observer') return 'dom-observer';
    if (invocation && invocation.kind === 'network') return 'network';
    if (invocation && invocation.kind === 'timer') return 'timer';
    return invocation && /plugin|constructor/.test(invocation.kind) ? 'plugin-interaction' : 'runtime-behavior';
  }

  function selectorTokens(selector) {
    const parts = text(selector).split(',').map(x => x.trim()).filter(Boolean);
    return parts.map(part => {
      const classes = Array.from(part.matchAll(/\.([A-Za-z_][\w-]*)/g)).map(m => m[1]);
      const ids = Array.from(part.matchAll(/#([A-Za-z_][\w-]*)/g)).map(m => m[1]);
      const attrs = Array.from(part.matchAll(/\[\s*([A-Za-z_:][\w:.-]*)/g)).map(m => m[1]);
      const tagMatch = /^\s*([a-z][\w-]*)/i.exec(part);
      return { raw: part, classes, ids, attrs, tag: tagMatch ? tagMatch[1].toLowerCase() : null };
    });
  }

  function htmlHasSelector(html, selector) {
    const source = text(html);
    if (selector === 'document' || selector === 'window') return true;
    if (selector === 'body') return /<body\b/i.test(source);
    if (selector === 'html') return /<html\b/i.test(source);
    const alternatives = selectorTokens(selector);
    return alternatives.some(tokens => {
      const idValues = Array.from(source.matchAll(/\bid\s*=\s*["']([^"']*)["']/gi)).map(match => match[1]);
      const classValues = Array.from(source.matchAll(/\bclass\s*=\s*["']([^"']*)["']/gi)).flatMap(match => match[1].split(/\s+/).filter(Boolean));
      if (tokens.ids.length && !tokens.ids.every(id => idValues.includes(id))) return false;
      if (tokens.classes.length && !tokens.classes.every(cls => classValues.includes(cls))) return false;
      if (tokens.attrs.length && !tokens.attrs.every(attr => new RegExp(`\\b${escapeRegExp(attr)}(?:\\s*=|\\s|>)`, 'i').test(source))) return false;
      if (!tokens.classes.length && !tokens.ids.length && !tokens.attrs.length && tokens.tag) return new RegExp(`<${escapeRegExp(tokens.tag)}\\b`, 'i').test(source);
      return Boolean(tokens.ids.length || tokens.classes.length || tokens.attrs.length);
    });
  }
  function escapeRegExp(value) { return text(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function mapSelector(selector, files, structure, roles, documentHint) {
    if (!selector) return { pages: [], regions: [], families: [], confidence: 0 };
    const fileMap = new Map((files || []).map(file => [file.path, file]));
    const primary = new Set((roles && roles.primaryDocuments) || []);
    const pages = [];
    const candidates = documentHint && primary.has(documentHint) ? [documentHint] : Array.from(primary);
    candidates.forEach(path => { const file = fileMap.get(path); if (file && htmlHasSelector(file.content, selector)) pages.push(path); });
    const regions = [];
    (structure && structure.regions || []).forEach(region => {
      if (!pages.includes(region.page)) return;
      const file = fileMap.get(region.page); if (!file) return;
      const slice = text(file.content).slice(region.source.startOffset, region.source.endOffset);
      if (htmlHasSelector(slice, selector)) regions.push(region.regionId);
    });
    const familyByRegion = new Map();
    (structure && structure.families || []).forEach(family => (family.regionIds || []).forEach(regionId => familyByRegion.set(regionId, family.familyId)));
    const families = unique(regions.map(regionId => familyByRegion.get(regionId)));
    const confidence = regions.length ? 0.95 : pages.length ? 0.72 : 0;
    return { pages, regions, families, confidence };
  }

  function resolveImportSpecifier(scriptPath, specifier, fileSet) {
    const raw = cleanUrl(specifier);
    if (!raw || !raw.startsWith('.')) return null;
    const base = `${dirname(scriptPath)}/${raw}`.replace(/\\/g, '/').split('/');
    const normalized = [];
    base.forEach(part => { if (!part || part === '.') return; if (part === '..') normalized.pop(); else normalized.push(part); });
    const candidate = normalized.join('/');
    const tries = [candidate, `${candidate}.js`, `${candidate}.mjs`, `${candidate}.cjs`, `${candidate}/index.js`, `${candidate}/index.mjs`];
    return tries.find(item => fileSet.has(item)) || null;
  }

  function classifyScript(path, content, scope, library, inline, providers, selectors, invocations) {
    if (inline) return 'inline-template-script';
    if (scope === 'auxiliary') return 'auxiliary';
    if (library) return library.type;
    if (scope === 'unreferenced') return 'unreferenced';
    const source = text(content);
    const vendorPath = /(?:^|\/)(?:vendor|vendors|plugins?|libs?|dist)\//i.test(posix(path));
    const providerHeavy = (providers || []).length > 0 && (selectors || []).length <= 2 && (invocations || []).length <= 5;
    if (looksMinified(source) || vendorPath || providerHeavy) return 'vendor-plugin';
    return 'template-custom';
  }

  function analyzeScriptRecord(record, files, structure, roles, fileSet) {
    const source = text(record.content);
    const library = detectLibrary(record.path, source);
    const variableSelectors = extractVariableSelectors(source);
    const selectors = extractSelectors(source);
    const imports = extractImports(source).map(item => Object.assign({}, item, { resolvedLocal: resolveImportSpecifier(record.path, item.specifier, fileSet) }));
    const providers = extractPluginProviders(source);
    const invocations = extractInvocations(source, variableSelectors);
    invocations.forEach(invocation => {
      if (invocation.selector || !invocation.plugin) return;
      let nearest = null;
      selectors.forEach(selectorRecord => {
        const distance = invocation.source.offset - selectorRecord.source.offset;
        if (distance < 0 || distance > 3500) return;
        if (!nearest || distance < nearest.distance) nearest = { selector: selectorRecord.selector, distance };
      });
      if (nearest) { invocation.selector = nearest.selector; invocation.selectorInference = 'nearest-static-selector'; invocation.selectorInferenceConfidence = nearest.distance <= 1200 ? 0.82 : 0.68; }
    });
    const role = classifyScript(record.path, source, record.scope, library, record.inline, providers, selectors, invocations);
    const behaviorSource = role === 'template-custom' || role === 'inline-template-script';
    const bindings = [];
    (behaviorSource ? invocations : []).forEach(invocation => {
      const mapping = invocation.selector ? mapSelector(invocation.selector, files, structure, roles, record.inline ? record.document : null) : { pages: [], regions: [], families: [], confidence: 0 };
      bindings.push({
        bindingId: `js-binding:${stableHash(`${record.path}\0${invocation.source.offset}\0${invocation.kind}\0${invocation.plugin || ''}\0${invocation.selector || ''}`)}`,
        kind: invocation.kind,
        behavior: semanticForInvocation(invocation),
        plugin: invocation.plugin || null,
        selector: invocation.selector || null,
        event: invocation.event || null,
        dataAttribute: invocation.attribute || null,
        pages: mapping.pages,
        regionIds: mapping.regions,
        familyIds: mapping.families,
        confidence: invocation.selector ? Math.min(mapping.confidence || 0.6, invocation.selectorInferenceConfidence || 1) : 0.45,
        selectorInference: invocation.selectorInference || null,
        source: invocation.source
      });
    });
    (behaviorSource ? selectors : []).forEach(selectorRecord => {
      if (bindings.some(binding => binding.selector === selectorRecord.selector && Math.abs((binding.source && binding.source.offset || 0) - selectorRecord.source.offset) < 100)) return;
      const mapping = mapSelector(selectorRecord.selector, files, structure, roles, record.inline ? record.document : null);
      bindings.push({
        bindingId: `js-binding:${stableHash(`${record.path}\0${selectorRecord.source.offset}\0selector\0${selectorRecord.selector}`)}`,
        kind: 'dom-selector', behavior: 'dom-binding', plugin: null, selector: selectorRecord.selector, event: null, dataAttribute: null,
        pages: mapping.pages, regionIds: mapping.regions, familyIds: mapping.families, confidence: mapping.confidence, source: selectorRecord.source
      });
    });
    const selfProvidedPlugins = new Set(providers.filter(provider => provider.plugin).map(provider => provider.plugin));
    const filteredBindings = bindings.filter(binding => !(binding.plugin && selfProvidedPlugins.has(binding.plugin) && binding.behavior === 'plugin-interaction'));
    return {
      path: record.path,
      runtimePath: record.sourceKind === 'file' ? `source/${record.path}` : record.sourceKind === 'external' ? record.path : null,
      sourceKind: record.sourceKind,
      document: record.document || null,
      scope: record.scope,
      role,
      inline: Boolean(record.inline),
      module: Boolean(record.module),
      byteLength: source.length,
      minified: looksMinified(source),
      library,
      imports,
      providers,
      selectors,
      bindings: filteredBindings
    };
  }

  function buildDependencyGraph(scriptAnalyses, loadModel) {
    const nodes = scriptAnalyses.map(script => ({ id: script.path, role: script.role, library: script.library && script.library.id || null, scope: script.scope, inline: script.inline }));
    const edges = [];
    const seen = new Set();
    const byPath = new Map(scriptAnalyses.map(script => [script.path, script]));
    const providers = new Map();
    scriptAnalyses.forEach(script => {
      if (script.scope !== 'primary') return;
      (script.providers || []).forEach(provider => { if (!providers.has(provider.symbol)) providers.set(provider.symbol, []); providers.get(provider.symbol).push(script.path); });
      if (script.library) { if (!providers.has(`library:${script.library.id}`)) providers.set(`library:${script.library.id}`, []); providers.get(`library:${script.library.id}`).push(script.path); }
    });
    function add(from, to, kind, detail, confidence) {
      if (!from || !to || from === to) return;
      const key = `${from}\0${to}\0${kind}\0${detail || ''}`;
      if (seen.has(key)) return; seen.add(key);
      edges.push({ from, to, kind, detail: detail || null, confidence: confidence == null ? 0.7 : confidence });
    }
    scriptAnalyses.forEach(script => {
      if (script.scope !== 'primary') return;
      script.imports.forEach(item => {
        if (item.resolvedLocal) add(item.resolvedLocal, script.path, 'explicit-import', item.specifier, 1);
        else {
          const id = text(item.specifier).replace(/^@[^/]+\//, '').split('/')[0].toLowerCase();
          const candidates = providers.get(`library:${id}`) || [];
          candidates.forEach(provider => add(provider, script.path, 'package-import', item.specifier, 0.95));
        }
      });
      script.bindings.forEach(binding => {
        if (!binding.plugin) return;
        const plugin = binding.plugin;
        const jqueryProviders = providers.get(`jquery.fn.${plugin}`) || [];
        jqueryProviders.forEach(provider => add(provider, script.path, 'plugin-provider', plugin, 0.98));
        const globalProviders = providers.get(plugin) || [];
        globalProviders.forEach(provider => add(provider, script.path, 'global-provider', plugin, 0.95));
        const signature = LIBRARY_SIGNATURES.find(sig => sig.invocationRe && sig.invocationRe.test(plugin));
        if (signature) (providers.get(`library:${signature.id}`) || []).filter(provider => byPath.get(provider) && byPath.get(provider).scope === 'primary').forEach(provider => add(provider, script.path, 'library-provider', signature.id, 0.92));
      });
    });
    // Load order is recorded as evidence, not assumed to be a hard dependency.
    const loadOrders = (loadModel.pages || []).filter(page => page.scope === 'primary').map(page => ({
      document: page.document,
      scripts: page.scripts.map(item => item.value)
    }));
    return { kind: 'oluntir-template-javascript-dependency-graph', schemaVersion: SCHEMA_VERSION, nodes, edges, loadOrders };
  }

  function analyze(files, roles, structure, framework) {
    const list = Array.isArray(files) ? files : [];
    const fileMap = new Map(list.map(file => [file.path, file]));
    const loadModel = scriptLoadModel(list, roles || {});
    const records = [];
    list.filter(file => SCRIPT_EXTENSIONS.has(extname(file.path))).forEach(file => {
      const scope = loadModel.primaryPaths.has(file.path) ? 'primary' : loadModel.auxiliaryPaths.has(file.path) ? 'auxiliary' : 'unreferenced';
      records.push({ path: file.path, content: file.content, sourceKind: 'file', scope, inline: false, module: /\.mjs$/i.test(file.path) });
    });
    loadModel.pages.filter(page => page.scope === 'primary').forEach(page => page.scripts.filter(item => item.inline).forEach(item => records.push({ path: item.value, content: item.content, sourceKind: 'inline', scope: 'primary', inline: true, module: item.module, document: item.document })));
    // External scripts are inventory/dependency nodes even when source code is unavailable.
    const externalSeen = new Set();
    loadModel.pages.filter(page => page.scope === 'primary').forEach(page => page.scripts.filter(item => item.kind === 'external').forEach(item => {
      if (externalSeen.has(item.value)) return; externalSeen.add(item.value);
      records.push({ path: item.value, content: '', sourceKind: 'external', scope: 'primary', inline: false, module: item.module, document: item.document });
    }));

    const scripts = records.map(record => analyzeScriptRecord(record, list, structure || {}, roles || {}, loadModel.fileSet));
    const dependencyGraph = buildDependencyGraph(scripts, loadModel);
    const bindings = scripts.flatMap(script => script.bindings.map(binding => Object.assign({ script: script.path, scriptRole: script.role, library: script.library && script.library.id || null }, binding)));
    const primaryScripts = scripts.filter(script => script.scope === 'primary');
    const primaryScriptFiles = primaryScripts.filter(script => !script.inline && script.sourceKind !== 'external');
    const inlineScripts = primaryScripts.filter(script => script.inline);
    const libraries = [];
    const librarySeen = new Set();
    scripts.forEach(script => { if (!script.library) return; const key = `${script.library.id}\0${script.path}`; if (!librarySeen.has(key)) { librarySeen.add(key); libraries.push({ id: script.library.id, type: script.library.type, semantic: script.library.semantic || null, version: script.library.version || null, path: script.path, scope: script.scope, confidence: script.library.confidence }); } });
    const behaviorCounts = {};
    bindings.forEach(binding => { behaviorCounts[binding.behavior] = (behaviorCounts[binding.behavior] || 0) + 1; });
    const mappedBindings = bindings.filter(binding => binding.familyIds.length || binding.regionIds.length || binding.pages.length);
    const customScripts = primaryScripts.filter(script => script.role === 'template-custom');
    const primaryLibraries = libraries.filter(library => library.scope === 'primary');
    const knownInvocation = plugin => LIBRARY_SIGNATURES.some(item => item.invocationRe && item.invocationRe.test(plugin));
    const unknownPluginCalls = bindings.filter(binding => /plugin|constructor/.test(binding.kind) && binding.plugin && !knownInvocation(binding.plugin));
    return {
      kind: 'oluntir-template-javascript-behavior-manifest',
      schemaVersion: SCHEMA_VERSION,
      analyzerVersion: ANALYZER_VERSION,
      framework: framework ? { baseFramework: framework.baseFramework || null, version: framework.version || null } : null,
      policy: { readOnlyAnalysis: true, sourceExecution: false, automaticActivation: false, documentMutation: false },
      summary: {
        scriptsTotal: scripts.length,
        primaryScripts: primaryScripts.length,
        primaryScriptFiles: primaryScriptFiles.length,
        inlineScripts: inlineScripts.length,
        auxiliaryScripts: scripts.filter(script => script.scope === 'auxiliary').length,
        unreferencedScripts: scripts.filter(script => script.scope === 'unreferenced').length,
        customScripts: customScripts.length,
        libraries: primaryLibraries.length,
        bindings: bindings.length,
        mappedBindings: mappedBindings.length,
        dependencyEdges: dependencyGraph.edges.length,
        unknownPluginCalls: unknownPluginCalls.length,
        behaviorCounts
      },
      scripts,
      libraries,
      bindings,
      dependencyGraph
    };
  }

  return Object.freeze({
    SCHEMA_VERSION,
    ANALYZER_VERSION,
    analyze,
    extractHtmlScriptEntries,
    extractSelectors,
    extractImports,
    extractPluginProviders,
    extractInvocations,
    mapSelector
  });
});
