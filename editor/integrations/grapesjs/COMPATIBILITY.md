# GrapesJS compatibility

Oluntir 2.3.0 uses a dedicated adapter and does not modify GrapesJS vendor files.

| Version | Status |
|---|---|
| 0.23.2 | Tested bundled version |
| >= 0.23.0 | Compatibility check permitted; regression test required |
| < 0.23.0 | Unsupported |

No module outside `editor/integrations/grapesjs/` may depend on `.gjs-*` DOM classes.
