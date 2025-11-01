#!/bin/bash

# ====================================================================
# Setup Script: Install Pre-Commit Hook
# Purpose: Automatically installs the AI code review pre-commit hook
# Usage: ./setup-pre-commit.sh
# ====================================================================

set -e

echo "🚀 Setting up AI Code Review Pre-Commit Hook..."

# Check if git repository exists
if [ ! -d ".git" ]; then
  echo "❌ Error: Not a git repository. Please run this script from the root of your git repository."
  exit 1
fi

# Check if server is running
echo "🔍 Checking if server is running..."
if ! curl --silent --fail http://localhost:3001 >/dev/null 2>&1; then
  echo "⚠️  Warning: Server is not running on port 3001."
  echo "   Please start the server first: cd server && npm run dev"
  read -p "   Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Download pre-commit hook from API
echo "📥 Downloading pre-commit hook..."
if curl -s http://localhost:3001/api/pre-commit-hook > .git/hooks/pre-commit; then
  echo "✅ Pre-commit hook downloaded successfully!"
else
  echo "❌ Failed to download pre-commit hook."
  echo "   Make sure the server is running and try again."
  exit 1
fi

# Make it executable
chmod +x .git/hooks/pre-commit
echo "✅ Pre-commit hook is now executable."

# Check if jq is installed (required for the hook)
if ! command -v jq &> /dev/null; then
  echo "⚠️  Warning: 'jq' is not installed."
  echo "   The pre-commit hook requires 'jq' to work."
  echo "   Install it with:"
  echo "   - macOS: brew install jq"
  echo "   - Ubuntu/Debian: sudo apt-get install jq"
  echo "   - Fedora: sudo dnf install jq"
  exit 1
fi

echo ""
echo "✅ Pre-commit hook installed successfully!"
echo ""
echo "📝 The hook will now run automatically before each commit."
echo "   Make sure your server is running on port 3001 when committing."
echo ""
echo "🧪 Test it by staging some files and running: git commit"

