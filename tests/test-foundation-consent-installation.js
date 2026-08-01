const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('editor/js/core/oluntir-logging-consent.js', 'utf8');

function createContext(href, values) {
  const context = {
    console,
    window: null,
    location: { href },
    document: { getElementById(){ return null; } },
    OluntirSettingsStore: {
      async get(key, fallback){ return values.has(key) ? values.get(key) : fallback; },
      async set(key, value){ values.set(key, value); }
    },
    OluntirLogger: { getState(){ return {}; }, authorizeDirectory(){}, configure(){}, async revoke(){}, info(){}, async flush(){} }
  };
  context.window = context;
  vm.runInNewContext(code, context);
  return context;
}

(async () => {
  const values = new Map();
  const first = createContext('file:///C:/Oluntir/RELEASE_A/index.html', values);
  const firstInstallation = first.OluntirLoggingConsent.getInstallationIdentity();
  values.set('oluntir-foundation-consent', {
    accepted: true,
    consentVersion: '1.1',
    acceptedAt: new Date().toISOString(),
    documents: {
      license: { file: 'LICENSING_de.md', version: '1.1' },
      privacy: { file: 'PRIVACY_de.md', version: '1.1' },
      security: { file: 'SECURITY_de.md', version: '1.1' }
    },
    installation: firstInstallation
  });
  let status = await first.OluntirLoggingConsent.getConsentStatus();
  assert.strictEqual(status.valid, true);

  const second = createContext('file:///C:/Oluntir/RELEASE_B/index.html', values);
  const secondInstallation = second.OluntirLoggingConsent.getInstallationIdentity();
  assert.notStrictEqual(firstInstallation.installationId, secondInstallation.installationId);
  status = await second.OluntirLoggingConsent.getConsentStatus();
  assert.strictEqual(status.valid, false);
  assert.strictEqual(status.reason, 'installation-mismatch');

  const sameAgain = createContext('file:///C:/Oluntir/RELEASE_A/index.html?cache=1#test', values);
  status = await sameAgain.OluntirLoggingConsent.getConsentStatus();
  assert.strictEqual(status.valid, true);
  console.log('FOUNDATION-CONSENT-INSTALLATION-TEST ERFOLGREICH');
})().catch(error => { console.error(error); process.exit(1); });
