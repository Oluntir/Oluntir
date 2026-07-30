(() => {
  'use strict';
  function parse(value) { return String(value || '0').split('.').map((v) => parseInt(v, 10) || 0); }
  function compare(a, b) {
    const aa = parse(a); const bb = parse(b);
    for (let i = 0; i < Math.max(aa.length, bb.length); i++) {
      const d = (aa[i] || 0) - (bb[i] || 0); if (d) return d;
    }
    return 0;
  }
  window.OluntirGrapesCompatibility = {
    check(editor) {
      const cfg = (window.OLUNTIR_EDITOR_DEPENDENCIES || {}).grapesjs || {};
      const version = window.grapesjs && window.grapesjs.version ? window.grapesjs.version : 'unknown';
      const result = {
        version,
        minimum: cfg.minimum || '0.0.0',
        tested: cfg.tested || version,
        supported: version !== 'unknown' && compare(version, cfg.minimum || '0.0.0') >= 0,
        testedVersion: version === (cfg.tested || version),
        api: {
          commands: !!(editor && editor.Commands),
          modal: !!(editor && editor.Modal),
          assets: !!(editor && editor.AssetManager),
          pages: !!(editor && editor.Pages)
        }
      };
      result.apiComplete = Object.keys(result.api).every((key) => result.api[key]);
      if (!result.supported || !result.apiComplete) console.error('Oluntir: GrapesJS-Kompatibilitätsprüfung fehlgeschlagen.', result);
      else if (!result.testedVersion) console.warn(`Oluntir: GrapesJS ${version} ist kompatibel, aber nicht die getestete Version ${result.tested}.`);
      return result;
    }
  };
})();
