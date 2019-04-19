# Repo History

Tool for reporting amount of a code in repositories over time. It does not use any Github or other APIs, requires only git.

## WARNING!
As warnings should be written ahead, here's one. This module travels through the history of the repo. Because of that, it will **remove all uncommitted changes** - **git checkout** with **git reset --hard** will be used. Remember to **commit** Your work!

## Installation

This package is currently _unavailable_ on `npm`. To use it clone or download repository.

## FAQ

### What is displayed by the histogram?
Amount of lines of code (extensions known to CLOC) in given periods of time.

### What is displayed by the distribution?
Current (HEAD) `git blame` summary for every file found in the repository in the HEAD.

### WHy blacklist (ignore list) and not whitelist?
List of file types reported for history is governed by CLOC, which will report only extensions known to it. The distribution on the other hand will find all files in the repository.
This means that by default CLOC won't report `.txt`, `.gitignore`, while distribution will.

### Why histogram reports different numbers than distribution?
Distribution collects information based on the all files found in the directory, including the ones unknown (and thus not reported) to the CLOC.

## Configuration
See `config.example.js` for an example.

### clocPath
Absolute path to the perl cloc. By default this comes as dependency, but can be changed.

### ignoredFolderNames
Array of folder names to be ignored in every repository - they work as a regex.

### ignoredExtensions
Array of extensions to be ignored in every repository.

### startingCommitNr
Amount of commits to be skipped from the beggining of the history.

### rawInfoDetails
Instead of summary, each line info will be saved. **Warning** - this will result in a _large_ input.

### repos
List of repositories to be checked. You can specify `path` only to the `folder`, or use an object with properties:
 - `folder` *required* is direct path to repo folder,
 - `repoName` is the name used in jsons and final chart,
 - `ignoredFolderNames` array of folder names to be ignored - they work as a regex; these folder names will be joined with folder names defined in the main part of the config
 - `ignoredExtensions` array of extensions to be ignored; these extensions will be joined with folder names defined in the main part of the config
 - `color` is the color of the bar in the chart, if not provided, will be assigned

## Collecting data
1. In the main folder of the repo, run `npm i`.
2. Install perl (cloc requires it).
3. In the root directory of the `repo-history`, create `config.js` file, based on the `config.example.js` file.
4. Run `npm run collect-data` in the root directory.
5. Result, `data.json` will be available in `data` and `src/chart-data/src/data.json`.

## Charting data
1. Navigate to `src/chart-data`.
2. Run `npm i`. This will install `CRA`, Create React App.
3. Run `npm run start` for tweaking the app.
4. Run `npm run build` for releasing the app.

## TODO
 - allow collecting only partial data for only chosen repositories
 - wire up chart-data to be easier in use
 - add more colors
 - cleanup and review codebase
