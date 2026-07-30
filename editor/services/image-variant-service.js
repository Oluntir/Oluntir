(() => {
  'use strict';
  const PREFIXES = ['assets/user_upload/', 'images/uploads/', 'images/downloads/'];
  function isUserPath(path) { return PREFIXES.some((prefix) => String(path || '').startsWith(prefix)); }
  function describe(path) {
    const value = String(path || '');
    let match = value.match(/^(assets\/user_upload|images\/uploads)\/(desktop|tablet|mobile)\/([^/]+)$/i);
    if (match) {
      const type = match[2].toLowerCase();
      return { type, label: type === 'desktop' ? 'Desktop' : type === 'tablet' ? 'Tablet' : 'Mobil', group: `${match[1]}:${match[3].replace(/\.[^.]+$/, '')}`, user: true };
    }
    match = value.match(/^(assets\/user_upload\/original|images\/downloads)\/([^/]+)$/i);
    if (match) {
      const family = match[1].startsWith('assets/') ? 'assets/user_upload' : 'images/uploads';
      return { type: 'original', label: 'Original', group: `${family}:${match[2].replace(/\.[^.]+$/, '')}`, user: true };
    }
    return { type: 'single', label: 'Einzelbild', group: value, user: isUserPath(value) };
  }
  function related(path) { return typeof getRelatedResponsiveAssetPaths === 'function' ? getRelatedResponsiveAssetPaths(path) : [path]; }
  function priority(type) { return ({ desktop: 4, original: 3, tablet: 2, mobile: 1, single: 4 })[type] || 0; }
  window.OluntirImageVariantService = { isUserPath, describe, related, priority };
})();
