(function () {
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
        'assets/css/pagebuilder-bs5.css'
      ],
      canvasScripts: [
        'frameworks/bootstrap5/js/bootstrap.bundle.min.js',
        'assets/js/pagebuilder-bs5-gallery.js'
      ],
      exportAssets: {
        css: ['assets/css/local-fonts.css', 'frameworks/bootstrap5/css/bootstrap.min.css', 'assets/css/pagebuilder-bs5.css'],
        js: ['frameworks/bootstrap5/js/bootstrap.bundle.min.js', 'assets/js/pagebuilder-bs5-gallery.js']
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
        'assets/css/pagebuilder-bs4.css'
      ],
      canvasScripts: [
        'plugins/site/js/jquery-3.4.1.min.js',
        'frameworks/bootstrap4/js/bootstrap.bundle.min.js'
      ],
      exportAssets: {
        css: ['assets/css/local-fonts.css', 'frameworks/bootstrap4/css/bootstrap.min.css', 'assets/css/pagebuilder-bs4.css'],
        js: ['plugins/site/js/jquery-3.4.1.min.js', 'frameworks/bootstrap4/js/bootstrap.bundle.min.js']
      }
    }
  };

  window.PAGEBUILDER_FRAMEWORKS = profiles;
  window.PAGEBUILDER_FRAMEWORK = profiles[current];
  window.setPageBuilderFramework = function (id) {
    if (!supported.includes(id)) throw new Error('Unbekanntes Frameworkprofil: ' + id);
    localStorage.setItem(STORAGE_KEY, id);
  };
})();
