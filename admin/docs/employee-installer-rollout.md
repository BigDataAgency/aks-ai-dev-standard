# BDA Employee Installer Rollout

Date: 2026-06-29

## Goal

This is the last employee installer path before normal operations move to `bda update` and `bda doctor`.

The installer must:

- install the latest AKS AI Dev Standard (เดิม BDA AI Dev Standard)
- keep employee key/config private
- make `bda update` available
- make `bda doctor` and `bda doctor --fix` available
- clean Hermes model/config cache
- archive unused Hermes skill cache so prompts do not preload a large unused skill catalogue
- avoid deleting or moving the Hermes app/profile root
- print a self-check report employees can send to lead/admin

## Public vs Private

Public repo contains:

- `scripts/install-bda-standard.mjs`
- `scripts/bda.mjs`
- docs, command standards, tests

Private rollout package must contain one per-employee config file. Do not commit this file.

Example private config:

```json
{
  "employee_code": "BDA001",
  "employee_group": "dev",
  "api_key": "sk-personal-key",
  "ai_model": "bda/dev"
}
```

Optional fields:

```json
{
  "work_event_url": "https://ai-local.scmc.digital/bda/work-events",
  "ai_provider": "bda-gateway",
  "tool": "hermes-desktop-agent"
}
```

## macOS Install

From a checkout of this repo or a private rollout folder containing it:

```bash
node scripts/install-bda-standard.mjs --private-config ./private/BDA001.json
```

Verify:

```bash
bda version
bda doctor
bda help
```

If `bda` is not found, add this to shell profile:

```bash
export PATH="$HOME/.bda-skills/bin:$PATH"
```

Then restart Terminal/Hermes Desktop.

## Windows Install

Run in PowerShell from the rollout folder:

```powershell
node .\scripts\install-bda-standard.mjs --private-config .\private\BDA001.json
```

Verify:

```powershell
bda version
bda doctor
bda help
where.exe bda
Get-Command bda
```

The installer writes wrappers to:

- `%USERPROFILE%\.bda-skills\bin`
- `%LOCALAPPDATA%\hermes\node` when available, to replace the old Hermes bundled `bda` shim

## Normal Employee Flow After Installer

Employees should not reinstall routinely.

Use:

```bash
bda update
bda doctor
bda doctor --fix
bda hermes-light-mode --yes
bda help
```

`bda update` and `bda doctor` send a best-effort `bda_inventory` event after they run. AdminA40/Grafana should use the latest inventory event for the current CLI/standard version, and keep installer version as a separate audit field. Do not treat an old installer event, such as a safe-context 0.10.x installer, as proof that the machine is still on that CLI version after `bda update` succeeds.

## Safety Rule

`bda doctor --fix` and `bda hermes-reset` must never archive whole app/profile roots:

- `~/.hermes`
- `~/Library/Application Support/Hermes`
- `~/Library/Application Support/hermes`
- `/Applications/Hermes.app`

They may archive only targeted state/context paths such as:

- `~/.hermes/sessions`
- `~/.hermes/pastes`
- `~/.hermes/state.db*`
- `~/Library/Application Support/Hermes/Session Storage`
- `~/Library/Application Support/Hermes/Local Storage`
- `~/Library/Application Support/Hermes/IndexedDB`

If whole app/profile reset is needed, it is emergency-only and must be approved by lead/admin first.

## Rollout Acceptance Checklist

For each employee:

- `bda version` shows current standard version
- `bda help` shows `TERMINAL COMMANDS` and `CHAT-ONLY PROMPT PREFIXES`
- `bda update` works
- `bda doctor` works and does not print API key or prompt body
- `bda config-clean` works
- `bda hermes-light-mode --yes` works and keeps Hermes app/config/key intact
- Hermes Desktop restarts and sees BDA models
- a short test prompt stays small, for example `2K/65K`, not `40K+`

## If Something Fails

Do not reinstall repeatedly.

Collect:

```bash
bda version
bda doctor
bda help
```

Windows:

```powershell
where.exe bda
Get-Command bda
```

macOS:

```bash
which bda
type bda
```

Send output to lead/admin.
