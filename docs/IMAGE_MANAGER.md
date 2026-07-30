# Image Manager

The Image Manager is an Oluntir workspace backed by shared asset services and IndexedDB. It is independent from the visible GrapesJS Asset Manager UI.

## Functions

- search and filters;
- grid and list views;
- primary-image and variant display;
- image dimensions and details;
- replacement with stable project paths;
- safe deletion and usage checks;
- assignment and management modes;
- project-folder synchronization.

## Connect project folder

The first click opens an information dialog. Select the Oluntir project root, not `assets` or `user_upload`. Oluntir then uses or creates `assets/user_upload/` and writes available IndexedDB uploads there. Later uploads can be synchronized during the active permission session.

## Data safety

The IndexedDB asset store and the physical folder are separate copies. A lost folder permission does not automatically delete IndexedDB assets. Deletion actions must remain explicit and must not silently remove used images.
