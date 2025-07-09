# Rivals Duo Tournament Management System

A complete tournament signup and management system for Roblox Rivals Duo tournaments with persistent GitHub storage.

## 🚀 Quick Setup for Vercel

### 1. Environment Variables
In your Vercel dashboard, add these environment variables:
- `GITHUB_TOKEN`: Your GitHub personal access token (with repo permissions)
- `ADMIN_KEY`: Secret key for admin panel access (choose your own secure key)

### 2. GitHub Token Setup
1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with these permissions:
   - `repo` (Full control of private repositories)
   - `public_repo` (Access public repositories)
3. Copy the token and add it as `GITHUB_TOKEN` in Vercel

### 3. Deploy
- Connect your GitHub repo to Vercel
- Deploy automatically
- The system will work immediately after deployment

## Features

### 🏠 Main Signup (index.html)
- ✅ Fixed CORS issues
- ✅ Better error handling and validation
- ✅ Stylish signup form with rules gating
- ✅ Team registration with Discord & Roblox usernames
- ✅ Rank selection and validation
- ✅ Generates unique bracket IDs (BKT-XXXXXX format)

### 🏆 Bracket Viewing (brackets.html)
- ✅ Fixed API endpoint integration
- ✅ View all registered teams grouped by rank
- ✅ Download bracket data as JSON
- ✅ Real-time data from GitHub storage

### 👥 User Dashboard (dashboard.html)
- Login with Bracket ID
- View and manage team information
- Remove team from tournament
- View full bracket for your rank

### 🔧 Admin Panel (admin.html)
- Secure admin authentication
- View all registered teams
- Validate, backup, and clear all data
- Generate test data for development
- Test API endpoints

### 💾 Persistent Storage
- ✅ GitHub-based data storage using GitHub API
- ✅ All tournament data stored in `data/brackets.json`
- ✅ Automatic backup and versioning through Git
- ✅ Fallback to in-memory storage if GitHub is unavailable

## API Endpoints

### POST /api/signup
- ✅ Fixed CORS and error handling
- Registers a new team for the tournament
- Validates all required fields
- Sends Discord webhook notifications

### GET /api/brackets
- ✅ Fixed CORS and error handling
- Returns all registered teams
- Used by brackets.html to display teams

### GET /api/test
- ✅ New test endpoint to verify API functionality
- Returns success status and environment info

## Recent Fixes

✅ **CORS Issues**: Added proper CORS headers to all API endpoints
✅ **Error Handling**: Improved error messages and validation
✅ **API Compatibility**: Fixed module imports/exports for Vercel
✅ **Frontend Validation**: Better form validation and user feedback
✅ **Response Parsing**: Fixed JSON response handling
✅ **Environment Setup**: Proper Node.js version specification

## Testing the Fixes

1. **Test API**: Visit `/api/test` to verify API is working
2. **Test Signup**: Try signing up a team on the main page
3. **Test Brackets**: Visit `/brackets` to see if data loads
4. **Check Console**: Monitor browser console for any remaining errors

## Local Development (Optional)
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your environment variables
4. Run locally:
   ```bash
   vercel dev
   ```

### Production Deployment
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy:
   ```bash
   vercel --prod
   ```

## API Endpoints

- `POST /api/signup` - Register a new team
- `GET /api/bracket` - Get all bracket data
- `GET /api/brackets` - Get brackets grouped by rank
- `POST /api/remove-team` - Remove a team (requires bracket ID)
- `GET/POST/DELETE /api/admin` - Admin panel operations (requires admin key)

## Security Features

- Admin panel protected by secret key
- User dashboard requires valid bracket ID
- Rate limiting and input validation
- Secure GitHub API integration

## File Structure

```
├── index.html              # Main signup page
├── dashboard.html          # User dashboard
├── admin.html             # Admin panel
├── brackets.html          # Bracket viewer
├── brackets/
│   └── index.html         # Alternative bracket route
├── api/
│   ├── signup.js          # Team registration
│   ├── bracket.js         # Get bracket data
│   ├── brackets.js        # Get grouped brackets
│   ├── remove-team.js     # Team removal
│   └── admin.js           # Admin operations
├── data/
│   └── brackets.json      # Persistent storage
└── vercel.json            # Routing configuration
```
