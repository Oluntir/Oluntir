(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirTranslationMatrix = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const SCHEMA_VERSION = 1;

  const CATEGORIES = Object.freeze({
    document: 'document',
    structure: 'structure',
    layout: 'layout',
    component: 'component',
    capability: 'capability',
    presentation: 'presentation',
    behavior: 'behavior',
    asset: 'asset'
  });

  const DIRECTIONS = Object.freeze({
    detect: 'detect',
    emit: 'emit',
    bidirectional: 'bidirectional'
  });

  const DESCRIPTOR_KINDS = Object.freeze({
    htmlTag: 'html-tag',
    className: 'class',
    attribute: 'attribute',
    cssSelector: 'css-selector',
    jsSignal: 'js-signal',
    scssSignal: 'scss-signal',
    outputClass: 'output-class',
    outputAttribute: 'output-attribute',
    outputStyle: 'output-style',
    custom: 'custom'
  });

  // These IDs intentionally reuse the stable role names already returned by
  // semantic-dictionary.js and template-semantics.js. Translation rules get
  // their own rule IDs and must never replace a component or unit identity.
  const CANONICAL_TERMS = Object.freeze({
    page: Object.freeze({ id: 'page', category: CATEGORIES.document }),
    header: Object.freeze({ id: 'header', category: CATEGORIES.structure }),
    navigation: Object.freeze({ id: 'navigation', category: CATEGORIES.structure }),
    mainContent: Object.freeze({ id: 'main-content', category: CATEGORIES.structure }),
    footer: Object.freeze({ id: 'footer', category: CATEGORIES.structure }),
    section: Object.freeze({ id: 'section', category: CATEGORIES.structure }),
    container: Object.freeze({ id: 'container', category: CATEGORIES.layout }),
    containerFluid: Object.freeze({ id: 'container-fluid', category: CATEGORIES.layout }),
    row: Object.freeze({ id: 'row', category: CATEGORIES.layout }),
    column: Object.freeze({ id: 'column', category: CATEGORIES.layout }),
    card: Object.freeze({ id: 'card', category: CATEGORIES.component }),
    cardHeader: Object.freeze({ id: 'card-header', category: CATEGORIES.component }),
    cardBody: Object.freeze({ id: 'card-body', category: CATEGORIES.component }),
    cardFooter: Object.freeze({ id: 'card-footer', category: CATEGORIES.component }),
    responsiveLayout: Object.freeze({ id: 'responsive-layout', category: CATEGORIES.capability }),
    visibility: Object.freeze({ id: 'visibility', category: CATEGORIES.capability }),
    spacing: Object.freeze({ id: 'spacing', category: CATEGORIES.presentation }),
    alignment: Object.freeze({ id: 'alignment', category: CATEGORIES.presentation }),
    typography: Object.freeze({ id: 'typography', category: CATEGORIES.presentation }),
    media: Object.freeze({ id: 'media', category: CATEGORIES.presentation }),
    interactiveBehavior: Object.freeze({ id: 'interactive-behavior', category: CATEGORIES.behavior })
  });

  const TERM_BY_ID = Object.freeze(Object.values(CANONICAL_TERMS).reduce((result, term) => {
    result[term.id] = term;
    return result;
  }, {}));

  const ALLOWED_CATEGORIES = new Set(Object.values(CATEGORIES));
  const ALLOWED_DIRECTIONS = new Set(Object.values(DIRECTIONS));
  const ALLOWED_DESCRIPTOR_KINDS = new Set(Object.values(DESCRIPTOR_KINDS));

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(key => deepFreeze(value[key]));
    return Object.freeze(value);
  }

  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (!value || typeof value !== 'object') return value;
    return Object.keys(value).reduce((result, key) => {
      result[key] = clone(value[key]);
      return result;
    }, {});
  }

  function token(value) {
    return String(value == null ? '' : value).trim().toLowerCase();
  }

  function text(value) {
    return String(value == null ? '' : value).trim();
  }

  function uniqueTokens(value) {
    const source = Array.isArray(value) ? value : (value == null ? [] : [value]);
    return Array.from(new Set(source.map(token).filter(Boolean)));
  }

  function issue(code, path, message, severity) {
    return { code, path, message, severity: severity || 'error' };
  }

  function normalizeDescriptor(value) {
    const source = value || {};
    return {
      kind: token(source.kind),
      value: text(source.value),
      operator: text(source.operator) || null,
      required: source.required !== false,
      specificity: Number.isFinite(Number(source.specificity)) ? Number(source.specificity) : 0,
      metadata: clone(source.metadata || {})
    };
  }

  function normalizeDescriptors(value) {
    const source = Array.isArray(value) ? value : (value ? [value] : []);
    return source.map(normalizeDescriptor);
  }

  function normalizeRule(input) {
    const source = input || {};
    return {
      schemaVersion: SCHEMA_VERSION,
      ruleId: text(source.ruleId),
      semanticId: token(source.semanticId),
      category: token(source.category),
      frameworkFamily: token(source.frameworkFamily),
      frameworkId: token(source.frameworkId),
      versionRange: text(source.versionRange) || '*',
      direction: token(source.direction) || DIRECTIONS.bidirectional,
      detect: normalizeDescriptors(source.detect),
      emit: normalizeDescriptors(source.emit),
      capabilities: uniqueTokens(source.capabilities),
      constraints: uniqueTokens(source.constraints),
      dependencies: uniqueTokens(source.dependencies),
      priority: Number.isFinite(Number(source.priority)) ? Number(source.priority) : 0,
      confidence: source.confidence == null ? 1 : Number(source.confidence),
      reversible: source.reversible !== false,
      lossy: source.lossy === true,
      variant: text(source.variant) || null,
      provenance: clone(source.provenance || {})
    };
  }

  function validateDescriptor(descriptor, path, output) {
    if (!ALLOWED_DESCRIPTOR_KINDS.has(descriptor.kind)) {
      output.push(issue('INVALID_DESCRIPTOR_KIND', path + '.kind', 'Unbekannte Descriptor-Art: ' + descriptor.kind));
    }
    if (!descriptor.value) {
      output.push(issue('MISSING_DESCRIPTOR_VALUE', path + '.value', 'Ein Descriptor benötigt einen Wert.'));
    }
    if (!Number.isFinite(descriptor.specificity) || descriptor.specificity < 0) {
      output.push(issue('INVALID_DESCRIPTOR_SPECIFICITY', path + '.specificity', 'Die Spezifität muss eine nichtnegative Zahl sein.'));
    }
  }

  function validateRule(input) {
    const rule = normalizeRule(input);
    const issues = [];
    const term = TERM_BY_ID[rule.semanticId];

    if (!rule.ruleId) issues.push(issue('MISSING_RULE_ID', 'ruleId', 'Jede Übersetzungsregel benötigt eine ruleId.'));
    if (!term) issues.push(issue('UNKNOWN_SEMANTIC_TERM', 'semanticId', 'Unbekannter kanonischer Begriff: ' + rule.semanticId));
    if (!ALLOWED_CATEGORIES.has(rule.category)) issues.push(issue('INVALID_CATEGORY', 'category', 'Unbekannte Matrix-Kategorie: ' + rule.category));
    if (term && rule.category && term.category !== rule.category) {
      issues.push(issue('CATEGORY_TERM_MISMATCH', 'category', 'Kategorie und kanonischer Begriff passen nicht zusammen.'));
    }
    if (!rule.frameworkFamily) issues.push(issue('MISSING_FRAMEWORK_FAMILY', 'frameworkFamily', 'frameworkFamily ist erforderlich.'));
    if (!rule.frameworkId) issues.push(issue('MISSING_FRAMEWORK_ID', 'frameworkId', 'frameworkId ist erforderlich.'));
    if (!ALLOWED_DIRECTIONS.has(rule.direction)) issues.push(issue('INVALID_DIRECTION', 'direction', 'Unbekannte Übersetzungsrichtung: ' + rule.direction));
    if ((rule.direction === DIRECTIONS.detect || rule.direction === DIRECTIONS.bidirectional) && !rule.detect.length) {
      issues.push(issue('MISSING_DETECT_DESCRIPTOR', 'detect', 'Für diese Richtung wird mindestens ein Erkennungs-Descriptor benötigt.'));
    }
    if ((rule.direction === DIRECTIONS.emit || rule.direction === DIRECTIONS.bidirectional) && !rule.emit.length) {
      issues.push(issue('MISSING_EMIT_DESCRIPTOR', 'emit', 'Für diese Richtung wird mindestens ein Ausgabe-Descriptor benötigt.'));
    }
    if (!Number.isFinite(rule.confidence) || rule.confidence < 0 || rule.confidence > 1) {
      issues.push(issue('INVALID_CONFIDENCE', 'confidence', 'confidence muss zwischen 0 und 1 liegen.'));
    }
    if (!Number.isFinite(rule.priority)) issues.push(issue('INVALID_PRIORITY', 'priority', 'priority muss numerisch sein.'));
    rule.detect.forEach((descriptor, index) => validateDescriptor(descriptor, 'detect[' + index + ']', issues));
    rule.emit.forEach((descriptor, index) => validateDescriptor(descriptor, 'emit[' + index + ']', issues));

    return deepFreeze({
      valid: issues.every(item => item.severity !== 'error'),
      issues,
      rule
    });
  }

  function createRule(input) {
    const result = validateRule(input);
    if (!result.valid) {
      const error = new Error('OLUNTIR_TRANSLATION_MATRIX_INVALID_RULE');
      error.code = 'OLUNTIR_TRANSLATION_MATRIX_INVALID_RULE';
      error.issues = result.issues;
      throw error;
    }
    return deepFreeze(result.rule);
  }

  function normalizeProfile(input) {
    const source = input || {};
    const rawRules = Array.isArray(source.rules) ? source.rules : [];
    return {
      schemaVersion: SCHEMA_VERSION,
      id: token(source.id),
      family: token(source.family),
      version: text(source.version),
      label: text(source.label),
      rules: rawRules.map(normalizeRule),
      capabilities: uniqueTokens(source.capabilities),
      metadata: clone(source.metadata || {})
    };
  }

  function validateProfile(input) {
    const profile = normalizeProfile(input);
    const issues = [];
    const ruleIds = new Set();

    if (!profile.id) issues.push(issue('MISSING_PROFILE_ID', 'id', 'Jedes Matrixprofil benötigt eine id.'));
    if (!profile.family) issues.push(issue('MISSING_PROFILE_FAMILY', 'family', 'Jedes Matrixprofil benötigt eine family.'));
    if (!profile.version) issues.push(issue('MISSING_PROFILE_VERSION', 'version', 'Jedes Matrixprofil benötigt eine version.'));

    profile.rules.forEach((rule, index) => {
      const result = validateRule(rule);
      result.issues.forEach(item => issues.push(Object.assign({}, item, { path: 'rules[' + index + '].' + item.path })));
      if (ruleIds.has(rule.ruleId)) issues.push(issue('DUPLICATE_RULE_ID', 'rules[' + index + '].ruleId', 'ruleId ist im Profil nicht eindeutig: ' + rule.ruleId));
      ruleIds.add(rule.ruleId);
      if (rule.frameworkId && profile.id && rule.frameworkId !== profile.id) {
        issues.push(issue('RULE_PROFILE_MISMATCH', 'rules[' + index + '].frameworkId', 'Regel und Profil verwenden unterschiedliche frameworkId.'));
      }
      if (rule.frameworkFamily && profile.family && rule.frameworkFamily !== profile.family) {
        issues.push(issue('RULE_FAMILY_MISMATCH', 'rules[' + index + '].frameworkFamily', 'Regel und Profil verwenden unterschiedliche frameworkFamily.'));
      }
    });

    return deepFreeze({
      valid: issues.every(item => item.severity !== 'error'),
      issues,
      profile
    });
  }

  function createProfile(input) {
    const result = validateProfile(input);
    if (!result.valid) {
      const error = new Error('OLUNTIR_TRANSLATION_MATRIX_INVALID_PROFILE');
      error.code = 'OLUNTIR_TRANSLATION_MATRIX_INVALID_PROFILE';
      error.issues = result.issues;
      throw error;
    }
    return deepFreeze(result.profile);
  }

  function createRegistry(profiles) {
    const source = Array.isArray(profiles) ? profiles : [];
    const normalized = source.map(profile => createProfile(profile));
    const ids = new Set();
    normalized.forEach(profile => {
      if (ids.has(profile.id)) {
        const error = new Error('OLUNTIR_TRANSLATION_MATRIX_DUPLICATE_PROFILE');
        error.code = 'OLUNTIR_TRANSLATION_MATRIX_DUPLICATE_PROFILE';
        throw error;
      }
      ids.add(profile.id);
    });
    const byId = Object.freeze(normalized.reduce((result, profile) => {
      result[profile.id] = profile;
      return result;
    }, {}));

    function getProfile(profileId) {
      return byId[token(profileId)] || null;
    }

    function findRules(request) {
      const query = request || {};
      const profile = getProfile(query.frameworkId);
      if (!profile) return Object.freeze([]);
      const semanticId = token(query.semanticId);
      const direction = token(query.direction);
      return Object.freeze(profile.rules
        .filter(rule => (!semanticId || rule.semanticId === semanticId))
        .filter(rule => (!direction || rule.direction === direction || rule.direction === DIRECTIONS.bidirectional))
        .slice()
        .sort((left, right) => right.priority - left.priority || right.confidence - left.confidence || left.ruleId.localeCompare(right.ruleId)));
    }

    function snapshot() {
      return deepFreeze({
        schemaVersion: SCHEMA_VERSION,
        readOnly: true,
        mutationEnabled: false,
        profileCount: normalized.length,
        profiles: clone(normalized)
      });
    }

    return deepFreeze({
      schemaVersion: SCHEMA_VERSION,
      readOnly: true,
      mutationEnabled: false,
      profiles: Object.freeze(normalized.slice()),
      getProfile,
      findRules,
      snapshot
    });
  }

  return Object.freeze({
    SCHEMA_VERSION,
    CATEGORIES,
    DIRECTIONS,
    DESCRIPTOR_KINDS,
    CANONICAL_TERMS,
    TERM_BY_ID,
    readOnly: true,
    mutationEnabled: false,
    normalizeRule,
    validateRule,
    createRule,
    normalizeProfile,
    validateProfile,
    createProfile,
    createRegistry
  });
});
