// Kontextabhängige Linkbearbeitung für GrapesJS.
// Link ist nicht immer Link:
// - Galerie-/Lightbox-Link: Bild inklusive responsive Varianten austauschen
// - Bootstrap-Button: Beschriftung und Linkattribute bearbeiten
// - normaler Textlink: Linktext und Linkattribute bearbeiten
(function () {
  'use strict';

  function tagNameOf(component) {
    return String(component && component.get && component.get('tagName') || '').toLowerCase();
  }

  function classStringOf(component) {
    const attrs = component && component.getAttributes ? component.getAttributes() : {};
    return String(attrs.class || '');
  }

  function hasClass(component, className) {
    return (` ${classStringOf(component)} `).includes(` ${className} `);
  }

  function closestLinkComponent(component) {
    let current = component;
    while (current) {
      if (tagNameOf(current) === 'a') return current;
      current = current.parent ? current.parent() : null;
    }
    return null;
  }

  function isGalleryLink(component) {
    return hasClass(component, 'portfolio-img');
  }

  function isBootstrapButton(component) {
    return classStringOf(component).split(/\s+/).some((name) => name === 'btn' || name.indexOf('btn-') === 0);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function pureTextContent(component) {
    const html = component && component.getInnerHTML ? component.getInnerHTML() : '';
    if (/<[a-z][\s\S]*>/i.test(html)) return null;
    const box = document.createElement('textarea');
    box.innerHTML = html;
    return box.value;
  }

  function findPositionContainer(component) {
    let current = component;
    while (current) {
      if (hasClass(current, 'position-relative')) return current;
      current = current.parent ? current.parent() : null;
    }
    return component && component.parent ? component.parent() : null;
  }

  function assetSource(asset) {
    if (!asset) return '';
    if (typeof asset.getSrc === 'function') return asset.getSrc() || '';
    return asset.get ? (asset.get('src') || '') : '';
  }

  function findDownloadPathForDesktop(desktopPath) {
    if (!desktopPath || (desktopPath.indexOf('assets/user_upload/desktop/') !== 0 && desktopPath.indexOf('images/uploads/desktop/') !== 0)) return desktopPath;
    const fileName = desktopPath.split('/').pop() || '';
    const stem = fileName.replace(/\.[^.]+$/, '');
    if (window.assetBlobs && typeof window.assetBlobs.keys === 'function') {
      const match = Array.from(window.assetBlobs.keys()).find((path) =>
        (path.indexOf('assets/user_upload/original/' + stem + '.') === 0 || path.indexOf('images/downloads/' + stem + '.') === 0)
      );
      if (match) return match;
    }
    return desktopPath;
  }

  function responsivePathsFrom(selectedUrl) {
    const url = String(selectedUrl || '').replace(/\\/g, '/');

    if (url.indexOf('assets/user_upload/desktop/') === 0 || url.indexOf('images/uploads/desktop/') === 0) {
      const isCurrent = url.indexOf('assets/user_upload/desktop/') === 0;
      const desktopRoot = isCurrent ? 'assets/user_upload/desktop/' : 'images/uploads/desktop/';
      const tabletRoot = isCurrent ? 'assets/user_upload/tablet/' : 'images/uploads/tablet/';
      const mobileRoot = isCurrent ? 'assets/user_upload/mobile/' : 'images/uploads/mobile/';
      return {
        desktop: url,
        tablet: url.replace(desktopRoot, tabletRoot),
        mobile: url.replace(desktopRoot, mobileRoot),
        download: findDownloadPathForDesktop(url),
      };
    }

    if (url.indexOf('assets/images/portfolio/grid-img/responsive/desktop/') === 0) {
      const name = url.split('/').pop();
      return {
        desktop: url,
        tablet: url.replace('/responsive/desktop/', '/responsive/tablet/'),
        mobile: url.replace('/responsive/desktop/', '/responsive/mobile/'),
        download: 'assets/images/portfolio/grid-img/' + name,
      };
    }

    return { desktop: url, tablet: url, mobile: url, download: url };
  }

  function pathAttributeUpdate(component, attribute, path, stableAttribute) {
    if (!component) return null;
    const attrs = {};
    attrs[attribute] = path;
    const remove = [];
    if (stableAttribute && path.indexOf('images/') === 0) attrs[stableAttribute] = path;
    else if (stableAttribute) remove.push(stableAttribute);
    return { component, attributes: attrs, remove };
  }

  function updateGalleryImage(editor, galleryLink, selectedUrl) {
    const paths = responsivePathsFrom(selectedUrl);
    const container = findPositionContainer(galleryLink);
    if (!container) throw new Error('Galeriecontainer wurde nicht gefunden.');

    const images = container.find ? container.find('img') : [];
    const sources = container.find ? container.find('source') : [];
    const downloads = container.find ? container.find('a.portfolio-download') : [];
    const image = images[0];

    if (!image) throw new Error('Im Galerieelement wurde kein Bild gefunden.');

    const updates = [pathAttributeUpdate(image, 'src', paths.desktop, 'data-stable-path')];

    sources.forEach((source) => {
      const media = String((source.getAttributes && source.getAttributes().media) || '');
      const path = media.indexOf('767.98px') >= 0 ? paths.mobile : paths.tablet;
      updates.push(pathAttributeUpdate(source, 'srcset', path, 'data-stable-srcset-path'));
    });

    updates.push(pathAttributeUpdate(galleryLink, 'href', paths.desktop, 'data-stable-path'));

    if (downloads[0]) {
      const downloadUpdate = pathAttributeUpdate(downloads[0], 'href', paths.download, 'data-stable-download-path');
      const name = paths.download.split('/').pop() || 'bild';
      downloadUpdate.attributes.download = name;
      downloadUpdate.attributes.title = 'Bild herunterladen';
      downloadUpdate.attributes['aria-label'] = 'Bild herunterladen';
      updates.push(downloadUpdate);
    }

    const validUpdates = updates.filter(Boolean);
    if (window.OluntirDocumentApi && typeof window.OluntirDocumentApi.updateAttributesBatch === 'function') {
      window.OluntirDocumentApi.updateAttributesBatch(validUpdates, { label: 'gallery.image.replace' });
    } else {
      validUpdates.forEach((entry) => {
        entry.component.addAttributes(entry.attributes);
        (entry.remove || []).forEach((name) => entry.component.removeAttributes && entry.component.removeAttributes(name));
      });
    }

    editor.select(galleryLink);
    validUpdates.forEach((entry) => editor.trigger('component:update', entry.component));
    editor.trigger('oluntir:history:changed');
    if (window.toast) window.toast('Galeriebild und Vergrößerung wurden aktualisiert.');
  }

  function openGalleryAssetManager(editor, galleryLink) {
    editor.select(galleryLink);
    editor.runCommand('open-assets', {
      types: ['image'],
      select(asset, complete) {
        const src = assetSource(asset);
        if (!src) return;
        updateGalleryImage(editor, galleryLink, src);
        if (complete !== false) editor.AssetManager.close();
      },
    });
  }

  function openLinkDialog(editor, linkComponent) {
    const attrs = linkComponent.getAttributes ? linkComponent.getAttributes() : {};
    const text = pureTextContent(linkComponent);
    const kind = isBootstrapButton(linkComponent) ? 'Bootstrap-Button' : 'Textlink';
    const modal = editor.Modal;

    const wrapper = document.createElement('div');
    wrapper.className = 'pb-link-dialog';
    wrapper.innerHTML = `
      <div style="display:grid;gap:12px;min-width:min(520px,80vw)">
        ${text !== null ? `<label>Linktext<input data-field="text" type="text" value="${escapeHtml(text)}" style="display:block;width:100%;margin-top:4px;padding:8px"></label>` : '<p style="margin:0">Der Link enthält weitere HTML-Elemente. Der sichtbare Inhalt bleibt deshalb unverändert.</p>'}
        <label>Linkziel<input data-field="href" type="text" value="${escapeHtml(attrs.href || '')}" placeholder="seite.html, https://…, mailto:…, tel:…" style="display:block;width:100%;margin-top:4px;padding:8px"></label>
        <label>Titel<input data-field="title" type="text" value="${escapeHtml(attrs.title || '')}" style="display:block;width:100%;margin-top:4px;padding:8px"></label>
        <label>Öffnen in
          <select data-field="target" style="display:block;width:100%;margin-top:4px;padding:8px">
            <option value=""${!attrs.target ? ' selected' : ''}>Gleiches Fenster</option>
            <option value="_blank"${attrs.target === '_blank' ? ' selected' : ''}>Neues Fenster</option>
          </select>
        </label>
        <label>rel<input data-field="rel" type="text" value="${escapeHtml(attrs.rel || '')}" placeholder="z. B. noopener noreferrer" style="display:block;width:100%;margin-top:4px;padding:8px"></label>
        <label style="display:flex;align-items:center;gap:8px"><input data-field="download" type="checkbox"${Object.prototype.hasOwnProperty.call(attrs, 'download') ? ' checked' : ''}> Als Download behandeln</label>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px">
          <button type="button" data-action="cancel" style="padding:8px 14px">Abbrechen</button>
          <button type="button" data-action="save" style="padding:8px 14px">Übernehmen</button>
        </div>
      </div>`;

    wrapper.querySelector('[data-action="cancel"]').addEventListener('click', () => modal.close());
    wrapper.querySelector('[data-action="save"]').addEventListener('click', () => {
      const value = (name) => wrapper.querySelector(`[data-field="${name}"]`)?.value || '';
      const newAttrs = { href: value('href') || '#', title: value('title') };
      const target = value('target');
      const rel = value('rel');
      if (target) newAttrs.target = target;
      if (rel) newAttrs.rel = rel;
      if (wrapper.querySelector('[data-field="download"]')?.checked) newAttrs.download = '';
      linkComponent.addAttributes(newAttrs);
      ['target', 'rel', 'download'].forEach((name) => {
        if (!Object.prototype.hasOwnProperty.call(newAttrs, name) && linkComponent.removeAttributes) linkComponent.removeAttributes(name);
      });
      if (text !== null) {
        const newText = value('text');
        linkComponent.components(escapeHtml(newText));
      }
      modal.close();
      editor.select(linkComponent);
      if (window.toast) window.toast(`${kind} wurde aktualisiert.`);
    });

    modal.setTitle(kind + ' bearbeiten');
    modal.setContent(wrapper);
    modal.open();
  }

  function toolbarFor(link) {
    const gallery = isGalleryLink(link);
    return [
      {
        attributes: {
          class: gallery ? 'fa fa-image' : 'fa fa-link',
          title: gallery ? 'Galeriebild austauschen' : 'Link bearbeiten',
        },
        command(editor) {
          const selected = closestLinkComponent(editor.getSelected());
          if (!selected) return;
          if (isGalleryLink(selected)) openGalleryAssetManager(editor, selected);
          else openLinkDialog(editor, selected);
        },
      },
      { command: 'tlb-move', attributes: { class: 'fa fa-arrows', title: 'Verschieben' } },
      { command: 'tlb-clone', attributes: { class: 'fa fa-clone', title: 'Duplizieren' } },
      { command: 'tlb-delete', attributes: { class: 'fa fa-trash-o', title: 'Entfernen' } },
    ];
  }

  window.registerSmartLinkEditing = function registerSmartLinkEditing(editor) {
    editor.on('component:selected', (component) => {
      const link = closestLinkComponent(component);
      if (!link) return;
      link.set('toolbar', toolbarFor(link));
    });

    function bindCanvasDblClick() {
      const doc = editor.Canvas.getDocument();
      if (!doc || doc.__pageBuilderSmartLinksBound) return;
      doc.__pageBuilderSmartLinksBound = true;
      doc.addEventListener('dblclick', (event) => {
        const anchor = event.target && event.target.closest ? event.target.closest('a') : null;
        if (!anchor) return;
        event.preventDefault();
        event.stopPropagation();

        let component = null;
        try {
          const dc = editor.getModel().get('DomComponents');
          if (dc && typeof dc.getComponent === 'function') component = dc.getComponent(anchor);
        } catch (e) { /* Fallback unten */ }

        component = closestLinkComponent(component || editor.getSelected());
        if (!component) return;
        editor.select(component);
        if (isGalleryLink(component)) openGalleryAssetManager(editor, component);
        else openLinkDialog(editor, component);
      }, true);
    }

    editor.on('load', bindCanvasDblClick);
    editor.on('page', () => setTimeout(bindCanvasDblClick, 0));
  };
})();
