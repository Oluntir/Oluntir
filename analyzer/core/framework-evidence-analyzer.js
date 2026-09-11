(function (root, factory) {
  const api = factory(); if (typeof module === 'object' && module.exports) module.exports = api; if (root) root.OluntirAnalyzerFrameworkEvidenceAnalyzer = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const RULES = [
    {
      id: 'bootstrap5', label: 'Bootstrap 5', threshold: 4,
      tests: [
        { re: /bootstrap(?:\.min)?\.(?:css|js)[\s\S]{0,160}?v?5\.[0-9.]+/i, weight: 5, kind: 'version-banner' },
        { re: /bootstrap@5(?:\.[0-9.]+)?/i, weight: 5, kind: 'package-version' },
        { re: /Bootstrap\s+v?5\.[0-9.]+/i, weight: 5, kind: 'version-banner' },
        { re: /(?:^|[\/])bootstrap(?:[-_.]?5|[-_.]?5\.[0-9.]+)(?:[\/]|\b)/i, weight: 4, kind: 'versioned-path' },
        { re: /(?:bootstrap(?:\.bundle)?(?:\.min)?\.js|bootstrap(?:\.min)?\.css)[^\n]{0,120}(?:5\.[0-9.]+)/i, weight: 4, kind: 'asset-version' },
        { re: /data-bs-(?:toggle|target|dismiss|ride|spy|offset|parent|theme)\b/i, weight: 4, kind: 'data-api' },
        { re: /\b(?:offcanvas|accordion-item|form-floating|visually-hidden|placeholder-glow|ratio-16x9)\b/i, weight: 3, kind: 'bs5-class' },
        { re: /\b(?:ms|me)-(?:0|1|2|3|4|5|auto)\b/i, weight: 2, kind: 'logical-spacing' },
        { re: /(?:^|[\\/])bootstrap(?:\.min)?\.css\b/i, weight: 1, kind: 'bootstrap-css' }
      ]
    },
    {
      id: 'bootstrap4', label: 'Bootstrap 4', threshold: 4,
      tests: [
        { re: /bootstrap(?:\.min)?\.(?:css|js)[\s\S]{0,160}?v?4\.[0-9.]+/i, weight: 5, kind: 'version-banner' },
        { re: /bootstrap@4(?:\.[0-9.]+)?/i, weight: 5, kind: 'package-version' },
        { re: /Bootstrap\s+v?4\.[0-9.]+/i, weight: 5, kind: 'version-banner' },
        { re: /(?:^|[\/])bootstrap(?:[-_.]?4|[-_.]?4\.[0-9.]+)(?:[\/]|\b)/i, weight: 4, kind: 'versioned-path' },
        { re: /(?:bootstrap(?:\.bundle)?(?:\.min)?\.js|bootstrap(?:\.min)?\.css)[^\n]{0,120}(?:4\.[0-9.]+)/i, weight: 4, kind: 'asset-version' },
        { re: /data-(?:toggle|target|dismiss|ride|spy|offset|parent)\s*=/i, weight: 3, kind: 'data-api' },
        { re: /jquery(?:-[0-9.]+)?(?:\.min)?\.js/i, weight: 2, kind: 'jquery-runtime' },
        { re: /\b(?:jumbotron|media-body|custom-control|custom-file|custom-select|form-row|sr-only|embed-responsive)\b/i, weight: 3, kind: 'bs4-class' },
        { re: /\b(?:ml|mr)-(?:0|1|2|3|4|5|auto)\b/i, weight: 2, kind: 'physical-spacing' },
        { re: /(?:^|[\\/])bootstrap(?:\.min)?\.css\b/i, weight: 1, kind: 'bootstrap-css' }
      ]
    }
  ];

  function analyze(files) {
    const corpus = (files || []).map(file => `${file.path}\n${file.content}`).join('\n');
    return RULES.map(rule => {
      const evidence = [];
      let score = 0;
      const possible = rule.tests.reduce((sum, test) => sum + test.weight, 0);
      rule.tests.forEach((test, index) => {
        const match = corpus.match(test.re);
        if (!match) return;
        score += test.weight;
        evidence.push({ ruleIndex: index, match: match[0], weight: test.weight, kind: test.kind });
      });
      return {
        id: rule.id,
        label: rule.label,
        detected: score >= rule.threshold,
        confidence: Number(Math.min(1, score / Math.max(rule.threshold + 4, possible * 0.7)).toFixed(2)),
        score,
        threshold: rule.threshold,
        evidence
      };
    }).filter(item => item.detected || item.evidence.length);
  }

  return Object.freeze({ analyze });
});
