# analyze ticket

**Phase:** Plan (read-only)

## Trigger

```
analyze ticket <cardId>
/analyze-ticket <cardId>
analyze my assigned tasks
```

## What the agent does

1. Call `get_card` — returns **complete extraction**: description, all comments (up to 1000), attachments, checklists, custom fields, stickers, activity history, list/board context.
2. Only call `get_card_comments` separately if you need to refresh comments after a long session.
3. Produce a structured plan — **no file edits**.

## Expected output

```markdown
## Summary
## Requirements
## Open questions
## Implementation plan
1. ...
## Suggested files
## Risks
```

Ends with: **"Approve this plan to implement, or tell me what to change."**

## You say next

- `proceed` or `implement ticket <id>` — start coding
- `change the plan: ...` — refine before implementation
