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
├── bin/start-mcp.sh   # Node discovery + launcher
└── scripts/test-api.js
```

SDK: `@modelcontextprotocol/sdk` ^1.29.0 (stable v1).

## Tools

| Tool | Maps to | Description |
|------|---------|-------------|
| `get_my_cards` | `getMyCards()` | Assigned cards with description, labels, checklists, badges |
| `get_card` | `getCardFull()` | **Complete extraction** — see below |
| `get_card_comments` | `getCardComments()` | All comments (up to 1000) |
| `add_comment` | `addComment()` | Post comment (gated by hook) |
| `update_card` | `updateCard()` | Update name, desc, due |
| `move_card` | `moveCard()` | Move to any list |
| `attach_commit` | `attachUrl()` | Attach commit/PR URL |
| `get_boards` | `getBoards()` | Open boards |
| `get_board_cards` | `getBoardCards()` | All cards on a board (with description) |
| `get_board_lists` | `getBoardLists()` | Resolve list IDs |
| `mark_in_progress` | shortcut | Move to `TRELLO_LIST_IN_PROGRESS` |
| `mark_done` | shortcut | Move to `TRELLO_LIST_DONE` |

## `get_card` — complete extraction

A single `get_card` call fetches the card, then in parallel loads comments, attachments, activity, list, board, and custom field definitions.

| Category | Fields |
|----------|--------|
| Core | `id`, `idShort`, `name`, `desc`, `descData`, URLs |
| Context | `board` (name, url), `list` (name, pos) |
| People | `members`, `membersVoted` |
| Work items | `checklists` (all items + states), `labels`, `customFields` |
| Discussion | `comments` (full thread, up to 1000) |
| Files | `attachments` (name, url, mimeType, size) |
| History | `activity` (updates, members, attachments, checklist changes) |
| Meta | `dates`, `badges`, `cover`, `stickers`, `status`, `location` |

`analyze_ticket` and `implement_ticket` prompts use this full payload automatically.

## Prompts

Built-in MCP prompts shape agent behavior:

- `analyze_ticket` — planning mode, no code
- `implement_ticket` — implementation after approval
- `sync_ticket_after_commit` — Trello sync checklist

## Credentials

`lib/env.js` reads from the **repo root** `.env`:

- `TRELLO_API_KEY` (required)
- `TRELLO_TOKEN` (required)
- `TRELLO_BOARD_ID` (optional)
- `TRELLO_LIST_IN_PROGRESS` (optional)
- `TRELLO_LIST_REVIEW` (optional)
- `TRELLO_LIST_DONE` (optional)

Global MCP config must set `cwd` to the repo root so `.env` is found. Use `./bin/sync-global-cursor.sh`.

## Debugging

From repo root:

```bash
npm run test-api          # API + full extraction smoke test
npm start                 # runs MCP server on stdio
```

From `trello-mcp-server/`:

```bash
npm run test-api
npm start
```

In Cursor: Settings → MCP → **Refresh** `trello` after server code changes.
