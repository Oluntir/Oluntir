# Oluntir 1.2.0 release audit

**Audit date:** 2026-07-30  
**Audited package:** Oluntir 1.2.0 final candidate after the gallery bottom-safe-area acceptance test  
**Result:** Release approved, subject to the browser limitations documented below

## Scope

The audit covered project structure, first-party JavaScript syntax, static HTML references, GrapesJS adapter boundaries, version and branding consistency, documentation, local Markdown links, release packaging, license-file presence, and open-source readiness.

## Release-critical functions represented in the audited state

- single- and two-monitor startup selection;
- persistent IndexedDB workspace settings;
- complete external GrapesJS tool column;
- external quick-edit and quick-setup areas;
- safe tool-window recall, close handling, and one-monitor fallback;
- workspace-based Image Manager;
- guided project-root selection and `assets/user_upload/` synchronization;
- distinct Modal and true Lightbox gallery modes;
- captions, counters, original-image download, keyboard and focus management;
- desktop bottom safe area of at least one control height;
- Bootstrap 4.6.2 and Bootstrap 5.3.8 profiles;
- HTML, SSI, and PHP include architecture and folder/archive exports.

## Automated and static checks

| Check | Result |
|---|---|
| Project structure validator | Passed |
| Static HTML references | 44 passed |
| Bootstrap profiles | 4.6.2 and 5.3.8 passed |
| GrapesJS adapter test | Passed |
| Extended first-party JavaScript syntax | 40 files passed |
| Local Markdown links | 103 passed |
| Legacy project-name/contact scan | No findings |
| First-party TODO/FIXME/debug scan | No findings |
| Required license/compliance files | Present |
| ZIP integrity and checksums | Generated after final file state |

The detailed machine-readable summary is stored in `audit/TEST_RESULTS_1.2.0.txt`.

## Documentation changes

The release updates or adds:

- `README.md` and `README_de.md`;
- `CHANGELOG.md` and `CHANGELOG_de.md`;
- `HANDBOOK.md` and `HANDBOOK_de.md`;
- `ROADMAP.md` and `ROADMAP_de.md`;
- `RELEASE_NOTES.md` and `RELEASE_NOTES_de.md`;
- security, contribution, notice, and GitHub publishing documents;
- first-start, multi-monitor, Image Manager, workspace, GrapesJS integration, and What's New guides;
- ready-to-paste GitHub release text in `docs/releases/`.

Accumulated development-stage test logs from 1.1.0 and intermediate 1.2.0 fixes were removed from the final release. They were replaced by a concise final audit and test report.

## Open-source readiness

A new contributor can identify the project purpose, local start method, GrapesJS boundary, major directories, contribution requirements, test commands, supported release, security contact, third-party notices, and release workflow from the repository root and linked documentation.

## License assessment boundary

The audit verified that the package retains its declared license, notice, consolidated license texts, third-party notices, and compliance matrices. It did not independently re-research every upstream dependency on the internet. Existing attribution records were preserved; future dependency updates require a fresh source and license review.

## Manual acceptance and limitations

The project owner manually confirmed the final gallery safe-area correction and the multi-monitor implementation before the release audit. The static audit environment did not execute a full Chrome/Edge/Firefox matrix or validate every physical monitor arrangement.

Browser security controls remain external limitations:

- pop-ups can be blocked;
- directory permissions can be denied or later revoked;
- Window Management API support and permission vary;
- automatic placement on another display cannot be guaranteed;
- browser storage is not an external backup.

These limitations are documented in the README, handbook, release notes, and dedicated guides.

## Release decision

**Approved for publication as Oluntir 1.2.0.**

The final ZIP must be published together with its SHA-256 file. The Git tag should be `v1.2.0` and should point to the same file state represented by the archive checksum.
