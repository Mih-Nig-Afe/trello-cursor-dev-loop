#!/bin/bash
# Reliable MCP launcher — finds Node (system or Cursor-bundled) and starts the server.
set -euo pipefail

SERVER_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SERVER_ROOT"

NODE=""
if command -v node >/dev/null 2>&1; then
  NODE="$(command -v node)"
else
  for candidate in "$HOME"/.local/share/cursor-agent/versions/*/node \
    /opt/homebrew/bin/node /usr/local/bin/node; do
    if [ -x "$candidate" ]; then
      NODE="$candidate"
      break
    fi
  done
fi

if [ -z "$NODE" ]; then
  echo "Node.js not found. Install via: brew install node" >&2
  exit 1
fi

exec "$NODE" "$SERVER_ROOT/server.js"
