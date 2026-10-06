# AGENTS.md — Agent Instructions for repo-counts

Always-loaded (`CLAUDE.md` imports it). It tells you **what to do when, and what to read first** —
there is nothing to invoke; match the request to a row in the routing table below and follow that
path.

## What this is

**repo-counts** — a zero-config CLI that counts lines of code in local git repositories, now or over
time, and writes JSON, CSV, or a self-contained HTML bar chart. Published to npm (`npx repo-counts`).
Its purpose is **meaningful information about how a repository grows**, and **git does the
computing** — JavaScript only aggregates and formats
([development.md § git first](docs/standards/development.md#git-first)). Product:
[domain/README.md](docs/domain/README.md). Stack: **Node (ESM `.mjs`) · commander · git via
child_process · mocha · ESLint 7**. It's a **live package** — every merge to `master` ships with the
next release.

## Working style

- Short, concise, direct. Cut filler; don't sugar-coat.
- **Vet every request against industry standards, security, and common sense; push back hard when it
  fails.** The owner relies on this — it's the job, not a courtesy. When a request is wrong, unsafe, or
  has a clearly better option, **lead with the objection, the evidence, and the better option, then
  wait**. "Don't build this" is a valid outcome. Bluntness must be earned by evidence, not opinion. If
  it passes, proceed.
- **Decide vs. ask — by reversibility × blast radius.** Don't stop on every unknown. **Reversible,
  low-blast** (naming, a local refactor): pick the sensible default, act, note it. **Always ask** when
  it's **irreversible or high-blast** — deleting or overwriting user data, anything **leaving the
  machine** (push, publish, release), a change to the output format users depend on.
- **Trust these instructions.** When a detail is missing, search **narrowly** for that one thing —
  don't re-explore the repo. The "Read first" column is the whole reading list for a path.
- **Ask with options.** When you do stop, offer multiple choice with your recommendation first, and
  record the answer where the work lives — not only in chat.
- After git actions, report the result in **one line** — no summaries or next-step suggestions unless
  asked.
- **Durable rules live in the repo, not memory.** A convention that must hold across sessions belongs
  in tracked markdown, never only in agent memory.

## What to do when

Match the request to the **first row that fits**, then follow that path in
[workflow.md](docs/workflow.md). When two rows fit, **take the heavier one**.

| The request is…                                                         | Path                                                                                                   | Read first                                                                                       |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **A question** — "how does X work", "where is Y"                        | Answer it. No branch, no commit.                                                                       | only the files in question                                                                       |
| **An unproven idea** — "can we…", "would it work if…"                   | [**Investigate**](docs/workflow.md#investigate) — de-risk, give a verdict, **don't build**             | [domain/README.md](docs/domain/README.md)                                                        |
| **A trivial edit** — wording, a config value; no code, no judgment      | [**Direct**](docs/workflow.md#direct) — edit → gate → commit to `master`                               | just the file                                                                                    |
| **A bug**                                                               | [**Fix**](docs/workflow.md#fix) — reproduce with a failing test **run red**, then fix, same commit     | [qa.md](docs/standards/qa.md#tests-are-part-of-the-change) + the code at fault                   |
| **A bounded change** — one behavior, a module or two                    | [**Bounded**](docs/workflow.md#bounded) — pin the edges → branch → build → verify → close out          | [development.md](docs/standards/development.md) + the source it touches                         |
| **A real feature** — new output format or data shape, several modules  | [**Feature**](docs/workflow.md#feature) — spec → plan → build → review → reconcile → close out         | [architecture.md](docs/standards/architecture.md) + [development.md](docs/standards/development.md) + [domain](docs/domain/README.md) |
| **"Review this" / "is this safe"**                                      | [**Review pass**](docs/workflow.md#the-review-pass) — findings only; don't fix unless asked            | [security.md](docs/standards/security.md) + [qa.md](docs/standards/qa.md)                        |
| **Docs drifted**, or you just changed code                              | [**Sync**](docs/workflow.md#sync) — the doc-sync map decides which docs                                | [development.md § keeping docs in sync](docs/standards/development.md#keeping-docs-in-sync)      |
| **A release** — "publish", "cut 0.x.y", "deploy to npm"                 | **Owner-only.** Hand over the runbook step for step; never run `npm version` / `npm publish` yourself | [development.md § Releasing](docs/standards/development.md#releasing)                            |

**Conditional reads, on every path:** touch `src/Repo.mjs`, HTML output, or `src/Fs.mjs` →
[security.md](docs/standards/security.md); touch the chart's look → [styling.md](docs/standards/styling.md).

**Before you verify anything, read [qa.md](docs/standards/qa.md).** It's the testing source of truth —
the tiers, test-by-scope, and the masking traps that make a check pass without exercising anything.

## Always, whatever the path

- **The gate is green before every commit** — `npm run ci`. Never leave the tree broken.
- **Tests ship with the logic** — same commit. Scope: [qa.md](docs/standards/qa.md#tests-are-part-of-the-change).
- **Docs ship with the change** — same commit; which docs: the
  [doc-sync map](docs/standards/development.md#keeping-docs-in-sync).
- **Claims trace to evidence.** A green gate alone is not "verified". Say what you ran and what it
  showed; say plainly what is still owed. **Flag it owed, never fake it.**
- **Untrusted repo data never reaches a shell or unescaped HTML**, and **`--dry` writes nothing** —
  [security.md](docs/standards/security.md#rules).
- **Docs you author obey the doc bar** — short, blunt, **pointer-first**, current behavior only; link
  the doc that owns a rule instead of restating it. This file stays **≤ 175 lines** and stays a
  router; each standards doc stays **≤ 350**.

## Commands

The gate is `npm run ci` (lint · unit tests); CI also smoke-runs the CLI and checks the package
contents. `npm run verify` auto-fixes then runs the gate. Run the tool with
`node bin/cli.js -r . -o <temp dir>`. Full table:
[development.md](docs/standards/development.md#full-command-reference).

## Git

**One branch per unit of work**, cut from `master` before the first commit of a **Bounded** or
**Feature** path; **Direct** and **Sync** commit straight to `master`. Commit often with plain git,
push once at close-out, open a lean PR, merge on green CI. Mechanics:
[workflow.md § Committing](docs/workflow.md#committing).

## Environment

No env vars and no secrets — the CLI reads local repos only. Node version: `.nvmrc`, enforced for
development by `devEngines`. Owner-owed steps: [owner-tasks.md](docs/owner-tasks.md).

## Gotchas

- **Shell:** run git and npm through **Bash**, not PowerShell 5.1 (it wraps native stderr as error
  records and reports false failures).
- **`--chronicle` needs full history.** On a shallow clone it crashes in `Repo.mjs`;
  `git fetch --unshallow` first. CI checks out with `fetch-depth: 0`.
- **`Repo.command` swallows git failures** and returns `''` — a parse crash downstream usually means
  a failed git command upstream.
- **The CLI writes to `.repo-counts/` in the cwd by default** — always pass `-o` to a temp dir.
- **`--chronicle --detail` is O(commits × files)** — never in a quick verification loop.
- **`npm version` publishes** (via `postversion`). Releases are the owner's.
- **New top-level files ship to npm** unless listed in `.npmignore` — check `npm pack --dry-run`.
- More traps: [qa.md § masking traps](docs/standards/qa.md#masking-traps).
