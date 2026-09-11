'use strict';

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { start } = require('../app/server.js');

function request(port, method, requestPath, body) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, path: requestPath, method, headers: { 'Content-Type': 'application/json', 'X-Oluntir-Session': 'test-token' } }, res => {
      let value = ''; res.on('data', chunk => { value += chunk; }); res.on('end', () => resolve({ status: res.statusCode, body: value }));
    });
    req.on('error', reject); if (body) req.write(JSON.stringify(body)); req.end();
  });
}

(async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'oluntir-source-api-test-'));
  const source = path.join(root, 'source'); fs.mkdirSync(source, { recursive: true });
  fs.writeFileSync(path.join(source, 'framework.css'), '.test { color: red; }');
  const server = start({ port: 0, token: 'test-token', storageRoot: path.join(root, 'frameworks') });
  try {
    await new Promise(resolve => server.once('listening', resolve));
    const port = server.address().port;
    let response = await request(port, 'GET', '/api/source-packages');
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(JSON.parse(response.body).packages, []);
    response = await request(port, 'POST', '/api/source-packages/import-path', { path: source, frameworkId: 'server-framework', displayName: 'Server Framework' });
    assert.strictEqual(response.status, 201);
    const manifest = JSON.parse(response.body).package;
    assert.strictEqual(manifest.analysis.status, 'analyzed');
    assert.strictEqual(manifest.sourceProfile.path, 'source-framework-profile.json');
    assert(fs.existsSync(path.join(root, 'frameworks', 'server-framework', 'sources', manifest.packageId, 'analysis-report.json')));
    assert(fs.existsSync(path.join(root, 'frameworks', 'server-framework', 'sources', manifest.packageId, 'component-catalog.json')));
    assert(fs.existsSync(path.join(root, 'frameworks', 'server-framework', 'sources', manifest.packageId, 'behavior-manifest.json')));
    assert(fs.existsSync(path.join(root, 'frameworks', 'server-framework', 'sources', manifest.packageId, 'javascript-behavior-plan.json')));
    assert(fs.existsSync(path.join(root, 'frameworks', 'server-framework', 'sources', manifest.packageId, 'javascript-behavior-resolution.json')));
    assert(fs.existsSync(path.join(root, 'frameworks', 'server-framework', 'sources', manifest.packageId, 'source-framework-profile.json')));
    const sourceProfile = JSON.parse(fs.readFileSync(path.join(root, 'frameworks', 'server-framework', 'sources', manifest.packageId, 'source-framework-profile.json'), 'utf8'));
    assert(manifest.support, 'Support-Gate muss im Manifest enthalten sein.');
    assert.strictEqual(manifest.support.status, 'analysis-only');
    assert.strictEqual(sourceProfile.sourceHash, manifest.sourceHash);
    response = await request(port, 'GET', `/api/source-packages/${encodeURIComponent(manifest.packageId)}`);
    assert.strictEqual(response.status, 200);
    response = await request(port, 'GET', `/api/source-packages/${encodeURIComponent(manifest.packageId)}/files/framework.css`);
    assert.strictEqual(response.status, 200);
    assert(response.body.includes('.test'));
    response = await request(port, 'GET', `/api/source-packages/${encodeURIComponent(manifest.packageId)}/files/component-catalog.json`);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(JSON.parse(response.body).kind, 'oluntir-source-component-catalog');
    response = await request(port, 'GET', `/api/source-packages/${encodeURIComponent(manifest.packageId)}/files/source-framework-profile.json`);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(JSON.parse(response.body).kind, 'oluntir-source-framework-profile');
    response = await request(port, 'GET', `/api/source-packages/${encodeURIComponent(manifest.packageId)}/files/source-inventory.json`);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(JSON.parse(response.body).kind, 'oluntir-source-inventory');
    const recovery = JSON.parse(fs.readFileSync(path.join(root, 'frameworks', 'server-framework', 'sources', manifest.packageId, 'source-recovery.json'), 'utf8'));
    response = await request(port, 'POST', '/api/source-packages/restore-json', { recovery });
    assert.strictEqual(response.status, 201);
    assert.strictEqual(JSON.parse(response.body).package.sourceHash, manifest.sourceHash);
    response = await request(port, 'GET', '/api/source-packages');
    assert.strictEqual(JSON.parse(response.body).packages.length, 1);
    console.log('SOURCE-PACKAGE-SERVER-TEST ERFOLGREICH');
  } finally { server.close(); fs.rmSync(root, { recursive: true, force: true }); }
})().catch(error => { console.error(error); process.exitCode = 1; });
