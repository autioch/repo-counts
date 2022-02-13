# Repo Counts
Tool for reporting amount of a code in repositories, with an option of generating counts over time.

## Warning
This tool can generate very, very large amounts of data. Be careful when using `chronicle` together with `detail`.

## Usage

### Node.js
`npx repo-counts -h` - lists available options with description

`npx repo-counts` - counts current dir

`npx repo-counts -r <dir1> <dir2>` - counts selected dirs

### Deno
Not supported yet - this tool uses node.js api that isn't available in `std/node` library. That said, I'm testing the tool by running:

`deno run --unstable --compat --allow-env --import-map=./import_map.json .\src\index.mjs`

## TODO
1. Allow skipping first n commits. This is helpful when initial commits are more of a POS or setting up stuff.
2. Allow specifying a time period instead of a whole timeline.
3. ~Display more data in html output (on hover?).~ - done
4. Allow configuring colors.
5. Allow defyining config file, that can hold repeatable congfiguration - implemented, not tested.
6. Implement option for ignoring extensions and folder names.
7. Allow probing repositories not on disk - using github API or other services.
8. Check quantity queries and media queries to move more logic to CSS.
9. All errors should be reported to a separate file
10. CSV output should not use ids for authors and dates, but labels.
11. Series/periods descriptions under the chart should adapt to their amount and sreen size.
12. Allow details to specify author, date, extension or fileName instead of always being extension.
