# First Start – Oluntir 2.3.0

1. Extract Oluntir 2.3.0 into its own folder.
2. Open `index.html` in a current Chromium-based desktop browser.
3. Choose single-monitor, dual-monitor or the startup prompt.
4. Create a project or restore a portable `.oluntir` backup.
5. Before extensive work, verify saving and create an external backup.

## Additional Bootstrap templates

Use `template-manager.html` for additional Bootstrap 4/5 templates:

1. Choose a template ZIP and name.
2. Analyze the template.
3. Review the analysis.
4. Select the current Oluntir installation's `templates` folder.
5. Accept the template and wait for verification.
6. Open Oluntir through the green completion button.

Imported templates are stored only below `templates/<name>/`. Bundled profiles below `frameworks/bootstrap4` and `frameworks/bootstrap5` remain unchanged.

## Browser permissions

Folder access, pop-ups and screen placement are controlled by the browser. The first `templates` folder selection must be performed explicitly in the browser picker; Chromium cannot reliably preselect an absolute local path. Previously granted handles can be reused by the manager.

## Project folders

The image manager can connect a physical project folder. Select the project root. Oluntir uses or creates `assets/user_upload/`; do not select that subfolder directly.
