# Technical changes from Oluntir 1.3.1 to 2.1.0 BETA

**Current branch:** `Oluntir-2.1.0-beta`  
**Stable baseline:** Oluntir 1.3.1  
**State:** 2026-09-06

## Beta-relevant changes

- Bootstrap 4.6.2 and Bootstrap 5.3.8 are the productive framework profiles.
- Header, navigation and footer synchronize bidirectionally through the Shared Content Manager.
- Repeat Engine V2 synchronizes source → instances, instance → source and instance → sibling instances through stable Oluntir identities.
- The Repeat source tool creates/edits one named current source and inserts it directly through target page and insertion mode.
- The separate Repeat library tool inserts project-wide stored sources by human-readable name.
- Existing Alpha projects are hydrated only through existing unambiguous Oluntir correlations.
- Shared Content performance uses a no-op fast path and event filtering: unchanged central commits do not mutate target pages/start an extra store, and normal main-content updates do not enter the Shared Content update path.
- Imported Source JavaScript remains disabled by default.

The detailed Alpha development history remains available in [CHANGELOG_1.3.1_TO_2.0.1_ALPHA.md](CHANGELOG_1.3.1_TO_2.0.1_ALPHA.md).
