# fix ticket

**Phase:** Review / iterate

## Trigger

```
fix issue in ticket <cardId>
/fix-ticket <cardId>
```

Use after implementation when review feedback lands on the Trello card or in chat.

## What the agent does

1. `get_card` (full extraction) for description, comments, attachments, and activity.
2. Make targeted fixes only.
3. Summarize what changed.
4. Wait for your next instruction.

## You say next

- `prepare commit for ticket <id>`
- `commit this change`
- `update trello ticket <id>`
