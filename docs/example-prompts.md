# Example prompts

Copy-paste these into Cursor chat.

## Morning standup

```
analyze my assigned tasks
```

```
show my trello board
```

## Start a ticket

```
analyze ticket <paste-card-id-here>
```

```
mark in progress
```

## After approving a plan

```
proceed
```

or

```
implement ticket <card-id>
```

## Review iteration

```
fix issue in ticket <card-id> — the validation error message is wrong
```

```
run tests and fix any failures for ticket <card-id>
```

## Shipping

```
prepare commit for ticket <card-id>
```

```
commit this change
```

```
push this branch
```

```
create a PR
```

## Trello sync

```
update trello ticket <card-id>
```

```
update trello ticket <card-id> and mark done
```

## Slash aliases

```
/analyze-ticket abc123
/implement-ticket abc123
/prepare-commit abc123
/update-trello abc123
```

## Tips

- Paste the card ID from Trello (or from `get_my_cards` / `get_board_cards` output).
- `analyze ticket` uses `get_card` full extraction — description, comments, attachments, checklists, and activity in one call.
- Say **proceed** only when the plan looks right.
- Say **update trello** only after you've verified the code and commit.
- After `git pull` in this repo, run `./bin/sync-global-cursor.sh` and Refresh MCP in Cursor.
