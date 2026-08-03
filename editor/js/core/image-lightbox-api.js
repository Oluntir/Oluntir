(() => {
  'use strict';
  const ATTR_ENABLED = 'data-oluntir-lightbox';
  const ATTR_GROUP = 'data-oluntir-lightbox-group';
  const ATTR_DOWNLOAD = 'data-oluntir-lightbox-download';
  const ATTR_CAPTION = 'data-oluntir-lightbox-caption';

  function tagName(component) {
    return String(component && component.get ? component.get('tagName') || '' : component && component.tagName || '').toLowerCase();
  }
  function attrs(component) {
    return component && component.getAttributes ? component.getAttributes() || {} : {};
  }
  function children(component) {
    if (!component || !component.components) return [];
    const collection = component.components();
    return collection && collection.models ? collection.models : [];
  }
  function resolveImageComponent(component) {
    if (!component) return null;
    if (tagName(component) === 'img') return component;
    const stack = children(component).slice();
    while (stack.length) {
      const candidate = stack.shift();
      if (tagName(candidate) === 'img') return candidate;
      stack.push(...children(candidate));
    }
    return null;
  }
  function flag(component, name) {
    const image = resolveImageComponent(component);
    return !!image && String(attrs(image)[name] || '').toLowerCase() === 'true';
  }
  function isEnabled(component) { return flag(component, ATTR_ENABLED); }
  function isDownloadEnabled(component) { return flag(component, ATTR_DOWNLOAD); }
  function isCaptionEnabled(component) { return flag(component, ATTR_CAPTION); }
  function apply(component, enabled, options = {}) {
    const image = resolveImageComponent(component);
    if (!image) return false;
    const patch = {};
    if (enabled) {
      patch[ATTR_ENABLED] = 'true';
      if (options.group) patch[ATTR_GROUP] = String(options.group);
      if (options.download) patch[ATTR_DOWNLOAD] = 'true';
      if (options.caption) patch[ATTR_CAPTION] = 'true';
    }
    const documentApi = window.OluntirDocumentApi;
    if (documentApi && typeof documentApi.updateAttributes === 'function') {
      const next = Object.assign({}, attrs(image));
      if (enabled) Object.assign(next, patch);
      else {
        delete next[ATTR_ENABLED];
        delete next[ATTR_GROUP];
        delete next[ATTR_DOWNLOAD];
        delete next[ATTR_CAPTION];
      }
      documentApi.updateAttributes(image, next, { label: 'image.lightbox', merge: false });
    } else if (enabled && image.addAttributes) {
      image.addAttributes(patch);
    } else if (!enabled && image.removeAttributes) {
      image.removeAttributes([ATTR_ENABLED, ATTR_GROUP, ATTR_DOWNLOAD, ATTR_CAPTION]);
    } else if (!enabled && image.addAttributes) {
      const next = Object.assign({}, attrs(image));
      delete next[ATTR_ENABLED]; delete next[ATTR_GROUP]; delete next[ATTR_DOWNLOAD]; delete next[ATTR_CAPTION];
      image.set && image.set('attributes', next);
    }
    return true;
  }
  function stableSource(image) {
    const a = attrs(image);
    return a['data-stable-path'] || a.src || '';
  }
  function bindEditorPreview(editor) {
    if (!editor || !editor.on) return;
    function bind() {
      let doc;
      try { doc = editor.Canvas.getDocument(); } catch (_) { return; }
      if (!doc || doc.__oluntirLightboxPreviewBound) return;
      doc.__oluntirLightboxPreviewBound = true;
      try { doc.documentElement.setAttribute('data-oluntir-editor-canvas', 'true'); } catch (_) {}
      doc.addEventListener('click', (event) => {
        const image = event.target && event.target.closest ? event.target.closest(`img[${ATTR_ENABLED}="true"]`) : null;
        if (!image) return;
        let previewActive = false;
        try { previewActive = !!(editor.Commands && editor.Commands.isActive && editor.Commands.isActive('preview')); } catch (_) {}
        if (!previewActive) return;
        event.preventDefault(); event.stopPropagation();
        const win = doc.defaultView;
        if (win && win.OluntirImageLightboxRuntime && typeof win.OluntirImageLightboxRuntime.open === 'function') {
          win.OluntirImageLightboxRuntime.open(image);
        }
      }, true);
    }
    editor.on('load', bind);
    editor.on('page', () => setTimeout(bind, 0));
  }
  window.OluntirImageLightboxApi = { ATTR_ENABLED, ATTR_GROUP, ATTR_DOWNLOAD, ATTR_CAPTION, resolveImageComponent, isEnabled, isDownloadEnabled, isCaptionEnabled, apply, stableSource, bindEditorPreview };
})();
