# Release Notes – Oluntir 2.2.1

Oluntir 2.2.1 is the current Bootstrap-focused release. The complete technical change history is available in the [changelog](CHANGELOG.md).

## 2.2.1 highlights

### Central Repeat library

Repeatable sections are managed project-wide as central Repeat families. Editing takes place in a single-object Canvas; changes are published only through **Apply to all occurrences**. Page occurrences can be inserted, removed, and restored through a dedicated Repeat history.

### Bootstrap 4 and 5

Productive framework support is focused on Bootstrap 4.6.2 and Bootstrap 5.3.8. The component catalog and template detection account for generation differences. Bootstrap-4-specific elements are exposed only in the BS4 profile.

### HTML5 video

BS4 and BS5 each provide a native responsive HTML5 video block with multiple playback sources, poster support, and a download fallback.

### Template and source analysis

The local Analyzer identifies Bootstrap generation and component structures more precisely and can expose suitable source-bound structures to the editor in a controlled way. Unsupported frameworks remain `analysis-only`; imported source JavaScript is not executed automatically.

### Export

Oluntir exports resolved HTML, Apache SSI, or PHP includes and can write projects to a local folder, ZIP, or TAR. Local assets are collected and editor-only metadata is removed from published output.

### Compatibility

Existing projects continue through stable Oluntir identities. A portable `.oluntir` project backup is recommended before major changes.

## More information

- [README](README.md)
- [Features](FEATURES.md)
- [Handbook](HANDBOOK.md)
- [Changelog](CHANGELOG.md)
