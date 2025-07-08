# Rivals Duo Tournament Management System

A complete tournament signup and management system for Roblox Rivals Duo tournaments with persistent GitHub storage.

## Features

### 🏠 Main Signup (index.html)
- Stylish signup form with rules gating and mobile-friendly UI
- Team registration with Discord & Roblox usernames
- Rank selection and validation
- Generates unique bracket IDs (BKT-XXXXXX format)

### 🏆 Bracket Viewing (brackets.html)
- View all registered teams grouped by rank
- Download bracket data as JSON
- Real-time data from GitHub storage

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
- GitHub-based data storage using GitHub API
- All tournament data stored in `data/brackets.json`
- Automatic backup and versioning through Git  

## Setup & Deployment

### Prerequisites
- GitHub personal access token with repo permissions
- Vercel account for hosting

### Environment Variables
Create these environment variables in Vercel:
- `GITHUB_TOKEN`: Your GitHub personal access token
- `ADMIN_KEY`: Secret key for admin panel access (set your own)

### Local Development
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
