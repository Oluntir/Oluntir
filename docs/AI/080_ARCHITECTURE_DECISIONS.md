# Architecture decisions

No full-page rebuild for shared-region updates. Use fingerprints before mutation. Logging is local opt-in with least privilege. Consent is versioned and installation-bound.

## Required behavior

- State assumptions explicitly.
- Preserve existing contracts unless the task requires a versioned change.
- Update tests with code.
- Do not document unimplemented behavior.
