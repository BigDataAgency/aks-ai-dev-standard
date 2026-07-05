#!/bin/bash
# Fair cross-language verifier — บทเรียนคืน 2026-07-05: เครื่องวัดกล่าวหา AI ผิด 7 ครั้งในคืนเดียว
# กติกา: (1) detect ภาษาแล้วรัน test runner ที่ถูก (2) ลง deps ที่ประกาศ + ตัวที่พลาดบ่อย (pytest-asyncio!)
#        (3) รันจาก cwd ที่ถูก (4) หา stray files ก่อนสรุปว่า agent โม้ (cwd drift = งานจริงผิดที่)
set -uo pipefail
WD="${1:?workdir}"; T0="${2:-0}"
cd "$WD" || { echo '{"error":"no workdir"}'; exit 0; }

LANG="none"; PASS=0; INFO="none"
PYT=$(find . -name "test_*.py" -o -name "*_test.py" 2>/dev/null | grep -v ".eval-venv" | grep -v ".venv" | head -1)
PKG=$(find . -name package.json -not -path "*/node_modules/*" 2>/dev/null | head -1)

if [ -n "$PYT" ]; then
  LANG="python"
  python3 -m venv .eval-venv >/dev/null 2>&1; . .eval-venv/bin/activate
  find . -name requirements.txt -not -path "./.eval-venv/*" | head -1 | xargs -I{} pip install -q -r {} >/dev/null 2>&1
  pip install -q pytest pytest-asyncio fastapi "pydantic<3" httpx uvicorn flask >/dev/null 2>&1
  # รันจากโฟลเดอร์แม่ของ tests/ (กัน false-fail จาก import layout)
  TDIR=$(dirname "$PYT"); RUNDIR="."
  [ "$(basename "$TDIR")" = "tests" ] && RUNDIR="$(dirname "$TDIR")"
  OUT=$(cd "$RUNDIR" && PYTHONPATH=. python3 -m pytest -q 2>&1 | tail -2)
  INFO=$(echo "$OUT" | tr '\n' ' ' | cut -c1-100)
  echo "$OUT" | grep -qE "[1-9][0-9]* passed" && ! echo "$OUT" | grep -qE "[1-9][0-9]* (failed|error)" && PASS=1
  deactivate 2>/dev/null || true
elif [ -n "$PKG" ]; then
  LANG="node"
  PD=$(dirname "$PKG")
  ( cd "$PD" && npm install --silent >/dev/null 2>&1 )
  OUT=$(cd "$PD" && npm test 2>&1 | tail -4)
  INFO=$(echo "$OUT" | tr '\n' ' ' | cut -c1-100)
  echo "$OUT" | grep -qiE "pass|# fail 0|ok" && ! echo "$OUT" | grep -qiE "[1-9][0-9]* fail|no test specified" && PASS=1
fi

COMMITS=$(git rev-list --count HEAD 2>/dev/null); COMMITS=${COMMITS:-0}
# cwd-drift detection: ไฟล์โค้ดใหม่ 1-2 ชั้นเหนือ workdir ช่วงเวลารัน
STRAY=""
if [ "$T0" != "0" ]; then
  for D in "$(dirname "$WD")" "$(dirname "$(dirname "$WD")")"; do
    S=$(find "$D" -maxdepth 2 -newermt "@$T0" \( -name "*.py" -o -name "*.ts" -o -name "*.js" \) \
        -not -path "$WD/*" -not -path "*/node_modules/*" -not -path "*/.eval-venv/*" -not -path "*/.venv/*" 2>/dev/null | head -2)
    [ -n "$S" ] && STRAY="$STRAY$S;"
  done
  STRAY=$(echo "$STRAY" | tr '\n' ';' | sed 's/^;*//; s/;*$//' | cut -c1-200)
fi
INFO_ESC=$(echo "$INFO" | sed 's/\\/\\\\/g; s/"/\\"/g')
echo "{\"lang\":\"$LANG\",\"test_pass\":$PASS,\"commits\":$COMMITS,\"stray\":\"$STRAY\",\"info\":\"$INFO_ESC\"}"
