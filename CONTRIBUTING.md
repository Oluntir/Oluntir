> **Language:** English (reference) · [Deutsch](CONTRIBUTING_de.md)

# Contributing to Oluntir

**Applies to:** Oluntir 2.3.0 and the 1.3.1 stable baseline

Contributions should be focused, reproducible, offline-compatible, and preserve existing project data wherever possible.

## Before submitting

1. Describe the defect or proposal and its expected behavior.
2. Base changes on the current default branch.
3. Keep unrelated refactoring out of the same pull request.
4. State every added, changed, and deleted file.
5. Document architecture, persistence, project-format, export, and compatibility effects.
6. Update both English reference documentation and the matching German `*_de.md` file.

## Architecture rules

- Do not patch versioned GrapesJS vendor files.
- Keep GrapesJS-specific DOM and compatibility handling inside `editor/integrations/grapesjs/`.
- Use shared asset, workspace, settings, and include services rather than duplicating state.
- Do not silently discard browser, project, image, or window-state data.
- Keep runtime operation offline and avoid new network dependencies.
- Preserve third-party license texts, notices, and source attribution.

## Required tests

Run at least:

```text
python tools/validate-structure.py
node tools/test-grapesjs-adapter.js
```

Test the changed path manually. Depending on scope, include classic and recurring-content projects, Bootstrap 4 and 5, project save/restore, HTML/SSI/PHP export, folder and archive output, Image Manager, Modal/Lightbox, and single-/two-monitor switching.

## Pull request description

Include the problem, implementation, changed files, test commands, expected results, actual results, compatibility effects, migration behavior, known limitations, and documentation changes.
