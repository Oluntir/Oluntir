# Architecture principles

Extend existing modules. Avoid parallel architectures. Keep resolvers read-only. Keep business logic out of the Action Engine and dependency propagation out of feature modules.

## Required behavior

- State assumptions explicitly.
- Preserve existing contracts unless the task requires a versioned change.
- Update tests with code.
- Do not document unimplemented behavior.

## Template First

The active template and its framework semantics define structure, roles, and permitted operations.

- Bootstrap classes such as `.row`, `.col-*`, `.container`, and `.container-fluid` define their template roles.
- HTML tags and template attributes supplement the framework semantics.
- Oluntir identities are used only to reference concrete template elements reliably.
- An Oluntir identity must never create, replace, or override a template or framework role.
- APIs and resolvers must evaluate Bootstrap 4 and Bootstrap 5 through the active framework context.
- Editing and export preserve template markup; internal Oluntir data must not become a replacement structure.
