'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const zlib = require('zlib');
const http = require('http');
const https = require('https');
const dns = require('dns').promises;
const { execFileSync } = require('child_process');

const SCHEMA_VERSION = 1;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_BYTES = 256 * 1024 * 1024;
const MAX_FILES = 10000;
const MAX_DOWNLOAD_BYTES = 256 * 1024 * 1024;
const IGNORED_DIRECTORIES = new Set(['.git', 'node_modules', '__MACOSX']);
const PACKAGE_METADATA_FILES = new Set([
  'source-package.json',
  'source-inventory.json',
  'source-recovery.json',
  'capability-manifest.json',
  'analysis-report.json',
  'component-catalog.json',
  'behavior-manifest.json',
  'javascript-behavior-plan.json',
  'javascript-behavior-resolution.json',
  'source-framework-profile.json'
]);

function text(value, fallback = '') {
  const result = String(value == null ? '' : value).trim();
  return result || fallback;
}

function safeSegment(value, fallback = 'package') {
  const result = text(value, fallback).toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return result || fallback;
}

function relativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || normalized.startsWith('/') || /^[a-z]:\//i.test(normalized) || normalized.includes('\0')) {
    throw new Error('Ungültiger Source-Pfad.');
  }
  const parts = normalized.split('/');
  if (parts.some(part => !part || part === '.' || part === '..')) throw new Error('Unsicherer Source-Pfad.');
  return parts.join('/');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function sha256File(file) {
  return sha256(fs.readFileSync(file));
}

function mimeType(file) {
  const ext = path.extname(file).toLowerCase();
  const values = {
    '.css': 'text/css', '.scss': 'text/x-scss', '.less': 'text/x-less',
    '.js': 'text/javascript', '.mjs': 'text/javascript', '.cjs': 'text/javascript',
    '.html': 'text/html', '.htm': 'text/html', '.json': 'application/json',
    '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2',
    '.ttf': 'font/ttf', '.otf': 'font/otf', '.eot': 'application/vnd.ms-fontobject',
    '.map': 'application/json'
  };
  return values[ext] || 'application/octet-stream';
}

function walkDirectory(root, current, result, state) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error(`Symbolische Verknüpfung nicht erlaubt: ${entry.name}`);
    if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) continue;
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) {
      walkDirectory(root, absolute, result, state);
      continue;
    }
    if (!entry.isFile()) continue;
    const relative = relativePath(path.relative(root, absolute));
    const stat = fs.statSync(absolute);
    if (stat.size > state.maxFileBytes) throw new Error(`Datei überschreitet das Limit: ${relative}`);
    state.totalBytes += stat.size;
    if (state.totalBytes > state.maxTotalBytes) throw new Error('Das Source Package überschreitet das Größenlimit.');
    if (result.length >= state.maxFiles) throw new Error('Das Source Package enthält zu viele Dateien.');
    result.push({ path: relative, absolute, sizeBytes: stat.size, sha256: sha256File(absolute), mimeType: mimeType(absolute) });
  }
}

function inventoryDirectory(root, options = {}) {
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Error('Source-Verzeichnis nicht gefunden.');
  const result = [];
  walkDirectory(root, root, result, {
    maxFileBytes: options.maxFileBytes || MAX_FILE_BYTES,
    maxTotalBytes: options.maxTotalBytes || MAX_TOTAL_BYTES,
    maxFiles: options.maxFiles || MAX_FILES,
    totalBytes: 0
  });
  return result.sort((a, b) => a.path.localeCompare(b.path));
}

function copyDirectory(source, target) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.name === 'source-recovery.json' || entry.name === 'source-inventory.json' || entry.name === 'source-package.json' || entry.name === 'capability-manifest.json') continue;
    if (entry.isSymbolicLink()) throw new Error(`Symbolische Verknüpfung nicht erlaubt: ${entry.name}`);
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isDirectory()) copyDirectory(from, to);
    else if (entry.isFile()) fs.copyFileSync(from, to);
  }
}

function packageHash(files) {
  return sha256(files.map(item => `${item.path}\0${item.sha256}\0${item.sizeBytes}`).join('\n'));
}

function entrypoints(files) {
  const styles = files.filter(item => /\.(css|scss|less)$/i.test(item.path) && !/\.map$/i.test(item.path)).map(item => item.path);
  const scripts = files.filter(item => /\.(js|mjs|cjs)$/i.test(item.path) && !/\.map$/i.test(item.path)).map(item => item.path);
  return { styles, scripts };
}

function runtimeSelection(sourceRoot, endpoints) {
  const packageFile = path.join(sourceRoot, 'package.json');
  if (!fs.existsSync(packageFile) || !fs.statSync(packageFile).isFile()) return null;
  let packageData;
  try { packageData = JSON.parse(fs.readFileSync(packageFile, 'utf8')); } catch (_) { return null; }
  const declared = packageData && (packageData.oluntirRuntime || packageData.oluntir && packageData.oluntir.runtime);
  if (!declared || typeof declared !== 'object') return null;
  const styles = new Set(endpoints.styles);
  const scripts = new Set(endpoints.scripts);
  const select = (values, allowed) => Array.isArray(values) ? values.map(value => String(value)).filter(value => allowed.has(value)) : [];
  return {
    availableStyles: endpoints.styles.slice(), availableScripts: endpoints.scripts.slice(),
    enabledStyles: select(declared.enabledStyles, styles), enabledScripts: select(declared.enabledScripts, scripts),
    recommendedScripts: select(declared.recommendedScripts, scripts), activation: 'explicit-selection-only'
  };
}

function createRecovery(manifest, sourceRoot, files) {
  return {
    kind: 'oluntir-source-recovery',
    schemaVersion: SCHEMA_VERSION,
    package: {
      packageId: manifest.packageId,
      frameworkId: manifest.frameworkId,
      frameworkFamily: manifest.frameworkFamily,
      packageType: manifest.packageType,
      displayName: manifest.displayName,
      version: manifest.version,
      sourceFormat: manifest.sourceFormat,
      origin: manifest.origin,
      license: manifest.license,
      sourceHash: manifest.sourceHash
    },
    encoding: 'gzip+base64',
    files: files.map(item => ({
      path: item.path,
      sizeBytes: item.sizeBytes,
      sha256: item.sha256,
      mimeType: item.mimeType,
      content: zlib.gzipSync(fs.readFileSync(path.join(sourceRoot, item.path))).toString('base64')
    }))
  };
}

function normalizeOptions(options = {}) {
  const frameworkId = safeSegment(options.frameworkId, 'unclassified');
  const displayName = text(options.displayName || options.packageName, frameworkId);
  return {
    frameworkId,
    frameworkFamily: safeSegment(options.frameworkFamily, frameworkId),
    packageType: safeSegment(options.packageType, 'framework-source'),
    displayName,
    version: text(options.version, 'unversioned'),
    license: text(options.license, 'unknown'),
    origin: text(options.origin, 'local-import'),
    sourceFormat: safeSegment(options.sourceFormat, 'directory')
  };
}

function createPackageFromDirectory(sourceRoot, storageRoot, options = {}) {
  const settings = normalizeOptions(options);
  const files = inventoryDirectory(sourceRoot, options);
  if (!files.length) throw new Error('Das Source Package enthält keine Dateien.');
  const sourceHash = packageHash(files);
  const packageId = `${safeSegment(settings.displayName, settings.frameworkId)}-${sourceHash.slice(0, 12)}`;
  const frameworkRoot = path.join(storageRoot, settings.frameworkId, 'sources');
  const packageRoot = path.join(frameworkRoot, packageId);
  if (fs.existsSync(packageRoot)) {
    const existing = path.join(packageRoot, 'source-package.json');
    if (fs.existsSync(existing) && JSON.parse(fs.readFileSync(existing, 'utf8')).sourceHash === sourceHash) {
      const manifest = JSON.parse(fs.readFileSync(existing, 'utf8'));
      const existingSource = path.join(packageRoot, 'source');
      let intact = false;
      try { intact = packageHash(inventoryDirectory(existingSource, options)) === sourceHash; } catch (_) { intact = false; }
      if (intact) return manifest;
      const repair = fs.mkdtempSync(path.join(os.tmpdir(), 'oluntir-source-repair-'));
      try {
        const repairedSource = path.join(repair, 'source');
        copyDirectory(sourceRoot, repairedSource);
        if (packageHash(inventoryDirectory(repairedSource, options)) !== sourceHash) throw new Error('Reparaturquelle konnte nicht verifiziert werden.');
        if (fs.existsSync(existingSource)) fs.renameSync(existingSource, `${existingSource}.damaged-${Date.now()}`);
        fs.renameSync(repairedSource, existingSource);
        manifest.repairedAt = new Date().toISOString();
        manifest.fileCount = files.length;
        manifest.totalBytes = files.reduce((sum, item) => sum + item.sizeBytes, 0);
        fs.writeFileSync(existing, JSON.stringify(manifest, null, 2));
        fs.writeFileSync(path.join(packageRoot, 'source-inventory.json'), JSON.stringify({ kind: 'oluntir-source-inventory', schemaVersion: SCHEMA_VERSION, packageId, sourceHash, files }, null, 2));
        fs.writeFileSync(path.join(packageRoot, 'source-recovery.json'), JSON.stringify(createRecovery(manifest, existingSource, files), null, 2));
        return manifest;
      } finally { fs.rmSync(repair, { recursive: true, force: true }); }
    }
    throw new Error(`Source Package existiert bereits mit abweichendem Inhalt: ${packageId}`);
  }

  fs.mkdirSync(frameworkRoot, { recursive: true });
  const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'oluntir-source-'));
  const stagedSource = path.join(staging, 'source');
  try {
    copyDirectory(sourceRoot, stagedSource);
    const endpoints = entrypoints(files);
    const declaredRuntime = runtimeSelection(sourceRoot, endpoints);
    const manifest = {
      kind: 'oluntir-source-package', schemaVersion: SCHEMA_VERSION,
      packageId, frameworkId: settings.frameworkId, frameworkFamily: settings.frameworkFamily,
      packageType: settings.packageType, displayName: settings.displayName, version: settings.version,
      sourceFormat: settings.sourceFormat, origin: settings.origin, license: settings.license,
      importedAt: new Date().toISOString(), sourceHash, fileCount: files.length,
      totalBytes: files.reduce((sum, item) => sum + item.sizeBytes, 0),
      entrypoints: endpoints, activation: { selected: false, scriptsRequireSelection: true },
      paths: { source: `frameworks/${settings.frameworkId}/sources/${packageId}/source`, recovery: 'source-recovery.json' }
    };
    if (declaredRuntime) manifest.runtime = declaredRuntime;
    const recovery = createRecovery(manifest, stagedSource, files);
    const inventory = { kind: 'oluntir-source-inventory', schemaVersion: SCHEMA_VERSION, packageId, sourceHash, files };
    const capability = { kind: 'oluntir-capability-manifest', schemaVersion: 1, packageId, status: 'pending-analysis', frameworkId: settings.frameworkId, capabilities: [], evidence: [] };
    fs.mkdirSync(packageRoot, { recursive: true });
    copyDirectory(stagedSource, path.join(packageRoot, 'source'));
    fs.writeFileSync(path.join(packageRoot, 'source-package.json'), JSON.stringify(manifest, null, 2));
    fs.writeFileSync(path.join(packageRoot, 'source-inventory.json'), JSON.stringify(inventory, null, 2));
    fs.writeFileSync(path.join(packageRoot, 'capability-manifest.json'), JSON.stringify(capability, null, 2));
    fs.writeFileSync(path.join(packageRoot, 'source-recovery.json'), JSON.stringify(recovery, null, 2));
    return manifest;
  } catch (error) {
    if (fs.existsSync(packageRoot)) fs.rmSync(packageRoot, { recursive: true, force: true });
    throw error;
  } finally {
    fs.rmSync(staging, { recursive: true, force: true });
  }
}

function validateArchiveEntries(entries) {
  entries.forEach(entry => {
    const original = String(entry).replace(/\\/g, '/');
    if (original === '.' || original === './' || original === '') return;
    const normalized = original.replace(/^\.\//, '').replace(/\/$/, '');
    if (!normalized || normalized === '.' || normalized.startsWith('/') || /^[a-z]:\//i.test(normalized) || normalized.split('/').includes('..')) {
      throw new Error(`Unsicherer Archivpfad: ${entry}`);
    }
  });
}

function isZipArchive(archive) {
  const fd = fs.openSync(archive, 'r');
  try {
    const signature = Buffer.alloc(4);
    fs.readSync(fd, signature, 0, 4, 0);
    return signature[0] === 0x50 && signature[1] === 0x4b && [0x03, 0x05, 0x07].includes(signature[2]);
  } finally { fs.closeSync(fd); }
}

function runZipExtract(archive, target) {
  let listing;
  try { listing = execFileSync('unzip', ['-Z1', archive], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (_) { listing = null; }
  if (listing != null) validateArchiveEntries(listing.split(/\r?\n/).filter(Boolean));
  try {
    execFileSync('unzip', ['-q', archive, '-d', target], { stdio: ['ignore', 'pipe', 'pipe'] });
    return;
  } catch (error) {
    if (process.platform !== 'win32') throw new Error(`ZIP konnte nicht entpackt werden: ${error.message}`);
    try {
      const env = Object.assign({}, process.env, { OLUNTIR_ARCHIVE_PATH: archive, OLUNTIR_ARCHIVE_TARGET: target });
      execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', '$archivePath=[Environment]::GetEnvironmentVariable("OLUNTIR_ARCHIVE_PATH"); $targetPath=[Environment]::GetEnvironmentVariable("OLUNTIR_ARCHIVE_TARGET"); if ([string]::IsNullOrWhiteSpace($archivePath) -or [string]::IsNullOrWhiteSpace($targetPath)) { throw "Archivpfade fehlen." }; Expand-Archive -LiteralPath $archivePath -DestinationPath $targetPath -Force'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
    }
    catch (fallback) { throw new Error(`ZIP konnte nicht entpackt werden: ${fallback.message}`); }
  }
}

function runTarExtract(archive, target) {
  if (isZipArchive(archive)) return runZipExtract(archive, target);
  let listing;
  try { listing = execFileSync('tar', ['-tf', archive], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (_) { listing = null; }
  if (listing != null) validateArchiveEntries(listing.split(/\r?\n/).filter(Boolean));
  try {
    execFileSync('tar', ['-xf', archive, '-C', target], { stdio: ['ignore', 'pipe', 'pipe'] });
    return;
  } catch (error) {
    if (process.platform !== 'win32') throw new Error(`Archiv konnte nicht entpackt werden: ${error.message}`);
    try {
      const env = Object.assign({}, process.env, { OLUNTIR_ARCHIVE_PATH: archive, OLUNTIR_ARCHIVE_TARGET: target });
      execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', '$archivePath=[Environment]::GetEnvironmentVariable("OLUNTIR_ARCHIVE_PATH"); $targetPath=[Environment]::GetEnvironmentVariable("OLUNTIR_ARCHIVE_TARGET"); if ([string]::IsNullOrWhiteSpace($archivePath) -or [string]::IsNullOrWhiteSpace($targetPath)) { throw "Archivpfade fehlen." }; Expand-Archive -LiteralPath $archivePath -DestinationPath $targetPath -Force'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
    }
    catch (fallback) { throw new Error(`Archiv konnte nicht entpackt werden: ${fallback.message}`); }
  }
}

function importArchive(archivePath, storageRoot, options = {}) {
  if (!fs.existsSync(archivePath) || !fs.statSync(archivePath).isFile()) throw new Error('Archivdatei nicht gefunden.');
  const stat = fs.statSync(archivePath);
  if (stat.size > MAX_TOTAL_BYTES) throw new Error('Das Archiv überschreitet das Größenlimit.');
  const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'oluntir-archive-'));
  try {
    runTarExtract(archivePath, staging);
    const entries = fs.readdirSync(staging);
    const sourceRoot = entries.length === 1 && fs.statSync(path.join(staging, entries[0])).isDirectory() ? path.join(staging, entries[0]) : staging;
    return createPackageFromDirectory(sourceRoot, storageRoot, Object.assign({}, options, { sourceFormat: options.sourceFormat || path.extname(archivePath).replace(/^\./, '') }));
  } finally { fs.rmSync(staging, { recursive: true, force: true }); }
}

function isPrivateHost(hostname) {
  const host = String(hostname || '').toLowerCase();
  return host === 'localhost' || host.endsWith('.localhost') || host === '0.0.0.0' || host === '::1' || /^(10\.|127\.|192\.168\.|169\.254\.)/.test(host) || /^(172\.(1[6-9]|2\d|3[0-1])\.)/.test(host);
}

async function resolvePublicHost(hostname) {
  if (isPrivateHost(hostname)) throw new Error('Lokale oder private Downloadziele sind nicht erlaubt.');
  const addresses = await dns.lookup(hostname, { all: true });
  if (addresses.some(item => isPrivateHost(item.address))) throw new Error('Downloadziel zeigt auf ein lokales oder privates Netzwerk.');
}

function download(url, target, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('Zu viele Weiterleitungen.'));
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return reject(new Error('Nur HTTP- und HTTPS-URLs werden unterstützt.'));
    resolvePublicHost(parsed.hostname).then(() => {
      const client = parsed.protocol === 'https:' ? https : http;
      const request = client.get(parsed, { headers: { 'User-Agent': 'Oluntir-Source-Importer/2.0-alpha' } }, response => {
        if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
          response.resume(); return download(new URL(response.headers.location, parsed).toString(), target, redirects + 1).then(resolve, reject);
        }
        if (response.statusCode !== 200) { response.resume(); return reject(new Error(`Download fehlgeschlagen (HTTP ${response.statusCode}).`)); }
        let total = 0; const stream = fs.createWriteStream(target);
        response.on('data', chunk => { total += chunk.length; if (total > MAX_DOWNLOAD_BYTES) { request.destroy(new Error('Download überschreitet das Größenlimit.')); } });
        response.pipe(stream); stream.on('finish', () => stream.close(() => resolve()));
        response.on('error', reject); stream.on('error', reject);
      });
      request.setTimeout(60000, () => request.destroy(new Error('Download-Zeitüberschreitung.')));
      request.on('error', reject);
    }).catch(reject);
  });
}

async function importUrl(url, storageRoot, options = {}) {
  const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'oluntir-url-'));
  const archive = path.join(staging, 'download');
  try {
    await download(url, archive);
    return importArchive(archive, storageRoot, Object.assign({}, options, { origin: url, sourceFormat: options.sourceFormat || 'url-archive' }));
  } finally { fs.rmSync(staging, { recursive: true, force: true }); }
}

function restoreFromRecovery(recoveryPath, storageRoot, options = {}) {
  const recovery = JSON.parse(fs.readFileSync(recoveryPath, 'utf8'));
  if (recovery.kind !== 'oluntir-source-recovery' || recovery.schemaVersion !== SCHEMA_VERSION || !Array.isArray(recovery.files)) throw new Error('Ungültige Source-Recovery-Datei.');
  const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'oluntir-recovery-'));
  try {
    for (const item of recovery.files) {
      const relative = relativePath(item.path);
      const content = zlib.gunzipSync(Buffer.from(item.content, 'base64'));
      if (content.length !== item.sizeBytes || sha256(content) !== item.sha256) throw new Error(`Recovery-Prüfung fehlgeschlagen: ${relative}`);
      const target = path.join(staging, 'source', relative);
      fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, content);
    }
    return createPackageFromDirectory(path.join(staging, 'source'), storageRoot, Object.assign({}, recovery.package, options, { sourceFormat: 'recovery-json', origin: recovery.package.origin || 'recovery-json' }));
  } finally { fs.rmSync(staging, { recursive: true, force: true }); }
}

function createStore(options = {}) {
  const projectRoot = path.resolve(options.projectRoot || path.join(__dirname, '../..'));
  const storageRoot = path.resolve(options.storageRoot || path.join(projectRoot, 'frameworks'));
  function packageRoot(packageId) {
    const safe = safeSegment(packageId);
    const matches = [];
    if (!fs.existsSync(storageRoot)) return null;
    for (const frameworkId of fs.readdirSync(storageRoot)) {
      const candidate = path.join(storageRoot, frameworkId, 'sources', safe);
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) matches.push(candidate);
    }
    if (matches.length !== 1) return null;
    return matches[0];
  }
  function list() {
    const result = [];
    if (!fs.existsSync(storageRoot)) return result;
    for (const frameworkId of fs.readdirSync(storageRoot)) {
      const dir = path.join(storageRoot, frameworkId, 'sources');
      if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue;
      for (const packageId of fs.readdirSync(dir)) {
        const manifestPath = path.join(dir, packageId, 'source-package.json');
        if (fs.existsSync(manifestPath)) result.push(JSON.parse(fs.readFileSync(manifestPath, 'utf8')));
      }
    }
    return result.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }
  function manifest(packageId) {
    const root = packageRoot(packageId); if (!root) return null;
    const file = path.join(root, 'source-package.json'); return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
  }
  function filePath(packageId, relative) {
    const root = packageRoot(packageId); if (!root) return null;
    const safeRelative = relativePath(relative);
    const base = PACKAGE_METADATA_FILES.has(safeRelative) ? root : path.join(root, 'source');
    const target = path.resolve(base, safeRelative);
    if (!target.startsWith(path.resolve(base) + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) return null;
    return target;
  }
  return Object.freeze({ projectRoot, storageRoot, list, manifest, packageRoot, filePath,
    importDirectory: (source, opts) => createPackageFromDirectory(source, storageRoot, opts),
    importArchive: (source, opts) => importArchive(source, storageRoot, opts),
    importUrl: (source, opts) => importUrl(source, storageRoot, opts),
    restore: (source, opts) => restoreFromRecovery(source, storageRoot, opts) });
}

module.exports = Object.freeze({ SCHEMA_VERSION, inventoryDirectory, createPackageFromDirectory, importArchive, importUrl, restoreFromRecovery, createStore, relativePath, safeSegment, PACKAGE_METADATA_FILES });
