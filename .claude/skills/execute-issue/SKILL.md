---
name: execute-issue
description: Use when the user asks to implement, execute, or pick up a GitHub issue in the current repo.
---

1. Read it: `gh issue view <n> --json title,body,comments`.
2. Assign it: `gh issue edit <n> --add-assignee @me`.
3. Create a worktree, then implement the issue there and commit.
4. Push and open a PR whose body is ONLY `Closes #<n>`: `gh pr create --title "<title>" --body "Closes #<n>"`.
5. Reply with the PR URL.
