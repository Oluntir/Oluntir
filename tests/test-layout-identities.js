'use strict';
const assert = require('assert');
const ids = require('../editor/js/core/layout-identities.js');
class Collection { constructor(models=[]) { this.models=models; } add(model){ this.models.push(model); return model; } }
class Component {
  constructor(tagName='div', attrs={}, children=[]) { this.data={tagName,type:tagName==='body'?'wrapper':'',attributes:{...attrs}}; this.childCollection=new Collection(children); children.forEach(c=>c._parent=this); }
  get(k){ return this.data[k]; } set(k,v){ this.data[k]=v; } getAttributes(){ return this.data.attributes; }
  addAttributes(a){ Object.assign(this.data.attributes,a); } getClasses(){ return String(this.data.attributes.class||'').split(/\s+/).filter(Boolean); }
  components(){ return this.childCollection; } parent(){ return this._parent || null; }
  toJSON(){ return {tagName:this.data.tagName, attributes:{...this.data.attributes}, components:this.childCollection.models.map(c=>c.toJSON())}; }
}
class Page { constructor(id,root){ this.id=id; this.data={}; this.root=root; } get(k){return this.data[k];} set(k,v){this.data[k]=v;} getMainComponent(){return this.root;} }
function editorFor(pages){ return {Pages:{getAll:()=>pages}, on:()=>{}}; }
const card=new Component('div',{'class':'card'}); const slot=new Component('div',{'class':'col-md-6'},[card]); const row=new Component('div',{'class':'row'},[slot]); const section=new Component('section',{},[row]); const root=new Component('body',{},[section]); const page=new Page('p1',root); const editor=editorFor([page]);
let result=ids.ensureAll(editor); assert.equal(result.changed,true); const first=JSON.stringify(root.toJSON());
result=ids.ensureAll(editor); assert.equal(result.changed,false); assert.equal(JSON.stringify(root.toJSON()),first);
assert.ok(root.getAttributes()[ids.ATTR.page]); assert.ok(section.getAttributes()[ids.ATTR.section]); assert.ok(row.getAttributes()[ids.ATTR.row]); assert.ok(slot.getAttributes()[ids.ATTR.slot]); assert.ok(card.getAttributes()[ids.ATTR.component]);
const duplicate=new Component('div',{'class':'card',[ids.ATTR.component]:card.getAttributes()[ids.ATTR.component]}); slot.components().add(duplicate); duplicate._parent=slot;
ids.ensureAll(editor); assert.notEqual(duplicate.getAttributes()[ids.ATTR.component],card.getAttributes()[ids.ATTR.component]);
const exported=ids.stripInternalAttributes('<section data-oluntir-section-id="x"><div data-oluntir-component-id="y">OK</div></section>');
assert.equal(exported,'<section><div>OK</div></section>');
console.log('LAYOUT-IDENTITIES-TEST ERFOLGREICH');
