# Source-bound framework profiles

DEV_027 adds source-bound profiles to the universal translation API. A profile
is generated after each source analysis. It is not global framework knowledge
and must not be reused for another Source Package.

Each profile is bound to:

```text
sourcePackageId + sourceHash + profileId
```

The hash covers the sorted paths and contents of the analyzed source files. A
source or framework-version update creates a new profile; the previous profile
is comparison-only.

The builder collects template classes, CSS/SCSS selectors and declarations,
utility structures, responsive/state/dark-mode variants, framework and version
evidence, and unknown features. It emits matrix rules only when the current
source provides evidence. Unrecognized features are retained in
`unknownFeatures` rather than guessed.

`source-framework-profile.json` is compatible with the translation API's matrix
rule shape, but is supplied explicitly for one source. It is not registered in
the global Bootstrap profile registry. Package and source-hash mismatches are
rejected before translation.

Future manual translations will also be source- and hash-bound. DEV_027 remains
read-only: no source execution, automatic GrapesJS mutation, `unitId` assignment
or synchronization is enabled.
