# Repeat Foundation

`editor/js/core/repeat-engine-v2.js` stores repeat definitions by stable identities, not DOM positions. Definitions contain source page, source component, repetition unit, target pages, target path, mode and schema version.

Modes are `selected` and `context`. Target pages and components are resolved through the GrapesJS page/component model. Existing matching structures are merged; missing structures are added. The engine is exposed as `window.OluntirRepeatEngineV2`. Version 1.2.1 deliberately adds no new user interface.
