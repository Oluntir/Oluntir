const fs = require('fs');
const gallery = fs.readFileSync('editor/js/features/gallery.js', 'utf8');
const framework = fs.readFileSync('editor/js/core/framework.js', 'utf8');
const exporter = fs.readFileSync('editor/js/core/export.js', 'utf8');

function must(condition, message) {
  if (!condition) throw new Error(message);
}

must(gallery.includes("baseClass: 'fa'"), 'BS4 gallery source must use Font Awesome 4 base class fa');
must(gallery.includes("baseClass: 'fas'"), 'BS5 gallery source must use Font Awesome 5-style base class fas');
must(gallery.includes("zoomClass: 'fa-arrows-alt'"), 'Zoom icon source missing');
must(gallery.includes("downloadClass: 'fa-download'"), 'Download icon source missing');

must(framework.includes("'plugins/editor/font-awesome/css/font-awesome.min.css'"), 'BS4 canvas does not load FA 4.7');
must(framework.includes("'plugins/site/css/font-awesome/all.min.css'"), 'BS5 canvas does not load its icon subset');
must(framework.includes("'assets/js/pagebuilder-bs4-gallery.js'"), 'BS4 still uses BS5 gallery runtime');

must(exporter.includes("'css/font-awesome4/font-awesome.min.css'"), 'BS4 export does not require FA 4.7 CSS');
must(exporter.includes("'css/fonts/fontawesome-webfont.woff2'"), 'BS4 export does not require FA 4.7 font');
must(exporter.includes("'js/pagebuilder-bs4-gallery.js'"), 'BS4 export does not use dedicated gallery runtime');
must(exporter.includes('<link rel="stylesheet" href="css/font-awesome4/font-awesome.min.css">'), 'BS4 HTML source does not link FA 4.7');
must(exporter.includes('<link rel="stylesheet" href="css/font-awesome/all.min.css">'), 'BS5 HTML source does not link BS5 icon subset');

console.log('GALLERY FRAMEWORK ICON SOURCES ERFOLGREICH');
