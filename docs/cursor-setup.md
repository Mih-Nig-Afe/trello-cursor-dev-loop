# Connect Cursor

Three pieces work together: **MCP server**, **rules/skill**, and **hooks**.

## 1. MCP server

See [setup.md](./setup.md). The `trello` server must show as connected in Cursor Settings → MCP.

| Scope | Config file | How to set up |
|-------|-------------|---------------|
| This repo only | [.cursor/mcp.json](../.cursor/mcp.json) | Preconfigured — open repo in Cursor |
| Every project | `~/.cursor/mcp.json` | Run `./bin/sync-global-cursor.sh` |

After any MCP server update: **Settings → MCP → trello → Refresh**.

## 2. Rules and skill

| Component | Location | Effect |
|-----------|----------|--------|
| Safety rule | `.cursor/rules/ai-dev-agent.mdc` | Always-on: no commit/push/Trello writes without approval |
| Workflow skill | `.cursor/skills/trello-dev-loop/SKILL.md` | Command → action mapping |

Canonical copies live in [cursor-rules/](../cursor-rules/). Sync when you customize.

**Global skill** (works in any workspace):

```bash
./bin/sync-global-cursor.sh
```

Or manually:

```bash
mkdir -p ~/.cursor/skills/trello-dev-loop
cp cursor-rules/skills/trello-dev-loop/SKILL.md ~/.cursor/skills/trello-dev-loop/
```

## 3. Approval hooks

[.cursor/hooks.json](../.cursor/hooks.json) registers:

- `guard-git.sh` — prompts before `git commit` / `git push`
- `guard-trello.sh` — prompts before Trello writes unless you said `update trello`

Requires `jq`. Hooks run when this repo (or your copied `cursor-rules/`) is the active workspace.

## 4. First chat

```
analyze my assigned tasks
```

If the agent calls `get_my_cards`, MCP is wired correctly.

For full ticket context in one call:

```
analyze ticket <cardId>
```

`get_card` returns complete extraction: description, all comments, attachments, checklists, custom fields, stickers, activity, and list/board context.

## 5. Open another project

| Piece | Where it lives |
|-------|----------------|
| MCP server + `.env` | This repo (`sync-global-cursor.sh` → `~/.cursor/mcp.json`) |
| Global skill | `~/.cursor/skills/trello-dev-loop/` (via sync script) |
| Rules + hooks | Copy `cursor-rules/` → your app's `.cursor/` |
| Code | Your app repo |

Open your app in Cursor. Trello tools work globally; rules and hooks apply per workspace.

## 6. Stay up to date

After `git pull` in this repo:

```bash
./bin/sync-global-cursor.sh
npm run install:mcp    # if package.json changed
```

Then refresh MCP in Cursor Settings.
