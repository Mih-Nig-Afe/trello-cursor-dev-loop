# update trello

**Phase:** Sync

## Trigger

```
update trello ticket <cardId>
/update-trello <cardId>
mark in progress
mark done
```

## What the agent does

1. `add_comment` — e.g. `Implemented in commit abc1234`
2. `attach_commit` — GitHub commit or PR URL (if available)
3. `mark_in_progress` or `mark_done` — only if you asked

## Safety

Trello write hooks block `add_comment`, `move_card`, and `attach_commit` unless your prompt includes phrases like `update trello` or `mark done`.

## Typical sequence

```
prepare commit for ticket abc123
commit this change
update trello ticket abc123
```

Optional: `mark done` moves the card to `TRELLO_LIST_DONE`.
