const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
for (const rel of ['assets/js/pagebuilder-bs5-gallery.js', 'assets/js/pagebuilder-bs4-gallery.js']) {
  const source = fs.readFileSync(path.join(root, rel), 'utf8');
  if (!source.includes("wrapper.querySelector('picture img, img')")) {
    throw new Error(`${rel}: sichtbares Galeriebild wird nicht als Laufzeitquelle ermittelt.`);
  }
  if (!source.includes('if (visible) return visible;')) {
    throw new Error(`${rel}: Lightbox priorisiert nicht das tatsächlich eingesetzte Bild.`);
  }
  if (!source.includes("image.currentSrc || image.getAttribute('data-stable-path') || image.getAttribute('src')")) {
    throw new Error(`${rel}: responsive/stabile Bildquelle fehlt.`);
  }
}
console.log('OK: BS4/BS5 gallery preview and export use the visible replaced image.');
