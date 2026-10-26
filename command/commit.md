---
description: Stage the intended changes and create a conventional commit. Never pushes.
---

# /commit

Message hint: $ARGUMENTS

1. Run `git status`, `git diff`, and `git log --oneline -10`. Read them before staging.
2. Identify the intended files. Exclude secrets, local env files, unrelated changes, and generated junk. If anything suspicious is staged, stop and ask.
3. Run the project's typecheck/lint/tests for the touched area. If they fail, report it and do not commit unless the user explicitly wants a WIP commit.
4. Stage only intended files by explicit path. Never `git add -A` blindly.
5. Write a conventional commit message: `type(scope): summary` in the imperative mood, with a short body explaining why. Match the repo's existing style if it differs.
6. Commit. Do not push, amend, rebase, or change git config.
7. Report the commit hash and `git show --stat` summary.
