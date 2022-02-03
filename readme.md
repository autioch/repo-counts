# Repo History

Tool for reporting amount of a code in repositories over time.

## Installation

This package is currently _unavailable_ on `npm`. To use it clone or download repository.

## Usage

TODO

## Options
- `p,period` - either `year` or `month`; used when `histogram` option is used
- `hi,histogram` - instead of showing only current state, complete history will be shown
- `o,output` - `json`, `html` or `csv`; for current state, only `json` is available at the moment
- `r,repo <path>` - folder path to the repository, can be specified multiple times
- `m,method` - `diff` is fast option, `blame` slow, but has a lot more details
- `i,ignore <ext>,<ext>` - file types that should be skipped when counting
<!-- - `c,config=<path>` - path to a json file that can have any of the options above; options from command line will overwrite options from file -->
