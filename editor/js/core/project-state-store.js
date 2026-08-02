(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirProjectStateStore = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const SCHEMA_VERSION = 1;
  const STORE_LAYOUT_VERSION = 1;
  const DEFAULT_OPTIONS = Object.freeze({
    maxTransactions: 500,
    maxJournalBytes: 4 * 1024 * 1024,
    checkpointEvery: 50
  });

  function clone(value) {
    if (value === undefined) return undefined;
    return JSON.parse(JSON.stringify(value));
  }

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  function freezeClone(value) { return deepFreeze(clone(value)); }
  function text(value) { return value === null || value === undefined ? '' : String(value).trim(); }
  function now() { return new Date().toISOString(); }

  function uuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID().replace(/-/g, '');
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (character) {
      const random = Math.random() * 16 | 0;
      return (character === 'x' ? random : (random & 3 | 8)).toString(16);
    });
  }

  function stableStringify(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
    return '{' + Object.keys(value).sort().map(function (key) {
      return JSON.stringify(key) + ':' + stableStringify(value[key]);
    }).join(',') + '}';
  }

  function hashValue(value) {
    const input = stableStringify(value);
    let hash = 2166136261;
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
  }

  function byteSize(value) {
    const serialized = stableStringify(value);
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(serialized).length;
    return unescape(encodeURIComponent(serialized)).length;
  }

  function pathParts(path) {
    if (Array.isArray(path)) return path.map(text).filter(Boolean);
    return text(path).split('.').map(text).filter(Boolean);
  }

  function getAtPath(target, path) {
    const parts = pathParts(path);
    let current = target;
    for (let index = 0; index < parts.length; index += 1) {
      if (current === null || current === undefined) return undefined;
      current = current[parts[index]];
    }
    return current;
  }

  function ensureParent(target, path) {
    const parts = pathParts(path);
    if (!parts.length) throw createError('PROJECT_STORE_PATH_REQUIRED', 'Ein Zustandspfad ist erforderlich.');
    let current = target;
    for (let index = 0; index < parts.length - 1; index += 1) {
      const key = parts[index];
      if (!current[key] || typeof current[key] !== 'object') current[key] = {};
      current = current[key];
    }
    return { parent: current, key: parts[parts.length - 1] };
  }

  function setAtPath(target, path, value) {
    const location = ensureParent(target, path);
    location.parent[location.key] = clone(value);
  }

  function deleteAtPath(target, path) {
    const location = ensureParent(target, path);
    delete location.parent[location.key];
  }

  function createError(code, message, details) {
    const error = new Error(message);
    error.code = code;
    if (details !== undefined) error.details = freezeClone(details);
    return error;
  }

  function normalizeOptions(options) {
    const input = options || {};
    return {
      maxTransactions: Math.max(1, Number(input.maxTransactions || DEFAULT_OPTIONS.maxTransactions)),
      maxJournalBytes: Math.max(1024, Number(input.maxJournalBytes || DEFAULT_OPTIONS.maxJournalBytes)),
      checkpointEvery: Math.max(1, Number(input.checkpointEvery || DEFAULT_OPTIONS.checkpointEvery))
    };
  }

  function defaultOperationContracts() {
    return {
      'state.set': {
        validate: function (operation) {
          if (!pathParts(operation.path).length) throw createError('PROJECT_STORE_OPERATION_PATH_REQUIRED', 'state.set benötigt einen Pfad.');
        },
        apply: function (state, operation) { setAtPath(state, operation.path, operation.after); },
        revert: function (state, operation) {
          if (operation.beforeExists === false) deleteAtPath(state, operation.path);
          else setAtPath(state, operation.path, operation.before);
        }
      },
      'state.delete': {
        validate: function (operation) {
          if (!pathParts(operation.path).length) throw createError('PROJECT_STORE_OPERATION_PATH_REQUIRED', 'state.delete benötigt einen Pfad.');
        },
        apply: function (state, operation) { deleteAtPath(state, operation.path); },
        revert: function (state, operation) { setAtPath(state, operation.path, operation.before); }
      },
      'collection.insert': {
        validate: function (operation) {
          if (!pathParts(operation.path).length) throw createError('PROJECT_STORE_OPERATION_PATH_REQUIRED', 'collection.insert benötigt einen Pfad.');
          if (!Number.isInteger(operation.index) || operation.index < 0) throw createError('PROJECT_STORE_OPERATION_INDEX_INVALID', 'collection.insert benötigt einen gültigen Index.');
        },
        apply: function (state, operation) {
          const collection = getAtPath(state, operation.path);
          if (!Array.isArray(collection)) throw createError('PROJECT_STORE_COLLECTION_REQUIRED', 'Der Zielpfad ist keine Collection.', operation.path);
          collection.splice(operation.index, 0, clone(operation.value));
        },
        revert: function (state, operation) {
          const collection = getAtPath(state, operation.path);
          if (!Array.isArray(collection)) throw createError('PROJECT_STORE_COLLECTION_REQUIRED', 'Der Zielpfad ist keine Collection.', operation.path);
          collection.splice(operation.index, 1);
        }
      },
      'collection.remove': {
        validate: function (operation) {
          if (!pathParts(operation.path).length) throw createError('PROJECT_STORE_OPERATION_PATH_REQUIRED', 'collection.remove benötigt einen Pfad.');
          if (!Number.isInteger(operation.index) || operation.index < 0) throw createError('PROJECT_STORE_OPERATION_INDEX_INVALID', 'collection.remove benötigt einen gültigen Index.');
        },
        apply: function (state, operation) {
          const collection = getAtPath(state, operation.path);
          if (!Array.isArray(collection)) throw createError('PROJECT_STORE_COLLECTION_REQUIRED', 'Der Zielpfad ist keine Collection.', operation.path);
          collection.splice(operation.index, 1);
        },
        revert: function (state, operation) {
          const collection = getAtPath(state, operation.path);
          if (!Array.isArray(collection)) throw createError('PROJECT_STORE_COLLECTION_REQUIRED', 'Der Zielpfad ist keine Collection.', operation.path);
          collection.splice(operation.index, 0, clone(operation.value));
        }
      }
    };
  }

  class ProjectStateStore {
    constructor(options) {
      const input = options || {};
      this.options = normalizeOptions(input);
      this.projectId = text(input.projectId) || 'ol_project_' + uuid();
      this.state = clone(input.initialState || {});
      this.initialState = clone(this.state);
      this.revision = Number(input.initialRevision || 0);
      this.headRevision = this.revision;
      this.journal = [];
      this.cursor = 0;
      this.checkpoints = [];
      this.assets = new Map();
      this.assetReferences = new Map();
      this.openTransactions = new Map();
      this.operationContracts = new Map(Object.entries(defaultOperationContracts()));
      this.adapter = input.adapter || null;
      this.createdAt = now();
      this.updatedAt = this.createdAt;
      this.lastVerification = null;
    }

    registerOperationType(type, contract) {
      const name = text(type);
      if (!name) throw createError('PROJECT_STORE_OPERATION_TYPE_REQUIRED', 'Ein Operationstyp ist erforderlich.');
      if (!contract || typeof contract.apply !== 'function' || typeof contract.revert !== 'function') {
        throw createError('PROJECT_STORE_OPERATION_CONTRACT_INVALID', 'Ein Operationsvertrag benötigt apply() und revert().');
      }
      this.operationContracts.set(name, contract);
      return name;
    }

    beginTransaction(options) {
      const input = options || {};
      const transactionId = text(input.transactionId) || 'ol_tx_' + uuid();
      if (this.openTransactions.has(transactionId)) throw createError('PROJECT_STORE_TRANSACTION_EXISTS', 'Die Transaktion existiert bereits.');
      const transaction = {
        transactionId: transactionId,
        type: text(input.type) || 'project.change',
        label: text(input.label) || null,
        scope: text(input.scope) || 'project',
        metadata: clone(input.metadata || {}),
        revisionBefore: this.revision,
        createdAt: now(),
        operations: [],
        status: 'open'
      };
      this.openTransactions.set(transactionId, transaction);
      return freezeClone(transaction);
    }

    record(transactionId, operation) {
      const transaction = this.openTransactions.get(text(transactionId));
      if (!transaction) throw createError('PROJECT_STORE_TRANSACTION_MISSING', 'Die Transaktion wurde nicht gefunden.');
      if (transaction.status !== 'open') throw createError('PROJECT_STORE_TRANSACTION_NOT_OPEN', 'Die Transaktion ist nicht mehr offen.');
      const value = clone(operation || {});
      value.type = text(value.type);
      if (!value.type) throw createError('PROJECT_STORE_OPERATION_TYPE_REQUIRED', 'Die Operation benötigt einen Typ.');
      const contract = this.operationContracts.get(value.type);
      if (!contract) throw createError('PROJECT_STORE_OPERATION_TYPE_UNKNOWN', 'Unbekannter Operationstyp: ' + value.type);
      if (typeof contract.validate === 'function') contract.validate(value, this.state);
      value.operationId = text(value.operationId) || 'ol_op_' + uuid();
      value.pageId = text(value.pageId) || null;
      value.identity = text(value.identity) || null;
      transaction.operations.push(value);
      return freezeClone(value);
    }

    commit(transactionId) {
      const id = text(transactionId);
      const transaction = this.openTransactions.get(id);
      if (!transaction) throw createError('PROJECT_STORE_TRANSACTION_MISSING', 'Die Transaktion wurde nicht gefunden.');
      if (!transaction.operations.length) throw createError('PROJECT_STORE_TRANSACTION_EMPTY', 'Eine leere Transaktion kann nicht bestätigt werden.');

      if (this.cursor < this.journal.length) this.journal = this.journal.slice(0, this.cursor);
      const stateBefore = clone(this.state);
      try {
        transaction.operations.forEach(operation => {
          const contract = this.operationContracts.get(operation.type);
          contract.apply(this.state, clone(operation), this);
        });
      } catch (error) {
        this.state = stateBefore;
        transaction.status = 'failed';
        this.openTransactions.delete(id);
        throw error;
      }

      const revisionAfter = this.headRevision + 1;
      const committed = Object.assign({}, transaction, {
        revisionAfter: revisionAfter,
        committedAt: now(),
        status: 'committed'
      });
      committed.previousHash = this.journal.length ? this.journal[this.journal.length - 1].transactionHash : null;
      committed.stateHash = hashValue(this.state);
      committed.transactionHash = hashValue({
        previousHash: committed.previousHash,
        revisionBefore: committed.revisionBefore,
        revisionAfter: committed.revisionAfter,
        type: committed.type,
        operations: committed.operations,
        stateHash: committed.stateHash
      });
      committed.byteSize = byteSize(committed);

      this.journal.push(committed);
      this.cursor = this.journal.length;
      this.revision = revisionAfter;
      this.headRevision = revisionAfter;
      this.updatedAt = committed.committedAt;
      this.openTransactions.delete(id);
      this.enforceLimits();
      if (this.journal.length % this.options.checkpointEvery === 0) this.createCheckpoint({ reason: 'automatic' });
      return freezeClone(committed);
    }

    rollback(transactionId) {
      const id = text(transactionId);
      const transaction = this.openTransactions.get(id);
      if (!transaction) return false;
      transaction.status = 'rolled-back';
      this.openTransactions.delete(id);
      return true;
    }

    undo() {
      if (!this.canUndo()) return null;
      const transaction = this.journal[this.cursor - 1];
      const stateBefore = clone(this.state);
      try {
        transaction.operations.slice().reverse().forEach(operation => {
          const contract = this.operationContracts.get(operation.type);
          contract.revert(this.state, clone(operation), this);
        });
      } catch (error) {
        this.state = stateBefore;
        throw error;
      }
      this.cursor -= 1;
      this.revision = transaction.revisionBefore;
      this.updatedAt = now();
      return freezeClone({ direction: 'undo', transaction: transaction, revision: this.revision, stateHash: hashValue(this.state) });
    }

    redo() {
      if (!this.canRedo()) return null;
      const transaction = this.journal[this.cursor];
      const stateBefore = clone(this.state);
      try {
        transaction.operations.forEach(operation => {
          const contract = this.operationContracts.get(operation.type);
          contract.apply(this.state, clone(operation), this);
        });
      } catch (error) {
        this.state = stateBefore;
        throw error;
      }
      this.cursor += 1;
      this.revision = transaction.revisionAfter;
      this.updatedAt = now();
      return freezeClone({ direction: 'redo', transaction: transaction, revision: this.revision, stateHash: hashValue(this.state) });
    }

    canUndo() { return this.cursor > 0; }
    canRedo() { return this.cursor < this.journal.length; }

    createCheckpoint(options) {
      const input = options || {};
      const checkpoint = {
        checkpointId: text(input.checkpointId) || 'ol_checkpoint_' + uuid(),
        projectId: this.projectId,
        revision: this.revision,
        cursor: this.cursor,
        createdAt: now(),
        reason: text(input.reason) || 'manual',
        state: clone(this.state),
        stateHash: hashValue(this.state),
        assets: this.listAssets()
      };
      checkpoint.checkpointHash = hashValue(checkpoint);
      this.checkpoints.push(checkpoint);
      return freezeClone(checkpoint);
    }

    restoreRevision(revision) {
      const target = Number(revision);
      if (!Number.isInteger(target) || target < 0 || target > this.headRevision) {
        throw createError('PROJECT_STORE_REVISION_INVALID', 'Die angeforderte Revision ist ungültig.');
      }
      const state = clone(this.initialState);
      let cursor = 0;
      for (let index = 0; index < this.journal.length; index += 1) {
        const transaction = this.journal[index];
        if (transaction.revisionAfter > target) break;
        transaction.operations.forEach(operation => {
          this.operationContracts.get(operation.type).apply(state, clone(operation), this);
        });
        cursor = index + 1;
      }
      this.state = state;
      this.cursor = cursor;
      this.revision = target;
      this.updatedAt = now();
      return this.getState();
    }

    registerAsset(input) {
      const value = input || {};
      const assetId = text(value.assetId) || 'ol_asset_' + (text(value.hash) || uuid());
      const asset = {
        assetId: assetId,
        hash: text(value.hash) || null,
        path: text(value.path) || null,
        mediaType: text(value.mediaType) || null,
        size: Math.max(0, Number(value.size || 0)),
        variants: clone(value.variants || {}),
        metadata: clone(value.metadata || {})
      };
      const duplicate = Array.from(this.assets.values()).find(item => asset.hash && item.hash === asset.hash);
      if (duplicate) return freezeClone(duplicate);
      this.assets.set(assetId, asset);
      this.assetReferences.set(assetId, new Set());
      return freezeClone(asset);
    }

    addAssetReference(assetId, reference) {
      const id = text(assetId);
      if (!this.assets.has(id)) throw createError('PROJECT_STORE_ASSET_MISSING', 'Das Asset wurde nicht gefunden.');
      if (!this.assetReferences.has(id)) this.assetReferences.set(id, new Set());
      this.assetReferences.get(id).add(stableStringify(reference || {}));
      return this.assetReferences.get(id).size;
    }

    removeAssetReference(assetId, reference) {
      const id = text(assetId);
      if (!this.assetReferences.has(id)) return 0;
      this.assetReferences.get(id).delete(stableStringify(reference || {}));
      return this.assetReferences.get(id).size;
    }

    listAssets() {
      return freezeClone(Array.from(this.assets.values()).map(asset => Object.assign({}, asset, {
        referenceCount: this.assetReferences.has(asset.assetId) ? this.assetReferences.get(asset.assetId).size : 0
      })));
    }

    createBackupPlan(options) {
      const input = options || {};
      const sinceRevision = Math.max(0, Number(input.sinceRevision || 0));
      const full = input.full === true || sinceRevision === 0;
      const transactions = this.journal.filter(item => full || item.revisionAfter > sinceRevision);
      const referencedAssetIds = new Set();
      transactions.forEach(transaction => transaction.operations.forEach(operation => {
        [operation.assetId, operation.beforeAssetId, operation.afterAssetId].filter(Boolean).forEach(id => referencedAssetIds.add(id));
        (operation.assetIds || []).forEach(id => referencedAssetIds.add(id));
      }));
      const assets = full
        ? this.listAssets()
        : this.listAssets().filter(asset => referencedAssetIds.has(asset.assetId));
      const checkpoint = this.checkpoints.slice().reverse().find(item => item.revision <= this.revision) || null;
      return freezeClone({
        schemaVersion: SCHEMA_VERSION,
        type: full ? 'full' : 'incremental',
        projectId: this.projectId,
        revision: this.revision,
        sinceRevision: sinceRevision,
        checkpoint: checkpoint,
        transactions: transactions,
        assets: assets,
        manifest: {
          stateHash: hashValue(this.state),
          transactionCount: transactions.length,
          assetCount: assets.length,
          createdAt: now()
        }
      });
    }

    verify() {
      const issues = [];
      let previousHash = null;
      let simulatedState = clone(this.initialState);
      this.journal.forEach((transaction, index) => {
        if (transaction.previousHash !== previousHash) {
          issues.push({ code: 'PROJECT_STORE_JOURNAL_CHAIN_INVALID', index: index, transactionId: transaction.transactionId });
        }
        const expectedHash = hashValue({
          previousHash: transaction.previousHash,
          revisionBefore: transaction.revisionBefore,
          revisionAfter: transaction.revisionAfter,
          type: transaction.type,
          operations: transaction.operations,
          stateHash: transaction.stateHash
        });
        if (expectedHash !== transaction.transactionHash) {
          issues.push({ code: 'PROJECT_STORE_TRANSACTION_HASH_INVALID', index: index, transactionId: transaction.transactionId });
        }
        try {
          transaction.operations.forEach(operation => this.operationContracts.get(operation.type).apply(simulatedState, clone(operation), this));
          if (hashValue(simulatedState) !== transaction.stateHash) {
            issues.push({ code: 'PROJECT_STORE_STATE_HASH_INVALID', index: index, transactionId: transaction.transactionId });
          }
        } catch (error) {
          issues.push({ code: 'PROJECT_STORE_REPLAY_FAILED', index: index, transactionId: transaction.transactionId, message: error.message });
        }
        previousHash = transaction.transactionHash;
      });
      const result = {
        valid: issues.length === 0,
        projectId: this.projectId,
        revision: this.revision,
        headRevision: this.headRevision,
        transactionCount: this.journal.length,
        checkpointCount: this.checkpoints.length,
        assetCount: this.assets.size,
        stateHash: hashValue(this.state),
        issues: issues,
        verifiedAt: now()
      };
      this.lastVerification = result;
      return freezeClone(result);
    }

    exportBundle() {
      return freezeClone({
        schemaVersion: SCHEMA_VERSION,
        storeLayoutVersion: STORE_LAYOUT_VERSION,
        project: {
          projectId: this.projectId,
          revision: this.revision,
          headRevision: this.headRevision,
          cursor: this.cursor,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt
        },
        initialState: this.initialState,
        currentState: this.state,
        journal: this.journal,
        checkpoints: this.checkpoints,
        assets: this.listAssets()
      });
    }

    loadBundle(bundle) {
      const value = clone(bundle || {});
      if (value.schemaVersion !== SCHEMA_VERSION || value.storeLayoutVersion !== STORE_LAYOUT_VERSION) {
        throw createError('PROJECT_STORE_BUNDLE_VERSION_UNSUPPORTED', 'Die Project-Store-Version wird nicht unterstützt.');
      }
      this.projectId = text(value.project && value.project.projectId) || this.projectId;
      this.initialState = clone(value.initialState || {});
      this.state = clone(value.currentState || this.initialState);
      this.journal = clone(value.journal || []);
      this.checkpoints = clone(value.checkpoints || []);
      this.cursor = Number(value.project && value.project.cursor);
      if (!Number.isInteger(this.cursor)) this.cursor = this.journal.length;
      this.revision = Number(value.project && value.project.revision || 0);
      this.headRevision = Number(value.project && value.project.headRevision || this.revision);
      this.assets.clear();
      this.assetReferences.clear();
      (value.assets || []).forEach(asset => {
        const copy = clone(asset);
        delete copy.referenceCount;
        this.assets.set(copy.assetId, copy);
        this.assetReferences.set(copy.assetId, new Set());
      });
      const verification = this.verify();
      if (!verification.valid) throw createError('PROJECT_STORE_BUNDLE_INVALID', 'Das Project-Store-Bundle ist nicht konsistent.', verification.issues);
      return this.getState();
    }

    connectAdapter(adapter) {
      if (!adapter || typeof adapter.saveBundle !== 'function' || typeof adapter.loadBundle !== 'function') {
        throw createError('PROJECT_STORE_ADAPTER_INVALID', 'Der Adapter benötigt loadBundle() und saveBundle().');
      }
      this.adapter = adapter;
      return true;
    }

    async persist() {
      if (!this.adapter) throw createError('PROJECT_STORE_ADAPTER_MISSING', 'Es ist kein Project-Store-Adapter verbunden.');
      await this.adapter.saveBundle(this.exportBundle());
      return this.getState();
    }

    async load() {
      if (!this.adapter) throw createError('PROJECT_STORE_ADAPTER_MISSING', 'Es ist kein Project-Store-Adapter verbunden.');
      const bundle = await this.adapter.loadBundle();
      return this.loadBundle(bundle);
    }

    enforceLimits() {
      const journalBytes = byteSize(this.journal);
      if (this.journal.length <= this.options.maxTransactions && journalBytes <= this.options.maxJournalBytes) return;
      const checkpoint = this.createCheckpoint({ reason: 'limit' });
      const keep = Math.max(1, Math.floor(this.options.maxTransactions / 2));
      const removed = this.journal.slice(0, Math.max(0, this.journal.length - keep));
      this.journal = this.journal.slice(-keep);
      this.cursor = Math.min(this.cursor, this.journal.length);
      this.initialState = clone(checkpoint.state);
      if (removed.length) {
        const first = this.journal[0];
        if (first) first.previousHash = null;
      }
    }

    getState() {
      return freezeClone({
        schemaVersion: SCHEMA_VERSION,
        storeLayoutVersion: STORE_LAYOUT_VERSION,
        projectId: this.projectId,
        revision: this.revision,
        headRevision: this.headRevision,
        cursor: this.cursor,
        transactionCount: this.journal.length,
        openTransactionCount: this.openTransactions.size,
        checkpointCount: this.checkpoints.length,
        assetCount: this.assets.size,
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
        stateHash: hashValue(this.state),
        journalBytes: byteSize(this.journal),
        currentState: this.state,
        updatedAt: this.updatedAt
      });
    }

    snapshot() { return this.getState(); }
  }

  function create(options) { return new ProjectStateStore(options); }

  return Object.freeze({
    SCHEMA_VERSION: SCHEMA_VERSION,
    STORE_LAYOUT_VERSION: STORE_LAYOUT_VERSION,
    DEFAULT_OPTIONS: DEFAULT_OPTIONS,
    create: create,
    hashValue: hashValue,
    stableStringify: stableStringify,
    ProjectStateStore: ProjectStateStore
  });
});
