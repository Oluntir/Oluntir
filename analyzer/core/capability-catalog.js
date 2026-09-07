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
    video: Object.freeze({ id: 'media.video', domain: 'content' }),
    download: Object.freeze({ id: 'asset.download', domain: 'asset' }),
    lazyLoading: Object.freeze({ id: 'asset.lazy-loading', domain: 'asset' }),
    repeat: Object.freeze({ id: 'structure.repeat', domain: 'structure' }),
    sharedContent: Object.freeze({ id: 'structure.shared-content', domain: 'structure' }),
    carousel: Object.freeze({ id: 'interaction.carousel', domain: 'interaction' }),
    tabs: Object.freeze({ id: 'interaction.tabs', domain: 'interaction' }),
    accordion: Object.freeze({ id: 'interaction.accordion', domain: 'interaction' }),
    collapse: Object.freeze({ id: 'interaction.collapse', domain: 'interaction' }),
    dropdown: Object.freeze({ id: 'interaction.dropdown', domain: 'interaction' }),
    modal: Object.freeze({ id: 'interaction.modal', domain: 'interaction' }),
    offcanvas: Object.freeze({ id: 'interaction.offcanvas', domain: 'interaction' }),
    toast: Object.freeze({ id: 'interaction.toast', domain: 'interaction' }),
    tooltip: Object.freeze({ id: 'interaction.tooltip', domain: 'interaction' }),
    popover: Object.freeze({ id: 'interaction.popover', domain: 'interaction' }),
    card: Object.freeze({ id: 'content.card', domain: 'content' }),
    listGroup: Object.freeze({ id: 'content.list-group', domain: 'content' }),
    jumbotron: Object.freeze({ id: 'content.jumbotron', domain: 'content' }),
    mediaObject: Object.freeze({ id: 'content.media-object', domain: 'content' }),
    progress: Object.freeze({ id: 'content.progress', domain: 'content' }),
    breadcrumb: Object.freeze({ id: 'navigation.breadcrumb', domain: 'structure' }),
    pagination: Object.freeze({ id: 'navigation.pagination', domain: 'structure' }),
    form: Object.freeze({ id: 'content.form', domain: 'content' }),
    customFormControls: Object.freeze({ id: 'content.form.custom-controls', domain: 'content' })
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
