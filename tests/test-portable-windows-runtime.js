'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'analyzer', 'runtime', 'runtime-manifest.json'), 'utf8'));
const target = manifest.targets['win32-x64'];
const executable = path.join(root, target.executableRelativePath);
assert(fs.existsSync(executable), `Windows-Runtime fehlt: ${target.executableRelativePath}`);
const hash = crypto.createHash('sha256').update(fs.readFileSync(executable)).digest('hex');
assert.strictEqual(hash, target.upstreamExecutableSha256);
const integrity = JSON.parse(fs.readFileSync(path.join(root, 'runtime', 'runtime-integrity.json'), 'utf8'));
assert.strictEqual(integrity.executables['win32-x64'], hash);
console.log('PORTABLE-WINDOWS-RUNTIME-TEST ERFOLGREICH');
