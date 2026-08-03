(() => {
  'use strict';
  function create(editor) {
    let selector = null;
    let lastAreaInsertionDiagnostic = null;

    function componentSummary(component) {
      if (!component) return null;
      let tagName = '';
      let identity = '';
      let classes = [];
      try { tagName = String(component.get ? component.get('tagName') || '' : '').toLowerCase(); } catch (error) {}
      try { identity = String(adapter && adapter.componentIdentity ? adapter.componentIdentity(component) || '' : ''); } catch (error) {}
      try { classes = component.getClasses ? component.getClasses().map(String) : []; } catch (error) {}
      return { tagName, identity, classes };
    }

    function setAreaDiagnostic(code, stage, target, details) {
      lastAreaInsertionDiagnostic = Object.freeze({
        timestamp: new Date().toISOString(),
        code: String(code || 'UNKNOWN'),
        stage: String(stage || 'unknown'),
        slotId: target && target.slotId ? String(target.slotId) : null,
        pageId: target && target.pageId ? String(target.pageId) : null,
        mode: target && target.mode ? String(target.mode) : null,
        anchorIdentity: target && target.anchorIdentity ? String(target.anchorIdentity) : null,
        parentIdentity: target && target.parentIdentity ? String(target.parentIdentity) : null,
        details: details || {}
      });
      return null;
    }
    const compatibility = window.OluntirGrapesCompatibility.check(editor);
    const adapter = {
      editor, compatibility,
      setImageSelector(value) { selector = value; },
      getAssets() { return editor.AssetManager.getAll(); },
      getModalElement() { return editor.Modal && editor.Modal.getContentEl ? editor.Modal.getContentEl() : null; },
      getWorkspacePanelNodes() {
        const selectors = [
          '.gjs-pn-views',
          '.gjs-pn-views-container'
        ];
        const nodes = [];
        selectors.forEach((panelSelector) => {
          document.querySelectorAll(panelSelector).forEach((node) => {
            if (!nodes.includes(node)) nodes.push(node);
          });
        });
        return nodes;
      },
      getSelectedPage() {
        return editor.Pages && editor.Pages.getSelected ? editor.Pages.getSelected() : null;
      },
      getPageById(pageId) {
        const pages = editor.Pages && editor.Pages.getAll ? editor.Pages.getAll() : [];
        const identities = window.OluntirLayoutIdentities;
        return (pages || []).find((page) => {
          const semanticId = identities && identities.pageId ? identities.pageId(page) : null;
          const modelId = page && page.get ? page.get('id') : null;
          return String(semanticId || '') === String(pageId || '') || String(modelId || '') === String(pageId || '');
        }) || null;
      },
      resolveIdentity(page, identity) {
        const identities = window.OluntirLayoutIdentities;
        return identities && identities.findById ? identities.findById(page, identity) : null;
      },
      describeIdentity(page, identity) {
        const component = adapter.resolveIdentity(page, identity);
        if (!component) return null;
        const attrs = component.getAttributes ? component.getAttributes() || {} : {};
        const classes = component.getClasses ? component.getClasses().map(String) : String(attrs.class || '').split(/\s+/).filter(Boolean);
        const tagName = String(component.get ? component.get('tagName') || '' : '').toLowerCase();
        const semantics = window.OluntirTemplateSemantics;
        const template = semantics && typeof semantics.resolveRole === 'function'
          ? semantics.resolveRole({ tagName, classes, attributes: attrs })
          : { role: tagName || 'element', frameworkRole: null, framework: null };
        let origin = 'page';
        let current = component;
        while (current) {
          const ancestorTag = String(current.get ? current.get('tagName') || '' : '').toLowerCase();
          if (ancestorTag === 'header') { origin = 'shared-header'; break; }
          if (ancestorTag === 'footer') { origin = 'shared-footer'; break; }
          if (ancestorTag === 'main') { origin = 'main'; break; }
          current = current.parent ? current.parent() : null;
        }
        return {
          identity,
          tagName,
          classes,
          attributes: attrs,
          templateRole: template.role,
          frameworkRole: template.frameworkRole,
          framework: template.framework,
          origin,
          isRow: template.role === 'row'
        };
      },
      describeIdentityPosition(page, identity) {
        const component = adapter.resolveIdentity(page, identity);
        if (!component) return null;
        const parent = component.parent ? component.parent() : null;
        if (!parent) return null;
        const parentIdentity = adapter.componentIdentity(parent);
        const collection = parent.components && parent.components();
        const siblings = collection && Array.isArray(collection.models) ? collection.models : [];
        const index = siblings.indexOf(component);
        if (!parentIdentity || index < 0) return null;
        const path = [];
        let cursor = component;
        while (cursor) {
          const cursorParent = cursor.parent ? cursor.parent() : null;
          if (!cursorParent) break;
          const cursorCollection = cursorParent.components && cursorParent.components();
          const cursorSiblings = cursorCollection && Array.isArray(cursorCollection.models) ? cursorCollection.models : [];
          const cursorIndex = cursorSiblings.indexOf(cursor);
          if (cursorIndex < 0) break;
          path.unshift(cursorIndex);
          cursor = cursorParent;
        }
        return { parentIdentity, index, path };
      },
      getLastAreaInsertionDiagnostic() {
        return lastAreaInsertionDiagnostic;
      },
      // Template First: determine the real boundary from the rendered canvas
      // Legacy contract equivalent retained for regression readability:
      // if (!main || !boundary || typeof main.append !== 'function') return null;
      resolveAreaInsertionTarget(target) {
        lastAreaInsertionDiagnostic = null;
        if (!target) return setAreaDiagnostic('TARGET_MISSING', 'input', target);
        if (target.slotKind !== 'new-gallery-area') return setAreaDiagnostic('SLOT_KIND_INVALID', 'input', target, { slotKind: target.slotKind || null });
        if (!target.pageId) return setAreaDiagnostic('PAGE_ID_MISSING', 'input', target);
        if (!['main', 'page-root'].includes(target.structureScope)) return setAreaDiagnostic('STRUCTURE_SCOPE_INVALID', 'input', target, { structureScope: target.structureScope || null });
        if (target.actionKind !== 'new-area') return setAreaDiagnostic('ACTION_KIND_INVALID', 'input', target, { actionKind: target.actionKind || null });
        const page = adapter.getPageById(target.pageId);
        if (!page) return setAreaDiagnostic('PAGE_NOT_FOUND', 'page', target);

        // Completely empty projects have no semantic MAIN yet. Their page root
        // is therefore the only valid insertion owner. This path is accepted
        // exclusively for the explicit empty-page slot emitted by the document
        // model and does not weaken normal MAIN-boundary validation.
        if (target.structureScope === 'page-root') {
          if (target.mode !== 'inside-end' || target.anchorIdentity || target.emptyPage !== true) {
            return setAreaDiagnostic('EMPTY_PAGE_CONTRACT_INVALID', 'empty-page', target);
          }
          const pageRoot = page.getMainComponent ? page.getMainComponent() : null;
          const pageRootBoundary = `page-root:${target.pageId}`;
          if (!pageRoot || typeof pageRoot.append !== 'function') return setAreaDiagnostic('EMPTY_PAGE_ROOT_NOT_APPENDABLE', 'empty-page', target);
          if (!target.parentIdentity || String(pageRootBoundary) !== String(target.parentIdentity)) {
            return setAreaDiagnostic('EMPTY_PAGE_ROOT_IDENTITY_MISMATCH', 'empty-page', target, { expected: target.parentIdentity || null, actual: pageRootBoundary });
          }
          const collection = pageRoot.components && pageRoot.components();
          const children = collection && Array.isArray(collection.models) ? collection.models : [];
          if (children.length) return setAreaDiagnostic('EMPTY_PAGE_NO_LONGER_EMPTY', 'empty-page', target, { childCount: children.length });
          lastAreaInsertionDiagnostic = Object.freeze({ timestamp: new Date().toISOString(), code: 'OK', stage: 'resolved-empty-page', slotId: target.slotId || null, details: { at: 0, pageRoot: componentSummary(pageRoot) } });
          return { page, parent: pageRoot, at: 0, anchor: null, structureScope: 'page-root' };
        }

        if (target.mode === 'inside-end' && !target.anchorIdentity) {
          if (!target.parentIdentity) return setAreaDiagnostic('EMPTY_MAIN_PARENT_IDENTITY_MISSING', 'empty-main', target);
          const main = adapter.resolveIdentity(page, target.parentIdentity);
          const description = adapter.describeIdentity(page, target.parentIdentity);
          if (!main) return setAreaDiagnostic('EMPTY_MAIN_NOT_RESOLVED', 'empty-main', target);
          if (typeof main.append !== 'function') return setAreaDiagnostic('EMPTY_MAIN_NOT_APPENDABLE', 'empty-main', target, { main: componentSummary(main) });
          if (!description) return setAreaDiagnostic('EMPTY_MAIN_DESCRIPTION_MISSING', 'empty-main', target, { main: componentSummary(main) });
          if (description.templateRole !== 'main') return setAreaDiagnostic('EMPTY_MAIN_ROLE_INVALID', 'empty-main', target, { templateRole: description.templateRole || null, main: componentSummary(main) });
          const collection = main.components && main.components();
          const children = collection && Array.isArray(collection.models) ? collection.models : [];
          lastAreaInsertionDiagnostic = Object.freeze({ timestamp: new Date().toISOString(), code: 'OK', stage: 'resolved-empty-main', slotId: target.slotId || null, details: { at: children.length, main: componentSummary(main) } });
          return { page, parent: main, at: children.length, anchor: null, structureScope: 'main' };
        }

        if (!target.anchorIdentity) return setAreaDiagnostic('ANCHOR_IDENTITY_MISSING', 'anchor', target);
        if (!['before', 'after'].includes(target.mode)) return setAreaDiagnostic('MODE_INVALID', 'anchor', target, { mode: target.mode || null });
        const anchor = adapter.resolveIdentity(page, target.anchorIdentity);
        if (!anchor) return setAreaDiagnostic('ANCHOR_NOT_RESOLVED', 'anchor', target);

        // DEV_011 FIX17: The AreaSlot already names its stable owner and anchor.
        // Resolve that contract first instead of rediscovering MAIN through the
        // rendered Canvas or through a potentially incomplete model parent chain.
        // Older completed templates intentionally use the semantic page root
        // (data-oluntir-page-id) as the owner of the visible MAIN areas.
        const pageRoot = page.getMainComponent ? page.getMainComponent() : null;
        let declaredOwner = target.parentIdentity
          ? adapter.resolveIdentity(page, target.parentIdentity)
          : null;
        if (!declaredOwner && target.parentIdentity && String(adapter.getPageById(target.parentIdentity) || '') === String(page || '')) {
          declaredOwner = pageRoot;
        }
        if (!declaredOwner && target.parentIdentity && String(target.parentIdentity) === String(target.pageId)) {
          declaredOwner = pageRoot;
        }
        if (declaredOwner && typeof declaredOwner.append === 'function') {
          let directBoundary = anchor;
          let directParent = directBoundary.parent ? directBoundary.parent() : null;
          const visited = new Set();
          while (directBoundary && directParent && directParent !== declaredOwner && !visited.has(directBoundary)) {
            visited.add(directBoundary);
            directBoundary = directParent;
            directParent = directBoundary.parent ? directBoundary.parent() : null;
          }

          if (directBoundary && directParent === declaredOwner) {
            const ownerCollection = declaredOwner.components && declaredOwner.components();
            const ownerChildren = ownerCollection && Array.isArray(ownerCollection.models) ? ownerCollection.models : [];
            const boundaryIdentity = adapter.componentIdentity(directBoundary);
            const boundaryElement = directBoundary.getEl ? directBoundary.getEl() : null;
            const boundaryIndex = ownerChildren.findIndex((child) => {
              if (child === directBoundary) return true;
              const childIdentity = adapter.componentIdentity(child);
              if (boundaryIdentity && childIdentity && String(boundaryIdentity) === String(childIdentity)) return true;
              const childElement = child && child.getEl ? child.getEl() : null;
              return Boolean(boundaryElement && childElement && boundaryElement === childElement);
            });

            if (boundaryIndex >= 0) {
              const ownerTag = String(declaredOwner.get ? declaredOwner.get('tagName') || '' : '').toLowerCase();
              const ownerIdentity = adapter.componentIdentity(declaredOwner);
              const isSemanticPageRoot = declaredOwner === pageRoot || (ownerIdentity && String(ownerIdentity) === String(target.parentIdentity));
              const isMainOwner = ownerTag === 'main' || isSemanticPageRoot;
              if (isMainOwner) {
                const at = target.mode === 'after' ? boundaryIndex + 1 : boundaryIndex;
                const liveBoundary = ownerChildren[boundaryIndex] || directBoundary;
                lastAreaInsertionDiagnostic = Object.freeze({
                  timestamp: new Date().toISOString(),
                  code: 'OK',
                  stage: 'resolved-stable-area-slot',
                  slotId: target.slotId || null,
                  details: {
                    at,
                    index: boundaryIndex,
                    owner: componentSummary(declaredOwner),
                    boundary: componentSummary(liveBoundary),
                    sourceAnchor: componentSummary(anchor),
                    ownerKind: ownerTag === 'main' ? 'main' : 'semantic-page-root'
                  }
                });
                return { page, parent: declaredOwner, at, anchor: liveBoundary, sourceAnchor: anchor, structureScope: 'main' };
              }
            }
          }
        }

        let boundary = null;
        let main = null;
        let boundaryElement = null;
        const anchorElement = anchor.getEl ? anchor.getEl() : null;
        const mainElement = anchorElement && anchorElement.closest ? anchorElement.closest('main') : null;
        const domDetails = {
          anchor: componentSummary(anchor),
          anchorElementPresent: Boolean(anchorElement),
          mainElementPresent: Boolean(mainElement),
          anchorTag: anchorElement && anchorElement.tagName ? String(anchorElement.tagName).toLowerCase() : null
        };
        if (mainElement) {
          boundaryElement = anchorElement;
          while (boundaryElement && boundaryElement.parentElement !== mainElement) boundaryElement = boundaryElement.parentElement;
          domDetails.boundaryElementPresent = Boolean(boundaryElement);
          domDetails.boundaryTag = boundaryElement && boundaryElement.tagName ? String(boundaryElement.tagName).toLowerCase() : null;
          try {
            const componentFromElement = (element) => {
              if (!element) return null;
              const view = element.__gjsv || null;
              if (view && view.model) return view.model;
              const cashModel = element.__cashData && element.__cashData.model;
              return cashModel || null;
            };
            main = componentFromElement(mainElement);
            boundary = componentFromElement(boundaryElement);
            domDetails.mainFromDom = componentSummary(main);
            domDetails.boundaryFromDom = componentSummary(boundary);
            if (!boundary) {
              let candidate = anchor;
              while (candidate) {
                const element = candidate.getEl ? candidate.getEl() : null;
                if (element && element.parentElement === mainElement) { boundary = candidate; break; }
                candidate = candidate.parent ? candidate.parent() : null;
              }
            }
            if (!main && boundary && boundary.parent) {
              const candidateMain = boundary.parent();
              const candidateElement = candidateMain && candidateMain.getEl ? candidateMain.getEl() : null;
              const candidateTag = String(candidateMain && candidateMain.get ? candidateMain.get('tagName') || '' : '').toLowerCase();
              if (candidateElement === mainElement || candidateTag === 'main') main = candidateMain;
            }
          } catch (error) {
            domDetails.domException = String(error && error.message ? error.message : error);
            main = null; boundary = null;
          }
        }

        if (!main || !boundary) {
          boundary = anchor;
          let parent = boundary.parent ? boundary.parent() : null;
          const semantics = window.OluntirTemplateSemantics;
          const chain = [];
          while (parent) {
            const parentTagName = String(parent.get ? parent.get('tagName') || '' : '').toLowerCase();
            const parentAttrs = parent.getAttributes ? parent.getAttributes() || {} : {};
            const parentClasses = parent.getClasses ? parent.getClasses().map(String) : String(parentAttrs.class || '').split(/\s+/).filter(Boolean);
            const parentRole = semantics && typeof semantics.resolveRole === 'function' ? semantics.resolveRole({ tagName: parentTagName, classes: parentClasses, attributes: parentAttrs }).role : parentTagName;
            chain.push({ tagName: parentTagName, role: parentRole || null, identity: adapter.componentIdentity(parent) || null });
            if (parentRole === 'main' || parentTagName === 'main') { main = parent; break; }
            boundary = parent;
            parent = boundary.parent ? boundary.parent() : null;
          }
          domDetails.modelChain = chain;
        }
        if (!main) return setAreaDiagnostic('MAIN_NOT_RESOLVED', 'main-resolution', target, domDetails);
        if (!boundary) return setAreaDiagnostic('BOUNDARY_NOT_RESOLVED', 'boundary-resolution', target, Object.assign(domDetails, { main: componentSummary(main) }));
        if (typeof main.append !== 'function') return setAreaDiagnostic('MAIN_NOT_APPENDABLE', 'main-validation', target, { main: componentSummary(main), boundary: componentSummary(boundary), dom: domDetails });

        if (target.parentIdentity) {
          const declaredParent = adapter.resolveIdentity(page, target.parentIdentity);
          if (declaredParent) {
            const declaredIdentity = adapter.componentIdentity(declaredParent);
            const liveIdentity = adapter.componentIdentity(main);
            if (declaredIdentity && liveIdentity && String(declaredIdentity) !== String(liveIdentity)) {
              return setAreaDiagnostic('MAIN_IDENTITY_MISMATCH', 'main-validation', target, { declaredIdentity, liveIdentity, declaredParent: componentSummary(declaredParent), main: componentSummary(main) });
            }
          }
        }

        const collection = main.components && main.components();
        const children = collection && Array.isArray(collection.models) ? collection.models : [];
        const boundaryIdentity = adapter.componentIdentity(boundary);
        const boundaryDom = boundary && boundary.getEl ? boundary.getEl() : null;
        let index = children.findIndex((child) => {
          if (child === boundary) return true;
          const childIdentity = adapter.componentIdentity(child);
          if (boundaryIdentity && childIdentity && String(boundaryIdentity) === String(childIdentity)) return true;
          const childDom = child && child.getEl ? child.getEl() : null;
          return Boolean(boundaryDom && childDom && boundaryDom === childDom);
        });
        if (index < 0 && mainElement && boundaryElement) {
          index = children.findIndex((child) => {
            const childDom = child && child.getEl ? child.getEl() : null;
            return Boolean(childDom && childDom === boundaryElement);
          });
        }
        if (index < 0) {
          return setAreaDiagnostic('BOUNDARY_INDEX_NOT_FOUND', 'boundary-index', target, {
            main: componentSummary(main), boundary: componentSummary(boundary), boundaryIdentity: boundaryIdentity || null,
            childCount: children.length, children: children.map(componentSummary), dom: domDetails
          });
        }

        const liveBoundary = children[index] || boundary;
        const at = target.mode === 'after' ? index + 1 : index;
        lastAreaInsertionDiagnostic = Object.freeze({
          timestamp: new Date().toISOString(), code: 'OK', stage: 'resolved', slotId: target.slotId || null,
          details: { at, index, main: componentSummary(main), boundary: componentSummary(liveBoundary), sourceAnchor: componentSummary(anchor), dom: domDetails }
        });
        return { page, parent: main, at, anchor: liveBoundary, sourceAnchor: anchor, structureScope: 'main' };
      },
      resolveInsertionTarget(target) {
        if (!target || !target.pageId) return null;

        // Preview and productive insertion deliberately share the exact same
        // AreaSlot resolver. The insertion path therefore cannot reinterpret
        // a boundary differently after the user has previewed it.
        if (target.slotKind === 'new-gallery-area') {
          return adapter.resolveAreaInsertionTarget(target);
        }

        const page = adapter.getPageById(target.pageId);
        if (!page) return null;

        // Existing ROW insertions keep their established runtime-anchor logic.
        if (target.mode === 'before' || target.mode === 'after') {
          if (!target.anchorIdentity) return null;
          const anchor = adapter.resolveIdentity(page, target.anchorIdentity);
          if (!anchor) return null;
          const parent = anchor.parent ? anchor.parent() : null;
          if (!parent || typeof parent.append !== 'function') return null;
          const collection = parent.components && parent.components();
          const siblings = collection && Array.isArray(collection.models) ? collection.models : [];
          const index = siblings.indexOf(anchor);
          if (index < 0) return null;
          return {
            page,
            parent,
            at: target.mode === 'after' ? index + 1 : index,
            anchor
          };
        }

        if (!target.parentIdentity) return null;
        const parent = adapter.resolveIdentity(page, target.parentIdentity);
        if (!parent || typeof parent.append !== 'function') return null;
        let at = 0;
        if (target.mode === 'inside-end') {
          const collection = parent.components && parent.components();
          at = collection && Array.isArray(collection.models) ? collection.models.length : 0;
        } else if (target.mode !== 'inside-start') {
          return null;
        }
        return { page, parent, at };
      },
      resolvePreviewInsertionTarget(target) {
        // Productive insertion uses the shared strict AreaSlot resolver. The
        // read-only preview additionally keeps the proven FIX9 fallback: when
        // an older template exposes the visible boundary anchor but not a
        // resolvable MAIN owner identity, preview and scrolling may still use
        // that live anchor without weakening the later insert validation.
        const strict = adapter.resolveInsertionTarget(target);
        if (strict) return strict;
        if (!target || target.slotKind !== 'new-gallery-area' || !target.pageId) return null;
        const page = adapter.getPageById(target.pageId);
        if (!page || !target.anchorIdentity || !['before', 'after'].includes(target.mode)) return null;
        const anchor = adapter.resolveIdentity(page, target.anchorIdentity);
        if (!anchor || !anchor.getEl || !anchor.getEl()) return null;
        const parent = anchor.parent ? anchor.parent() : null;
        const collection = parent && parent.components ? parent.components() : null;
        const siblings = collection && Array.isArray(collection.models) ? collection.models : [];
        const index = siblings.indexOf(anchor);
        if (!parent || index < 0) return null;
        return {
          page,
          parent,
          at: target.mode === 'after' ? index + 1 : index,
          anchor,
          previewOnly: true,
          structureScope: 'main-boundary-preview'
        };
      },
      canPreviewInsertionTarget(target) {
        return Boolean(adapter.resolvePreviewInsertionTarget(target));
      },
      insertHtmlAtTarget(target, html) {
        const resolved = adapter.resolveInsertionTarget(target);
        if (!resolved) throw new Error('OLUNTIR_DOCUMENT_TARGET_UNAVAILABLE');
        const result = resolved.parent.append(html, { at: resolved.at });
        return Array.isArray(result) ? result[0] : result;
      },
      componentIdentity(component) {
        const identities = window.OluntirLayoutIdentities;
        if (!component || !identities || typeof identities.componentId !== 'function') return null;
        return identities.componentId(component) || null;
      },
      describeComponentPosition(component) {
        if (!component) return null;
        const parent = component.parent ? component.parent() : null;
        if (!parent) return null;
        const page = adapter.getSelectedPage();
        const identities = window.OluntirLayoutIdentities;
        const pageId = identities && identities.pageId ? identities.pageId(page) : (page && page.get ? page.get('id') : null);
        const parentIdentity = adapter.componentIdentity(parent);
        const collection = parent.components && parent.components();
        const siblings = collection && Array.isArray(collection.models) ? collection.models : [];
        const at = siblings.indexOf(component);
        if (!pageId || !parentIdentity || at < 0) return null;
        return { pageId, parentIdentity, at };
      },
      insertHtmlAtPosition(position, html) {
        if (!position || !position.pageId || !position.parentIdentity) return null;
        const page = adapter.getPageById(position.pageId);
        const parent = page ? adapter.resolveIdentity(page, position.parentIdentity) : null;
        if (!parent || typeof parent.append !== 'function') return null;
        const result = parent.append(html, { at: Math.max(0, Number(position.at) || 0) });
        return Array.isArray(result) ? result[0] : result;
      },
      removeComponent(component) {
        if (!component || typeof component.remove !== 'function') return false;
        component.remove();
        return true;
      },
      componentHtml(component) {
        return component && typeof component.toHTML === 'function' ? component.toHTML() : '';
      },
      componentAttributes(component) {
        return component && typeof component.getAttributes === 'function' ? Object.assign({}, component.getAttributes() || {}) : {};
      },
      setComponentAttributes(component, attributes) {
        if (!component) return false;
        const next = Object.assign({}, attributes || {});
        if (typeof component.set === 'function') component.set('attributes', next);
        else if (typeof component.setAttributes === 'function') component.setAttributes(next);
        else return false;
        return true;
      },
      highlightIdentity(pageId, identity, styles) {
        const page = adapter.getPageById(pageId);
        const component = page ? adapter.resolveIdentity(page, identity) : null;
        const element = component && component.getEl ? component.getEl() : null;
        if (!element || !element.style) return function () {};
        const previous = {
          outline: element.style.outline,
          outlineOffset: element.style.outlineOffset,
          boxShadow: element.style.boxShadow
        };
        element.style.outline = styles && styles.outline ? styles.outline : '3px solid #4b9be8';
        element.style.outlineOffset = styles && styles.outlineOffset ? styles.outlineOffset : '3px';
        element.style.boxShadow = styles && styles.boxShadow ? styles.boxShadow : '0 0 0 5px rgba(75,155,232,.28)';
        return function restore() {
          element.style.outline = previous.outline;
          element.style.outlineOffset = previous.outlineOffset;
          element.style.boxShadow = previous.boxShadow;
        };
      },
      insertionTargetGeometry(target, resolved) {
        if (!target || !resolved) return null;
        const anchorEl = resolved.anchor && resolved.anchor.getEl ? resolved.anchor.getEl() : null;
        const parentEl = resolved.parent && resolved.parent.getEl ? resolved.parent.getEl() : null;
        const parentCollection = resolved.parent && resolved.parent.components ? resolved.parent.components() : null;
        const parentChildren = parentCollection && Array.isArray(parentCollection.models) ? parentCollection.models : [];
        const beforeComponent = Number.isInteger(resolved.at) && resolved.at > 0 ? parentChildren[resolved.at - 1] : null;
        const afterComponent = Number.isInteger(resolved.at) && resolved.at < parentChildren.length ? parentChildren[resolved.at] : null;
        const beforeEl = beforeComponent && beforeComponent.getEl ? beforeComponent.getEl() : null;
        const afterEl = afterComponent && afterComponent.getEl ? afterComponent.getEl() : null;
        const reference = anchorEl || afterEl || beforeEl || parentEl;
        if (!reference || !reference.ownerDocument || typeof reference.getBoundingClientRect !== 'function') return null;

        const referenceRect = reference.getBoundingClientRect();
        const parentRect = parentEl && typeof parentEl.getBoundingClientRect === 'function' ? parentEl.getBoundingClientRect() : referenceRect;
        const beforeRect = beforeEl && typeof beforeEl.getBoundingClientRect === 'function' ? beforeEl.getBoundingClientRect() : null;
        const afterRect = afterEl && typeof afterEl.getBoundingClientRect === 'function' ? afterEl.getBoundingClientRect() : null;
        let top = referenceRect.top;

        if (target.slotKind === 'new-gallery-area') {
          // MAIN insertions mark the real boundary between direct children.
          // This also keeps inside-end on the bottom edge of the last area,
          // rather than on an arbitrary point inside MAIN padding.
          if (afterRect) top = afterRect.top;
          else if (beforeRect) top = beforeRect.bottom;
          else top = parentRect.top;
        } else if (target.mode === 'after') top = referenceRect.bottom;
        else if (target.mode === 'inside-start') top = referenceRect.top + 8;
        else if (target.mode === 'inside-end') top = referenceRect.bottom - 8;

        const doc = reference.ownerDocument;
        const viewportWidth = Math.max(
          1,
          (doc.defaultView && doc.defaultView.innerWidth) ||
          (doc.documentElement && doc.documentElement.clientWidth) ||
          parentRect.width ||
          referenceRect.width ||
          1
        );
        const isAreaInsert = target.slotKind === 'new-gallery-area';
        return {
          document: doc,
          left: isAreaInsert ? 0 : Math.max(4, parentRect.left || referenceRect.left),
          width: isAreaInsert ? viewportWidth : Math.max(80, parentRect.width || referenceRect.width),
          top,
          markerHeight: isAreaInsert ? 38 : 0
        };
      },
      scrollInsertionTarget(target, options) {
        const resolved = adapter.resolvePreviewInsertionTarget(target);
        if (!resolved) return false;
        const geometry = adapter.insertionTargetGeometry(target, resolved);
        if (!geometry) return false;
        const doc = geometry.document;
        const win = doc.defaultView;
        if (!win) return false;
        const cfg = Object.assign({ behavior: 'smooth', force: false }, options || {});
        const viewportHeight = Math.max(1, win.innerHeight || (doc.documentElement && doc.documentElement.clientHeight) || 1);
        const markerHeight = Math.max(0, Number(geometry.markerHeight || 0));
        const targetY = geometry.top + markerHeight / 2;
        const margin = Math.max(56, Math.min(140, Math.round(viewportHeight * 0.18)));
        if (!cfg.force && targetY >= margin && targetY <= viewportHeight - margin) return true;
        const currentY = Number(win.pageYOffset || (doc.scrollingElement && doc.scrollingElement.scrollTop) || 0);
        const nextY = Math.max(0, currentY + targetY - viewportHeight / 2);
        try { win.scrollTo({ top: nextY, behavior: cfg.behavior === 'auto' ? 'auto' : 'smooth' }); }
        catch (_error) { win.scrollTo(0, nextY); }
        return true;
      },
      highlightInsertionTarget(target) {
        const resolved = adapter.resolvePreviewInsertionTarget(target);
        if (!resolved) return function () {};
        const geometry = adapter.insertionTargetGeometry(target, resolved);
        if (!geometry) return function () {};

        const doc = geometry.document;
        const isAreaInsert = target.slotKind === 'new-gallery-area';
        const accent = isAreaInsert ? '#ff5a00' : '#1687ff';
        const textColor = isAreaInsert ? '#a83b00' : '#0b5fad';
        const labelText = isAreaInsert ? 'NEUER GALERIE-BEREICH' : 'HIER PLATZIEREN';
        const marker = doc.createElement('div');
        marker.setAttribute('data-oluntir-insertion-marker', 'true');
        marker.setAttribute('data-oluntir-insertion-marker-kind', isAreaInsert ? 'gallery-area' : 'row');
        const scrollX = Number((doc.defaultView && doc.defaultView.pageXOffset) || (doc.scrollingElement && doc.scrollingElement.scrollLeft) || 0);
        const scrollY = Number((doc.defaultView && doc.defaultView.pageYOffset) || (doc.scrollingElement && doc.scrollingElement.scrollTop) || 0);
        const documentWidth = Math.max(
          geometry.width,
          (doc.documentElement && doc.documentElement.scrollWidth) || 0,
          (doc.body && doc.body.scrollWidth) || 0
        );
        // The marker lives in the canvas BODY and uses viewport-fixed
        // coordinates. Unlike an absolute child of <html>, it cannot disappear
        // behind the template BODY or be displaced by document scrolling.
        marker.style.position = 'fixed';
        marker.style.boxSizing = 'border-box';
        marker.style.zIndex = '2147483647';
        marker.style.pointerEvents = 'none';
        marker.style.color = textColor;
        marker.style.font = '700 12px/1.2 Arial, sans-serif';
        marker.style.textAlign = 'center';
        marker.style.display = 'flex';
        marker.style.alignItems = 'center';
        marker.style.justifyContent = 'center';
        marker.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,.18))';
        if (isAreaInsert) {
          const markerHeight = Math.max(34, Number(geometry.markerHeight || 38));
          marker.style.left = '0';
          marker.style.width = '100vw';
          marker.style.height = `${markerHeight}px`;
          marker.style.background = 'rgba(255,90,0,.18)';
          marker.style.borderTop = `3px solid ${accent}`;
          marker.style.borderBottom = `3px solid ${accent}`;
        } else {
          marker.style.left = `${Math.max(4, geometry.left)}px`;
          marker.style.width = `${geometry.width}px`;
          marker.style.height = '0';
          marker.style.borderTop = `4px solid ${accent}`;
        }

        const label = doc.createElement('span');
        label.textContent = labelText;
        label.style.display = 'inline-block';
        label.style.padding = isAreaInsert ? '4px 12px' : '2px 8px';
        label.style.borderRadius = '999px';
        label.style.background = '#fff';
        label.style.border = `1px solid ${accent}`;
        if (!isAreaInsert) {
          label.style.position = 'relative';
          label.style.top = '-9px';
        }
        marker.appendChild(label);

        const host = doc.body || doc.documentElement;
        host.appendChild(marker);
        const updatePosition = () => {
          const current = adapter.resolvePreviewInsertionTarget(target);
          const currentGeometry = current ? adapter.insertionTargetGeometry(target, current) : null;
          if (!currentGeometry) return;
          if (isAreaInsert) {
            const markerHeight = Math.max(34, Number(currentGeometry.markerHeight || 38));
            marker.style.top = `${Math.max(0, currentGeometry.top - markerHeight / 2)}px`;
          } else {
            marker.style.left = `${Math.max(4, currentGeometry.left)}px`;
            marker.style.width = `${currentGeometry.width}px`;
            marker.style.top = `${Math.max(2, currentGeometry.top)}px`;
          }
        };
        updatePosition();
        const canvasWindow = doc.defaultView;
        if (canvasWindow) {
          canvasWindow.addEventListener('scroll', updatePosition, { passive: true });
          canvasWindow.addEventListener('resize', updatePosition);
        }
        return function restore() {
          if (canvasWindow) {
            canvasWindow.removeEventListener('scroll', updatePosition);
            canvasWindow.removeEventListener('resize', updatePosition);
          }
          if (marker.parentNode) marker.parentNode.removeChild(marker);
        };
      },
      selfTest() {
        return { compatibility, selector: !!selector, command: !!editor.Commands.get('open-assets') };
      }
    };
    window.OluntirImageSelect.register(adapter);
    if (editor.Commands.get('open-assets') && typeof editor.Commands.remove === 'function') editor.Commands.remove('open-assets');
    editor.Commands.add('open-assets', {
      run(_editor, _sender, options) {
        if (!selector) throw new Error('Oluntir Image-Select ist nicht registriert.');
        selector.open(options || {}); return selector;
      },
      stop() { if (selector && selector.isOpen()) selector.close(); }
    });
    editor.Commands.add('oluntir-open-image-manager', {
      run() {
        if (!selector) throw new Error('Oluntir Image-Select ist nicht registriert.');
        selector.open({ source: 'toolbar' }); return selector;
      },
      stop() { if (selector && selector.isOpen()) selector.close(); }
    });
    try {
      if (editor.Panels && typeof editor.Panels.getButton === 'function' && typeof editor.Panels.addButton === 'function' && !editor.Panels.getButton('options', 'oluntir-image-manager')) {
        editor.Panels.addButton('options', {
          id: 'oluntir-image-manager',
          className: 'fa fa-picture-o',
          command: 'oluntir-open-image-manager',
          attributes: { title: 'Bildmanager öffnen', 'aria-label': 'Bildmanager öffnen' }
        });
      }
    } catch (error) { console.warn('Oluntir: Bildmanager-Schaltfläche konnte nicht registriert werden.', error); }
    return adapter;
  }
  window.OluntirGrapesAdapter = { create };
})();
