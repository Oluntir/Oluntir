const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const context={console,setTimeout,clearTimeout,setInterval,clearInterval,performance:{now:()=>Date.now()},Date,Map,Set,WeakMap,Promise,Object,Array,Number,String,Error,globalThis:null,window:null}; context.globalThis=context; context.window=context;
const entries=[]; context.OluntirLogger={info:(c,m,d)=>entries.push({c,m,d}),error:(c,m,d)=>entries.push({c,m,d}),debug(){},performance(){}};
vm.runInNewContext(fs.readFileSync('editor/js/core/semantic-action-engine.js','utf8'),context);
vm.runInNewContext(fs.readFileSync('editor/js/core/oluntir-runtime-actions.js','utf8'),context);
context.OluntirRuntimeActions.emit('export.completed',{pages:3}).then(()=>{
  assert.ok(entries.some(e=>e.m==='export.completed'));
  console.log('OLUNTIR-RUNTIME-ACTIONS-TEST ERFOLGREICH');
}).catch(e=>{console.error(e);process.exit(1);});
