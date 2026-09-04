'use strict';

const SUPPORTED = Object.freeze({
  bootstrap4: { family: 'bootstrap', major: 4, status: 'supported', label: 'Bootstrap 4' },
  bootstrap5: { family: 'bootstrap', major: 5, status: 'supported', label: 'Bootstrap 5' }
});

function token(value) { return String(value == null ? '' : value).trim().toLowerCase(); }

function candidateFromReport(report) {
  const detected = (report && Array.isArray(report.frameworks) ? report.frameworks : [])
    .filter(item => item && item.detected)
    .sort((a, b) => Number(b.confidence || 0) - Number(a.confidence || 0) || String(a.id).localeCompare(String(b.id)));
  return detected[0] || null;
}

function classify(input = {}) {
  const reportCandidate = candidateFromReport(input.report);
  const requestedId = token(input.frameworkId);
  const requestedFamily = token(input.frameworkFamily);
  const detectedId = token(reportCandidate && reportCandidate.id);
  const frameworkId = requestedId && !['unknown', 'unclassified'].includes(requestedId)
    ? requestedId
    : detectedId || requestedId || 'unknown';
  const contract = SUPPORTED[frameworkId];
  if (contract) return Object.freeze({
    frameworkId,
    family: contract.family,
    major: contract.major,
    status: 'supported',
    editorActivationAllowed: true,
    runtimeAdapterAllowed: true,
    reason: 'bootstrap-major-supported',
    label: contract.label
  });
  return Object.freeze({
    frameworkId,
    family: requestedFamily || (reportCandidate && reportCandidate.family) || frameworkId,
    major: null,
    status: 'analysis-only',
    editorActivationAllowed: false,
    runtimeAdapterAllowed: false,
    reason: detectedId ? 'framework-detected-but-not-supported' : 'framework-not-supported',
    label: frameworkId === 'unknown' ? 'Unbekanntes Framework' : frameworkId
  });
}

function isSupported(value) {
  const id = typeof value === 'object' ? value.frameworkId : value;
  return Boolean(SUPPORTED[token(id)]);
}

module.exports = Object.freeze({ SUPPORTED, classify, isSupported });
