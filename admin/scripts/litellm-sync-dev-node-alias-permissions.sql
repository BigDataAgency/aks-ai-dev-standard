-- Sync LiteLLM permissions for BDA node-aware local routing.
--
-- Why this exists:
--   Employees keep using the public model alias `bda/dev`.
--   The metadata gateway may rewrite that request internally to one concrete
--   local A40 lane, such as:
--
--     bda/dev-a40-1-local
--     bda/dev-a40-2-local
--
--   LiteLLM checks model access in more than one place. Updating only
--   LiteLLM_VerificationToken.models is not enough when the key belongs to a
--   team, because LiteLLM also checks LiteLLM_TeamTable.models. If the team
--   still only allows `bda/dev`, employees will see:
--
--     HTTP 401 team_model_access_denied
--     Tried to access bda/dev-a40-1-local
--
--   This script keeps the internal aliases allowed wherever `bda/dev` is
--   already allowed, while keeping the public model list clean. Do not expose
--   these internal aliases in Hermes or /v1/models for employees.
--
-- Safe to re-run:
--   The ARRAY(SELECT DISTINCT ...) pattern makes this idempotent.
--
-- Usage inside the LiteLLM Postgres container:
--
--   psql -U litellm -d litellm -f /path/to/litellm-sync-dev-node-alias-permissions.sql
--
-- Or paste the statements into:
--
--   docker exec -i bda-litellm-db psql -U litellm -d litellm

BEGIN;

WITH alias_models AS (
  SELECT ARRAY[
    'bda/dev-a40-1-local',
    'bda/dev-a40-2-local'
  ]::text[] AS models
)
UPDATE "LiteLLM_VerificationToken" token
SET
  models = (
    SELECT ARRAY(
      SELECT DISTINCT model_name
      FROM unnest(token.models || alias_models.models) AS model_name
      ORDER BY model_name
    )
  ),
  updated_at = CURRENT_TIMESTAMP,
  updated_by = 'bda-sync-dev-node-alias-permissions'
FROM alias_models
WHERE token.models @> ARRAY['bda/dev']::text[]
  AND NOT token.models @> alias_models.models;

WITH alias_models AS (
  SELECT ARRAY[
    'bda/dev-a40-1-local',
    'bda/dev-a40-2-local'
  ]::text[] AS models
)
UPDATE "LiteLLM_TeamTable" team
SET
  models = (
    SELECT ARRAY(
      SELECT DISTINCT model_name
      FROM unnest(team.models || alias_models.models) AS model_name
      ORDER BY model_name
    )
  ),
  updated_at = CURRENT_TIMESTAMP
FROM alias_models
WHERE team.models @> ARRAY['bda/dev']::text[]
  AND NOT team.models @> alias_models.models;

COMMIT;

SELECT
  'verification_tokens_missing_aliases' AS check_name,
  COUNT(*) AS missing_count
FROM "LiteLLM_VerificationToken"
WHERE models @> ARRAY['bda/dev']::text[]
  AND NOT models @> ARRAY['bda/dev-a40-1-local', 'bda/dev-a40-2-local']::text[]
UNION ALL
SELECT
  'teams_missing_aliases' AS check_name,
  COUNT(*) AS missing_count
FROM "LiteLLM_TeamTable"
WHERE models @> ARRAY['bda/dev']::text[]
  AND NOT models @> ARRAY['bda/dev-a40-1-local', 'bda/dev-a40-2-local']::text[];
