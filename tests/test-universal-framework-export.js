'use strict';

const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('editor/js/core/export.js', 'utf8');

assert(source.includes('function isImportedExportFramework(framework)'));
assert(source.includes('async function loadImportedSourceAssets(framework)'));
assert(source.includes('async function loadFrameworkExportAssets(framework)'));
assert(source.includes("if (isImportedExportFramework(framework)) {"));
assert(source.includes('framework: frameworkDescriptor'));
assert(source.includes("customCssExportPath(framework)"));
assert(source.includes("return isImportedExportFramework(framework) ? 'css/oluntir-custom.css' : 'css/custom.css';"));
assert(!source.includes('bootstrap: (window.PAGEBUILDER_FRAMEWORK'));
assert(!source.includes('frameworkProfile: (window.PAGEBUILDER_FRAMEWORK'));

console.log('UNIVERSAL-FRAMEWORK-EXPORT-TEST ERFOLGREICH');
