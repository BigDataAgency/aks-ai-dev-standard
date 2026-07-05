#!/bin/bash
# adapter: claude CLI — บทเรียน: CLAUDE_CONFIG_DIR แยกกัน 401 key เก่า, model = claude-code-local ชื่อเดียว
set -u
PROMPT="${1:?}"; WD="${2:?}"; LOG="${3:?}"
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$PATH"
KEYVAL=$(grep -E "^BDA_AI_ROUTER_API_KEY=" "$HOME/.hermes/.env" | cut -d= -f2-)
export CLAUDE_CONFIG_DIR="${BDA_EVAL_CLAUDE_CONFIG:-/tmp/claude-bda-eval}"
export ANTHROPIC_BASE_URL="${BDA_AI_ROUTER_BASE:-https://ai-local.scmc.digital}"
export ANTHROPIC_API_KEY="$KEYVAL"
unset ANTHROPIC_AUTH_TOKEN
cd "$WD" || exit 1
claude -p "$PROMPT" --model "${BDA_EVAL_CLAUDE_MODEL:-claude-code-local}" \
  --allowedTools "Write,Edit,Read,Bash,Glob,Grep" --max-turns 200 --output-format json </dev/null >"$LOG" 2>&1
