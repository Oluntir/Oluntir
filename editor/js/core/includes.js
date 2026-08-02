(function () {
  'use strict';

  const frameworkId = () => (window.PAGEBUILDER_FRAMEWORK || { id: 'bs4' }).id;
  const storageKey = () => `oluntir-includes-${frameworkId()}`;
  const emptyRegions = () => ({ header: '', navigation: '', footer: '' });
  const legacyPlaceholderRegions = {
    header: '<header class="py-4 bg-light"><div class="container"><strong>Oluntir</strong></div></header>',
    navigation: '<nav class="navbar navbar-expand-lg navbar-dark bg-dark"><div class="container"><a class="navbar-brand" href="index.html">Start</a></div></nav>',
    footer: '<footer class="py-4 bg-light"><div class="container"><small>&copy; Oluntir</small></div></footer>'
  };
  const defaults = {
    schemaVersion: 1,
    enabled: false,
    decided: false,
    exportTarget: 'html',
    // A new reusable-area project starts completely empty. Header, navigation
    // and footer become shared content only after the user inserts them.
    regions: emptyRegions(),
    sections: []
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function esc(value) {
    return String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function slug(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'bereich';
  }
  function normalizeSection(section, index) {
    const id = slug(section && (section.id || section.name) || `bereich-${index + 1}`);
    return {
      id,
      name: String(section && section.name || id).trim() || id,
      content: String(section && section.content || '<section class="py-5"><div class="container"><h2>Sich inhaltlich wiederholender Bereich</h2></div></section>'),
      pages: Array.isArray(section && section.pages) ? [...new Set(section.pages.map(String))] : []
    };
  }
  function isLegacyPlaceholderSet(regions) {
    if (!regions || typeof regions !== 'object') return false;
    return ['header', 'navigation', 'footer'].every((name) =>
      String(regions[name] || '').trim() === legacyPlaceholderRegions[name]
    );
  }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey()) || 'null');
      const savedRegions = saved && saved.regions ? saved.regions : {};
      // Migration for the first Shared Content Manager preview: its demo
      // header/navigation/footer must never overwrite an existing project.
      const regions = isLegacyPlaceholderSet(savedRegions)
        ? emptyRegions()
        : Object.assign(emptyRegions(), savedRegions);
      return Object.assign(clone(defaults), saved || {}, {
        regions,
        sections: Array.isArray(saved && saved.sections) ? saved.sections.map(normalizeSection) : []
      });
    } catch (e) { return clone(defaults); }
  }
  let state = load();
  function save() {
    localStorage.setItem(storageKey(), JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('oluntir:includeschange', { detail: clone(state) }));
  }
  function editorInstance() { return window.OluntirEditor || null; }
  function pageList() {
    const editor = editorInstance();
    if (!editor || !editor.Pages) return [];
    return editor.Pages.getAll().map((page, index) => ({
      id: String(page.id),
      name: page.getName() || (index === 0 ? 'Startseite (index)' : String(page.id))
    }));
  }
  function selectedPageId() {
    const editor = editorInstance();
    const selected = editor && editor.Pages && editor.Pages.getSelected();
    return selected ? String(selected.id) : '';
  }
  function allIncludes() {
    const items = [
      { id: 'header', name: 'Header', path: 'includes/layout/header.html', content: state.regions.header },
      { id: 'navigation', name: 'Navigation', path: 'includes/layout/navigation.html', content: state.regions.navigation },
      { id: 'footer', name: 'Footer', path: 'includes/layout/footer.html', content: state.regions.footer }
    ];
    state.sections.forEach(s => items.push({ id: s.id, name: s.name, path: `includes/sections/${slug(s.id)}.html`, content: s.content || '' }));
    return items;
  }
  function normalizeIncludePath(path) {
    return String(path || '')
      .trim()
      .replace(/\\/g, '/')
      .replace(/^\.\//, '')
      .replace(/^\//, '')
      .replace(/\/{2,}/g, '/');
  }
  function findByPath(path) {
    const clean = normalizeIncludePath(path);
    return allIncludes().find(item => {
      const itemPath = normalizeIncludePath(item.path);
      return itemPath === clean || itemPath.replace('/layout/', '/') === clean;
    });
  }
  function expression(path, target) {
    const clean = normalizeIncludePath(path);
    if (target === 'ssi') return `<!--#include virtual="${clean}" -->`;
    if (target === 'php') return `<?php include __DIR__ . '/${clean}'; ?>`;
    return `<ope-include src="${clean}"></ope-include>`;
  }
  function parseIncludeReferences(html) {
    const references = [];
    String(html || '').replace(/<ope-include\s+[^>]*src=["']([^"']+)["'][^>]*>(?:<\/ope-include>)?/gi, (match, path) => {
      references.push(normalizeIncludePath(path));
      return match;
    });
    return references;
  }
  function resolveCustomTags(html, target, stack) {
    const chain = Array.isArray(stack) ? stack : [];
    return String(html || '').replace(/<ope-include\s+[^>]*src=["']([^"']+)["'][^>]*>(?:<\/ope-include>)?/gi, (match, rawPath) => {
      const path = normalizeIncludePath(rawPath);
      const item = findByPath(path);
      if (!item) return `<!-- Fehlender sich inhaltlich wiederholender Bereich: ${path} -->`;
      if (chain.includes(item.path)) return `<!-- Zyklischer sich inhaltlich wiederholender Bereich: ${item.path} -->`;
      if (target === 'html') return resolveCustomTags(item.content, 'html', chain.concat(item.path));
      return expression(item.path, target);
    });
  }
  function assignedSections(pageId) {
    return state.sections.filter(section => section.pages.includes(String(pageId)));
  }

  function normalizedMarkup(value) {
    const template = document.createElement('template');
    template.innerHTML = String(value || '').trim();
    return template.innerHTML.replace(/>\s+</g, '><').trim();
  }

  function firstElementFromHtml(value) {
    const template = document.createElement('template');
    template.innerHTML = String(value || '').trim();
    return template.content.firstElementChild || null;
  }

  function headerContainsNavigation() {
    const template = document.createElement('template');
    template.innerHTML = String(state.regions.header || '').trim();
    return Boolean(template.content.querySelector('nav'));
  }

  function replaceExactElement(template, sourceHtml, replacementHtml, preferredSelector) {
    const sourceElement = firstElementFromHtml(sourceHtml);
    if (!sourceElement) return false;
    const expected = normalizedMarkup(sourceElement.outerHTML);
    const selector = preferredSelector || sourceElement.tagName.toLowerCase();
    const candidates = Array.from(template.content.querySelectorAll(selector));
    const match = candidates.find((element) => normalizedMarkup(element.outerHTML) === expected);
    if (!match) return false;
    const marker = document.createElement('template');
    marker.innerHTML = String(replacementHtml || '').trim();
    match.replaceWith(marker.content.cloneNode(true));
    return true;
  }

  function replaceLayoutRegionInPlace(template, name, target, diagnostics) {
    const configured = String(state.regions[name] || '').trim();
    if (!configured) return false;
    const path = `includes/layout/${name}.html`;
    const replacement = target === 'html'
      ? resolveCustomTags(configured, 'html', [path])
      : expression(path, target);
    const selector = name === 'navigation' ? 'nav' : name;
    const replaced = replaceExactElement(template, configured, replacement, selector);
    if (!replaced) diagnostics.push({ type: 'unresolved-layout-anchor', region: name, path });
    return replaced;
  }

  function replaceAssignedSectionsInPlace(template, target, pageId, diagnostics) {
    assignedSections(pageId).forEach((section) => {
      const path = `includes/sections/${slug(section.id)}.html`;
      const replacement = target === 'html'
        ? resolveCustomTags(section.content, 'html', [path])
        : expression(path, target);
      const sourceElement = firstElementFromHtml(section.content);
      const selector = sourceElement ? sourceElement.tagName.toLowerCase() : '*';
      const replaced = replaceExactElement(template, section.content, replacement, selector);
      if (!replaced) diagnostics.push({ type: 'unresolved-section-anchor', sectionId: section.id, path });
    });
  }

  function compilePage(html, target, pageId) {
    if (!state.enabled) return { html, extension: 'html', includeFiles: [], target: 'html', diagnostics: [] };
    const selected = ['html', 'ssi', 'php'].includes(target) ? target : state.exportTarget;
    const currentPageId = String(pageId || selectedPageId());
    const diagnostics = [];
    const template = document.createElement('template');
    template.innerHTML = resolveCustomTags(String(html || ''), selected, []);

    // Bestehende Positionen sind der Vertrag. Layoutbereiche und zusätzliche
    // Shared Sections werden nur an ihrer tatsächlich vorhandenen Modellposition
    // ersetzt. Es gibt kein Entfernen aller Tags und kein Voranstellen vor den Body.
    replaceLayoutRegionInPlace(template, 'header', selected, diagnostics);
    const configuredHeader = firstElementFromHtml(state.regions.header);
    const configuredHeaderContainsNavigation = Boolean(configuredHeader && (configuredHeader.matches('nav') || configuredHeader.querySelector('nav')));
    if (!configuredHeaderContainsNavigation) replaceLayoutRegionInPlace(template, 'navigation', selected, diagnostics);
    replaceAssignedSectionsInPlace(template, selected, currentPageId, diagnostics);
    replaceLayoutRegionInPlace(template, 'footer', selected, diagnostics);

    const pageHtml = template.innerHTML;
    parseIncludeReferences(pageHtml).forEach(path => {
      if (!findByPath(path)) diagnostics.push({ type: 'missing', path });
    });
    const extension = selected === 'php' ? 'php' : selected === 'ssi' ? 'shtml' : 'html';
    return {
      html: pageHtml,
      extension,
      includeFiles: selected === 'html' ? [] : allIncludes(),
      target: selected,
      diagnostics
    };
  }
  function preparePage(html, target, pageId) {
    return compilePage(html, target, pageId);
  }
  function validateExport(target) {
    const selected = ['html', 'ssi', 'php'].includes(target) ? target : state.exportTarget;
    const errors = [];
    const warnings = [];
    if (!state.decided) errors.push('Die Projektstruktur wurde noch nicht festgelegt.');
    if (state.enabled) {
      ['header', 'navigation', 'footer'].forEach(name => {
        if (!String(state.regions[name] || '').trim()) errors.push(`${name.charAt(0).toUpperCase() + name.slice(1)} ist leer.`);
      });
      const paths = allIncludes().map(item => normalizeIncludePath(item.path));
      const duplicates = paths.filter((path, index) => paths.indexOf(path) !== index);
      if (duplicates.length) errors.push(`Doppelte Include-Pfade: ${[...new Set(duplicates)].join(', ')}`);
      allIncludes().forEach(item => {
        parseIncludeReferences(item.content).forEach(path => {
          if (!findByPath(path)) errors.push(`Fehlender sich inhaltlich wiederholender Bereich in ${item.path}: ${path}`);
        });
      });
      state.sections.filter(section => !section.pages.length).forEach(section => warnings.push(`„${section.name}“ wird auf keiner Seite verwendet.`));
    }
    return { ok: errors.length === 0, target: selected, errors, warnings };
  }
  function projectManifest() {
    return {
      format: 'Oluntir Project',
      schemaVersion: state.schemaVersion,
      projectType: state.enabled ? 'reusable-regions' : 'classic-html',
      framework: frameworkId(),
      exportTarget: state.exportTarget,
      layout: state.enabled ? {
        header: 'includes/layout/header.html',
        navigation: 'includes/layout/navigation.html',
        footer: 'includes/layout/footer.html'
      } : null,
      reusableRegions: state.sections.map(section => ({
        id: section.id,
        name: section.name,
        path: `includes/sections/${slug(section.id)}.html`,
        pages: [...section.pages]
      }))
    };
  }
  function validation() {
    const ids = state.sections.map(section => section.id);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    const emptyNames = state.sections.filter(section => !String(section.name || '').trim());
    const unused = state.sections.filter(section => section.pages.length === 0);
    return {
      ok: state.decided && duplicateIds.length === 0 && emptyNames.length === 0,
      checks: [
        { ok: state.decided, label: 'Projektstruktur wurde festgelegt.' },
        { ok: !state.enabled || Boolean(state.regions.header.trim()), label: 'Header ist vorhanden.' },
        { ok: !state.enabled || Boolean(state.regions.navigation.trim()), label: 'Navigation ist vorhanden.' },
        { ok: !state.enabled || Boolean(state.regions.footer.trim()), label: 'Footer ist vorhanden.' },
        { ok: duplicateIds.length === 0, label: duplicateIds.length ? `Doppelte IDs: ${[...new Set(duplicateIds)].join(', ')}` : 'Keine doppelten IDs.' },
        { ok: emptyNames.length === 0, label: emptyNames.length ? 'Alle sich inhaltlich wiederholenden Bereiche benötigen einen Namen.' : 'Alle Bereiche sind benannt.' },
        { ok: unused.length === 0, warning: true, label: unused.length ? `${unused.length} sich inhaltlich wiederholende(r) Bereich(e) werden auf keiner Seite verwendet.` : 'Alle Bereiche werden mindestens auf einer Seite verwendet.' }
      ]
    };
  }
  function renderValidation() {
    const root = document.getElementById('oluntir-manager-validation');
    if (!root) return;
    root.innerHTML = validation().checks.map(check => `<div class="oluntir-check ${check.ok ? 'is-ok' : (check.warning ? 'is-warning' : 'is-error')}">${check.ok ? '✓' : (check.warning ? '!' : '×')} ${esc(check.label)}</div>`).join('');
  }
  function renderSections() {
    const root = document.getElementById('oluntir-include-sections');
    if (!root) return;
    const pages = pageList();
    root.innerHTML = state.sections.map((section, index) => {
      const usage = section.pages.length;
      const pageChecks = pages.length ? pages.map(page => `<label class="oluntir-page-check"><input type="checkbox" data-section-page="${index}" value="${esc(page.id)}" ${section.pages.includes(page.id) ? 'checked' : ''}> ${esc(page.name)}</label>`).join('') : '<p class="oluntir-include-hint">Seiten werden verfügbar, sobald der Editor vollständig geladen ist.</p>';
      return `<article class="oluntir-manager-card" data-section-card="${index}">
        <div class="oluntir-manager-card-head"><div><strong>${esc(section.name)}</strong><small>${usage ? `Verwendet auf ${usage} Seite(n)` : 'Noch keiner Seite zugeordnet'}</small></div><button type="button" data-section-remove="${index}" aria-label="Bereich löschen">×</button></div>
        <div class="oluntir-manager-fields"><label>Name<input type="text" data-section-name="${index}" value="${esc(section.name)}" required></label><label>ID / Dateiname<input type="text" data-section-id="${index}" value="${esc(section.id)}" required></label></div>
        <label>Inhalt<textarea data-section-content="${index}">${esc(section.content)}</textarea></label>
        <fieldset><legend>Verwendet auf</legend><div class="oluntir-page-grid">${pageChecks}</div></fieldset>
        ${usage ? '' : '<p class="oluntir-unused-warning">⚠ Dieser wiederverwendbare Bereich wird auf keiner Seite verwendet.</p>'}
      </article>`;
    }).join('') || '<p class="oluntir-manager-empty">Noch keine zusätzlichen sich inhaltlich wiederholenden Bereiche vorhanden.</p>';
    renderValidation();
  }
  function syncForm() {
    const choice = document.querySelector(`input[name="oluntir-project-type"][value="${state.enabled ? 'yes' : 'no'}"]`);
    if (state.decided && choice) choice.checked = true;
    document.querySelectorAll('input[name="oluntir-project-type"]').forEach(input => { input.disabled = state.decided; });
    const target = document.getElementById('oluntir-include-target');
    if (target) target.value = state.exportTarget;
    ['header','navigation','footer'].forEach(key => {
      const el = document.getElementById(`oluntir-include-${key}`);
      if (el) el.value = state.regions[key] || '';
    });
    const manager = document.getElementById('oluntir-manager-content');
    if (manager) manager.hidden = !(state.decided && state.enabled);
    updateSaveButton();
    renderSections();
  }
  function updateSaveButton() {
    const button = document.getElementById('oluntir-includes-save');
    if (!button) return;
    const selected = document.querySelector('input[name="oluntir-project-type"]:checked');
    button.disabled = !state.decided && !selected;
  }
  function openModal(firstRun) {
    const modal = document.getElementById('oluntir-includes-modal');
    if (!modal) return;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    modal.dataset.firstRun = firstRun ? 'true' : 'false';
    syncForm();
  }
  function closeModal() {
    const modal = document.getElementById('oluntir-includes-modal');
    if (!modal) return;
    if (modal.dataset.firstRun === 'true' && !state.decided) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
  }
  function readManagerForm() {
    const target = document.getElementById('oluntir-include-target');
    if (target) state.exportTarget = target.value;
    ['header','navigation','footer'].forEach(key => {
      const el = document.getElementById(`oluntir-include-${key}`);
      if (el) state.regions[key] = el.value;
    });
    document.querySelectorAll('[data-section-card]').forEach(card => {
      const index = Number(card.dataset.sectionCard);
      const section = state.sections[index];
      if (!section) return;
      section.name = card.querySelector('[data-section-name]').value.trim();
      section.id = slug(card.querySelector('[data-section-id]').value || section.name);
      section.content = card.querySelector('[data-section-content]').value;
      section.pages = Array.from(card.querySelectorAll('[data-section-page]:checked')).map(input => input.value);
    });
  }
  function bind() {
    const openButton = document.getElementById('btn-includes');
    if (openButton) openButton.addEventListener('click', () => openModal(false));
    document.getElementById('oluntir-includes-close').addEventListener('click', closeModal);
    document.getElementById('oluntir-includes-cancel').addEventListener('click', () => {
      const modal = document.getElementById('oluntir-includes-modal');
      if (modal && modal.dataset.firstRun === 'true' && !state.decided && window.OluntirStartup) window.OluntirStartup.endApplication();
      else closeModal();
    });
    document.querySelectorAll('input[name="oluntir-project-type"]').forEach(input => input.addEventListener('change', updateSaveButton));
    document.getElementById('oluntir-includes-save').addEventListener('click', () => {
      if (!state.decided) {
        const selected = document.querySelector('input[name="oluntir-project-type"]:checked');
        if (!selected) return;
        state.enabled = selected.value === 'yes';
        state.decided = true;
      }
      readManagerForm();
      const result = validation();
      if (!result.ok) { renderValidation(); return; }
      save();
      if (window.OluntirStartup) window.OluntirStartup.setMeta({ projectType: state.enabled ? 'reusable-regions' : 'classic', includesSchemaVersion: state.schemaVersion });
      closeModal();
      if (window.toast) window.toast(state.enabled ? 'Projekt mit sich inhaltlich wiederholenden Elementen und Bereichen gespeichert.' : 'Klassisches HTML-Projekt gespeichert.');
    });
    document.getElementById('oluntir-include-add').addEventListener('click', () => {
      readManagerForm();
      const number = state.sections.length + 1;
      state.sections.push(normalizeSection({ id: `bereich-${number}`, name: `Bereich ${number}`, pages: selectedPageId() ? [selectedPageId()] : [] }, state.sections.length));
      renderSections();
      const cards = document.querySelectorAll('[data-section-card]');
      if (cards.length) cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    document.getElementById('oluntir-include-sections').addEventListener('click', event => {
      const button = event.target.closest('[data-section-remove]');
      if (!button) return;
      const index = Number(button.dataset.sectionRemove);
      const section = state.sections[index];
      if (!section || !confirm(`Sich inhaltlich wiederholenden Bereich „${section.name}“ löschen?`)) return;
      state.sections.splice(index, 1);
      renderSections();
    });
    document.getElementById('oluntir-include-sections').addEventListener('change', renderValidation);
    window.addEventListener('oluntir:editorready', renderSections);
    window.addEventListener('oluntir:newproject', event => {
      if (event && event.detail && typeof event.detail.reusable === 'boolean') {
        state = clone(defaults);
        state.enabled = event.detail.reusable;
        state.decided = true;
        save();
      } else {
        state = clone(defaults);
      }
      syncForm();
    });
  }

  window.OluntirIncludes = {
    getState: () => clone(state),
    preparePage,
    compilePage,
    validateExport,
    getIncludeFiles: () => allIncludes().map(clone),
    getExportTarget: () => state.enabled ? state.exportTarget : 'html',
    getProjectManifest: () => clone(projectManifest()),
    validate: () => clone(validation()),
    exportState: () => clone(state),
    initializeProject: (enabled) => {
      state = clone(defaults);
      state.enabled = Boolean(enabled);
      state.decided = true;
      save();
      syncForm();
      return clone(state);
    },
    importState: (value) => {
      if (!value || typeof value !== 'object') return;
      const importedRegions = isLegacyPlaceholderSet(value.regions)
        ? emptyRegions()
        : Object.assign(emptyRegions(), value.regions || {});
      state = Object.assign(clone(defaults), value, {
        regions: importedRegions,
        sections: Array.isArray(value.sections) ? value.sections.map(normalizeSection) : []
      });
      save();
    },
    removePageReferences: (pageId) => {
      const normalized = String(pageId || '');
      if (!normalized) return false;
      let changed = false;
      state.sections = state.sections.map((section) => {
        const pages = (section.pages || []).filter(id => String(id) !== normalized);
        if (pages.length !== (section.pages || []).length) changed = true;
        return Object.assign({}, section, { pages });
      });
      if (changed) {
        save();
        syncForm();
      }
      return changed;
    },
    updateLayoutRegions: (regions) => {
      if (!state.enabled || !regions || typeof regions !== 'object') return clone(state.regions);
      let changed = false;
      ['header', 'navigation', 'footer'].forEach((name) => {
        if (typeof regions[name] !== 'string' || !regions[name].trim()) return;
        if (state.regions[name] === regions[name]) return;
        state.regions[name] = regions[name];
        changed = true;
      });
      if (changed) {
        save();
        syncForm();
      }
      return clone(state.regions);
    },
    open: () => openModal(false)
  };
  document.addEventListener('DOMContentLoaded', bind);
})();
