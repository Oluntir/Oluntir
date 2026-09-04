# Project context

Oluntir is a local browser-based multi-page website editor. Version 1.3.1 is
the stable compatibility baseline; `2.0.1-alpha` is the current
Bootstrap-focused development branch.

## Required behavior

- State assumptions explicitly.
- Preserve existing contracts unless the task requires a versioned change.
- Update tests with code.
- Do not document unimplemented behavior.
- Keep concrete editor support limited to Bootstrap 4.6.2 and 5.3.8.
- Retain the generic analyzer/compiler architecture for future version-bound
  analysis, but classify unknown frameworks as analysis-only.
- Keep imported source execution, automatic document mutation and productive
  Repeat synchronization disabled until their contracts are explicitly gated.
