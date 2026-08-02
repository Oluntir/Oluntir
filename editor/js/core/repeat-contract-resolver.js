(function (root, factory) {
  const structures = root && root.OluntirStructureResolver
    ? root.OluntirStructureResolver
    : (typeof module === 'object' && module.exports ? require('./structure-resolver.js') : null);
  const relationships = root && root.OluntirRelationshipResolver
    ? root.OluntirRelationshipResolver
    : (typeof module === 'object' && module.exports ? require('./relationship-resolver.js') : null);
  const repeat = root && root.OluntirRepeatEngineV2
    ? root.OluntirRepeatEngineV2
    : (typeof module === 'object' && module.exports ? require('./repeat-engine-v2.js') : null);
  const api = factory(structures, relationships, repeat);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirRepeatContractResolver = api;
})(typeof window !== 'undefined' ? window : globalThis, function (structures, relationships, repeat) {
  'use strict';

  const SCHEMA_VERSION = 1;
  const BINDING_STATUS = Object.freeze({
    RESOLVED: 'resolved',
    MISSING_PAGE: 'missing-page',
    MISSING_ROOT: 'missing-root',
    AMBIGUOUS_ROOT: 'ambiguous-root',
    INVALID_PATH: 'invalid-path'
  });

  function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  }

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(key => deepFreeze(value[key]));
    return Object.freeze(value);
  }

  function frozen(value) {
    return deepFreeze(clone(value));
  }

  function text(value) {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  function issue(code, message, details) {
    return { code: code, message: message, details: clone(details || null) };
  }

  function requireDependencies() {
    if (!structures || typeof structures.resolveProject !== 'function') {
      throw new Error('OluntirStructureResolver is required.');
    }
    if (!relationships || typeof relationships.resolveProject !== 'function') {
      throw new Error('OluntirRelationshipResolver is required.');
    }
    if (!repeat || typeof repeat.snapshot !== 'function') {
      throw new Error('OluntirRepeatEngineV2 is required.');
    }
  }

  function buildIndexes(structureProject, relationshipProject) {
    const pages = new Map();
    (structureProject.pages || []).forEach(page => {
      const byIdentity = new Map();
      (page.nodes || []).forEach(node => {
        const key = text(node.identity);
        if (!key) return;
        if (!byIdentity.has(key)) byIdentity.set(key, []);
        byIdentity.get(key).push(node);
      });
      pages.set(text(page.pageId), { structure: page, byIdentity: byIdentity });
    });

    const relationshipPages = new Map();
    (relationshipProject.pages || []).forEach(page => {
      const byIdentity = new Map();
      (page.relationships || []).forEach(relation => {
        const identities = [relation.ownerIdentity]
          .concat((relation.members || []).map(member => member.identity))
          .map(text)
          .filter(Boolean);
        identities.forEach(identity => {
          if (!byIdentity.has(identity)) byIdentity.set(identity, []);
          byIdentity.get(identity).push(relation);
        });
      });
      relationshipPages.set(text(page.pageId), { snapshot: page, byIdentity: byIdentity });
    });

    return { pages: pages, relationshipPages: relationshipPages };
  }

  function childByIdentity(node, identity) {
    const target = text(identity);
    return (node && node.children || []).filter(child => text(child.identity) === target);
  }

  function resolveRelativePath(rootNode, path) {
    const segments = (path || []).map(text).filter(Boolean);
    let current = rootNode;
    const resolved = [];
    for (let index = 0; index < segments.length; index += 1) {
      const matches = childByIdentity(current, segments[index]);
      if (matches.length !== 1) {
        return {
          valid: false,
          resolved: resolved,
          failedIdentity: segments[index],
          failedIndex: index,
          matchCount: matches.length,
          terminalNode: current || null
        };
      }
      current = matches[0];
      resolved.push(segments[index]);
    }
    return { valid: true, resolved: resolved, terminalNode: current || rootNode };
  }

  function resolveBinding(indexes, pageId, rootIdentity, relativePath) {
    const normalizedPageId = text(pageId);
    const normalizedRoot = text(rootIdentity);
    const page = indexes.pages.get(normalizedPageId);
    const issues = [];

    if (!page) {
      issues.push(issue('REPEAT_BINDING_PAGE_MISSING', 'Die referenzierte Seite wurde nicht aufgelöst.', { pageId: normalizedPageId }));
      return frozen({ status: BINDING_STATUS.MISSING_PAGE, pageId: normalizedPageId, rootIdentity: normalizedRoot, issues: issues });
    }

    const matches = page.byIdentity.get(normalizedRoot) || [];
    if (!matches.length) {
      issues.push(issue('REPEAT_BINDING_ROOT_MISSING', 'Die referenzierte strukturelle Identität wurde nicht gefunden.', { pageId: normalizedPageId, rootIdentity: normalizedRoot }));
      return frozen({ status: BINDING_STATUS.MISSING_ROOT, pageId: normalizedPageId, rootIdentity: normalizedRoot, issues: issues });
    }
    if (matches.length > 1) {
      issues.push(issue('REPEAT_BINDING_ROOT_AMBIGUOUS', 'Die referenzierte strukturelle Identität ist auf der Seite nicht eindeutig.', { pageId: normalizedPageId, rootIdentity: normalizedRoot, matchCount: matches.length }));
      return frozen({ status: BINDING_STATUS.AMBIGUOUS_ROOT, pageId: normalizedPageId, rootIdentity: normalizedRoot, issues: issues });
    }

    const rootNode = matches[0];
    const pathResult = resolveRelativePath(rootNode, relativePath);
    if (!pathResult.valid) {
      issues.push(issue('REPEAT_BINDING_PATH_INVALID', 'Der relative Identity-Pfad konnte nicht eindeutig aufgelöst werden.', {
        pageId: normalizedPageId,
        rootIdentity: normalizedRoot,
        failedIdentity: pathResult.failedIdentity,
        failedIndex: pathResult.failedIndex,
        matchCount: pathResult.matchCount
      }));
      return frozen({
        status: BINDING_STATUS.INVALID_PATH,
        pageId: normalizedPageId,
        rootIdentity: normalizedRoot,
        relativeIdentityPath: (relativePath || []).slice(),
        node: rootNode,
        terminalNode: pathResult.terminalNode,
        issues: issues
      });
    }

    const relationshipPage = indexes.relationshipPages.get(normalizedPageId);
    const related = relationshipPage && relationshipPage.byIdentity.get(normalizedRoot)
      ? relationshipPage.byIdentity.get(normalizedRoot)
      : [];

    return frozen({
      status: BINDING_STATUS.RESOLVED,
      pageId: normalizedPageId,
      rootIdentity: normalizedRoot,
      relativeIdentityPath: (relativePath || []).slice(),
      node: rootNode,
      terminalNode: pathResult.terminalNode,
      relationships: related,
      issues: issues
    });
  }

  function resolveDefinitionWithIndexes(definition, instances, indexes) {
    const source = resolveBinding(
      indexes,
      definition.source && definition.source.pageId,
      definition.source && definition.source.rootIdentity,
      definition.source && definition.source.relativeIdentityPath
    );
    const resolvedInstances = (instances || []).map(instance => ({
      instance: instance,
      binding: resolveBinding(indexes, instance.pageId, instance.rootIdentity, [])
    }));
    const issues = []
      .concat(source.issues || [])
      .concat(resolvedInstances.flatMap(item => item.binding.issues || []));

    return frozen({
      schemaVersion: SCHEMA_VERSION,
      definition: definition,
      source: source,
      instances: resolvedInstances,
      resolved: source.status === BINDING_STATUS.RESOLVED && resolvedInstances.every(item => item.binding.status === BINDING_STATUS.RESOLVED),
      issues: issues
    });
  }

  function resolveProject(editor) {
    requireDependencies();
    const structureProject = structures.resolveProject(editor);
    const relationshipProject = relationships.resolveProject(editor);
    const repeatState = repeat.snapshot();
    const indexes = buildIndexes(structureProject, relationshipProject);
    const definitions = (repeatState.definitions || []).map(definition => resolveDefinitionWithIndexes(
      definition,
      (repeatState.instances || []).filter(instance => instance.definitionId === definition.definitionId),
      indexes
    ));
    const orphanInstances = (repeatState.instances || []).filter(instance => !repeatState.definitions.some(definition => definition.definitionId === instance.definitionId));
    const issues = definitions.flatMap(item => item.issues || []);
    orphanInstances.forEach(instance => issues.push(issue('REPEAT_ORPHAN_INSTANCE', 'Eine Repeat-Instanz besitzt keine Definition.', { instanceId: instance.instanceId, definitionId: instance.definitionId })));

    return frozen({
      schemaVersion: SCHEMA_VERSION,
      scope: 'project',
      structureSchemaVersion: structureProject.schemaVersion,
      relationshipSchemaVersion: relationshipProject.schemaVersion,
      repeatSchemaVersion: repeatState.schemaVersion,
      definitionCount: definitions.length,
      instanceCount: (repeatState.instances || []).length,
      resolvedDefinitionCount: definitions.filter(item => item.resolved).length,
      definitions: definitions,
      orphanInstances: orphanInstances,
      valid: issues.length === 0,
      issues: issues
    });
  }

  function resolveDefinition(editor, definitionId) {
    const project = resolveProject(editor);
    const id = text(definitionId);
    return project.definitions.find(item => item.definition.definitionId === id) || null;
  }

  return Object.freeze({
    SCHEMA_VERSION: SCHEMA_VERSION,
    BINDING_STATUS: BINDING_STATUS,
    resolveProject: resolveProject,
    resolveDefinition: resolveDefinition
  });
});
