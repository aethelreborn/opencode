---
description: Turn a vague request into a verifiable spec with acceptance criteria, non-goals, and a task graph before any code is written.
---

# /spec

Request: $ARGUMENTS

Load the `spec-driven-delivery` skill.

1. Restate the intent in one paragraph, in user terms.
2. Write acceptance criteria as observable checks (command, assertion, status code, DOM state). One behaviour per criterion.
3. List non-goals with the reason each is out of scope.
4. Identify the seams: files/modules to touch, data changes, public interface changes, failure modes.
5. Produce a 4-7 step task graph where every step leaves the tree green and has a verification command.
6. Name the top risk and the cheapest way to test it.

Do not write implementation code for this command. Stop after the spec and ask for approval only if a requirement is genuinely the user's decision (pricing, brand, legal, irreversible actions). Otherwise present the spec and state that implementation is ready to start.
