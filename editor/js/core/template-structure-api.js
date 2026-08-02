(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirTemplateStructureApi = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const SCHEMA_VERSION = 2;

  function frameworkId(value) {
    const framework = value || (root && root.PAGEBUILDER_FRAMEWORK) || {};
    return String(framework.id || 'bs4').toLowerCase() === 'bs5' ? 'bs5' : 'bs4';
  }

  function normalizeWidth(width) {
    return width === 'container' ? 'container' : 'container-fluid';
  }

  function galleryRowClass(framework) {
    return frameworkId(framework) === 'bs5' ? 'row g-4 pb-gallery' : 'row pb-gallery';
  }

  function gallerySectionClass(framework) {
    return frameworkId(framework) === 'bs5' ? 'py-5 pb-gallery-section' : 'space-ptb py-5 pb-gallery-section';
  }

  function buildExistingLayoutGallery(options) {
    const cfg = options || {};
    return `<div class="${galleryRowClass(cfg.framework)}" ${cfg.galleryAttributes || ''}>${cfg.itemsHtml || ''}</div>`;
  }

  function buildNewGalleryArea(options) {
    const cfg = options || {};
    const width = normalizeWidth(cfg.width);
    const containerClasses = frameworkId(cfg.framework) === 'bs5' && width === 'container-fluid'
      ? 'container-fluid px-3 px-lg-4'
      : width;
    return `<section class="${gallerySectionClass(cfg.framework)}" data-oluntir-layout-area="gallery"><div class="${containerClasses}"><div class="${galleryRowClass(cfg.framework)}" ${cfg.galleryAttributes || ''}>${cfg.itemsHtml || ''}</div></div></section>`;
  }

  function createGalleryStructure(options) {
    const cfg = options || {};
    if (cfg.mode === 'new-area') return buildNewGalleryArea(cfg);
    return buildExistingLayoutGallery(cfg);
  }

  return Object.freeze({
    SCHEMA_VERSION,
    createGalleryStructure,
    buildExistingLayoutGallery,
    buildNewGalleryArea,
    normalizeWidth
  });
});
