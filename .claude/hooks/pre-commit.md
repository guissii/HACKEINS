# Hook: Pre-commit safety checks

**Purpose:** Before any AI assistant runs `git add` or `git commit`, verify nothing sensitive or generated is about to be committed.

**When this hook applies:**
- Any AI is about to stage files (`git add`, `git add -A`, `git add .`)
- Any AI is about to create a commit
- Any AI is preparing a PR

---

## Files that must NEVER be committed

| Pattern | Why |
|---|---|
| `backend/.env` | Contains the Gemini API key |
| `backend/*.db`, `backend/filaha.db` | Local SQLite database |
| `backend/.venv/` | Python virtualenv |
| `backend/__pycache__/`, `**/__pycache__/` | Python bytecode |
| `backend/.pytest_cache/` | Test runner cache |
| `frontend/node_modules/` | npm dependency tree (huge) |
| `frontend/dist/` | Vite build output |
| `.DS_Store` | macOS Finder metadata |
| Any file containing a real API key, token, or password | Obvious |

These are all listed in the root `.gitignore`. If any of them appear in `git status` as staged, **stop and unstage them.**

---

## Mandatory pre-commit checklist

Run these in order BEFORE issuing `git commit`:

```bash
# 1. See exactly what's staged (no surprises)
git status

# 2. Sanity-check that gitignore is doing its job
git check-ignore backend/.env backend/filaha.db frontend/node_modules frontend/dist
# Each of these should print its path. If any prints nothing, .gitignore is misconfigured.

# 3. Scan staged diff for secrets
git diff --cached | grep -iE "(api[_-]?key|secret|password|bearer|AIza[0-9A-Za-z_-]{35}|sk-[A-Za-z0-9]{20,})"
# Should print nothing. If it prints anything, STOP and inspect.

# 4. Confirm .env is not staged even if you added a path that might contain it
git diff --cached --name-only | grep -E "\.env$"
# Should print nothing.
```

If steps 2–4 surface a problem, unstage with `git restore --staged <path>` and investigate before continuing.

---

## Staging rules

- **Prefer explicit paths** over `git add .` or `git add -A`. Explicit paths force you to think about what's being included.
- **Never** stage entire directories blindly the first time you commit a new feature — check `git status` first
- If a previously-tracked file should now be ignored, **untrack it before adding to .gitignore**: `git rm --cached <path>`

---

## Commit message conventions

This repo uses prefixes:
- `feat:` new user-visible feature
- `fix:` bug fix
- `style:` visual changes, no logic
- `polish:` small UI/UX improvements
- `docs:` documentation only
- `refactor:` internal code restructuring, no behavior change
- `chore:` build, deps, config

Format:
```
<prefix>: <one-line subject in present tense, under 70 chars>

<optional body — what changed and why, wrap at 80 cols>

Co-Authored-By: <if applicable>
```

The subject must read naturally with "If applied, this commit will...".

---

## Push rules

- **Never push to `main` directly.** This is a hackathon project; main is the protected branch.
- Push to `adam` for now. A future `develop` or `dev/<feature>` branch is fine if work parallelizes.
- **Never `--force-push`** unless the user has explicitly asked for it AND the branch is yours alone.
- After push, if a PR is appropriate, open it with `gh pr create` targeting `adam` (or `main` only if explicitly asked).

---

## What to do if you accidentally committed a secret

1. **Do not push** if you haven't already
2. If already pushed: rotate the secret immediately (revoke the Gemini key at https://aistudio.google.com)
3. Remove from history:
   ```bash
   git rm --cached backend/.env
   git commit --amend  # if it's the most recent commit
   # OR for older commits:
   # use git filter-repo or BFG Repo-Cleaner (do not improvise)
   ```
4. Force-push only after rotation, with the user's explicit go-ahead
5. Document the rotation in a follow-up commit message
