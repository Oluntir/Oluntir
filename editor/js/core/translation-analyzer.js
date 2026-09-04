(function (root, factory) {
  const matrix = root && root.OluntirTranslationMatrix
    ? root.OluntirTranslationMatrix
    : (typeof module === 'object' && module.exports ? require('./translation-matrix.js') : null);
  const profiles = root && root.OluntirTranslationProfiles
    ? root.OluntirTranslationProfiles
    : (typeof module === 'object' && module.exports ? require('./translation-matrix-profiles.js') : null);
  const api = factory(matrix, profiles);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirTranslationAnalyzer = api;
})(typeof window !== 'undefined' ? window : globalThis, function (matrix, profiles) {
  'use strict';

  if (!matrix || !profiles) throw new Error('Translation Matrix and profiles are required.');

  const SCHEMA_VERSION = 1;
  const OUTPUT_KINDS = new Set([
    matrix.DESCRIPTOR_KINDS.outputClass,
    matrix.DESCRIPTOR_KINDS.outputAttribute,
    matrix.DESCRIPTOR_KINDS.outputStyle
  ]);

  function freeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(key => freeze(value[key]));
    return Object.freeze(value);
  }

  function text(value) {
    return String(value == null ? '' : value);
  }

  function escapeRegExp(value) {
    return text(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function sourceDocument(source) {
    const input = source || {};
    if (typeof input === 'string') return { html: input, css: '', js: '', scss: '' };
    return {
      html: text(input.html),
      css: text(input.css),
      js: text(input.js),
      scss: text(input.scss)
    };
  }

  function classTokens(html) {
    const result = [];
    const expression = /\bclass\s*=\s*["']([^"']*)["']/gi;
    let match;
    while ((match = expression.exec(html)) !== null) {
      match[1].split(/\s+/).map(item => item.trim()).filter(Boolean).forEach(item => result.push(item));
    }
    return result;
  }

  function matchesDescriptor(descriptor, source) {
    const value = text(descriptor.value);
    if (!value) return false;
    const matchMode = descriptor.metadata && descriptor.metadata.match;
    const classes = classTokens(source.html);
    if (descriptor.kind === matrix.DESCRIPTOR_KINDS.htmlTag) {
      return new RegExp('<' + escapeRegExp(value) + '(?:\\s|>)', 'i').test(source.html);
    }
    if (descriptor.kind === matrix.DESCRIPTOR_KINDS.className) {
      return matchMode === 'prefix'
        ? classes.some(item => item.indexOf(value) === 0)
        : classes.includes(value);
    }
    if (descriptor.kind === matrix.DESCRIPTOR_KINDS.attribute) {
      return new RegExp('\\b' + escapeRegExp(value) + '\\s*=', 'i').test(source.html);
    }
    if (descriptor.kind === matrix.DESCRIPTOR_KINDS.cssSelector) return source.css.indexOf(value) !== -1;
    if (descriptor.kind === matrix.DESCRIPTOR_KINDS.jsSignal) return source.js.indexOf(value) !== -1;
    if (descriptor.kind === matrix.DESCRIPTOR_KINDS.scssSignal) return source.scss.indexOf(value) !== -1;
    if (descriptor.kind === matrix.DESCRIPTOR_KINDS.custom) return false;
    return false;
  }

  function descriptorEvidence(descriptor, source) {
    return freeze({
      kind: descriptor.kind,
      value: descriptor.value,
      metadata: descriptor.metadata,
      sourceTypes: freeze(['html', 'css', 'js', 'scss'].filter(type => {
        const value = source[type];
        return value && (descriptor.kind === matrix.DESCRIPTOR_KINDS.htmlTag || descriptor.kind === matrix.DESCRIPTOR_KINDS.className || descriptor.kind === matrix.DESCRIPTOR_KINDS.attribute ? type === 'html' : value.indexOf(descriptor.value) !== -1);
      }))
    });
  }

  function matchedDescriptors(rule, source) {
    const required = rule.detect.filter(descriptor => descriptor.required !== false);
    const optional = rule.detect.filter(descriptor => descriptor.required === false);
    const requiredMatches = required.filter(descriptor => matchesDescriptor(descriptor, source));
    const optionalMatches = optional.filter(descriptor => matchesDescriptor(descriptor, source));
    if (requiredMatches.length !== required.length) return null;
    if (optional.length && optionalMatches.length === 0) return null;
    return requiredMatches.concat(optionalMatches);
  }

  function outputCapability(rule) {
    if (!rule.emit.length) return { implementable: false, reason: 'no-output-descriptor' };
    const unsupported = rule.emit.filter(descriptor => !OUTPUT_KINDS.has(descriptor.kind));
    if (unsupported.length) return { implementable: false, reason: 'unsupported-output-descriptor' };
    return { implementable: true, reason: null };
  }

  function resolveProfile(settings, sourceInput) {
    const candidate = settings.sourceProfile || (sourceInput && sourceInput.sourceProfile);
    if (!candidate) return { profile: profiles.getProfile(String(settings.frameworkId || (sourceInput && sourceInput.frameworkId) || 'bs5').toLowerCase()), sourceProfile: null, issue: null };
    try {
      const metadata = candidate.metadata || {};
      const requestedPackageId = settings.sourcePackageId || (sourceInput && sourceInput.sourcePackageId);
      const requestedHash = settings.sourceHash || (sourceInput && sourceInput.sourceHash);
      if (candidate.kind !== 'oluntir-source-framework-profile' || metadata.sourceBound !== true || metadata.reusable !== false) {
        return { profile: null, sourceProfile: candidate, issue: { code: 'SOURCE_PROFILE_SCOPE_INVALID' } };
      }
      if (requestedPackageId && metadata.sourcePackageId && requestedPackageId !== metadata.sourcePackageId) {
        return { profile: null, sourceProfile: candidate, issue: { code: 'SOURCE_PROFILE_PACKAGE_MISMATCH' } };
      }
      if (requestedHash && metadata.sourceHash && requestedHash !== metadata.sourceHash) {
        return { profile: null, sourceProfile: candidate, issue: { code: 'SOURCE_PROFILE_HASH_MISMATCH' } };
      }
      return { profile: matrix.createProfile(candidate), sourceProfile: candidate, issue: null };
    } catch (error) {
      return { profile: null, sourceProfile: candidate, issue: { code: 'SOURCE_PROFILE_INVALID', message: error.message } };
    }
  }

  function analyze(sourceInput, options) {
    const source = sourceDocument(sourceInput);
    const settings = options || {};
    const resolvedProfile = resolveProfile(settings, sourceInput);
    const frameworkId = resolvedProfile.profile ? resolvedProfile.profile.id : String(settings.frameworkId || (sourceInput && sourceInput.frameworkId) || 'bs5').toLowerCase();
    const profile = resolvedProfile.profile;
    if (!profile) {
      return freeze({
        schemaVersion: SCHEMA_VERSION,
        valid: false,
        readOnly: true,
        mutationEnabled: false,
        frameworkId,
        sourceProfileId: resolvedProfile.sourceProfile && resolvedProfile.sourceProfile.profileId || null,
        issues: freeze([resolvedProfile.issue || { code: 'UNKNOWN_FRAMEWORK_PROFILE', frameworkId }]),
        matches: freeze([]),
        unmatchedRules: freeze([]),
        capabilities: freeze([]),
        implementableRuleCount: 0,
        allRulesRecognized: false
      });
    }

    const matches = [];
    const unmatchedRules = [];
    const capabilitySet = new Set(profile.capabilities);
    profile.rules.forEach(rule => {
      const matched = matchedDescriptors(rule, source);
      if (!matched) {
        unmatchedRules.push(rule.ruleId);
        return;
      }
      rule.capabilities.forEach(capability => capabilitySet.add(capability));
      const output = outputCapability(rule);
      matches.push({
        ruleId: rule.ruleId,
        semanticId: rule.semanticId,
        category: rule.category,
        variant: rule.variant,
        confidence: rule.confidence,
        evidence: matched.map(descriptor => descriptorEvidence(descriptor, source)),
        emit: rule.emit,
        implementable: output.implementable,
        implementationReason: output.reason
      });
    });

    const implementableRuleCount = matches.filter(item => item.implementable).length;
    return freeze({
      schemaVersion: SCHEMA_VERSION,
      valid: true,
      readOnly: true,
      mutationEnabled: false,
      frameworkId: profile.id,
      frameworkVersion: profile.version,
      sourceProfileId: resolvedProfile.sourceProfile && resolvedProfile.sourceProfile.profileId || null,
      sourceTypes: freeze(Object.keys(source).filter(type => Boolean(source[type]))),
      matches,
      unmatchedRules,
      capabilities: Array.from(capabilitySet).sort(),
      recognizedRuleCount: matches.length,
      profileRuleCount: profile.rules.length,
      implementableRuleCount,
      allRulesRecognized: unmatchedRules.length === 0
    });
  }

  return Object.freeze({
    SCHEMA_VERSION,
    readOnly: true,
    mutationEnabled: false,
    analyze,
    matchesDescriptor
  });
});
