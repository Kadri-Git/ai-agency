#!/usr/bin/env node

/**
 * Script to update DATABASE_URL in .env file
 * Usage: node scripts/setup-database.js "postgresql://..."
 */

const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env')
const dbUrl = process.argv[2]

if (!dbUrl) {
  console.log('Usage: node scripts/setup-database.js "postgresql://user:pass@host:port/db"')
  console.log('')
  console.log('Example:')
  console.log('  node scripts/setup-database.js "postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"')
  process.exit(1)
}

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!')
  process.exit(1)
}

let envContent = fs.readFileSync(envPath, 'utf8')

// Update or add DATABASE_URL
if (envContent.includes('DATABASE_URL=')) {
  envContent = envContent.replace(
    /DATABASE_URL=.*/,
    `DATABASE_URL="${dbUrl}"`
  )
} else {
  envContent += `\nDATABASE_URL="${dbUrl}"\n`
}

fs.writeFileSync(envPath, envContent, 'utf8')
console.log('✅ Database URL updated successfully!')
console.log('')
console.log('Next steps:')
console.log('  1. Run: npx prisma generate')
console.log('  2. Run: npx prisma migrate dev')
console.log('  3. Start the app: npm run dev')


