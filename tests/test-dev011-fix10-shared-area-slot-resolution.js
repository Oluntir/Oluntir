'use strict';

const fs = require('fs');
const assert = require('assert');

const adapter = fs.readFileSync('editor/integrations/grapesjs/grapesjs-adapter.js', 'utf8');

assert(adapter.includes('resolveAreaInsertionTarget(target)'), 'shared AreaSlot resolver missing');
assert(adapter.includes("if (target.slotKind === 'new-gallery-area') {\n          return adapter.resolveAreaInsertionTarget(target);"), 'productive insertion does not use shared AreaSlot resolver');
assert(adapter.includes('const strict = adapter.resolveInsertionTarget(target);'), 'preview does not first reuse productive AreaSlot resolution');
assert(adapter.includes("if (parentRole === 'main' || parentTagName === 'main')"), 'live MAIN ancestor validation missing');
assert(adapter.includes("if (declaredIdentity && liveIdentity && String(declaredIdentity) !== String(liveIdentity))") && adapter.includes("setAreaDiagnostic('MAIN_IDENTITY_MISMATCH'"), 'stable-identity declared-MAIN mismatch protection missing');
assert(adapter.includes('const boundaryIdentity = adapter.componentIdentity(boundary);'), 'stable MAIN-child boundary validation missing');
assert(adapter.includes('const liveBoundary = children[index] || boundary;'), 'live MAIN-child mapping missing');
assert(adapter.includes("structureScope: 'main-boundary-preview'"), 'safe read-only preview fallback missing');

console.log('DEV_011-FIX10-SHARED-AREA-SLOT-RESOLUTION-TEST ERFOLGREICH');
