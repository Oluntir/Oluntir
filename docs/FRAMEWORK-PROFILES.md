> **Language:** English (reference) · [Deutsch](FRAMEWORK-PROFILES_de.md)

# Framework Profiles

**Version:** 2.3.0
**Language:** English
**Status:** Release
**Stable baseline:** Oluntir 1.3.1
**Last updated:** 2026-09-07

## Purpose

Framework profiles define the bundled CSS and JavaScript resources used by a project. Oluntir 2.3.0 includes Bootstrap 4.6.2 and Bootstrap 5.3.8 profiles. Profiles must remain versioned and offline-capable. Bundled framework profiles stay protected; additional Bootstrap templates are compiled into modular definitions below `templates/`. Foreign non-Bootstrap frameworks remain analysis-only.

## Scope

This document describes the behavior included in Oluntir 2.3.0.

## Verification

Test the function with a newly created project and a restored project. Where export is affected, test folder and archive output and compare the generated file structure with the selected format.

## Limitations

Browser capabilities and imported project content may affect behavior. Report reproducible deviations with the browser version, project type, steps, and console output.

## Bootstrap coverage

Productive profiles use framework-native markup only. Bootstrap 5.3.8 covers its current component, form, helper and utility line. Bootstrap 4.6.2 additionally exposes the previously missing native **Jumbotron**, **Media object** and **Custom forms** blocks. Removed BS4-only components are not emulated as Bootstrap 5 components.

Source analysis distinguishes generations through weighted evidence: version banners or versioned paths, `data-bs-*` versus `data-*`, jQuery as a BS4 runtime signal, and generation-specific classes. A generic `bootstrap.css` filename alone is not sufficient to classify a Bootstrap generation.


## Imported templates

Oluntir 2.3.0 uses the bundled Bootstrap 4.6.2 or 5.3.8 profile as the technical base for imported templates. Template-specific HTML, CSS, assets and analyzed runtime metadata are stored below `templates/<id>/`; the framework folders are not modified.
