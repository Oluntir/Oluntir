> **Language:** English (reference) · [Deutsch](OFFLINE-ASSETS_de.md)

# Offline Assets

**Version:** 1.1.0  
**Language:** English  
**Status:** Stable  
**Applies to:** Oluntir 1.1.0  
**Last updated:** 2026-07-29

## Purpose

Framework files, fonts, icons, images, and editor dependencies required at runtime are bundled locally. A release must not depend on external CDNs for core editing or export behavior.

## Scope

This document describes the behavior included in Oluntir 1.1.0.

## Verification

Test the function with a newly created project and a restored project. Where export is affected, test folder and archive output and compare the generated file structure with the selected format.

## Limitations

Browser capabilities and imported project content may affect behavior. Report reproducible deviations with the browser version, project type, steps, and console output.
