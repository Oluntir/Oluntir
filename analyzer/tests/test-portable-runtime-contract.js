'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'analyzer/runtime/runtime-manifest.json'), 'utf8'));
assert.strictEqual(manifest.runtime.pathFallbackAllowed, false);
assert.strictEqual(manifest.runtime.offlineRequired, true);
for (const key of ['win32-x64','linux-x64','darwin-x64','darwin-arm64']) {
  assert.ok(manifest.targets[key], `Target fehlt: ${key}`);
  assert.match(manifest.targets[key].archiveSha256, /^[a-f0-9]{64}$/);
}
const cmd = fs.readFileSync(path.join(root, 'Start-Oluntir-API-Analyzer.cmd'), 'utf8');
assert.ok(!/where\s+node/i.test(cmd));
assert.ok(cmd.includes('runtime\\node\\win32-x64\\node.exe'));
const sh = fs.readFileSync(path.join(root, 'start-oluntir-api-analyzer.sh'), 'utf8');
assert.ok(!/command -v node|which node/.test(sh));
console.log('PORTABLE-RUNTIME-CONTRACT-TEST ERFOLGREICH');
