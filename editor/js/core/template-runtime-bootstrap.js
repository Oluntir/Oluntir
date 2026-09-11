(function () {
  'use strict';
  if (!window.OluntirTemplateRuntime) return;

  function missingMessage(missing) {
    const names = missing.map(item => `„${item.label || item.id}“`).join(', ');
    return `Registriertes Template nicht gefunden: ${names}.\n\nDer Template-Ordner wurde vermutlich außerhalb von Oluntir gelöscht. Das Template bleibt vorerst registriert und kann später wiederhergestellt oder über die Template-Verwaltung aus der Liste entfernt werden.`;
  }

  function loadFreshRegistry() {
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = `templates/registry.js?oluntir=${Date.now()}`;
      script.async = false;
      script.onload = () => resolve(window.OLUNTIR_TEMPLATE_REGISTRY || { schemaVersion: 1, templates: [] });
      script.onerror = () => {
        console.warn('Oluntir Template Registry konnte nicht frisch geladen werden; verwende vorhandenen Registry-Zustand.');
        resolve(window.OLUNTIR_TEMPLATE_REGISTRY || { schemaVersion: 1, templates: [] });
      };
      (document.head || document.documentElement).appendChild(script);
    });
  }

  window.OluntirTemplateRuntimeReady = loadFreshRegistry()
    .then(registry => window.OluntirTemplateRuntime.initialize(registry))
    .then(result => {
      if (!result.missing.length) return result;
      const notify = () => window.alert(missingMessage(result.missing));
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', notify, { once: true });
      else window.setTimeout(notify, 0);
      return result;
    })
    .catch(error => {
      console.warn('Oluntir Template Registry konnte nicht initialisiert werden:', error);
      return { loaded: [], missing: [] };
    });
})();
