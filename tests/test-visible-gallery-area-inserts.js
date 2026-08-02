const fs=require('fs');
const path=require('path');
function assert(cond,msg){if(!cond)throw new Error(msg);}
const root=path.resolve(__dirname,'..');
const js=fs.readFileSync(path.join(root,'editor/js/core/structure-insertion-target.js'),'utf8');
const css=fs.readFileSync(path.join(root,'editor/css/editor.css'),'utf8');
assert(js.includes('Neuen Galerie-Bereich hier einschieben'),'Visible insert action label missing');
assert(js.includes('oluntir-gallery-area-insert-block'),'Dedicated inter-container insert block missing');
assert(js.includes('oluntir-gallery-area-insert-action'),'Dedicated inter-container insert action missing');
assert(css.includes('.oluntir-gallery-area-insert-block'),'Insert block CSS missing');
assert(css.includes('border-top:3px solid #ff6500'),'Visible orange insertion rail missing');
assert(css.includes('font-size:2rem'),'Left insertion arrow not prominent enough');
console.log('VISIBLE-GALLERY-AREA-INSERTS-TEST ERFOLGREICH');
