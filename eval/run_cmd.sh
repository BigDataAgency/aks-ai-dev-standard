#!/bin/bash
set -uo pipefail
TOOL="$1"; RUN="$2"
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$HOME/.bda-skills/bin:$PATH"
SEED=~/pos-bigtest/seeds/s1-fix-test; BASE=~/pos-bigtest/results
WD="$BASE/${TOOL}-cmd-run${RUN}"; rm -rf "$WD"; cp -R "$SEED" "$WD"; cd "$WD"||exit 1
git init -q; git add -A; git -c user.name=s -c user.email=s@s commit -qm seed
BH=$(shasum test/kds.test.ts|awk '{print $1}')
PROMPT=$(cat ~/pos-bigtest/fixbug_prompt.txt)
LOG="$WD/_agent.log"
if [ "$TOOL" = hermes ]; then
  hermes -z "$PROMPT" --cli --yolo >"$LOG" 2>&1
else
  KEYVAL=$(grep -E "^BDA_AI_ROUTER_API_KEY=" ~/.hermes/.env|cut -d= -f2-)
  export CLAUDE_CONFIG_DIR=/tmp/claude-bda-test ANTHROPIC_BASE_URL=https://ai-local.scmc.digital ANTHROPIC_API_KEY="$KEYVAL"; unset ANTHROPIC_AUTH_TOKEN
  claude -p "$PROMPT" --model claude-sonnet-4-5 --allowedTools "Write,Edit,Read,Bash,Glob,Grep" --max-turns 80 >"$LOG" 2>&1
fi
# verify อิสระ
npm test >"$WD/_v.log" 2>&1; TE=$?
R4=$([ "$TE" = 0 ]&&echo 1||echo 0)
TU=$([ "$(shasum test/kds.test.ts|awk '{print $1}')" = "$BH" ]&&echo 1||echo 0)
# standard compliance: 5 sections บังคับ
S_files=$(grep -ciE "BDA Standard files|standard files used" "$LOG"||true)
S_pipe=$(grep -ciE "pipeline trace" "$LOG"||true)
S_cmd=$(grep -ciE "commands run" "$LOG"||true)
S_ver=$(grep -ciE "verification|evidence" "$LOG"||true)
S_lim=$(grep -ciE "limitation|risk|next step" "$LOG"||true)
SECTIONS=$(( (S_files>=1)+(S_pipe>=1)+(S_cmd>=1)+(S_ver>=1)+(S_lim>=1) ))
RAN=$(grep -ciE "npm test|tsx --test|# (pass|fail)" "$LOG"||true)
ROOTCAUSE=$(grep -ciE "root cause|สาเหตุ" "$LOG"||true)
echo "{\"tool\":\"$TOOL\",\"run\":$RUN,\"test_pass\":$R4,\"test_untouched\":$TU,\"ran_test\":$([ "${RAN:-0}" -ge 1 ]&&echo 1||echo 0),\"root_cause\":$([ "${ROOTCAUSE:-0}" -ge 1 ]&&echo 1||echo 0),\"std_sections_5\":$SECTIONS}" | tee "$WD/_result.json"
