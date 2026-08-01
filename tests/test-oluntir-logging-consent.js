const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const loggerCode = fs.readFileSync('editor/js/core/oluntir-logger.js', 'utf8');
const files = new Map();
function fileHandle(name) {
  return {
    async getFile() { const data = files.get(name) || ''; return { size: Buffer.byteLength(data), arrayBuffer: async () => Buffer.from(data) }; },
    async createWritable() { let data = files.get(name) || ''; return { async seek(pos){ this.pos=pos; }, async write(value){ const text=Buffer.isBuffer(value)?value.toString():String(value); data=(this.pos!=null?data.slice(0,this.pos):'')+text; files.set(name,data); }, async close(){} }; }
  };
}
const directory = { name:'logs', async getFileHandle(name){ return fileHandle(name); } };
const context = { console, setInterval, clearInterval, Date, JSON, Object, Number, String, Error, WeakSet, Map, Buffer, globalThis:null };
context.globalThis=context;
vm.runInNewContext(loggerCode, context);
const logger=context.OluntirLogger;
assert.strictEqual(logger.getState().enabled,false);
assert.strictEqual(logger.info('session','before consent'),null);
logger.authorizeDirectory(directory,'D:\\Oluntir\\logs','info');
logger.info('action','test',{password:'secret',path:'C:\\Users\\Sebastian\\project'});
logger.flush().then(result=>{
  assert.ok(result.written>=2);
  const text=files.get('action.log');
  assert.ok(text.includes('[REDACTED]'));
  assert.ok(text.includes('C:\\\\Users\\\\[USER]'));
  console.log('OLUNTIR-LOGGING-CONSENT-TEST ERFOLGREICH');
}).catch(error=>{ console.error(error); process.exit(1); });
