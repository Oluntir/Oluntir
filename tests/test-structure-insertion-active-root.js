function must(v,m){ if(!v) throw new Error(m); }
global.OluntirDocumentApi={ buildInsertionModel(){ return Object.freeze({schemaVersion:2,pageId:'ol_page_test',roots:Object.freeze([{identity:'ol_component_container',type:'div',children:Object.freeze([])}]),nodes:Object.freeze([{identity:'ol_component_container',type:'div'},{identity:'ol_row_test',type:'row'}]),slots:Object.freeze([{pageId:'ol_page_test',parentIdentity:'ol_component_container',anchorIdentity:'ol_row_test',mode:'before'}])}); } };
const service=require('../editor/js/core/structure-insertion-target.js');
const model=service.buildModel({});
must(model.nodes.length===2,'Document API structure was not used');
must(model.nodes[0].type==='div','DIV missing from document API model');
must(model.nodes[1].type==='row','ROW missing from document API model');
must(model.slots[0].parentIdentity==='ol_component_container','Identity target missing');
console.log('STRUCTURE-INSERTION-ACTIVE-ROOT-TEST ERFOLGREICH');
