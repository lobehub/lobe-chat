#!/bin/bash
set -e

# Function to log error messages and exit
log_error() {
  local message="$1"
  local exit_code="${2:-1}"
  echo "::error::$message"
  echo "Error details have been logged."
  exit "$exit_code"
}

# Script to sync with upstream repository while honoring .gitattributes
#
# Features:
# - Only fetches the specific branch from upstream (no tags or other branches)
# - Handles "refusing to merge unrelated histories" error with --allow-unrelated-histories flag
# - Honors .gitattributes merge strategies
# - Dynamically parses .gitattributes to determine merge strategies for conflicting files
# - Automatically resolves merge conflicts according to .gitattributes rules
# - Provides fallback strategy for files not specified in .gitattributes
# - Handles both exact file matches and directory wildcard patterns (e.g., changelog/*)
# - Provides detailed error reporting for troubleshooting
# - Uses portable shell commands that work across different environments (Bash 3.x and 4.x)
# - Safely handles reference cleanup to avoid ambiguity errors
#
# Parameters:
# $1 - Upstream repository (e.g., "lobehub/lobe-chat")
# $2 - Upstream branch (e.g., "main")
# $3 - Target branch (e.g., "main")

# Check if all required parameters are provided
if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
  log_error "Missing required parameters. Usage: $0 <upstream_repo> <upstream_branch> <target_branch>"
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

# Clean up any existing upstream references to avoid ambiguity
for ref in $(git for-each-ref --format="%(refname)" refs/remotes/upstream); do
  git update-ref -d "$ref" || echo "Note: Could not delete reference $ref (it may not exist yet)"
done
echo "Cleaned up existing upstream references"

# Fetch only the specific branch from upstream (no tags or other branches)
echo "Fetching only $UPSTREAM_BRANCH branch from upstream (no tags or other branches)..."
git fetch upstream "$UPSTREAM_BRANCH":refs/remotes/upstream/$UPSTREAM_BRANCH --no-tags || {
  echo "Remote references before fetch attempt:"
  git for-each-ref refs/remotes/

  echo "Upstream remote details:"
  git remote -v

  log_error "Failed to fetch from upstream repository. This could be due to network issues, repository access problems, or the branch '$UPSTREAM_BRANCH' may not exist in the upstream repository."
}
echo "Successfully fetched $UPSTREAM_BRANCH branch from upstream"

# Get the current commit hash before merging
BEFORE_COMMIT=$(git rev-parse HEAD)

# Checkout the target branch
git checkout $TARGET_BRANCH
echo "Checked out target branch: $TARGET_BRANCH"

# Function to parse .gitattributes file and extract merge strategies
parse_gitattributes() {
  local gitattributes_file=".gitattributes"

  if [ ! -f "$gitattributes_file" ]; then
    echo "Warning: .gitattributes file not found"
    return 1
  fi

  # Read .gitattributes file and extract merge strategies
  # Output format: pattern:strategy
  while IFS= read -r line; do
    # Skip comments and empty lines
    if [[ "$line" =~ ^[[:space:]]*# || -z "${line// }" ]]; then
      continue
    fi

    # Extract file pattern and merge strategy using grep and cut
    # This is more portable than using bash regex
    if echo "$line" | grep -q "merge="; then
      local pattern=$(echo "$line" | awk '{print $1}')
      local strategy=$(echo "$line" | grep -o "merge=[^ ]*" | cut -d= -f2)
      echo "$pattern:$strategy"
      echo "Found merge strategy for $pattern: $strategy" >&2
    fi
  done < "$gitattributes_file"
}

# Function to resolve conflicts for a specific file based on its merge strategy
resolve_conflict() {
  local file="$1"
  local strategy="$2"

  echo "Resolving conflict in $file using '$strategy' strategy..."

  case "$strategy" in
    "ours")
      git checkout --ours -- "$file"
      ;;
    "theirs")
      git checkout --theirs -- "$file"
      ;;
    "union")
      git checkout --merge -- "$file"
      ;;
    *)
      echo "Warning: Unknown merge strategy '$strategy' for $file, using 'ours' as default"
      git checkout --ours -- "$file"
      ;;
  esac

  git add "$file"
}

# Function to find the best matching pattern for a file
find_matching_pattern() {
  local file="$1"
  local best_match=""
  local best_match_strategy=""

  # Create a temporary file to store the output of parse_gitattributes
  local tmp_file=$(mktemp)
  parse_gitattributes > "$tmp_file"

  # Read the patterns and strategies from the temporary file
  while IFS=: read -r pattern strategy; do
    # Skip empty lines or lines without a pattern or strategy
    if [ -z "$pattern" ] || [ -z "$strategy" ]; then
      continue
    fi

    # Exact match
    if [ "$pattern" = "$file" ]; then
      best_match="$pattern"
      best_match_strategy="$strategy"
      break
    fi

    # Directory wildcard match (e.g., changelog/*)
    if echo "$pattern" | grep -q "/\*$"; then
      local dir_pattern=$(echo "$pattern" | sed 's/\*$//')
      if echo "$file" | grep -q "^$dir_pattern"; then
        best_match="$pattern"
        best_match_strategy="$strategy"
      fi
    fi
  done < "$tmp_file"

  # Clean up the temporary file
  rm -f "$tmp_file"

  if [ -n "$best_match" ]; then
    echo "$best_match_strategy"
  else
    echo ""
  fi
}

# Merge upstream changes
# This will honor .gitattributes because we're using native git commands
echo "Merging upstream changes from $UPSTREAM_REPO/$UPSTREAM_BRANCH"
git merge "refs/remotes/upstream/$UPSTREAM_BRANCH" --no-edit --allow-unrelated-histories || {
  echo "Merge failed. Attempting to resolve conflicts automatically..."

  # Get list of conflicting files
  CONFLICTING_FILES=$(git ls-files -u | cut -f2 | sort -u)

  # Process each conflicting file
  for file in $CONFLICTING_FILES; do
    strategy=$(find_matching_pattern "$file")

    if [ -n "$strategy" ]; then
      resolve_conflict "$file" "$strategy"
    else
      echo "Warning: No merge strategy found for $file in .gitattributes, using 'ours' as default"
      resolve_conflict "$file" "ours"
    fi
  done

  # Check if there are any remaining unmerged files
  if [ -n "$(git ls-files -u)" ]; then
    echo "There are still unresolved conflicts. Listing conflicting files:"
    REMAINING_CONFLICTS=$(git ls-files -u | cut -f2 | sort -u)
    echo "$REMAINING_CONFLICTS"

    # Get more details about the conflicts for diagnostics
    echo "Conflict details:"
    for file in $REMAINING_CONFLICTS; do
      echo "Conflict in $file:"
      git diff --check "$file" || true
    done

    log_error "Failed to automatically resolve all merge conflicts. Manual intervention required."
  fi

  # Continue with the merge by creating a commit
  git commit -m "Merge upstream changes from $UPSTREAM_REPO/$UPSTREAM_BRANCH with automatic conflict resolution" || {
    # Get the git status for diagnostics
    echo "Git status:"
    git status

    log_error "Failed to commit merge changes. This might be due to unresolved conflicts or git configuration issues."
  }
}

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
