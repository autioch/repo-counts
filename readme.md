# repo-history

Tool for reporting amount of a code in repositories over time.

## Usage

This package is currently unavailable on `npm`. To use it:

1. Clone/download repository.
2. Run `npm i`.
3. Install perl (cloc requires it).
4. In the root directory of the `repo-history`, change the `config.js` file.
5. Run `node index` in the root directory.

## Configuration

### clocPath
Absolute path to the perl cloc. By default this comes as dependency, but can be changed.

### ignored
List of languages/extensions to be ignored by cloc.

### repos
List of repositories to be checked, where:
 - `folder` is direct path to repo folder,
 - `repoName` is the name used in jsons and final chart,
 - `color` is the color of the bar in the chart.
