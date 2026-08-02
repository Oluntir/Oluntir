# Architecture decisions

No full-page rebuild for shared-region updates. Use fingerprints before mutation. Logging is local opt-in with least privilege. Consent is versioned and installation-bound.

## Required behavior

- State assumptions explicitly.
- Preserve existing contracts unless the task requires a versioned change.
- Update tests with code.
- Do not document unimplemented behavior.

## Template First

**Decision:** The template is the sole source for structure and roles. Framework classes and template markup are evaluated first. Oluntir identities are stable addresses only.

**Reason:** Oluntir must support Bootstrap 4, Bootstrap 5, and future templates without placing a competing internal representation above the template.

**Consequence:** Resolvers, Document API, Repeat, Shared Content, History, and export must not derive roles from `data-oluntir-*` identities.
