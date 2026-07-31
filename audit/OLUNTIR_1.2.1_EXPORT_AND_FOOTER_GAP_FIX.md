# Oluntir 1.2.1 – Export and footer-gap stabilization

## Corrected defects

1. `compilePage()` called `headerContainsNavigation()` although the helper was absent. This aborted HTML, SSI and PHP export whenever reusable regions were active.
2. The canvas workspace stylesheet assigned `padding-bottom: 120px` to every non-empty `main`. On newly created pages this appeared as a visible blank area before the footer.

## Implementation

- Added `headerContainsNavigation()` in `editor/js/core/includes.js`. It parses only the configured shared-header markup and checks whether that markup already contains a `nav` element.
- Removed all workspace spacing from non-empty `main` elements.
- Replaced body enlargement with an editor-only `body::after` scroll reserve. The reserve is located after all real page elements and therefore does not alter the distance between content and footer.
- No project component, exported markup, HTML class or persisted project value is added or changed by the workspace reserve.
