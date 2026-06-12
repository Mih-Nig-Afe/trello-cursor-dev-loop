# Connect Cursor

Three pieces work together: **MCP server**, **rules/skill**, and **hooks**.

## 1. MCP server

See [setup.md](./setup.md). The `trello` server must show as connected in Cursor Settings → MCP.

Project template: [.cursor/mcp.json](../.cursor/mcp.json)

## 2. Rules and skill

| Component | Location | Effect |
|-----------|----------|--------|
| Safety rule | `.cursor/rules/ai-dev-agent.mdc` | Always-on: no commit/push/Trello writes without approval |
| Workflow skill | `.cursor/skills/trello-dev-loop/SKILL.md` | Command → action mapping |

Canonical copies live in [cursor-rules/](../cursor-rules/). Sync when you customize.

**Global skill** (optional — works in any workspace):

```bash
mkdir -p ~/.cursor/skills/trello-dev-loop
cp cursor-rules/skills/trello-dev-loop/SKILL.md ~/.cursor/skills/trello-dev-loop/
```

## 3. Approval hooks

[.cursor/hooks.json](../.cursor/hooks.json) registers:

- `guard-git.sh` — prompts before `git commit` / `git push`
- `guard-trello.sh` — prompts before Trello writes unless you said `update trello`

Requires `jq`. Hooks run automatically when this repo (or your copied config) is the workspace.

## 4. First chat

```
analyze my assigned tasks
```

If the agent uses `get_my_cards`, MCP is wired correctly.

## 5. Open another project

| Piece | Where it lives |
|-------|----------------|
| MCP server + `.env` | This repo (global `mcp.json` path) |
| Rules + hooks | Copy `cursor-rules/` → your app's `.cursor/` |
| Code | Your app repo |

Open your app in Cursor. Trello tools work globally; rules apply per workspace.
