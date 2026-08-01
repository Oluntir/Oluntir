const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('editor/js/core/developer-diagnostics-center.js','utf8');
const nodes = new Map();
function node(){ return { hidden:true, checked:true, textContent:'', dataset:{}, children:[], setAttribute(){}, addEventListener(){}, appendChild(v){this.children.push(v);}, click(){} }; }
['oluntir-diagnostics-open','oluntir-diagnostics-close','oluntir-diagnostics-done','oluntir-diagnostics-refresh','oluntir-diagnostics-graph','oluntir-diagnostics-live','oluntir-diagnostics-export','oluntir-diagnostics-clear','oluntir-diagnostics-modal','oluntir-diagnostics-runtime','oluntir-diagnostics-actions','oluntir-diagnostics-shared','oluntir-diagnostics-dependency','oluntir-diagnostics-logs','oluntir-diagnostics-status'].forEach(id=>nodes.set(id,node()));
const editor={Pages:{getAll:()=>[{getId:()=> 'index'}],getSelected:()=>({getId:()=> 'index'})}};
const window={OluntirEditor:editor,OluntirLogger:{getState:()=>({connected:true}),entries:()=>[],clear(){},info(){}},OluntirRuntimeActions:{getEngine:()=>null},OluntirSharedContentManager:{getDiagnostics:()=>({selectedUpToDate:true})},setInterval:()=>1,clearInterval(){},performance:{},setTimeout};
const document={readyState:'complete',getElementById:id=>nodes.get(id),createElement:()=>node()};
window.document=document;
vm.runInNewContext(code,{window,document,Blob:function(){},URL:{createObjectURL:()=>'',revokeObjectURL(){}},setTimeout,console});
const snap=window.OluntirDiagnostics.collect();
if(!snap.runtime.editorReady || snap.runtime.pageCount!==1) throw new Error('runtime snapshot failed');
if(!snap.sharedContent.selectedUpToDate) throw new Error('shared snapshot failed');
console.log('DEVELOPER-DIAGNOSTICS-CENTER-TEST ERFOLGREICH');
