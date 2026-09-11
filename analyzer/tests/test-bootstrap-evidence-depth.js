'use strict';
const assert = require('assert');
const analyzer = require('../core/framework-evidence-analyzer.js');

const bs4 = analyzer.analyze([{ path:'index.html', content:'<div class="jumbotron"><div class="media"><div class="media-body"></div></div><div class="custom-control"></div><button data-toggle="collapse"></button><script src="jquery-3.6.0.min.js"></script></div>' }]);
const bs4Hit = bs4.find(item => item.id === 'bootstrap4');
assert(bs4Hit && bs4Hit.detected, 'BS4 muss über BS4-spezifische Klassen/Data-API erkannt werden.');
assert(bs4Hit.evidence.some(item => item.kind === 'bs4-class'));
assert(bs4Hit.evidence.some(item => item.kind === 'data-api'));

const bs5 = analyzer.analyze([{ path:'index.html', content:'<div class="offcanvas"><div class="accordion-item"></div><div class="form-floating"></div><span class="visually-hidden"></span><button data-bs-toggle="offcanvas"></button></div>' }]);
const bs5Hit = bs5.find(item => item.id === 'bootstrap5');
assert(bs5Hit && bs5Hit.detected, 'BS5 muss über BS5-spezifische Klassen/Data-API erkannt werden.');
assert(bs5Hit.evidence.some(item => item.kind === 'bs5-class'));
assert(bs5Hit.evidence.some(item => item.kind === 'data-api'));

const generic = analyzer.analyze([{ path:'css/bootstrap.min.css', content:'body{margin:0}' }]);
assert(generic.every(item => !item.detected), 'Ein generischer bootstrap.css-Dateiname allein darf keine Bootstrap-Generation behaupten.');


const fs = require('fs');
const real4 = analyzer.analyze([{ path:'frameworks/bootstrap4/css/bootstrap.min.css', content:fs.readFileSync('frameworks/bootstrap4/css/bootstrap.min.css','utf8') }]);
const real5 = analyzer.analyze([{ path:'frameworks/bootstrap5/css/bootstrap.min.css', content:fs.readFileSync('frameworks/bootstrap5/css/bootstrap.min.css','utf8') }]);
assert(real4.find(item => item.id === 'bootstrap4' && item.detected), 'Gebündeltes Bootstrap 4.6.2 muss an echtem Versionsbanner erkannt werden.');
assert(real5.find(item => item.id === 'bootstrap5' && item.detected), 'Gebündeltes Bootstrap 5.3.8 muss an echtem Versionsbanner erkannt werden.');

console.log('BOOTSTRAP-EVIDENCE-DEPTH-TEST ERFOLGREICH');
