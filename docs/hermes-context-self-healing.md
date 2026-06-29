# Hermes Context Self-Healing

Date: 2026-06-29

## Why This Exists

`bda current` only reads the BDA CLI session file. It does not prove that Hermes Desktop has no hidden chat, tool, request dump, paste, or local state context.

The Earn/BDA019 incident showed this clearly:

- `bda current` was inactive.
- `bda stop` had nothing to stop.
- Hermes still sent large `bda/dev` requests.
- `~/.hermes` had grown to about 3.5 GB.
- The safe-context installer `installer_safe_context_20260629.2` shipped CLI `0.10.4` after the public standard had already moved to `0.11.1`.
- The `0.10.4` cleanup command reported `cleaned: 0` because it did not inspect the full Hermes state roots.

## Required Behavior From 0.11.2 Onward

Every employee installer must provide a real self-healing path:

```bash
bda doctor
bda doctor --fix
bda update
bda hermes-light-mode --yes
```

From 0.11.5 onward, `bda update` and `bda doctor` also report `event_kind: bda_inventory` to the work-event backend when configured. Grafana/AdminA40 should read that latest inventory record for the current installed CLI/standard version. Installer package version remains useful for rollout audit only; it is not the current version after an employee runs `bda update`.

`bda doctor` must:

- print installed CLI/session version
- print employee code/group
- print active BDA session state
- verify BDA config, Hermes config, and Hermes env exist
- inspect Hermes hidden state size
- inspect request dump count/size
- never print API keys, `.env` content, auth tokens, request bodies, or prompts
- explain the next action in machine-readable `issues[]`

`bda doctor --fix` must:

- require Hermes Desktop to be closed by the user/operator
- archive hidden Hermes state instead of deleting it
- preserve `~/.hermes/config.yaml`
- preserve `~/.hermes/.env`
- preserve `~/.bda-skills/config.json`
- leave the machine ready to open Hermes as a fresh New session

`bda hermes-light-mode --yes` must:

- archive unused Hermes skill cache entries
- preserve the `bda-ai-dev-standard` skill metadata when present
- archive `.skills_prompt_snapshot.json` so Hermes rebuilds a smaller prompt snapshot
- preserve Hermes app, `config.yaml`, `.env`, BDA employee config, and chat/state storage
- never move whole Hermes app/profile roots

## Do Not Move Whole App Folders In Normal Fixes

The emergency Earn fix moved whole folders such as `~/Library/Application Support/Hermes`.
That stopped the context leak, but it also made Hermes look like a fresh app profile and scared the user because old UI/session state disappeared.

Do not use that broad reset as the default employee fix.

Normal `bda doctor --fix` / `bda hermes-reset` should archive only known high-risk state paths:

- `~/.hermes/sessions`
- `~/.hermes/pastes`
- `~/.hermes/state.db`
- `~/.hermes/state.db-wal`
- `~/.hermes/state.db-shm`
- `~/Library/Application Support/Hermes/Session Storage`
- `~/Library/Application Support/Hermes/Local Storage`
- `~/Library/Application Support/Hermes/IndexedDB`

The CLI must also enforce this at runtime. If a future change accidentally adds a whole app/profile root to the cleanup list, the command must skip it under `skipped_for_safety` instead of moving it.

Forbidden whole-root archive targets include:

- `~/.hermes`
- `~/Library/Application Support/Hermes`
- `~/Library/Application Support/hermes`
- `/Applications/Hermes.app`

Only use a full folder move when a lead explicitly approves it during an incident.
When doing a full move, tell the employee first that old Hermes UI sessions/chats will disappear from the app but are archived, not permanently deleted.

## Paths To Inspect

macOS:

- `~/.hermes`
- `~/Library/Application Support/Hermes`
- `~/Library/Application Support/hermes`

Windows:

- `%USERPROFILE%\.hermes`
- `%LOCALAPPDATA%\hermes`
- `%LOCALAPPDATA%\Hermes`
- `%APPDATA%\hermes`
- `%APPDATA%\Hermes`

## Why Hermes Context Gets Large

Hermes can carry more than the user-visible text:

- system prompts
- tool schemas
- tool outputs
- search/read/edit traces
- compacted history
- request dumps after failures
- app local state
- old conversation/session storage

A short user prompt can still become a large LLM request if Hermes attaches old context.

## Release Rule

Do not ship a private installer with a CLI older than the public standard unless the installer explicitly says it is an emergency hotfix and still preserves `bda update`, `bda doctor`, and `bda doctor --fix`.

If installer version and standard version drift, `bda doctor` must report it clearly.
