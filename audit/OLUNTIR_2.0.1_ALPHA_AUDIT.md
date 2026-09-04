# Oluntir 2.0.1-alpha – Release Audit

**Branch:** `Oluntir-2.0.1-alpha`  
**Commit:** `e6c4e5b`  
**Stable baseline:** 1.3.1  
**Status:** Experimental / Bootstrap-focused

## Scope

This audit covers the current branch after the 1.3.1 stable baseline. The
productive framework scope is Bootstrap 4.6.2 and Bootstrap 5.3.8.

## Verified by repository inspection

- only `frameworks/bootstrap4/` and `frameworks/bootstrap5/` are concrete
  framework distributions;
- generic Source-Package, analyzer, OIR, compiler, translation and behavior
  infrastructure remains present;
- non-Bootstrap sources are classified as analysis-only rather than silently
  mapped to Bootstrap;
- portable Windows x64 Node.js runtime and local API launchers are present;
- source recovery, package identity and source-hash documentation is present;
- GrapesJS remains vendored and versioned at 0.23.2;
- Repeat Foundation contracts remain present and productive synchronization is
  disabled;
- current README, handbook, feature, release, architecture and compliance
  documentation identifies 2.0.1-alpha and the 1.3.1 baseline;
- historical 1.3.0/1.3.1 audit records remain separately identifiable.

## Required pre-release checks

- run `python3 tools/validate-structure.py`;
- run `bash tests/run-tests.sh`;
- verify the portable Windows launcher on Windows x64;
- test folder, ZIP, TAR and URL Source-Package import through the local API;
- test recovery JSON restoration;
- test Bootstrap 4/5 selection, block insertion, export and framework-switch
  save warning in a browser;
- verify the release ZIP excludes `.git/` and `.github/`;
- regenerate and verify `SHA256SUMS.txt` from the final packaged bytes.

## Explicitly not approved by this audit

- productive Repeat synchronization;
- automatic document mutation;
- execution of imported source JavaScript;
- treating unknown frameworks as concrete editor profiles;
- release status equivalent to stable 1.3.1.

The 1.3.1 audit remains the historical stable-release record and is not replaced
by this alpha audit.
