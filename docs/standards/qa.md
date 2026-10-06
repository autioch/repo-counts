# QA & Testing Guide

The single source of truth for **how to test a change**. **Read it before verifying anything** — every
path in the [routing table](../../AGENTS.md#what-to-do-when) says so.

It answers **what** to test, **how** for this stack, and **how much** for a given change. It's the
sibling of the [doc-sync map](development.md#keeping-docs-in-sync) — same change-type rows: the map
says _which docs to update_, the [test-by-scope](#test-by-scope) table here says _what to test_.

## Deciding what to test

Most changes resolve in seconds. Ask, in order:

1. Touched **logic** (a pure helper, `Db`, `Fs`, `Converter`, `Chart`)? → a **unit** test in `spec/`,
   same commit.
2. Touched **git invocation or parsing** (`src/Repo.mjs`)? → a test against a **real temporary git
   repo** — a mock of git output proves nothing about the command.
3. Changed **CLI behavior or output** (an option, a file, the chart)? → a **smoke run** of the real CLI,
   and for HTML, open the generated chart once.
4. None of the above (docs, config)? → **the gate only**.

- **Union of the touched layers.** A change runs the checks for **every** layer it touches, on top of
  the [always-on set](#always-on-checks-every-code-change).
- **Effort scales with blast-radius × irreversibility** — the same ladder as the
  [decide-vs-ask](../../AGENTS.md#working-style) rule. Anything reaching git with repo data, or writing
  HTML, always gets covered: that's the [security](security.md) surface.

## The confidence tiers

| Change type                          | What to prove                                             | Tier                                         |
| ------------------------------------ | --------------------------------------------------------- | -------------------------------------------- |
| **Pure logic** (`Converter`, `Chart` helpers, `normalizeDates`) | input → output + edge cases       | **Unit**                                     |
| **`Db` / `Fs`**                      | restore/persist round-trip; dry writes nothing            | **Unit** (fake fs / temp dir)                |
| **`Repo`** (git commands, parsing)   | real command shape, parsing of real output, odd file names | **Integration** — a temp git repo           |
| **CLI options / wiring**             | the option reaches the behavior; files land where stated  | **Smoke run**                                |
| **HTML chart**                       | renders, legend toggles work, labels escaped              | **Unit** (markup) + **open it once**         |
| **Packaging**                        | only intended files ship; `bin` runs                      | `npm pack --dry-run` (CI) + tarball install  |
| **Docs / workflow**                  | links resolve; no doc contradicts code                    | human                                        |

## Operational stages

_When_ the checks run. The single fallback when an environment can't run one: **flag it owed, never
fake it** ([recording QA](#recording-qa)).

| Stage                   | What                                              | Runs where                                        | Flag-it-owed when                   |
| ----------------------- | ------------------------------------------------- | ------------------------------------------------- | ----------------------------------- |
| **The gate** _(always)_ | lint (incl. `linebreak-style: unix`), unit tests  | `npm run ci` — PR CI                               | n/a                                  |
| **Smoke run**           | the real CLI, current + chronicle, every format    | PR CI; locally with `-o` in a temp dir            | n/a                                  |
| **Package check**       | tarball contents                                   | PR CI (`npm pack --dry-run`)                      | n/a                                  |
| **Chart look**          | open the generated HTML; toggles; legend           | a browser                                         | no browser → "chart look owed"       |
| **The review pass**     | the [review lenses](../workflow.md#the-review-pass); security when `Repo` / HTML / `Fs` change | a re-read of the diff | n/a                         |

**The gate validates the whole tree, not your diff**, and only checks — `npm run verify` auto-fixes
lint first. CI re-runs it as the authority.

## Always-on checks (every code change)

- **Gate green** — `npm run ci`.
- **Unit tests** — logic you added or changed has a test in `spec/`
  ([Tests are part of the change](#tests-are-part-of-the-change)).
- **Layering intact** ([architecture.md](architecture.md) owns it) — only `Repo` shells out, only
  `Chart` builds markup, every write goes through `Fs`.
- **Invariants hold** — `--dry` writes nothing; Db ids never renumber.

## Tests are part of the change

Treat a unit test like a doc update: **when a change adds or alters logic, add or extend its test in
the same commit.** Coverage is **judgment, not a percentage** — cover the behaviour and the edge cases
that would actually break, and skip the trivial.

**Fixing a bug is test-first.** Before the fix, write a test that **reproduces** the defect and **run
it red** — confirm it fails for the right reason. Then fix until it passes. A fix that lands with a
test that never failed proves nothing. Test and fix land in the **same commit** (the tree never lands
red).

- **Unit-test** pure helpers, `Db`, `Fs`, `Converter`, `Chart`. Prefer extracting logic out of `Repo`
  into a pure parser and testing that, over driving git.
- **Integration-test** `Repo` against a real temporary repository (`git init` in `os.tmpdir()`),
  including hostile file names — never against this checkout's own history, which changes.
- **Don't** expect a test for config or styles — the gate and the chart look cover those.

## Test-by-scope

Match the change to the layer(s) it touches and run those checks **on top of** the always-on set.
Rows mirror the [doc-sync map](development.md#keeping-docs-in-sync).

| Change                        | What to test                                                                                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`Repo` / git invocation**   | Temp-repo test incl. a file name with `$()`, quotes, spaces, a leading `-`; nothing executes. Smoke run on a full clone **and** note shallow-clone behavior. Security lens. |
| **`Converter` / output shape** | Unit test per mode × format touched; smoke run; if JSON shape changed, check `--cache` still reads old files or say it doesn't.                  |
| **`Chart` / `styles.css`**    | Unit test on the markup (incl. an escaped hostile label); open the HTML: both toggles, legend, tooltips. Security lens.                            |
| **`Db` / `Fs`**               | Round-trip and dry-run tests in `spec/db.spec.mjs` / `spec/fs.spec.mjs`.                                                                          |
| **CLI options**               | Smoke run with the option; `npm run help` shows it; readme usage updated.                                                                           |
| **Packaging / `.npmignore`**  | `npm pack --dry-run` lists exactly the intended files.                                                                                             |
| **Workflow / docs only**      | No runtime test. Gate green, internal links resolve, no doc contradicts the code.                                                                  |

## Masking traps

Each entry is a check that once silently passed without being exercised:

- **`Repo.command` swallows every git failure**, returning `''` — a broken command looks like "no
  data", and the crash surfaces later in parsing. Debug by enabling its `console.error`.
- **A shallow clone breaks `--chronicle`** (several root commits → a malformed `git log`). CI checks
  out with full history; a local `--depth` clone does not.
- **`--cache` skips gathering** — a run with `-c` proves the converters, not `Repo`.
- **`describe.skip` snapshot suites** in `spec/converter.spec.mjs` count as "pending", not passing;
  their fixtures are stale.
- **`spec/run.mjs` asserts nothing** and hardcodes a Windows path — a clean exit is not a pass.

## User-story regression

The common flows are the regression script: scenarios `S1`–`S5` in
[domain/README.md](../domain/README.md#scenarios). After a behaviour-affecting change, first make the
scenarios reflect it, then walk the ones the change could touch.

## Recording QA

Record plainly in the PR: which stages ran and their result (cite evidence — counts, file lists), and
what is **pending or unverifiable**. **Claims must trace to a commit or to observed behavior. A green
gate alone is not "verified".**
