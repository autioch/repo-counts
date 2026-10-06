# Domain

What repo-counts is for and how it behaves for a user. Usage lives in the [readme](../../readme.md);
the roadmap of record is the readme's numbered TODO list.

## The product

A zero-config CLI, published to npm as `repo-counts` (`npx repo-counts`), whose purpose is
**meaningful information about how a repository grows** — how much code there is now, and how that
changed over time — for local git repos. **Git does the computing**; JavaScript only aggregates and
formats ([development.md § git first](../standards/development.md#git-first)). A number is only
useful if it reflects the code a reader cares about, at the moment it claims to. Output is JSON (the raw
data, reused by `--cache`), CSV (for spreadsheets), and a self-contained HTML bar chart.

Lines are counted by git, not by a language parser: simple mode counts inserted lines from the empty
tree to the snapshot (`git diff --shortstat --ignore-all-space`); detail mode blames every non-binary
file. Merges are skipped when choosing snapshots.

## Snapshot choice in chronicle mode

- **year** — the **last** commit of each year.
- **month** — the **first** commit of each month (by day). This is inconsistent with year mode; a
  monthly chart lags by up to a month. Current behavior, not intent.
- JSON lists only periods that had a commit; CSV and HTML fill gaps with the previous period's count.

## Scenarios

The regression script ([qa.md § user-story regression](../standards/qa.md#user-story-regression)).
Run each with `-o` pointing at a temp dir.

| #   | Run                                   | Expected                                                                                     |
| --- | ------------------------------------- | -------------------------------------------------------------------------------------------- |
| S1  | `repo-counts` in a repo               | `CurrentSimple.json` = `[[<dir name>, <line count>]]`, plus `authors.json`, `dates.json`, `styles.css` |
| S2  | `-r <repo> <not-a-repo> -f html`      | "Non-git dir provided, skipping"; one chart, one series per real repo                          |
| S3  | `-ch -p year -f csv html`             | one row/bar per year from first to last commit year, gaps filled                              |
| S4  | `-d -f csv`                           | a row per line of every non-binary file; author and date as ids resolvable in `authors.json` / `dates.json` |
| S5  | S4 again with `-c`                    | same output without running git; `authors.json` unchanged                                     |
| S6  | any run with `--dry`                  | nothing created on disk — not even the output directory                                       |
| S7  | `-d -ee json` in a repo with `.json`  | no `.json` files in the detail output                                                         |

## Known issues

Current behavior that undercuts meaningful results — verified on `master`:

- **Generated and vendored files dominate the count.** Nothing is excluded by default: on this repo
  the total is 107,984 lines, of which `src/` + `bin/` are 1,028 — the rest is test fixtures and
  `package-lock.json`. `.gitattributes` (`linguist-generated`, `-diff`) is not honoured.
- **Snapshots can miss mainline work.** Chronicle picks among `--no-merges` commits by **author**
  date, so the "last commit of a year" can be a feature-branch commit that lacks work already merged
  on the main line.
- **Period boundaries depend on the runner's time zone** — dates are bucketed with JavaScript `Date`
  in local time, not by git.
- **The current period is partial** and isn't marked as such.
- **Detail CSV header is one column short** — rows carry the extension after `FileName`, the header
  doesn't name it (6 headers / 7 values in `CurrentDetail.csv`; same in chronicle detail).
- Security open issues: [security.md § open issues](../standards/security.md#open-issues).
- Chart accessibility gaps: [styling.md § known gaps](../standards/styling.md#known-gaps).
