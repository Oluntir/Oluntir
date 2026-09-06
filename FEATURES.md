# Features – Oluntir 2.2.0 BETA

This BETA branch uses Oluntir 1.3.1 as its compatibility baseline and
consolidates productive framework support on Bootstrap 4.6.2 and 5.3.8.

## Editor and projects

- Local browser-based GrapesJS editor
- Multi-page projects
- Portable `.oluntir` project files
- Single- and dual-monitor workspace
- Project favicon and local assets

## Content and layout

- Text, image, gallery and component editing
- Responsive desktop, tablet and mobile images
- Shared header, navigation and footer content
- Quick editing of shared content
- Gallery insertion in existing containers
- New gallery areas between complete page areas
- Undo and redo for text and image changes

## Frameworks and export

- Bootstrap 4.6.2
- Bootstrap 5.3.8
- HTML, Apache SSI and PHP include export
- Folder, ZIP and TAR output
- Removal of editor-only metadata from final exports
- Local Source-Package import through the local API: folders, ZIP, TAR,
  TAR.GZ/TGZ, browser files and URLs
- Source-bound recovery JSON, source hashes and package manifests
- Non-Bootstrap packages are analysis-only and are not activated in the editor

## Technical foundation

- Stable layout identities
- Read-only resolvers and dependency graph
- Action and validation contracts
- Productive Repeat synchronization for explicitly defined areas with stable identities
- Static HTML, CSS and JavaScript evidence analysis
- OIR project model, capability manifest and read-only knowledge compiler
- Translation matrix and JavaScript behavior resolver
- Controlled GrapesJS Source-Package Bridge
- Portable Windows x64 Node.js runtime for the local Analyzer API

## Known limitation

An explicitly selected footer text color may appear differently in the editor than in the export. The export preserves the selected value.
