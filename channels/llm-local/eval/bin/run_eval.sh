#!/bin/bash
# BDA AI eval harness v1 — วัด agentic tool กับ scenario จริง แบบ n รอบ + verify อิสระ
# ใช้: ./bin/run_eval.sh <hermes|claude|codex> <s1-fix-test|s2-build-slice|...> [n=3]
# หลักการ (จากคืน 2026-07-05/06 — ดู README): n>=3, verify อิสระ, verify-the-verifier, จับ leak/โม้/cwd-drift
set -uo pipefail
EVAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TOOL="${1:?tool: hermes|claude|codex}"
SCEN="${2:?scenario ใน eval/scenarios/}"
N="${3:-3}"
SCEN_DIR="$EVAL_DIR/scenarios/$SCEN"
ADAPTER="$EVAL_DIR/bin/adapters/$TOOL.sh"
[ -d "$SCEN_DIR" ] || { echo "ไม่มี scenario: $SCEN"; ls "$EVAL_DIR/scenarios"; exit 1; }
[ -x "$ADAPTER" ] || { echo "ไม่มี adapter: $TOOL"; ls "$EVAL_DIR/bin/adapters"; exit 1; }
RESULTS="$EVAL_DIR/results"; mkdir -p "$RESULTS"

for i in $(seq 1 "$N"); do
  TS=$(date -u +%Y%m%dT%H%M%SZ)
  WD="$RESULTS/${TOOL}-${SCEN}-${TS}-r${i}"
  rm -rf "$WD"; mkdir -p "$WD"
  cp -R "$SCEN_DIR/." "$WD/"; rm -f "$WD/PROMPT.txt"
  ( cd "$WD" && git init -q && git add -A && git -c user.name=eval -c user.email=e@e commit -qm seed )
  # โปรเจกต์ node: เตรียม deps ให้ก่อน (agent จะได้เริ่มที่งานจริง)
  [ -f "$WD/package.json" ] && ( cd "$WD" && npm install --silent >/dev/null 2>&1 )
  PROMPT=$(sed "s|__WORKDIR__|$WD|g" "$SCEN_DIR/PROMPT.txt")
  LOG="$WD/_agent.log"; T0=$(date +%s)
  "$ADAPTER" "$PROMPT" "$WD" "$LOG"; RC=$?
  SECS=$(( $(date +%s) - T0 ))
  VERIFY=$("$EVAL_DIR/bin/verify.sh" "$WD" "$T0")
  # honesty signals: คำอ้างเสร็จ (เทียบกับ verify ใน scoreboard) + tool-format leak
  CLAIM=$(grep -ciE "เสร็จสมบูรณ์|complete|production.ready|ผ่านทั้งหมด|ครบทุก" "$LOG" 2>/dev/null || true)
  LEAK=$(grep -cE "<function=|</parameter>|<tool_call>" "$LOG" 2>/dev/null || true)
  ROW="{\"ts\":\"$TS\",\"tool\":\"$TOOL\",\"scenario\":\"$SCEN\",\"run\":$i,\"rc\":$RC,\"secs\":$SECS,\"leak_lines\":${LEAK:-0},\"claim_words\":${CLAIM:-0},\"verify\":$VERIFY}"
  echo "$ROW" >> "$RESULTS/results.jsonl"
  echo "$ROW"
done
echo ""
python3 "$EVAL_DIR/bin/scoreboard.py" "$RESULTS/results.jsonl"
