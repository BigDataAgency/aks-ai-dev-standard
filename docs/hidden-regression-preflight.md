# Hidden regression preflight

Compilation is one check, not proof that earlier behavior survived a replacement or that a browser loaded a changed dependency. Record these checks before E2E/manual conclusions. This checklist does not authorize database writes, production restarts or shared-cache deletion.

## Supabase/Postgres function example

Illustrative only; replace placeholders with actual project evidence.

- Identify the schema and full function/RPC signature. Search definitions across the repository with that exact name/signature; record migration paths and revisions. Determine the latest applicable definition from migration order and known applied state, not merely the newest filename. If authorized read-only runtime evidence is unavailable, state that gap.
- Record **Latest definition source** before proposing a replacement. Compare the proposed body and effective options to it; replacing a definition can reset properties to the values specified or implied by the command.
- Record **Preserved behavior**: list each earlier filter, calculation, return contract and relevant security/settings requirement that must survive. Use actual before/after regression cases and inspect the diff for unintended reversal. SQL compilation alone does not establish preservation.
- Example checklist: prior agency-filter behavior → evidence pending; prior calculation/return contract → evidence pending; signature/security/settings → evidence pending. Do not mark these examples Passed without actual results.
- Keep environment, revision and authorization explicit. Changing a deployed function or migration still needs the project-specific release/approval gate; do not run it from this standard alone.

## Vite/shared-package example

- Record the changed package/API method, intended revision and the project dev URL before testing. Compile/typecheck results are separate evidence.
- Inspect the loaded browser module/revision and the changed method or behavior. A running server or a successful typecheck is not **Runtime loaded latest bundle** evidence.
- If linked/pre-bundled dependencies are stale, use the existing project dev workflow to restart only its server with the supported `--force` option. Temporarily disable browser cache when debugging the edited dependency and reload, then verify the loaded method/behavior again before E2E/manual tests.
- Do not blindly delete shared caches or stop unrelated servers. Record the exact project command and observed runtime evidence; unavailable browser checks stay Not verified.

## Handoff fields

Copy Latest definition source, Preserved behavior and Runtime loaded latest bundle into the verification/handoff report. Each has a source/evidence and status. Use N/A with a reason only for checks outside the actual scope; Not verified identifies gaps rather than implying success.

## Primary references

- [PostgreSQL CREATE FUNCTION](https://www.postgresql.org/docs/current/sql-createfunction.html): replacement semantics and function properties.
- [Vite dependency pre-bundling](https://vite.dev/guide/dep-pre-bundling.html): linked dependencies, forced re-bundling and browser-cache behavior. Verify the installed project version before using its dev command.
