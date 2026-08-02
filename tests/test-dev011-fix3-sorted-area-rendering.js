const fs = require('fs');
const assert = require('assert');
const source = fs.readFileSync('editor/js/core/structure-insertion-target.js', 'utf8');

assert(source.includes('function comparePosition(left, right)'), 'Template-order comparator missing');
assert(source.includes('function pathStartsWith(path, prefix)'), 'Template-path association missing');
assert(source.includes('pageGroups.forEach((group, index) => {'), 'Fallback must interleave slots and groups');
assert(source.includes('if (before) page += renderSlot(before);\n        page += renderGroup(group, model);'), 'Fallback renders detached area slots');
assert(source.includes('const visibleEntries = areas'), 'Resolved areas must derive one ordered visible sequence');
assert(source.includes("page += entry.groups.map(group => renderGroup(group, model)).join('');"), 'Visible blue groups must render before their following orange boundary');
assert(!source.includes("page += unassigned.map(group => renderGroup(group, model)).join('');"), 'Unassigned blue groups must not be appended after all orange slots');
console.log('DEV_011-FIX3-SORTED-AREA-RENDERING-TEST ERFOLGREICH');
