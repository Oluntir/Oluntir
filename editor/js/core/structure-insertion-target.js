(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirStructureInsertionTarget = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const SCHEMA_VERSION = 8;

  function buildModel(editor) {
    const api = root && root.OluntirDocumentApi;
    if (!api || typeof api.buildInsertionModel !== 'function') {
      return Object.freeze({ schemaVersion: SCHEMA_VERSION, pageId: null, roots: Object.freeze([]), nodes: Object.freeze([]), slots: Object.freeze([]) });
    }
    return api.buildInsertionModel(editor);
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function renderSlot(slot) {
    const isAreaInsert = slot.slotKind === 'new-gallery-area';
    if (isAreaInsert) {
      return `<div class="oluntir-gallery-area-insert-block" data-gallery-area-insert>
        <span class="oluntir-gallery-area-arrow" aria-hidden="true">➜</span>
        <button type="button" class="oluntir-gallery-area-insert-action" data-slot-id="${esc(slot.slotId)}" title="${esc(slot.label)}">
          <span class="oluntir-gallery-area-insert-title">Neuen Galerie-Bereich hier einschieben</span>
          <span class="oluntir-gallery-area-insert-detail">${esc(slot.label)}</span>
        </button>
      </div>`;
    }
    return `<button type="button" class="oluntir-row-insert-slot" data-slot-id="${esc(slot.slotId)}" title="${esc(slot.label)}">
      <span class="oluntir-row-insert-line" aria-hidden="true"></span>
      <span class="oluntir-row-insert-label">${esc(slot.label)}</span>
    </button>`;
  }

  function renderRow(row, index) {
    const classes = (row.classes || []).filter(Boolean).slice(0, 8).map(value => `.${value}`).join('');
    return `<div class="oluntir-row-summary" data-highlight-node="${esc(row.nodeId)}">
      <span class="oluntir-row-summary-type">ROW ${index + 1}</span>
      <strong>${esc(classes || '.row')}</strong>
      <small>${esc(row.origin || 'page')}</small>
    </div>`;
  }

  function renderGroup(group, model) {
    const contextOnly = group.contextOnly === true;
    const slots = contextOnly ? [] : model.slots.filter(slot => slot.parentIdentity === group.identity && slot.slotKind !== 'new-gallery-area');
    const before = slots.find(slot => slot.slotKind === 'before-row');
    const empty = slots.find(slot => slot.slotKind === 'empty-layout-area');
    let content = '';
    if (empty) {
      content = renderSlot(empty);
    } else {
      if (before) content += renderSlot(before);
      (group.rows || []).forEach((row, index) => {
        content += renderRow(row, index);
        const after = slots.find(slot => slot.anchorIdentity === row.identity && slot.mode === 'after');
        if (after) content += renderSlot(after);
      });
    }

    const classes = (group.classes || []).filter(Boolean).slice(0, 6).map(value => `.${value}`).join('');
    if (contextOnly) {
      const contextLabel = group.origin === 'shared-header' ? 'NAVIGATION / HEADER' : 'FOOTER';
      return `<section class="oluntir-row-slot-group oluntir-context-layout-group" data-layout-origin="${esc(group.origin || 'page')}">
        <header class="oluntir-row-slot-group-head" data-highlight-layout="${esc(group.identity)}">
          <span>${esc(contextLabel)}</span>
          <strong>${esc(classes || group.label || '')}</strong>
          <small>${esc(group.origin || 'page')} · nur Orientierung</small>
        </header>
      </section>`;
    }
    return `<section class="oluntir-row-slot-group" data-layout-origin="${esc(group.origin || 'page')}">
      <header class="oluntir-row-slot-group-head" data-highlight-layout="${esc(group.identity)}">
        <span>${esc(String(group.templateRole || group.type || 'layout').toUpperCase())}</span>
        <strong>${esc(classes || group.label || '')}</strong>
        <small>${esc(group.origin || 'page')}</small>
      </header>
      <div class="oluntir-row-slot-sequence">${content}</div>
    </section>`;
  }

  function comparePosition(left, right) {
    const lp = Array.isArray(left && left.positionPath) ? left.positionPath : [];
    const rp = Array.isArray(right && right.positionPath) ? right.positionPath : [];
    const length = Math.max(lp.length, rp.length);
    for (let index = 0; index < length; index += 1) {
      const lv = Number.isInteger(lp[index]) ? lp[index] : -1;
      const rv = Number.isInteger(rp[index]) ? rp[index] : -1;
      if (lv !== rv) return lv - rv;
    }
    const li = Number.isInteger(left && left.positionIndex) ? left.positionIndex : 0;
    const ri = Number.isInteger(right && right.positionIndex) ? right.positionIndex : 0;
    return li - ri;
  }

  function pathStartsWith(path, prefix) {
    if (!Array.isArray(path) || !Array.isArray(prefix) || !prefix.length || prefix.length > path.length) return false;
    return prefix.every((value, index) => path[index] === value);
  }

  function renderModel(model) {
    const roots = Array.from(model.roots || []);
    const header = roots.filter(group => group.origin === 'shared-header').map(group => renderGroup(group, model)).join('');
    const footer = roots.filter(group => group.origin === 'shared-footer').map(group => renderGroup(group, model)).join('');
    const pageGroups = roots
      .filter(group => {
        if (!((group.origin === 'main' || group.origin === 'page') && ['container', 'container-fluid'].includes(group.templateRole))) return false;
        // Empty Bootstrap containers are not valid ROW insertion targets and
        // must not appear as a synthetic layout block in the chooser. Their
        // former empty-container slot belonged to the superseded concept.
        return Array.isArray(group.rows) && group.rows.length > 0;
      })
      .sort(comparePosition);
    const areas = Array.from(model.visualAreas || []).sort(comparePosition);
    const areaSlots = Array.from(model.areaSlots || []).sort((left, right) => (left.visualIndex || 0) - (right.visualIndex || 0));
    let page = '';

    if (!areas.length) {
      // A page without resolved visual areas still keeps the visible Bootstrap
      // groups in their actual order. Area slots are placed around those groups
      // instead of being emitted as a detached block above them.
      pageGroups.forEach((group, index) => {
        const before = areaSlots.find(slot => slot.visualIndex === index);
        if (before) page += renderSlot(before);
        page += renderGroup(group, model);
      });
      const after = areaSlots.find(slot => slot.visualIndex === pageGroups.length);
      if (after) page += renderSlot(after);
    } else {
      const assigned = new Set();
      const buckets = areas.map((area) => {
        const areaPath = Array.isArray(area.positionPath) ? area.positionPath : [];
        const groups = pageGroups.filter((group) => {
          if (group.areaIdentity === area.identity) return true;
          return pathStartsWith(group.positionPath, areaPath);
        });
        groups.forEach(group => assigned.add(group.identity));
        return groups;
      });

      // Resolver variants may expose MAIN boundaries and visible containers
      // with different runtime identities. Any still-unassigned container is
      // therefore mapped by its real template order, never appended afterward.
      const unassigned = pageGroups.filter(group => !assigned.has(group.identity));
      unassigned.forEach((group) => {
        const groupPath = Array.isArray(group.positionPath) ? group.positionPath : [];
        let targetIndex = areas.findIndex((area) => {
          const areaPath = Array.isArray(area.positionPath) ? area.positionPath : [];
          return areaPath.length && groupPath.length && areaPath[0] === groupPath[0];
        });
        if (targetIndex < 0) targetIndex = Math.min(buckets.length - 1, pageGroups.indexOf(group));
        if (targetIndex >= 0) buckets[targetIndex].push(group);
      });
      buckets.forEach(bucket => bucket.sort(comparePosition));

      // Only areas that actually own a visible blue Bootstrap group take
      // part in the chooser sequence. Empty resolver-only areas must not
      // create two adjacent orange boundaries. Their surrounding boundaries
      // collapse into one target around the nearest visible areas.
      const visibleEntries = areas
        .map((area, index) => ({ area, index, groups: buckets[index] }))
        .filter(entry => entry.groups.length > 0);

      if (visibleEntries.length) {
        const firstBoundary = areaSlots.find(slot => slot.visualIndex === visibleEntries[0].index);
        if (firstBoundary) {
          page += renderSlot(Object.assign({}, firstBoundary, {
            label: 'Neuen Galerie-Bereich vor dem ersten Seitenbereich erstellen'
          }));
        }

        visibleEntries.forEach((entry, visibleIndex) => {
          page += entry.groups.map(group => renderGroup(group, model)).join('');
          const isLastVisible = visibleIndex === visibleEntries.length - 1;
          const nextVisible = isLastVisible ? null : visibleEntries[visibleIndex + 1];
          const boundaryIndex = isLastVisible ? entry.index + 1 : nextVisible.index;
          const boundary = areaSlots.find(slot => slot.visualIndex === boundaryIndex);
          if (!boundary) return;
          page += renderSlot(Object.assign({}, boundary, {
            label: isLastVisible
              ? 'Neuen Galerie-Bereich nach dem letzten Seitenbereich erstellen'
              : `Neuen Galerie-Bereich zwischen Seitenbereich ${visibleIndex + 1} und ${visibleIndex + 2} erstellen`
          }));
        });
      }
    }

    return `${header}<div class="oluntir-page-layout-sequence">${page}</div>${footer}`;
  }

  function highlightNode(model, node) {
    const api = root && root.OluntirDocumentApi;
    return api && typeof api.highlightNode === 'function'
      ? api.highlightNode(model.pageId, node.identity)
      : function () {};
  }

  function previewApi() {
    return root && root.OluntirPreviewApi ? root.OluntirPreviewApi : null;
  }

  function validateSlot(slot) {
    const api = root && root.OluntirDocumentApi;
    return Boolean(api && typeof api.validateTarget === 'function' && api.validateTarget(slot));
  }


  function choose(editor, options) {
    const cfg = Object.assign({ title: 'Einfügeposition wählen', itemLabel: 'das Element' }, options || {});
    const model = buildModel(editor);

    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'pb-modal-overlay oluntir-structure-target-overlay';
      overlay.setAttribute('role', 'presentation');
      const groups = renderModel(model);
      overlay.innerHTML = `<div class="pb-modal oluntir-structure-target-modal" role="dialog" aria-modal="true" aria-labelledby="oluntir-structure-target-title">
        <h2 id="oluntir-structure-target-title">${esc(cfg.title)}</h2>
        <p>Wähle einen freien Template-Slot für ${esc(cfg.itemLabel)}. Angezeigt werden Bootstrap-Layoutbereiche mit ihren direkten ROWs. Blaue Linien fügen die Galerie als ROW in einen vorhandenen Container ein. Orange Pfeile schieben einen vollständig neuen Galerie-Bereich zwischen bestehende Seitenbereiche ein. Beim Überfahren wird die tatsächliche Position im Editor markiert.</p>
        <div class="oluntir-structure-target-list">${groups || '<p class="oluntir-structure-target-empty">Auf der aktuellen Seite wurden keine Bootstrap-ROW-Slots gefunden.</p>'}</div>
        <div class="pb-modal-actions"><button type="button" class="btn btn-secondary" data-structure-target-cancel>Abbrechen</button></div>
      </div>`;

      document.body.appendChild(overlay);
      const modal = overlay.querySelector('.oluntir-structure-target-modal');
      let finished = false;
      let restoreHighlight = null;

      function clearHighlight() {
        const preview = previewApi();
        if (preview && typeof preview.clear === 'function') preview.clear();
        if (restoreHighlight) restoreHighlight();
        restoreHighlight = null;
      }

      function finish(value) {
        if (finished) return;
        finished = true;
        clearHighlight();
        document.removeEventListener('keydown', onKey, true);
        overlay.remove();
        resolve(value);
      }

      function onKey(event) {
        if (event.key === 'Escape') { event.preventDefault(); finish(null); return; }
        if (event.key !== 'Tab') return;
        const focusable = Array.from(modal.querySelectorAll('button:not(:disabled)'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }

      document.addEventListener('keydown', onKey, true);
      overlay.addEventListener('click', event => { if (event.target === overlay) finish(null); });
      overlay.querySelector('[data-structure-target-cancel]').addEventListener('click', () => finish(null));

      overlay.querySelectorAll('[data-highlight-node]').forEach((element) => {
        const node = model.nodes.find(item => item.nodeId === element.getAttribute('data-highlight-node'));
        const enter = () => { clearHighlight(); if (node) restoreHighlight = highlightNode(model, node); };
        element.addEventListener('mouseenter', enter);
        element.addEventListener('focusin', enter);
        element.addEventListener('mouseleave', clearHighlight);
        element.addEventListener('focusout', clearHighlight);
      });

      overlay.querySelectorAll('[data-highlight-layout]').forEach((element) => {
        const identity = element.getAttribute('data-highlight-layout');
        const enter = () => { clearHighlight(); if (identity) restoreHighlight = highlightNode(model, { identity }); };
        element.addEventListener('mouseenter', enter);
        element.addEventListener('mouseleave', clearHighlight);
      });

      overlay.querySelectorAll('[data-slot-id]').forEach((button) => {
        const slotFor = () => {
          const slotId = button.getAttribute('data-slot-id');
          return Array.from(model.slots || []).find(item => item.slotId === slotId)
            || Array.from(model.areaSlots || []).find(item => item.slotId === slotId)
            || null;
        };
        const enter = () => {
          const slot = slotFor();
          const preview = previewApi();
          if (slot && preview && typeof preview.showSlot === 'function') preview.showSlot(slot, { delayMs: slot.slotKind === 'new-gallery-area' ? 0 : 180, behavior: 'smooth' });
        };
        const leave = () => {
          const preview = previewApi();
          if (preview && typeof preview.clear === 'function') preview.clear();
          else if (preview && typeof preview.cancelPending === 'function') preview.cancelPending();
        };
        button.addEventListener('mouseenter', enter);
        button.addEventListener('focusin', enter);
        button.addEventListener('mouseleave', leave);
        button.addEventListener('focusout', leave);
        button.addEventListener('click', async () => {
          const slot = slotFor();
          if (!slot || !validateSlot(slot)) {
            alert('Die gewählte Template-Position ist nicht mehr verfügbar. Bitte öffne die Auswahl erneut.');
            return;
          }
          const preview = previewApi();
          if (preview && typeof preview.scrollTo === 'function') await preview.scrollTo(slot, { behavior: 'smooth' });
          finish(Object.freeze(Object.assign({
            schemaVersion: SCHEMA_VERSION,
            targetType: slot.slotKind === 'new-gallery-area' ? 'gallery-area-slot' : 'bootstrap-row-slot'
          }, slot)));
        });
      });

      const first = overlay.querySelector('[data-slot-id]') || overlay.querySelector('[data-structure-target-cancel]');
      if (first) first.focus();
    });
  }

  return Object.freeze({ SCHEMA_VERSION, buildModel, choose });
});
