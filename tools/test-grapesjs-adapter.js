const fs = require('fs');
const vm = require('vm');
const root = process.argv[2] || '.';
const commands = new Map([['open-assets', { legacy: true }]]);
let opened = false;
const editor = {
  Commands: {
    get: (id) => commands.get(id),
    remove: (id) => commands.delete(id),
    add: (id, command) => commands.set(id, command)
  },
  Modal: {}, AssetManager: {}, Pages: {}
};
global.window = {
  grapesjs: { version: '0.23.2' },
  OLUNTIR_EDITOR_DEPENDENCIES: { grapesjs: { tested: '0.23.2', minimum: '0.23.0' } },
  OluntirImageSelect: {
    register(adapter) {
      adapter.setImageSelector({ open() { opened = true; }, close() {}, isOpen() { return opened; } });
    }
  }
};
for (const file of [
  'editor/integrations/grapesjs/grapesjs-compatibility.js',
  'editor/integrations/grapesjs/grapesjs-adapter.js'
]) vm.runInThisContext(fs.readFileSync(`${root}/${file}`, 'utf8'), { filename: file });
const adapter = window.OluntirGrapesAdapter.create(editor);
const test = adapter.selfTest();
if (!test.compatibility.supported || !test.selector || !test.command) throw new Error(JSON.stringify(test));
commands.get('open-assets').run(editor, null, {});
if (!opened) throw new Error('open-assets did not open the Oluntir selector');
console.log('GRAPESJS-ADAPTER-TEST ERFOLGREICH');
