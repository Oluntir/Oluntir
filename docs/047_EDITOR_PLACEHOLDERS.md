# Editor placeholders on new pages

New pages inherit shared header, navigation, and footer regions but no page-specific start-page content. Their `<main>` is initially empty.

An empty `<main>` is displayed as a compact 64-pixel editor insertion zone labelled:

```text
+ Insert section here
```

After the first section is inserted, `<main>` is no longer empty and the hint disappears automatically. The placeholder is implemented as editor-only CSS, is not a GrapesJS component, is not stored in the `.oluntir` project, and never appears in HTML, SSI, or PHP exports.
