(function (root, factory) {
  const api = factory(root || globalThis);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirExportReadiness = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const VERSION = 1;
  const BUTTON_IDS = ['btn-export-folder', 'btn-export-zip', 'btn-export-tar'];
  let activePromise = null;
  let state = Object.freeze({ ready: true, preparing: false, locked: false, pending: Object.freeze([]), lastPreparedAt: null, lastDurationMs: 0, error: null });
  const buttonState = new Map();

  const now = () => (root.performance && typeof root.performance.now === 'function' ? root.performance.now() : Date.now());
  const freeze = value => Object.freeze(value);
  const wait = ms => new Promise(resolve => root.setTimeout(resolve, ms));
  const nextFrame = () => new Promise(resolve => {
    if (typeof root.requestAnimationFrame === 'function') root.requestAnimationFrame(() => resolve());
    else root.setTimeout(resolve, 0);
  });

  function updateState(patch) {
    state = freeze(Object.assign({}, state, patch, { pending: freeze(Array.isArray(patch && patch.pending) ? patch.pending.slice() : Array.from(state.pending || [])) }));
    return state;
  }

  function getButtons() {
    if (!root.document) return [];
    return BUTTON_IDS.map(id => root.document.getElementById(id)).filter(Boolean);
  }

  function lockControls(message) {
    getButtons().forEach(button => {
      if (!buttonState.has(button)) buttonState.set(button, { disabled: Boolean(button.disabled), title: button.title || '', text: button.textContent || '' });
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      button.title = message || 'Export wird vorbereitet …';
    });
    updateState({ locked: true });
  }

  function releaseControls() {
    getButtons().forEach(button => {
      const original = buttonState.get(button);
      if (original) {
        button.disabled = original.disabled;
        button.title = original.title;
      } else {
        button.disabled = false;
      }
      button.removeAttribute('aria-busy');
    });
    buttonState.clear();
    updateState({ locked: false });
  }

  async function emit(type, payload) {
    const runtime = root.OluntirRuntimeActions;
    if (!runtime || typeof runtime.emit !== 'function') return null;
    return runtime.emit(type, payload || {});
  }

  async function finishRichTextEditing(editor, pending) {
    const active = typeof root.OluntirIsRichTextEditing === 'function' && root.OluntirIsRichTextEditing();
    if (!active) return;
    pending.push('active-rte');
    let settled = false;
    let listener = null;
    const completed = new Promise(resolve => {
      listener = () => { settled = true; resolve(); };
      if (editor && typeof editor.once === 'function') editor.once('rte:disable', listener);
      root.setTimeout(resolve, 750);
    });
    try {
      const doc = editor && editor.Canvas && editor.Canvas.getDocument ? editor.Canvas.getDocument() : null;
      const activeElement = doc && doc.activeElement;
      if (activeElement && typeof activeElement.blur === 'function') activeElement.blur();
      if (editor && editor.RichTextEditor && typeof editor.RichTextEditor.disable === 'function') editor.RichTextEditor.disable();
      else if (root.document && root.document.activeElement && typeof root.document.activeElement.blur === 'function') root.document.activeElement.blur();
    } catch (_) { /* Best effort; readiness verifies the state afterwards. */ }
    await completed;
    await nextFrame();
    if (!settled && typeof root.OluntirIsRichTextEditing === 'function' && root.OluntirIsRichTextEditing()) {
      throw new Error('EXPORT_READINESS_RTE_ACTIVE');
    }
  }

  async function waitForActions(pending, timeoutMs) {
    const runtime = root.OluntirRuntimeActions;
    const engine = runtime && typeof runtime.getEngine === 'function' ? runtime.getEngine() : null;
    if (!engine) return;
    pending.push('action-engine');
    const started = now();
    while (now() - started < timeoutMs) {
      const engineState = typeof engine.getState === 'function' ? engine.getState() : {};
      const metrics = typeof engine.getMetrics === 'function' ? engine.getMetrics() : {};
      const completed = Number(metrics.completed || 0) + Number(metrics.failed || 0) + Number(metrics.cancelled || 0);
      const idle = !engineState.processing && Number(engineState.queueLength || 0) === 0 && Number(metrics.dispatched || 0) <= completed;
      if (idle) return;
      await wait(10);
    }
    throw new Error('EXPORT_READINESS_ACTION_TIMEOUT');
  }

  function verify(editor, snapshot) {
    const pending = [];
    if (typeof root.OluntirIsRichTextEditing === 'function' && root.OluntirIsRichTextEditing()) pending.push('active-rte');
    if (!snapshot || !snapshot.snapshotId) pending.push('snapshot-missing');
    if (!snapshot || !Array.isArray(snapshot.pages) || !snapshot.pages.length) pending.push('no-pages');
    if (!editor || !editor.Pages || !editor.Pages.getAll || !editor.Pages.getAll().length) pending.push('no-pages');
    return freeze({ ready: pending.length === 0, pending: freeze(Array.from(new Set(pending))) });
  }

  async function prepare(editor, options) {
    if (activePromise) return activePromise;
    const started = now();
    lockControls('Export wird vorbereitet …');
    updateState({ ready: false, preparing: true, pending: ['initializing'], error: null });
    activePromise = (async () => {
      const pending = [];
      try {
        await emit('export.prepare', { mode: options && options.mode || null });
        await finishRichTextEditing(editor, pending);
        await waitForActions(pending, Number(options && options.timeoutMs) || 2500);
        pending.push('export-snapshot');
        const snapshotApi = root.OluntirExportSnapshot;
        if (!snapshotApi || typeof snapshotApi.create !== 'function') throw new Error('EXPORT_SNAPSHOT_SERVICE_MISSING');
        const snapshot = await snapshotApi.create(editor, { timeoutMs: Number(options && options.assetTimeoutMs) || 10000 });
        const verification = verify(editor, snapshot);
        if (!verification.ready) throw new Error('EXPORT_SNAPSHOT_INVALID:' + verification.pending.join(','));
        const durationMs = now() - started;
        updateState({ ready: true, preparing: false, pending: [], lastPreparedAt: new Date().toISOString(), lastDurationMs: durationMs, error: null, snapshotId: snapshot.snapshotId });
        await emit('export.ready', { mode: options && options.mode || null, durationMs, snapshotId: snapshot.snapshotId });
        return snapshot;
      } catch (error) {
        updateState({ ready: false, preparing: false, pending, lastDurationMs: now() - started, error: error && error.message ? error.message : String(error) });
        await emit('export.failed', { stage: 'prepare', message: state.error });
        releaseControls();
        throw error;
      } finally {
        activePromise = null;
      }
    })();
    return activePromise;
  }

  function release() {
    releaseControls();
    return state;
  }

  function getState() { return state; }

  return freeze({ VERSION, prepare, verify, release, getState, lockControls, releaseControls });
});
