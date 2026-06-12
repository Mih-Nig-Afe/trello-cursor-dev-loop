# Trello MCP Server

Core engine for **MCP Dev Loop**. Exposes Trello as MCP tools for Cursor.

## API surface

Client methods in `lib/trelloClient.js`:

| Method | MCP tool |
|--------|----------|
| `getMyCards()` | `get_my_cards` |
| `getCardFull(cardId)` | `get_card` |
| `getCardComments(cardId)` | `get_card_comments` |
| `addComment(cardId, text)` | `add_comment` |
| `moveCard(cardId, listId)` | `move_card` |
| `attachUrl(cardId, url)` | `attach_commit` |

Plus board helpers: `get_boards`, `get_board_lists`, `get_board_cards`, `mark_in_progress`, `mark_done`.

### `getCardFull` pulls everything

One API round-trip fetches the card, then in parallel: all comments, attachments, activity, list, board, and custom field definitions. Returned shape includes description, checklists, labels, members, stickers, dates, badges, and full comment/attachment history.

## Run locally

From repo root (`.env` must exist):

```bash
npm run install:mcp
npm run test-api
```

## Cursor registration

```json
{
  "mcpServers": {
    "trello": {
      "command": "bash",
      "args": ["/absolute/path/to/trello-mcp-server/bin/start-mcp.sh"]
    }
  }
}
```

## Environment

Loaded from repo root `.env`:

- `TRELLO_API_KEY` (required)
- `TRELLO_TOKEN` (required)
- `TRELLO_BOARD_ID` (optional)
- `TRELLO_LIST_IN_PROGRESS` (optional)
- `TRELLO_LIST_DONE` (optional)
