const fs = require('fs');
const gallery = fs.readFileSync('editor/js/features/gallery.js', 'utf8');
const framework = fs.readFileSync('editor/js/core/framework.js', 'utf8');
const bs4 = fs.readFileSync('assets/css/pagebuilder-bs4.css', 'utf8');
const bs5 = fs.readFileSync('assets/css/pagebuilder-bs5.css', 'utf8');
function must(v, m) { if (!v) throw new Error(m); }
must(gallery.includes("baseClass: 'fa'"), 'BS4 icon source missing');
must(gallery.includes("baseClass: 'fas'"), 'BS5 icon source missing');
must(gallery.includes("fa-arrows-alt"), 'Zoom icon missing');
must(gallery.includes("fa-download"), 'Download icon missing');
must(gallery.includes("root.find('.pb-gallery-open-button')"), 'Zoom migration missing');
must(gallery.includes("root.find('.portfolio-download')"), 'Download migration missing');
must(framework.includes('plugins/editor/font-awesome/css/font-awesome.min.css'), 'BS4 FA4 canvas source missing');
must(framework.includes('plugins/site/css/font-awesome/all.min.css'), 'BS5 icon canvas source missing');
must(/\.pb-gallery-action\s*>\s*\.fa\s*\{/.test(bs4), 'BS4 icon visibility rule missing');
must(/\.pb-gallery-action\s*>\s*\.fas\s*\{/.test(bs5), 'BS5 icon visibility rule missing');
console.log('GALLERY ICON SOURCE TEST ERFOLGREICH');
