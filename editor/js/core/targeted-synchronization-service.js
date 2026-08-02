(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirTargetedSynchronizationService = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const SCHEMA_VERSION = 1;
  const PLAN_SCHEMA_VERSION = 1;
  const TRANSACTION_SCHEMA_VERSION = 1;
  const STATUS = Object.freeze({
    PREPARED: 'prepared',
    DRY_RUN_COMPLETED: 'dry-run-completed',
    COMMITTED: 'committed',
    EXECUTED: 'executed',
    ROLLED_BACK: 'rolled-back',
    BLOCKED: 'blocked'
  });
  const OPERATION_STATUS = Object.freeze({
    UNCHANGED: 'unchanged',
    CHANGED: 'changed',
    BLOCKED: 'blocked'
  });

  function clone(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }
  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(key => deepFreeze(value[key]));
    return Object.freeze(value);
  }
  function frozen(value) { return deepFreeze(clone(value)); }
  function text(value) { return value == null ? '' : String(value).trim(); }
  function issue(code, message, details) { return { code: code, message: message, details: clone(details || null) }; }
  function stableStringify(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
    return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + stableStringify(value[key])).join(',') + '}';
  }
  function defaultFingerprint(value) {
    const input = stableStringify(value);
    let hash = 2166136261;
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
  }

  function validatePlan(plan) {
    const issues = [];
    if (!plan || typeof plan !== 'object') {
      issues.push(issue('TARGETED_SYNC_PLAN_REQUIRED', 'Ein Synchronisationsplan ist erforderlich.'));
      return frozen({ valid: false, issues: issues });
    }
    if (plan.schemaVersion !== PLAN_SCHEMA_VERSION) issues.push(issue('TARGETED_SYNC_PLAN_SCHEMA_UNSUPPORTED', 'Die Planversion wird nicht unterstützt.', { expected: PLAN_SCHEMA_VERSION, actual: plan.schemaVersion }));
    if (plan.type !== 'repeat-targeted-sync-plan') issues.push(issue('TARGETED_SYNC_PLAN_TYPE_INVALID', 'Der Plantyp ist ungültig.', { type: plan.type }));
    if (plan.valid !== true || plan.blocked === true) issues.push(issue('TARGETED_SYNC_PLAN_BLOCKED', 'Der Synchronisationsplan ist nicht ausführbar.'));
    if (Number(plan.cycleCount || 0) > 0) issues.push(issue('TARGETED_SYNC_PLAN_CYCLE', 'Der Synchronisationsplan enthält zyklische Abhängigkeiten.', { cycleCount: plan.cycleCount }));
    if (!Array.isArray(plan.operations) || plan.operations.length === 0) issues.push(issue('TARGETED_SYNC_PLAN_EMPTY', 'Der Synchronisationsplan enthält keine Operationen.'));
    const ids = new Set();
    (plan.operations || []).forEach((operation, index) => {
      const required = ['operationId', 'definitionId', 'instanceId', 'sourcePageId', 'sourceIdentity', 'targetPageId', 'targetIdentity'];
      const missing = required.filter(key => !text(operation && operation[key]));
      if (missing.length) issues.push(issue('TARGETED_SYNC_OPERATION_INCOMPLETE', 'Eine Synchronisationsoperation ist unvollständig.', { index: index, missing: missing }));
      const operationId = text(operation && operation.operationId);
      if (operationId && ids.has(operationId)) issues.push(issue('TARGETED_SYNC_OPERATION_DUPLICATE', 'Eine operationId ist mehrfach vorhanden.', { operationId: operationId }));
      if (operationId) ids.add(operationId);
    });
    return frozen({ valid: issues.length === 0, operationCount: (plan.operations || []).length, issues: issues });
  }

  function validateAccessAdapter(adapter) {
    const issues = [];
    ['readSource', 'readTarget'].forEach(name => {
      if (!adapter || typeof adapter[name] !== 'function') issues.push(issue('TARGETED_SYNC_ACCESS_METHOD_MISSING', 'Der Leseadapter ist unvollständig.', { method: name }));
    });
    return frozen({ valid: issues.length === 0, issues: issues });
  }

  class TargetedSynchronizationService {
    constructor(options) {
      this.options = Object.assign({ maxTransactions: 1000 }, options || {});
      this.transactions = new Map();
      this.locks = new Map();
      this.sequence = 0;
    }

    nextTransactionId() {
      this.sequence += 1;
      return 'ol-sync-tx-' + this.sequence;
    }

    lockKey(operation) {
      return [text(operation.targetPageId), text(operation.targetIdentity)].join(':');
    }

    acquireLocks(transactionId, operations) {
      const acquired = [];
      const issues = [];
      (operations || []).forEach(operation => {
        const key = this.lockKey(operation);
        const owner = this.locks.get(key);
        if (owner && owner !== transactionId) {
          issues.push(issue('TARGETED_SYNC_TARGET_LOCKED', 'Ein Synchronisationsziel ist bereits gesperrt.', { operationId: operation.operationId, target: key, owner: owner }));
          return;
        }
        this.locks.set(key, transactionId);
        acquired.push(key);
      });
      if (issues.length) acquired.forEach(key => { if (this.locks.get(key) === transactionId) this.locks.delete(key); });
      return { valid: issues.length === 0, locks: acquired, issues: issues };
    }

    releaseLocks(transaction) {
      (transaction && transaction.locks || []).forEach(key => {
        if (this.locks.get(key) === transaction.transactionId) this.locks.delete(key);
      });
    }

    prepare(plan, accessAdapter) {
      const planValidation = validatePlan(plan);
      const adapterValidation = validateAccessAdapter(accessAdapter);
      const issues = [].concat(planValidation.issues || [], adapterValidation.issues || []);
      const transactionId = this.nextTransactionId();
      if (issues.length) return frozen({ schemaVersion: TRANSACTION_SCHEMA_VERSION, transactionId: transactionId, status: STATUS.BLOCKED, valid: false, issues: issues, mutationPerformed: false });

      const lockResult = this.acquireLocks(transactionId, plan.operations);
      if (!lockResult.valid) return frozen({ schemaVersion: TRANSACTION_SCHEMA_VERSION, transactionId: transactionId, status: STATUS.BLOCKED, valid: false, issues: lockResult.issues, mutationPerformed: false });

      const transaction = {
        schemaVersion: TRANSACTION_SCHEMA_VERSION,
        transactionId: transactionId,
        status: STATUS.PREPARED,
        plan: clone(plan),
        locks: lockResult.locks,
        operations: [],
        issues: [],
        createdAt: new Date().toISOString(),
        completedAt: null,
        mutationPerformed: false
      };
      this.transactions.set(transactionId, transaction);
      this.prune();
      return this.snapshotTransaction(transactionId);
    }

    dryRun(plan, accessAdapter) {
      const prepared = this.prepare(plan, accessAdapter);
      if (!prepared.valid) return prepared;
      const transaction = this.transactions.get(prepared.transactionId);
      const fingerprint = accessAdapter && typeof accessAdapter.fingerprint === 'function' ? accessAdapter.fingerprint : defaultFingerprint;
      const compare = accessAdapter && typeof accessAdapter.compare === 'function'
        ? accessAdapter.compare
        : ((source, target) => stableStringify(source) === stableStringify(target));
      const captureRollback = accessAdapter && typeof accessAdapter.captureRollback === 'function'
        ? accessAdapter.captureRollback
        : target => clone(target);

      transaction.operations = transaction.plan.operations.map(operation => {
        try {
          const source = accessAdapter.readSource(clone(operation));
          const target = accessAdapter.readTarget(clone(operation));
          const sourceFingerprint = text(fingerprint(source));
          const targetFingerprint = text(fingerprint(target));
          const equal = compare(source, target) === true;
          return {
            operationId: operation.operationId,
            definitionId: operation.definitionId,
            instanceId: operation.instanceId,
            sourcePageId: operation.sourcePageId,
            sourceIdentity: operation.sourceIdentity,
            targetPageId: operation.targetPageId,
            targetIdentity: operation.targetIdentity,
            sourceFingerprint: sourceFingerprint,
            targetFingerprint: targetFingerprint,
            status: equal ? OPERATION_STATUS.UNCHANGED : OPERATION_STATUS.CHANGED,
            rollbackToken: captureRollback(target),
            mutationPerformed: false,
            issues: []
          };
        } catch (error) {
          const item = issue('TARGETED_SYNC_READ_FAILED', 'Quelle oder Ziel konnte nicht gelesen werden.', { operationId: operation.operationId, message: error && error.message ? error.message : String(error) });
          transaction.issues.push(item);
          return Object.assign({}, clone(operation), { status: OPERATION_STATUS.BLOCKED, rollbackToken: null, mutationPerformed: false, issues: [item] });
        }
      });
      transaction.status = transaction.issues.length ? STATUS.BLOCKED : STATUS.DRY_RUN_COMPLETED;
      transaction.completedAt = new Date().toISOString();
      this.releaseLocks(transaction);
      transaction.locks = [];
      return this.snapshotTransaction(transaction.transactionId);
    }

    commit(transactionId) {
      const transaction = this.transactions.get(text(transactionId));
      if (!transaction) throw this.error('TARGETED_SYNC_TRANSACTION_UNKNOWN', 'Die Synchronisationstransaktion wurde nicht gefunden.');
      if (transaction.status !== STATUS.DRY_RUN_COMPLETED) throw this.error('TARGETED_SYNC_TRANSACTION_NOT_READY', 'Nur ein erfolgreicher Dry-Run kann vertraglich bestätigt werden.');
      transaction.status = STATUS.COMMITTED;
      transaction.completedAt = new Date().toISOString();
      return this.snapshotTransaction(transaction.transactionId);
    }

    rollback(transactionId, reason) {
      const transaction = this.transactions.get(text(transactionId));
      if (!transaction) throw this.error('TARGETED_SYNC_TRANSACTION_UNKNOWN', 'Die Synchronisationstransaktion wurde nicht gefunden.');
      this.releaseLocks(transaction);
      transaction.locks = [];
      transaction.status = STATUS.ROLLED_BACK;
      transaction.completedAt = new Date().toISOString();
      transaction.rollbackReason = text(reason) || 'requested';
      transaction.mutationPerformed = false;
      return this.snapshotTransaction(transaction.transactionId);
    }

    execute(plan, accessAdapter) {
      const planValidation = validatePlan(plan);
      const adapterValidation = validateAccessAdapter(accessAdapter);
      const writeIssues = [];
      ['writeTarget', 'restoreTarget'].forEach(name => {
        if (!accessAdapter || typeof accessAdapter[name] !== 'function') writeIssues.push(issue('TARGETED_SYNC_WRITE_METHOD_MISSING', 'Der Schreibadapter ist unvollständig.', { method: name }));
      });
      const issues = [].concat(planValidation.issues || [], adapterValidation.issues || [], writeIssues);
      const transactionId = this.nextTransactionId();
      if (issues.length) return frozen({ schemaVersion: TRANSACTION_SCHEMA_VERSION, transactionId: transactionId, status: STATUS.BLOCKED, valid: false, issues: issues, mutationPerformed: false, executionEnabled: true });

      const lockResult = this.acquireLocks(transactionId, plan.operations);
      if (!lockResult.valid) return frozen({ schemaVersion: TRANSACTION_SCHEMA_VERSION, transactionId: transactionId, status: STATUS.BLOCKED, valid: false, issues: lockResult.issues, mutationPerformed: false, executionEnabled: true });
      const fingerprint = typeof accessAdapter.fingerprint === 'function' ? accessAdapter.fingerprint : defaultFingerprint;
      const compare = typeof accessAdapter.compare === 'function' ? accessAdapter.compare : ((source, target) => stableStringify(source) === stableStringify(target));
      const captureRollback = typeof accessAdapter.captureRollback === 'function' ? accessAdapter.captureRollback : target => clone(target);
      const transaction = { schemaVersion: TRANSACTION_SCHEMA_VERSION, transactionId, status: STATUS.PREPARED, plan: clone(plan), locks: lockResult.locks, operations: [], issues: [], createdAt: new Date().toISOString(), completedAt: null, mutationPerformed: false };
      this.transactions.set(transactionId, transaction);
      try {
        for (const operation of plan.operations) {
          const source = accessAdapter.readSource(clone(operation));
          const target = accessAdapter.readTarget(clone(operation));
          const rollbackToken = captureRollback(target);
          const equal = compare(source, target) === true;
          const result = Object.assign({}, clone(operation), {
            sourceFingerprint: text(fingerprint(source)), targetFingerprint: text(fingerprint(target)),
            status: equal ? OPERATION_STATUS.UNCHANGED : OPERATION_STATUS.CHANGED,
            rollbackToken, mutationPerformed: false, issues: []
          });
          if (!equal) {
            if (typeof accessAdapter.validateWrite === 'function') accessAdapter.validateWrite(clone(operation), source, target);
            accessAdapter.writeTarget(clone(operation), source, { transactionId });
            result.mutationPerformed = true;
            transaction.mutationPerformed = true;
          }
          transaction.operations.push(result);
        }
        transaction.status = STATUS.EXECUTED;
        transaction.completedAt = new Date().toISOString();
        return this.snapshotTransaction(transactionId);
      } catch (error) {
        transaction.issues.push(issue(error && error.code ? error.code : 'TARGETED_SYNC_WRITE_FAILED', 'Die gezielte Synchronisation ist fehlgeschlagen.', { message: error && error.message ? error.message : String(error) }));
        for (let index = transaction.operations.length - 1; index >= 0; index -= 1) {
          const applied = transaction.operations[index];
          if (!applied.mutationPerformed) continue;
          try { accessAdapter.restoreTarget(clone(applied), clone(applied.rollbackToken), { transactionId }); }
          catch (rollbackError) { transaction.issues.push(issue('TARGETED_SYNC_ROLLBACK_FAILED', 'Rollback einer Zielinstanz ist fehlgeschlagen.', { operationId: applied.operationId, message: rollbackError && rollbackError.message ? rollbackError.message : String(rollbackError) })); }
        }
        transaction.status = STATUS.ROLLED_BACK;
        transaction.completedAt = new Date().toISOString();
        transaction.rollbackReason = 'execution-failed';
        transaction.mutationPerformed = false;
        return this.snapshotTransaction(transactionId);
      } finally {
        this.releaseLocks(transaction);
        transaction.locks = [];
        this.prune();
      }
    }

    getTransaction(transactionId) { return this.snapshotTransaction(transactionId); }
    listTransactions() { return frozen(Array.from(this.transactions.keys()).map(id => this.snapshotTransaction(id))); }
    getState() { return frozen({ schemaVersion: SCHEMA_VERSION, transactionCount: this.transactions.size, activeLockCount: this.locks.size, executionEnabled: true }); }

    snapshotTransaction(transactionId) {
      const transaction = this.transactions.get(text(transactionId));
      if (!transaction) return null;
      const operationCounts = (transaction.operations || []).reduce((result, operation) => {
        result[operation.status] = (result[operation.status] || 0) + 1;
        return result;
      }, {});
      return frozen(Object.assign({}, transaction, { valid: transaction.status !== STATUS.BLOCKED, operationCounts: operationCounts, executionEnabled: true }));
    }

    prune() {
      const limit = Math.max(1, Number(this.options.maxTransactions) || 1000);
      while (this.transactions.size > limit) {
        const first = this.transactions.keys().next().value;
        const transaction = this.transactions.get(first);
        if (transaction && transaction.status === STATUS.PREPARED) break;
        this.transactions.delete(first);
      }
    }

    error(code, message) { const error = new Error(message); error.code = code; return error; }
  }

  function create(options) { return new TargetedSynchronizationService(options); }

  return Object.freeze({
    SCHEMA_VERSION,
    PLAN_SCHEMA_VERSION,
    TRANSACTION_SCHEMA_VERSION,
    STATUS,
    OPERATION_STATUS,
    TargetedSynchronizationService,
    create,
    validatePlan,
    validateAccessAdapter,
    defaultFingerprint
  });
});
