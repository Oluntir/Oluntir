# Responsive image export

Uploaded images are handled as a responsive asset group:

```text
assets/user_upload/desktop/<file>
assets/user_upload/tablet/<file>
assets/user_upload/mobile/<file>
```

Compatible legacy projects may use `images/uploads/<variant>/<file>`.

When one variant is referenced, Oluntir exports all three available variants for HTML, SSI, PHP, folder, ZIP, and TAR output. Missing variants stop export with an explicit path list. Path normalisation occurs only in a temporary export copy and never writes transient Canvas state back into the project.
