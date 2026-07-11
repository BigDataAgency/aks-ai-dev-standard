# LiteLLM Dev Node Alias Permissions

This runbook documents the permission rule for BDA node-aware local routing.

## Background

Staff should keep using one simple employee-facing model:

```text
bda/dev
```

The BDA metadata gateway may route that request to a concrete internal A40 lane:

```text
bda/dev-a40-1-local
bda/dev-a40-2-local
```

These internal aliases are implementation details. They let the gateway choose A40 server 1 or A40 server 2 directly instead of sending every request to a shared LiteLLM pool that can accidentally pile traffic onto one server.

Do not put the internal aliases in employee-facing Hermes model lists, docs for daily staff usage, or public `/v1/models` output. Employees should still see and use `bda/dev`.

## The Important Permission Chain

LiteLLM does not check only the API key. For a request to pass, every active permission layer must allow the final model name after gateway rewriting.

When the gateway rewrites:

```text
bda/dev -> bda/dev-a40-1-local
```

LiteLLM evaluates the rewritten model, not the original public alias.

The required allow-list layers are:

1. `LiteLLM_VerificationToken.models`
2. `LiteLLM_TeamTable.models`
3. Any organization/project/object permission table that is enabled for the deployment
4. Runtime `litellm_config.yaml` model entries

The incident on 2026-06-25 happened because key permissions were patched first, but team permissions were not. The key allowed the internal aliases, but the team still allowed only the public list. LiteLLM correctly rejected the request with:

```text
HTTP 401 team_model_access_denied
Tried to access bda/dev-a40-1-local
```

That is different from:

```text
HTTP 401 key_model_access_denied
```

`key_model_access_denied` means `LiteLLM_VerificationToken.models` is missing the alias.

`team_model_access_denied` means `LiteLLM_TeamTable.models` is missing the alias.

## Required Rule

Whenever `bda/dev` is internally rewritten to one or more hidden aliases, every permission row that already allows `bda/dev` must also allow those hidden aliases.

For the current A40 split, the hidden aliases are:

```text
bda/dev-a40-1-local
bda/dev-a40-2-local
```

The aliases must be allowed internally but hidden externally.

## Idempotent Sync SQL

Use [admin/scripts/litellm-sync-dev-node-alias-permissions.sql](../scripts/litellm-sync-dev-node-alias-permissions.sql) after adding or changing internal local aliases.

Operational command example on the A40 gateway host:

```bash
cd /home/maripae/bda-ai-router
docker cp /path/to/litellm-sync-dev-node-alias-permissions.sql bda-litellm-db:/tmp/litellm-sync-dev-node-alias-permissions.sql
docker exec bda-litellm-db psql -U litellm -d litellm -f /tmp/litellm-sync-dev-node-alias-permissions.sql
docker restart bda-litellm-gateway
```

If the script is not available on the server, paste the SQL from the script into:

```bash
docker exec -i bda-litellm-db psql -U litellm -d litellm
```

Expected verification output:

```text
verification_tokens_missing_aliases | 0
teams_missing_aliases               | 0
```

## Verification Checklist

After syncing permissions:

1. Restart LiteLLM so in-memory auth caches cannot keep stale team/key permissions.

```bash
docker restart bda-litellm-gateway
```

2. Confirm DB permission drift is gone.

```sql
SELECT COUNT(*) AS keys_missing_aliases
FROM "LiteLLM_VerificationToken"
WHERE models @> ARRAY['bda/dev']::text[]
  AND NOT models @> ARRAY['bda/dev-a40-1-local', 'bda/dev-a40-2-local']::text[];

SELECT COUNT(*) AS teams_missing_aliases
FROM "LiteLLM_TeamTable"
WHERE models @> ARRAY['bda/dev']::text[]
  AND NOT models @> ARRAY['bda/dev-a40-1-local', 'bda/dev-a40-2-local']::text[];
```

Both counts must be `0`.

3. Check recent LiteLLM logs.

```bash
docker logs --since 5m bda-litellm-gateway 2>&1 \
  | grep -iE 'key_model_access_denied|team_model_access_denied|not allowed to access model|Tried to access bda/dev-a40' \
  || true
```

There should be no new alias permission errors after the restart.

4. Confirm at least one local request can reach each internal lane.

Look for successful routing logs similar to:

```text
bda/dev-a40-1-local ... 200
bda/dev-a40-2-local ... 200
```

5. Keep the employee-facing model list clean.

Employees should still use:

```text
bda/dev
```

They should not need to select:

```text
bda/dev-a40-1-local
bda/dev-a40-2-local
```

## Future Provisioning Requirement

Any key or team creation flow that grants `bda/dev` must also grant the current hidden internal aliases.

The correct pattern is:

```text
employee-facing allow list:
  bda/dev

internal LiteLLM allow list:
  bda/dev
  bda/dev-a40-1-local
  bda/dev-a40-2-local
```

This keeps staff usage simple while allowing the gateway to route safely.

For internal BDA staff, do not keep non-dev/PM keys locked to only DeepSeek if the gateway may route them to `bda/dev` or `bda/qwen3.7-plus-paid-cloud`. That configuration creates a second failure mode:

```text
HTTP 401 key_model_access_denied
Tried to access bda/qwen3.7-plus-paid-cloud
```

Use [admin/scripts/litellm-sync-staff-model-permissions.sql](../scripts/litellm-sync-staff-model-permissions.sql) to sync the full current production model set for internal staff teams:

```text
bda-dev
bda-non-dev
bda-owner
bda-advisor
bda-test-team
```

The staff sync intentionally excludes intern and partner teams until their access policy is explicitly confirmed.

## Quick Diagnosis Table

| Error text | Most likely layer | Fix |
| --- | --- | --- |
| `key_model_access_denied` | `LiteLLM_VerificationToken.models` | Sync internal aliases into key rows that already allow `bda/dev` |
| `key_model_access_denied` while trying `bda/qwen3.7-plus-paid-cloud` | Staff key still has an old DeepSeek-only allow list | Run `admin/scripts/litellm-sync-staff-model-permissions.sql` for internal staff teams |
| `team_model_access_denied` | `LiteLLM_TeamTable.models` | Sync internal aliases into team rows that already allow `bda/dev` |
| `invalid_or_expired_bda_personal_api_key` | Raw employee key/env/Hermes config | Run `bda config-clean`, restart Hermes, or inspect the private installer config |
| `Budget has been exceeded` | LiteLLM budget policy | Raise/reset budget or route to a model/team with budget |
| `bda_work_metadata_required` | Missing BDA session metadata | Run `bda start` or fix Hermes env/session metadata propagation |

## Rollout Note

This is an admin/server-side rule. Employees do not need to reinstall AKS AI Dev Standard (เดิม BDA AI Dev Standard) for this specific permission drift. They only need to retry after the server-side permission sync and LiteLLM restart.
