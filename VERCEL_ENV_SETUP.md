# Vercel Environment Variable Setup

## How to Set NEXT_PUBLIC_API_URL in Vercel

### Step 1: Get Your Railway Backend URL

1. Go to Railway Dashboard: https://railway.app
2. Click on your service
3. Go to **Settings** tab
4. Scroll to **"Domains"** section
5. Copy your Railway URL (e.g., `https://your-app.up.railway.app`)

### Step 2: Add Environment Variable in Vercel

1. Go to Vercel Dashboard: https://vercel.com
2. Select your project: **visibility-report** (or your project name)
3. Go to **Settings** tab
4. Click **"Environment Variables"** in the left sidebar
5. Click **"Add New"** button

### Step 3: Configure the Variable

Fill in the form:

- **Key**: `NEXT_PUBLIC_API_URL`
- **Value**: `https://your-app.up.railway.app` (paste your Railway URL)
- **Environment**: Select all (Production, Preview, Development)
- Click **"Save"**

### Step 4: Redeploy

After adding the environment variable:

1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger auto-deploy

## Important Notes

- **NEXT*PUBLIC*** prefix is required for Next.js to expose the variable to the browser
- The value should be your **full Railway backend URL** (with `https://`)
- Make sure there are **no trailing slashes** in the URL
- The variable will be available in your code as `process.env.NEXT_PUBLIC_API_URL`

## Verify It's Working

After redeploying, check:

1. Open your Vercel app URL
2. Open browser DevTools → Console
3. Check Network tab for API calls
4. They should go to your Railway backend URL

## Troubleshooting

### Variable not updating?

- Make sure you redeployed after adding the variable
- Check that the variable name is exactly `NEXT_PUBLIC_API_URL`
- Verify the value is correct (no typos)

### Still getting errors?

- Check Vercel build logs
- Verify Railway backend is running and accessible
- Test Railway URL directly: `https://your-app.up.railway.app/health`
