(function (root, factory) {
  const api = factory(); if (typeof module === 'object' && module.exports) module.exports = api; if (root) root.OluntirAnalyzerFrameworkEvidenceAnalyzer = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const RULES = [
    { id:'bootstrap5', label:'Bootstrap 5', tests:[/bootstrap(?:\.min)?\.css/i, /bootstrap@5/i, /data-bs-(?:toggle|target|ride)/i, /\bnavbar-expand-/i], threshold:2 },
    { id:'bootstrap4', label:'Bootstrap 4', tests:[/bootstrap(?:\.min)?\.css/i, /bootstrap@4/i, /data-(?:toggle|target|ride)=/i, /jquery(?:\.min)?\.js/i], threshold:2 }
  ];
  function analyze(files) {
    const corpus = files.map(f => `${f.path}\n${f.content}`).join('\n');
    return RULES.map(rule => { const evidence=[]; rule.tests.forEach((re,i)=>{ const m=corpus.match(re); if(m) evidence.push({ ruleIndex:i, match:m[0] }); }); const score=evidence.length/rule.tests.length; return { id:rule.id, label:rule.label, detected:evidence.length>=rule.threshold, confidence:Number(score.toFixed(2)), evidence }; }).filter(x=>x.detected || x.evidence.length);
  }
  return Object.freeze({ analyze });
});
