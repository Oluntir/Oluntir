(function () {
  'use strict';
  const STORAGE_KEY = 'pagebuilder-framework';
  const supported = ['bs5', 'bs4'];
  const stored = localStorage.getItem(STORAGE_KEY);
  const current = supported.includes(stored) ? stored : 'bs5';

  const profiles = {
    bs5: {
      id: 'bs5',
      label: 'Bootstrap 5.3.8 – Community Edition',
      version: '5.3.8',
      channel: 'stable',
      storageKey: 'pagebuilder-project-bs5',
      distribution: 'community',
      template: 'neutral-components',
      canvasStyles: [
        'assets/css/local-fonts.css',
        'frameworks/bootstrap5/css/bootstrap.min.css',
        'plugins/site/css/font-awesome/all.min.css',
        'assets/css/pagebuilder-bs5.css?v=1.3.0',
        'assets/css/oluntir-image-lightbox.css'
      ],
      canvasScripts: [
        'frameworks/bootstrap5/js/bootstrap.bundle.min.js',
        'assets/js/pagebuilder-bs5-gallery.js',
        'assets/js/oluntir-image-lightbox.js'
      ],
      exportAssets: {
        css: ['assets/css/local-fonts.css', 'frameworks/bootstrap5/css/bootstrap.min.css', 'plugins/site/css/font-awesome/all.min.css', 'assets/css/pagebuilder-bs5.css', 'assets/css/oluntir-image-lightbox.css'],
        js: ['frameworks/bootstrap5/js/bootstrap.bundle.min.js', 'assets/js/pagebuilder-bs5-gallery.js', 'assets/js/oluntir-image-lightbox.js']
      }
    },
    bs4: {
      id: 'bs4',
      label: 'Bootstrap 4.6.2 – Community Edition',
      version: '4.6.2',
      channel: 'stable-eol',
      storageKey: 'pagebuilder-project-bs4',
      distribution: 'community',
      template: 'neutral-components',
      canvasStyles: [
        'assets/css/local-fonts.css',
        'frameworks/bootstrap4/css/bootstrap.min.css',
        'plugins/editor/font-awesome/css/font-awesome.min.css',
        'assets/css/pagebuilder-bs4.css?v=1.3.0',
        'assets/css/oluntir-image-lightbox.css'
      ],
      canvasScripts: [
        'plugins/site/js/jquery-3.4.1.min.js',
        'frameworks/bootstrap4/js/bootstrap.bundle.min.js',
        'assets/js/pagebuilder-bs4-gallery.js',
        'assets/js/oluntir-image-lightbox.js'
      ],
      exportAssets: {
        css: ['assets/css/local-fonts.css', 'frameworks/bootstrap4/css/bootstrap.min.css', 'plugins/editor/font-awesome/css/font-awesome.min.css', 'assets/css/pagebuilder-bs4.css', 'assets/css/oluntir-image-lightbox.css'],
        js: ['plugins/site/js/jquery-3.4.1.min.js', 'frameworks/bootstrap4/js/bootstrap.bundle.min.js', 'assets/js/pagebuilder-bs4-gallery.js', 'assets/js/oluntir-image-lightbox.js']
      }
    }
  };

  function refreshFrameworkProfiles() {
    window.PAGEBUILDER_FRAMEWORKS = window.OluntirSourcePackageBridge
      ? window.OluntirSourcePackageBridge.extendProfiles(profiles)
      : profiles;
    const available = window.PAGEBUILDER_FRAMEWORKS;
    const selected = localStorage.getItem(STORAGE_KEY);
    window.PAGEBUILDER_FRAMEWORK = available[selected] || available[current] || available.bs5;
    return available;
  }

  refreshFrameworkProfiles();
  window.OluntirFrameworkReady = (async function () {
    if (window.OluntirSourcePackageBridge && typeof window.OluntirSourcePackageBridge.discover === 'function') {
      try { await window.OluntirSourcePackageBridge.discover(); }
      catch (error) { console.warn('Source Packages konnten beim Start nicht entdeckt werden:', error); }
      refreshFrameworkProfiles();
    }
    return window.PAGEBUILDER_FRAMEWORK;
  })();
  window.setPageBuilderFramework = function (id) {
    if (!window.PAGEBUILDER_FRAMEWORKS[id]) throw new Error('Unbekanntes Frameworkprofil: ' + id);
    localStorage.setItem(STORAGE_KEY, id);
  };
})();
