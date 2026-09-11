# JavaScript Behavior Matrix

DEV_025 translates the DEV_024 `behavior-manifest.json` into a
framework-neutral `javascript-behavior-plan.json`.

The behavior manifest states that a behavior was found statically in the
source. The matrix gives it neutral semantics and makes it plannable. A
framework profile must still resolve the concrete implementation, and a later
runtime gate must explicitly authorize execution.

The matrix covers neutral interaction types such as accordion, modal, tabs,
dropdown, carousel and offcanvas, as well as technical runtime evidence for
events, observers, timers, network requests and DOM mutation patterns.

Each plan entry contains its behavior identity, neutral semantic ID, states,
source evidence, script dependencies, unresolved style dependencies, profile
resolution status and activation status. `runtime.enabled` and
`activation.allowed` remain false. The matrix does not change the GrapesJS
project model, `unitId`, or synchronization state.
