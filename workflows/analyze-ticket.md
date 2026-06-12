# analyze ticket

**Phase:** Plan (read-only)

## Trigger

```
analyze ticket <cardId>
/analyze-ticket <cardId>
analyze my assigned tasks
```

## What the agent does

1. Call `get_card` (includes description, checklists, recent comments).
2. Optionally `get_card_comments` if more history is needed.
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
