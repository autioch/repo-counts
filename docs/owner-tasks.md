# Owner tasks

Manual steps only the owner can do. Agents add items here at close-out; the owner removes them when
done.

- **Publish 0.3.2** — `master` holds the 0.3.2 fixes (npm ci, Db restore, `--dry`, `--version`) but npm
  `latest` is still 0.3.1. Run the [release runbook](standards/development.md#releasing) with
  `npm version patch`.
- **Fix the shell-injection open issue before or with the next release** —
  [TODO.md T1](../TODO.md#security). Until then, `--detail` is unsafe on
  repositories you didn't write.
