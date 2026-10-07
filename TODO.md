# TODO — known issues

The single list of verified issues. Each entry: **why** it happens, **result**, proposed **fix**.
Remove an entry in the commit that fixes it. Product roadmap: the readme's TODO list.

## Security

**T1 · Shell injection via file names** — high
- Why: `Repo.command` runs git through `child_process.exec` on interpolated strings; file names come from the counted repo.
- Result: `--detail` on an untrusted repo runs commands embedded in a file name.
- Fix: `execFile`/`spawn` with an args array; `--` before path arguments.

**T2 · HTML injection in the chart** — medium
- Why: `Chart.mjs` `e()` inserts labels (extensions, repo names) unescaped.
- Result: a crafted file name injects markup or script into the report.
- Fix: an `escapeHtml` util applied to text and attribute values.

**T3 · CSV fields unquoted** — medium
- Why: `Fs.writeCsv` joins raw values with `;`.
- Result: a name containing `;`, `"` or a newline shifts columns.
- Fix: wrap every field in `"…"`, double inner quotes; keep `;`.

**T4 · Git failures are silent** — medium
- Why: `Repo.command` returns `''` on any error, including output over the 50 MB `maxBuffer`.
- Result: a file or period is counted as 0 with no warning — a silently wrong report.
- Fix: report failures (abort, or a warning summary naming the command and file); stream large output.

**T5 · 50 parallel git processes** — low
- Why: `pLimit(50)` regardless of machine.
- Result: on large repos, CPU/disk contention with no speed gain past the core count; worst case 50 × 50 MB output buffers in memory.
- Fix: cap at `os.availableParallelism()`.

**T6 · Counted repo's own git config is trusted** — unverified
- Why: git honours the repo's `.git/config` (e.g. textconv, external diff, fsmonitor).
- Result: a repo received with its `.git` directory could make git run configured programs.
- Fix: verify; then pass `--no-textconv`, `--no-ext-diff`, `-c core.fsmonitor=false`.

**T7 · Destructive dead code** — low
- Why: `Repo.cleanRepo()` runs `git reset --hard` and `git clean -fd`; nothing calls it.
- Result: one wrong call away from destroying a user's uncommitted work.
- Fix: delete it.

## Correctness

**C1 · Non-ASCII file names count as 0 lines**
- Why: `git ls-tree` quotes such paths (`core.quotePath`); the quoted name is passed to blame.
- Result: `zażółć.txt` → name mangled, extension `.txt"`, 0 lines.
- Fix: `git ls-tree -z`, split on NUL.

**C2 · Detail CSV header one column short**
- Why: rows include the extension after `FileName`; the header doesn't name it.
- Result: every column after the file name is mislabelled in a spreadsheet.
- Fix: add an `Extension` header (current and chronicle detail).

**C3 · `--chronicle` crashes on shallow or multi-root repos**
- Why: `git rev-list --max-parents=0 HEAD` returns several commits; the interpolated `git log` range is malformed.
- Result: `TypeError` in `getCountFromDiff`.
- Fix: list commits with `git log HEAD` (no range); warn when the clone is shallow.

**C4 · Snapshots can miss mainline work**
- Why: snapshots are picked among `--no-merges` commits by author date.
- Result: a year's "last commit" can be a feature-branch commit lacking work merged on the main line.
- Fix: `git rev-list -1 --first-parent --before=<period end> HEAD` per period.

**C5 · Month snapshots lag**
- Why: month mode keeps the *first* commit of each month; year mode keeps the last.
- Result: monthly charts are up to a month behind.
- Fix: covered by C4 (last state before period end).

**C6 · Period boundaries depend on the runner's time zone**
- Why: dates are bucketed with JavaScript `Date` in local time.
- Result: commits near midnight land in different periods for different users.
- Fix: let git format the period (`--date=format:%Y-%m`).

**C7 · Partial current period unmarked**
- Why: the running year/month is shown like a complete one.
- Result: the last bar reads as a drop or stall.
- Fix: label it "to date".

## Meaningful results

**M1 · Generated and vendored files dominate the count**
- Why: nothing is excluded; `.gitattributes` isn't honoured.
- Result: this repo reports 107,984 lines; `src/` + `bin/` are 1,028 — the rest is fixtures and the lockfile.
- Fix: exclude via pathspec honouring `linguist-generated` / `linguist-vendored` / `-diff`; default-exclude lockfiles; report the excluded count.

**M2 · Line count alone isn't growth**
- Why: only total lines per snapshot are reported.
- Result: no view of net change, churn, activity or contributors.
- Fix: one `git log --numstat` pass → net change, churn, commits and active authors per period.

**M3 · Gaps filled silently**
- Why: CSV/HTML repeat the previous count for periods without commits.
- Result: reads as measured data.
- Fix: mark carried-forward periods.

## Performance

**P1 · Chronicle simple re-diffs the whole tree per period**
- Why: each snapshot is diffed from the empty tree.
- Result: cost grows with repo size × periods (3.4 s here).
- Fix: diff consecutive snapshots and sum — same total, ~2.2× faster here, more on big repos.

**P2 · Detail blames every file for per-extension counts**
- Why: blame runs per file even when only line counts are needed.
- Result: ~12× slower than needed (720 ms vs 57 ms here).
- Fix: `git diff --numstat` for files/extensions; blame only for author/date.

**P3 · Binary detection by extension list**
- Why: the `binary-extensions` package guesses from the name.
- Result: misses unknown binaries, drops text files with "binary" extensions.
- Fix: use git's verdict (`--numstat` prints `-` for binaries); drop the dependency.

**P4 · Unchanged files are re-blamed every period**
- Why: no reuse across snapshots.
- Result: chronicle detail is O(commits × files).
- Fix: cache blame by `(path, blob id)` from `git ls-tree`.

**P5 · Detail output stores one tuple per line**
- Why: per-line `[date, author, length]` is kept and written.
- Result: huge JSON/CSV (78,451-line fixture for one small repo).
- Fix: aggregate per file × author × period at gather time.

## Usability

**U1 · Defaults hide the useful output**
- Why: default format is JSON only; output goes to `.repo-counts/` in the cwd; the console prints a config dump and "done".
- Result: a first run produces no chart and doesn't say where files went.
- Fix: default to HTML + JSON; print the written paths.

**U2 · Unclear names**
- Why: `Simple` / `Detail` / `Chronicle` / `Current` file names; non-standard `-ch` / `-dr` / `-ee`; `--detail` means per-extension in HTML but per-line in CSV.
- Result: users can't tell what a file or flag means without the code.
- Fix: descriptive file names and conventional flags (keep old aliases for a release).

**U3 · CSV holds ids, not names**
- Why: authors and dates are written as `Db` ids (readme TODO 10).
- Result: the CSV needs `authors.json` / `dates.json` to read.
- Fix: write labels.

## Chart accessibility

**A1 · Toggles not keyboard reachable** — checkboxes are `display: none`. Fix: visually hidden, focusable inputs with a visible focus ring.

**A2 · Values hover-only** — tooltips need a mouse. Fix: show values on focus, or in a table under the chart.

**A3 · Motion ignores `prefers-reduced-motion`** — 250 ms transitions always run. Fix: disable under the media query.

**A4 · State by opacity only** — a deselected legend item is just `opacity: .5`. Fix: add a non-colour cue (strike-through or icon).

**A5 · Palette contrast unaudited; no dark scheme.** Fix: check against WCAG AA; add `prefers-color-scheme: dark`.
