# Project favicon

The project favicon applies to every page and export format. Users select one PNG, JPG, WebP, GIF, or SVG source and Oluntir creates the required technical variants automatically.

Open the star icon in the secondary toolbar, choose the source, review the preview, and save the project. When a favicon already exists, the dialog shows its preview, source name, source type, and last update time and offers replacement or removal.

Generated output:

```text
images/favicon.ico
images/favicon-16x16.png
images/favicon-32x32.png
images/favicon-48x48.png
images/apple-touch-icon.png
images/android-chrome-192x192.png
images/android-chrome-512x512.png
site.webmanifest
```

Replacing a favicon removes all previous variants before regeneration. Metadata and generated files are stored in the portable `.oluntir` project.
