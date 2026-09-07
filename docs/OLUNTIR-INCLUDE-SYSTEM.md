> **Language:** English (reference) · [Deutsch](OLUNTIR-INCLUDE-SYSTEM_de.md)

# Oluntir Include System (Oluntir)

**Version:** 2.2.1
**Language:** English
**Status:** Release
**Stable baseline:** Oluntir 1.3.1
**Last updated:** 2026-09-07

## Purpose

Oluntir is the internal reusable-area representation. A central resolver reads `<ope-include>` references, validates targets, and writes resolved HTML, Apache SSI directives, or PHP include statements. Include parsing must not be duplicated in individual exporters.

## Scope

This document describes the behavior included in Oluntir 2.2.1.

## Verification

Test the function with a newly created project and a restored project. Where export is affected, test folder and archive output and compare the generated file structure with the selected format.

## Limitations

Browser capabilities and imported project content may affect behavior. Report reproducible deviations with the browser version, project type, steps, and console output.
