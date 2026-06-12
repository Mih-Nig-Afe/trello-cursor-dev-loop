# Example: Implement booking system feature

Feature ticket with checklist items and stakeholder comments.

## Setup

- Card: **"Add room booking API + calendar UI"**
- Checklist: API routes, DB migration, React calendar, tests
- Card ID: `xyz789`

## Session

### 1. Board overview

**You:**
```
show my trello board
```

**Agent:** Groups cards by list (Backlog, In Progress, Review, Done).

### 2. Deep analysis

**You:**
```
analyze ticket xyz789
```

**Agent:** Reads description, checklist, and comments from PM/designer. Outputs plan with file suggestions and risks (e.g. timezone handling).

### 3. Start work

**You:**
```
mark in progress
implement ticket xyz789
```

**Agent:** Moves card (after hook approval), implements in phases, checks off logical chunks in summary.

### 4. Iterate from review

Designer comments on the card: *"Calendar should block past dates."*

**You:**
```
fix issue in ticket xyz789
```

**Agent:** Re-reads card, updates date picker min-date logic.

### 5. Ship

**You:**
```
prepare commit for ticket xyz789
commit this change
```

Create branch + PR separately if you use that flow:
```
create a PR for this branch
```

**You:**
```
update trello ticket xyz789
```

Comment includes commit hash and PR link via `attach_commit`.
