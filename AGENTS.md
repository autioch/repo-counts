# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this project is

`repo-counts` is a zero-config CLI that counts lines of code in one or more **local git
repositories** and renders the result as JSON, CSV or a self-contained HTML bar chart. It
shells out to `git` for everything — there is no language parser and no dependency on a
hosted service.

Two orthogonal axes control what gets counted:

| Flag | Off (default) | On |
| --- | --- | --- |
| `--chronicle` | current `HEAD` only | one data point per year/month across the whole history |
| `--detail` | one total per repo, from `git diff --shortstat` | per-file / per-extension / per-author / per-line-length, from `git blame` |

The four combinations name the output file: `CurrentSimple`, `CurrentDetail`,
`ChronicleSimple<period>`, `ChronicleDetail<period>`.

`--chronicle --detail` blames every file at every period boundary. It is O(commits × files)
and genuinely slow — the readme's warning about "very, very large amounts of data" is not
hyperbole. Don't reach for it in a quick verification loop.

## Setup and commands

Node 24 works. ESM throughout (`"type": "module"`, `.mjs` sources, `.cjs` for the eslint config).

```bash
npm ci
npm test               # mocha ./spec/*.spec.mjs -R min  → 33 passing, 12 pending
npm run help           # dump the CLI option list

# run the tool; always point -o somewhere disposable
node src/index.mjs -r . -f json csv html -o /tmp/rc-out
```

There is **no `lint` script**. ESLint 7 does not pick up `.mjs` on its own, so invoke it as:

```bash
npx eslint --ext .mjs,.js,.cjs src spec bin
```

### Options

`-r <dirs...>` repos (default `.`) · `-d` detail · `-ch` chronicle · `-p year|month` ·
`-f json|csv|html...` · `-c` reuse cached json · `-o <dir>` output (default `.repo-counts`) ·
`-dr` dry · `-ee <ext...>` exclude extensions.

Note the multi-character short flags (`-ch`, `-dr`, `-ee`). Commander accepts them, but they
are not POSIX short options and cannot be bundled.

## Architecture

```
bin/cli.js          shebang wrapper, dynamic-imports src/index.mjs
src/index.mjs       commander option definitions → run(config)
src/run.mjs         orchestration: wire up Fs/Db/Repo, gather, convert, write
src/Repo.mjs        all git invocation and parsing — the only place that shells out
src/Db.mjs          Column: string → small-int interning for authors and blame dates
src/Converter.mjs   raw gathered data → CSV rows or HTML, one static method per mode
src/Chart.mjs       HTML/CSS bar chart generator (no JS in the output)
src/Fs.mjs          output dir, json/csv/html writers, styles.css copy
src/consts.mjs      FORMAT, PERIOD, period label keys, chart palette
src/styles.css      copied next to generated HTML; the chart's entire runtime
```

Data flows one way: `Repo.gatherData()` produces plain arrays/objects → `Converter.convert()`
reshapes per format → `Fs.writeOutput()` persists. Only `Repo` knows about git; only `Chart`
knows about markup.

### Data shapes

Everything is positional arrays, which keeps the JSON small but makes the code hard to read.
The shapes you will meet:

- `data` passed to `Converter`: `[[repoName, counts], ...]`
- simple counts: a number (current) or `{ [periodLabel]: number }` (chronicle)
- detail counts: `[[filePath, ext, lines], ...]` where each line is
  `[dateId, authorId, charCount]` — the ids index into `Db`'s `dates` / `authors` columns
- chronicle detail: `{ [periodLabel]: <detail array> }`

`Converter.getMatchingCounts` walks *backwards* to the nearest populated period, so periods
with no commits inherit the previous period's count rather than reading as zero.

### The chart is pure CSS

`Chart.toHtmlString()` emits no `<script>`. Interactivity is hidden checkboxes plus generated
sibling selectors (`#s0:checked ~ .chart ...`), and bar heights are inline `style="height:…%"`.
If you change an id scheme or the DOM nesting in `Chart.mjs`, the matching rules in
`src/styles.css` break silently — the page still renders, just wrong. Open the generated HTML
after touching either file.

## Conventions

Follow what is already there rather than modernising:

- **Style** is `eslint-config-qb` with a long list of rules switched off in `.eslintrc.cjs`.
  Single quotes, 2-space indent, semicolons, trailing blank line before `return`.
- **Imports** are sorted by `simple-import-sort`: external packages first, then a blank line,
  then local `./` imports.
- Prefer small top-level arrow helpers (`const trim = …`) over inline callbacks; the codebase
  leans functional and dense.
- Classes are default exports, one per file, PascalCase filename. Everything else is camelCase.
- Suppress a rule inline with `// eslint-disable-line <rule>` where the codebase already does;
  don't reformat code to satisfy a rule that is off.
- `TODO` comments are the author's backlog — leave them alone unless you are resolving one.
  The readme's numbered TODO list is the roadmap of record.

## Traps

Verified against this checkout; expect to hit these.

1. **`--chronicle` crashes on a shallow clone.** CI and cloud sessions often clone with
   `--depth`. `git rev-list --max-parents=0 HEAD` then returns *several* grafted boundary
   commits, the interpolated `git log` command is malformed, `Repo.command` swallows the error
   and returns `''`, and `Repo.mjs:142` dies with
   `TypeError: Cannot read properties of undefined (reading 'trim')`. Run
   `git fetch --unshallow` before testing any chronicle path.

2. **`linebreak-style` is unsatisfiable.** `eslint-config-qb` requires CRLF; every file is
   committed with LF and there is no `.gitattributes`. On Linux that is ~1200 errors, all of
   them noise. Filter them out (`| grep -v linebreak-style`) and **never** run `eslint --fix`
   over the tree — it would rewrite every line of every file. The only real lint error today is
   an unused `join` import at `src/run.mjs:1`.

3. **`isBinary` is inverted.** `src/Repo.mjs:23` returns `true` for files that are *not*
   binary. Call sites (`.filter(isBinary)`) rely on that, so the behaviour is correct and the
   name is wrong. Don't "fix" the name without fixing both ends.

4. **`Repo.command` swallows every git failure**, returning `''` (the `console.error` is dead
   code behind `false &&`). Parse errors downstream are usually a failed git command upstream.
   When debugging, temporarily enable that log instead of guessing.

### Invariants to keep

- **`--dry` writes nothing.** Every disk write goes through `Fs`, and every `Fs` method that
  writes checks `this.dry`. A new write path must do the same; `spec/fs.spec.mjs` asserts an
  empty output directory after a dry run.
- **Db ids are stable across runs.** `authors.json` / `dates.json` are the lookup tables for
  the ids stored in every output file, so ids must never be renumbered or reused.
  `spec/db.spec.mjs` covers restore and id continuation.

## Testing

`spec/*.spec.mjs` run under mocha: `Chart`'s `roundUp`, `getAxisValues` and `getTitle`,
`Converter`'s `normalizeDates`, `Db` restore/persist (against an in-memory fake `fs`), and
`Fs` dry/non-dry writes (against a temp directory). Plain `assert.deepEqual`, often
table-driven via `forEach` over a test-case array.

The snapshot suites in `spec/converter.spec.mjs` that compare against `spec/mock/*.{csv,html}`
are `describe.skip`-ed — those are the 12 pending tests. The fixtures are stale; re-record them
before un-skipping.

`spec/run.mjs` (`npm run test:config`) is **not a test**. It is a scratch harness that asserts
nothing, writes into `spec/mock/`, and hardcodes a Windows path
(`E:/projects/trial-css-filter`) that silently skips elsewhere. Don't wire it into CI and don't
treat a clean exit as a pass.

When adding tests, prefer extending the existing suites — anything touching `Repo` needs a
real git repository and is slow.

## Shipping changes

- There is no CI and no `.github/`. You are the only gate: run `npm test` and the filtered
  eslint command yourself.
- Don't run `npm version` / `npm publish`. `postversion` is
  `git push origin HEAD --follow-tags && npm publish`, so a version bump publishes to the npm
  registry immediately. Releases are the maintainer's call. `--version` reads the version
  from `package.json`, so there is no second place to bump.
- `.npmignore` is a denylist. A new top-level file ships to npm unless you add it there;
  check with `npm pack --dry-run`.
- Keep `.repo-counts/` (the default output dir) out of commits; it is gitignored.
- Deno is aspirational: `import_map.json` maps the four deps to esm.sh and the readme documents
  a `deno run --compat` invocation, but the tool uses node APIs Deno's compat layer doesn't
  cover. Node is the supported runtime.
