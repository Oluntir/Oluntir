(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirActionEngine = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const VERSION = 1;
  const DEFAULT_PHASES = ['normalize', 'identify', 'contextualize', 'structure', 'relate', 'depend', 'validate', 'execute', 'finalize'];
  const now = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
  const freeze = value => Object.freeze(value);
  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));

  function uid(prefix) {
    uid._n = (uid._n || 0) + 1;
    return prefix + ':' + Date.now().toString(36) + ':' + uid._n.toString(36);
  }

  function normalizeDefinition(input) {
    const value = typeof input === 'string' ? { type: input } : Object.assign({}, input || {});
    if (!value.type || typeof value.type !== 'string') throw new Error('Action type is required.');
    return freeze({
      type: value.type,
      version: Number(value.version || 1),
      category: value.category || value.type.split('.')[0] || 'general',
      priority: Number.isFinite(value.priority) ? value.priority : 50,
      batchable: value.batchable !== false,
      cancellable: value.cancellable !== false,
      payloadValidator: typeof value.payloadValidator === 'function' ? value.payloadValidator : null
    });
  }

  class SemanticActionEngine {
    constructor(options) {
      this.options = Object.assign({ maxQueue: 10000, maxDepth: 32, defaultTimeout: 0, autoStart: true }, options || {});
      this.state = 'created';
      this.actions = new Map();
      this.handlers = new Map();
      this.handlersByAction = new Map();
      this.middleware = new Map();
      this.phases = DEFAULT_PHASES.map((name, index) => ({ name, priority: index * 10, enabled: true }));
      this.phaseHooks = new Map();
      this.listeners = new Map();
      this.queue = [];
      this.queuePaused = false;
      this.processing = false;
      this.executions = new Map();
      this.failures = [];
      this.batches = new Map();
      this.transactions = new Map();
      this.retryPolicy = { retries: 0, delay: 0 };
      this.deduplicationStrategy = action => action.deduplicationKey || (action.type + ':' + JSON.stringify(action.payload || null));
      this.coalescingStrategy = (_previous, next) => next;
      this.metrics = this._newMetrics();
      if (this.options.autoStart) this.start();
    }

    _newMetrics() {
      return { createdAt: Date.now(), dispatched: 0, completed: 0, failed: 0, cancelled: 0, handlerCalls: 0, deduplicated: 0, batchesCommitted: 0, transactionsCommitted: 0, transactionsRolledBack: 0, queuePeak: 0, totalDurationMs: 0, lastDurationMs: 0 };
    }

    start() { if (this.state === 'disposed') throw new Error('Engine is disposed.'); this.state = 'running'; this._emit('engine:started', {}); return this; }
    stop() { if (this.state !== 'disposed') this.state = 'stopped'; this._emit('engine:stopped', {}); return this; }
    reset() { this.queue.length = 0; this.executions.clear(); this.failures.length = 0; this.batches.clear(); this.transactions.clear(); this.metrics = this._newMetrics(); this._emit('engine:reset', {}); return this; }
    dispose() { this.stop(); this.reset(); this.actions.clear(); this.handlers.clear(); this.handlersByAction.clear(); this.middleware.clear(); this.listeners.clear(); this.phaseHooks.clear(); this.state = 'disposed'; return null; }
    getState() { return freeze({ state: this.state, queuePaused: this.queuePaused, processing: this.processing, queueLength: this.queue.length }); }
    getMetrics() { return freeze(Object.assign({}, this.metrics, { averageDurationMs: this.metrics.completed ? this.metrics.totalDurationMs / this.metrics.completed : 0 })); }

    defineAction(definition) { const item = normalizeDefinition(definition); this.actions.set(item.type, item); return item; }
    removeAction(type) { return this.actions.delete(type); }
    hasAction(type) { return this.actions.has(type); }
    getAction(type) { return this.actions.get(type) || null; }
    listActions() { return freeze(Array.from(this.actions.values())); }

    registerHandler(actionType, handler, options) {
      if (typeof handler !== 'function') throw new Error('Handler must be a function.');
      if (!this.actions.has(actionType)) this.defineAction(actionType);
      const opts = Object.assign({}, options || {});
      const item = { id: opts.id || uid('handler'), actionType, handler, phase: opts.phase || 'execute', priority: Number.isFinite(opts.priority) ? opts.priority : 50, once: !!opts.once, enabled: opts.enabled !== false, timeout: Number.isFinite(opts.timeout) ? opts.timeout : this.options.defaultTimeout };
      this.handlers.set(item.id, item);
      if (!this.handlersByAction.has(actionType)) this.handlersByAction.set(actionType, new Set());
      this.handlersByAction.get(actionType).add(item.id);
      return item.id;
    }
    unregisterHandler(id) { const item = this.handlers.get(id); if (!item) return false; this.handlers.delete(id); const set = this.handlersByAction.get(item.actionType); if (set) set.delete(id); return true; }
    enableHandler(id) { const item = this.handlers.get(id); if (item) item.enabled = true; return !!item; }
    disableHandler(id) { const item = this.handlers.get(id); if (item) item.enabled = false; return !!item; }
    getHandler(id) { const item = this.handlers.get(id); return item ? freeze({ id: item.id, actionType: item.actionType, phase: item.phase, priority: item.priority, once: item.once, enabled: item.enabled, timeout: item.timeout }) : null; }
    listHandlers(actionType) { return freeze(Array.from(this.handlers.values()).filter(h => !actionType || h.actionType === actionType).map(h => this.getHandler(h.id))); }

    registerPhase(name, options) { if (!name) throw new Error('Phase name is required.'); const existing = this.phases.find(p => p.name === name); if (existing) return existing; const phase = { name, priority: Number.isFinite(options && options.priority) ? options.priority : this.phases.length * 10, enabled: !(options && options.enabled === false) }; this.phases.push(phase); this.phases.sort((a,b) => a.priority-b.priority); return freeze(Object.assign({}, phase)); }
    removePhase(name) { const before = this.phases.length; this.phases = this.phases.filter(p => p.name !== name); return this.phases.length !== before; }
    listPhases() { return freeze(this.phases.map(p => freeze(Object.assign({}, p)))); }
    beforePhase(name, callback) { return this._addPhaseHook(name, 'before', callback); }
    afterPhase(name, callback) { return this._addPhaseHook(name, 'after', callback); }
    _addPhaseHook(name, kind, callback) { if (typeof callback !== 'function') throw new Error('Phase callback must be a function.'); const id = uid('phase-hook'); this.phaseHooks.set(id, { id, name, kind, callback }); return id; }

    use(middleware, options) { if (typeof middleware !== 'function') throw new Error('Middleware must be a function.'); const id = options && options.id || uid('middleware'); this.middleware.set(id, { id, middleware, priority: Number.isFinite(options && options.priority) ? options.priority : 50 }); return id; }
    removeMiddleware(id) { return this.middleware.delete(id); }
    listMiddleware() { return freeze(Array.from(this.middleware.values()).sort((a,b)=>a.priority-b.priority).map(x => freeze({ id:x.id, priority:x.priority }))); }

    on(name, callback) { if (typeof callback !== 'function') throw new Error('Listener must be a function.'); const id = uid('listener'); if (!this.listeners.has(name)) this.listeners.set(name, new Map()); this.listeners.get(name).set(id, { callback, once:false }); return id; }
    once(name, callback) { const id = this.on(name, callback); this.listeners.get(name).get(id).once = true; return id; }
    off(name, reference) { const map = this.listeners.get(name); if (!map) return false; if (typeof reference === 'string') return map.delete(reference); for (const [id,item] of map) if (item.callback === reference) map.delete(id); return true; }
    _emit(name, payload) { const logger = typeof globalThis !== 'undefined' ? globalThis.OluntirLogger : null; if (logger) { const category = name.indexOf('action:') === 0 || name.indexOf('batch:') === 0 || name.indexOf('transaction:') === 0 || name.indexOf('queue:') === 0 ? 'action' : 'session'; const level = name === 'action:failed' || name === 'queue:pressure' ? 'warn' : 'debug'; if (logger[level]) logger[level](category, name, payload); if (name === 'action:completed' && payload && Number.isFinite(payload.durationMs)) logger.performance('action', payload.action && payload.action.type || 'action', payload.durationMs, { executionId: payload.executionId }); } const map = this.listeners.get(name); if (!map) return; for (const [id,item] of Array.from(map.entries())) { try { item.callback(payload); } catch (_) {} if (item.once) map.delete(id); } }

    _normalizeAction(input, depth) {
      const raw = typeof input === 'string' ? { type: input } : Object.assign({}, input || {});
      const definition = this.actions.get(raw.type) || this.defineAction(raw.type);
      if (definition.payloadValidator && definition.payloadValidator(raw.payload) === false) throw new Error('Invalid payload for action ' + raw.type + '.');
      return { id: raw.id || uid('action'), type: raw.type, payload: raw.payload == null ? null : raw.payload, metadata: Object.assign({}, raw.metadata || {}), priority: Number.isFinite(raw.priority) ? raw.priority : definition.priority, cancellable: definition.cancellable, batchable: definition.batchable, deduplicationKey: raw.deduplicationKey || null, depth: Number(depth || raw.depth || 0), createdAt: Date.now() };
    }

    dispatchSync(input) {
      if (this.state !== 'running') throw new Error('Engine is not running.');
      const action = this._normalizeAction(input, 0);
      const context = this._createContext(action);
      for (const item of Array.from(this.middleware.values()).sort((a,b)=>a.priority-b.priority)) item.middleware(context);
      for (const phase of this.phases.filter(p=>p.enabled).sort((a,b)=>a.priority-b.priority)) {
        this._runPhaseHooksSync(phase.name, 'before', context);
        this._runHandlersSync(action.type, phase.name, context);
        this._runPhaseHooksSync(phase.name, 'after', context);
      }
      return this._completeExecution(context);
    }

    async dispatch(input) {
      if (this.state !== 'running') throw new Error('Engine is not running.');
      const action = this._normalizeAction(input, 0);
      return this._execute(action);
    }

    _createContext(action) {
      if (action.depth > this.options.maxDepth) throw new Error('Maximum action depth exceeded.');
      const context = { executionId: uid('execution'), action, data: {}, results: [], errors: [], status: 'running', startedAt: now(), engine: this, cancelled: false };
      this.executions.set(context.executionId, context);
      this.metrics.dispatched++;
      this._emit('action:started', { executionId: context.executionId, action });
      return context;
    }

    async _execute(action) {
      const context = this._createContext(action);
      try {
        for (const item of Array.from(this.middleware.values()).sort((a,b)=>a.priority-b.priority)) await item.middleware(context);
        for (const phase of this.phases.filter(p=>p.enabled).sort((a,b)=>a.priority-b.priority)) {
          if (context.cancelled) break;
          this._emit('action:phase-started', { executionId: context.executionId, phase: phase.name });
          await this._runPhaseHooks(phase.name, 'before', context);
          await this._runHandlers(action.type, phase.name, context);
          await this._runPhaseHooks(phase.name, 'after', context);
          this._emit('action:phase-completed', { executionId: context.executionId, phase: phase.name });
        }
        return this._completeExecution(context);
      } catch (error) {
        return this._failExecution(context, error);
      }
    }

    _handlersFor(type, phase) { const ids = this.handlersByAction.get(type) || new Set(); return Array.from(ids).map(id=>this.handlers.get(id)).filter(h=>h && h.enabled && h.phase===phase).sort((a,b)=>a.priority-b.priority); }
    _runHandlersSync(type, phase, context) { for (const item of this._handlersFor(type, phase)) { const value = item.handler(context); if (value && typeof value.then === 'function') throw new Error('Async handler used in dispatchSync.'); context.results.push({ handlerId:item.id, value }); this.metrics.handlerCalls++; if (item.once) this.unregisterHandler(item.id); } }
    async _runHandlers(type, phase, context) { for (const item of this._handlersFor(type, phase)) { if (context.cancelled) break; const invoke = Promise.resolve().then(()=>item.handler(context)); const value = item.timeout > 0 ? await Promise.race([invoke, new Promise((_,reject)=>setTimeout(()=>reject(new Error('Handler timeout: '+item.id)), item.timeout))]) : await invoke; context.results.push({ handlerId:item.id, value }); this.metrics.handlerCalls++; if (item.once) this.unregisterHandler(item.id); } }
    _runPhaseHooksSync(name, kind, context) { for (const item of this.phaseHooks.values()) if (item.name===name && item.kind===kind) { const value=item.callback(context); if (value && typeof value.then==='function') throw new Error('Async phase hook used in dispatchSync.'); } }
    async _runPhaseHooks(name, kind, context) { for (const item of this.phaseHooks.values()) if (item.name===name && item.kind===kind) await item.callback(context); }

    _completeExecution(context) { const duration = now()-context.startedAt; context.status = context.cancelled ? 'cancelled' : 'completed'; context.durationMs = duration; this.metrics.lastDurationMs = duration; this.metrics.totalDurationMs += duration; if (context.cancelled) this.metrics.cancelled++; else this.metrics.completed++; this._emit('action:'+context.status, { executionId:context.executionId, action:context.action, durationMs:duration }); this.executions.delete(context.executionId); return freeze({ executionId:context.executionId, actionId:context.action.id, type:context.action.type, status:context.status, durationMs:duration, results:freeze(context.results.slice()), errors:freeze(context.errors.slice()) }); }
    _failExecution(context, error) { const failure = freeze({ executionId:context.executionId, actionType:context.action.type, errorCode:'ACTION_HANDLER_FAILED', message:error && error.message || String(error), recoverable:true }); this.failures.push(failure); this.metrics.failed++; context.status='failed'; this.executions.delete(context.executionId); this._emit('action:failed', failure); throw error; }

    enqueue(input) { if (this.queue.length >= this.options.maxQueue) { this._emit('queue:pressure', { queueLength:this.queue.length }); throw new Error('Action queue limit reached.'); } const action=this._normalizeAction(input,0); this.queue.push(action); this.queue.sort((a,b)=>a.priority-b.priority || a.createdAt-b.createdAt); this.metrics.queuePeak=Math.max(this.metrics.queuePeak,this.queue.length); this._emit('action:queued',{action}); if (!this.queuePaused) this._drainQueue(); return action.id; }
    dequeue() { return this.queue.shift() || null; }
    pauseQueue() { this.queuePaused=true; return this; }
    resumeQueue() { this.queuePaused=false; this._drainQueue(); return this; }
    flushQueue() { const removed=this.queue.splice(0); return freeze(removed); }
    getQueueState() { return freeze({ paused:this.queuePaused, processing:this.processing, length:this.queue.length, actionIds:freeze(this.queue.map(a=>a.id)) }); }
    async _drainQueue() { if (this.processing || this.queuePaused || this.state!=='running') return; this.processing=true; try { while (this.queue.length && !this.queuePaused) { const action=this.dequeue(); try { await this._execute(action); } catch (_) {} } } finally { this.processing=false; } }
    cancel(executionId) { const context=this.executions.get(executionId); if (!context || !context.action.cancellable) return false; context.cancelled=true; return true; }
    retry(executionId) { const failure=this.failures.find(f=>f.executionId===executionId); if (!failure) return null; return this.enqueue({ type:failure.actionType, metadata:{ retryOf:executionId } }); }
    schedule(input, delay) { return setTimeout(()=>this.enqueue(input), Math.max(0,Number(delay||0))); }

    beginBatch(options) { const id=uid('batch'); this.batches.set(id,{id, options:Object.assign({deduplicate:true},options||{}), actions:[], status:'open'}); return id; }
    addToBatch(id,input) { const batch=this.batches.get(id); if (!batch || batch.status!=='open') throw new Error('Batch is not open.'); const action=this._normalizeAction(input,0); if (!action.batchable) throw new Error('Action is not batchable: '+action.type); batch.actions.push(action); return action.id; }
    getBatch(id) { const batch=this.batches.get(id); return batch ? freeze({ id:batch.id, status:batch.status, size:batch.actions.length, actionIds:freeze(batch.actions.map(a=>a.id)) }) : null; }
    rollbackBatch(id) { const batch=this.batches.get(id); if (!batch) return false; batch.status='rolled-back'; batch.actions=[]; this._emit('batch:rolled-back',{batchId:id}); return true; }
    async commitBatch(id) { const batch=this.batches.get(id); if (!batch || batch.status!=='open') throw new Error('Batch is not open.'); let actions=batch.actions.slice(); if (batch.options.deduplicate) { const map=new Map(); for (const action of actions) { const key=this.deduplicationStrategy(action); if (map.has(key)) { map.set(key,this.coalescingStrategy(map.get(key),action)); this.metrics.deduplicated++; } else map.set(key,action); } actions=Array.from(map.values()); } batch.status='committed'; this.metrics.batchesCommitted++; const results=[]; for (const action of actions) results.push(await this._execute(action)); this._emit('batch:committed',{batchId:id,count:actions.length}); return freeze({ batchId:id, originalCount:batch.actions.length, executedCount:actions.length, results:freeze(results) }); }
    dispatchBatch(actions,options) { const id=this.beginBatch(options); (actions||[]).forEach(a=>this.addToBatch(id,a)); return this.commitBatch(id); }
    setDeduplicationStrategy(strategy) { if (typeof strategy!=='function') throw new Error('Deduplication strategy must be a function.'); this.deduplicationStrategy=strategy; return this; }
    setCoalescingStrategy(strategy) { if (typeof strategy!=='function') throw new Error('Coalescing strategy must be a function.'); this.coalescingStrategy=strategy; return this; }

    beginTransaction(options) { const id=uid('transaction'); this.transactions.set(id,{id, options:Object.assign({},options||{}), operations:[], compensations:[], status:'open'}); return id; }
    addToTransaction(id, action, compensation) { const tx=this.transactions.get(id); if (!tx || tx.status!=='open') throw new Error('Transaction is not open.'); tx.operations.push(this._normalizeAction(action,0)); tx.compensations.push(typeof compensation==='function'?compensation:null); return tx.operations.length; }
    getTransaction(id) { const tx=this.transactions.get(id); return tx ? freeze({id:tx.id,status:tx.status,size:tx.operations.length}) : null; }
    async commitTransaction(id) { const tx=this.transactions.get(id); if (!tx || tx.status!=='open') throw new Error('Transaction is not open.'); const results=[]; try { for (const action of tx.operations) results.push(await this._execute(action)); tx.status='committed'; this.metrics.transactionsCommitted++; this._emit('transaction:committed',{transactionId:id}); return freeze({transactionId:id,status:tx.status,results:freeze(results)}); } catch(error) { await this.rollbackTransaction(id,error); throw error; } }
    async rollbackTransaction(id, reason) { const tx=this.transactions.get(id); if (!tx) return false; for (let i=tx.compensations.length-1;i>=0;i--) if (tx.compensations[i]) await tx.compensations[i](reason); tx.status='rolled-back'; this.metrics.transactionsRolledBack++; this._emit('transaction:rolled-back',{transactionId:id,reason}); return true; }

    setRetryPolicy(policy) { this.retryPolicy=Object.assign({},this.retryPolicy,policy||{}); return this; }
    setTimeoutPolicy(policy) { if (policy && Number.isFinite(policy.defaultTimeout)) this.options.defaultTimeout=policy.defaultTimeout; return this; }
    getFailures() { return freeze(this.failures.slice()); }
    clearFailures() { this.failures.length=0; return this; }
  }

  function create(options) { return new SemanticActionEngine(options); }
  return freeze({ VERSION, DEFAULT_PHASES:freeze(DEFAULT_PHASES.slice()), create, SemanticActionEngine });
});
