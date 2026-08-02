# Oluntir 1.3.1 – Release Audit

**Release:** 1.3.1  
**Date:** 2026-08-02  
**Status:** Ready for release

## Scope

This audit covers the final Oluntir 1.3.1 repository state for Bootstrap 4.6.2 and Bootstrap 5.3.8.

## Verified

- release version and public documentation are consistent;
- README, handbook, features, changelog and release notes describe the confirmed 1.3.1 functionality;
- public documentation contains no future product-version announcements;
- temporary implementation and diagnostic reports are removed;
- HTML, Apache SSI and PHP include export paths are present;
- shared header, navigation and footer content is covered by regression tests;
- text and image undo/redo is covered by regression tests;
- gallery insertion inside containers and between page areas is covered by regression tests;
- the Repeat Foundation remains inactive and performs no productive synchronization;
- third-party licensing and security documentation remain present;
- JavaScript syntax and repository structure checks pass.

## Known limitation

An explicitly selected footer text color may appear differently in the editor than in the exported result. The export preserves the explicitly selected value.

## Release decision

Oluntir 1.3.1 is approved as the stable reference release.
