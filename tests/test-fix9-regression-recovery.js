const fs = require('fs');
function must(v,m){if(!v) throw new Error(m);}
const editor=fs.readFileSync('editor/js/core/editor.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const doc=fs.readFileSync('editor/js/core/oluntir-document-api.js','utf8');
must(editor.includes("id: 'pb-ui-toolbar-backup-save'"), 'Backup toolbar button missing');
must(editor.includes("icon: 'fa fa-archive'"), 'Backup archive icon missing');
must(editor.includes("document.getElementById('page-select')") && editor.includes('selectPageById'), 'Page selection population missing');
must(!index.includes('oluntir-history-service.js'), 'Experimental history service still loaded');
must(!doc.includes('OluntirHistoryService'), 'Document API still coupled to experimental history');
must(!doc.includes('oluntirHistoryCursor'), 'Editor-root history cursor still present');
console.log('FIX9-REGRESSION-RECOVERY-TEST ERFOLGREICH');
