# JavaScript Behavior Contract

DEV_024 turns static JavaScript evidence into a neutral
`behavior-manifest.json`. It records events, custom events, DOM selectors,
class and dataset state, observers, timers, network requests and DOM mutation
patterns.

Source files are read as text only. Imported JavaScript is not executed during
analysis and no document is changed.

Each behavior receives a stable `behaviorId`, a neutral `behaviorType`, source
evidence with file and position, detected dependencies, side effects,
reversibility and runtime requirements. Scripts are disabled by default. The
Frontend Bridge accepts only explicitly named files that are present in the
Source Package manifest.

The manifest describes evidence and risk, not permission for runtime execution.
The later behavior matrix must resolve trigger, target, state, version,
dependencies and compatible implementation before activation. Automatic
document mutation and repeat synchronization remain disabled.
