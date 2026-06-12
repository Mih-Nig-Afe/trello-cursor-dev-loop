# Setup

Get **MCP Dev Loop: Trello → Cursor → GitHub** running in under 10 minutes.

## Prerequisites

- [Cursor](https://cursor.com) (with MCP support)
- Node.js 18+
- Trello account
- `jq` (for approval hooks): `brew install jq`

## 1. Clone

```bash
git clone https://github.com/Mih-Nig-Afe/trello-cursor-dev-loop.git
cd trello-cursor-dev-loop
```

## 2. Trello credentials

1. Open [Trello Power-Ups Admin](https://trello.com/power-ups/admin)
2. Create or select a Power-Up → **API Key**
3. Generate a **Token** (read + write scope for your boards)

```bash
cp .env.example .env
# Edit .env — set TRELLO_API_KEY and TRELLO_TOKEN
```

## 3. Install MCP server

```bash
npm run install:mcp
npm run test-api
```

You should see your Trello username and assigned cards.

## 4. Register MCP in Cursor

**Project-local** (open this repo as workspace):

Edit `.cursor/mcp.json` — the path is already relative to this repo.

**Global** (Trello in every project):

```bash
./bin/sync-global-cursor.sh
```

This updates `~/.cursor/mcp.json` (trello server + `cwd` for `.env`) and copies the latest skill to `~/.cursor/skills/trello-dev-loop/`.

Or manually add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "trello": {
      "command": "bash",
      "args": ["/absolute/path/to/trello-cursor-dev-loop/trello-mcp-server/bin/start-mcp.sh"],
      "cwd": "/absolute/path/to/trello-cursor-dev-loop",
      "env": {}
    }
  }
}
```

Keep `.env` in the repo root (credentials load from there).

## 5. Optional list shortcuts

In Cursor chat, ask the agent to run `get_board_lists` for your board, then add to `.env`:

```env
TRELLO_BOARD_ID=...
TRELLO_LIST_IN_PROGRESS=...
TRELLO_LIST_REVIEW=...
TRELLO_LIST_DONE=...
```

Enables `mark in progress` and `mark done` shortcuts.

## 6. Verify in Cursor

1. Cursor Settings → **MCP** → `trello` should show connected (green)
2. In chat: `analyze my assigned tasks`

## Use in another codebase

1. Register MCP globally (step 4)
2. Copy [cursor-rules](../cursor-rules/) into your app's `.cursor/` — see [cursor-rules/README.md](../cursor-rules/README.md)
3. Open your app repo in Cursor
4. Run the same workflow commands against your Trello cards

Your app code lives in your repo; Trello MCP + rules come from this toolkit.
