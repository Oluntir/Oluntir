const fs = require('fs');
const vm = require('vm');
const source = fs.readFileSync('editor/js/core/export.js', 'utf8');

function extract(name) {
  const start = source.indexOf(`function ${name}`);
  if (start < 0) throw new Error(`${name} fehlt`);
  let brace = source.indexOf('{', start);
  let depth = 0;
  for (let i = brace; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`${name} unvollständig`);
}

const context = {};
vm.createContext(context);
vm.runInContext(extract('addResponsiveUploadVariants') + '\n' + extract('expandResponsiveUploadPaths'), context);

const current = new Set(['assets/user_upload/desktop/card.jpg']);
context.expandResponsiveUploadPaths(current);
for (const path of [
  'assets/user_upload/desktop/card.jpg',
  'assets/user_upload/tablet/card.jpg',
  'assets/user_upload/mobile/card.jpg'
]) {
  if (!current.has(path)) throw new Error(`Fehlt: ${path}`);
}

const tabletOnly = new Set(['assets/user_upload/tablet/banner.webp']);
context.expandResponsiveUploadPaths(tabletOnly);
if (!tabletOnly.has('assets/user_upload/desktop/banner.webp') || !tabletOnly.has('assets/user_upload/mobile/banner.webp')) {
  throw new Error('Tablet-Ausgangspunkt wird nicht auf alle Varianten erweitert');
}

const legacy = new Set(['images/uploads/mobile/legacy.png']);
context.expandResponsiveUploadPaths(legacy);
if (!legacy.has('images/uploads/desktop/legacy.png') || !legacy.has('images/uploads/tablet/legacy.png')) {
  throw new Error('Legacy-Pfade werden nicht vollständig erweitert');
}

if (!source.includes('expandResponsiveUploadPaths(usedUploadPaths);')) {
  throw new Error('Exportloop erweitert responsive Uploadpfade nicht');
}

console.log('RESPONSIVE-UPLOAD-EXPORT-TEST ERFOLGREICH');
