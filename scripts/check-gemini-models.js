/**
 * Script to check available Gemini models for your API key
 * Run with: node scripts/check-gemini-models.js
 */

// Load environment variables (check both .env.local and .env)
try {
  require('dotenv').config({ path: '.env.local' })
} catch (e) {
  // Try .env if .env.local doesn't exist
}
try {
  require('dotenv').config({ path: '.env' })
} catch (e) {
  // dotenv might not be needed if env vars are already loaded
}

const { GoogleGenerativeAI } = require('@google/generative-ai')

async function listAvailableModels() {
  const apiKey = process.env.GOOGLE_AI_API_KEY

  if (!apiKey) {
    console.error('❌ GOOGLE_AI_API_KEY not found in .env or .env.local')
    console.log('\n📝 Steps to get your API key:')
    console.log('1. Go to https://aistudio.google.com/')
    console.log('2. Click "Get API Key"')
    console.log('3. Create a new API key or use an existing one')
    console.log('4. Add it to your .env file as: GOOGLE_AI_API_KEY=your_key_here')
    return
  }

  console.log('🔍 Checking available Gemini models...\n')

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Try to list models using the REST API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    )

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.error('Error details:', errorText)
      return
    }

    const data = await response.json()
    
    if (data.models && data.models.length > 0) {
      console.log('✅ Available Gemini models:\n')
      data.models.forEach((model) => {
        const modelName = model.name.replace('models/', '')
        const supportedMethods = model.supportedGenerationMethods || []
        const supportsGenerateContent = supportedMethods.includes('generateContent')
        
        console.log(`  📌 ${modelName}`)
        if (supportsGenerateContent) {
          console.log(`     ✅ Supports generateContent`)
        } else {
          console.log(`     ⚠️  Does NOT support generateContent`)
        }
        if (model.displayName) {
          console.log(`     📝 Display Name: ${model.displayName}`)
        }
        console.log('')
      })

      // Test which models actually work
      console.log('\n🧪 Testing models that support generateContent...\n')
      
      const testModels = data.models
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''))

      for (const modelName of testModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName })
          const result = await model.generateContent('Say "Hello"')
          const response = await result.response
          const text = response.text()
          console.log(`✅ ${modelName} - WORKS! Response: "${text.substring(0, 50)}..."`)
        } catch (error) {
          console.log(`❌ ${modelName} - FAILED: ${error.message}`)
        }
      }
    } else {
      console.log('⚠️  No models found in the response')
      console.log('Full response:', JSON.stringify(data, null, 2))
    }
  } catch (error) {
    console.error('❌ Error checking models:', error.message)
    console.error('\n💡 This might mean:')
    console.error('   - Your API key is invalid')
    console.error('   - Your API key doesn\'t have access to Gemini models')
    console.error('   - You need to enable the Gemini API in Google Cloud Console')
  }
}

listAvailableModels()

