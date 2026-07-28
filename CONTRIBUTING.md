> **Language:** English (reference) · [Deutsch](CONTRIBUTING_de.md)

# Contributing

**Version:** 1.0.0  
**Language:** English  
**Status:** Stable  
**Applies to:** Oluntir 1.0.0  
**Last updated:** 2026-07-29

Contributions should be limited in scope, reproducible, and compatible with the offline-first architecture.

## Before submitting

1. Create an issue or describe the defect and expected behavior in the pull request.
2. Base changes on the current default branch.
3. Keep unrelated refactoring out of the same change.
4. Test classic projects and reusable-area projects when affected.
5. Test HTML, SSI, and PHP exports when include handling is affected.
6. Update both English reference documentation and the corresponding German `*_de.md` file.

## Code requirements

- avoid network dependencies in the editor runtime;
- preserve existing project data where possible;
- use the central include resolver rather than adding format-specific include parsing;
- provide clear errors for invalid project state;
- keep third-party licenses and notices with bundled dependencies.

## Commit and pull request content

Describe changed files, behavior changes, tests performed, expected results, compatibility effects, and documentation updates.
