#!/bin/bash

# Script to push to GitHub with Personal Access Token

echo "🚀 Pushing to GitHub: Kadri-Git/ai-agency"
echo ""

# Check if token is provided as argument
if [ -z "$1" ]; then
    echo "Usage: ./push-to-github.sh YOUR_GITHUB_TOKEN"
    echo ""
    echo "To get a token:"
    echo "1. Go to: https://github.com/settings/tokens"
    echo "2. Click 'Generate new token (classic)'"
    echo "3. Select 'repo' scope"
    echo "4. Copy the token"
    echo ""
    echo "Then run: ./push-to-github.sh YOUR_TOKEN"
    exit 1
fi

TOKEN=$1

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


