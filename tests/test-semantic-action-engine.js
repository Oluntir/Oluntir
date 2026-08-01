const assert = require('assert');
const api = require('../editor/js/core/semantic-action-engine.js');

(async () => {
  const engine = api.create({ autoStart: true, maxQueue: 20000 });
  engine.defineAction({ type: 'component.updated', batchable: true });
  const order = [];
  engine.use(ctx => { ctx.data.middleware = true; }, { id: 'mw', priority: 1 });
  engine.beforePhase('identify', () => order.push('before-identify'));
  engine.registerHandler('component.updated', ctx => { order.push('identify'); ctx.data.identity = ctx.action.payload.id; }, { id: 'identify', phase: 'identify' });
  engine.registerHandler('component.updated', ctx => { order.push('execute'); return ctx.data.identity; }, { id: 'execute', phase: 'execute' });
  const single = await engine.dispatch({ type: 'component.updated', payload: { id: 'cmp-1' } });
  assert.equal(single.status, 'completed');
  assert.deepEqual(order, ['before-identify', 'identify', 'execute']);
  assert.equal(single.results[1].value, 'cmp-1');

  let calls = 0;
  engine.registerHandler('component.updated', () => { calls++; }, { id: 'count', phase: 'execute', priority: 100 });
  const actions = Array.from({ length: 1000 }, (_, i) => ({ type: 'component.updated', payload: { id: 'same', value: i }, deduplicationKey: 'same' }));
  const batch = await engine.dispatchBatch(actions, { deduplicate: true });
  assert.equal(batch.originalCount, 1000);
  assert.equal(batch.executedCount, 1);
  assert.equal(calls, 1);
  assert.equal(engine.getMetrics().deduplicated, 999);

  const txLog = [];
  engine.defineAction('transaction.step');
  engine.registerHandler('transaction.step', ctx => { txLog.push(ctx.action.payload.value); if (ctx.action.payload.fail) throw new Error('expected'); }, { phase: 'execute' });
  const tx = engine.beginTransaction();
  engine.addToTransaction(tx, { type: 'transaction.step', payload: { value: 1 } }, () => txLog.push('undo-1'));
  engine.addToTransaction(tx, { type: 'transaction.step', payload: { value: 2, fail: true } }, () => txLog.push('undo-2'));
  await assert.rejects(() => engine.commitTransaction(tx));
  assert.deepEqual(txLog, [1, 2, 'undo-2', 'undo-1']);
  assert.equal(engine.getTransaction(tx).status, 'rolled-back');

  engine.defineAction('load.test');
  let loadCount = 0;
  engine.registerHandler('load.test', () => { loadCount++; }, { phase: 'execute' });
  const start = Date.now();
  for (let i = 0; i < 10000; i++) engine.dispatchSync({ type: 'load.test', payload: i });
  const duration = Date.now() - start;
  assert.equal(loadCount, 10000);
  assert.equal(engine.getMetrics().completed >= 10002, true);
  assert.equal(engine.getState().queueLength, 0);
  assert.equal(engine.listActions().length >= 3, true);
  assert.equal(engine.listPhases().length, 9);
  console.log('SEMANTIC-ACTION-ENGINE-TEST ERFOLGREICH', duration + 'ms/10000');
})().catch(error => { console.error(error); process.exit(1); });
