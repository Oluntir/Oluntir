'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { analyzeProject } = require('../core/project-analyzer.js');
const sourcePackageApi = require('../core/source-package.js');
const sourceComponentCatalog = require('../core/source-component-catalog.js');
const frameworkSupportPolicy = require('../core/framework-support-policy.js');

const ROOT = path.join(__dirname, 'public');
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
function send(res, status, type, body, headers = {}) {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self'; img-src 'self' data: blob:; frame-src 'self' data: blob:; child-src 'self' data: blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Oluntir-Session',
    ...headers
  });
  res.end(body);
}
function json(res, status, value) {
  send(res, status, 'application/json; charset=utf-8', JSON.stringify(value, null, 2));
}
function readJson(req, maxBytes = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > maxBytes) {
        reject(new Error('Anfrage ist zu groß.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('Ungültiges JSON.')); }
    });
    req.on('error', reject);
  });
}
function sourceOptions(data, fallbackOrigin) {
  return {
    frameworkId: data.frameworkId,
    frameworkFamily: data.frameworkFamily,
    packageType: data.packageType,
    displayName: data.displayName || data.packageName,
    version: data.version,
    license: data.license,
    origin: data.origin || fallbackOrigin,
    sourceFormat: data.sourceFormat
  };
}
function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  return ({ '.css': 'text/css; charset=utf-8', '.scss': 'text/x-scss; charset=utf-8', '.less': 'text/x-less; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.cjs': 'text/javascript; charset=utf-8', '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf' })[ext] || 'application/octet-stream';
}
function finalizePackage(packageStore, manifest) {
  const packageRoot = packageStore.packageRoot(manifest.packageId);
  const sourceRoot = path.join(packageRoot, 'source');
  const report = analyzeProject(sourceRoot, {
    sourcePackageId: manifest.packageId,
    sourceHash: manifest.sourceHash,
    frameworkId: manifest.frameworkId,
    frameworkFamily: manifest.frameworkFamily,
    frameworkVersion: manifest.version
  });
  const support = frameworkSupportPolicy.classify({ frameworkId: manifest.frameworkId, frameworkFamily: manifest.frameworkFamily, report });
  manifest.support = support;
  const behaviorManifest = report.behaviors;
  const behaviorPlan = report.behaviorPlan;
  const behaviorResolution = report.behaviorResolution;
  const componentCatalog = sourceComponentCatalog.build(report, sourceRoot, { packageId: manifest.packageId, frameworkId: manifest.frameworkId, support });
  const capabilityManifest = {
    kind: 'oluntir-capability-manifest', schemaVersion: 1, packageId: manifest.packageId,
    status: 'analyzed', frameworkId: manifest.frameworkId, generatedAt: new Date().toISOString(),
    analyzerVersion: report.analyzerVersion, pipelineVersion: report.pipelineVersion,
    frameworks: report.frameworks, capabilities: report.capabilities, conflicts: report.conflicts,
    uncertainties: report.uncertainties, summary: report.summary
  };
  fs.writeFileSync(path.join(packageRoot, 'behavior-manifest.json'), JSON.stringify(behaviorManifest, null, 2));
  fs.writeFileSync(path.join(packageRoot, 'javascript-behavior-plan.json'), JSON.stringify(behaviorPlan, null, 2));
  fs.writeFileSync(path.join(packageRoot, 'javascript-behavior-resolution.json'), JSON.stringify(behaviorResolution, null, 2));
  fs.writeFileSync(path.join(packageRoot, 'source-framework-profile.json'), JSON.stringify(report.sourceProfile, null, 2));
  capabilityManifest.behaviorManifest = { path: 'behavior-manifest.json', count: behaviorManifest.behaviors.length };
  capabilityManifest.behaviorMatrix = { path: 'javascript-behavior-plan.json', count: behaviorPlan.entries.length };
  capabilityManifest.behaviorResolver = { path: 'javascript-behavior-resolution.json', count: behaviorResolution.entries.length, profileId: behaviorResolution.framework.profileId };
  capabilityManifest.sourceProfile = { path: 'source-framework-profile.json', ruleCount: report.sourceProfile.rules.length, profileId: report.sourceProfile.profileId, sourceHash: report.sourceProfile.sourceHash };
  fs.writeFileSync(path.join(packageRoot, 'capability-manifest.json'), JSON.stringify(capabilityManifest, null, 2));
  fs.writeFileSync(path.join(packageRoot, 'analysis-report.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(packageRoot, 'component-catalog.json'), JSON.stringify(componentCatalog, null, 2));
  manifest.analysis = { status: 'analyzed', capabilityManifest: 'capability-manifest.json', report: 'analysis-report.json' };
  manifest.componentCatalog = { path: 'component-catalog.json', count: componentCatalog.components.length };
  manifest.behaviorManifest = { path: 'behavior-manifest.json', count: behaviorManifest.behaviors.length };
  manifest.behaviorMatrix = { path: 'javascript-behavior-plan.json', count: behaviorPlan.entries.length };
  manifest.behaviorResolver = { path: 'javascript-behavior-resolution.json', count: behaviorResolution.entries.length, profileId: behaviorResolution.framework.profileId };
  manifest.sourceProfile = { path: 'source-framework-profile.json', ruleCount: report.sourceProfile.rules.length, profileId: report.sourceProfile.profileId, sourceHash: report.sourceProfile.sourceHash };
  fs.writeFileSync(path.join(packageRoot, 'source-package.json'), JSON.stringify(manifest, null, 2));
  return manifest;
}
function start(options = {}) {
  const port = typeof options === 'number' ? options : (options.port ?? 4177);
  const token = typeof options === 'object' ? options.token : null;
  const packageStore = sourcePackageApi.createStore(typeof options === 'object' ? options : {});
  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, 'http://127.0.0.1');
    if (u.pathname.startsWith('/api/')) {
      if (req.method === 'OPTIONS') return send(res, 204, 'text/plain; charset=utf-8', '');
      const supplied = req.headers['x-oluntir-session'] || u.searchParams.get('session');
      if (token && supplied !== token) return json(res, 403, { error: 'Ungültige lokale Sitzung.' });
      if (req.method === 'GET' && u.pathname === '/api/status') {
        return json(res, 200, { ok: true, localOnly: true, runtime: process.version, platform: process.platform, arch: process.arch });
      }
      if (req.method === 'POST' && u.pathname === '/api/analyze') {
        try {
          const data = await readJson(req);
          return json(res, 200, analyzeProject(data.path));
        } catch (error) {
          return json(res, 400, { error: error.message });
        }
      }
      if (req.method === 'GET' && u.pathname === '/api/source-packages') {
        return json(res, 200, { kind: 'oluntir-source-package-list', schemaVersion: 1, packages: packageStore.list() });
      }
      const fileMatch = u.pathname.match(/^\/api\/source-packages\/([^/]+)\/files\/(.+)$/);
      if (req.method === 'GET' && fileMatch) {
        try {
          const file = packageStore.filePath(decodeURIComponent(fileMatch[1]), decodeURIComponent(fileMatch[2]));
          if (!file) return json(res, 404, { error: 'Source-Datei nicht gefunden.' });
          return send(res, 200, contentType(file), fs.readFileSync(file), { 'Content-Disposition': 'inline' });
        } catch (error) { return json(res, 400, { error: error.message }); }
      }
      const packageMatch = u.pathname.match(/^\/api\/source-packages\/([^/]+)$/);
      if (req.method === 'GET' && packageMatch) {
        const manifest = packageStore.manifest(decodeURIComponent(packageMatch[1]));
        return manifest ? json(res, 200, manifest) : json(res, 404, { error: 'Source Package nicht gefunden.' });
      }
      if (req.method === 'POST' && ['/api/source-packages/import-path', '/api/source-packages/import-url', '/api/source-packages/restore'].includes(u.pathname)) {
        try {
          const data = await readJson(req, 2 * 1024 * 1024);
          let manifest;
          if (u.pathname.endsWith('import-path')) {
            if (!data.path) throw new Error('Ein Source-Pfad ist erforderlich.');
            const inputPath = require('path').resolve(String(data.path || ''));
            const stat = fs.statSync(inputPath);
            const opts = sourceOptions(data, 'local-import');
            manifest = stat.isDirectory() ? packageStore.importDirectory(inputPath, opts) : packageStore.importArchive(inputPath, opts);
          } else if (u.pathname.endsWith('import-url')) {
            if (!data.url) throw new Error('Eine Download-URL ist erforderlich.');
            manifest = await packageStore.importUrl(String(data.url), sourceOptions(data, data.url));
          } else {
            if (!data.path) throw new Error('Ein Pfad zu source-recovery.json ist erforderlich.');
            manifest = packageStore.restore(require('path').resolve(String(data.path)), sourceOptions(data, 'recovery-json'));
          }
          return json(res, 201, { ok: true, package: finalizePackage(packageStore, manifest) });
        } catch (error) { return json(res, 400, { ok: false, error: error.message }); }
      }
      if (req.method === 'POST' && u.pathname === '/api/source-packages/restore-json') {
        try {
          const data = await readJson(req, 350 * 1024 * 1024);
          if (!data.recovery || data.recovery.kind !== 'oluntir-source-recovery') throw new Error('Ungültige Source-Recovery-Daten.');
          const staging = fs.mkdtempSync(require('path').join(require('os').tmpdir(), 'oluntir-browser-recovery-'));
          const recoveryPath = require('path').join(staging, 'source-recovery.json');
          try {
            fs.writeFileSync(recoveryPath, JSON.stringify(data.recovery));
            const manifest = packageStore.restore(recoveryPath, sourceOptions(data.recovery.package || {}, 'recovery-json'));
            return json(res, 201, { ok: true, package: finalizePackage(packageStore, manifest) });
          } finally { fs.rmSync(staging, { recursive: true, force: true }); }
        } catch (error) { return json(res, 400, { ok: false, error: error.message }); }
      }
      if (req.method === 'POST' && u.pathname === '/api/source-packages/import-files') {
        try {
          const data = await readJson(req, 320 * 1024 * 1024);
          if (!Array.isArray(data.files) || !data.files.length) throw new Error('Es wurden keine Source-Dateien übergeben.');
          const staging = fs.mkdtempSync(require('path').join(require('os').tmpdir(), 'oluntir-browser-source-'));
          try {
            for (const item of data.files) {
              const relative = sourcePackageApi.relativePath(item.path || item.relativePath);
              const content = Buffer.from(String(item.contentBase64 || ''), 'base64');
              const target = require('path').join(staging, relative);
              fs.mkdirSync(require('path').dirname(target), { recursive: true });
              fs.writeFileSync(target, content);
            }
            const manifest = packageStore.importDirectory(staging, sourceOptions(data, 'browser-file-import'));
            return json(res, 201, { ok: true, package: finalizePackage(packageStore, manifest) });
          } finally { fs.rmSync(staging, { recursive: true, force: true }); }
        } catch (error) { return json(res, 400, { ok: false, error: error.message }); }
      }
      if (req.method === 'POST' && u.pathname === '/api/source-packages/import-archive') {
        try {
          const data = await readJson(req, 350 * 1024 * 1024);
          const encoded = String(data.archiveBase64 || '');
          if (!encoded || encoded.length > 350 * 1024 * 1024) throw new Error('Das Source-Archiv fehlt oder ist zu groß.');
          const staging = fs.mkdtempSync(require('path').join(require('os').tmpdir(), 'oluntir-browser-archive-'));
          const archive = require('path').join(staging, String(data.fileName || 'source-archive.bin').replace(/[^a-zA-Z0-9._-]/g, '_'));
          try {
            fs.writeFileSync(archive, Buffer.from(encoded, 'base64'));
            const manifest = packageStore.importArchive(archive, sourceOptions(data, 'browser-archive-import'));
            return json(res, 201, { ok: true, package: finalizePackage(packageStore, manifest) });
          } finally { fs.rmSync(staging, { recursive: true, force: true }); }
        } catch (error) { return json(res, 400, { ok: false, error: error.message }); }
      }
      return json(res, 404, { error: 'API-Endpunkt nicht gefunden.' });
    }
    const editorRequest = u.pathname === '/oluntir' || u.pathname === '/oluntir/' || u.pathname.startsWith('/oluntir/');
    const staticRoot = editorRequest ? PROJECT_ROOT : ROOT;
    let file = editorRequest
      ? (u.pathname === '/oluntir' || u.pathname === '/oluntir/' ? 'index.html' : u.pathname.slice('/oluntir/'.length))
      : (u.pathname === '/' ? 'index.html' : u.pathname.slice(1));
    file = path.normalize(file).replace(/^\.\.(\/|\\|$)/, '');
    const resolved = path.resolve(staticRoot, file);
    if (!resolved.startsWith(path.resolve(staticRoot) + path.sep) && resolved !== path.resolve(staticRoot, 'index.html')) return send(res, 403, 'text/plain; charset=utf-8', 'Forbidden');
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) return send(res, 404, 'text/plain; charset=utf-8', 'Not found');
    const ext = path.extname(resolved);
    const type = ext === '.css' ? 'text/css; charset=utf-8' : ext === '.js' ? 'text/javascript; charset=utf-8' : ext === '.woff2' ? 'font/woff2' : ext === '.woff' ? 'font/woff' : ext === '.ttf' ? 'font/ttf' : ext === '.eot' ? 'application/vnd.ms-fontobject' : ext === '.svg' ? 'image/svg+xml' : ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.gif' ? 'image/gif' : 'text/html; charset=utf-8';
    return send(res, 200, type, fs.readFileSync(resolved));
  });
  server.listen(port, '127.0.0.1');
  return server;
}
if (require.main === module) { const server = start({ port: Number(process.env.PORT) || 4177 }); server.once('listening', () => console.log(`Oluntir API Analyzer: http://127.0.0.1:${server.address().port}`)); }
module.exports = { start };
