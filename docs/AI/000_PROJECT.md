# Project context

Oluntir is a local browser-based multi-page website editor. Version 1.3.1 is
the stable compatibility baseline; `2.2.0-beta` is the current
Bootstrap-focused development branch.

## Required behavior

- State assumptions explicitly.
- Preserve existing contracts unless the task requires a versioned change.
- Update tests with code.
- Do not document unimplemented behavior.
- Keep concrete editor support limited to Bootstrap 4.6.2 and 5.3.8.
- Retain the generic analyzer/compiler architecture for future version-bound
  analysis, but classify unknown frameworks as analysis-only.
- Keep imported source execution disabled. Productive Repeat synchronization is
  enabled only through the implemented resolver, dependency graph, action
  contracts and targeted synchronization service.
