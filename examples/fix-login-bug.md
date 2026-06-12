# Example: Fix login bug from Trello card

End-to-end walkthrough for a bug-fix ticket.

## Setup

- Card in Trello: **"Login fails with expired token"**
- Card ID: `abc123def456` (use your real ID from `get_my_cards`)
- Your app repo open in Cursor with MCP Dev Loop configured

## Session

### 1. Pull and analyze

**You:**
```
analyze my assigned tasks
```

**Agent:** Lists your cards. You pick one.

**You:**
```
analyze ticket abc123def456
```

**Agent:**
```markdown
## Summary
Users see a blank screen when JWT expires instead of a redirect to login.

## Requirements
- Detect expired token in auth middleware
- Return 401 with clear error
- Frontend: redirect to /login on 401

## Implementation plan
1. Update `auth/middleware.ts` — validate exp claim
2. Add API error handler for 401
3. Update `api/client.ts` interceptor

Approve this plan to implement, or tell me what to change.
```

### 2. Approve and implement

**You:**
```
proceed
```

**Agent:** Edits files, runs tests, summarizes changes.

### 3. Commit

**You:**
```
prepare commit for ticket abc123def456
```

**Agent:** Shows diff, proposes:
```
fix(auth): redirect to login on expired token

Fixes login blank screen when JWT expires.
Trello: Login fails with expired token
```

**You:**
```
commit this change
```

Hook prompts for approval → you approve.

### 4. Sync Trello

**You:**
```
update trello ticket abc123def456
```

**Agent:** Adds comment `Implemented in commit a1b2c3d`, attaches GitHub URL.

**You (optional):**
```
mark done
```

Card moves to Done list.
