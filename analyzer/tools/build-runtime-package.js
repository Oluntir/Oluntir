#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'analyzer/runtime/runtime-manifest.json'), 'utf8'));
const key = process.argv[2] || `${process.platform}-${process.arch}`;
const target = manifest.targets[key];
if (!target) throw new Error(`Unbekanntes Releaseziel: ${key}`);

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}
function download(url, output) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if ([301,302,303,307,308].includes(response.statusCode)) return download(response.headers.location, output).then(resolve, reject);
      if (response.statusCode !== 200) return reject(new Error(`Download fehlgeschlagen: HTTP ${response.statusCode}`));
      const stream = fs.createWriteStream(output);
      response.pipe(stream);
      stream.on('finish', () => stream.close(resolve));
      stream.on('error', reject);
    });
    request.on('error', reject);
  });
}
function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} konnte das Runtime-Archiv nicht entpacken.`);
}
function findFile(directory, name) {
  const stack = [directory];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name === name) return full;
    }
  }
  return null;
}
(async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'oluntir-node-'));
  const archive = path.join(temp, target.archive);
  const url = `${manifest.runtime.source}${target.archive}`;
  console.log(`Lade geprüfte Runtime: ${url}`);
  await download(url, archive);
  const archiveHash = sha256(archive);
  if (archiveHash !== target.archiveSha256) throw new Error(`Archiv-Prüfsumme stimmt nicht: ${archiveHash}`);
  const extracted = path.join(temp, 'extracted');
  fs.mkdirSync(extracted);
  if (target.archive.endsWith('.zip')) {
    if (process.platform !== 'win32') throw new Error('Windows-ZIP wird im Windows-CI erzeugt.');
    run('powershell.exe', ['-NoProfile','-Command',`Expand-Archive -LiteralPath '${archive.replace(/'/g,"''")}' -DestinationPath '${extracted.replace(/'/g,"''")}' -Force`]);
  } else {
    run('tar', ['-xf', archive, '-C', extracted]);
  }
  const executableName = key.startsWith('win32-') ? 'node.exe' : 'node';
  const sourceExecutable = findFile(extracted, executableName);
  const sourceLicense = findFile(extracted, 'LICENSE');
  if (!sourceExecutable || !sourceLicense) throw new Error('Runtime oder vollständige Node-Lizenz wurde im Upstream-Paket nicht gefunden.');
  const destination = path.resolve(root, target.executableRelativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(sourceExecutable, destination);
  if (!key.startsWith('win32-')) fs.chmodSync(destination, 0o755);
  const licenseDestination = path.join(root, 'licenses/runtime', `NODEJS-${manifest.runtime.version}-LICENSE.txt`);
  fs.mkdirSync(path.dirname(licenseDestination), { recursive: true });
  fs.copyFileSync(sourceLicense, licenseDestination);
  const integrityPath = path.join(root, 'runtime/runtime-integrity.json');
  fs.mkdirSync(path.dirname(integrityPath), { recursive: true });
  let integrity = { schemaVersion: '1.0.0', runtimeVersion: manifest.runtime.version, executables: {} };
  if (fs.existsSync(integrityPath)) integrity = JSON.parse(fs.readFileSync(integrityPath, 'utf8'));
  integrity.executables[key] = sha256(destination);
  fs.writeFileSync(integrityPath, JSON.stringify(integrity, null, 2) + '\n');
  console.log(`Runtime bereit: ${destination}`);
  console.log(`SHA-256: ${integrity.executables[key]}`);
})().catch((error) => { console.error(`FEHLER: ${error.message}`); process.exitCode = 1; });
