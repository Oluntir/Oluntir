# Architecture principles

Extend existing modules. Avoid parallel architectures. Keep resolvers read-only. Keep business logic out of the Action Engine and dependency propagation out of feature modules.

## Required behavior

- State assumptions explicitly.
- Preserve existing contracts unless the task requires a versioned change.
- Update tests with code.
- Do not document unimplemented behavior.
