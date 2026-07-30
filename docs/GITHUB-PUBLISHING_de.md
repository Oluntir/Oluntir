> **Sprache:** Deutsch · [English (reference)](GITHUB-PUBLISHING.md)

# GitHub Publishing Guide

## Recommended repository

```text
Oluntir
```

Suggested description:

```text
Offline-first website builder for static Bootstrap websites.
```

Suggested topics:

```text
website-builder offline bootstrap static-site-generator html open-source
```

## Initial local setup on Windows

Run these commands from the prepared project directory on `D:`:

```powershell
git init
git branch -M main
git add .
git status
git commit -m "chore: prepare Oluntir 1.1.0 repository"
```

After creating the empty GitHub repository, add its URL:

```powershell
git remote add origin https://github.com/<ACCOUNT>/Oluntir.git
git remote -v
```

Do **not** push publicly until the license checklist is complete. For a private
repository used during cleanup:

```powershell
git push -u origin main
```

## Stable release tag after audit approval

After licensing clearance and final tests:

```powershell
git tag -a v1.1.0 -m "Oluntir 1.1.0"
git push origin main
git push origin v1.1.0
```

## Suggested first release title

```text
Oluntir 1.1.0
```

The release notes should list tested browsers, export methods, framework
profiles, known limitations and the completed licensing audit.
