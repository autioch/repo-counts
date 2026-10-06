# Security

The authority on the project's security posture — the rules every change must hold. **How to test**
security lives in [qa.md](qa.md); the **data flow** in [architecture.md](architecture.md). This doc
owns the rules; those own their slices.

## Trust model

repo-counts is a CLI published to npm and run with the user's own privileges against repositories
they point it at. **The repository being counted is untrusted input** — people run it on code they
didn't write.

| Input                                                | Trust                                                     |
| ---------------------------------------------------- | --------------------------------------------------------- |
| File paths, extensions, author names, commit content | **Untrusted** — attacker-controlled by whoever made the repo |
| Repository directory name                            | Untrusted — cloned repos keep their upstream name           |
| CLI arguments (`-r`, `-o`, `-ee`, …)                  | The invoking user's own — trusted, still never shell-interpolated |
| Cached output files read back by `--cache`           | Written by this tool — trusted as data, never executed      |

## Rules

- **Never build a shell string from data.** Untrusted strings reach git only as **separate arguments**
  (`execFile` / `spawn` with an args array), never interpolated into a command line run by a shell —
  quoting is not a defence, since `$(…)` expands inside double quotes. Pass `--` before path arguments
  so a name starting with `-` can't become an option.
- **Escape everything placed in generated HTML.** Labels (repo names, extensions) go through an HTML
  escape for both text and attribute values. The report must be safe to open even when the counted
  repo is hostile.
- **`--dry` writes nothing**, and every disk write goes through `Fs`, which enforces it
  (`spec/fs.spec.mjs`).
- **Never mutate the counted repository.** The tool reads git state only. `Repo.cleanRepo()`
  (`git reset --hard` + `git clean -fd`) is uncalled; it must stay uncalled, or be deleted.
- **No network.** The CLI reads local repositories only; adding a network call is a security review.

## Open issues

Verified on `master`, not yet fixed. Each violates a rule above; until fixed, treat the paths as
hostile-input-unsafe.

- **Command injection via file names** — `Repo.command()` runs `child_process.exec` on interpolated
  strings; `blameFile` quotes `filePath` in double quotes, so a committed file named
  `x$(touch PWNED).txt` runs `touch PWNED` during any `--detail` run. Commit hashes and `-ee`
  pathspecs are interpolated the same way.
- **HTML injection in the chart** — `Chart.mjs`'s `e()` concatenates labels unescaped; a file named
  `y.<b>bold<i>` puts raw markup into `CurrentDetail.html` (legend text and `data-label`).
- **CSV fields are unquoted** — `Fs.writeCsv` joins with `;`. A file name containing `;`, `"` or a
  newline shifts columns, and a text cell starting with `=`, `+`, `-` or `@` can be evaluated as a
  formula by a spreadsheet.
- **Git failures are silent** — `Repo.command` returns `''` on any error, including output over the
  50 MB `maxBuffer`, so a file can be counted as empty without notice. A report that can be silently
  wrong is an integrity issue.
- **Unbounded resource use** — up to 50 concurrent git processes (`pLimit(50)`), each able to buffer
  50 MB of output.

## Publishing

The npm package is the supply chain for every user. **Publishing is the owner's call** — `npm version`
publishes via `postversion` ([development.md § Releasing](development.md#releasing)). Keep 2FA on the
npm account; never commit an npm token; a CI publish token, if ever added, lives in repository
secrets only. `.npmignore` is a denylist — check `npm pack --dry-run` so nothing unintended ships.

## Reviewing security

Run the **security lens** of the [review pass](../workflow.md#the-review-pass) whenever a change
touches `src/Repo.mjs` (anything reaching git), `src/Chart.mjs` / `src/Converter.mjs` HTML output, or
`src/Fs.mjs` — and use a dedicated security-review tool where the session has one. Test steps:
[qa.md § test-by-scope](qa.md#test-by-scope).
