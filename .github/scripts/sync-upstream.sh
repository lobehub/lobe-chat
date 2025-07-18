#!/bin/bash
set -e

# Script to sync with upstream repository while honoring .gitattributes
# Parameters:
# $1 - Upstream repository (e.g., "lobehub/lobe-chat")
# $2 - Upstream branch (e.g., "main")
# $3 - Target branch (e.g., "main")

# Check if all required parameters are provided
if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
  echo "Error: Missing required parameters"
  echo "Usage: $0 <upstream_repo> <upstream_branch> <target_branch>"
  exit 1
fi

UPSTREAM_REPO="$1"
UPSTREAM_BRANCH="$2"
TARGET_BRANCH="$3"

echo "::group::Sync with upstream repository"
echo "Upstream repository: $UPSTREAM_REPO"
echo "Upstream branch: $UPSTREAM_BRANCH"
echo "Target branch: $TARGET_BRANCH"

# Configure git user
git config --global user.name "GitHub Actions"
git config --global user.email "actions@github.com"

# Add upstream repository
git remote add upstream "https://github.com/$UPSTREAM_REPO.git" || true
echo "Added upstream remote"

# Fetch from upstream
git fetch upstream
echo "Fetched from upstream"

# Get the current commit hash before merging
BEFORE_COMMIT=$(git rev-parse HEAD)

# Checkout the target branch
git checkout $TARGET_BRANCH
echo "Checked out target branch: $TARGET_BRANCH"

# Merge upstream changes
# This will honor .gitattributes because we're using native git commands
echo "Merging upstream changes from $UPSTREAM_REPO/$UPSTREAM_BRANCH"
git merge "upstream/$UPSTREAM_BRANCH" --no-edit

# Get the commit hash after merging
AFTER_COMMIT=$(git rev-parse HEAD)

# Check if there were any new commits
if [ "$BEFORE_COMMIT" == "$AFTER_COMMIT" ]; then
  echo "No new commits to sync"
  # Set output for GitHub Actions
  if [ -n "$GITHUB_OUTPUT" ]; then
    echo "has_new_commits=false" >> $GITHUB_OUTPUT
  fi
else
  echo "New commits synced successfully"
  # Set output for GitHub Actions
  if [ -n "$GITHUB_OUTPUT" ]; then
    echo "has_new_commits=true" >> $GITHUB_OUTPUT
  fi

  # Push changes to the target branch
  git push origin $TARGET_BRANCH
  echo "Pushed changes to $TARGET_BRANCH"
fi

echo "::endgroup::"
