#!/usr/bin/env node

/**
 * Setup script to add API keys to .env file
 * Usage: node scripts/setup-env.js
 */

const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env')

// Get keys from command line arguments or environment
const openaiKey = process.argv[2] || process.env.OPENAI_KEY
const anthropicKey = process.argv[3] || process.env.ANTHROPIC_KEY
const googleKey = process.argv[4] || process.env.GOOGLE_KEY

function updateEnvFile() {
  let envContent = ''
  
  // Read existing .env if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8')
  } else {
    // Create basic structure
    envContent = `# AI Visibility Analysis Platform - Environment Variables
# Database Connection
DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"

`
  }

  // Update or add OpenAI key
  if (openaiKey) {
    if (envContent.includes('OPENAI_API_KEY=')) {
      envContent = envContent.replace(
        /OPENAI_API_KEY=.*/,
        `OPENAI_API_KEY="${openaiKey}"`
      )
    } else {
      if (!envContent.endsWith('\n')) envContent += '\n'
      envContent += `# OpenAI API Key (for ChatGPT)
# Get your key at: https://platform.openai.com/api-keys
OPENAI_API_KEY="${openaiKey}"

`
    }
    console.log('✅ OpenAI API key added')
  }

  // Update or add Anthropic key
  if (anthropicKey) {
    if (envContent.includes('ANTHROPIC_API_KEY=')) {
      envContent = envContent.replace(
        /ANTHROPIC_API_KEY=.*/,
        `ANTHROPIC_API_KEY="${anthropicKey}"`
      )
    } else {
      if (!envContent.endsWith('\n')) envContent += '\n'
      envContent += `# Anthropic API Key (for Claude)
# Get your key at: https://console.anthropic.com/
ANTHROPIC_API_KEY="${anthropicKey}"

`
    }
    console.log('✅ Anthropic API key added')
  }

  // Update or add Google AI key
  if (googleKey) {
    if (envContent.includes('GOOGLE_AI_API_KEY=')) {
      envContent = envContent.replace(
        /GOOGLE_AI_API_KEY=.*/,
        `GOOGLE_AI_API_KEY="${googleKey}"`
      )
    } else {
      if (!envContent.endsWith('\n')) envContent += '\n'
      envContent += `# Google AI API Key (for Gemini)
# Get your key at: https://makersuite.google.com/app/apikey
GOOGLE_AI_API_KEY="${googleKey}"

`
    }
    console.log('✅ Google AI API key added')
  }

  // Write updated content
  fs.writeFileSync(envPath, envContent, 'utf8')
  console.log('\n✅ .env file updated successfully!')
}

if (openaiKey || anthropicKey || googleKey) {
  updateEnvFile()
} else {
  console.log('Usage: node scripts/setup-env.js [OPENAI_KEY] [ANTHROPIC_KEY] [GOOGLE_KEY]')
  console.log('Example: node scripts/setup-env.js sk-xxx sk-ant-xxx AIza-xxx')
  process.exit(1)
}


