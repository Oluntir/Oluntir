const fs = require('fs');
function must(v,m){ if(!v) throw new Error(m); }
const gallery=fs.readFileSync('editor/js/features/gallery.js','utf8');
const link=fs.readFileSync('editor/js/features/link-editor.js','utf8');
const adapter=fs.readFileSync('editor/integrations/grapesjs/grapesjs-adapter.js','utf8');
const bs5=fs.readFileSync('editor/js/features/blocks-bs5.js','utf8');
const runtime=fs.readFileSync('assets/js/pagebuilder-bs5-gallery.js','utf8');
must(!gallery.includes('editorInstance.select(item);'), 'Galerievisual darf nicht auf Wrapper umgeleitet werden.');
must(link.includes("hasClass(component, 'pb-bs5-gallery-open')"), 'BS5-Galerietrigger fehlt in Erkennung.');
must(link.includes('window.OluntirOpenGalleryAssetManager'), 'Gemeinsamer Galerie-Bildmanager fehlt.');
must(adapter.includes("source: 'selected-image'"), 'Toolbar-Bildmanager besitzt keinen Zuweisungsmodus.');
must(bs5.includes('data-oluntir-gallery-image'), 'BS5-Block besitzt keinen neutralen Bildvertrag.');
must(runtime.includes('if (editorDesignMode()) return;'), 'Galerie-Runtime ist im Bearbeitungsmodus nicht gesperrt.');
console.log('Framework gallery editor contract passed.');
