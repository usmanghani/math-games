# Scripts Directory

This directory contains automation scripts for the math-games project.

## Available Scripts

### 1. create-worktree.sh

Creates a new git worktree for a PR with automatic setup.

**Usage:**
```bash
./scripts/create-worktree.sh <PR_NUMBER> <SHORT_NAME> <PR_TITLE>
```

**Example:**
```bash
./scripts/create-worktree.sh 6 "profile-management" "Profile Setup & Management"
```

**What it does:**
1. Creates worktree at `/Users/usmanaven.com/math-games-worktrees/pr-N-name`
2. Creates branch `feature/pr-N-name` based on previous PR
3. Installs dependencies with `pnpm install`
4. Displays next steps for development

**Arguments:**
- `PR_NUMBER`: The PR number (e.g., 5, 6, 7)
- `SHORT_NAME`: Short descriptive name (e.g., "login-signup-ui")
- `PR_TITLE`: Full PR title (e.g., "Login/Signup UI")

## Quick Start

### Create a New PR Worktree

```bash
# Navigate to main repo
cd /Users/usmanaven.com/math-games

# Run script to create PR #6
./scripts/create-worktree.sh 6 "profile-management" "Profile Setup & Management"

# Follow the displayed next steps!
```

### Manual Worktree Creation

If you prefer to create worktrees manually:

```bash
# Create worktree
git worktree add \
  /Users/usmanaven.com/math-games-worktrees/pr-6-profile-management \
  -b feature/pr-6-profile-management \
  feature/pr-5-login-signup-ui

# Install dependencies
cd /Users/usmanaven.com/math-games-worktrees/pr-6-profile-management/games/number-line-adventure
pnpm install
```

## Common Commands

### List All Worktrees
```bash
git worktree list
```

### Remove a Worktree
```bash
git worktree remove /Users/usmanaven.com/math-games-worktrees/pr-5-login-signup-ui
```

### Clean Up Stale References
```bash
git worktree prune
```

## Adding @codex Review to PRs

When creating a PR, add `@codex` review request in the PR description:

```bash
gh pr create \
  --base feature/pr-5-login-signup-ui \
  --title "PR #6: Profile Management" \
  --body "Description of changes...

@codex Please review this PR for:
- Component design and usability
- State management patterns
- Error handling
- Code quality and best practices"
```

## Directory Structure

```
/Users/usmanaven.com/
├── math-games/                          ← Main repository
│   ├── scripts/                         ← This directory
│   │   ├── create-worktree.sh          ← Worktree creation script
│   │   └── README.md                   ← This file
│   └── WORKTREE_GUIDE.md               ← Complete worktree guide
│
└── math-games-worktrees/                ← All PR worktrees
    ├── pr-1-database-schema/
    ├── pr-2-level-configuration/
    ├── pr-3-problem-generator/
    ├── pr-4-auth-setup/
    ├── pr-5-login-signup-ui/           ← Currently active
    └── pr-6-profile-management/        ← Next to create
```

## Tips

1. **Always run from main repo root**: `cd /Users/usmanaven.com/math-games`
2. **Use descriptive short names**: "login-ui" not "ui" or "login-signup-ui" not "login"
3. **Install deps per worktree**: Each worktree needs its own `node_modules`
4. **Clean up merged PRs**: Remove worktrees after PRs are merged

## Troubleshooting

### Script Permission Denied

```bash
chmod +x /Users/usmanaven.com/math-games/scripts/create-worktree.sh
```

### Worktree Already Exists

```bash
git worktree remove /Users/usmanaven.com/math-games-worktrees/pr-N-name
```

### Base Branch Not Found

The script tries to find the previous PR's branch. If it fails, it falls back to `main`.
You can manually specify a different base branch by editing the script or creating the worktree manually.

## More Information

See [WORKTREE_GUIDE.md](../WORKTREE_GUIDE.md) for:
- Detailed worktree concepts
- Advanced workflows
- Best practices
- Complete examples
