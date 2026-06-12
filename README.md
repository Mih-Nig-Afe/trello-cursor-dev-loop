# MCP Dev Loop: Trello → Cursor → GitHub

**Human-in-the-loop AI development** — Trello tickets drive analysis, implementation, commits, and board sync in Cursor.

> ❌ **Not autonomous AI** — the agent suggests, you approve, the agent executes.  
> ✅ **Human-in-the-loop** — no surprise commits, pushes, or Trello updates.

Clone this repo, connect Trello via MCP, and run a repeatable dev loop your whole team can use.

## Architecture

```
┌──────────────┐     ┌───────────────────┐     ┌─────────────────┐
│   Trello     │ ──► │ Trello MCP Server │ ──► │  Cursor Agent   │
│  (Tickets)   │     │  (this repo)      │     │ (you control)   │
└──────────────┘     └───────────────────┘     └────────┬────────┘
                                                        │
                        ┌───────────────────────────────┼───────────────────────────────┐
                        ▼                               ▼                               ▼
                 ┌─────────────┐                ┌─────────────┐                ┌─────────────┐
                 │  Codebase   │ ─────────────► │   GitHub    │ ─────────────► │   Trello    │
                 │ Node/React… │    commit/PR   │ commits/PRs │  update/sync   │  comments   │
                 └─────────────┘                └─────────────┘                └─────────────┘
```

## Repo structure

| Path | Purpose |
|------|---------|
| [`trello-mcp-server/`](./trello-mcp-server/) | Core engine — Trello API + MCP tools |
| [`cursor-rules/`](./cursor-rules/) | Agent rules, skill, approval hooks |
| [`workflows/`](./workflows/) | Command system (`analyze ticket`, `implement ticket`, …) |
| [`examples/`](./examples/) | End-to-end session walkthroughs |
| [`docs/`](./docs/) | Setup, MCP, safety model, example prompts |
| [`.cursor/`](./.cursor/) | Ready-to-use Cursor config (MCP + rules + hooks) |

## Quick start

```bash
git clone https://github.com/Mih-Nig-Afe/trello-cursor-dev-loop.git
cd trello-cursor-dev-loop
./bin/install.sh
```

1. Edit `.env` with [Trello API credentials](https://trello.com/power-ups/admin)
2. `npm run test-api` — verify connection
3. Open in **Cursor** → Settings → MCP → confirm `trello` is connected
4. In chat: **`analyze my assigned tasks`**

Full guide: [docs/setup.md](./docs/setup.md)

## Daily workflow

| Step | You say | Agent does |
|------|---------|------------|
| 1. Pull | `analyze my assigned tasks` | Lists your Trello queue |
| 2. Plan | `analyze ticket <id>` | Reads card + comments, outputs **PLAN** (no code) |
| 3. Approve | `proceed` | — |
| 4. Build | `implement ticket <id>` | Edits codebase |
| 5. Commit prep | `prepare commit for ticket <id>` | Shows diff + draft message |
| 6. Commit | `commit this change` | Creates commit (you approve via hook) |
| 7. Sync | `update trello ticket <id>` | Comment + attach commit URL |

Command reference: [workflows/README.md](./workflows/README.md)  
Example sessions: [examples/](./examples/)

## Commands

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

Slash aliases: `/analyze-ticket`, `/implement-ticket`, `/prepare-commit`, `/update-trello`

## Safety (enforced)

| Action | Protection |
|--------|------------|
| `git commit` | Cursor hook → asks your approval |
| `git push` | Hook → asks approval (`main`/`master` extra gate) |
| Trello comment / move | Hook → blocked unless you said `update trello` or `mark done` |
| Agent rules | Analyze phase = no code; commit/sync only on explicit command |

Details: [docs/safety-model.md](./docs/safety-model.md)

## MCP tools

`get_my_cards` · `get_card` (full extraction) · `get_card_comments` · `add_comment` · `move_card` · `attach_commit` · `get_board_cards` · `get_board_lists` · `mark_in_progress` · `mark_done`

`get_card` returns description, all comments, attachments, checklists, custom fields, stickers, activity, and list/board context in one call.

## Use in another project

1. Register MCP globally in `~/.cursor/mcp.json` (point at `trello-mcp-server/bin/start-mcp.sh`)
2. Copy [`cursor-rules/`](./cursor-rules/) into your app's `.cursor/`
3. Keep `.env` in this repo (or set env vars in `mcp.json`)

Guide: [docs/cursor-setup.md](./docs/cursor-setup.md)

## Roadmap

- Auto-task prioritization
- Codebase memory layer
- PR auto-review
- Test runner integration before commit
- Slack/Telegram notifications

## License

MIT — see [LICENSE](./LICENSE)
