> **Language:** English (reference) · [Deutsch](SECURITY_de.md)

# Security policy

**Supported version:** 1.3.0

## Reporting

Send confidential security reports to `info@oluntir.com`. Include the affected version, browser and operating system, reproduction steps, expected and actual behavior, impact, and any proposed mitigation. Do not include active credentials or unnecessary personal data.

Do not open a public issue for an unpatched vulnerability.

## Scope

Relevant reports include unsafe handling of imported project data, script injection through editor or preview processing, archive path manipulation, unintended project or asset loss, privilege or permission confusion around file-system access, and vulnerable bundled dependencies.

## Response

Receipt, severity, remediation, release coordination, and disclosure timing are handled case by case. Only the current stable release line is actively evaluated for security fixes.

## User responsibility

Oluntir runs imported HTML and JavaScript in a browser-based editing environment. Only open projects from trusted sources, keep external backups, review export output, and apply browser security updates.
