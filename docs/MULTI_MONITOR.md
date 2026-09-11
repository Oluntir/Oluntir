# Multi-monitor workspace

## Modes

- `ask`: show the startup choice;
- `single`: keep all controls in the main window;
- `dual`: prefer a separate tool window.

The preference is stored in IndexedDB. The active mode is session-dependent and can fall back to single without deleting the dual preference.

## Tool window

The main window keeps the GrapesJS canvas. The tool window contains the complete right GrapesJS column, Oluntir quick editing and both separate Repeat tools for source editing and library insertion. Toolbar controls move the column, reopen or focus the tool window, and return all tools.

## Safety behavior

Oluntir restores the tools to the main window when the tool window is actually closed. Moving or resizing the window is not treated as closure. Invalid saved coordinates are ignored. Without the Window Management API, positioning remains manual.

## Troubleshooting

- Pop-up blocked: allow pop-ups for the local Oluntir page and use the toolbar control again.
- Only one display available: Oluntir opens safely in single mode and preserves the dual preference.
- Tool window off screen: use the recall control; Oluntir validates and resets unusable bounds.
