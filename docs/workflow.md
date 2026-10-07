# Workflow — the paths

The paths the [routing table](../AGENTS.md#what-to-do-when) sends you down. Nothing here is invoked;
it's what you do. Each path names its steps, its stopping points, and what it leaves behind.

**One rule spans all of them: when two paths fit, take the heavier one.** A change escalates
mid-flight; it doesn't balloon in place. Escalating is cheap — you keep the work and add the missing
steps. Discovering at close-out that a "small fix" reshaped an output format is not.

## Investigate

For an unproven idea, before any spec. **No app code.** The output is a **verdict**, delivered in
chat.

1. **Name the uncertainty** in one or two lines — the single question this answers. If you can't
   state it, the idea doesn't need investigating; it needs a spec.
2. **Check three axes, and stop as soon as one is decisive:**
   - **Product sense** — is this worth building? Comparable tools (cloc, tokei, git-quick-stats), real
     user value, simpler alternatives that get most of the benefit.
   - **Experience** — how it behaves for someone running `npx repo-counts` on their repos, and in the
     HTML report.
   - **Technical viability** — does git expose it, at what cost on a large history, on every OS?
     Name specific gaps; cite what you consulted.
3. **Lay out the options with trade-offs** and mark your recommendation.
4. **Give the verdict**: viable · viable with changes · not viable · needs more investigation.

**A recorded "no" is the point, not a failure.** Say why plainly and stop. Don't investigate your way
to a yes, and don't over-investigate — name what's still uncertain as an open question for the spec.

## Direct

A trivial durable-doc, rule, or config edit — a handful of lines carrying **no real judgment**.

1. Confirm it's genuinely trivial. **The moment it touches `src/`, adds behavior, or carries a
   judgment worth recording, switch to [Bounded](#bounded).** When in doubt, it's Bounded.
2. Make the edit, honoring the doc bar. If it changes a rule, sync any doc that restates it.
3. Gate green → commit straight to `master` → push.
4. One line back: what changed + the commit.

No branch, no record beyond the commit.

## Fix

A bug. **Test-first, and the red run is the point.**

1. **Reproduce it with a test and run it red.** Confirm it fails _for the right reason_ — this is the
   regression that would have caught the bug. A fix that lands with a test that never failed proves
   nothing.
2. Fix until green.
3. **Both land in the same commit** — the tree never lands red.
4. Then the [Bounded](#bounded) close-out, or the [Feature](#feature) one if the fix turned out to be
   structural.

## Bounded

One well-bounded change touching a layer or two.

1. **Ground narrowly** — only the docs and source this change touches. Don't re-explore the repo.
2. **Pin the edges.** Ask only the blocking questions: exact behavior, output shape, scope edges.
   Propose defaults grounded in the docs; skip what the request already answers. **If the answers
   reveal a new output format, several modules, or open product questions, stop and switch to
   [Feature](#feature).**
3. **Branch, state the approach, build.** Cut a branch from `master`. Tell the user the approach +
   the files you'll touch in a couple of lines — no plan document. Then make the change exactly as
   scoped, to the [conventions](standards/development.md#conventions). Verify any uncertain git or
   Node API against its real docs rather than guessing. Commit freely with plain git.
4. **Verify** per [qa.md](standards/qa.md): the gate; the smoke run for CLI-visible changes; the chart
   look for HTML changes. Apply test-by-scope; flag anything the environment can't run.
5. **Close out** — see [Close-out](#close-out).

## Feature

A real feature: a new output format or data shape, several modules, or open product questions.

### 1 · Agree the spec

The contract — _what_ and _why_, settled **before any code**. Elicit it: target user and problem,
exact behavior, in and out of scope, output-shape changes (and `--cache` compatibility), CLI flags,
cost on large histories, and **testable acceptance criteria**. Batch related questions; propose
defaults grounded in the docs.

**Smallest coherent slice that delivers value** — enhancements go to "out of scope", explicitly.
**Converge before recording**: play the spec back and iterate until you agree, then write it down in
`docs/plan.md` — the build reads it back across sessions.

### 2 · Plan it

Turn the agreed spec into **ordered, independently committable steps**, appended to the same file.
Default **bottom-up** so the tree is never broken: data shape → `Repo` gathering → `Converter` →
`Chart` / `Fs` → CLI option → docs. Each step carries a **Goal**, a **Read** list (name files), a
**Change** (paths + concrete edits), and a **Done-check** (the exact gate from
[qa.md](standards/qa.md)).

If anything blocks an unambiguous step, ask now and **record the resolution back into the spec** —
never silently assume. When the spec reaches git with repo data or writes HTML, threat-model it here
against [security.md](standards/security.md).

### 3 · Build

Cut the branch and **record the base ref**. Then per step: read → change exactly what the step names
→ satisfy its Done-check → sync the docs it touches → commit (plain git, no push). **The commit is the
step's done-record** — `git log` is the source of truth for what's done.

Stop and ask rather than invent a product decision. Record the resolution, then continue.

### 4 · Review, then reconcile

The [review pass](#the-review-pass) over the feature diff, then **reconcile the diff against the spec,
both ways**: every acceptance criterion is built (name where), and nothing in the diff is outside
scope. On any divergence, **do not close out**: fix to match the spec, or if the spec is wrong, ask,
record, reconcile again.

### 5 · Close out

See [Close-out](#close-out), plus a **repo-wide doc reconcile**, and **delete `docs/plan.md`**.

## The review pass

A set of **lenses you re-read the diff through**, one at a time, because a single read finds one class
of problem. Where the session has dedicated review tooling (`/code-review`, `/security-review`), use
it; otherwise do the passes by hand. Run it over the whole diff since the base ref as a **review → fix
→ re-review loop**, capped at **two loops** — file residual findings rather than chasing them.

| Lens               | Looks for                                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **Scope**          | What shipped vs. what was agreed; unmet acceptance criteria                                                       |
| **Security**       | Untrusted repo data reaching a shell or unescaped HTML; writes outside `Fs` — **mandatory when `Repo`, `Chart`/`Converter` HTML, or `Fs` change** |
| **Correctness**    | Logic errors, edge cases (empty repo, one commit, shallow clone, binary files), swallowed git errors              |
| **Simplification** | Duplication, an abstraction earlier than its second use, mechanism more elaborate than the contract needs        |
| **Experience**     | CLI messages and defaults; output readable in a spreadsheet and the chart; `--help` accurate                      |
| **Coverage**       | Tests for what can silently break; which checks are still owed                                                    |
| **Operations**     | Runtime and output size on large histories; anything unbounded; what ships in the npm tarball                     |

**Problems only** — a clean lens gets one "none". **Every finding traces to a `file:line`.** When
asked to review, **flag; don't fix** unless the user asked for fixes.

## Sync

Docs drifted, or code just changed.

1. **The code is the authority.** Audit each durable doc in scope against the current code, using the
   [doc-sync map](standards/development.md#keeping-docs-in-sync). List every contradiction.
2. **Fix the drift and enforce the doc bar** — pointer-first, current-state, short.
3. **If the doc is right and the code is the bug, flag it** — don't rewrite the doc to match a bug.
   That's a [Bounded](#bounded) change.
4. Commit. If nothing drifted, say so and commit nothing.

## Close-out

The same ending for Bounded and Feature:

1. **Gate green.** Stage the change **and every durable doc it affects**.
2. **If it fixes a [TODO.md](../TODO.md) entry, remove the entry. If it resolves a readme TODO**, strike it through the way the readme already does
   (`~…~ - done`). The PR is the durable record: what and why in a line or two, the headline decision
   when one was made, any owed check.
3. **If the change is user-facing**, update the readme's usage in plain copy. Internal work gets no
   readme change.
4. **Owner-owed manual steps** — a release to publish, a token to add, a check only they can run — go
   in [owner-tasks.md](owner-tasks.md).
5. **Push, open a lean PR, merge on green CI.** See [Committing](#committing).
6. **One line back**: the PR or commit, the gate result, and anything still owed. No summary.

## Committing

- **Branch per unit of work**, cut from `master` before the first commit of a Bounded or Feature
  path. Direct and Sync commit straight to `master`.
- **During work, plain git, no push.** Commit freely; never leave the tree broken.
- **Close-out: push once**, open a **lean PR**, wait for **green CI**, merge, delete the branch,
  return to `master`.
- **Red CI → fix-forward on the same branch.** A real failure → fix the cause and re-push.
- **CI is the gate authority.** No git hooks are installed; run `npm run verify` before pushing.
- **Never release from a branch.** Releasing is the owner's runbook:
  [development.md § Releasing](standards/development.md#releasing).
- Conventional Commits subjects.

## Handing off

At a **clean boundary** — a close-out, or between steps — when context is saturating or the user asks,
**stop there rather than pushing on degraded**. Durable state is already persisted (git + the PR +
`docs/plan.md`). Emit a **ready-to-paste next-session prompt** with three pointer blocks: **Mandate**
(the task + the rules it resumes under), **State** (branch, last commit or open PR, what's
mid-flight), **Next** (1–3 candidates, each with a one-line why). Don't save it to a file.
