(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirPreviewApi = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';
  const SCHEMA_VERSION = 1;
  let restore = null;
  let timer = null;
  let generation = 0;

  function cancelPending() {
    generation += 1;
    if (timer) clearTimeout(timer);
    timer = null;
  }

  function clear() {
    cancelPending();
    if (restore) restore();
    restore = null;
  }

  function showSlot(slot, options) {
    const cfg = Object.assign({ delayMs: 180, behavior: 'smooth', forceScroll: false }, options || {});
    cancelPending();
    const token = generation;
    return new Promise(resolve => {
      const run = () => {
        if (token !== generation) return resolve(false);
        const docApi = root && root.OluntirDocumentApi;
        const adapter = root && root.OluntirGrapes;
        if (!slot || !docApi) return resolve(false);
        const validForInsert = typeof docApi.validateTarget === 'function' && docApi.validateTarget(slot);
        const validForPreview = typeof docApi.canPreviewTarget === 'function' && docApi.canPreviewTarget(slot);
        if (!validForInsert && !validForPreview) return resolve(false);
        if (restore) restore();
        restore = null;
        if (adapter && typeof adapter.scrollInsertionTarget === 'function') {
          adapter.scrollInsertionTarget(slot, { behavior: cfg.behavior, force: cfg.forceScroll });
        }
        const paint = () => {
          if (token !== generation) return resolve(false);
          if (typeof docApi.highlightTarget === 'function') restore = docApi.highlightTarget(slot);
          resolve(true);
        };
        if (root && typeof root.requestAnimationFrame === 'function') root.requestAnimationFrame(() => root.requestAnimationFrame(paint));
        else setTimeout(paint, 0);
      };
      if (cfg.delayMs > 0) timer = setTimeout(run, cfg.delayMs); else run();
    });
  }

  function scrollTo(slot, options) {
    return showSlot(slot, Object.assign({}, options || {}, { delayMs: 0, forceScroll: true }));
  }

  function getState() {
    return Object.freeze({ schemaVersion: SCHEMA_VERSION, pending: Boolean(timer), active: Boolean(restore), generation });
  }

  return Object.freeze({ SCHEMA_VERSION, showSlot, scrollTo, clear, cancelPending, getState });
});
