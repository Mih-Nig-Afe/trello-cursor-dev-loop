#!/bin/bash
# Sync MCP Dev Loop to global Cursor config (~/.cursor/mcp.json + skill).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GLOBAL_MCP="$HOME/.cursor/mcp.json"
GLOBAL_SKILL_DIR="$HOME/.cursor/skills/trello-dev-loop"
START_SCRIPT="$ROOT/trello-mcp-server/bin/start-mcp.sh"

mkdir -p "$GLOBAL_SKILL_DIR"
cp "$ROOT/cursor-rules/skills/trello-dev-loop/SKILL.md" "$GLOBAL_SKILL_DIR/SKILL.md"

if [ ! -f "$GLOBAL_MCP" ]; then
  cat >"$GLOBAL_MCP" <<EOF
{
  "mcpServers": {
    "trello": {
      "command": "bash",
      "args": ["$START_SCRIPT"],
      "cwd": "$ROOT",
      "env": {}
    }
  }
}
EOF
  echo "Created $GLOBAL_MCP"
else
  node -e "
const fs = require('fs');
const path = process.argv[1];
const root = process.argv[2];
const start = process.argv[3];
const cfg = JSON.parse(fs.readFileSync(path, 'utf8'));
cfg.mcpServers = cfg.mcpServers || {};
cfg.mcpServers.trello = {
  command: 'bash',
  args: [start],
  cwd: root,
  env: {}
};
fs.writeFileSync(path, JSON.stringify(cfg, null, 2) + '\n');
" "$GLOBAL_MCP" "$ROOT" "$START_SCRIPT"
  echo "Updated trello entry in $GLOBAL_MCP"
fi

echo "Synced global skill → $GLOBAL_SKILL_DIR/SKILL.md"
echo "Refresh MCP in Cursor: Settings → MCP → trello → Refresh"
