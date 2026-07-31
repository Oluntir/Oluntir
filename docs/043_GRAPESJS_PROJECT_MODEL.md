# GrapesJS Project Model

The persistent source is `editor.getProjectData()`. Pages come from `editor.Pages`; each page owns a main component and component tree. Oluntir adds an `oluntir` metadata object with project, layout identity and repeat-engine schema versions. Repeat definitions are stored below this object.

Saving and portable `.oluntir` backup creation decorate project data after committing canvas asset references. Loading imports repeat metadata and then performs additive identity migration.
