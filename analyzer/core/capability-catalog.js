(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirAnalyzerCapabilityCatalog = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const SCHEMA_VERSION = 1;

  const CAPABILITIES = Object.freeze({
    navigation: Object.freeze({ id: 'navigation', domain: 'structure' }),
    expandableNavigation: Object.freeze({ id: 'navigation.expandable', domain: 'interaction' }),
    imageCollection: Object.freeze({ id: 'media.image-collection', domain: 'content' }),
    lightbox: Object.freeze({ id: 'media.lightbox', domain: 'interaction' }),
    caption: Object.freeze({ id: 'media.caption', domain: 'content' }),
    download: Object.freeze({ id: 'asset.download', domain: 'asset' }),
    lazyLoading: Object.freeze({ id: 'asset.lazy-loading', domain: 'asset' }),
    repeat: Object.freeze({ id: 'structure.repeat', domain: 'structure' }),
    sharedContent: Object.freeze({ id: 'structure.shared-content', domain: 'structure' }),
    carousel: Object.freeze({ id: 'interaction.carousel', domain: 'interaction' }),
    tabs: Object.freeze({ id: 'interaction.tabs', domain: 'interaction' }),
    accordion: Object.freeze({ id: 'interaction.accordion', domain: 'interaction' }),
    modal: Object.freeze({ id: 'interaction.modal', domain: 'interaction' }),
    form: Object.freeze({ id: 'content.form', domain: 'content' })
  });

  const FORBIDDEN_COMPONENT_IDS = Object.freeze([
    'oluntir-gallery',
    'oluntir-hero',
    'oluntir-slider',
    'oluntir-card'
  ]);

  function all() {
    return Object.keys(CAPABILITIES).map(key => CAPABILITIES[key]);
  }

  function get(id) {
    const normalized = String(id || '').trim().toLowerCase();
    return all().find(item => item.id === normalized) || null;
  }

  function isFrameworkNeutral(id) {
    const normalized = String(id || '').trim().toLowerCase();
    if (!normalized) return false;
    return !/bootstrap|grapesjs|oluntir-gallery/.test(normalized);
  }

  return Object.freeze({
    SCHEMA_VERSION,
    CAPABILITIES,
    FORBIDDEN_COMPONENT_IDS,
    all,
    get,
    isFrameworkNeutral
  });
});
