#!/usr/bin/env node

/**
 * Helper script to add API keys to .env file
 * Usage: node scripts/add-api-keys.js
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const envPath = path.join(process.cwd(), '.env')

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function main() {
  console.log('\n🔑 API Keys Setup Helper\n')
  console.log('This script will help you add API keys to your .env file.\n')

  // Read existing .env
  let envContent = ''
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8')
  }

  // Check what's already configured
  const hasOpenAI = envContent.includes('OPENAI_API_KEY=') && 
                    !envContent.match(/OPENAI_API_KEY=["']?\s*["']?$/m)
  const hasAnthropic = envContent.includes('ANTHROPIC_API_KEY=') && 
                       !envContent.match(/ANTHROPIC_API_KEY=["']?\s*["']?$/m)
  const hasGoogle = envContent.includes('GOOGLE_AI_API_KEY=') && 
                    !envContent.match(/GOOGLE_AI_API_KEY=["']?\s*["']?$/m)

  console.log('Current status:')
  console.log(`  OpenAI: ${hasOpenAI ? '✅ Configured' : '❌ Not configured'}`)
  console.log(`  Anthropic: ${hasAnthropic ? '✅ Configured' : '❌ Not configured'}`)
  console.log(`  Google AI: ${hasGoogle ? '✅ Configured' : '❌ Not configured'}\n`)

  let updatedContent = envContent

  // OpenAI
  if (!hasOpenAI) {
    console.log('📝 OpenAI API Key Setup')
    console.log('  1. Visit: https://platform.openai.com/api-keys')
    console.log('  2. Create a new secret key')
    console.log('  3. Copy the key (starts with sk-)\n')
    
    const openaiKey = await question('Enter your OpenAI API key (or press Enter to skip): ')
    if (openaiKey.trim()) {
      if (!updatedContent.includes('OPENAI_API_KEY=')) {
        updatedContent += '\n# OpenAI API Key (for ChatGPT)\n'
        updatedContent += '# Get your key at: https://platform.openai.com/api-keys\n'
        updatedContent += `OPENAI_API_KEY="${openaiKey.trim()}"\n`
      } else {
        updatedContent = updatedContent.replace(
          /OPENAI_API_KEY=.*/,
          `OPENAI_API_KEY="${openaiKey.trim()}"`
        )
      }
      console.log('✅ OpenAI key added!\n')
    }
  }

  // Anthropic
  if (!hasAnthropic) {
    console.log('📝 Anthropic API Key Setup')
    console.log('  1. Visit: https://console.anthropic.com/')
    console.log('  2. Navigate to API Keys section')
    console.log('  3. Create a new key (starts with sk-ant-)\n')
    
    const anthropicKey = await question('Enter your Anthropic API key (or press Enter to skip): ')
    if (anthropicKey.trim()) {
      if (!updatedContent.includes('ANTHROPIC_API_KEY=')) {
        updatedContent += '\n# Anthropic API Key (for Claude)\n'
        updatedContent += '# Get your key at: https://console.anthropic.com/\n'
        updatedContent += `ANTHROPIC_API_KEY="${anthropicKey.trim()}"\n`
      } else {
        updatedContent = updatedContent.replace(
          /ANTHROPIC_API_KEY=.*/,
          `ANTHROPIC_API_KEY="${anthropicKey.trim()}"`
        )
      }
      console.log('✅ Anthropic key added!\n')
    }
  }

  // Google AI
  if (!hasGoogle) {
    console.log('📝 Google AI API Key Setup')
    console.log('  1. Visit: https://makersuite.google.com/app/apikey')
    console.log('  2. Sign in with Google')
    console.log('  3. Create API key\n')
    
    const googleKey = await question('Enter your Google AI API key (or press Enter to skip): ')
    if (googleKey.trim()) {
      if (!updatedContent.includes('GOOGLE_AI_API_KEY=')) {
        updatedContent += '\n# Google AI API Key (for Gemini)\n'
        updatedContent += '# Get your key at: https://makersuite.google.com/app/apikey\n'
        updatedContent += `GOOGLE_AI_API_KEY="${googleKey.trim()}"\n`
      } else {
        updatedContent = updatedContent.replace(
          /GOOGLE_AI_API_KEY=.*/,
          `GOOGLE_AI_API_KEY="${googleKey.trim()}"`
        )
      }
      console.log('✅ Google AI key added!\n')
    }
  }

  // Write updated content
  if (updatedContent !== envContent) {
    fs.writeFileSync(envPath, updatedContent, 'utf8')
    console.log('✅ .env file updated!\n')
    console.log('Run "npm run check:keys" to verify your setup.\n')
  } else {
    console.log('No changes made.\n')
  }

  rl.close()
}

main().catch((error) => {
  console.error('Error:', error)
  rl.close()
  process.exit(1)
})

