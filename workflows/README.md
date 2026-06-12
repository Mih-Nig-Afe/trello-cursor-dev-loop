# Workflows — Command System

Natural-language commands that drive the dev loop. Say these in Cursor chat.

## Daily loop

```
1. analyze my assigned tasks          → pull your Trello queue
2. analyze ticket <cardId>            → read card + comments, output PLAN
3. proceed / implement ticket <id>    → code changes (after you approve plan)
4. prepare commit for ticket <id>     → diff + suggested message
5. commit this change                 → create commit (you approve)
6. update trello ticket <id>          → comment + attach commit + optional move
```

## All commands

| Command | Phase | Agent behavior |
|---------|-------|----------------|
| `analyze my assigned tasks` | Pull | `get_my_cards`, summarize queue |
| `show my trello board` | Pull | `get_board_cards`, group by list |
| `analyze ticket <id>` | Plan | Full card + plan, **no code** |
| `implement ticket <id>` | Build | Edit codebase per approved plan |
| `fix issue in ticket <id>` | Fix | Targeted fix from card feedback |
| `prepare commit for ticket <id>` | Commit prep | `git diff`, draft message |
| `commit this change` | Commit | Commit after your approval |
| `update trello ticket <id>` | Sync | Comment, attach commit URL |
| `mark in progress` | Sync | Move card to In Progress list |
| `mark done` | Sync | Move card to Done list |

## Slash-style aliases

These map to the same flows (use whichever feels natural):

- `/analyze-ticket <id>` → `analyze ticket <id>`
- `/implement-ticket <id>` → `implement ticket <id>`
- `/fix-ticket <id>` → `fix issue in ticket <id>`
- `/prepare-commit <id>` → `prepare commit for ticket <id>`
- `/update-trello <id>` → `update trello ticket <id>`

## Per-command docs

- [analyze-ticket.md](./analyze-ticket.md)
- [implement-ticket.md](./implement-ticket.md)
- [fix-ticket.md](./fix-ticket.md)
- [prepare-commit.md](./prepare-commit.md)
- [update-trello.md](./update-trello.md)
