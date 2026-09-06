(function (root) {
  'use strict';
  const HANDLE_KEY = 'oluntir-logging-directory-handle';
  const PREF_KEY = 'oluntir-logging-preferences';
  const FOUNDATION_KEY = 'oluntir-foundation-consent';
  const CONSENT_VERSION = '1.1';
  const CONSENT_FILE = '.oluntir-logging.json';
  const INSTALLATION_SCHEMA_VERSION = 1;
  const REQUIRED_IDS = ['oluntir-consent-license', 'oluntir-consent-privacy', 'oluntir-consent-security'];

  function store() { return root.OluntirSettingsStore; }

  function installationSource() {
    const location = root.location || {};
    const href = String(location.href || '');
    if (!href) return 'unknown-installation';
    const clean = href.split('#')[0].split('?')[0];
    const slash = Math.max(clean.lastIndexOf('/'), clean.lastIndexOf('\\'));
    return slash >= 0 ? clean.slice(0, slash + 1) : clean;
  }
  function hashInstallation(value) {
    let hash = 2166136261;
    const text = String(value || 'unknown-installation');
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
  }
  function getInstallationIdentity() {
    return {
      schemaVersion: INSTALLATION_SCHEMA_VERSION,
      installationId: 'oluntir-installation-' + hashInstallation(installationSource())
    };
  }
  async function hasPermission(handle, request) {
    if (!handle) return false;
    const options = { mode: 'readwrite' };
    if (typeof handle.queryPermission === 'function' && await handle.queryPermission(options) === 'granted') return true;
    if (request && typeof handle.requestPermission === 'function') return (await handle.requestPermission(options)) === 'granted';
    return false;
  }
  async function writeFile(directory, name, content) {
    const fileHandle = await directory.getFileHandle(name, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content); await writable.close();
  }
  function acceptedDocuments() {
    return {
      license: { file: 'LICENSING_de.md', version: CONSENT_VERSION },
      privacy: { file: 'PRIVACY_de.md', version: CONSENT_VERSION },
      security: { file: 'SECURITY_de.md', version: CONSENT_VERSION }
    };
  }
  async function ensureMetadata(directory, displayPath, level, foundation) {
    await writeFile(directory, CONSENT_FILE, JSON.stringify({
      schemaVersion: 2,
      authorizedAt: new Date().toISOString(),
      authorizedBy: 'Oluntir 2.1.0 BETA',
      purpose: 'Local technical diagnostics and performance logging',
      directory: displayPath,
      permissionScope: 'Selected logs directory only',
      logLevel: level,
      installation: getInstallationIdentity(),
      foundationConsent: foundation,
      privacy: {
        optIn: true,
        localOnly: true,
        contentLogging: false,
        sensitiveDataRedaction: true,
        maskedDataClasses: [
          'passwords', 'tokens', 'secrets', 'api-keys', 'authorization-data',
          'cookies', 'credentials', 'private-keys', 'windows-user-path-segments',
          'token-and-password-url-parameters'
        ]
      },
      rotation: { maxFileSizeMB: 2, retainedFiles: 5 }
    }, null, 2));
    await writeFile(directory, 'README.md', '# Oluntir logs\n\nDieser Ordner enthält lokale technische Diagnoseprotokolle, die nur nach ausdrücklicher Zustimmung erzeugt werden.\n\nSpeicherort: `' + displayPath + '`\n\n- Keine automatische Übertragung\n- Keine Protokollierung von Seiteninhalten\n- Sensible Werte werden maskiert\n- Dateien können jederzeit gelöscht werden\n- Die Freigabe kann in Oluntir widerrufen werden\n');
  }
  function modal() { return document.getElementById('oluntir-logging-modal'); }
  function setCompletionView(active) {
    const success = document.getElementById('oluntir-logging-success');
    const start = document.getElementById('oluntir-logging-start');
    const accept = document.getElementById('oluntir-consent-accept');
    const choose = document.getElementById('oluntir-logging-choose');
    if (success) success.hidden = !active;
    if (start) start.hidden = !active;
    if (accept) accept.hidden = Boolean(active);
    if (choose) {
      choose.hidden = false;
      choose.classList.toggle('btn-primary', !active);
      choose.textContent = active
        ? 'Anderen logs-Ordner wählen'
        : 'Zustimmen und logs-Ordner wählen';
    }
  }
  function startOluntir() {
    const el = modal();
    if (el) el.dataset.required = 'false';
    setCompletionView(false);
    hide();
  }

  function setStatus(text, kind) {
    const el = document.getElementById('oluntir-logging-status');
    if (!el) return;
    el.textContent = text || ''; el.dataset.kind = kind || 'info';
  }
  function requiredAccepted() {
    return REQUIRED_IDS.every(id => { const el = document.getElementById(id); return Boolean(el && el.checked); });
  }
  function updateActions() {
    const accepted = requiredAccepted();
    const start = document.getElementById('oluntir-consent-accept');
    const choose = document.getElementById('oluntir-logging-choose');
    if (start) start.disabled = !accepted;
    if (choose) choose.disabled = !accepted;
  }
  function show(path, required) {
    const el = modal(); if (!el) return;
    el.dataset.required = required ? 'true' : 'false';
    const close = document.getElementById('oluntir-logging-close');
    if (close) close.hidden = Boolean(required);
    const pathNode = document.getElementById('oluntir-logging-path');
    if (pathNode) pathNode.textContent = path || 'Noch kein logs-Ordner freigegeben.';
    el.hidden = false; el.setAttribute('aria-hidden', 'false');
    setCompletionView(false);
    updateActions();
  }
  function hide() {
    const el = modal(); if (!el) return;
    if (el.dataset.required === 'true') return;
    el.hidden = true; el.setAttribute('aria-hidden', 'true');
  }
  async function storeFoundationConsent() {
    if (!requiredAccepted()) throw new Error('Bitte bestätigen Sie Lizenzbestimmungen, Datenschutz und Sicherheitsrichtlinien.');
    const value = {
      accepted: true,
      consentVersion: CONSENT_VERSION,
      acceptedAt: new Date().toISOString(),
      documents: acceptedDocuments(),
      installation: getInstallationIdentity()
    };
    const settings = store();
    if (!settings) throw new Error('Der lokale Einstellungsspeicher ist nicht verfügbar.');
    await settings.set(FOUNDATION_KEY, value);
    return value;
  }
  async function persist(handle, level, displayPath) {
    const settings = store();
    if (!settings) throw new Error('Der lokale Einstellungsspeicher ist nicht verfügbar.');
    await settings.set(HANDLE_KEY, handle);
    await settings.set(PREF_KEY, { enabled: true, level, displayPath, updatedAt: new Date().toISOString() });
  }
  async function acceptWithoutLogging() {
    await storeFoundationConsent();
    const settings = store();
    await settings.set(PREF_KEY, { enabled: false, level: 'off', displayPath: null, updatedAt: new Date().toISOString() });
    const el = modal(); if (el) el.dataset.required = 'false';
    hide();
  }
  async function selectDirectory() {
    const foundation = await storeFoundationConsent();
    if (typeof root.showDirectoryPicker !== 'function') throw new Error('Der Browser unterstützt die sichere Ordnerfreigabe nicht. Verwende Chromium oder Edge.');
    const handle = await root.showDirectoryPicker({ mode: 'readwrite', id: 'oluntir-logs', startIn: 'documents' });
    if (!handle || String(handle.name || '').toLowerCase() !== 'logs') {
      throw new Error('Bitte wählen Sie ausschließlich den vorhandenen Unterordner \"logs\" im entpackten Oluntir-Programmordner aus.');
    }
    if (!(await hasPermission(handle, true))) throw new Error('Die Schreibberechtigung wurde nicht erteilt.');
    const levelNode = document.getElementById('oluntir-logging-level');
    const level = levelNode ? levelNode.value : 'info';
    const displayPath = handle.name ? handle.name + ' (vom Benutzer gewählter logs-Ordner)' : 'Gewählter logs-Ordner';
    await ensureMetadata(handle, displayPath, level, foundation);
    await persist(handle, level, displayPath);
    root.OluntirLogger.authorizeDirectory(handle, displayPath, level);
    root.OluntirLogger.info('session', 'Logging consent stored', { permissionScope: 'logs-directory-only', logDirectory: displayPath, consentVersion: CONSENT_VERSION });
    await root.OluntirLogger.flush();
    const pathNode = document.getElementById('oluntir-logging-path'); if (pathNode) pathNode.textContent = displayPath;
    setStatus('Zustimmung und Schreibberechtigung gespeichert. Logdateien liegen in: ' + displayPath + '. Bitte starten Sie Oluntir jetzt über die Schaltfläche unten.', 'success');
    setCompletionView(true);
    return root.OluntirLogger.getState();
  }
  function isFoundationConsentValid(foundation) {
    if (!foundation || foundation.accepted !== true || foundation.consentVersion !== CONSENT_VERSION) return false;
    const currentInstallation = getInstallationIdentity();
    const storedInstallation = foundation.installation || {};
    if (storedInstallation.schemaVersion !== currentInstallation.schemaVersion || storedInstallation.installationId !== currentInstallation.installationId) return false;
    const expected = acceptedDocuments();
    const actual = foundation.documents || {};
    return Object.keys(expected).every(key => {
      const document = actual[key];
      return Boolean(document && document.file === expected[key].file && document.version === expected[key].version);
    });
  }
  async function getConsentStatus() {
    const settings = store();
    if (!settings) return { valid: false, reason: 'settings-store-unavailable', consentVersion: CONSENT_VERSION };
    const foundation = await settings.get(FOUNDATION_KEY, null);
    if (!foundation) return { valid: false, reason: 'missing', consentVersion: CONSENT_VERSION };
    if (foundation.accepted !== true) return { valid: false, reason: 'not-accepted', consentVersion: CONSENT_VERSION };
    if (foundation.consentVersion !== CONSENT_VERSION) return { valid: false, reason: 'version-mismatch', storedVersion: foundation.consentVersion || null, consentVersion: CONSENT_VERSION };
    const currentInstallation = getInstallationIdentity();
    const storedInstallation = foundation.installation || {};
    if (storedInstallation.schemaVersion !== currentInstallation.schemaVersion || storedInstallation.installationId !== currentInstallation.installationId) return { valid: false, reason: 'installation-mismatch', storedInstallationId: storedInstallation.installationId || null, installationId: currentInstallation.installationId, consentVersion: CONSENT_VERSION };
    if (!isFoundationConsentValid(foundation)) return { valid: false, reason: 'documents-mismatch', storedVersion: foundation.consentVersion || null, consentVersion: CONSENT_VERSION };
    return { valid: true, reason: 'valid', acceptedAt: foundation.acceptedAt || null, consentVersion: CONSENT_VERSION };
  }
  async function restore() {
    const settings = store(); if (!settings) return { foundation: false, logging: false };
    const foundation = await settings.get(FOUNDATION_KEY, null);
    const foundationValid = isFoundationConsentValid(foundation);
    const pref = await settings.get(PREF_KEY, null);
    if (!foundationValid || !pref || !pref.enabled) return { foundation: foundationValid, logging: false };
    const handle = await settings.get(HANDLE_KEY, null);
    if (!handle || !(await hasPermission(handle, false))) return { foundation: foundationValid, logging: false };
    root.OluntirLogger.authorizeDirectory(handle, pref.displayPath || handle.name, pref.level || 'info');
    return { foundation: foundationValid, logging: true };
  }
  async function revoke() {
    const settings = store();
    await root.OluntirLogger.revoke({ clearBuffer: true });
    if (settings) {
      await settings.set(HANDLE_KEY, null);
      await settings.set(PREF_KEY, { enabled: false, level: 'off', displayPath: null, updatedAt: new Date().toISOString() });
    }
    setStatus('Logging wurde deaktiviert. Die grundlegende Zustimmung bleibt bestehen. Vorhandene Logdateien können im zuvor gewählten Ordner gelöscht werden.', 'info');
    const pathNode = document.getElementById('oluntir-logging-path'); if (pathNode) pathNode.textContent = 'Keine Log-Freigabe aktiv.';
  }
  async function initialize() {
    const restored = await restore();
    if (!restored.foundation) show(null, true);
    const open = document.getElementById('oluntir-logging-open'); if (open) open.addEventListener('click', () => show(root.OluntirLogger.getState().displayPath, false));
    REQUIRED_IDS.forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', updateActions); });
    const accept = document.getElementById('oluntir-consent-accept'); if (accept) accept.addEventListener('click', () => acceptWithoutLogging().catch(error => setStatus(error.message || String(error), 'error')));
    const choose = document.getElementById('oluntir-logging-choose'); if (choose) choose.addEventListener('click', () => selectDirectory().catch(error => { setCompletionView(false); setStatus(error.message || String(error), 'error'); }));
    const startButton = document.getElementById('oluntir-logging-start'); if (startButton) startButton.addEventListener('click', startOluntir);
    const close = document.getElementById('oluntir-logging-close'); if (close) close.addEventListener('click', hide);
    const revokeButton = document.getElementById('oluntir-logging-revoke'); if (revokeButton) revokeButton.addEventListener('click', () => revoke().catch(error => setStatus(error.message || String(error), 'error')));
    const level = document.getElementById('oluntir-logging-level'); if (level) level.addEventListener('change', async () => { root.OluntirLogger.configure({ level: level.value }); const settings = store(); const current = settings ? await settings.get(PREF_KEY, {}) : {}; if (settings) await settings.set(PREF_KEY, Object.assign({}, current, { level: level.value })); });
  }
  root.OluntirLoggingConsent = Object.freeze({ initialize, show, hide, selectDirectory, acceptWithoutLogging, restore, revoke, requiredAccepted, startOluntir, getConsentStatus, isFoundationConsentValid, getInstallationIdentity, consentVersion: CONSENT_VERSION });
})(window);
