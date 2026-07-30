(() => {
  'use strict';
  function create(editor) {
    let selector = null;
    const compatibility = window.OluntirGrapesCompatibility.check(editor);
    const adapter = {
      editor, compatibility,
      setImageSelector(value) { selector = value; },
      getAssets() { return editor.AssetManager.getAll(); },
      getModalElement() { return editor.Modal && editor.Modal.getContentEl ? editor.Modal.getContentEl() : null; },
      selfTest() {
        return { compatibility, selector: !!selector, command: !!editor.Commands.get('open-assets') };
      }
    };
    window.OluntirImageSelect.register(adapter);
    if (editor.Commands.get('open-assets') && typeof editor.Commands.remove === 'function') editor.Commands.remove('open-assets');
    editor.Commands.add('open-assets', {
      run(_editor, _sender, options) {
        if (!selector) throw new Error('Oluntir Image-Select ist nicht registriert.');
        selector.open(options || {}); return selector;
      },
      stop() { if (selector && selector.isOpen()) selector.close(); }
    });
    editor.Commands.add('oluntir-open-image-manager', {
      run() {
        if (!selector) throw new Error('Oluntir Image-Select ist nicht registriert.');
        selector.open({ source: 'toolbar' }); return selector;
      },
      stop() { if (selector && selector.isOpen()) selector.close(); }
    });
    try {
      if (editor.Panels && typeof editor.Panels.getButton === 'function' && typeof editor.Panels.addButton === 'function' && !editor.Panels.getButton('options', 'oluntir-image-manager')) {
        editor.Panels.addButton('options', {
          id: 'oluntir-image-manager',
          className: 'fa fa-picture-o',
          command: 'oluntir-open-image-manager',
          attributes: { title: 'Bildmanager öffnen', 'aria-label': 'Bildmanager öffnen' }
        });
      }
    } catch (error) { console.warn('Oluntir: Bildmanager-Schaltfläche konnte nicht registriert werden.', error); }
    return adapter;
  }
  window.OluntirGrapesAdapter = { create };
})();
