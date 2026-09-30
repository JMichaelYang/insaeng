---
name: cleanup-issue
description: Use when the user says an issue's PR has merged and asks to clean up after it.
---

1. Find the PR: `gh pr list --state all --search '"Closes #<n>" in:body' --json number,state,headRefName`. Stop unless its state is `MERGED`.
2. Close the issue if still open: `gh issue close <n>`.
3. Remove the local worktree and branch for `headRefName` (exit the worktree first if the session is in it); use `git branch -D` since squash merges defeat `-d`.
4. Last, in the main checkout: check out the default branch and `git pull --ff-only --prune`.
