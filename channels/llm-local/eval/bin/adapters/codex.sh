#!/bin/bash
# adapter: codex CLI — ต้องมี ~/.codex/config.toml ตาม docs/tool-setup (wire_api=responses, model=bda/dev-codex)
set -u
PROMPT="${1:?}"; WD="${2:?}"; LOG="${3:?}"
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$PATH"
export BDA_AI_ROUTER_API_KEY=$(grep -E "^(AKS_AI_ROUTER_API_KEY|BDA_AI_ROUTER_API_KEY)=" "$HOME/.hermes/.env" | tail -1 | cut -d= -f2-)
cd "$WD" || exit 1
codex exec --profile bda --skip-git-repo-check --sandbox workspace-write "$PROMPT" </dev/null >"$LOG" 2>&1
