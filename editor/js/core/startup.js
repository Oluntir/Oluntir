(function () {
  'use strict';

  const APP_VERSION = '1.0.0';
  const STARTUP_SCHEMA = 2;
  const META_KEY = 'oluntir-project-meta';
  const SESSION_KEY = 'oluntir-last-session';
  const framework = () => window.PAGEBUILDER_FRAMEWORK || { id: 'bs5', storageKey: 'pagebuilder-project-bs5' };
  let resolveStartup;
  let currentInfo = null;
  let selectedProjectType = '';
  const ready = new Promise(resolve => { resolveStartup = resolve; });

  function safeParse(value) { try { return JSON.parse(value); } catch (_) { return null; } }

  function storedProjectInfo() {
    const fw = framework();
    const rawProject = localStorage.getItem(fw.storageKey);
    const rawIncludes = localStorage.getItem(`oluntir-includes-${fw.id}`);
    const meta = safeParse(localStorage.getItem(META_KEY));
    const includes = safeParse(rawIncludes);
    const hasProjectData = !!(rawProject && rawProject !== '{}' && rawProject !== 'null');
    const hasIncludesData = !!(includes && (includes.decided || includes.enabled || (includes.sections || []).length));
    const exists = hasProjectData || hasIncludesData || !!meta;
    const version = meta && meta.appVersion ? meta.appVersion : 'Unbekannt / ältere Speicherung';
    const compatible = !meta || [1, STARTUP_SCHEMA].includes(meta.schemaVersion);
    return { exists, meta, includes, version, compatible, hasProjectData, hasIncludesData };
  }

  async function inspectBrowserStorage() {
    const status = { localStorage: localStorage.length > 0, sessionStorage: sessionStorage.length > 0, cacheApi: false, indexedDb: false };
    try { if ('caches' in window) status.cacheApi = (await caches.keys()).length > 0; } catch (_) {}
    try {
      if (indexedDB && typeof indexedDB.databases === 'function') status.indexedDb = (await indexedDB.databases()).length > 0;
      else status.indexedDb = !!indexedDB;
    } catch (_) {}
    return status;
  }

  function projectId() { return crypto.randomUUID ? crypto.randomUUID() : `oluntir-${Date.now()}-${Math.random().toString(16).slice(2)}`; }

  function setMeta(patch) {
    const old = safeParse(localStorage.getItem(META_KEY)) || {};
    const next = Object.assign({
      schemaVersion: STARTUP_SCHEMA,
      appVersion: APP_VERSION,
      projectId: old.projectId || projectId(),
      createdAt: old.createdAt || new Date().toISOString()
    }, old, patch || {}, { lastOpenedAt: new Date().toISOString(), lastModifiedAt: new Date().toISOString() });
    localStorage.setItem(META_KEY, JSON.stringify(next));
    return next;
  }

  function clearProjectStorage() {
    const fw = framework();
    localStorage.removeItem(fw.storageKey);
    localStorage.removeItem(`oluntir-includes-${fw.id}`);
    localStorage.removeItem(META_KEY);
    localStorage.removeItem('pagebuilder-pending-restore');
  }

  function showStep(id) {
    document.querySelectorAll('.oluntir-wizard-step').forEach(step => { step.hidden = step.id !== id; });
  }

  function hideModal() {
    const modal = document.getElementById('oluntir-startup-modal');
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
  }

  function showEndedScreen() {
    document.body.classList.add('oluntir-application-ended');
    const overlay = document.getElementById('oluntir-ended-screen');
    if (overlay) { overlay.hidden = false; overlay.setAttribute('aria-hidden', 'false'); }
    try { window.close(); } catch (_) {}
  }

  function endApplication() {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ action: 'ended', at: new Date().toISOString() }));
    showEndedScreen();
  }

  function selectAction(value) {
    document.querySelectorAll('input[name="oluntir-start-action"]').forEach(input => { input.checked = input.value === value; });
    const button = document.getElementById('oluntir-startup-continue');
    button.disabled = !value;
    button.textContent = value === 'existing' ? 'Bestehendes Projekt öffnen' : 'Weiter';
  }

  function openExistingProject() {
    setMeta({ migratedFrom: currentInfo ? currentInfo.version : undefined });
    localStorage.setItem(SESSION_KEY, JSON.stringify({ action: 'existing', at: new Date().toISOString() }));
    hideModal();
    resolveStartup({ action: 'existing' });
  }

  function beginNewProjectFlow() {
    selectedProjectType = '';
    document.querySelectorAll('input[name="oluntir-new-project-type"]').forEach(input => { input.checked = false; });
    document.getElementById('oluntir-type-continue').disabled = true;
    showStep('oluntir-start-step-type');
  }

  function renderSummary() {
    const reusable = selectedProjectType === 'reusable';
    const root = document.getElementById('oluntir-project-summary');
    root.innerHTML = reusable
      ? '<h3>Projekt mit wiederverwendbaren Bereichen</h3><p>Das neue Projekt startet mit einer leeren Seite. Header, Navigation und Footer werden erst nach dem Einfügen durch den Benutzer als gemeinsame Inhalte verwaltet.</p><p><strong>Exportmöglichkeiten:</strong></p><ul><li>HTML ohne wiederverwendbare Bereiche</li><li>Apache SSI</li><li>PHP Includes</li></ul><p>Beim Export mit SSI oder PHP wird der Ordner <code>includes/</code> angelegt.</p>'
      : '<h3>Klassisches HTML-Projekt</h3><p>Header, Navigation und Footer werden vollständig in jeder Seite gespeichert.</p><p><strong>Exportmöglichkeit:</strong> HTML</p><p>Es wird kein <code>includes/</code>-Ordner angelegt.</p>';
  }

  function createProject() {
    const reusable = selectedProjectType === 'reusable';
    clearProjectStorage();
    const now = new Date().toISOString();
    const meta = {
      schemaVersion: STARTUP_SCHEMA,
      appVersion: APP_VERSION,
      projectId: projectId(),
      projectType: reusable ? 'reusable-areas' : 'classic',
      usesReusableAreas: reusable,
      createdAt: now,
      lastOpenedAt: now,
      lastModifiedAt: now
    };
    localStorage.setItem(META_KEY, JSON.stringify(meta));
    localStorage.setItem(SESSION_KEY, JSON.stringify({ action: 'new', projectType: meta.projectType, at: now }));
    if (window.OluntirIncludes && typeof window.OluntirIncludes.initializeProject === 'function') {
      window.OluntirIncludes.initializeProject(reusable);
    } else {
      const includeState = { schemaVersion: 1, enabled: reusable, decided: true, exportTarget: 'html', regions: {}, sections: [] };
      localStorage.setItem(`oluntir-includes-${framework().id}`, JSON.stringify(includeState));
    }
    window.dispatchEvent(new CustomEvent('oluntir:newproject', { detail: { reusable, projectType: meta.projectType } }));
    hideModal();
    resolveStartup({ action: 'new', projectType: meta.projectType });
  }

  async function openStartup() {
    currentInfo = storedProjectInfo();
    const browser = await inspectBrowserStorage();
    const modal = document.getElementById('oluntir-startup-modal');
    const existing = document.querySelector('input[name="oluntir-start-action"][value="existing"]');
    const details = document.getElementById('oluntir-startup-existing-details');
    const warning = document.getElementById('oluntir-startup-version-warning');
    const cache = document.getElementById('oluntir-startup-cache-status');

    existing.disabled = !currentInfo.exists;
    const projectType = currentInfo.meta && currentInfo.meta.projectType ? currentInfo.meta.projectType : 'nicht eindeutig erkennbar';
    details.textContent = currentInfo.exists
      ? `Version: ${currentInfo.version} · Projekttyp: ${projectType}${currentInfo.meta && currentInfo.meta.lastOpenedAt ? ` · zuletzt geöffnet: ${new Date(currentInfo.meta.lastOpenedAt).toLocaleString('de-DE')}` : ''}`
      : 'Im Browser wurde kein gespeichertes Oluntir-Projekt gefunden.';
    warning.hidden = currentInfo.compatible;
    cache.textContent = `Browser-Speicher erkannt: localStorage ${browser.localStorage ? 'Ja' : 'Nein'}, sessionStorage ${browser.sessionStorage ? 'Ja' : 'Nein'}, IndexedDB ${browser.indexedDb ? 'Ja' : 'Nein'}, Cache API ${browser.cacheApi ? 'Ja' : 'Nein'}. Vorhandene Daten werden nicht ungefragt gelöscht.`;

    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    showStep('oluntir-start-step-start');
    selectAction(currentInfo.exists ? 'existing' : 'new');
  }

  function bind() {
    document.querySelectorAll('input[name="oluntir-start-action"]').forEach(input => input.addEventListener('change', () => selectAction(input.value)));
    document.querySelectorAll('.oluntir-end-button').forEach(button => button.addEventListener('click', endApplication));
    document.getElementById('oluntir-startup-continue').addEventListener('click', () => {
      const selected = document.querySelector('input[name="oluntir-start-action"]:checked');
      if (!selected) return;
      if (selected.value === 'existing') openExistingProject();
      else if (currentInfo && currentInfo.exists) showStep('oluntir-start-step-warning');
      else beginNewProjectFlow();
    });
    document.getElementById('oluntir-warning-existing').addEventListener('click', openExistingProject);
    document.getElementById('oluntir-warning-new').addEventListener('click', beginNewProjectFlow);
    document.querySelectorAll('input[name="oluntir-new-project-type"]').forEach(input => input.addEventListener('change', () => {
      selectedProjectType = input.value;
      document.getElementById('oluntir-type-continue').disabled = false;
    }));
    document.getElementById('oluntir-type-back').addEventListener('click', () => showStep(currentInfo && currentInfo.exists ? 'oluntir-start-step-warning' : 'oluntir-start-step-start'));
    document.getElementById('oluntir-type-continue').addEventListener('click', () => { if (selectedProjectType) { renderSummary(); showStep('oluntir-start-step-summary'); } });
    document.getElementById('oluntir-summary-back').addEventListener('click', () => showStep('oluntir-start-step-type'));
    document.getElementById('oluntir-project-create').addEventListener('click', createProject);
    document.getElementById('oluntir-ended-reload').addEventListener('click', () => location.reload());
    openStartup();
  }

  window.OluntirStartup = { ready, appVersion: APP_VERSION, schemaVersion: STARTUP_SCHEMA, getStoredProjectInfo: storedProjectInfo, setMeta, endApplication };
  document.addEventListener('DOMContentLoaded', bind);
})();
