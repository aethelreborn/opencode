---
name: codebase-recon
description: Use when entering an unfamiliar repository, before editing code you have not read, or when asked "how does this work", "where is X", or to onboard onto a project. Maps architecture, entry points, conventions, and real build/test commands from evidence instead of guesses.
---

# Codebase Recon

Do not edit a repository until you can answer: what runs, where it starts, how it is built, how it is tested, and what conventions it enforces. Recon is read-only and produces a map, not changes.

## Phase 1 — Inventory (no guessing)

```bash
ls -la
git log --oneline -15
git status --short
```

Find the manifests, then read them:

```bash
rg --files -g '{package.json,pnpm-workspace.yaml,turbo.json,nx.json,pyproject.toml,requirements*.txt,go.mod,Cargo.toml,pom.xml,build.gradle*,Gemfile,composer.json,Makefile,justfile,Dockerfile,docker-compose*.yml,flake.nix}' -g '!node_modules'
```

Extract the facts that matter:

```bash
jq '{name,packageManager,engines,workspaces,scripts,dependencies,devDependencies}' package.json
rg -n '^\[(project|tool\.poetry|tool\.pytest|tool\.ruff)' pyproject.toml
head -40 go.mod
```

Record the exact commands the project itself uses. Prefer manifest scripts over your own guesses: `npm run build`, not `npx tsc` unless the manifest says so. If a `Makefile` or `justfile` exists, treat its targets as the source of truth.

## Phase 2 — Shape the system

```bash
# entry points and top-level structure
ls -1 src app packages services cmd internal 2>/dev/null
rg -n '^(func main\(|if __name__ == .__main__.|export default|createRoot|new Hono|FastAPI\(|express\(\))' -g '!node_modules' -g '!dist'

# where HTTP surface lives
rg -n '(app\.(get|post|put|patch|delete)\(|router\.(get|post)|@(app|router)\.(get|post)|@(Get|Post)Mapping)' -g '!node_modules'

# data layer
rg -n 'CREATE TABLE|ALTER TABLE|prisma|drizzle|sqlalchemy|gorm|mongoose|sequelize|knex' -g '!node_modules' -g '!*.lock'

# config and environment contract
rg -n 'process\.env\.|os\.environ|os\.Getenv|env::var|System\.getenv' -g '!node_modules' | head -40
```

Then answer in writing (in the working notes, not the chat): request flow for the main path, the 5 files with the highest change frequency, the module boundary you are least sure about.

## Phase 3 — Conventions the repo enforces

```bash
ls -1 .github/workflows 2>/dev/null && rg -n 'run:' .github/workflows | head -30
cat .editorconfig 2>/dev/null
jq '{scripts,lintStaged,devDependencies}' package.json | head -60
ls -1 .eslintrc* eslint.config.* .prettierrc* ruff.toml .golangci.yml rustfmt.toml 2>/dev/null
```

CI is the contract. Whatever CI runs is what "done" means here. Quote the exact job steps when reporting.

Conventions to note explicitly:

- naming: files, symbols, tests
- error handling: thrown vs returned, error type, boundary translation
- state and data access: where side effects are allowed
- test layout: colocated vs `tests/`, fixtures, factories, mocks
- commit style: `git log -20 --pretty=%s`

## Phase 4 — Risk map

List, with evidence:

1. Hot spots: `git log --since='90 days' --name-only --pretty=format: | sort | uniq -c | sort -rn | head -20`
2. Churn × size: files both large and frequently changed are the danger zone.
3. Missing tests on the path you are about to touch (`rg --files -g '*test*' | head`).
4. Generated files and vendored code you must not edit.
5. Anything destructive on startup (migrations, seeders, cache flushes).

## Output contract

Return a recon brief with these headings, each bullet backed by a command result:

```
Stack:        language + runtime + framework versions (with where you saw them)
Entry points: file:line
Data layer:   driver, schema location, migration tool
Commands:     install / dev / build / typecheck / lint / test / e2e  (copy-pasteable)
Conventions:  3-5 rules the code enforces
Hot spots:    files, with churn counts
Risks:        what will bite an editor here
Unknowns:     what you could not verify
```

## Anti-patterns

- Editing before knowing the test command.
- Inferring the framework from a dependency instead of from the boot file.
- Running the dev server as recon when reading four files answers the question.
- Reporting "looks like a standard Next.js app" instead of naming the router, data layer, and test runner you found.
