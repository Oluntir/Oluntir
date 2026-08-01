const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('editor/js/core/oluntir-logging-consent.js', 'utf8');
const values = new Map();
const context = {
  console,
  window: null,
  location: { href: 'file:///C:/Oluntir/RELEASE/index.html' },
  document: { getElementById(){ return null; } },
  OluntirSettingsStore: {
    async get(key, fallback){ return values.has(key) ? values.get(key) : fallback; },
    async set(key, value){ values.set(key, value); }
  },
  OluntirLogger: { getState(){ return {}; }, authorizeDirectory(){}, configure(){}, async revoke(){}, info(){}, async flush(){} }
};
context.window = context;
vm.runInNewContext(code, context);
const api = context.OluntirLoggingConsent;
const installation = api.getInstallationIdentity();
assert.strictEqual(api.consentVersion, '1.1');
(async () => {
  let status = await api.getConsentStatus();
  assert.strictEqual(status.valid, false);
  assert.strictEqual(status.reason, 'missing');
  values.set('oluntir-foundation-consent', {
    accepted: true,
    consentVersion: '1.0',
    documents: {
      license: { file: 'LICENSING_de.md', version: '1.0' },
      privacy: { file: 'PRIVACY_de.md', version: '1.0' },
      security: { file: 'SECURITY_de.md', version: '1.0' }
    },
    installation
  });
  status = await api.getConsentStatus();
  assert.strictEqual(status.valid, false);
  assert.strictEqual(status.reason, 'version-mismatch');
  values.set('oluntir-foundation-consent', {
    accepted: true,
    consentVersion: '1.1',
    documents: {
      license: { file: 'LICENSING_de.md', version: '1.1' },
      privacy: { file: 'PRIVACY_de.md', version: '1.1' },
      security: { file: 'SECURITY_de.md', version: '1.1' }
    },
    installation
  });
  status = await api.getConsentStatus();
  assert.strictEqual(status.valid, true);
  console.log('FOUNDATION-CONSENT-VERSION-TEST ERFOLGREICH');
})().catch(error => { console.error(error); process.exit(1); });
