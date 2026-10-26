---
description: Save a named checkpoint of the current work (diff + status + HEAD tag) without disturbing the working tree.
---

# /checkpoint

Label: $ARGUMENTS (default: current timestamp)

1. Verify this is a git repo with `git rev-parse --verify HEAD`. If not, say so and stop.
2. Create `.opencode/checkpoints/` in the repo (git-ignored if possible).
3. Save, without changing the working tree:
   - `git status --short` and the current branch/HEAD
   - `git diff` and `git diff --cached` to a `.patch` file
   - a short `meta.json` with label, timestamp, branch, HEAD
4. Create a lightweight tag `checkpoint/<timestamp>-<slug>` at HEAD **only** if the user asked for a restorable point; tags are safe, commits are not.
5. Report the checkpoint path and how to restore (`git apply <patch>`).

Never `git stash`, commit, reset, or checkout as part of this command.
