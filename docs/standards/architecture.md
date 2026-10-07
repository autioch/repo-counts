# Architecture

How the CLI is split and where code lives. [development.md](development.md) owns conventions and
commands; [security.md](security.md) the posture. Product intent: [domain/README.md](../domain/README.md).

## Modules

Data flows one way: **`Repo` gathers → `Converter` reshapes → `Fs` writes.** Only `Repo` knows about
git; only `Chart` knows about markup.

| File                | Does                                                                     | Must not                                       |
| ------------------- | ------------------------------------------------------------------------ | ---------------------------------------------- |
| `bin/cli.js`        | Shebang wrapper; dynamic-imports `src/index.mjs`                         | Hold logic                                     |
| `src/index.mjs`     | Commander option definitions → `run(config)`; `--version` from `package.json` | Touch git or the disk                     |
| `src/run.mjs`       | Orchestration: wire `Fs` / `Db` / `Repo`, gather, convert, write         | Shell out or build markup                      |
| `src/Repo.mjs`      | Every git invocation and its parsing — the only place that shells out    | Write files                                    |
| `src/Db.mjs`        | `Column`: string → small-int interning for blame authors and dates       | Know about git or formats                      |
| `src/Converter.mjs` | Gathered data → CSV rows or HTML, one static method per mode × format    | Shell out or write files                       |
| `src/Chart.mjs`     | HTML/CSS bar chart generator — emits no `<script>`                       | Know about git                                 |
| `src/Fs.mjs`        | Output dir, json/csv/html writers, `styles.css` copy; owns `--dry`       | Be bypassed — every disk write goes through it |
| `src/consts.mjs`    | `FORMAT`, `PERIOD`, period label keys, chart palette                     | Import anything                                |
| `src/styles.css`    | Copied next to generated HTML; the chart's entire runtime                | Depend on a script                             |

## Modes

Two orthogonal flags; their combination names the output file.

| Flag          | Off (default)                                    | On                                                  |
| ------------- | ------------------------------------------------ | --------------------------------------------------- |
| `--chronicle` | current `HEAD` only                              | one data point per year/month across the history    |
| `--detail`    | one total per repo, from `git diff --shortstat`  | per file / extension / author / line, from `git blame` |

Files: `CurrentSimple`, `CurrentDetail`, `ChronicleSimple<period>`, `ChronicleDetail<period>`.
`--chronicle --detail` blames every file at every period boundary — O(commits × files), genuinely slow.

## Data shapes

Everything is positional arrays: small JSON, hard-to-read code.

- `data` passed to `Converter`: `[[repoName, counts], ...]`
- simple counts: a number (current) or `{ [periodLabel]: number }` (chronicle)
- detail counts: `[[filePath, ext, lines], ...]`; each line is `[dateId, authorId, charCount]`,
  the ids indexing `Db`'s `dates` / `authors` columns
- chronicle detail: `{ [periodLabel]: <detail array> }`

`Converter.getMatchingCounts` walks **backwards** to the nearest populated period, so a period with no
commits inherits the previous count rather than reading as zero.

## The chart is pure CSS

Interactivity is hidden checkboxes plus generated sibling selectors (`#s0:checked ~ .chart …`); bar
heights are inline `style="height:…%"`. An id or DOM-nesting change in `Chart.mjs` silently breaks the
matching rules in `src/styles.css` — the page still renders, just wrong. Rules: [styling.md](styling.md).

## State ownership

| State                                | Owner                                                         |
| ------------------------------------ | ------------------------------------------------------------- |
| Gathered counts (the `--cache` input) | `<output>/<ModeFile>.json`                                   |
| Author / date id tables              | `<output>/authors.json`, `<output>/dates.json` via `Db`        |
| Chart palette                        | `colors` in `src/consts.mjs`                                   |
| Package version                      | `package.json` — the only place                                |

**Db ids are stable across runs.** The id tables are the lookup for ids stored in every output file:
restore continues numbering, never renumbers or reuses (`spec/db.spec.mjs`).

## Design goals

Meaningful growth information · git does the computing, JavaScript aggregates
([git first](development.md#git-first)) · zero config · local repos only · output viewable with no
server and no JavaScript.
