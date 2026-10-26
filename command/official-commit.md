---
description: "Create a git commit"
---

# Commit

1. Run `git status`, `git diff HEAD`, `git branch --show-current`, and `git log --oneline -10` to gather context.
2. Review the changes and stage the intended files explicitly. Never use a blind `git add -A`; never stage `.env`, credentials, or generated junk.
3. Write a concise conventional commit message matching the repository style.
4. Create a single commit. Do not push unless the user asked.
5. Report the commit hash and the files included.
