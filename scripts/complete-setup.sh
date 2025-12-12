#!/bin/bash

# Complete Setup Script for AI Visibility Platform
# This script helps you set up everything step by step

echo "🚀 AI Visibility Platform - Complete Setup"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating one..."
    cat > .env << 'EOF'
# AI Visibility Analysis Platform - Environment Variables
DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"

# OpenAI API Key (for ChatGPT)
# Get your key at: https://platform.openai.com/api-keys
OPENAI_API_KEY=""

# Anthropic API Key (for Claude)
# Get your key at: https://console.anthropic.com/
ANTHROPIC_API_KEY=""

# Google AI API Key (for Gemini)
# Get your key at: https://makersuite.google.com/app/apikey
GOOGLE_AI_API_KEY=""
EOF
    echo "✅ Created .env file"
fi

echo ""
echo "📋 Setup Checklist:"
echo ""
echo "1. Get your API keys:"
echo "   - OpenAI:    https://platform.openai.com/api-keys"
echo "   - Anthropic: https://console.anthropic.com/"
echo "   - Google AI: https://makersuite.google.com/app/apikey"
echo ""
echo "2. Add keys to .env file (or use: node scripts/setup-env.js)"
echo ""
echo "3. Set up database (Supabase or Neon - see COMPLETE_SETUP.md)"
echo ""
echo "4. Run migrations:"
echo "   npx prisma generate"
echo "   npx prisma migrate dev"
echo ""
echo "5. Verify setup:"
echo "   npm run check:keys"
echo ""
echo "6. Start the app:"
echo "   npm run dev"
echo ""
echo "📖 For detailed instructions, see COMPLETE_SETUP.md"
echo ""

# Check current status
echo "🔍 Current Status:"
echo ""
npm run check:keys 2>/dev/null || echo "Run 'npm run check:keys' to see current status"
echo ""

