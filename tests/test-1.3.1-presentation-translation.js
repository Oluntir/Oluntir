const fs = require('fs');
const vm = require('vm');
const path = require('path');

function component(attrs = {}, style = {}, children = []) {
  return {
    attrs: Object.assign({}, attrs), style: Object.assign({}, style), children,
    getAttributes(){ return Object.assign({}, this.attrs); },
    getStyle(){ return Object.assign({}, this.style); },
    setStyle(value){ this.style = Object.assign({}, value || {}); },
    addStyle(value){ Object.assign(this.style, value || {}); },
    set(name, value){ if(name === 'attributes') this.attrs = Object.assign({}, value || {}); },
    addAttributes(value){ Object.assign(this.attrs, value || {}); },
    components(){ return { models: this.children }; }
  };
}
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../editor/js/core/presentation-vocabulary.js'),'utf8'), sandbox);
const api = sandbox.window.OluntirPresentationApi;
if (!api || api.schemaVersion !== 2) throw new Error('Presentation API v2 fehlt');
const source = component();
api.apply(source, { color:'#000000', 'font-size':'1.5rem' }, { persistInline:true });
if (source.attrs['data-oluntir-presentation-color'] !== '#000000') throw new Error('Farbe nicht semantisch persistiert');
if (source.attrs['data-oluntir-presentation-font-size'] !== '1.5rem') throw new Error('Schriftgröße nicht semantisch persistiert');
if (!/color: #000000/.test(source.attrs.style) || !/font-size: 1.5rem/.test(source.attrs.style)) throw new Error('Inline-Übersetzung fehlt');
const target = component(Object.assign({}, source.attrs), {});
api.hydrate(target, false);
if (target.style.color !== '#000000' || target.style['font-size'] !== '1.5rem') throw new Error('Rehydration auf Zielseite fehlgeschlagen');
const copied = component();
api.copy(source, copied);
if (copied.style.color !== '#000000' || copied.style['font-size'] !== '1.5rem') throw new Error('API-Übergabe fehlgeschlagen');
console.log('OLUNTIR-1.3.1-PRESENTATION-TRANSLATION-TEST ERFOLGREICH');
