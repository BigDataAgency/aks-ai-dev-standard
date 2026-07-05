#!/bin/bash
# adapter: hermes — บทเรียน: </dev/null เสมอ (กันค้างรอ stdin), prompt ต้องมี path เต็ม (กัน cwd drift)
set -u
PROMPT="${1:?}"; WD="${2:?}"; LOG="${3:?}"
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$HOME/.bda-skills/bin:$PATH"
cd "$WD" || exit 1
hermes -z "$PROMPT" --cli --yolo </dev/null >"$LOG" 2>&1
