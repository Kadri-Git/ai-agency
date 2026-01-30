#!/bin/bash

# Script to push to GitHub with Personal Access Token

echo "🚀 Pushing to GitHub: Kadri-Git/ai-agency"
echo ""

# Try to get token from environment variable or .env file
if [ -n "$GITHUB_TOKEN" ]; then
    TOKEN=$GITHUB_TOKEN
elif [ -f .env ]; then
    # Try to extract GITHUB_TOKEN from .env file
    TOKEN=$(grep "^GITHUB_TOKEN=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
fi

# Use provided token as argument, or from environment/.env, or prompt
if [ -n "$1" ]; then
    TOKEN=$1
elif [ -z "$TOKEN" ]; then
    echo "❌ No GitHub token found!"
    echo ""
    echo "Please provide a token in one of these ways:"
    echo "1. Set GITHUB_TOKEN environment variable"
    echo "2. Add GITHUB_TOKEN to your .env file"
    echo "3. Pass token as argument: ./push-to-github.sh YOUR_TOKEN"
    echo ""
    exit 1
fi

# Set remote with token
git remote set-url origin https://${TOKEN}@github.com/Kadri-Git/ai-agency.git

# Push
echo "Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🔗 Repository: https://github.com/Kadri-Git/ai-agency"
else
    echo ""
    echo "❌ Push failed. Check your token and try again."
fi



