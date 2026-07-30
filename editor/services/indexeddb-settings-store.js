(() => {
  'use strict';
  const DB_NAME = 'oluntir-settings';
  const DB_VERSION = 1;
  const STORE = 'settings';
  let dbPromise;

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'key' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Einstellungsdatenbank konnte nicht geöffnet werden.'));
    });
    return dbPromise;
  }

  async function get(key, fallbackValue) {
    try {
      const db = await openDb();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const request = tx.objectStore(STORE).get(key);
        request.onsuccess = () => resolve(request.result ? request.result.value : fallbackValue);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('Oluntir-Einstellung konnte nicht gelesen werden:', error);
      return fallbackValue;
    }
  }

  async function set(key, value) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put({ key, value, updatedAt: new Date().toISOString() });
      tx.oncomplete = () => resolve(value);
      tx.onerror = () => reject(tx.error || new Error('Einstellung konnte nicht gespeichert werden.'));
      tx.onabort = () => reject(tx.error || new Error('Einstellungstransaktion wurde abgebrochen.'));
    });
  }

  async function merge(key, patch) {
    const current = await get(key, {});
    const next = Object.assign({}, current || {}, patch || {});
    return set(key, next);
  }

  window.OluntirSettingsStore = { get, set, merge, databaseName: DB_NAME, schemaVersion: DB_VERSION };
})();
