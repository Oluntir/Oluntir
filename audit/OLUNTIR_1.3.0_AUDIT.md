# Oluntir 1.3.0 Release Audit

**Release date:** 2026-08-01

## Scope

This audit covers the repository state packaged as Oluntir 1.3.0. It records implemented architecture, release checks and known limits. It is not a security certification.

## Runtime baseline

- GrapesJS 0.23.2
- Bootstrap 4.6.2 profile
- Bootstrap 5.3.8 profile
- local browser execution
- HTML, SSI and PHP export

## Implemented architecture

- stable layout identities;
- Semantic Dictionary;
- Identity, Context, Structure and Relationship Resolvers;
- Project Dependency Graph;
- Semantic Action Engine;
- Semantic Validator;
- Shared Content Manager with fingerprints and lazy targeted updates;
- Repeat Engine V2 technical model;
- optional local logger and Runtime Actions;
- versioned installation-bound consent;
- Developer Diagnostics Center.

## Privacy and security controls

- logging disabled until explicit opt-in;
- permission limited to the selected `logs` directory;
- local `.oluntir-logging.json` metadata;
- redaction of common password, token, secret, authorization, cookie, credential, private-key, URL-parameter and Windows-user-path fields;
- no intentional page-content logging;
- consent validated by version, documents and installation identity.

## Performance controls

- shared-region fingerprints;
- per-page component-reference cache;
- targeted header, navigation and footer updates;
- lazy synchronization of selected pages;
- no automatic dependency-graph build during normal editor use;
- diagnostics live timer active only while its window is open.

## Test coverage

The repository contains focused tests for semantic modules, identities, resolver contracts, dependency graph, action engine, logger, consent, runtime actions, diagnostics, shared-content transactions, lazy scaling, page-frame integrity, galleries and structural validation.

## Test maintenance

The gallery icon-source tests were updated to accept equivalent compact CSS selector formatting. Runtime gallery code and CSS behavior were not changed by this test maintenance.

## Known limits

- Repeat Engine V2 does not yet provide complete visible repeat management.
- The Action Engine is not yet the sole production path for all editor operations.
- File-system permission behavior depends on browser support and user decisions.
- Browser performance varies with page complexity and device resources.

## Release decision

The code and documentation are versioned as 1.3.0. The next planned functional branch is 2.0 and focuses on repeatable elements and regions.
