# How to Fix Gemini API Issues - Exact Steps

## Problem
All Gemini models are returning 404 errors: "models/[model-name] is not found for API version v1beta"

## Solution Steps

### Step 1: Check Your Google AI Studio Account

1. **Open Google AI Studio**
   - Go to: https://aistudio.google.com/
   - Sign in with your Google account

2. **Verify Your API Key**
   - Click on "Get API Key" (top right)
   - Make sure you have an API key created
   - Copy your API key

3. **Check Available Models**
   - In Google AI Studio, look at the model selector dropdown
   - Note which models are available (e.g., "Gemini 1.5 Flash", "Gemini 1.5 Pro", etc.)
   - The exact model names might be different from what we're using

### Step 2: Run the Model Checker Script

1. **Open your terminal** in the project root directory

2. **Run the checker script:**
   ```bash
   npm run check:gemini
   ```

3. **What it does:**
   - Lists all available models for your API key
   - Tests which models actually work
   - Shows you the exact model names to use

4. **Look for output like:**
   ```
   ✅ Available Gemini models:
     📌 gemini-1.5-flash
        ✅ Supports generateContent
     📌 gemini-1.5-pro
        ✅ Supports generateContent
   ```

### Step 3: Update the Code with Working Models

1. **Open the file:** `src/lib/ai-integrations.ts`

2. **Find the `queryGemini` function** (around line 212)

3. **Update the `geminiModels` array** with the exact model names from Step 2:
   ```typescript
   const geminiModels = [
     'gemini-1.5-flash',        // Use the exact name from the checker
     'gemini-1.5-pro',          // Use the exact name from the checker
     // Add other working models here
   ]
   ```

4. **Save the file**

### Step 4: Verify Your API Key

1. **Check your `.env.local` file:**
   ```bash
   cat .env.local | grep GOOGLE_AI_API_KEY
   ```

2. **Make sure it's set correctly:**
   ```
   GOOGLE_AI_API_KEY=your_actual_api_key_here
   ```

3. **If it's missing or wrong:**
   - Get your API key from https://aistudio.google.com/
   - Add it to `.env.local`:
     ```
     GOOGLE_AI_API_KEY=AIzaSy...your_key_here
     ```

### Step 5: Test the Fix

1. **Restart your dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. **Run a new analysis** in your app

3. **Check the terminal logs** - you should see:
   ```
   ✅ Gemini (gemini-1.5-flash) response received...
   ```

## Alternative: Use Google Cloud Console

If the above doesn't work, you might need to:

1. **Go to Google Cloud Console:** https://console.cloud.google.com/

2. **Enable the Generative Language API:**
   - Search for "Generative Language API"
   - Click "Enable"

3. **Create a new API key with proper permissions:**
   - Go to "APIs & Services" > "Credentials"
   - Create a new API key
   - Restrict it to "Generative Language API"

4. **Update your `.env.local`** with the new key

## Common Issues

### Issue: "API key not valid"
- **Fix:** Get a fresh API key from https://aistudio.google.com/
- Make sure there are no extra spaces in `.env.local`

### Issue: "API not enabled"
- **Fix:** Enable the Generative Language API in Google Cloud Console

### Issue: "Quota exceeded"
- **Fix:** Check your usage limits in Google Cloud Console
- You might need to upgrade your plan

### Issue: "No models found"
- **Fix:** Your API key might not have access to Gemini models
- Try creating a new API key in Google AI Studio

## Still Not Working?

If none of the above works:

1. **Check the exact error message** in your terminal
2. **Share the output** from `npm run check:gemini`
3. **Verify your API key** is from Google AI Studio (not Vertex AI)
4. **Try a different API key** - create a new one in Google AI Studio



