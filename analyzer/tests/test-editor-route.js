'use strict';

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { start } = require('../app/server.js');

function request(port, pathname) {
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: '127.0.0.1', port, path: pathname, headers: { 'X-Oluntir-Session': 'test-session' } }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
  });
}

(async () => {
  const storageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oluntir-editor-route-'));
  const server = start({ port: 0, token: 'test-session', storageRoot });
  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const port = server.address().port;
    const analyzer = await request(port, '/?session=test-session');
    assert.strictEqual(analyzer.status, 200);
    assert.ok(analyzer.body.includes('id="editor-link"'), 'Analyzer must link to the editor');

    const editor = await request(port, '/oluntir/?session=test-session');
    assert.strictEqual(editor.status, 200);
    assert.ok(editor.headers['content-security-policy'].includes("font-src 'self' data:"), 'Local icon fonts must be allowed');
    assert.ok(editor.body.includes('id="framework-select"'), 'Editor framework selection must be present');
    assert.ok(editor.body.includes('value="bs4"'), 'Bootstrap 4 must remain selectable');
    assert.ok(editor.body.includes('value="bs5"'), 'Bootstrap 5 must remain selectable');
    assert.ok(editor.body.includes('id="input-source-archive"'), 'Source archive import must be present');
    assert.ok(editor.body.includes('id="input-source-folder"'), 'Source folder import must be present');

    const frameworkScript = await request(port, '/oluntir/editor/js/core/framework.js?v=route-test');
    assert.strictEqual(frameworkScript.status, 200);
    assert.ok(frameworkScript.body.includes('OluntirFrameworkReady'), 'Framework discovery script must be reachable');
    console.log('EDITOR-ROUTE-TEST ERFOLGREICH');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(storageRoot, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
