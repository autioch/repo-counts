# Styling — the HTML chart

The only UI is the generated report: markup from `src/Chart.mjs`, styles from `src/styles.css`
(copied next to every `.html`), colours from `colors` in `src/consts.mjs`. How it's built:
[architecture.md § the chart](architecture.md#the-chart-is-pure-css).

## How it works

- **No JavaScript in the output.** Each series and point has a hidden checkbox; its `<label>` is the
  legend item; `#<id>:checked ~ …` rules (generated per id in `Chart.getSeriesStyles` /
  `getPointStyles`) show or collapse the bars.
- **Bar height** is an inline `height:…%` of the rounded-up axis maximum (`Chart.roundUp`).
- **Colour** is a custom property, `--item-color`, assigned by `:nth-child` cycling through the ten
  palette entries — on points in detail mode, on series otherwise.
- **Values** appear in CSS tooltips from `data-label` via `::before` / `::after`.

## Ground rules — binding on changes

- **Contrast.** WCAG AA is the floor: 4.5:1 text, 3:1 large text and non-text (bars, legend
  swatches) against the background. **State is never signalled by colour alone.**
- **Keyboard and focus.** Every interactive element is keyboard reachable with a visible focus
  indicator.
- **Motion.** Never required to convey state; honour `prefers-reduced-motion`.
- **Untrusted labels.** Every label is escaped ([security.md](security.md#rules)).
- **Ids and selectors move together.** Change an id scheme or nesting in `Chart.mjs` and the matching
  generated rules and `styles.css` in the same commit, then open the chart.

## Known gaps

Current shortfalls against the ground rules are tracked in [TODO.md](../../TODO.md#chart-accessibility)
(A1–A5) — fix on touch, don't extend.
