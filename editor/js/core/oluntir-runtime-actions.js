(function (root) {
  'use strict';
  let engine = null;
  const actionTypes = [
    'editor.loaded','page.selected','page.created','page.renamed','page.deleted','project.saved',
    'component.added','component.updated','component.removed','shared-content.updated','gallery.updated',
    'export.started','export.completed','export.failed'
  ];
  function ensure() {
    if (engine) return engine;
    if (!root.OluntirActionEngine) return null;
    engine = root.OluntirActionEngine.create({ autoStart: true, maxQueue: 20000, maxDepth: 16 });
    actionTypes.forEach(type => engine.defineAction({ type, version: 1, category: type.split('.')[0], priority: 50, batchable: true, cancellable: false }));
    actionTypes.forEach(type => engine.registerHandler(type, context => {
      const category = type.indexOf('export.') === 0 ? 'export' : type.indexOf('shared-content.') === 0 ? 'shared-content' : 'action';
      const level = type.endsWith('.failed') ? 'error' : 'info';
      const logger = root.OluntirLogger;
      if (logger && logger[level]) logger[level](category, type, context.action.payload || {});
      return true;
    }, { id: 'runtime-log:' + type, phase: 'execute', priority: 10 }));
    return engine;
  }
  function emit(type, payload, metadata) {
    const current = ensure();
    if (!current || !current.hasAction(type)) return Promise.resolve(null);
    return current.dispatch({ type, payload: payload || {}, metadata: metadata || {} }).catch(error => {
      if (root.OluntirLogger) root.OluntirLogger.error('error', 'Runtime action failed', { type, error });
      return null;
    });
  }
  root.OluntirRuntimeActions = Object.freeze({ ensure, emit, getEngine: () => engine });
})(window);
