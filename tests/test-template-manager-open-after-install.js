const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'template-manager.html'), 'utf8');
function assert(cond, msg) { if (!cond) throw new Error(msg); }

assert(/id="open-oluntir-success"[^>]*class="button success"[^>]*type="button"[^>]*disabled/.test(html), 'green Oluntir button must exist and start disabled');
assert(/function hideOpenAfterInstall\(\)/.test(html), 'hideOpenAfterInstall missing');
assert(/openOluntirSuccessEl\.disabled = true/.test(html), 'Oluntir button must be disabled before/while a template is not verified');
assert(/function showOpenAfterInstall\(name\)/.test(html), 'showOpenAfterInstall missing');
assert(/openOluntirSuccessEl\.disabled = false/.test(html), 'Oluntir button must only be enabled by verified-install success path');
assert(/showOpenAfterInstall\(installedName\)/.test(html), 'success CTA is not enabled after verified install');
assert(/openOluntirSuccessEl\.addEventListener\('click'/.test(html), 'green Oluntir button click handler missing');
assert(/if \(openOluntirSuccessEl\.disabled\) return;/.test(html), 'disabled Oluntir button must not navigate');
assert(/window\.location\.href = 'index\.html'/.test(html), 'enabled Oluntir button must open index.html');
assert(/Beim ersten Zugriff muss dieser Ordner aus Browser-Sicherheitsgründen manuell ausgewählt werden/.test(html), 'picker limitation must be stated accurately');
console.log('TEMPLATE-MANAGER-OPEN-AFTER-INSTALL-TEST ERFOLGREICH');
