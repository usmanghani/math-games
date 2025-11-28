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

### 2. simulate-gameplay.ts

Simulates playing the Number Line Adventure game with different performance scenarios.

**Usage:**
```bash
npx tsx scripts/simulate-gameplay.ts [scenario]
```

**Scenarios:**
- `perfect` - Perfect play (100% accuracy) - default
- `mixed` - Mixed performance (70% accuracy)
- `struggling` - Struggling player (50% accuracy)
- `all` - Run all scenarios sequentially

**Examples:**
```bash
# Run perfect scenario (default)
npx tsx scripts/simulate-gameplay.ts

# Run mixed performance scenario
npx tsx scripts/simulate-gameplay.ts mixed

# Run struggling player scenario
npx tsx scripts/simulate-gameplay.ts struggling

# Run all scenarios
npx tsx scripts/simulate-gameplay.ts all
```

**What it does:**
1. Simulates playing 3 levels (Levels 1, 2, 3)
2. Generates 5 problems per level using the actual game logic
3. Simulates player answers based on the selected scenario
4. Shows round-by-round results with correct/incorrect answers
5. Displays session summaries with accuracy and streak tracking
6. Provides overall statistics across all levels

**Output:**
- Detailed round-by-round gameplay
- Session summaries per level
- Overall statistics across all scenarios
- Pass/fail status based on 60% accuracy requirement

## Quick Start

### Create a New PR Worktree

```bash
# Navigate to main repo
cd /Users/usmanaven.com/math-games

# Run script to create PR #6
./scripts/create-worktree.sh 6 "profile-management" "Profile Setup & Management"

# Follow the displayed next steps!
```

### Simulate Gameplay

```bash
# Navigate to main repo
cd /Users/usmanaven.com/math-games

# Run simulation with default (perfect) scenario
npx tsx scripts/simulate-gameplay.ts

# Or run all scenarios
npx tsx scripts/simulate-gameplay.ts all
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

## Directory Structure

```
/Users/usmanaven.com/
├── math-games/                          ← Main repository
│   ├── scripts/                         ← This directory
│   │   ├── create-worktree.sh          ← Worktree creation script
│   │   ├── simulate-gameplay.ts       ← Gameplay simulation script
│   │   └── README.md                   ← This file
│   └── WORKTREE_GUIDE.md               ← Complete worktree guide
│
└── math-games-worktrees/                ← All PR worktrees
    ├── pr-1-database-schema/
    ├── pr-2-level-configuration/
    └── ...
```

## Tips

1. **Always run from main repo root**: `cd /Users/usmanaven.com/math-games`
2. **Use descriptive short names**: "login-ui" not "ui" or "login-signup-ui" not "login"
3. **Install deps per worktree**: Each worktree needs its own `node_modules`
4. **Clean up merged PRs**: Remove worktrees after PRs are merged
5. **Simulation script uses actual game logic**: Results reflect real gameplay mechanics

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

### Simulation Script Errors

If you see Supabase warnings, that's normal - the script uses fallback level configurations when Supabase isn't configured.

## More Information

See [WORKTREE_GUIDE.md](../WORKTREE_GUIDE.md) for:
- Detailed worktree concepts
- Advanced workflows
- Best practices
- Complete examples
