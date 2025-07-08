# GitHub Storage Setup

This tournament app uses GitHub as a storage backend for brackets data. Follow these steps to set it up:

## 1. Create a GitHub Personal Access Token

1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "Rivals Tournament Storage"
4. Select these scopes:
   - `repo` (Full control of private repositories)
   - OR just `public_repo` if your repository is public
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)

## 2. Set up Vercel Environment Variables

1. Go to your Vercel dashboard
2. Select your project (rivals-tournament)
3. Go to Settings > Environment Variables
4. Add these variables:
   - **Name**: `GITHUB_TOKEN`
   - **Value**: Your GitHub token from step 1
   - **Environment**: Production, Preview, Development (all)
   
   - **Name**: `ADMIN_KEY`
   - **Value**: A secure password for admin operations (e.g., "mySecureAdminKey123")
   - **Environment**: Production, Preview, Development (all)
5. Click "Save" for each

## 3. Update Repository Name (if needed)

If your GitHub repository name is different, update line 4 in `api/signup.js`:
```javascript
const GITHUB_REPO = 'YourUsername/YourRepoName';
```

## 4. Deploy

After setting up the environment variable, redeploy your app on Vercel. The tournament data will now persist in the `data/brackets.json` file in your GitHub repository.

## How it works

- When someone signs up, the data is saved to `data/brackets.json` in your GitHub repo
- When viewing brackets, the data is loaded from GitHub
- Each signup creates a commit to your repository
- Data persists even when Vercel functions restart

## Fallback

If the GitHub token is not set, the app will still work but data will only persist in memory (until the next deployment).
