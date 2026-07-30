> **Language:** English (reference) · [Deutsch](PROJECT-PRINCIPLES_de.md)

# Technical Project Principles

**Version:** 1.2.0  
**Language:** English  
**Status:** Stable  
**Applies to:** Oluntir 1.2.0  
**Last updated:** 2026-07-30

## Purpose

Project state is explicit, existing data is preserved unless replacement is confirmed, include logic is centralized, runtime dependencies remain local, exports are deterministic, and errors are reported before incomplete output is written.

## Scope

This document describes the behavior included in Oluntir 1.2.0.

## Verification

Test the function with a newly created project and a restored project. Where export is affected, test folder and archive output and compare the generated file structure with the selected format.

## Limitations

Browser capabilities and imported project content may affect behavior. Report reproducible deviations with the browser version, project type, steps, and console output.
