# What's new in Oluntir 1.2.0

## A real two-monitor workspace

Keep the page canvas on the main display and move the complete right tool column plus quick editing to a separate window. Oluntir remembers the preferred mode and can safely return to one monitor when the environment changes.

## A clearer Image Manager workflow

The Image Manager now behaves as an Oluntir workspace. When connecting physical storage, an information dialog explains which folder to choose. Oluntir creates or uses `assets/user_upload/` automatically.

## Modal and true Lightbox

Modal remains a framed dialog. Lightbox is again a dark, frameless image viewer. Both offer captions, counters, keyboard navigation, and original-image download with sufficient space below the controls.

## Stronger application architecture

GrapesJS remains the editing engine, but Oluntir owns workspaces, persistence, assets, exports, and external-window behavior through explicit service and adapter boundaries.
