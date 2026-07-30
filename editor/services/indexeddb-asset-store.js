(() => {
  'use strict';
  window.OluntirIndexedDbAssetStore = {
    get(path) { return typeof assetBlobs !== 'undefined' ? assetBlobs.get(path) || null : null; },
    has(path) { return typeof assetBlobs !== 'undefined' && assetBlobs.has(path); },
    entries() { return typeof assetBlobs !== 'undefined' ? Array.from(assetBlobs.entries()) : []; },
    async put(path, blob) {
      if (typeof registerUploadedAssetAtPathAsync !== 'function') throw new Error('Asset-Speicher ist nicht verfügbar.');
      return registerUploadedAssetAtPathAsync(blob, path);
    },
    async remove(path) {
      if (typeof removeUploadedAsset !== 'function') return 0;
      return removeUploadedAsset(path);
    },
    async getSetting(key) { return typeof getAssetSetting === 'function' ? getAssetSetting(key) : null; },
    async putSetting(key, value) { if (typeof putAssetSetting === 'function') return putAssetSetting(key, value); },
    async removeSingle(path) {
      if (typeof assetUrls !== 'undefined') { const url = assetUrls.get(path); if (url) { try { URL.revokeObjectURL(url); } catch (_) {} } assetUrls.delete(path); }
      if (typeof assetBlobs !== 'undefined') assetBlobs.delete(path);
      if (typeof deleteAssetBlobFromDb === 'function') await deleteAssetBlobFromDb(path);
    }
  };
})();
