# Project favicon in Oluntir 1.2.1

Oluntir creates the common favicon variants from one source image. Use the star icon in the secondary top toolbar, select a PNG, JPG, WebP, GIF, or SVG file, and confirm the generated preview.

Generated files:

```text
images/favicon.ico
images/favicon-16x16.png
images/favicon-32x32.png
images/favicon-48x48.png
images/apple-touch-icon.png
images/android-chrome-192x192.png
images/android-chrome-512x512.png
```

The setting is stored with the project. All generated files and matching `<link>` elements are included in HTML, SSI, and PHP folder, ZIP, and TAR exports. A square transparent source image of at least 512 × 512 pixels is recommended. Non-square images are centered without cropping or distortion.
