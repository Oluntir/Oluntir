const assert = require('assert');
const adapterApi = require('../editor/js/core/repeat-sync-access-adapter.js');
const syncApi = require('../editor/js/core/targeted-synchronization-service.js');

function make(def, parentRef) {
  const state = Object.assign({}, def || {}, { attributes: Object.assign({}, def && def.attributes || {}), components: [] });
  let parent = parentRef || null;
  const item = {
    get(key){ return state[key]; }, set(key,value){ state[key]=value; }, unset(key){ delete state[key]; },
    getAttributes(){ return Object.assign({}, state.attributes); },
    setAttributes(value){ state.attributes=Object.assign({},value||{}); },
    addAttributes(value){ state.attributes=Object.assign({},state.attributes,value||{}); },
    parent(){ return parent; }, index(){ return parent ? parent.components().models.indexOf(item) : 0; },
    move(next, options){ if(parent){ const i=parent.components().models.indexOf(item); if(i>=0) parent.components().models.splice(i,1); } parent=next; next.components().models.splice(options.at,0,item); },
    remove(){ if(parent){ const i=parent.components().models.indexOf(item); if(i>=0) parent.components().models.splice(i,1); parent=null; } },
    components(){ return collection; },
    toJSON(){ const out={}; Object.keys(state).forEach(key=>{ if(key!=='components') out[key]=JSON.parse(JSON.stringify(state[key])); }); out.attributes=Object.assign({},state.attributes); out.components=state.components.map(child=>child.toJSON()); return out; }
  };
  const collection={ models:state.components, add(childDef,options){ const child=make(childDef,item); state.components.splice(options&&Number.isInteger(options.at)?options.at:state.components.length,0,child); return child; }, remove(child){ const i=state.components.indexOf(child); if(i>=0) state.components.splice(i,1); } };
  (def && def.components || []).forEach(child=>collection.add(child));
  return item;
}
function page(id, root){ return { get(key){ return key==='oluntirPageId'?id:null; }, getMainComponent(){ return root; } }; }

const source=make({ tagName:'section', attributes:{'data-oluntir-section-id':'source-root'}, components:[
  {tagName:'p',attributes:{'data-oluntir-component-id':'source-a'},content:'A'},
  {tagName:'p',attributes:{'data-oluntir-component-id':'source-b'},content:'B'}
]});
const targetOne=make({ tagName:'section', attributes:{'data-oluntir-section-id':'target-one'}, components:[
  {tagName:'p',attributes:{'data-oluntir-component-id':'target-a'},content:'Alt'}
]});
const targetTwo=make({ tagName:'aside', attributes:{'data-oluntir-section-id':'target-two'}, components:[] });
const editor={ Pages:{ getAll(){ return [page('source-page',source),page('target-page-one',targetOne),page('target-page-two',targetTwo)]; } } };
const beforeOne=targetOne.toJSON();
const beforeTwo=targetTwo.toJSON();
const adapter=adapterApi.create(editor);
const service=syncApi.create();
const plan={ schemaVersion:1,type:'repeat-targeted-sync-plan',valid:true,blocked:false,cycleCount:0,operations:[
  {operationId:'op-1',definitionId:'d1',instanceId:'i1',sourcePageId:'source-page',sourceIdentity:'source-root',targetPageId:'target-page-one',targetIdentity:'target-one'},
  {operationId:'op-2',definitionId:'d1',instanceId:'i2',sourcePageId:'source-page',sourceIdentity:'source-root',targetPageId:'target-page-two',targetIdentity:'target-two'}
]};
const result=service.execute(plan,adapter);
assert.strictEqual(result.status, syncApi.STATUS.ROLLED_BACK);
assert.strictEqual(result.executionEnabled, true);
assert.strictEqual(result.mutationPerformed, false);
assert.deepStrictEqual(targetOne.toJSON(), beforeOne);
assert.deepStrictEqual(targetTwo.toJSON(), beforeTwo);
console.log('Repeat structural execution gate 1.3.1: OK');
