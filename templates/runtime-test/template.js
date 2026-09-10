(function () {
  'use strict';
  if (!window.OluntirTemplateRuntime) throw new Error('OluntirTemplateRuntime ist nicht geladen.');
  window.OluntirTemplateRuntime.define({
    schemaVersion: 1,
    id: 'runtime-test',
    label: '2.3.0 Runtime Test',
    version: '1.0.0',
    baseFramework: 'bs4',
    basePath: 'templates/runtime-test/',
    styles: ['css/template.css'],
    scripts: [],
    components: [
      {
        id: 'hero',
        label: 'Runtime Test · Hero',
        category: 'Template · Runtime Test',
        content: '<section class="oluntir-runtime-test-hero py-5"><div class="container"><h2>Oluntir 2.3.0 Template Runtime</h2><p>Dieser Baustein stammt vollständig aus templates/runtime-test.</p></div></section>'
      }
    ]
  });
})();
