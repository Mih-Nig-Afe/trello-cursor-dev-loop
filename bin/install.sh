#!/bin/bash
# Quick install for MCP Dev Loop
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ Installing Trello MCP server dependencies..."
if command -v npm >/dev/null 2>&1; then
  npm install --prefix trello-mcp-server
else
  echo "  npm not found — install Node.js, then run: npm run install:mcp"
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "→ Created .env — add your TRELLO_API_KEY and TRELLO_TOKEN"
else
  echo "→ .env already exists"
fi

chmod +x trello-mcp-server/bin/start-mcp.sh
chmod +x .cursor/hooks/*.sh 2>/dev/null || true
chmod +x cursor-rules/hooks/*.sh 2>/dev/null || true

echo ""
echo "Done. Next steps:"
echo "  1. Edit .env with Trello credentials"
echo "  2. npm run test-api"
echo "  3. ./bin/sync-global-cursor.sh  (global MCP + skill)"
echo "  4. Open in Cursor — verify MCP 'trello' is connected"
echo "  5. Chat: analyze my assigned tasks"
echo ""
echo "Docs: docs/setup.md"
