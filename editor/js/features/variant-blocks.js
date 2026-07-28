(function () {
  'use strict';
  const wrap = (type, body, cls) => `<section class="${cls || 'py-5'}" data-pb-quick="${type}">${body}</section>`;
  const gallery = wrap('gallery','<div class="container"><div class="row"><div class="col-12"><p class="alert alert-info">Nach dem Einfügen öffnet sich die responsive Galerie-Konfiguration.</p></div></div></div>');
  const grid = wrap('grid','<div class="container"><div class="row"><div class="col-12"><p class="alert alert-info">Nach dem Einfügen öffnet sich die Grid-Konfiguration.</p></div></div></div>');
  const navbar = (variant, theme, label) => ({label, category:'Navigation · Varianten', content:`<header data-pb-quick="navbar" data-pb-config='{"variant":"${variant}","theme":"${theme}","brand":"Meine Website","position":"normal","logo":true,"search":false,"cta":true}'><nav class="navbar navbar-light bg-light"><div class="container"><a class="navbar-brand" href="#">Meine Website</a></div></nav></header>`});
  const footer = (variant, theme, columns, label) => ({label, category:'Footer · Varianten', content:`<section data-pb-quick="footer" data-pb-config='{"variant":"${variant}","theme":"${theme}","columns":"${columns}","social":true}' class="py-5 bg-dark text-white"><div class="container"><h2 class="h4">${label}</h2><p>Nach dem Einfügen direkt konfigurieren.</p></div></section>`});

  window.registerPageBuilderVariants = function (editor, version) {
    const bm = editor.BlockManager;
    bm.add(`${version}-quick-grid`, {label:'Grid mit Quick Setup', category:`${version.toUpperCase()} · Layout`, content:grid});
    bm.add(`${version}-quick-gallery`, {label:'Responsive Galerie – Quick Setup', category:`${version.toUpperCase()} · Galerie`, content:gallery});

    bm.add(`${version}-nav-standard`, navbar('standard','light','Navbar · Standard'));
    bm.add(`${version}-nav-dark`, navbar('standard','dark','Navbar · Dunkel'));
    bm.add(`${version}-nav-centered`, navbar('center','light','Navbar · Zentriert'));
    bm.add(`${version}-nav-search`, {label:'Navbar · Suche + CTA', category:'Navigation · Varianten', content:`<header data-pb-quick="navbar" data-pb-config='{"variant":"standard","theme":"light","brand":"Meine Website","position":"sticky","logo":true,"search":true,"cta":true}'><nav class="navbar navbar-light bg-light"><div class="container"><a class="navbar-brand" href="#">Meine Website</a></div></nav></header>`});
    if (version === 'bs5') bm.add(`${version}-nav-offcanvas`, navbar('offcanvas','dark','Navbar · Offcanvas'));

    bm.add(`${version}-footer-minimal`, footer('minimal','light','2','Footer · Minimal'));
    bm.add(`${version}-footer-3col`, footer('columns','dark','3','Footer · 3 Spalten'));
    bm.add(`${version}-footer-4col`, footer('columns','dark','4','Footer · 4 Spalten'));
    bm.add(`${version}-footer-newsletter`, footer('newsletter','light','2','Footer · Newsletter'));

    const heroContent = `<section class="py-5 bg-light"><div class="container"><div class="row align-items-center"><div class="col-lg-6"><h1 class="display-4">Klares Website-Projekt</h1><p class="lead">Einfach, lokal und ohne CMS-Zwang.</p><a class="btn btn-primary btn-lg" href="#">Mehr erfahren</a></div><div class="col-lg-6"><img class="img-fluid rounded" src="assets/images/logo.svg" alt="Hero"></div></div></div></section>`;
    bm.add(`${version}-hero-split`, {label:'Hero · Text + Bild', category:'Seitenbereiche · Varianten', content:heroContent});
    bm.add(`${version}-cards-grid`, {label:'Cards · Quick Setup', category:'Cards · Varianten', content:`<section class="py-5" data-pb-quick="card" data-pb-config='{"variant":"standard","count":"3","desktop":"3","tablet":"2","mobile":"1","gap":"4","ratio":"classic","buttonStyle":"primary","buttonText":"Mehr erfahren","image":true,"header":false,"footer":false,"badge":false,"button":true,"shadow":true,"border":true,"rounded":true}'><div class="container"><p class="alert alert-info">Nach dem Einfügen öffnet sich die Card-Konfiguration.</p></div></section>`});
    bm.add(`${version}-card-horizontal`, {label:'Cards · Horizontal', category:'Cards · Varianten', content:`<section class="py-5" data-pb-quick="card" data-pb-config='{"variant":"horizontal","count":"2","desktop":"2","tablet":"1","mobile":"1","gap":"4","ratio":"classic","buttonStyle":"primary","buttonText":"Mehr erfahren","image":true,"header":false,"footer":false,"badge":false,"button":true,"shadow":true,"border":true,"rounded":true}'><div class="container"><p class="alert alert-info">Horizontale Cards konfigurieren.</p></div></section>`});
    bm.add(`${version}-card-overlay`, {label:'Cards · Bild-Overlay', category:'Cards · Varianten', content:`<section class="py-5" data-pb-quick="card" data-pb-config='{"variant":"overlay","count":"3","desktop":"3","tablet":"2","mobile":"1","gap":"4","ratio":"wide","buttonStyle":"light","buttonText":"Mehr erfahren","image":true,"header":false,"footer":false,"badge":false,"button":true,"shadow":true,"border":false,"rounded":true}'><div class="container"><p class="alert alert-info">Overlay-Cards konfigurieren.</p></div></section>`});
  };
})();
