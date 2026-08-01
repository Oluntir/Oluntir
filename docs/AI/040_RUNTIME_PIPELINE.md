# Runtime pipeline

Editor actions operate on the GrapesJS project model. Semantic modules provide read-only knowledge. Shared Content and Export remain explicit production consumers.

## Required behavior

- State assumptions explicitly.
- Preserve existing contracts unless the task requires a versioned change.
- Update tests with code.
- Do not document unimplemented behavior.
