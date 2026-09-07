// Oluntir 2.2.1 – native HTML5-Video-Unterstützung für Bootstrap 4/5.
//
// Es wird bewusst KEINE eigene Oluntir-Video-Komponente erzeugt. Das Element bleibt
// ein normales <video>-Element mit <source>-Fallbacks. Diese kleine Editor-Brücke
// ergänzt lediglich die GrapesJS-Eigenschaften um getrennte WebM/MP4/Ogg-Quellen
// und hält Download-Fallback und Player-Vorschau synchron.
(function () {
  'use strict';

  const VIDEO_MARKER = 'data-oluntir-bootstrap-video';
  const SOURCE_MARKER = 'data-oluntir-video-source';
  const FALLBACK_MARKER = 'data-oluntir-video-fallback';
  const FORMATS = ['webm', 'mp4', 'ogg'];

  function attrs(component) {
    return component && typeof component.getAttributes === 'function' ? (component.getAttributes() || {}) : {};
  }

  function tag(component) {
    if (!component || !component.get) return '';
    return String(component.get('tagName') || '').toLowerCase();
  }

  function children(component) {
    if (!component || typeof component.components !== 'function') return [];
    const collection = component.components();
    if (!collection) return [];
    if (Array.isArray(collection)) return collection;
    if (Array.isArray(collection.models)) return collection.models;
    const result = [];
    if (typeof collection.forEach === 'function') collection.forEach(item => result.push(item));
    return result;
  }

  function visit(component, callback) {
    if (!component) return;
    callback(component);
    children(component).forEach(child => visit(child, callback));
  }

  function parent(component) {
    try { return component && typeof component.parent === 'function' ? component.parent() : null; } catch (_) { return null; }
  }

  function managedVideo(component) {
    let current = component;
    for (let depth = 0; current && depth < 8; depth += 1) {
      if (tag(current) === 'video' && attrs(current)[VIDEO_MARKER]) return current;
      current = parent(current);
    }
    return null;
  }

  function sourceFor(video, format) {
    let match = null;
    visit(video, component => {
      if (match || tag(component) !== 'source') return;
      const a = attrs(component);
      const marker = String(a[SOURCE_MARKER] || '').toLowerCase();
      const type = String(a.type || '').toLowerCase();
      if (marker === format || type === `video/${format}` || (format === 'ogg' && type === 'video/ogg')) match = component;
    });
    return match;
  }

  function fallbackLinks(video) {
    const links = [];
    let root = video;
    // Video -> responsive wrapper -> container. Drei Ebenen reichen für beide
    // Bootstrap-Markups und verhindern, dass fremde Links im Seitenbaum verändert werden.
    for (let depth = 0; root && depth < 3; depth += 1) root = parent(root) || root;
    visit(root || video, component => {
      if (tag(component) !== 'a') return;
      if (attrs(component)[FALLBACK_MARKER]) links.push(component);
    });
    return links;
  }

  function readSource(video, format) {
    const source = sourceFor(video, format);
    return source ? String(attrs(source).src || '') : '';
  }

  function writeSource(video, format, value) {
    const source = sourceFor(video, format);
    if (!source) return;
    const next = String(value || '').trim();
    if (next) source.addAttributes({ src: next });
    else if (typeof source.removeAttributes === 'function') source.removeAttributes('src');
    else source.addAttributes({ src: '' });
  }

  function refreshCanvasVideo(video) {
    window.setTimeout(() => {
      try {
        const view = video && typeof video.getView === 'function' ? video.getView() : null;
        const element = view && view.el;
        if (element && typeof element.load === 'function') element.load();
      } catch (_) { /* Vorschau-only */ }
    }, 0);
  }

  function syncFallback(video) {
    const preferred = String(video.get('oluntirVideoMp4') || video.get('oluntirVideoWebm') || video.get('oluntirVideoOgg') || '').trim();
    fallbackLinks(video).forEach(link => {
      if (preferred) link.addAttributes({ href: preferred, download: '' });
      else if (typeof link.removeAttributes === 'function') link.removeAttributes(['href', 'download']);
    });
  }

  function syncSources(editor, video) {
    FORMATS.forEach(format => writeSource(video, format, video.get(`oluntirVideo${format[0].toUpperCase()}${format.slice(1)}`)));
    syncFallback(video);
    refreshCanvasVideo(video);
    if (editor && typeof editor.trigger === 'function') editor.trigger('component:update', video);
  }

  function hydrateSourceProperties(video) {
    const values = {
      oluntirVideoWebm: readSource(video, 'webm'),
      oluntirVideoMp4: readSource(video, 'mp4'),
      oluntirVideoOgg: readSource(video, 'ogg')
    };
    Object.keys(values).forEach(name => {
      if (String(video.get(name) || '') !== values[name]) video.set(name, values[name], { silent: true });
    });
  }

  function configureTraits(editor, video) {
    if (!video || !video.set) return;
    hydrateSourceProperties(video);
    video.set('provider', 'so', { silent: true });
    video.set('traits', [
      { type: 'text', label: 'WebM-Quelle', name: 'oluntirVideoWebm', changeProp: true, placeholder: 'assets/media/video.webm' },
      { type: 'text', label: 'MP4-Quelle', name: 'oluntirVideoMp4', changeProp: true, placeholder: 'assets/media/video.mp4' },
      { type: 'text', label: 'Ogg-Quelle', name: 'oluntirVideoOgg', changeProp: true, placeholder: 'assets/media/video.ogv' },
      { type: 'text', label: 'Poster', name: 'poster', placeholder: 'assets/images/poster.jpg' },
      { type: 'select', label: 'Vorladen', name: 'preload', options: [
        { id: 'metadata', name: 'Metadaten' },
        { id: 'none', name: 'Nicht vorladen' },
        { id: 'auto', name: 'Automatisch' }
      ] },
      { type: 'checkbox', label: 'Steuerung', name: 'controls', changeProp: true },
      { type: 'checkbox', label: 'Stumm', name: 'muted', changeProp: true },
      { type: 'checkbox', label: 'Autoplay', name: 'autoplay', changeProp: true },
      { type: 'checkbox', label: 'Wiederholen', name: 'loop', changeProp: true }
    ]);

    if (!video.__oluntirBootstrapVideoBound) {
      video.__oluntirBootstrapVideoBound = true;
      const sync = () => syncSources(editor, video);
      video.on('change:oluntirVideoWebm change:oluntirVideoMp4 change:oluntirVideoOgg', sync);
    }
  }

  window.registerBootstrapVideoEditing = function (editor) {
    if (!editor || typeof editor.on !== 'function') return;
    const configure = component => {
      const video = managedVideo(component);
      if (video) configureTraits(editor, video);
    };
    editor.on('component:selected', configure);
    editor.on('component:add', component => {
      const video = managedVideo(component);
      if (video) window.setTimeout(() => configureTraits(editor, video), 0);
    });
  };
})();
