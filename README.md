# Trello ↔ Cursor Dev Loop

Human-in-the-loop AI development: Trello tickets drive analysis, implementation, commits, and board sync in Cursor.

## What's included

| Path | Purpose |
|------|---------|
| `server.js` | Trello MCP server |
| `lib/` | Trello API client + env loader |
| `.cursor/mcp.json` | Cursor MCP registration |
| `.cursor/skills/trello-dev-loop/` | Agent workflow skill |
| `.cursor/rules/ai-dev-agent.mdc` | Always-on safety rules |
| `.cursor/hooks/` | Git + Trello approval hooks |

## Quick start

1. Clone this repo and open it in Cursor (or symlink `.cursor/` into another project).
2. Copy credentials:

```bash
cp .env.example .env
# Edit .env with your Trello API key and token
```

Get credentials at [Trello Power-Ups Admin](https://trello.com/power-ups/admin).

3. Install and verify:

```bash
npm install
npm run test-api
```

4. **Restart Cursor** to load the `trello` MCP server.
5. Optional: set list IDs in `.env` after running the `get_board_lists` tool.

Requires **Node.js 18+** on your PATH (or point `command` in `.cursor/mcp.json` to your node binary).

## Architecture

```
Trello Ticket → analyze → approve plan → implement → review → commit → update Trello
                     ↑                              ↑         ↑            ↑
                  YOU approve                   YOU review  YOU commit   YOU say so
```

## Commands in Cursor

```
analyze my assigned tasks
analyze ticket <cardId>
implement ticket <cardId>
fix issue in ticket <cardId>
prepare commit for ticket <cardId>
commit this change
update trello ticket <cardId>
mark in progress
mark done
```

## Safety (enforced)

| Action | Rule |
|--------|------|
| `git commit` | Hook asks approval; agent waits for "commit" |
| `git push` | Hook asks approval |
| push to `main` | Extra gate |
| Trello move/comment | Hook asks unless you said "update trello" / "mark done" |

## Use in another project

Open this repo as your Cursor workspace when working the Trello loop, **or** copy `.cursor/` into your app repo and keep this repo cloned elsewhere with MCP pointed at `server.js` via absolute path in `mcp.json`.

## MCP tools

`get_my_cards`, `get_card`, `get_card_comments`, `add_comment`, `update_card`, `move_card`, `attach_commit`, `get_boards`, `get_board_lists`, `mark_in_progress`, `mark_done`

## License

MIT
