#!/bin/bash

# Create Worktree Script
# Usage: ./scripts/create-worktree.sh <PR_NUMBER> <SHORT_NAME> <PR_TITLE>
# Example: ./scripts/create-worktree.sh 5 "login-signup-ui" "Login/Signup UI"

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check arguments
if [ "$#" -ne 3 ]; then
    echo -e "${RED}Error: Invalid number of arguments${NC}"
    echo "Usage: $0 <PR_NUMBER> <SHORT_NAME> <PR_TITLE>"
    echo "Example: $0 5 \"login-signup-ui\" \"Login/Signup UI\""
    exit 1
fi

PR_NUMBER=$1
SHORT_NAME=$2
PR_TITLE=$3
PREV_PR_NUMBER=$((PR_NUMBER - 1))

# Paths
REPO_ROOT="/Users/usmanaven.com/math-games"
WORKTREE_ROOT="/Users/usmanaven.com/math-games-worktrees"
WORKTREE_PATH="${WORKTREE_ROOT}/pr-${PR_NUMBER}-${SHORT_NAME}"
BRANCH_NAME="feature/pr-${PR_NUMBER}-${SHORT_NAME}"

# Find the base branch (previous PR)
PREV_BRANCH="feature/pr-${PREV_PR_NUMBER}-"
PREV_BRANCH_FULL=$(git -C "$REPO_ROOT" branch -r | grep "$PREV_BRANCH" | head -1 | sed 's/.*origin\///' | xargs)

if [ -z "$PREV_BRANCH_FULL" ]; then
    echo -e "${YELLOW}Warning: Could not find PR #${PREV_PR_NUMBER} branch${NC}"
    echo -e "${YELLOW}Using main branch as base${NC}"
    PREV_BRANCH_FULL="main"
fi

echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}Creating Worktree for PR #${PR_NUMBER}${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""
echo -e "${GREEN}PR Number:${NC} ${PR_NUMBER}"
echo -e "${GREEN}Short Name:${NC} ${SHORT_NAME}"
echo -e "${GREEN}PR Title:${NC} ${PR_TITLE}"
echo -e "${GREEN}Worktree Path:${NC} ${WORKTREE_PATH}"
echo -e "${GREEN}Branch Name:${NC} ${BRANCH_NAME}"
echo -e "${GREEN}Base Branch:${NC} ${PREV_BRANCH_FULL}"
echo ""

# Create worktree root if it doesn't exist
if [ ! -d "$WORKTREE_ROOT" ]; then
    echo -e "${YELLOW}Creating worktree root directory...${NC}"
    mkdir -p "$WORKTREE_ROOT"
fi

# Check if worktree already exists
if [ -d "$WORKTREE_PATH" ]; then
    echo -e "${RED}Error: Worktree already exists at ${WORKTREE_PATH}${NC}"
    echo "Remove it first with: git worktree remove ${WORKTREE_PATH}"
    exit 1
fi

# Fetch latest changes
echo -e "${YELLOW}Fetching latest changes from remote...${NC}"
cd "$REPO_ROOT"
git fetch origin

# Create worktree
echo -e "${YELLOW}Creating worktree...${NC}"
git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME" "$PREV_BRANCH_FULL"

# Navigate to game directory and install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
cd "${WORKTREE_PATH}/games/number-line-adventure"
pnpm install

echo ""
echo -e "${GREEN}✅ Worktree created successfully!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "1. Navigate to worktree:"
echo -e "   ${YELLOW}cd ${WORKTREE_PATH}${NC}"
echo ""
echo -e "2. Start development server:"
echo -e "   ${YELLOW}cd games/number-line-adventure && pnpm run dev${NC}"
echo ""
echo -e "3. Make your changes, then commit:"
echo -e "   ${YELLOW}git add .${NC}"
echo -e "   ${YELLOW}git commit -m \"feat(PR#${PR_NUMBER}): ${PR_TITLE}\"${NC}"
echo ""
echo -e "4. Push to remote:"
echo -e "   ${YELLOW}git push -u origin ${BRANCH_NAME}${NC}"
echo ""
echo -e "5. Create pull request with @codex review:"
echo -e "   ${YELLOW}gh pr create --base ${PREV_BRANCH_FULL} --title \"PR #${PR_NUMBER}: ${PR_TITLE}\" --body \"...${NC}"
echo -e "   ${YELLOW}@codex Please review...\"${NC}"
echo ""
echo -e "${BLUE}Worktree Info:${NC}"
git worktree list | grep "pr-${PR_NUMBER}"
