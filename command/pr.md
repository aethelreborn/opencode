---
description: Create a pull request with a clear summary and verification evidence. Requires gh auth.
---

# /pr

Context: $ARGUMENTS

1. Check `gh auth status`. If not authenticated, stop and tell the user to run `gh auth login`.
2. Inspect the branch: `git status`, `git log <base>...HEAD`, `git diff <base>...HEAD`. Determine the base branch from the remote default, not by assumption.
3. Ensure the branch is pushed. Push only if the user asked for a PR and the branch is not yet on the remote.
4. Run the verification loop on the changes. Do not create the PR if checks fail; report instead.
5. Create the PR with `gh pr create`:
   - title: conventional, under 70 chars
   - body: summary, motivation, changes, verification commands/results, risks, screenshots for UI changes
6. Return the PR URL.

Never force-push, never merge, never mark ready for review without being asked.
