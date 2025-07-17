// Public registration status API that reads settings directly from GitHub
// This allows the signup page to check registration status without admin authentication

// GitHub-based storage (same pattern as other APIs)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'eman225511/Rivals-tournament-';
const SETTINGS_FILE_PATH = 'data/settings.json';
const BRACKETS_FILE_PATH = 'data/brackets.json';

// Default settings that allow registration
const DEFAULT_SETTINGS = {
  registrationEnabled: true,
  tournamentStarted: false,
  tournamentName: "Rivals Duo Tournament",
  maxTeamsPerRank: {
    Bronze: 50, Silver: 50, Gold: 50, Platinum: 50,
    Diamond: 50, Onyx: 50, Nemesis: 50, Archnemesis: 50
  }
};

// Read settings directly from GitHub using fetch API
async function getSettings() {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Rivals-Tournament-App'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    const settings = JSON.parse(content);
    
    // Merge with defaults to ensure all properties exist
    return { ...DEFAULT_SETTINGS, ...settings };
  } catch (error) {
    console.log('Could not load settings from GitHub, using defaults:', error.message);
    return DEFAULT_SETTINGS;
  }
}

// Get current registration counts
async function getRegistrationCounts() {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${BRACKETS_FILE_PATH}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Rivals-Tournament-App'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    const brackets = JSON.parse(content);
    
    // Count teams per rank
    const rankCounts = {
      Bronze: 0, Silver: 0, Gold: 0, Platinum: 0,
      Diamond: 0, Onyx: 0, Nemesis: 0, Archnemesis: 0
    };
    
    Object.values(brackets).forEach(team => {
      if (team.rank && rankCounts.hasOwnProperty(team.rank)) {
        rankCounts[team.rank]++;
      }
    });
    
    return rankCounts;
  } catch (error) {
    console.log('Could not load registration data:', error.message);
    return {
      Bronze: 0, Silver: 0, Gold: 0, Platinum: 0,
      Diamond: 0, Onyx: 0, Nemesis: 0, Archnemesis: 0
    };
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Get current settings and registration counts
    const [settings, registrationCounts] = await Promise.all([
      getSettings(),
      getRegistrationCounts()
    ]);

    // Calculate if any ranks are full
    const rankStatus = {};
    Object.keys(registrationCounts).forEach(rank => {
      const current = registrationCounts[rank];
      const max = settings.maxTeamsPerRank[rank] || 50;
      rankStatus[rank] = {
        current,
        max,
        isFull: current >= max,
        percentage: max > 0 ? Math.round((current / max) * 100) : 0
      };
    });

    // Determine overall registration status
    const isRegistrationOpen = settings.registrationEnabled && !settings.tournamentStarted;
    
    // Return public status information
    res.status(200).json({
      success: true,
      status: {
        registrationEnabled: settings.registrationEnabled,
        tournamentStarted: settings.tournamentStarted,
        tournamentName: settings.tournamentName,
        isRegistrationOpen,
        registrationCounts,
        rankStatus,
        totalTeams: Object.values(registrationCounts).reduce((sum, count) => sum + count, 0),
        lastUpdated: new Date().toISOString(),
        note: "Loaded from GitHub settings"
      }
    });

  } catch (error) {
    console.error('Registration status error:', error);
    
    // Return safe defaults even on error to ensure signup page works
    res.status(200).json({
      success: true,
      status: {
        registrationEnabled: true, // Default to enabled if we can't check
        tournamentStarted: false,
        tournamentName: "Rivals Duo Tournament",
        isRegistrationOpen: true,
        registrationCounts: {
          Bronze: 0, Silver: 0, Gold: 0, Platinum: 0,
          Diamond: 0, Onyx: 0, Nemesis: 0, Archnemesis: 0
        },
        rankStatus: {},
        totalTeams: 0,
        lastUpdated: new Date().toISOString(),
        error: 'Could not load complete status information, using safe defaults'
      }
    });
  }
}
