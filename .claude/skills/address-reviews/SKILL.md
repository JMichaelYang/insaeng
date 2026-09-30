---
name: address-reviews
description: Use when the user asks to address, respond to, or work through review comments on a PR.
---

1. Read unresolved threads:
   ```
   gh api graphql -F owner='{owner}' -F repo='{repo}' -F pr=<n> -f query='query($owner:String!,$repo:String!,$pr:Int!){repository(owner:$owner,name:$repo){pullRequest(number:$pr){reviewThreads(first:100){nodes{isResolved path line comments(first:20){nodes{databaseId author{login} body}}}}}}}' --jq '.data.repository.pullRequest.reviewThreads.nodes | map(select(.isResolved|not))'
   ```
2. On the PR's branch, fix every clear, actionable comment, then commit and push.
3. Reply to each thread's first comment with `gh api repos/{owner}/{repo}/pulls/<n>/comments/<databaseId>/replies -f body="<reply>"`:
   - Addressed: one line on what changed.
   - Unclear or multiple approaches: a concise question, listing the options when there are some. Don't change code for these.
