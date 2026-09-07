> **Language:** English (reference) · [Deutsch](PROJECT-STRUCTURE_de.md)

# Project Structure

**Version:** 2.2.1
**Language:** English
**Status:** Release
**Stable baseline:** Oluntir 1.3.1
**Last updated:** 2026-09-07

## Purpose

Documents the application repository directories and the generated project layout. Source, bundled assets, frameworks, plugins, templates, documentation, compliance records, and export output are kept logically separate.

## Scope

This document describes the behavior included in Oluntir 2.2.1.

## Verification

Test the function with a newly created project and a restored project. Where export is affected, test folder and archive output and compare the generated file structure with the selected format.

## Limitations

Browser capabilities and imported project content may affect behavior. Report reproducible deviations with the browser version, project type, steps, and console output.

## User uploads

New image uploads use the central `assets/user_upload/` location. Responsive variants are stored in `desktop/`, `tablet/`, and `mobile/`; unchanged originals are stored in `original/`. During editing, binary data is kept in browser IndexedDB and is written as real files under these paths during export.
