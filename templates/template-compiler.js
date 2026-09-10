(function (root, factory) {
  const jsAnalyzer = typeof require === 'function' ? require('./javascript-analyzer.js') : root.OluntirTemplateJavaScriptAnalyzer;
  const jsRuntimePlanner = typeof require === 'function' ? require('./javascript-runtime-planner.js') : root.OluntirTemplateJavaScriptRuntimePlanner;
  const jsActivationPlanner = typeof require === 'function' ? require('./javascript-activation-planner.js') : root.OluntirTemplateJavaScriptActivationPlanner;
  const embedIsolator = typeof require === 'function' ? require('./embed-isolator.js') : root.OluntirTemplateEmbedIsolator;
  const api = factory(jsAnalyzer, jsRuntimePlanner, jsActivationPlanner, embedIsolator);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirTemplateCompiler = api;
})(typeof window !== 'undefined' ? window : globalThis, function (jsAnalyzer, jsRuntimePlanner, jsActivationPlanner, embedIsolator) {
  'use strict';

  const SCHEMA_VERSION = 1;
  const COMPILER_VERSION = '2.3.0';
  const TEXT_EXTENSIONS = new Set(['.html','.htm','.shtml','.css','.scss','.less','.sass','.js','.mjs','.cjs','.ts','.tsx','.json','.xml','.svg','.txt','.md']);
  const HTML_EXTENSIONS = new Set(['.html','.htm','.shtml']);
  const STYLE_EXTENSIONS = new Set(['.css','.scss','.less','.sass']);
  const SCRIPT_EXTENSIONS = new Set(['.js','.mjs','.cjs','.ts','.tsx']);
  const IMAGE_EXTENSIONS = new Set(['.png','.jpg','.jpeg','.gif','.webp','.avif','.svg','.ico','.bmp']);
  const FONT_EXTENSIONS = new Set(['.woff','.woff2','.ttf','.otf','.eot']);
  const MEDIA_EXTENSIONS = new Set(['.mp4','.webm','.ogg','.ogv','.mp3','.wav','.m4a']);
  const VOID_ELEMENTS = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  const IGNORE_TOP_LEVEL = new Set(['script','style','link','meta','noscript']);
  const UTILITY_CLASS = /^(?:container(?:-fluid)?|row|col(?:-|$)|d-|flex(?:-|$)|justify-|align-|order-|m[trblxyse]?-|p[trblxyse]?-|g[xy]?-|w-|h-(?:\d|sm-|md-|lg-|xl-)|min-vh-|min-vw-|position-|top-|bottom-|left-|right-|float-|clearfix$|overflow(?:-|$)|z-index|opacity-|rounded(?:-|$)|shadow(?:-|$)|border(?:-|$)|text-(?:left|right|center|justify|nowrap|white|dark|light|muted|primary|secondary|success|danger|warning|info)|bg-(?:primary|secondary|light|dark|white|transparent|success|danger|warning|info)|font-|img-fluid$|btn(?:-|$)|space-(?:pt|pb|pl|pr|px|py|ptb)|py-|px-|display-\d+$|lead$|form-(?:control|group|row|check|inline|text)|custom-|input-group|list-group|dropdown(?:-|$)|navbar(?:-|$)|nav(?:-|$)|media(?:-body)?$|badge(?:-|$)|breadcrumb(?:-|$)|pagination(?:-|$)|progress(?:-|$)|modal(?:-|$)|collapse$|card(?:-|$)|table(?:-|$)|sr-only$)/i;
  const UTILITY_REGION = /(?:back-to-top|preloader|loader|cookie|scroll-top)/i;
  const CATEGORY_RULES = [
    { id: 'hero', label: 'Hero / Banner', re: /(?:hero|banner|masthead|swiper|slider)/i },
    { id: 'service', label: 'Services / Features', re: /(?:service|feature|expertise|solution|process|benefit)/i },
    { id: 'team', label: 'Team', re: /(?:team|member|heroes|staff|person)/i },
    { id: 'testimonial', label: 'Testimonials', re: /(?:testimonial|review|quote|experience)/i },
    { id: 'portfolio', label: 'Portfolio / Gallery', re: /(?:portfolio|gallery|project|work|masonary|masonry)/i },
    { id: 'blog', label: 'Blog / News', re: /(?:blog|post|article|news|latest)/i },
    { id: 'client', label: 'Clients / Partners', re: /(?:client|partner|brand|logo)/i },
    { id: 'pricing', label: 'Pricing', re: /(?:pricing|price|plan|package)/i },
    { id: 'contact', label: 'Contact / Forms', re: /(?:contact|form|map|address)/i },
    { id: 'about', label: 'About / Content', re: /(?:about|story|mission|company|agency)/i },
    { id: 'cta', label: 'Call to Action', re: /(?:cta|call-to-action|newsletter|subscribe|signup|sign-up)/i },
    { id: 'auth', label: 'Authentication', re: /(?:sign-in|signin|sign-up|signup|login|register|account)/i },
    { id: 'stats', label: 'Statistics / Counters', re: /(?:counter|stat|facts|number)/i },
    { id: 'error', label: 'Error / Status', re: /(?:error|404|coming[ -]?soon|countdown)/i }
  ];

  function text(value) { return String(value == null ? '' : value); }
  function posix(value) { return text(value).replace(/\\/g, '/'); }
  function cleanId(value) { return text(value).trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, ''); }
  function extname(value) { const base = basename(value); const i = base.lastIndexOf('.'); return i > 0 ? base.slice(i).toLowerCase() : ''; }
  function dirname(value) { const p = posix(value).replace(/\/+$/, ''); const i = p.lastIndexOf('/'); return i < 0 ? '' : p.slice(0, i); }
  function basename(value) { const p = posix(value).replace(/\/+$/, ''); const i = p.lastIndexOf('/'); return i < 0 ? p : p.slice(i + 1); }
  function normalizePath(value) {
    const parts = [];
    posix(value).split('/').forEach(part => {
      if (!part || part === '.') return;
      if (part === '..') { if (!parts.length) throw new Error('Unsicherer relativer Pfad im Template.'); parts.pop(); return; }
      if (part.includes('\0')) throw new Error('Ungültiger Template-Pfad.');
      parts.push(part);
    });
    return parts.join('/');
  }
  function joinPath(base, relative) { return normalizePath(`${dirname(base)}/${relative}`); }
  function stableHash(value) {
    const s = text(value); let h1 = 2166136261 >>> 0; let h2 = 2246822519 >>> 0;
    for (let i = 0; i < s.length; i += 1) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619) >>> 0; h2 = Math.imul(h2 ^ c, 1597334677) >>> 0; }
    return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
  }
  function stripTags(value) { return text(value).replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim(); }
  function normalizedClassTokens(value) { return text(value).split(/\s+/).map(item => item.trim()).filter(Boolean); }
  function semanticClassTokens(value) { return normalizedClassTokens(value).filter(item => !UTILITY_CLASS.test(item)); }

  function stripCommonRoot(paths) {
    const list = paths.map(normalizePath).filter(Boolean);
    if (!list.length) return new Map();
    const parts = list.map(item => item.split('/'));
    const first = parts[0][0];
    const strip = Boolean(first && parts.every(item => item.length > 1 && item[0] === first));
    const result = new Map();
    list.forEach(original => result.set(original, strip ? original.split('/').slice(1).join('/') : original));
    return result;
  }

  function cleanLocalReference(value) {
    const raw = text(value).trim().split('#')[0].split('?')[0];
    if (!raw || /^(?:[a-z]+:|\/\/|data:|blob:|#)/i.test(raw)) return null;
    return raw;
  }
  function resolveLocalReference(documentPath, value, fileSet) {
    const raw = cleanLocalReference(value);
    if (!raw) return null;
    let resolved;
    try { resolved = raw.startsWith('/') ? normalizePath(raw.slice(1)) : joinPath(documentPath, raw); }
    catch (_) { return null; }
    return fileSet.has(resolved) ? resolved : null;
  }

  function attrs(raw) {
    const result = {}; const re = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g; let match;
    while ((match = re.exec(text(raw)))) result[text(match[1]).toLowerCase()] = match[2] != null ? match[2] : match[3] != null ? match[3] : match[4] != null ? match[4] : '';
    return result;
  }
  function attrValue(tag, name) {
    const parsed = attrs(text(tag).replace(/^<[^\s>]+|\/?\s*>$/g, ''));
    return parsed[text(name).toLowerCase()] || '';
  }

  function htmlAssetReferences(file, fileSet) {
    const refs = new Set(); const content = text(file.content); let match;
    const linkPattern = /<link\b[^>]*\bhref\s*=\s*(["'])(.*?)\1[^>]*>/gi;
    const scriptPattern = /<script\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1[^>]*>/gi;
    while ((match = linkPattern.exec(content))) { const resolved = resolveLocalReference(file.path, match[2], fileSet); if (resolved && (STYLE_EXTENSIONS.has(extname(resolved)) || SCRIPT_EXTENSIONS.has(extname(resolved)))) refs.add(resolved); }
    while ((match = scriptPattern.exec(content))) { const resolved = resolveLocalReference(file.path, match[2], fileSet); if (resolved && SCRIPT_EXTENSIONS.has(extname(resolved))) refs.add(resolved); }
    return Array.from(refs);
  }
  function jaccard(left, right) { const a = new Set(left); const b = new Set(right); if (!a.size && !b.size) return 1; let intersection = 0; a.forEach(v => { if (b.has(v)) intersection += 1; }); const union = a.size + b.size - intersection; return union ? intersection / union : 0; }
  function sharedCount(left, right) { const b = new Set(right); let count = 0; left.forEach(v => { if (b.has(v)) count += 1; }); return count; }
  function connectedDocuments(documents) {
    const adjacency = documents.map(() => new Set());
    for (let i = 0; i < documents.length; i += 1) for (let j = i + 1; j < documents.length; j += 1) {
      const left = documents[i], right = documents[j]; const shared = sharedCount(left.assetPaths, right.assetPaths); const similarity = jaccard(left.assetPaths, right.assetPaths);
      const fallback = !left.assetPaths.length && !right.assetPaths.length && dirname(left.path) === dirname(right.path);
      if (shared >= 3 || similarity >= 0.45 || fallback) { adjacency[i].add(j); adjacency[j].add(i); }
    }
    const seen = new Set(), clusters = [];
    for (let i = 0; i < documents.length; i += 1) { if (seen.has(i)) continue; const stack = [i], indexes = []; seen.add(i); while (stack.length) { const current = stack.pop(); indexes.push(current); adjacency[current].forEach(next => { if (!seen.has(next)) { seen.add(next); stack.push(next); } }); } clusters.push(indexes.map(index => documents[index])); }
    return clusters;
  }
  function analyzeSourceRoles(files) {
    const list = Array.isArray(files) ? files : []; const fileSet = new Set(list.map(file => posix(file.path)));
    const htmlFiles = list.filter(file => HTML_EXTENSIONS.has(extname(file.path)));
    const documents = htmlFiles.map(file => ({ path: posix(file.path), assetPaths: htmlAssetReferences(file, fileSet) }));
    const clusters = connectedDocuments(documents).map(items => {
      const assets = Array.from(new Set(items.flatMap(item => item.assetPaths))).sort();
      return { clusterId: `source-cluster:${stableHash(items.map(item => item.path).sort().join('\n'))}`, documentPaths: items.map(item => item.path).sort(), localAssetPaths: assets, documentCount: items.length, assetCount: assets.length, score: items.length * 1000 + assets.length * 10 + items.reduce((sum, item) => sum + item.assetPaths.length, 0) };
    }).sort((a, b) => b.score - a.score || a.clusterId.localeCompare(b.clusterId));
    const primary = clusters[0] || null; const primaryDocuments = primary ? primary.documentPaths.slice() : []; const primarySet = new Set(primaryDocuments);
    return {
      kind: 'oluntir-template-source-roles', schemaVersion: SCHEMA_VERSION,
      primaryClusterId: primary && primary.clusterId || null,
      primaryDocuments,
      auxiliaryDocuments: documents.filter(item => !primarySet.has(item.path)).map(item => item.path),
      clusters,
      documents: documents.map(item => ({ path: item.path, role: primarySet.has(item.path) ? 'primary-template-page' : 'auxiliary-page', localAssetPaths: item.assetPaths }))
    };
  }

  function findTagEnd(source, start) { let quote = null; for (let i = start + 1; i < source.length; i += 1) { const ch = source[i]; if (quote) { if (ch === quote) quote = null; } else if (ch === '"' || ch === "'") quote = ch; else if (ch === '>') return i; } return -1; }
  function parseHtml(html) {
    const source = text(html); const root = { tagName:'#document', attrs:{}, start:0, openEnd:0, end:source.length, parent:null, children:[] }; const stack=[root]; let cursor=0, sequence=0;
    while (cursor < source.length) {
      const open = source.indexOf('<', cursor); if (open < 0) break;
      if (source.startsWith('<!--', open)) { const close = source.indexOf('-->', open + 4); cursor = close < 0 ? source.length : close + 3; continue; }
      const end = findTagEnd(source, open); if (end < 0) break; const token = source.slice(open + 1, end);
      if (/^\s*[!?]/.test(token)) { cursor = end + 1; continue; }
      const closing = /^\s*\//.test(token); const match = token.match(/^\s*\/?\s*([^\s/>]+)/); if (!match) { cursor=end+1; continue; } const tagName=text(match[1]).toLowerCase();
      if (closing) { for (let i=stack.length-1;i>0;i-=1) { if (stack[i].tagName !== tagName) continue; stack[i].end=end+1; stack.length=i; break; } cursor=end+1; continue; }
      const nameIndex=token.indexOf(match[1]); const node={ id:`n${++sequence}`, tagName, attrs:attrs(token.slice(nameIndex+match[1].length)), start:open, openEnd:end+1, end:end+1, parent:stack[stack.length-1], children:[] }; node.parent.children.push(node);
      const selfClosing=/\/\s*$/.test(token)||VOID_ELEMENTS.has(tagName);
      if (!selfClosing) { if (tagName==='script'||tagName==='style') { const closeRe=new RegExp(`</${tagName}\\s*>`,'ig'); closeRe.lastIndex=end+1; const closeMatch=closeRe.exec(source); if (closeMatch) { node.end=closeMatch.index+closeMatch[0].length; cursor=node.end; continue; } } stack.push(node); }
      cursor=end+1;
    }
    for (let i=1;i<stack.length;i+=1) if (stack[i].end<=stack[i].openEnd) stack[i].end=source.length;
    return root;
  }
  function findFirst(node, tagName) { if (!node) return null; if (node.tagName===tagName) return node; for (const child of node.children||[]) { const found=findFirst(child,tagName); if(found) return found; } return null; }
  function descendants(node, result) { const out=result||[]; (node.children||[]).forEach(child=>{out.push(child);descendants(child,out);}); return out; }
  function depthSignature(node, depth, maxDepth) { const d=depth||0, max=maxDepth==null?4:maxDepth; if(!node||d>max)return''; const classes=semanticClassTokens(node.attrs&&node.attrs.class).slice(0,4).sort(); const own=`${node.tagName}${classes.length?`.${classes.join('.')}`:''}`; if(d===max)return own; const children=(node.children||[]).filter(child=>!IGNORE_TOP_LEVEL.has(child.tagName)).slice(0,12).map(child=>depthSignature(child,d+1,max)).filter(Boolean); return children.length?`${own}[${children.join('|')}]`:own; }
  function headingText(node, html) { const all=[node].concat(descendants(node,[])); const heading=all.find(item=>/^h[1-6]$/.test(item.tagName)); if(!heading)return''; return stripTags(text(html).slice(heading.openEnd,heading.end).replace(new RegExp(`</${heading.tagName}\\s*>[\\s\\S]*$`,'i'),'')).slice(0,100); }
  function semanticTokens(node) { const values=[]; [node].concat(descendants(node,[])).slice(0,180).forEach(item=>{values.push(...semanticClassTokens(item.attrs&&item.attrs.class));if(item.attrs&&item.attrs.id)values.push(...semanticClassTokens(item.attrs.id));}); return Array.from(new Set(values)).slice(0,80); }
  function categoryFor(node, heading, documentPath) {
    if (node.tagName==='header'||node.tagName==='nav') return {id:'navigation',label:'Navigation / Header'}; if(node.tagName==='footer')return{id:'footer',label:'Footer'};
    const topTokens=semanticClassTokens(node.attrs&&node.attrs.class); const directTokens=Array.from(new Set((node.children||[]).flatMap(child=>semanticClassTokens(child.attrs&&child.attrs.class)))); const allTokens=semanticTokens(node); const pageStem=basename(documentPath).replace(extname(documentPath),'').replace(/[-_]+/g,' '); let best=null;
    CATEGORY_RULES.forEach((rule,index)=>{let score=0;if(heading&&rule.re.test(heading))score+=8;if(pageStem&&rule.re.test(pageStem))score+=3;topTokens.forEach(token=>{if(rule.re.test(token))score+=9;});directTokens.forEach(token=>{if(rule.re.test(token))score+=5;});let hits=0;allTokens.forEach(token=>{if(rule.re.test(token))hits+=1;});score+=Math.min(6,hits);if(!best||score>best.score||(score===best.score&&score>0&&index<best.index))best={rule,score,index};});
    return best&&best.score>0?{id:best.rule.id,label:best.rule.label}:{id:'content',label:'Content Section'};
  }
  function regionCandidate(node){if(!node||IGNORE_TOP_LEVEL.has(node.tagName))return false;if(['header','nav','footer','section','article','aside','form'].includes(node.tagName))return true;if(node.tagName==='div'){const classes=semanticClassTokens(node.attrs&&node.attrs.class);if(!classes.length||UTILITY_REGION.test(classes.join(' ')))return false;return true;}return false;}
  function candidateChildren(body){const direct=(body.children||[]).filter(child=>!IGNORE_TOP_LEVEL.has(child.tagName));const result=[];direct.forEach(child=>{if(child.tagName==='main'){(child.children||[]).filter(regionCandidate).forEach(item=>result.push(item));}else if(regionCandidate(child))result.push(child);});return result;}
  function repeatLabel(node){const tokens=semanticClassTokens(node.attrs&&node.attrs.class);const meaningful=tokens.find(token=>CATEGORY_RULES.some(rule=>rule.re.test(token)))||tokens[0];return meaningful?meaningful.replace(/[-_]+/g,' '):node.tagName;}
  function repeatCandidates(region){const result=[];function visit(parent,depth){if(!parent||depth>7)return;const children=(parent.children||[]).filter(child=>!IGNORE_TOP_LEVEL.has(child.tagName));if(children.length>=2){const groups=new Map();children.forEach(child=>{const sig=depthSignature(child,0,3);if(!groups.has(sig))groups.set(sig,[]);groups.get(sig).push(child);});groups.forEach((items,signature)=>{if(items.length<2||signature.length<3)return;const first=items[0];result.push({repeatId:`repeat:${stableHash(`${region.regionId}\0${parent.start}\0${signature}`)}`,count:items.length,itemTagName:first.tagName,itemClasses:semanticClassTokens(first.attrs&&first.attrs.class),label:repeatLabel(first),parentTagName:parent.tagName,parentClasses:semanticClassTokens(parent.attrs&&parent.attrs.class),confidence:items.length>=3?0.92:0.82});});}children.forEach(child=>visit(child,depth+1));}visit(region._node,0);const unique=new Map();result.forEach(item=>{const key=`${item.label}:${item.itemTagName}:${item.itemClasses.join('.')}:${item.count}`;if(!unique.has(key))unique.set(key,item);});return Array.from(unique.values()).slice(0,20);}
  function analyzeStructure(files, roles) {
    const primary=new Set(roles&&roles.primaryDocuments||[]); const htmlFiles=(files||[]).filter(file=>HTML_EXTENSIONS.has(extname(file.path))&&(!primary.size||primary.has(file.path))); const pages=[], allRegions=[];
    htmlFiles.forEach(file=>{const html=text(file.content);const tree=parseHtml(html);const body=findFirst(tree,'body')||tree;const pageRegions=candidateChildren(body).map((node,index)=>{const heading=headingText(node,html);const category=categoryFor(node,heading,file.path);const signature=depthSignature(node,0,5);const region={regionId:`region:${stableHash(`${file.path}\0${node.start}\0${signature}`)}`,page:file.path,index,tagName:node.tagName,category:category.id,categoryLabel:category.label,heading:heading||null,classes:normalizedClassTokens(node.attrs&&node.attrs.class),semanticClasses:semanticClassTokens(node.attrs&&node.attrs.class),structuralSignature:stableHash(signature),source:{document:file.path,startOffset:node.start,endOffset:node.end},_node:node};region.repeatCandidates=repeatCandidates(region);return region;});pageRegions.forEach(region=>allRegions.push(region));pages.push({path:file.path,regionIds:pageRegions.map(region=>region.regionId),regionCount:pageRegions.length});});
    const familyMap=new Map();allRegions.forEach(region=>{const key=`${region.category}:${region.structuralSignature}`;if(!familyMap.has(key))familyMap.set(key,[]);familyMap.get(key).push(region);});
    const families=Array.from(familyMap.entries()).map(([key,regions])=>{const representative=regions[0];return{familyId:`region-family:${stableHash(key)}`,regionIds:regions.map(r=>r.regionId),category:representative.category,categoryLabel:representative.categoryLabel,occurrenceCount:regions.length,pageCount:new Set(regions.map(r=>r.page)).size,sharedAcrossPages:new Set(regions.map(r=>r.page)).size>=2,variantHeadings:Array.from(new Set(regions.map(r=>r.heading).filter(Boolean))).slice(0,12),semanticClasses:Array.from(new Set(regions.flatMap(r=>r.semanticClasses))).slice(0,24),repeatCandidateCount:regions.reduce((sum,r)=>sum+(r.repeatCandidates||[]).length,0),representative:{regionId:representative.regionId,document:representative.page,startOffset:representative.source.startOffset,endOffset:representative.source.endOffset,tagName:representative.tagName,heading:representative.heading,classes:representative.classes,semanticClasses:representative.semanticClasses,repeatCandidates:representative.repeatCandidates}};}).sort((a,b)=>a.categoryLabel.localeCompare(b.categoryLabel)||b.occurrenceCount-a.occurrenceCount||a.familyId.localeCompare(b.familyId));
    return { kind:'oluntir-template-structure',schemaVersion:SCHEMA_VERSION,primaryDocuments:htmlFiles.map(f=>f.path),pages,regions:allRegions.map(r=>{const x=Object.assign({},r);delete x._node;return x;}),families,counts:{pages:pages.length,regions:allRegions.length,families:families.length,repeatCandidates:allRegions.reduce((sum,r)=>sum+(r.repeatCandidates||[]).length,0)}};
  }

  function extractLinkedStyles(file, fileSet) {
    const result=[]; const content=text(file.content); const re=/<link\b[^>]*>/gi; let match;
    while((match=re.exec(content))){const tag=match[0],href=attrValue(tag,'href'),rel=attrValue(tag,'rel').toLowerCase();if(!href)continue;if(rel&& !rel.includes('stylesheet') && !STYLE_EXTENSIONS.has(extname(href)))continue;if(/^(?:https?:)?\/\//i.test(href)){result.push({kind:'external',value:href});continue;}const resolved=resolveLocalReference(file.path,href,fileSet);if(resolved&&STYLE_EXTENSIONS.has(extname(resolved)))result.push({kind:'local',value:resolved});}
    return result;
  }
  function extractLinkedScripts(file, fileSet) {
    const result=[]; const content=text(file.content); const re=/<script\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1[^>]*>/gi; let match;
    while((match=re.exec(content))){const src=match[2];if(/^(?:https?:)?\/\//i.test(src)){result.push({kind:'external',value:src});continue;}const resolved=resolveLocalReference(file.path,src,fileSet);if(resolved&&SCRIPT_EXTENSIONS.has(extname(resolved)))result.push({kind:'local',value:resolved});}
    return result;
  }
  function uniqueReferences(files, roles, extractor) {
    const primarySet=new Set(roles.primaryDocuments||[]); const primary=(files||[]).filter(file=>primarySet.has(file.path)); const docInfo=roles.documents||[]; const order=primary.slice().sort((a,b)=>{const aa=(docInfo.find(x=>x.path===a.path)||{}).localAssetPaths||[];const bb=(docInfo.find(x=>x.path===b.path)||{}).localAssetPaths||[];return bb.length-aa.length||a.path.localeCompare(b.path);});const fileSet=new Set((files||[]).map(f=>f.path));const seen=new Set(),result=[];order.forEach(file=>extractor(file,fileSet).forEach(ref=>{const key=`${ref.kind}:${ref.value}`;if(!seen.has(key)){seen.add(key);result.push(ref);}}));return result;
  }
  function frameworkVersionFromContent(content) { const head=text(content).slice(0,24000); const match=head.match(/Bootstrap(?:\s+v|\s+)(\d+\.\d+(?:\.\d+)?)/i); return match?match[1]:null; }
  function isBootstrapAsset(file) { if(!file)return false;const p=file.path.toLowerCase();return /(?:^|\/)bootstrap(?:\.min)?\.(?:css|js)$/.test(p)||/(?:^|\/)bootstrap\/(?:bootstrap|bootstrap\.bundle)(?:\.min)?\.(?:css|js)$/.test(p)||Boolean(frameworkVersionFromContent(file.content)); }
  function detectFramework(files, roles) {
    const map=new Map((files||[]).map(file=>[file.path,file])); const refs=new Set((roles.documents||[]).filter(d=>d.role==='primary-template-page').flatMap(d=>d.localAssetPaths||[])); const candidates=[];
    refs.forEach(p=>{const file=map.get(p);if(!file||!isBootstrapAsset(file))return;const version=frameworkVersionFromContent(file.content);if(version)candidates.push({path:p,version,score:100});});
    if(!candidates.length)(files||[]).forEach(file=>{if(!isBootstrapAsset(file))return;const version=frameworkVersionFromContent(file.content);if(version)candidates.push({path:file.path,version,score:10});});
    candidates.sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path)); let version=candidates[0]&&candidates[0].version||null; let major=version?Number(version.split('.')[0]):0;
    if(![4,5].includes(major)){const primaryHtml=(files||[]).filter(f=>(roles.primaryDocuments||[]).includes(f.path)).map(f=>text(f.content)).join('\n');if(/\bdata-bs-(?:toggle|target|dismiss)\b/i.test(primaryHtml)){major=5;version=version||'5.x';}else if(/\bdata-(?:toggle|target|dismiss)\s*=/i.test(primaryHtml)){major=4;version=version||'4.x';}}
    if(![4,5].includes(major))throw new Error('Keine unterstützte Bootstrap-4- oder Bootstrap-5-Basis im primären Template-Korpus erkannt.');
    return {baseFramework:major===4?'bs4':'bs5',family:`bootstrap${major}`,version:version||`${major}.x`,evidence:candidates.slice(0,6)};
  }

  function assetKind(path) { const ext=extname(path);if(IMAGE_EXTENSIONS.has(ext))return'image';if(FONT_EXTENSIONS.has(ext))return'font';if(MEDIA_EXTENSIONS.has(ext))return'media';if(STYLE_EXTENSIONS.has(ext))return'stylesheet';if(SCRIPT_EXTENSIONS.has(ext))return'script';if(HTML_EXTENSIONS.has(ext))return'markup';return'other'; }
  function makeAssetCatalog(files, roles) { const primary=new Set((roles.primaryDocuments||[]).concat((roles.documents||[]).filter(d=>d.role==='primary-template-page').flatMap(d=>d.localAssetPaths||[]))); const assets=(files||[]).map(file=>({path:file.path,kind:assetKind(file.path),primary:primary.has(file.path)})); const counts=assets.reduce((out,a)=>{out.total+=1;out[a.kind]=(out[a.kind]||0)+1;return out;},{total:0,image:0,font:0,media:0,stylesheet:0,script:0,markup:0,other:0});return{kind:'oluntir-template-assets',schemaVersion:SCHEMA_VERSION,counts,assets}; }

  function rewriteCssUrls(value, documentPath, fileSet, prefix) { return text(value).replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi,(all,q,url)=>{const resolved=resolveLocalReference(documentPath,url,fileSet);return resolved?`url(${q}${prefix}${resolved}${q})`:all;}); }
  function rewriteComponentHtml(html, documentPath, fileSet, templateId) {
    const prefix=`templates/${templateId}/source/`; let out=text(html).replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,'');
    const attrsToRewrite=['src','poster','data-src','data-poster','data-background','data-bg','data-background-image'];
    attrsToRewrite.forEach(name=>{const re=new RegExp(`(\\s${name}\\s*=\\s*)(["'])(.*?)\\2`,'gi');out=out.replace(re,(all,lead,q,value)=>{const resolved=resolveLocalReference(documentPath,value,fileSet);return resolved?`${lead}${q}${prefix}${resolved}${q}`:all;});});
    out=out.replace(/(\ssrcset\s*=\s*)(["'])(.*?)\2/gi,(all,lead,q,value)=>{const rewritten=value.split(',').map(part=>{const pieces=part.trim().split(/\s+/);const resolved=resolveLocalReference(documentPath,pieces[0],fileSet);if(resolved)pieces[0]=`${prefix}${resolved}`;return pieces.join(' ');}).join(', ');return`${lead}${q}${rewritten}${q}`;});
    out=out.replace(/(\shref\s*=\s*)(["'])(.*?)\2/gi,(all,lead,q,value)=>{const resolved=resolveLocalReference(documentPath,value,fileSet);if(!resolved||HTML_EXTENSIONS.has(extname(resolved)))return all;return`${lead}${q}${prefix}${resolved}${q}`;});
    out=out.replace(/(\sstyle\s*=\s*)(["'])(.*?)\2/gi,(all,lead,q,value)=>`${lead}${q}${rewriteCssUrls(value,documentPath,fileSet,prefix)}${q}`);
    if (!embedIsolator || typeof embedIsolator.isolateHtml !== 'function') throw new Error('Embed-Isolator ist nicht verfügbar.');
    return embedIsolator.isolateHtml(out).html;
  }
  function titleFromToken(value) { return text(value).replace(/[-_]+/g,' ').replace(/\b\w/g,ch=>ch.toUpperCase()).trim(); }
  function buildComponents(files, structure, templateId) {
    const fileMap=new Map((files||[]).map(file=>[file.path,file]));const fileSet=new Set(fileMap.keys());const labelCounts=new Map();
    return (structure.families||[]).map((family,index)=>{const rep=family.representative||{};const sourceFile=fileMap.get(rep.document);if(!sourceFile)return null;const raw=text(sourceFile.content).slice(rep.startOffset,rep.endOffset);let baseLabel=rep.heading||titleFromToken((rep.semanticClasses||[])[0])||`${family.categoryLabel} ${index+1}`;baseLabel=stripTags(baseLabel).slice(0,80)||`${family.categoryLabel} ${index+1}`;const key=`${family.categoryLabel}:${baseLabel}`;const count=(labelCounts.get(key)||0)+1;labelCounts.set(key,count);const label=count>1?`${baseLabel} · Variante ${count}`:baseLabel;const content=rewriteComponentHtml(raw,rep.document,fileSet,templateId);const isolatedEmbedCount=(content.match(/data-oluntir-embed-isolated=\"1\"/g)||[]).length;return{id:`family-${stableHash(family.familyId).slice(0,12)}`,label,category:`Template · ${family.categoryLabel}`,content,metadata:{familyId:family.familyId,occurrenceCount:family.occurrenceCount,pageCount:family.pageCount,repeatCandidateCount:family.repeatCandidateCount,isolatedEmbedCount,sourceDocument:rep.document}};}).filter(Boolean);
  }

  function compileFiles(files, options) {
    const settings=options||{};const id=cleanId(settings.id||settings.name);if(!id||id==='editions')throw new Error('Bitte einen gültigen, eindeutigen Template-Namen angeben.');const name=text(settings.name||id).trim()||id;
    const roles=analyzeSourceRoles(files);if(!roles.primaryDocuments.length)throw new Error('Keine HTML-Beispielseiten im Template gefunden.');const framework=detectFramework(files,roles);const structure=analyzeStructure(files,roles);if(!structure.families.length)throw new Error('Keine zusammenhängenden Template-Bereiche erkannt.');
    const fileMap=new Map(files.map(file=>[file.path,file]));const styleRefs=uniqueReferences(files,roles,extractLinkedStyles);const scriptRefs=uniqueReferences(files,roles,extractLinkedScripts);
    const runtimeStyles=[],excludedFrameworkStyles=[];styleRefs.forEach(ref=>{if(ref.kind==='external'){runtimeStyles.push(ref.value);return;}const file=fileMap.get(ref.value);if(isBootstrapAsset(file))excludedFrameworkStyles.push(ref.value);else runtimeStyles.push(`source/${ref.value}`);});
    const scriptsDetected=scriptRefs.map(ref=>ref.kind==='external'?ref.value:`source/${ref.value}`);const components=buildComponents(files,structure,id);const isolatedEmbedCount=components.reduce((sum,component)=>sum+Number(component.metadata&&component.metadata.isolatedEmbedCount||0),0);const embedIsolation={kind:'oluntir-template-embed-isolation',schemaVersion:SCHEMA_VERSION,mode:'editor-placeholder',tags:['iframe','object','embed'],count:isolatedEmbedCount,previewRestoration:true,exportRestorationContract:true};const assetCatalog=makeAssetCatalog(files,roles);if(!jsAnalyzer||typeof jsAnalyzer.analyze!=='function')throw new Error('JavaScript-Analyzer ist nicht verfügbar.');const behaviorManifest=jsAnalyzer.analyze(files,roles,structure,framework);if(!jsRuntimePlanner||typeof jsRuntimePlanner.plan!=='function')throw new Error('JavaScript-Runtime-Planer ist nicht verfügbar.');const runtimePlan=jsRuntimePlanner.plan(behaviorManifest,{primaryDocuments:roles.primaryDocuments,framework});if(!jsActivationPlanner||typeof jsActivationPlanner.plan!=='function')throw new Error('JavaScript-Aktivierungsplaner ist nicht verfügbar.');const activationPlan=jsActivationPlanner.plan(behaviorManifest,runtimePlan,files,{framework});const scriptsEnabled=activationPlan.execution.enabledRuntimePaths.slice();const internalRuntimeScripts=isolatedEmbedCount>0?['embed-runtime.js']:[];
    const definition={schemaVersion:SCHEMA_VERSION,id,label:name,version:String(settings.version||'1.0.0'),baseFramework:framework.baseFramework,basePath:`templates/${id}/`,styles:runtimeStyles,scripts:internalRuntimeScripts.concat(scriptsEnabled),components:components.map(component=>({id:component.id,label:component.label,category:component.category,content:component.content}))};
    const manifest={schemaVersion:SCHEMA_VERSION,id,name,folder:id,entry:'template.js',enabled:true,version:definition.version,baseFramework:framework.baseFramework,sourceFrameworkVersion:framework.version,compiler:{name:'Oluntir Template Compiler',version:COMPILER_VERSION,compiledAt:new Date().toISOString()},runtime:{styles:runtimeStyles,scriptsEnabled,scriptsDetected,internalRuntimeScripts,embedIsolation:'embed-isolation.json',behaviorManifest:'behavior-manifest.json',dependencyGraph:'dependencies.json',runtimePlan:'runtime-plan.json',activationPlan:'javascript-activation-plan.json',javascriptActivation:'controlled-policy'},analysis:{primaryHtmlCount:roles.primaryDocuments.length,auxiliaryHtmlCount:roles.auxiliaryDocuments.length,regionCount:structure.counts.regions,familyCount:structure.counts.families,repeatCandidateCount:structure.counts.repeatCandidates,fileCount:files.length,assetCounts:assetCatalog.counts,embedIsolation,javascript:Object.assign({},behaviorManifest.summary,{runtimePlan:runtimePlan.summary,activationPlan:activationPlan.summary})}};
    const analysis={kind:'oluntir-template-compiler-analysis',schemaVersion:SCHEMA_VERSION,compilerVersion:COMPILER_VERSION,framework,sourceRoles:roles,structure:{counts:structure.counts,pages:structure.pages,families:structure.families},styles:{enabled:runtimeStyles,frameworkStylesExcluded:excludedFrameworkStyles},scripts:{detected:scriptsDetected,enabled:scriptsEnabled,activation:'controlled-policy',behaviorSummary:behaviorManifest.summary,runtimePlanSummary:runtimePlan.summary,activationPlanSummary:activationPlan.summary},assets:assetCatalog.counts,embedIsolation};
    return{schemaVersion:SCHEMA_VERSION,id,name,manifest,definition,components,assetCatalog,embedIsolation,behaviorManifest,dependencyGraph:behaviorManifest.dependencyGraph,runtimePlan,activationPlan,analysis,sourceFiles:files};
  }

  function serializeTemplateJs(compilation){return `(function () {\n  'use strict';\n  if (!window.OluntirTemplateRuntime) throw new Error('OluntirTemplateRuntime ist nicht geladen.');\n  window.OluntirTemplateRuntime.define(${JSON.stringify(compilation.definition,null,2)});\n})();\n`;}
  function serializeJson(value){return`${JSON.stringify(value,null,2)}\n`;}

  async function filesFromZip(zip) {
    if(!zip||!zip.files)throw new Error('Ungültiges ZIP-Archiv.');const rawNames=Object.keys(zip.files).filter(name=>zip.files[name]&&!zip.files[name].dir);const mapping=stripCommonRoot(rawNames);const result=[];const seen=new Set();
    for(const rawName of rawNames){const mapped=mapping.get(normalizePath(rawName));if(!mapped||seen.has(mapped))throw new Error(`Doppelter oder ungültiger Pfad im ZIP: ${rawName}`);seen.add(mapped);const entry=zip.files[rawName];const ext=extname(mapped);const content=TEXT_EXTENSIONS.has(ext)?await entry.async('string'):null;result.push({path:mapped,content,zipEntry:entry});}
    return result.sort((a,b)=>a.path.localeCompare(b.path));
  }
  async function compileZip(zip,options){return compileFiles(await filesFromZip(zip),options);}

  async function ensureDirectory(rootHandle, path) { let current=rootHandle;for(const segment of normalizePath(path).split('/').filter(Boolean))current=await current.getDirectoryHandle(segment,{create:true});return current; }
  async function writeFile(directory,fileName,data){const handle=await directory.getFileHandle(fileName,{create:true});const writable=await handle.createWritable();try{await writable.write(data);}finally{await writable.close();}}
  async function directoryExists(rootHandle,name){try{await rootHandle.getDirectoryHandle(name);return true;}catch(error){if(error&&(error.name==='NotFoundError'||error.code==='ENOENT'))return false;throw error;}}
  async function writeCompilation(rootHandle,registry,compilation,managerApi,options){if(!rootHandle)throw new Error('Der templates-Ordner wurde nicht ausgewählt.');if(!managerApi||typeof managerApi.registerTemplate!=='function')throw new Error('Template-Verwaltung ist nicht verfügbar.');if((registry&&registry.templates||[]).some(item=>cleanId(item.id)===compilation.id))throw new Error(`Template „${compilation.name}“ ist bereits registriert.`);if(await directoryExists(rootHandle,compilation.id))throw new Error(`Der Ordner templates/${compilation.id}/ existiert bereits.`);const settings=options||{};const notify=typeof settings.onProgress==='function'?settings.onProgress:function(){};
    const templateDir=await rootHandle.getDirectoryHandle(compilation.id,{create:true});try{const sourceDir=await templateDir.getDirectoryHandle('source',{create:true});let completed=0;const total=compilation.sourceFiles.length;for(const file of compilation.sourceFiles){const parts=file.path.split('/');const fileName=parts.pop();const targetDir=parts.length?await ensureDirectory(sourceDir,parts.join('/')):sourceDir;let data;if(file.zipEntry&&typeof file.zipEntry.async==='function')data=await file.zipEntry.async('uint8array');else if(file.binary!=null)data=file.binary;else data=text(file.content);await writeFile(targetDir,fileName,data);completed+=1;if(completed===1||completed===total||completed%20===0)notify({phase:'source',completed,total,path:file.path});}notify({phase:'metadata',completed:0,total:10});await writeFile(templateDir,'template.json',serializeJson(compilation.manifest));await writeFile(templateDir,'template.js',serializeTemplateJs(compilation));await writeFile(templateDir,'components.json',serializeJson({schemaVersion:SCHEMA_VERSION,components:compilation.components}));await writeFile(templateDir,'analysis.json',serializeJson(compilation.analysis));await writeFile(templateDir,'assets.json',serializeJson(compilation.assetCatalog));await writeFile(templateDir,'embed-isolation.json',serializeJson(compilation.embedIsolation));if(compilation.embedIsolation&&compilation.embedIsolation.count>0)await writeFile(templateDir,'embed-runtime.js',embedIsolator.runtimeScript());await writeFile(templateDir,'behavior-manifest.json',serializeJson(compilation.behaviorManifest));await writeFile(templateDir,'dependencies.json',serializeJson(compilation.dependencyGraph));await writeFile(templateDir,'runtime-plan.json',serializeJson(compilation.runtimePlan));await writeFile(templateDir,'javascript-activation-plan.json',serializeJson(compilation.activationPlan));notify({phase:'registry',completed:total,total});const nextRegistry=await managerApi.registerTemplate(rootHandle,registry,compilation.manifest);notify({phase:'done',completed:total,total});return{registry:nextRegistry,folder:compilation.id};}catch(error){try{await rootHandle.removeEntry(compilation.id,{recursive:true});}catch(_){}throw error;}}

  return Object.freeze({SCHEMA_VERSION,COMPILER_VERSION,cleanId,stripCommonRoot,resolveLocalReference,analyzeSourceRoles,analyzeStructure,detectFramework,compileFiles,filesFromZip,compileZip,serializeTemplateJs,writeCompilation});
});
