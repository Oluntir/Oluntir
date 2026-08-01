# Release Notes – Oluntir 1.3.0

## Scope

Version 1.3.0 consolidates the semantic core, shared-content synchronization, optional logging, consent handling and developer diagnostics.

## Main changes

- read-only Structure and Relationship Resolvers;
- explicit Project Dependency Graph;
- isolated Semantic Action Engine core;
- fingerprints, lazy synchronization and targeted shared-content updates;
- local opt-in logging with redaction and rotation;
- installation-bound consent;
- Developer Diagnostics Center;
- consolidated version metadata and documentation.

## Compatibility

Existing 1.2.x projects continue to use the existing migration and identity routines. Create a portable project backup before migration. Internal Oluntir identities are removed from final HTML, SSI and PHP output.

## Known limits

- The Semantic Action Engine does not yet control every production module.
- The Diagnostics Center builds the dependency graph only on explicit request.
- Repeat Engine V2 is present as a technical model; complete visible repeat management is planned for version 2.0.
- Directory and log-file access depend on the File System Access API and user permission.
