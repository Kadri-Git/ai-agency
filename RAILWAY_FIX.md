# Railway Deployment Fix

## Problem

Railway was trying to use `pip` but couldn't find it because it wasn't detecting Python.

## Solution

Added Python-specific files to the `backend` directory:

1. **runtime.txt** - Tells Railway which Python version to use
2. **Procfile** - Tells Railway how to start the app
3. **requirements.txt** - Python dependencies (copied to backend directory)

## Railway Configuration

### Important Settings in Railway Dashboard:

1. **Root Directory**: `backend`
   - This tells Railway to look in the `backend` folder

2. **Start Command**: (Leave empty - Procfile handles this)
   - Or manually set: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables**:
   ```
   DATABASE_URL=sqlite:///./ai_visibility.db
   JWT_SECRET_KEY=your-secret-key-here
   ```

## How Railway Detects Python

Railway uses Nixpacks which automatically detects:

- `requirements.txt` file
- `runtime.txt` file
- Python files (`.py`)

Since we set Root Directory to `backend`, Railway will:

1. Look in `backend/` folder
2. Find `requirements.txt` → Detects Python project
3. Find `runtime.txt` → Uses Python 3.11
4. Find `Procfile` → Uses start command from there

## After Pushing

1. Push to GitHub:

   ```bash
   git push origin main
   ```

2. Railway will automatically:
   - Detect Python project
   - Install dependencies from `backend/requirements.txt`
   - Start using `Procfile` command

3. Check deployment logs in Railway dashboard

## Troubleshooting

If it still fails:

- Check Root Directory is set to `backend`
- Verify `backend/requirements.txt` exists
- Check Railway build logs for specific errors
- Make sure all files are committed and pushed to GitHub
