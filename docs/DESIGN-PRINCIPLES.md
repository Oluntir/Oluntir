> **Language:** English (reference) · [Deutsch](DESIGN-PRINCIPLES_de.md)

# User Interface Principles

**Version:** 2.2.0 BETA
**Language:** English
**Status:** BETA
**Stable baseline:** Oluntir 1.3.1
**Last updated:** 2026-09-06

## Purpose

The interface prioritizes clear state, explicit actions, keyboard access, readable contrast, and separation between project data and exported output. Visual styling must not hide destructive actions or validation errors.

## Scope

This document describes the behavior included in Oluntir 2.2.0 BETA.

## Verification

Test the function with a newly created project and a restored project. Where export is affected, test folder and archive output and compare the generated file structure with the selected format.

## Limitations

Browser capabilities and imported project content may affect behavior. Report reproducible deviations with the browser version, project type, steps, and console output.
