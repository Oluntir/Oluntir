> **Language:** English (reference) · [Deutsch](GITHUB-PUBLISHING_de.md)

# GitHub publishing guide

**Release:** Oluntir 1.2.0

## Repository metadata

Suggested description:

```text
Offline-first visual editor for static Bootstrap websites, powered by GrapesJS.
```

Suggested topics:

```text
website-builder grapesjs offline bootstrap static-site-generator html css javascript open-source
```

## Git commands

From the extracted project root:

```powershell
git init
git branch -M main
git add .
git status
git commit -m "release: Oluntir 1.2.0"
git remote add origin https://github.com/Oluntir/Oluntir.git
git push -u origin main
```

Create and push the stable tag only after reviewing the packaged checksum and audit report:

```powershell
git tag -a v1.2.0 -m "Oluntir 1.2.0"
git push origin v1.2.0
```

## GitHub release

Title:

```text
Oluntir 1.2.0
```

Use `docs/releases/1.2.0.md` as the release body. Attach the final ZIP and its `.sha256` file. Verify the checksum after upload.

## Pre-publication checklist

- clean working tree;
- no generated local projects or personal data;
- structure and adapter tests pass;
- archive opens and `index.html` starts;
- licenses and notices are present;
- README links resolve;
- release archive checksum matches;
- manual acceptance completed for release-critical workflows.
