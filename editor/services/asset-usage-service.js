(() => {
  'use strict';
  function serializedProject(editor) {
    const pages = editor.Pages && editor.Pages.getAll ? editor.Pages.getAll() : [];
    return JSON.stringify(pages.map((page) => {
      const component = page.getMainComponent ? page.getMainComponent() : null;
      return component && component.toJSON ? component.toJSON() : null;
    }));
  }
  function countInText(text, candidates) {
    let count = 0;
    candidates.forEach((candidate) => {
      if (!candidate) return;
      let index = 0;
      while ((index = text.indexOf(candidate, index)) !== -1) { count++; index += candidate.length; }
    });
    return count;
  }
  window.OluntirAssetUsageService = {
    build(editor, groups) {
      const text = serializedProject(editor);
      const result = new Map();
      groups.forEach((paths, group) => result.set(group, countInText(text, paths)));
      return result;
    }
  };
})();
