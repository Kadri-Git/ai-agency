#!/usr/bin/env node

/**
 * Script to check if API keys are configured
 * Run with: node scripts/check-api-keys.js
 */

require('dotenv').config({ path: '.env.local' })
require('dotenv').config()

const keys = {
  'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
  'ANTHROPIC_API_KEY': process.env.ANTHROPIC_API_KEY,
  'GOOGLE_AI_API_KEY': process.env.GOOGLE_AI_API_KEY,
  'DATABASE_URL': process.env.DATABASE_URL,
}

console.log('\n🔑 API Keys Configuration Check\n')
console.log('=' .repeat(50))

let allConfigured = true

for (const [key, value] of Object.entries(keys)) {
  const isConfigured = value && value.length > 0 && !value.includes('...')
  const status = isConfigured ? '✅' : '❌'
  const displayValue = isConfigured 
    ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}`
    : 'Not configured'
  
  console.log(`${status} ${key}: ${displayValue}`)
  
  if (!isConfigured && key !== 'DATABASE_URL') {
    allConfigured = false
  }
}

console.log('=' .repeat(50))

if (allConfigured) {
  console.log('\n✅ All API keys are configured!')
  console.log('You can now run analyses.\n')
  process.exit(0)
} else {
  console.log('\n⚠️  Some API keys are missing.')
  console.log('\nTo set up API keys:')
  console.log('1. Copy .env.example to .env: cp .env.example .env')
  console.log('2. Add your API keys to the .env file')
  console.log('3. See SETUP.md for detailed instructions\n')
  process.exit(1)
}

