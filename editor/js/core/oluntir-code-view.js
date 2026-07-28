(function () {
  'use strict';

  const VERSION = 'Oluntir Editor Preview 0.2';
  const RAW_TAGS = new Set(['pre', 'code', 'script', 'style', 'textarea']);
  const VOID_TAGS = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  const INLINE_TAGS = new Set(['a','abbr','b','bdi','bdo','br','cite','code','data','dfn','em','i','kbd','mark','q','s','samp','small','span','strong','sub','sup','time','u','var']);

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function includeTag(path) {
    return `<ope-include src="${path}"></ope-include>`;
  }

  function replaceFirstElement(html, tagName, replacement) {
    const pattern = new RegExp(`<${tagName}\\b[^>]*>[\\s\\S]*?<\\/${tagName}>`, 'i');
    return pattern.test(html) ? html.replace(pattern, replacement) : html;
  }

  function replaceLastElement(html, tagName, replacement) {
    const pattern = new RegExp(`<${tagName}\\b[^>]*>[\\s\\S]*?<\\/${tagName}>`, 'gi');
    const matches = Array.from(String(html || '').matchAll(pattern));
    if (!matches.length) return html;
    const match = matches[matches.length - 1];
    return html.slice(0, match.index) + replacement + html.slice(match.index + match[0].length);
  }

  function buildOeiSource(editor) {
    let html = String(editor.getHtml() || '');
    const includes = window.OluntirIncludes;
    const state = includes && includes.getState ? includes.getState() : null;
    if (!state || !state.enabled) return html;

    html = replaceFirstElement(html, 'header', includeTag('includes/layout/header.html'));
    html = replaceFirstElement(html, 'nav', includeTag('includes/layout/navigation.html'));
    html = replaceLastElement(html, 'footer', includeTag('includes/layout/footer.html'));

    const selected = editor.Pages && editor.Pages.getSelected ? editor.Pages.getSelected() : null;
    const pageId = selected ? String(selected.id) : '';
    const sectionTags = (state.sections || [])
      .filter((section) => Array.isArray(section.pages) && section.pages.includes(pageId))
      .map((section) => includeTag(`includes/sections/${section.id}.html`))
      .join('\n');

    if (sectionTags && !html.includes('includes/sections/')) {
      const mainMatch = html.match(/<main\b[^>]*>/i);
      if (mainMatch) html = html.replace(mainMatch[0], `${mainMatch[0]}\n${sectionTags}`);
      else html = `${sectionTags}\n${html}`;
    }

    return html;
  }

  function restoreIncludes(source) {
    const includes = window.OluntirIncludes;
    const state = includes && includes.getState ? includes.getState() : null;
    if (!state || !state.enabled) return String(source || '');

    const byPath = new Map();
    (includes.getIncludeFiles ? includes.getIncludeFiles() : []).forEach((item) => {
      byPath.set(String(item.path || '').replace(/^\//, ''), String(item.content || ''));
    });

    return String(source || '').replace(
      /<ope-include\s+[^>]*src=["']([^"']+)["'][^>]*>(?:<\/ope-include>)?/gi,
      (match, rawPath) => {
        const path = String(rawPath || '').replace(/^\.\//, '').replace(/^\//, '');
        return byPath.has(path) ? byPath.get(path) : match;
      }
    );
  }

  function protectRawBlocks(source) {
    const blocks = [];
    const protectedSource = String(source || '').replace(
      /<(pre|code|script|style|textarea)\b[^>]*>[\s\S]*?<\/\1>/gi,
      (block) => {
        const marker = `___Oluntir_RAW_BLOCK_${blocks.length}___`;
        blocks.push(block);
        return marker;
      }
    );
    return { protectedSource, blocks };
  }

  function formatHtml(source) {
    const normalized = String(source || '').replace(/\r\n?/g, '\n').trim();
    if (!normalized) return '';

    const protectedResult = protectRawBlocks(normalized);
    const tokens = protectedResult.protectedSource
      .replace(/>\s*</g, '>\n<')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const lines = [];
    let level = 0;
    const indent = () => '  '.repeat(Math.max(0, level));

    tokens.forEach((token) => {
      const rawMarker = token.match(/^___Oluntir_RAW_BLOCK_(\d+)___$/);
      if (rawMarker) {
        const raw = protectedResult.blocks[Number(rawMarker[1])] || '';
        const rawLines = raw.split('\n');
        rawLines.forEach((line, index) => lines.push(`${indent()}${index ? line : line.trim()}`));
        return;
      }

      const closing = token.match(/^<\/([\w:-]+)\s*>/);
      if (closing) level = Math.max(0, level - 1);

      lines.push(`${indent()}${token}`);

      const opening = token.match(/^<([\w:-]+)\b[^>]*>/);
      if (!opening || closing || /^<!/.test(token) || /^<\?/.test(token)) return;
      const tag = opening[1].toLowerCase();
      const selfClosing = /\/\s*>$/.test(token) || VOID_TAGS.has(tag);
      const closesSameLine = new RegExp(`<\\/${tag}\\s*>\s*$`, 'i').test(token);
      if (!selfClosing && !closesSameLine && !INLINE_TAGS.has(tag)) level += 1;
    });

    return lines.join('\n').replace(/\n{3,}/g, '\n\n');
  }

  function formatCss(source) {
    const text = String(source || '').replace(/\r\n?/g, '\n').trim();
    if (!text) return '';
    let level = 0;
    let result = '';
    let quote = '';
    let comment = false;
    const pad = () => '  '.repeat(level);

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];
      if (comment) {
        result += char;
        if (char === '*' && next === '/') { result += next; i += 1; comment = false; }
        continue;
      }
      if (!quote && char === '/' && next === '*') { result += '/*'; i += 1; comment = true; continue; }
      if (quote) {
        result += char;
        if (char === quote && text[i - 1] !== '\\') quote = '';
        continue;
      }
      if (char === '"' || char === "'") { quote = char; result += char; continue; }
      if (char === '{') { level += 1; result = result.trimEnd() + ' {\n' + pad(); continue; }
      if (char === '}') { level = Math.max(0, level - 1); result = result.trimEnd() + '\n' + pad() + '}\n' + pad(); continue; }
      if (char === ';') { result += ';\n' + pad(); continue; }
      if (/\s/.test(char)) {
        if (!result.endsWith(' ') && !result.endsWith('\n')) result += ' ';
        continue;
      }
      result += char;
    }
    return result.trim().replace(/\n{3,}/g, '\n\n');
  }

  function highlightTag(tag) {
    const match = String(tag || '').match(/^(<\/?)([\w:-]+)([\s\S]*?)(\/?>)$/);
    if (!match) return escapeHtml(tag);
    const prefix = match[1];
    const name = match[2];
    const attributes = match[3] || '';
    const suffix = match[4];
    const isOei = name.toLowerCase() === 'ope-include';
    let renderedAttributes = '';
    let cursor = 0;
    const attrRegex = /([\w:-]+)(\s*=\s*)(["'][\s\S]*?["'])/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attributes))) {
      renderedAttributes += escapeHtml(attributes.slice(cursor, attrMatch.index));
      renderedAttributes += `<span class="tok-attr">${escapeHtml(attrMatch[1])}</span>`;
      renderedAttributes += `<span class="tok-punct">${escapeHtml(attrMatch[2])}</span>`;
      renderedAttributes += `<span class="tok-value">${escapeHtml(attrMatch[3])}</span>`;
      cursor = attrRegex.lastIndex;
    }
    renderedAttributes += escapeHtml(attributes.slice(cursor));
    return `<span class="tok-tag${isOei ? ' tok-oluntirInternal' : ''}">` +
      `<span class="tok-bracket">${escapeHtml(prefix)}</span>` +
      `<span class="tok-tag-name">${escapeHtml(name)}</span>` +
      renderedAttributes +
      `<span class="tok-bracket">${escapeHtml(suffix)}</span>` +
      `</span>`;
  }

  function highlightHtml(source) {
    const input = String(source || '');
    let output = '';
    let index = 0;
    const regex = /<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<\/?[\w:-]+(?:\s+[\s\S]*?)?>|&(?:#\d+|#x[\da-f]+|[a-z][\w]+);/gi;
    let match;
    while ((match = regex.exec(input))) {
      output += escapeHtml(input.slice(index, match.index));
      const token = match[0];
      if (/^<!--/.test(token)) output += `<span class="tok-comment">${escapeHtml(token)}</span>`;
      else if (/^<!DOCTYPE/i.test(token)) output += `<span class="tok-doctype">${escapeHtml(token)}</span>`;
      else if (/^</.test(token)) output += highlightTag(token);
      else output += `<span class="tok-entity">${escapeHtml(token)}</span>`;
      index = regex.lastIndex;
    }
    output += escapeHtml(input.slice(index));
    return output + '\n';
  }

  function highlightCss(source) {
    let html = escapeHtml(source);
    html = html.replace(/\/\*[\s\S]*?\*\//g, '<span class="tok-comment">$&</span>');
    html = html.replace(/(^|\})([^{}]+)(\{)/g, '$1<span class="tok-selector">$2</span><span class="tok-bracket">$3</span>');
    html = html.replace(/([\w-]+)(\s*:)/g, '<span class="tok-property">$1</span><span class="tok-punct">$2</span>');
    html = html.replace(/(:\s*)([^;{}]+)(;?)/g, '$1<span class="tok-css-value">$2</span>$3');
    return html + '\n';
  }

  function createCodeEditor(container, options) {
    container.innerHTML = `
      <div class="oluntir-code-editor-shell ${options.readOnly ? 'is-readonly' : ''}">
        <div class="oluntir-code-lines" aria-hidden="true"></div>
        <div class="oluntir-code-layer">
          <pre class="oluntir-code-highlight" aria-hidden="true"><code></code></pre>
          <textarea spellcheck="false" wrap="off" aria-label="${escapeHtml(options.label || 'Code')}"></textarea>
        </div>
      </div>`;
    const shell = container.querySelector('.oluntir-code-editor-shell');
    const textarea = shell.querySelector('textarea');
    const code = shell.querySelector('code');
    const lines = shell.querySelector('.oluntir-code-lines');
    let language = options.language || 'html';

    const render = () => {
      const value = textarea.value;
      code.innerHTML = language === 'css' ? highlightCss(value) : highlightHtml(value);
      const count = Math.max(1, value.split('\n').length);
      lines.innerHTML = Array.from({ length: count }, (_, i) => `<span>${i + 1}</span>`).join('');
      code.parentElement.scrollTop = textarea.scrollTop;
      code.parentElement.scrollLeft = textarea.scrollLeft;
      lines.scrollTop = textarea.scrollTop;
    };

    textarea.value = options.value || '';
    textarea.readOnly = Boolean(options.readOnly);
    textarea.addEventListener('input', render);
    textarea.addEventListener('scroll', render);
    textarea.addEventListener('keydown', (event) => {
      if (event.key === 'Tab' && !textarea.readOnly) {
        event.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.setRangeText('  ', start, end, 'end');
        render();
      }
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        if (!textarea.readOnly && options.onFormat) options.onFormat();
      }
    });
    render();

    return {
      getValue: () => textarea.value,
      setValue: (value) => { textarea.value = String(value || ''); render(); },
      setReadOnly: (readOnly) => { textarea.readOnly = Boolean(readOnly); shell.classList.toggle('is-readonly', Boolean(readOnly)); },
      setLanguage: (nextLanguage) => { language = nextLanguage; render(); },
      focus: () => textarea.focus(),
      render
    };
  }

  function validateOei(source) {
    const errors = [];
    const tags = String(source || '').match(/<ope-include\b[^>]*>/gi) || [];
    tags.forEach((tag, index) => {
      if (!/\bsrc=["'][^"']+["']/i.test(tag)) errors.push(`Oluntir-Include ${index + 1}: Attribut src fehlt.`);
    });
    return errors;
  }

  function createModal(editor) {
    const existing = document.getElementById('oluntir-code-modal');
    if (existing) existing.remove();

    const includesState = window.OluntirIncludes && window.OluntirIncludes.getState
      ? window.OluntirIncludes.getState()
      : { enabled: false };
    const hasOei = Boolean(includesState.enabled);
    const oluntirInternalSource = formatHtml(buildOeiSource(editor));
    const renderedHtml = formatHtml(String(editor.getHtml() || ''));
    const css = formatCss(String(editor.getCss() || ''));

    const overlay = document.createElement('div');
    overlay.id = 'oluntir-code-modal';
    overlay.className = 'pb-modal-overlay oluntir-code-overlay';
    overlay.setAttribute('aria-hidden', 'false');
    overlay.innerHTML = `
      <div class="pb-modal oluntir-code-modal" role="dialog" aria-modal="true" aria-labelledby="oluntir-code-title">
        <div class="pb-ui-modal-head oluntir-code-head">
          <div>
            <h2 id="oluntir-code-title">Code</h2>
            <p>${hasOei ? 'Interne Oluntir-Projektquelle und gerenderte HTML-Vorschau.' : 'HTML- und CSS-Quellcode des klassischen Projekts.'}</p>
          </div>
          <button class="pb-ui-close" id="oluntir-code-close" type="button" aria-label="Schließen">×</button>
        </div>
        <div class="oluntir-code-toolbar">
          ${hasOei ? `
            <div class="oluntir-code-modes" role="tablist" aria-label="Codeansicht">
              <button type="button" class="active" data-oluntir-code-mode="oluntirInternal" role="tab" aria-selected="true">Oluntir-Projekt</button>
              <button type="button" data-oluntir-code-mode="rendered" role="tab" aria-selected="false">Gerendertes HTML</button>
            </div>
            <span class="oluntir-code-badge">Oluntir Internal · ${VERSION}</span>
          ` : '<span class="oluntir-code-badge">Klassisches HTML-Projekt</span>'}
          <button type="button" id="oluntir-code-format" class="oluntir-code-format">Code formatieren <kbd>Strg+Alt+F</kbd></button>
        </div>
        <div class="oluntir-code-grid">
          <section class="oluntir-code-pane">
            <div class="oluntir-code-pane-title" id="oluntir-code-html-label">${hasOei ? 'Oluntir / HTML' : 'HTML'}</div>
            <div id="oluntir-code-html-host" class="oluntir-code-host"></div>
            <p id="oluntir-code-readonly-note" class="oluntir-code-note" hidden>Gerendertes HTML ist eine schreibgeschützte Vorschau. Änderungen erfolgen im Oluntir-Projektmodus.</p>
          </section>
          <section class="oluntir-code-pane">
            <div class="oluntir-code-pane-title">CSS</div>
            <div id="oluntir-code-css-host" class="oluntir-code-host"></div>
          </section>
        </div>
        <div id="oluntir-code-status" class="oluntir-code-status" aria-live="polite"></div>
        <div class="pb-modal-actions oluntir-code-actions">
          <button type="button" id="oluntir-code-cancel">Abbrechen</button>
          <button type="button" id="oluntir-code-apply" class="btn-primary">Änderungen übernehmen</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const applyButton = overlay.querySelector('#oluntir-code-apply');
    const note = overlay.querySelector('#oluntir-code-readonly-note');
    const status = overlay.querySelector('#oluntir-code-status');
    let mode = hasOei ? 'oluntirInternal' : 'html';

    const htmlEditor = createCodeEditor(overlay.querySelector('#oluntir-code-html-host'), {
      label: hasOei ? 'Oluntir- und HTML-Code' : 'HTML-Code',
      language: 'html', value: hasOei ? oluntirInternalSource : renderedHtml,
      onFormat: () => formatCurrent()
    });
    const cssEditor = createCodeEditor(overlay.querySelector('#oluntir-code-css-host'), {
      label: 'CSS-Code', language: 'css', value: css,
      onFormat: () => formatCurrent()
    });

    function showStatus(message, isError) {
      status.textContent = message;
      status.classList.toggle('is-error', Boolean(isError));
      status.classList.toggle('is-success', !isError && Boolean(message));
    }

    function formatCurrent() {
      if (mode !== 'rendered') htmlEditor.setValue(formatHtml(htmlEditor.getValue()));
      cssEditor.setValue(formatCss(cssEditor.getValue()));
      showStatus('Code wurde formatiert.', false);
    }

    const close = () => overlay.remove();
    overlay.querySelector('#oluntir-code-close').addEventListener('click', close);
    overlay.querySelector('#oluntir-code-cancel').addEventListener('click', close);
    overlay.querySelector('#oluntir-code-format').addEventListener('click', formatCurrent);
    overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });

    overlay.querySelectorAll('[data-oluntir-code-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        mode = button.dataset.oluntirCodeMode;
        overlay.querySelectorAll('[data-oluntir-code-mode]').forEach((item) => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        const rendered = mode === 'rendered';
        htmlEditor.setValue(rendered ? renderedHtml : oluntirInternalSource);
        htmlEditor.setReadOnly(rendered);
        note.hidden = !rendered;
        applyButton.disabled = rendered;
        showStatus(rendered ? 'Gerenderte Vorschau: schreibgeschützt.' : '', false);
      });
    });

    applyButton.addEventListener('click', () => {
      if (mode === 'rendered') return;
      const htmlValue = htmlEditor.getValue();
      const errors = hasOei ? validateOei(htmlValue) : [];
      if (errors.length) {
        showStatus(errors.join(' '), true);
        return;
      }
      const nextHtml = hasOei ? restoreIncludes(htmlValue) : htmlValue;
      editor.setComponents(nextHtml);
      editor.setStyle(cssEditor.getValue());
      if (editor.store) editor.store();
      close();
      if (window.toast) window.toast(hasOei ? 'Oluntir-Projektcode übernommen.' : 'HTML- und CSS-Code übernommen.');
    });

    window.setTimeout(() => htmlEditor.focus(), 0);
  }

  function register(editor) {
    if (!editor || !editor.Commands) return;
    editor.Commands.add('export-template', {
      run: function () { createModal(editor); }
    });
  }

  window.addEventListener('oluntir:editorready', (event) => register(event.detail || window.OluntirEditor));
  if (window.OluntirEditor) register(window.OluntirEditor);
})();
