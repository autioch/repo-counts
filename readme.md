# Repo History
Tool for reporting amount of a code in repositories, with an option of generating counts over time.

## Installation
This package is currently _unavailable_ on `npm`. To use it clone or download repository.

## Usage

### Node.js
Run `npx repo-history -h` to list available options with description.

Tool can be run in a current repository dir, using `npx repo-history`

Optionally, can be run for any number of repositories: `npx repo-history -r <path1> <path2>`

### Deno
Not yet supported - this tool uses node.js api that isn't available in `std/node` library.

That said, I'm testing the tool by running:
`deno run --unstable --compat --allow-env --import-map=./import_map.json .\src\index.mjs`

## TODO
1. Allow skipping first n commits. This is helpful when initial commits are more of a POS or setting up stuff.
2. Allow specifying a time period instead of a whole timeline.
3. Display more data in html output (on hover?).
4. Allow configuring colors.
5. Allow defyining config file, that can hold repeatable congfiguration - implemented, not tested.
6. Implement option for ignoring extensions and folder names.
7. Allow probing repositories not on disk - using github API or other services.
