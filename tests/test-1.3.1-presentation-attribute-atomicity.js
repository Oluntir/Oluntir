const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('editor/js/core/presentation-vocabulary.js', 'utf8');
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const api = sandbox.window.OluntirPresentationApi;
function component(attrs, style) {
  return {
    attrs: Object.assign({}, attrs), style: Object.assign({}, style),
    getAttributes(){ return this.attrs; }, getStyle(){ return this.style; },
    setStyle(value){ this.style = Object.assign({}, value); },
    set(name,value){ if(name==='attributes') this.attrs=Object.assign({},value); },
    components(){ return []; }
  };
}
const c = component({
  'data-oluntir-presentation-fontsize':'1.5rem',
  'data-oluntir-presentation-color':'#ffffff',
  style:'font-size: 1.5rem; color: #ffffff'
}, {'font-size':'1.5rem','color':'#ffffff'});
api.apply(c, {'font-size':'3rem','color':'#3e4d5b'}, {persistInline:true});
if (c.attrs['data-oluntir-presentation-font-size'] !== '3rem') throw new Error('Canonical font-size contract not updated');
if (c.attrs['data-oluntir-presentation-color'] !== '#3e4d5b') throw new Error('Color contract not updated');
if ('data-oluntir-presentation-fontsize' in c.attrs) throw new Error('Legacy lowercase attribute survived');
if (!/font-size:\s*3rem/.test(c.attrs.style) || !/color:\s*#3e4d5b/.test(c.attrs.style)) throw new Error('Inline style not updated atomically');
const captured = api.capture(c);
if (captured['font-size'] !== '3rem' || captured.color !== '#3e4d5b') throw new Error('Capture returned stale values');
console.log('OLUNTIR-1.3.1-PRESENTATION-ATTRIBUTE-ATOMICITY-TEST ERFOLGREICH');
