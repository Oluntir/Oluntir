const fs = require('fs');
const css = fs.readFileSync('assets/css/pagebuilder-bs4.css', 'utf8');
function assert(v, m){ if(!v) throw new Error(m); }
assert(css.includes('.pb-gallery-open-button::before'), 'Zoom icon must be drawn on the button itself.');
assert(css.includes('.pb-gallery-open-button::after'), 'Zoom handle must be drawn on the button itself.');
assert(css.includes('.pb-gallery-actions .portfolio-download::before'), 'Download arrow must be drawn on the link itself.');
assert(css.includes('.pb-gallery-actions .portfolio-download::after'), 'Download tray must be drawn on the link itself.');
console.log('GALLERY-EMPTY-ACTION-BUTTONS-TEST ERFOLGREICH');
