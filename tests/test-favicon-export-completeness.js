const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'editor/js/core/favicon-manager.js'), 'utf8');
const required = [
  'images/favicon.ico',
  'images/favicon-16x16.png',
  'images/favicon-32x32.png',
  'images/favicon-48x48.png',
  'images/apple-touch-icon.png',
  'images/android-chrome-192x192.png',
  'images/android-chrome-512x512.png',
  'site.webmanifest'
];
for (const item of required) {
  if (!source.includes(item)) throw new Error(`Fehlender Favicon-Ausgabepfad: ${item}`);
}
for (const size of ['16x16', '32x32', '48x48', '180x180', '192x192', '512x512']) {
  if (!source.includes(`sizes="${size}"`)) throw new Error(`Fehlender Head-Verweis: ${size}`);
}
if (!source.includes('rel="manifest"')) throw new Error('Manifest-Link fehlt');
if (!source.includes("type: 'application/manifest+json'")) throw new Error('Manifest-Erzeugung fehlt');
console.log('FAVICON-EXPORT-COMPLETENESS-TEST ERFOLGREICH');
