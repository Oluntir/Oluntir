# Oluntir 2.1.0 BETA – Release Audit

**Branch:** `Oluntir-2.1.0-beta`  
**Stable baseline:** 1.3.1  
**Status:** BETA / Bootstrap-focused  
**Audit state:** 2026-09-06

## Scope

The productive framework scope remains Bootstrap 4.6.2 and Bootstrap 5.3.8. GrapesJS remains 0.23.2. Imported Source JavaScript is not executed automatically.

## Confirmed in 2.1.0 BETA

- Shared Content synchronizes header, navigation and footer bidirectionally.
- Repeat Engine V2 synchronizes source → instances, instance → source and instance → sibling instances through stable Oluntir identities.
- Repeat source and Repeat library tools are separate user workflows.
- Existing Alpha projects are hydrated only through existing unambiguous Oluntir correlations.
- Shared Content has a no-op fast path: unchanged central snapshots skip target mutation and the extra store; update/style events outside shared regions are filtered early.
- Bootstrap 4/5 remain the only concrete framework distributions; unknown sources remain `analysis-only`.

## Performance log analysis before the Beta fix

The supplied run covered about **344.7 seconds** and contained **33,728 `component.added`**, **6,504 `component.removed`** and **312 `project.saved`** events. Of **290 `shared-component-committed`** events, only **10** changed the central Shared Content snapshot; **280 (96.6%)** were no-op commits. In addition, 332 of 361 `page-flushed` runs were unchanged. 2.1.0 BETA therefore exits unchanged Shared component commits before target mutation/store and filters normal update/style events outside header, navigation and footer. Real CPU impact must be verified in the browser with new logs.

## Automated verification

On 2026-09-06 `bash tests/run-tests.sh` completed with **exit code 0**. Coverage included Repeat contracts, existing-project hydration, Repeat target selection, RTE persistence, Shared Content, the Shared Content performance contract, export, Bootstrap structure, Source Package and Analyzer tests. `tools/validate-structure.py` reported **86 static HTML references checked**, Bootstrap 4.6.2/5.3.8 checked and JavaScript syntax successful.

The logger test still prints the known Node test-environment warning `directory.getFileHandle is not a function`; the logger test itself passes and the full suite exits 0.

## Manual verification still required

- real-browser CPU behavior after the Shared Content no-op fast path;
- portable Windows launchers on Windows x64;
- full browser workflow for both Repeat tools, Shared Content, export and framework switching.

Historical audits for 1.3.1 and 2.0.1-alpha remain separately preserved.
