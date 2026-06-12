# prepare commit

**Phase:** Commit prep

## Trigger

```
prepare commit for ticket <cardId>
/prepare-commit <cardId>
```

## What the agent does

1. `git status` and `git diff`.
2. Draft a commit message tied to the ticket title.
3. Show summary of staged/unstaged changes.
4. **Wait** for explicit `commit this change`.

## Safety

- Hooks prompt you before any `git commit`.
- Agent never commits `.env` or credential files.

## You say next

```
commit this change
```

Or edit the message first: `use this commit message: ...`
