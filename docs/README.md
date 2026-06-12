# Documentation

| Doc | Description |
|-----|-------------|
| [setup.md](./setup.md) | **Start here** — install, credentials, MCP, verify |
| [cursor-setup.md](./cursor-setup.md) | Rules, skills, hooks, multi-project use |
| [mcp.md](./mcp.md) | How the Trello MCP server works + full extraction |
| [safety-model.md](./safety-model.md) | Human-in-the-loop design and enforcement |
| [example-prompts.md](./example-prompts.md) | Copy-paste chat prompts |

## Also in this repo

| Path | Description |
|------|-------------|
| [workflows/](../workflows/README.md) | Command system (`analyze ticket`, `implement ticket`, …) |
| [examples/](../examples/README.md) | End-to-end session walkthroughs |
| [cursor-rules/](../cursor-rules/README.md) | Agent rules, skill, hooks (copy into projects) |
| [trello-mcp-server/](../trello-mcp-server/README.md) | MCP server API reference |

## Helper scripts

| Script | Purpose |
|--------|---------|
| `bin/install.sh` | One-shot install (deps + `.env`) |
| `bin/sync-global-cursor.sh` | Update global MCP + skill after pull |
