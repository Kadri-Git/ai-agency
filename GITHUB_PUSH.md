# Push to GitHub - Instructions

Your code has been committed locally. To push to GitHub, you need to authenticate.

## Option 1: Personal Access Token (Recommended)

1. **Create a Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name it: "AI Visibility Dashboard"
   - Select scopes: `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token** (you won't see it again!)

2. **Push using the token:**

   ```bash
   git remote set-url origin https://YOUR_TOKEN@github.com/Kadri-Git/ai-agency.git
   git push origin main
   ```

   Replace `YOUR_TOKEN` with your actual token.

## Option 2: GitHub CLI (gh)

If you have GitHub CLI installed:

```bash
gh auth login
git push origin main
```

## Option 3: SSH (if you have SSH keys set up)

```bash
ssh-add ~/.ssh/id_rsa  # Add your SSH key
git push origin main
```

## Quick Command

After setting up authentication, run:

```bash
git push origin main
```

Your repository: https://github.com/Kadri-Git/ai-agency
