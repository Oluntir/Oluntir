const assert = require('assert');
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('editor/js/core/oluntir-logging-consent.js', 'utf8');
const privacy = fs.readFileSync('PRIVACY_de.md', 'utf8');
[
  'oluntir-consent-license',
  'oluntir-consent-privacy',
  'oluntir-consent-security',
  'Ohne Logging starten',
  'Zustimmen und logs-Ordner wählen',
  'Oluntir starten',
  'Die Zustimmung gilt für diesen entpackten Oluntir-Programmordner.',
  'Wählen Sie ausschließlich den vorhandenen Unterordner <code>logs</code>',
  'Passwörter', 'Tokens/Secrets/API-Schlüssel', 'Auth-/Cookie-/Credential-Daten',
  'private Schlüssel', 'Benutzerpfade', 'sensible URL-Parameter'
].forEach(value => assert.ok(html.includes(value), 'Fehlender Zustimmungsinhalt: ' + value));
assert.ok(js.includes("const CONSENT_VERSION = '1.1'"));
assert.ok(js.includes("permissionScope: 'Selected logs directory only'"));
assert.ok(js.includes('maskedDataClasses'));
assert.ok(js.includes('setCompletionView(true)'));
assert.ok(js.includes('Anderen logs-Ordner wählen'));
assert.ok(js.includes('startOluntir'));
assert.ok(js.includes('isFoundationConsentValid'));
assert.ok(js.includes('getConsentStatus'));
assert.ok(js.includes("reason: 'version-mismatch'"));
assert.ok(js.includes("reason: 'installation-mismatch'"));
assert.ok(js.includes('getInstallationIdentity'));
assert.ok(js.includes("String(handle.name || '').toLowerCase() !== 'logs'"));
assert.ok(privacy.includes('Automatische Maskierung'));
console.log('FOUNDATION-CONSENT-CONTRACT-TEST ERFOLGREICH');
