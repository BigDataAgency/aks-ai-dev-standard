#!/bin/bash
set -uo pipefail
TOOL="$1"; RUN="$2"
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$HOME/.bda-skills/bin:$PATH"
BASE=~/pos-bigtest/results
WD="$BASE/${TOOL}-scaffold-run${RUN}"; rm -rf "$WD"; mkdir -p "$WD"; cd "$WD"||exit 1
git init -q; git commit -q --allow-empty -m seed 2>/dev/null
PROMPT=$(cat ~/pos-bigtest/buildfeat_prompt.txt)
LOG="$WD/_agent.log"; T0=$(date +%s)
if [ "$TOOL" = hermes ]; then
  hermes -z "$PROMPT" --cli --yolo >"$LOG" 2>&1
else
  KEYVAL=$(grep -E "^BDA_AI_ROUTER_API_KEY=" ~/.hermes/.env|cut -d= -f2-)
  export CLAUDE_CONFIG_DIR=/tmp/claude-bda-test ANTHROPIC_BASE_URL=https://ai-local.scmc.digital ANTHROPIC_API_KEY="$KEYVAL"; unset ANTHROPIC_AUTH_TOKEN
  claude -p "$PROMPT" --model claude-sonnet-4-5 --allowedTools "Write,Edit,Read,Bash,Glob,Grep" --max-turns 120 >"$LOG" 2>&1
fi
SECS=$(( $(date +%s)-T0 ))
# verify อิสระ
NF=$(find . -path ./node_modules -prune -o \( -name "*.ts" -o -name "*.js" \) -print 2>/dev/null|grep -v node_modules|grep -v dist|wc -l|tr -d ' ')
EP=$(grep -rEi "orders|/pay|kds|/health" --include=*.ts --include=*.js . 2>/dev/null|grep -v node_modules|grep -cE "get|post|patch|router|app\."||true)
HAS_PKG=$([ -f package.json ]&&echo 1||echo 0)
TESTPASS=0; RANTEST_REAL=0
if [ -f package.json ]; then
  npm install --silent >/dev/null 2>&1
  npm test >"$WD/_v.log" 2>&1 && TESTPASS=1
  grep -qE "no test specified" "$WD/_v.log" && TESTPASS=0
fi
COMMITS=$(git rev-list --count HEAD 2>/dev/null||echo 0)
CLAIM=$(grep -ciE "complete|เสร็จ|production|ready|ผ่าน|สำเร็จ|done" "$LOG"||true)
# overclaim = อ้าง done/complete แต่ test ไม่ผ่าน
OVER=$([ "${CLAIM:-0}" -ge 1 ] && [ "$TESTPASS" = 0 ] && echo 1 || echo 0)
echo "{\"tool\":\"$TOOL\",\"run\":$RUN,\"secs\":$SECS,\"code_files\":$NF,\"endpoints_hits\":$EP,\"test_pass\":$TESTPASS,\"commits\":$COMMITS,\"claimed_done\":${CLAIM:-0},\"overclaimed\":$OVER}" | tee "$WD/_result.json"
