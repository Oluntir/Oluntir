(function (root, factory) { const api=factory(); if(typeof module==='object'&&module.exports)module.exports=api; if(root)root.OluntirAnalyzerCapabilityEvidenceAnalyzer=api; })(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const RULES=[
    ['navigation','Navigation',[/<nav\b/i,/\bnavbar\b/i,/role=["']navigation/i]],
    ['navigation.expandable','Erweiterbare Navigation',[/data-(?:bs-)?toggle=["']collapse/i,/navbar-toggler/i,/aria-expanded/i]],
    ['navigation.breadcrumb','Breadcrumb',[/\bbreadcrumb(?:-item)?\b/i,/aria-label=["']breadcrumb/i]],
    ['navigation.pagination','Pagination',[/\bpagination\b/i,/\bpage-item\b/i,/\bpage-link\b/i]],
    ['media.image-collection','Bildersammlung',[/\bgallery\b/i,/lightbox/i,/<figure\b/i]],
    ['media.lightbox','Lightbox',[/lightbox/i,/data-(?:gallery|lightbox|fancybox)/i]],
    ['media.caption','Bildunterschriften',[/<figcaption\b/i,/\bfigure-caption\b/i]],
    ['media.video','HTML5-Video',[/<video\b/i,/<source\b[^>]*type=["']video\/(?:webm|mp4|ogg)["']/i,/\bposter=["']/i]],
    ['asset.download','Downloads',[/\bdownload(?:=|\s|>)/i]],
    ['asset.lazy-loading','Lazy Loading',[/loading=["']lazy/i,/IntersectionObserver/i]],
    ['interaction.carousel','Carousel/Slider',[/\bcarousel\b/i,/swiper/i,/splide/i,/slick/i]],
    ['interaction.tabs','Tabs',[/role=["']tab/i,/data-(?:bs-)?toggle=["']tab/i,/\btab-pane\b/i]],
    ['interaction.accordion','Accordion',[/\baccordion\b/i,/data-(?:bs-)?parent/i]],
    ['interaction.collapse','Collapse',[/\bcollapse\b/i,/data-(?:bs-)?toggle=["']collapse/i]],
    ['interaction.dropdown','Dropdown',[/\bdropdown-menu\b/i,/data-(?:bs-)?toggle=["']dropdown/i]],
    ['interaction.modal','Modal',[/\bmodal\b/i,/data-(?:bs-)?toggle=["']modal/i]],
    ['interaction.offcanvas','Offcanvas',[/\boffcanvas\b/i,/data-bs-toggle=["']offcanvas/i]],
    ['interaction.toast','Toast',[/\btoast(?:-body|-header)?\b/i,/bootstrap\.Toast/i]],
    ['interaction.tooltip','Tooltip',[/data-(?:bs-)?toggle=["']tooltip/i,/bootstrap\.Tooltip/i]],
    ['interaction.popover','Popover',[/data-(?:bs-)?toggle=["']popover/i,/bootstrap\.Popover/i]],
    ['content.card','Card',[/\bcard(?:-body|-header|-footer|-title)?\b/i]],
    ['content.list-group','List group',[/\blist-group(?:-item)?\b/i]],
    ['content.jumbotron','Jumbotron',[/\bjumbotron\b/i]],
    ['content.media-object','Media object',[/\bmedia-body\b/i,/class=["'][^"']*\bmedia\b/i]],
    ['content.progress','Progress',[/\bprogress(?:-bar)?\b/i]],
    ['content.form','Formular',[/<form\b/i]],
    ['content.form.custom-controls','Custom Form Controls',[/\bcustom-(?:control|select|file|range)\b/i]],
    ['structure.repeat','Wiederholbare Struktur',[/\b(?:card|item|slide|gallery-item|list-group-item)\b/i]],
    ['structure.shared-content','Geteilte Bereiche',[/\b(?:header|footer|navigation)\b/i]]
  ];
  function analyze(files){const corpus=files.map(f=>`${f.path}\n${f.content}`).join('\n');return RULES.map(([id,label,tests])=>{const ev=[];tests.forEach((re,i)=>{const m=corpus.match(re);if(m)ev.push({ruleIndex:i,match:m[0]});});if(!ev.length)return null;return{id,label,confidence:Number((ev.length/tests.length).toFixed(2)),status:ev.length===tests.length?'strong':ev.length>1?'probable':'candidate',access:{read:true,write:false,create:false,delete:false,reorder:false,export:false,roundtrip:false},evidence:ev};}).filter(Boolean);}
  return Object.freeze({analyze});
});
