(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirLogger = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const VERSION = 2;
  const LEVELS = Object.freeze({ off: 999, trace: 10, debug: 20, info: 30, warn: 40, error: 50, fatal: 60 });
  const FILES = Object.freeze({
    action: 'action.log', dependency: 'dependency.log', resolver: 'resolver.log',
    'shared-content': 'shared-content.log', repeat: 'repeat.log', export: 'export.log',
    validator: 'validator.log', performance: 'performance.log', error: 'error.log', session: 'session.log'
  });
  const SENSITIVE_KEY = /(password|passwd|pwd|token|secret|authorization|cookie|sessioncookie|api[-_]?key|credential|private[-_]?key)/i;
  const PATH_USER = /([A-Za-z]:\\Users\\)[^\\/]+/gi;
  const state = {
    level: 'off', maxEntries: 10000, maxFileBytes: 2 * 1024 * 1024, maxRotations: 5,
    flushIntervalMs: 1000, buffer: [], pending: [], directoryHandle: null, displayPath: null,
    timer: null, sessionId: createId('session'), sequence: 0, dropped: 0, writing: false,
    enabled: false, consent: false
  };

  function createId(prefix) {
    createId._n = (createId._n || 0) + 1;
    return prefix + ':' + Date.now().toString(36) + ':' + createId._n.toString(36);
  }
  function redactString(value) {
    return String(value)
      .replace(PATH_USER, '$1[USER]')
      .replace(/(Bearer\s+)[A-Za-z0-9._~+\/-]+=*/gi, '$1[REDACTED]')
      .replace(/([?&](?:token|key|secret|password)=)[^&\s]+/gi, '$1[REDACTED]');
  }
  function safe(value, seen) {
    if (value == null) return value;
    if (typeof value === 'string') return redactString(value);
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    if (value instanceof Error) return { name: value.name, message: redactString(value.message), stack: redactString(value.stack || '') || null };
    const visited = seen || new WeakSet();
    if (typeof value === 'object') {
      if (visited.has(value)) return '[Circular]';
      visited.add(value);
      if (Array.isArray(value)) return value.map(item => safe(item, visited));
      const output = {};
      Object.keys(value).forEach((key) => { output[key] = SENSITIVE_KEY.test(key) ? '[REDACTED]' : safe(value[key], visited); });
      return output;
    }
    return redactString(value);
  }
  function normalizeCategory(value) { return Object.prototype.hasOwnProperty.call(FILES, value) ? value : 'session'; }
  function shouldLog(level) { return state.consent && state.enabled && state.level !== 'off' && LEVELS[level] >= LEVELS[state.level]; }
  function format(entry) { return JSON.stringify(entry) + '\n'; }
  async function rotate(directory, filename) {
    let handle;
    try { handle = await directory.getFileHandle(filename, { create: false }); } catch (_) { return; }
    const file = await handle.getFile();
    if (file.size < state.maxFileBytes) return;
    for (let index = state.maxRotations - 1; index >= 1; index--) {
      try {
        const sourceHandle = await directory.getFileHandle(filename + '.' + index, { create: false });
        const sourceFile = await sourceHandle.getFile();
        const targetHandle = await directory.getFileHandle(filename + '.' + (index + 1), { create: true });
        const writable = await targetHandle.createWritable();
        await writable.write(await sourceFile.arrayBuffer()); await writable.close();
      } catch (_) {}
    }
    try {
      const target = await directory.getFileHandle(filename + '.1', { create: true });
      const writable = await target.createWritable(); await writable.write(await file.arrayBuffer()); await writable.close();
      const current = await directory.getFileHandle(filename, { create: true });
      const reset = await current.createWritable(); await reset.write(''); await reset.close();
    } catch (_) {}
  }
  async function append(directory, filename, text) {
    await rotate(directory, filename);
    const handle = await directory.getFileHandle(filename, { create: true });
    const file = await handle.getFile();
    const writable = await handle.createWritable({ keepExistingData: true });
    await writable.seek(file.size); await writable.write(text); await writable.close();
  }
  async function flush() {
    if (state.writing || !state.pending.length) return { written: 0, pending: state.pending.length };
    if (!state.consent || !state.directoryHandle) return { written: 0, pending: state.pending.length, reason: 'logs-folder-not-authorized' };
    state.writing = true;
    const batch = state.pending.splice(0);
    try {
      const grouped = new Map();
      batch.forEach((entry) => {
        const filename = FILES[entry.category] || FILES.session;
        if (!grouped.has(filename)) grouped.set(filename, []);
        grouped.get(filename).push(format(entry));
      });
      for (const [filename, lines] of grouped) await append(state.directoryHandle, filename, lines.join(''));
      return { written: batch.length, pending: state.pending.length };
    } catch (error) {
      state.pending.unshift.apply(state.pending, batch);
      if (root && root.console) root.console.error('OluntirLogger flush failed:', error);
      return { written: 0, pending: state.pending.length, error: redactString(error && error.message || error) };
    } finally { state.writing = false; }
  }
  function scheduleFlush() {
    if (state.timer || typeof setInterval !== 'function' || !state.consent) return;
    state.timer = setInterval(function () { flush(); }, state.flushIntervalMs);
    if (state.timer && typeof state.timer.unref === 'function') state.timer.unref();
  }
  function stopTimer() { if (state.timer) clearInterval(state.timer); state.timer = null; }
  function write(level, category, message, data) {
    if (!shouldLog(level)) return null;
    const entry = Object.freeze({
      timestamp: new Date().toISOString(), sequence: ++state.sequence, sessionId: state.sessionId,
      level, category: normalizeCategory(category), message: redactString(message || ''), data: safe(data)
    });
    state.buffer.push(entry); state.pending.push(entry);
    if (state.buffer.length > state.maxEntries) { state.buffer.shift(); state.dropped++; }
    scheduleFlush();
    if (level === 'error' || level === 'fatal') flush();
    return entry;
  }
  function configure(options) {
    const value = options || {};
    if (value.level && Object.prototype.hasOwnProperty.call(LEVELS, value.level)) state.level = value.level;
    if (Number.isFinite(value.maxEntries) && value.maxEntries > 0) state.maxEntries = value.maxEntries;
    if (Number.isFinite(value.maxFileBytes) && value.maxFileBytes > 0) state.maxFileBytes = value.maxFileBytes;
    if (Number.isFinite(value.maxRotations) && value.maxRotations >= 1) state.maxRotations = value.maxRotations;
    if (Number.isFinite(value.flushIntervalMs) && value.flushIntervalMs >= 100) state.flushIntervalMs = value.flushIntervalMs;
    if (typeof value.enabled === 'boolean') state.enabled = value.enabled;
    return getState();
  }
  function getState() { return Object.freeze({ version: VERSION, level: state.level, enabled: state.enabled, consent: state.consent, sessionId: state.sessionId, buffered: state.buffer.length, pending: state.pending.length, dropped: state.dropped, connected: Boolean(state.directoryHandle), displayPath: state.displayPath }); }
  function entries(filter) { const value = filter || {}; return Object.freeze(state.buffer.filter((entry) => (!value.level || entry.level === value.level) && (!value.category || entry.category === value.category)).slice()); }
  function clear() { state.buffer.length = 0; state.pending.length = 0; state.dropped = 0; return true; }
  function authorizeDirectory(handle, displayPath, level) {
    state.directoryHandle = handle || null; state.displayPath = displayPath || (handle && handle.name) || null;
    state.consent = Boolean(handle); state.enabled = Boolean(handle); state.level = level || (handle ? 'info' : 'off');
    if (state.consent) { scheduleFlush(); write('info', 'session', 'Oluntir logging authorized', { logDirectory: state.displayPath, privacyMode: 'data-minimized' }); }
    return getState();
  }
  async function revoke(options) {
    write('info', 'session', 'Oluntir logging revoked by user', { logDirectory: state.displayPath });
    await flush(); stopTimer(); state.directoryHandle = null; state.displayPath = null; state.consent = false; state.enabled = false; state.level = 'off';
    if (!options || options.clearBuffer !== false) clear();
    return getState();
  }
  function performance(category, message, durationMs, data) { return write('info', 'performance', message, Object.assign({ sourceCategory: category, durationMs: Number(durationMs || 0) }, safe(data) || {})); }
  function captureGlobalErrors() {
    if (!root || !root.addEventListener || captureGlobalErrors.done) return;
    captureGlobalErrors.done = true;
    root.addEventListener('error', function (event) { write('error', 'error', event.message || 'Unhandled error', { filename: event.filename, line: event.lineno, column: event.colno, error: safe(event.error) }); });
    root.addEventListener('unhandledrejection', function (event) { write('error', 'error', 'Unhandled promise rejection', { reason: safe(event.reason) }); });
  }
  captureGlobalErrors();

  return Object.freeze({ VERSION, LEVELS, FILES, configure, getState, entries, clear, flush, authorizeDirectory, revoke,
    trace: (c,m,d)=>write('trace',c,m,d), debug: (c,m,d)=>write('debug',c,m,d), info: (c,m,d)=>write('info',c,m,d),
    warn: (c,m,d)=>write('warn',c,m,d), error: (c,m,d)=>write('error',c,m,d), fatal: (c,m,d)=>write('fatal',c,m,d), performance });
});
