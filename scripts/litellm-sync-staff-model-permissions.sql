-- Sync LiteLLM model permissions for internal BDA staff teams.
--
-- Why this exists:
--   During the 2026-06-25 hybrid rollout, non-dev and PM keys still had only:
--
--     bda/deepseek-fast-paid-cloud
--     bda/deepseek-paid-cloud
--
--   The gateway could route those users to:
--
--     bda/qwen3.7-plus-paid-cloud
--     bda/nondev
--     bda/dev
--     bda/dev-a40-1-local
--     bda/dev-a40-2-local
--
--   LiteLLM then rejected the request with:
--
--     HTTP 401 key_model_access_denied
--     Tried to access bda/qwen3.7-plus-paid-cloud
--
-- Policy:
--   Internal BDA staff teams should have the current production BDA gateway
--   model set. Daily behavior guidance can still discourage non-dev from
--   using local A40 unnecessarily, but the system should not hard-block them
--   when the gateway chooses a fallback route.
--
-- Safety:
--   This intentionally excludes intern and partner teams. Add those teams
--   explicitly only after access policy is confirmed.
--
-- Safe to re-run:
--   The ARRAY(SELECT DISTINCT ...) pattern makes this idempotent.

BEGIN;

WITH staff_model_set AS (
  SELECT ARRAY[
    'bda/dev',
    'bda/nondev',
    'bda/dev-a40-1-local',
    'bda/dev-a40-2-local',
    'bda/deepseek-fast-paid-cloud',
    'bda/deepseek-paid-cloud',
    'bda/deepseek-v4-pro-paid-cloud',
    'bda/minimax-m3-paid-cloud',
    'bda/qwen3.7-plus-paid-cloud',
    'bda/qwen3.7-max-paid-cloud',
    'bda/glm-5.1-paid-cloud',
    'bda/openrouter-free-cloud'
  ]::text[] AS models
),
internal_staff_teams AS (
  SELECT ARRAY[
    'bda-dev',
    'bda-non-dev',
    'bda-owner',
    'bda-advisor',
    'bda-test-team'
  ]::text[] AS team_ids
)
UPDATE "LiteLLM_TeamTable" team
SET
  models = (
    SELECT ARRAY(
      SELECT DISTINCT model_name
      FROM unnest(team.models || staff_model_set.models) AS model_name
      ORDER BY model_name
    )
  ),
  updated_at = CURRENT_TIMESTAMP
FROM staff_model_set, internal_staff_teams
WHERE team.team_id = ANY(internal_staff_teams.team_ids)
  AND NOT team.models @> staff_model_set.models;

WITH staff_model_set AS (
  SELECT ARRAY[
    'bda/dev',
    'bda/nondev',
    'bda/dev-a40-1-local',
    'bda/dev-a40-2-local',
    'bda/deepseek-fast-paid-cloud',
    'bda/deepseek-paid-cloud',
    'bda/deepseek-v4-pro-paid-cloud',
    'bda/minimax-m3-paid-cloud',
    'bda/qwen3.7-plus-paid-cloud',
    'bda/qwen3.7-max-paid-cloud',
    'bda/glm-5.1-paid-cloud',
    'bda/openrouter-free-cloud'
  ]::text[] AS models
),
internal_staff_teams AS (
  SELECT ARRAY[
    'bda-dev',
    'bda-non-dev',
    'bda-owner',
    'bda-advisor',
    'bda-test-team'
  ]::text[] AS team_ids
)
UPDATE "LiteLLM_VerificationToken" token
SET
  models = (
    SELECT ARRAY(
      SELECT DISTINCT model_name
      FROM unnest(token.models || staff_model_set.models) AS model_name
      ORDER BY model_name
    )
  ),
  updated_at = CURRENT_TIMESTAMP,
  updated_by = 'bda-sync-staff-model-permissions'
FROM staff_model_set, internal_staff_teams
WHERE token.team_id = ANY(internal_staff_teams.team_ids)
  AND NOT token.models @> staff_model_set.models;

COMMIT;

WITH staff_model_set AS (
  SELECT ARRAY[
    'bda/dev',
    'bda/nondev',
    'bda/dev-a40-1-local',
    'bda/dev-a40-2-local',
    'bda/deepseek-fast-paid-cloud',
    'bda/deepseek-paid-cloud',
    'bda/deepseek-v4-pro-paid-cloud',
    'bda/minimax-m3-paid-cloud',
    'bda/qwen3.7-plus-paid-cloud',
    'bda/qwen3.7-max-paid-cloud',
    'bda/glm-5.1-paid-cloud',
    'bda/openrouter-free-cloud'
  ]::text[] AS models
),
internal_staff_teams AS (
  SELECT ARRAY[
    'bda-dev',
    'bda-non-dev',
    'bda-owner',
    'bda-advisor',
    'bda-test-team'
  ]::text[] AS team_ids
)
SELECT
  'internal_staff_teams_missing_models' AS check_name,
  COUNT(*) AS missing_count
FROM "LiteLLM_TeamTable" team, staff_model_set, internal_staff_teams
WHERE team.team_id = ANY(internal_staff_teams.team_ids)
  AND NOT team.models @> staff_model_set.models
UNION ALL
SELECT
  'internal_staff_keys_missing_models' AS check_name,
  COUNT(*) AS missing_count
FROM "LiteLLM_VerificationToken" token, staff_model_set, internal_staff_teams
WHERE token.team_id = ANY(internal_staff_teams.team_ids)
  AND NOT token.models @> staff_model_set.models;
