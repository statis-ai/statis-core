# Working Preferences

Last updated: 2026-03-13

## Git & Commits

- **Never add Claude as co-author.** No `Co-Authored-By: Claude` lines. User does not want Claude showing as a contributor on GitHub.
- Commit messages: concise imperative subject, bullet body for multi-change commits
- Push to `main` directly (no PR workflow for this repo)
- Always pull --rebase before push if remote has newer commits

## Code Style

- Python: type hints, dataclasses, `from __future__ import annotations`
- No docstrings on methods unless the logic is genuinely non-obvious
- No comments unless the logic isn't self-evident
- No error handling for impossible scenarios — trust internal guarantees
- No backwards-compatibility shims — just change the code
- Stdlib first — avoid adding new runtime dependencies (e.g. urllib over requests/httpx for adapters)

## Response Style

- Short and direct. No preamble, no "Great question!", no summary at the end
- Don't restate what was just done — the diff speaks for itself
- Use markdown links with line numbers when referencing specific code locations
- No emojis unless explicitly asked

## Workflow

- Run tests before committing when writing new code
- Always update `STATUS.md` when anything ships
- Read existing code before suggesting modifications
- Prefer editing existing files to creating new ones
- Don't add features beyond what was asked

## Testing

- Unit tests use in-process fake HTTP servers (stdlib `http.server`) — no httpretty, no external mocking libs
- Integration tests use `testcontainers[postgres]`
- Python SDK tests use `respx` mocks
- TypeScript tests use Node built-in `node:test` runner

## Publishing

- PyPI: use `python3 -m build` then `twine upload` with `TWINE_USERNAME=__token__` and token as env var
- npm: use `npm publish` with `--//registry.npmjs.org/:_authToken=<token>` — requires 2FA bypass granular token
