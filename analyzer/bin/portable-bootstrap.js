#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { openBrowser } = require('../platform/open-browser.js');
const serverModule = require('../app/server.js');

const projectRoot = path.resolve(__dirname, '..', '..');
const runtimeManifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'runtime', 'runtime-manifest.json'), 'utf8'));

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function assertPortableRuntime() {
  const expectedSuffix = runtimeManifest.targets[`${process.platform}-${process.arch}`]?.executableRelativePath;
  if (!expectedSuffix) throw new Error(`Nicht unterstützte Plattform: ${process.platform}-${process.arch}`);
  const normalizedActual = path.resolve(process.execPath).replace(/\\/g, '/').toLowerCase();
  const normalizedExpected = path.resolve(projectRoot, expectedSuffix).replace(/\\/g, '/').toLowerCase();
  if (normalizedActual !== normalizedExpected && process.env.OLUNTIR_ALLOW_DEVELOPMENT_RUNTIME !== '1') {
    throw new Error('Der Analyzer wurde nicht mit der mitgelieferten Oluntir-Runtime gestartet.');
  }
  const integrityPath = path.join(projectRoot, 'runtime', 'runtime-integrity.json');
  if (fs.existsSync(integrityPath) && normalizedActual === normalizedExpected) {
    const integrity = JSON.parse(fs.readFileSync(integrityPath, 'utf8'));
    const expected = integrity.executables?.[`${process.platform}-${process.arch}`];
    if (!expected) throw new Error('Für diese Runtime fehlt der Integritätswert.');
    const actual = sha256(process.execPath);
    if (actual !== expected) throw new Error('Die portable Oluntir-Runtime ist beschädigt oder verändert.');
  }
}

async function main() {
  assertPortableRuntime();
  const token = crypto.randomBytes(24).toString('hex');
  const server = serverModule.start({ port: 0, token });
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  const address = server.address();
  const target = `http://127.0.0.1:${address.port}/?session=${token}`;
  console.log(`Oluntir API Analyzer: ${target}`);
  if (process.env.OLUNTIR_NO_BROWSER !== '1') openBrowser(target);
}

main().catch((error) => {
  console.error(`FEHLER: ${error.message}`);
  process.exitCode = 1;
});
