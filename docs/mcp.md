# How MCP works in this project

[MCP](https://modelcontextprotocol.io) (Model Context Protocol) lets Cursor call external tools. This repo provides a **Trello MCP server** that bridges your board and the AI agent.

## Architecture

```
Trello API  ←→  trello-mcp-server  ←→  Cursor Agent  ←→  Your codebase
                     (stdio)              (chat)
```

The server runs as a child process. Cursor sends tool calls over stdin/stdout. No HTTP port to configure.

## Server location

```
trello-mcp-server/
├── server.js          # MCP tool + prompt definitions
├── lib/
│   ├── trelloClient.js
│   └── env.js         # loads .env from repo root
└── bin/start-mcp.sh   # Node discovery + launcher
```

## Tools

| Tool | Maps to | Description |
|------|---------|-------------|
| `get_my_cards` | `getMyCards()` | Cards assigned to you |
| `get_card` | `getCard()` | Full card + comments + checklists |
| `get_card_comments` | `getCardComments()` | Comment thread |
| `add_comment` | `addComment()` | Post comment (gated by hook) |
| `move_card` | `moveCard()` | Move to any list |
| `attach_commit` | `attachCommit()` | Attach commit/PR URL |
| `get_board_cards` | — | All cards on a board |
| `get_board_lists` | — | Resolve list IDs |
| `mark_in_progress` | — | Shortcut → In Progress list |
| `mark_done` | — | Shortcut → Done list |

## Prompts

Built-in MCP prompts shape agent behavior:

- `analyze_ticket` — planning mode, no code
- `implement_ticket` — implementation after approval
- `sync_ticket_after_commit` — Trello sync checklist

## Credentials

`lib/env.js` reads `TRELLO_API_KEY` and `TRELLO_TOKEN` from the **repo root** `.env`. The MCP process inherits this via the launcher working directory.

## Debugging

```bash
npm run test-api          # direct API test (no Cursor)
npm start                 # runs server.js (stdio — for manual debug)
```

In Cursor: Settings → MCP → refresh `trello` if tools don't appear.
