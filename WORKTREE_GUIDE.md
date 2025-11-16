# Git Worktree Workflow Guide

This guide explains how to use git worktrees for parallel PR development.

## Overview

We use separate worktrees for each PR to enable:
- **Parallel development**: Work on multiple PRs simultaneously
- **No branch switching**: Each worktree has its own branch
- **Independent builds**: Each worktree has its own node_modules
- **Easy comparison**: Compare changes across PRs easily

## Directory Structure

```
/Users/usmanaven.com/math-games/                    ← Main repo
/Users/usmanaven.com/math-games-worktrees/
├── pr-1-database-schema/
├── pr-2-level-configuration/
├── pr-3-problem-generator/
├── pr-4-auth-setup/
├── pr-5-login-signup-ui/
├── pr-6-profile-management/
└── ... (future PRs)
```

## Creating a New Worktree for a PR

### Manual Method

```bash
# Create worktree for a new PR based on previous PR
cd /Users/usmanaven.com/math-games

git worktree add \
  /Users/usmanaven.com/math-games-worktrees/pr-N-short-name \
  -b feature/pr-N-descriptive-name \
  feature/pr-(N-1)-previous-pr-name

# Example: Create PR #5 worktree based on PR #4
git worktree add \
  /Users/usmanaven.com/math-games-worktrees/pr-5-login-signup-ui \
  -b feature/pr-5-login-signup-ui \
  feature/pr-4-supabase-auth-setup
```

### Using the Automation Script

```bash
# Run the create-worktree script
./scripts/create-worktree.sh 5 "login-signup-ui" "Login/Signup UI"

# This will:
# 1. Create worktree at /Users/usmanaven.com/math-games-worktrees/pr-5-login-signup-ui
# 2. Create branch feature/pr-5-login-signup-ui based on PR #4
# 3. Install dependencies (pnpm install)
# 4. Display next steps
```

## Working in a Worktree

### Navigate to Worktree

```bash
cd /Users/usmanaven.com/math-games-worktrees/pr-5-login-signup-ui
```

### Verify Branch

```bash
git status
# On branch feature/pr-5-login-signup-ui
```

### Install Dependencies (First Time Only)

```bash
cd games/number-line-adventure
pnpm install
```

### Make Changes

```bash
# Create/edit files
# Make your changes

# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "feat(PR#5): Description"

# Push
git push -u origin feature/pr-5-login-signup-ui
```

### Create Pull Request

```bash
# Create PR with @codex review
gh pr create \
  --base feature/pr-4-supabase-auth-setup \
  --title "PR #5: Login/Signup UI" \
  --body "Description...

@codex Please review this PR for:
- Component design and usability
- Form validation implementation
- Error handling
- Accessibility features
- Code quality"
```

## Managing Worktrees

### List All Worktrees

```bash
git worktree list
```

### Remove a Worktree (When PR is Merged)

```bash
# Remove the worktree directory
git worktree remove /Users/usmanaven.com/math-games-worktrees/pr-5-login-signup-ui

# Or if you need to force remove
git worktree remove --force /Users/usmanaven.com/math-games-worktrees/pr-5-login-signup-ui

# Prune stale worktree references
git worktree prune
```

### Clean Up Old Branches (After Merge)

```bash
# Delete local branch
git branch -d feature/pr-5-login-signup-ui

# Delete remote branch (after PR merged)
git push origin --delete feature/pr-5-login-signup-ui
```

## Common Workflows

### Scenario 1: Building PR #6 (Profile Management)

```bash
# 1. Create worktree based on PR #5
cd /Users/usmanaven.com/math-games
git worktree add \
  /Users/usmanaven.com/math-games-worktrees/pr-6-profile-management \
  -b feature/pr-6-profile-management \
  feature/pr-5-login-signup-ui

# 2. Navigate and install deps
cd /Users/usmanaven.com/math-games-worktrees/pr-6-profile-management/games/number-line-adventure
pnpm install

# 3. Build and develop
pnpm run dev
# Make changes...

# 4. Commit and push
git add .
git commit -m "feat(PR#6): Add profile management"
git push -u origin feature/pr-6-profile-management

# 5. Create PR with @codex
gh pr create --base feature/pr-5-login-signup-ui --title "PR #6: Profile Management" --body "...

@codex Please review..."
```

### Scenario 2: Hot Fix on PR #3 While Working on PR #5

```bash
# Your current work in PR #5 is safe in its worktree

# Navigate to PR #3 worktree (if exists) or main repo
cd /Users/usmanaven.com/math-games
git checkout feature/pr-3-update-problem-generator

# Make fix
# ... edit files ...

# Commit and push
git add .
git commit -m "fix(PR#3): Description"
git push

# Go back to PR #5
cd /Users/usmanaven.com/math-games-worktrees/pr-5-login-signup-ui

# Your PR #5 work is still there, untouched!
```

### Scenario 3: Compare Changes Across PRs

```bash
# Compare PR #4 and PR #5
cd /Users/usmanaven.com/math-games

git diff \
  feature/pr-4-supabase-auth-setup \
  feature/pr-5-login-signup-ui \
  -- games/number-line-adventure/src/

# Or open both in editor side-by-side
code /Users/usmanaven.com/math-games-worktrees/pr-4-auth-setup
code /Users/usmanaven.com/math-games-worktrees/pr-5-login-signup-ui
```

## Best Practices

### 1. One Worktree Per PR

Each PR gets its own worktree for isolation.

### 2. Name Consistently

Use format: `pr-N-short-descriptive-name`

Examples:
- `pr-1-database-schema`
- `pr-5-login-signup-ui`
- `pr-10-level-selection`

### 3. Install Dependencies Per Worktree

Each worktree should have its own `node_modules`:

```bash
cd /Users/usmanaven.com/math-games-worktrees/pr-5-login-signup-ui/games/number-line-adventure
pnpm install
```

### 4. Keep Worktrees Updated

If base branch (e.g., PR #4) is updated:

```bash
cd /Users/usmanaven.com/math-games-worktrees/pr-5-login-signup-ui
git fetch origin
git rebase origin/feature/pr-4-supabase-auth-setup
```

### 5. Clean Up After Merge

Remove worktrees for merged PRs:

```bash
git worktree remove /Users/usmanaven.com/math-games-worktrees/pr-5-login-signup-ui
git worktree prune
```

## Troubleshooting

### "fatal: 'path' is already checked out"

This means the branch is already checked out in another worktree.

**Solution**: Use a different branch name or remove the existing worktree.

### "Cannot remove worktree, contains modifications"

**Solution**: Commit or stash changes first, or use `--force`:

```bash
git worktree remove --force /path/to/worktree
```

### "Permission denied" or "Directory not empty"

**Solution**: Ensure you're not inside the worktree directory:

```bash
cd /Users/usmanaven.com/math-games
git worktree remove /Users/usmanaven.com/math-games-worktrees/pr-5-login-signup-ui
```

### Worktree Out of Sync

If worktree is out of sync with remote:

```bash
cd /Users/usmanaven.com/math-games-worktrees/pr-5-login-signup-ui
git fetch origin
git status
git pull origin feature/pr-5-login-signup-ui
```

## Quick Reference

### Create Worktree
```bash
git worktree add <path> -b <branch> <base-branch>
```

### List Worktrees
```bash
git worktree list
```

### Remove Worktree
```bash
git worktree remove <path>
```

### Prune Stale Worktrees
```bash
git worktree prune
```

### Navigate to Worktree
```bash
cd /Users/usmanaven.com/math-games-worktrees/pr-N-name
```

## Examples for Current PRs

### Create Worktrees for Existing PRs (If Needed)

```bash
# PR #1
git worktree add /Users/usmanaven.com/math-games-worktrees/pr-1-database-schema feature/pr-1-database-schema-and-seed-data

# PR #2
git worktree add /Users/usmanaven.com/math-games-worktrees/pr-2-level-configuration feature/pr-2-level-configuration-system

# PR #3
git worktree add /Users/usmanaven.com/math-games-worktrees/pr-3-problem-generator feature/pr-3-update-problem-generator

# PR #4
git worktree add /Users/usmanaven.com/math-games-worktrees/pr-4-auth-setup feature/pr-4-supabase-auth-setup

# PR #5 (already created!)
# Already at: /Users/usmanaven.com/math-games-worktrees/pr-5-login-signup-ui
```

## Integration with VS Code / Cursor

### Open Multiple Worktrees

```bash
# Open each worktree in a separate window
code /Users/usmanaven.com/math-games-worktrees/pr-4-auth-setup
code /Users/usmanaven.com/math-games-worktrees/pr-5-login-signup-ui
```

### Use Workspace Files

Create a workspace file to open multiple worktrees:

```json
{
  "folders": [
    {
      "path": "/Users/usmanaven.com/math-games-worktrees/pr-4-auth-setup/games/number-line-adventure"
    },
    {
      "path": "/Users/usmanaven.com/math-games-worktrees/pr-5-login-signup-ui/games/number-line-adventure"
    }
  ]
}
```

Save as `math-games-prs.code-workspace` and open in VS Code.

## Summary

Worktrees allow you to:
- ✅ Work on multiple PRs simultaneously without branch switching
- ✅ Keep each PR's changes isolated
- ✅ Run builds/tests in parallel
- ✅ Compare changes easily
- ✅ Avoid merge conflicts during development

Use the automation script (`./scripts/create-worktree.sh`) for consistent worktree creation!
