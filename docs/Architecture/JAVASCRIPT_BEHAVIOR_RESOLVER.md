# JavaScript Behavior Resolver

DEV_026 resolves the framework-neutral entries from
`javascript-behavior-plan.json` against a concrete framework profile.

## Profiles

| Profile | Signals | Dependencies | Adapters |
|---|---|---|---|
| Bootstrap 4 | `data-toggle="..."`, `data-ride="carousel"` | jQuery, Bootstrap JavaScript, Bootstrap CSS | Collapse, Modal, Tab, Dropdown, Carousel |
| Bootstrap 5 | `data-bs-toggle="..."`, `data-bs-ride="carousel"` | Bootstrap JavaScript, Bootstrap CSS | Collapse, Modal, Tab, Dropdown, Carousel, Offcanvas |

Bootstrap 4 and Bootstrap 5 do not share guessed trigger rules. An explicit
profile/version combination with an incompatible major version is rejected.
Bootstrap 4 marks Offcanvas as unsupported.

## Resolution statuses

- `resolved`: the trigger and required files are present and an adapter is
  mapped unambiguously;
- `profile-required`: no matching profile exists;
- `trigger-unresolved`: the profile exists, but its expected markup signal is
  absent;
- `invalid-dependency`: a required script or style group is missing;
- `unsupported-by-profile`: the profile has no adapter for the behavior;
- `evidence-only`: technical runtime evidence without an approved concrete
  adapter.

`resolved` is a planning result only. The resolver executes no imported
JavaScript and mutates neither the DOM, the GrapesJS project model nor storage.

The generated `javascript-behavior-resolution.json` remains read-only and is
loaded by the Frontend Bridge through the local API. Runtime execution,
document mutation and repeat synchronization require later explicit gates.
