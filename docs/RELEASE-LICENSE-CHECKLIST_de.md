> **Sprache:** Deutsch · [English (reference)](RELEASE-LICENSE-CHECKLIST.md)

# Release License Checklist

A public release must not proceed until each applicable item is complete.

## Project ownership

- [x] Root `LICENSE` names the correct copyright holder and year.
- [x] Only original Oluntir code is presented as MIT licensed.
- [x] Contributions have a clear right to be redistributed.

## Third-party code

- [x] Every library has a name, exact version, upstream source and license.
- [x] Exact upstream license texts are stored in `LICENSES/`.
- [x] Copyright banners in minified files remain intact.
- [x] Attribution required by BSD, OFL or CC BY is included.
- [x] Dual-licensed dependencies state the selected license option.

## Fonts and icons

- [x] Every font family is positively identified.
- [x] OFL copyright and reserved font names are documented.
- [x] Font Awesome icon attribution is complete where required.
- [x] Flaticon removed; editor Font Awesome is documented; site icons are font-free.

## Images and template assets

- [x] Every image and SVG is original, public domain or explicitly licensed
      for source redistribution.
- [x] Logos, client marks, signatures and portraits are removed unless rights
      and consent are documented.
- [x] No commercial-template source asset remains without an explicit grant
      permitting public repository redistribution.
- [x] Replacement demo assets include a source and license record.

## Release package

- [x] `THIRD_PARTY_NOTICES.md` has no unresolved item included in the release.
- [x] The repository contains no credentials, personal project data or backups.
- [x] `tools/validate-structure.py` passes.
- [x] ZIP/TAR integrity and browser smoke tests pass.
- [x] Release notes state known limitations and tested browsers.

Record the completed checklist in the release pull request or release issue.
