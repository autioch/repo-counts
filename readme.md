# repo-history

Tool for reporting amount of a code in repositories over time. It does not use any Github or other APIs, requires only git.

## Installation

This package is currently _unavailable_ on `npm`. To use it clone or download repository.

## Configuration

### clocPath
Absolute path to the perl cloc. By default this comes as dependency, but can be changed.

### clocIgnored
List of languages/extensions to be ignored by cloc.

### startingCommitNr
Amount of commits to be skipped from the beggining of the history.

### repos
List of repositories to be checked. You can specify `path` only to the `folder`, or use an object with properties:
 - `folder` *required* is direct path to repo folder,
 - `repoName` is the name used in jsons and final chart,
 - `extensions` array of file types checked when collecting lines info, by default `['js', 'scss', 'sass', 'css', 'tpl', 'html', 'md']`
 - `ignoredFolderNames` array of folder names to be ignored - they work as a regex
 - `color` is the color of the bar in the chart, if not provided, will be assigned

## Collecting data
1. In the main folder of the repo, run `npm i`.
2. Install perl (cloc requires it).
3. In the root directory of the `repo-history`, create `config.js` file, based on the `config.example.js` file.
4. Run `node index` in the root directory.
5. Result, `data.json` will be available in `src/chart-data/src/data.json`.

## Charting data
1. Navigate to `src/chart-data`.
2. Run `npm i`. This will install `CRA`, Create React App.
3. Run `npm run start` for tweaking the app.
4. Run `npm run build` for releasing the app.

## TODO
 - Unify mechanism for chosen and ignored file types
 - allow collecting only partial data for only chosen repositories
 - wire up chart-data to be easier in use.
