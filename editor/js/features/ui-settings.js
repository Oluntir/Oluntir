(function () {
  'use strict';

  const STORAGE_KEY = 'pagebuilder-ui-settings-v1';
  const DEFAULTS = { fontSize: 15, cardGap: 10, cardPadding: 11, scrollbarWidth: 12 };
  const PRESETS = {
    compact: { fontSize: 13, cardGap: 5, cardPadding: 8, scrollbarWidth: 10 },
    balanced: { fontSize: 15, cardGap: 10, cardPadding: 11, scrollbarWidth: 12 },
    comfortable: { fontSize: 17, cardGap: 15, cardPadding: 15, scrollbarWidth: 16 }
  };

  function normalise(value) {
    const source = Object.assign({}, DEFAULTS, value || {});
    return {
      fontSize: Math.min(18, Math.max(13, Number(source.fontSize) || DEFAULTS.fontSize)),
      cardGap: Math.min(18, Math.max(4, Number(source.cardGap) || DEFAULTS.cardGap)),
      cardPadding: Math.min(18, Math.max(7, Number(source.cardPadding) || DEFAULTS.cardPadding)),
      scrollbarWidth: Math.min(18, Math.max(8, Number(source.scrollbarWidth) || DEFAULTS.scrollbarWidth))
    };
  }

  function load() {
    try { return normalise(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')); }
    catch (_) { return Object.assign({}, DEFAULTS); }
  }

  function save(settings) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch (_) {}
  }

  function apply(settings) {
    const s = normalise(settings);
    const root = document.documentElement;
    root.style.setProperty('--pb-panel-font-size', s.fontSize + 'px');
    root.style.setProperty('--pb-block-gap', s.cardGap + 'px');
    root.style.setProperty('--pb-block-padding', s.cardPadding + 'px');
    root.style.setProperty('--pb-scrollbar-size', s.scrollbarWidth + 'px');
    document.body.dataset.pbUiDensity = s.cardGap <= 6 ? 'compact' : (s.cardGap >= 14 ? 'comfortable' : 'balanced');
    return s;
  }

  let current = apply(load());

  document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('pb-ui-settings');
    const openButton = document.getElementById('btn-ui-settings');
    if (!modal || !openButton) return;

    const controls = {
      fontSize: document.getElementById('ui-font-size'),
      cardGap: document.getElementById('ui-card-gap'),
      cardPadding: document.getElementById('ui-card-padding'),
      scrollbarWidth: document.getElementById('ui-scrollbar-width')
    };
    const outputs = {
      fontSize: document.getElementById('ui-font-size-output'),
      cardGap: document.getElementById('ui-card-gap-output'),
      cardPadding: document.getElementById('ui-card-padding-output'),
      scrollbarWidth: document.getElementById('ui-scrollbar-width-output')
    };

    function syncForm(settings) {
      current = normalise(settings);
      Object.keys(controls).forEach(function (key) {
        controls[key].value = current[key];
        outputs[key].textContent = current[key] + ' px';
      });
      document.querySelectorAll('[data-ui-preset]').forEach(function (button) {
        const preset = PRESETS[button.dataset.uiPreset];
        button.classList.toggle('active', preset && Object.keys(DEFAULTS).every(function (key) { return preset[key] === current[key]; }));
      });
    }

    function updateFromForm() {
      const next = {};
      Object.keys(controls).forEach(function (key) { next[key] = Number(controls[key].value); });
      current = apply(next);
      save(current);
      syncForm(current);
    }

    function close() {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
    }

    openButton.addEventListener('click', function () {
      syncForm(current);
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
    });
    document.getElementById('pb-ui-settings-close').addEventListener('click', close);
    document.getElementById('pb-ui-settings-done').addEventListener('click', close);
    document.getElementById('pb-ui-settings-reset').addEventListener('click', function () {
      current = apply(DEFAULTS); save(current); syncForm(current);
    });
    modal.addEventListener('click', function (event) { if (event.target === modal) close(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !modal.hidden) close(); });
    Object.keys(controls).forEach(function (key) { controls[key].addEventListener('input', updateFromForm); });
    document.querySelectorAll('[data-ui-preset]').forEach(function (button) {
      button.addEventListener('click', function () {
        current = apply(PRESETS[button.dataset.uiPreset]); save(current); syncForm(current);
      });
    });
    syncForm(current);
  });

  window.PageBuilderUISettings = { apply: apply, load: load, defaults: DEFAULTS, presets: PRESETS };
})();
