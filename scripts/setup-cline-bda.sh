#!/bin/bash
# setup-cline-bda.sh — ตั้งค่า Cline ให้ตรง BDA gateway แบบอัตโนมัติ (ศูนย์คลิก)
# ทำอะไร: เขียน ~/.cline/data/globalState.json → base URL สะอาด, model bda/dev,
#          contextWindow 262144 + maxTokens 16384 (ไม่ตั้ง = Cline ใช้ default 128k)
# ใช้: ./scripts/setup-cline-bda.sh   (ควรปิด VS Code/Devin/Windsurf ก่อน แล้วเปิดใหม่หลังรัน)
# หมายเหตุ: ไม่แตะ secrets.json (API key ผู้ใช้ตั้งใน UI ครั้งแรกครั้งเดียว)
set -euo pipefail

STATE="$HOME/.cline/data/globalState.json"
BASE_URL="${AKS_AI_ROUTER_BASE_URL:-${BDA_AI_ROUTER_BASE_URL:-https://ai-local.scmc.digital/v1}}"
MODEL="${AKS_CLINE_MODEL:-${BDA_CLINE_MODEL:-bda/dev}}"
CTX="${AKS_CLINE_CONTEXT_WINDOW:-${BDA_CLINE_CONTEXT_WINDOW:-262144}}"
MAXTOK="${AKS_CLINE_MAX_TOKENS:-${BDA_CLINE_MAX_TOKENS:-16384}}"

# Cline flush state ในหน่วยความจำทับไฟล์ตอนปิดแอป (พิสูจน์แล้ว 2026-07-06) → ต้องปิด editor ก่อน ไม่งั้นค่าหาย
if pgrep -f "Visual Studio Code|Devin|Windsurf" >/dev/null 2>&1 && [ "${FORCE:-0}" != "1" ]; then
  echo "❌ ต้องปิด VS Code / Devin / Windsurf ให้หมดก่อนรัน (Cmd+Q) — ไม่งั้น editor จะเขียนค่าเก่าทับตอนปิด"
  echo "   ปิดแล้วรันใหม่ หรือ FORCE=1 ถ้ามั่นใจ"
  exit 1
fi

mkdir -p "$(dirname "$STATE")"
[ -f "$STATE" ] || echo '{}' > "$STATE"
TS=$(date -u +%Y%m%dT%H%M%SZ)
cp "$STATE" "$STATE.bak-$TS"

STATE="$STATE" BASE_URL="$BASE_URL" MODEL="$MODEL" CTX="$CTX" MAXTOK="$MAXTOK" python3 - <<'PY'
import json, os

p = os.environ["STATE"]
d = json.load(open(p))
info = {
    "maxTokens": int(os.environ["MAXTOK"]),
    "contextWindow": int(os.environ["CTX"]),
    "supportsImages": False,
    "supportsPromptCache": False,
    "inputPrice": 0,
    "outputPrice": 0,
    "description": "BDA local fleet (Qwen3.6) via ai gateway",
}
d["openAiBaseUrl"] = os.environ["BASE_URL"].strip()          # strip กัน \t/space จาก copy-paste
for mode in ("planMode", "actMode"):
    d[f"{mode}ApiProvider"] = "openai"
    d[f"{mode}OpenAiModelId"] = os.environ["MODEL"]
    d[f"{mode}OpenAiModelInfo"] = info
json.dump(d, open(p, "w"), ensure_ascii=False, indent=2)
print(f"✅ Cline config updated: model={os.environ['MODEL']} ctx={os.environ['CTX']} maxTokens={os.environ['MAXTOK']}")
print(f"   backup: {p}.bak-*")
print("   ▶ ปิด/เปิด editor ใหม่ แล้ว Start New Task — แถบ context จะแสดง 256.0k")
PY

# ติดตั้ง Thai self-review rule เป็น Cline global rule (มีผลทุก workspace)
# ที่มา: Qwen3.6 เขียนไทยเพี้ยนเป็นรายครั้งแต่ตรวจ/แก้ได้แม่น — ดู channels/llm-local/docs/thai-output-safety.md
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# v1.1.0 layout: templates/ ย้ายไป core/templates/ — ลอง path ใหม่ก่อนแล้ว fallback layout เก่า
# (script นี้ถูกเรียกจาก bda update/setup ของ checkout เก่าได้ จึงต้องรองรับทั้งสอง layout หนึ่ง release)
RULE_SRC="$SCRIPT_DIR/../core/templates/clinerules-thai-review.md"
if [ ! -f "$RULE_SRC" ]; then
  RULE_SRC="$SCRIPT_DIR/../templates/clinerules-thai-review.md"
fi
RULES_DIR="$HOME/Documents/Cline/Rules"
if [ -f "$RULE_SRC" ]; then
  mkdir -p "$RULES_DIR"
  cp "$RULE_SRC" "$RULES_DIR/bda-thai-review.md"
  echo "✅ Thai self-review rule installed: $RULES_DIR/bda-thai-review.md"
fi
