const semantics = require('../editor/js/core/template-semantics.js');
const assert = (value, message) => { if (!value) throw new Error(message); };

const row = semantics.resolveRole({
  tagName: 'div',
  classes: ['row', 'align-items-stretch'],
  attributes: { 'data-oluntir-component-id': 'ol_component_wrong_kind' }
}, { id: 'bs5', version: '5.3.8' });
assert(row.role === 'row', 'Bootstrap .row must define the role');
assert(row.frameworkRole === 'bootstrap-row', 'Bootstrap row framework role missing');
assert(semantics.structuralKind(row, false) === 'row', 'Row structural kind missing');

const column = semantics.resolveRole({ tagName: 'div', classes: ['col-12', 'col-md-4'], attributes: { 'data-oluntir-row-id': 'ol_row_misleading' } }, { id: 'bs4', version: '4.6.2' });
assert(column.role === 'column', 'Bootstrap column class must define column role');
assert(semantics.structuralKind(column, false) === 'slot', 'Column structural kind missing');

const container = semantics.resolveRole({ tagName: 'div', classes: ['container'], attributes: { 'data-oluntir-row-id': 'ol_row_misleading' } }, { id: 'bs5' });
assert(container.role === 'container', 'Template class must win over misleading Oluntir identity attribute');
assert(semantics.structuralKind(container, false) === 'component', 'Container must remain component structural kind');

assert(semantics.cleanCollisionSuffix('pbNavbar-2-2-2-3-2') === 'pbNavbar', 'Collision suffix chain not normalized');
assert(semantics.cleanCollisionSuffix('section-2') === 'section-2', 'Single intentional numeric suffix must be retained');

console.log('TEMPLATE-FIRST-SEMANTICS-TEST ERFOLGREICH');
