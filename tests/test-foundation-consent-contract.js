const assert = require('assert');
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('editor/js/core/oluntir-logging-consent.js', 'utf8');
const privacy = fs.readFileSync('PRIVACY_de.md', 'utf8');
[
  'oluntir-consent-license',
  'oluntir-consent-privacy',
  'oluntir-consent-security',
  'Zustimmen und ohne Logging starten',
  'Zustimmen, Programmordner öffnen und Unterordner logs wählen',
  'Oluntir starten',
  'gilt ausschließlich für diesen entpackten Oluntir-Programmordner',
  'entpackten <strong>Oluntir-Programmordner</strong>',
  'Passwörter', 'Tokens', 'Secrets', 'API-Schlüssel', 'Authorization-Daten',
  'Cookies', 'Credentials', 'private Schlüssel', 'Benutzeranteile von Windows-Pfaden',
  'Token- und Passwortparameter in URLs'
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
