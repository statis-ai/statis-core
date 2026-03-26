---
name: simplify
description: "Review changed code for reuse, quality, and efficiency, then fix any issues found."
---
# Simplify

Use after implementing any feature or fixing a bug to review changed code for:
- Unnecessary abstraction or over-engineering
- Code that can be replaced with existing utilities
- Dead code or unused imports
- Overly complex logic that can be simplified

## When to use in Statis Core

- After adding new API routes in `api/app/api/routes/`
- After adding new React pages in `console/src/app/`
- After any refactor that touches multiple files
- Before committing a large diff

## Trigger

```
/simplify
```
