# Development Guide

Coding conventions, commands, and dev tooling. [AGENTS.md](../../AGENTS.md) holds the high-level
rules; [architecture.md](architecture.md) owns the layering, data flow, and source layout;
[security.md](security.md) owns the security posture. Read this before writing code for **how to
write it here**.

## Git first

The product rule every change is judged against
([domain/README.md](../domain/README.md#the-product)):

- **Compute with git.** Line counts, file lists, binary detection, exclusions and snapshot choice come
  from git — diffs and `--numstat`, pathspecs, `.gitattributes`, `rev-list --before` /
  `--first-parent`, `--date=format:`. JavaScript only aggregates git's output and formats it.
- **Re-implementing something git already does is a review finding** — a JS line counter, a binary
  sniffer or extension list, date bucketing from raw timestamps, walking history to pick a commit.
- **Prefer the git call whose cost follows what changed** (a diff between snapshots) over one that
  re-reads the whole tree per data point.
- **Data reaches git as arguments, never as a shell string** ([security.md](security.md#rules)).

## Conventions

Follow what is already there rather than modernising:

- **Style** is `eslint-config-qb` with the opt-outs in `.eslintrc.cjs`: single quotes, 2-space
  indent, semicolons, a blank line before `return`, **LF line endings** (`.gitattributes` enforces).
- **Imports** sorted by `simple-import-sort`: packages, blank line, local `./` imports.
- **ESM throughout** — `.mjs` sources, `"type": "module"`; `.cjs` only for the eslint config.
- **Small top-level arrow helpers** (`const trim = …`) over inline callbacks; the code leans
  functional and dense.
- **Classes are default exports**, one per file, PascalCase filename; everything else camelCase.
- **Suppress a rule inline** with `// eslint-disable-line <rule>` where the code already does; don't
  reformat code to satisfy a rule that is off.
- **Keep files small:** split a growing module into focused files rather than extending one.
- **Layer, don't leak:** git only in `Repo`, markup only in `Chart`, writes only through `Fs`
  ([architecture.md](architecture.md#modules)).
- **Derive a helper from a real example, never ahead of one.** A shared helper is written after the
  first one or two hand-built instances exist, and shaped from them.
- **`TODO` comments are the owner's backlog** — leave them unless you're resolving one. The readme's
  numbered TODO list is the roadmap of record.
- **`isBinary` in `src/Repo.mjs` is inverted** (true for _non_-binary files); call sites rely on it.
  Don't rename one end without the other.

## Adding a feature

1. A new option → `src/index.mjs` (commander), passed through `config`.
2. Gathering → a method in `src/Repo.mjs`, git args as an array ([security.md](security.md#rules)).
3. A new output shape → a `Converter` static method per mode × format; markup only via `Chart`.
4. Writes → an `Fs` method that honours `this.dry`.
5. Prefer the existing stack — avoid new runtime dependencies; every one ships to users.

**Copy from** — pointers to real files, not prose:

| Building…                 | Copy the pattern from                          |
| ------------------------- | ---------------------------------------------- |
| CLI option                | `src/index.mjs`                                |
| Git query + parse         | `Repo.getCommitList` in `src/Repo.mjs`         |
| Mode × format conversion  | `Converter.chronicleSimpleCsv` / `…Html`       |
| Chart element             | `Chart.getLegend` in `src/Chart.mjs`           |
| Disk write                | `Fs.writeOutput` / `Fs.copyStyles`             |
| Unit test with fake deps  | `spec/db.spec.mjs`                             |
| Test against a temp dir   | `spec/fs.spec.mjs`                             |
| Table-driven test         | `spec/chart.spec.mjs`                          |

## Keeping docs in sync

- **Durable docs** — AGENTS.md, readme.md, everything under `docs/` — describe the **current** state
  and must never contradict the code.
- **Working notes** — `docs/plan.md` for an in-flight feature — are deleted at close-out.

Per commit, update the durable docs the change affects (map below); a feature close-out runs one
repo-wide reconcile as the backstop.

| Change                                  | Sync these durable docs                                              |
| --------------------------------------- | -------------------------------------------------------------------- |
| Module, data flow, or output shape      | `architecture.md`; this guide (Copy-from)                            |
| Git invocation / HTML output / writes   | `security.md` (rules, open issues); `qa.md` traps if a new one bit   |
| CLI option added / changed / removed    | readme.md (usage); `architecture.md` if a mode changed               |
| New / renamed / removed script          | this guide (command reference); AGENTS.md (Commands)                 |
| Chart look or palette                   | `styling.md`                                                         |
| Product behavior / scope                | `domain/README.md` (incl. scenarios); readme.md if user-facing       |
| Working method / process                | AGENTS.md (routing table); `docs/workflow.md`                        |
| QA / testing process                    | `qa.md`                                                              |
| New top-level file                      | `.npmignore`, or it ships to npm                                     |

## Full command reference

| Command                 | Purpose                                                                 |
| ----------------------- | ----------------------------------------------------------------------- |
| `npm ci`                | Install exactly the lockfile. Fails on a Node below `.nvmrc` (`devEngines`). |
| `npm run ci`            | The gate: lint → unit tests. **Check only.**                            |
| `npm run fix`           | Auto-fix lint.                                                          |
| `npm run verify`        | `fix` → gate. One-shot local pre-flight.                                |
| `npm test`              | Unit tests only.                                                        |
| `npm run help`          | The CLI's option list.                                                  |
| `node bin/cli.js …`     | Run the CLI; always `-o` a temp dir, or it writes `.repo-counts/` here. |
| `npm pack --dry-run`    | What would ship to npm.                                                 |
| `npm run test:config`   | Scratch harness — **not a test** ([qa.md § traps](qa.md#masking-traps)). |

- **The gate only checks.** Keeping check and fix separate is what makes it trustworthy in CI.
- **The gate validates the whole tree, not your diff**, even on a docs-only change.

One package manager (npm), one committed lockfile. Never hand-edit `package-lock.json`.

## Releasing

The recurring procedure — follow it step for step. **Owner only**: it publishes.

1. Everything merged to `master`, CI green on `master`.
2. On an npm-authenticated machine: `git checkout master && git pull`.
3. `npm version patch` (or `minor` / `major`). This bumps `package.json`, commits, tags `vX.Y.Z`, then
   `postversion` pushes the commit and tag **and runs `npm publish`**.
4. Check: `npm view repo-counts version` and `npx repo-counts@latest -V` print the new version.

`--version` reads `package.json`, so there's no second place to bump. Never hand-edit the version.

## Local tooling

- **git ≥ 2.x** on `PATH` — the CLI and its tests shell out to it.
- **Node per `.nvmrc`** — `npm ci` refuses an older one.
- **A browser** for the chart-look check; absent → flag it owed ([qa.md](qa.md#recording-qa)).
