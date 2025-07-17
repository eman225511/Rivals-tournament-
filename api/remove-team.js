// API endpoint for removing teams from the tournament
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'eman225511/Rivals-tournament-';
const GITHUB_FILE_PATH = 'data/brackets.json';

// Load brackets from GitHub
async function loadBracketsFromGitHub() {
  if (!GITHUB_TOKEN) {
    console.log('No GitHub token, using fallback data');
    return {};
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      // Edge-runtime compatible base64 decoding
      let content;
      try {
        const binaryString = atob(data.content.replace(/\s/g, ''));
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        content = new TextDecoder('utf-8').decode(bytes);
      } catch (decodeError) {
        console.error('Base64 decode failed:', decodeError);
        content = data.content;
      }
      const parsed = JSON.parse(content);
      return parsed;
    } else if (response.status === 404) {
      console.log('Brackets file not found in GitHub');
      return {};
    } else {
      console.error('Failed to load from GitHub:', response.status);
      return {};
    }
  } catch (error) {
    console.error('Error loading from GitHub:', error);
    return {};
  }
}

// Save brackets to GitHub
async function saveBracketsToGitHub(bracketsData) {
  if (!GITHUB_TOKEN) {
    console.log('No GitHub token, skipping save');
    return false;
  }

  try {
    // First, get the current file SHA (required for updates)
    let sha = null;
    const getResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (getResponse.ok) {
      const getData = await getResponse.json();
      sha = getData.sha;
    }

    // Create or update the file - edge-runtime compatible encoding
    const content = btoa(JSON.stringify(bracketsData, null, 2));
    
    const updateData = {
      message: `Remove team - ${new Date().toISOString()}`,
      content: content,
      branch: 'main'
    };

    if (sha) {
      updateData.sha = sha;
    }

    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(updateData)
    });

    if (response.ok) {
      console.log('Successfully saved brackets to GitHub');
      return true;
    } else {
      console.error('Failed to save to GitHub:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error saving to GitHub:', error);
    return false;
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { bracketId } = req.body || {};

    // Validate input
    if (!bracketId) {
      return res.status(400).json({ 
        success: false, 
        error: 'bracketId is required' 
      });
    }

    if (!bracketId.match(/^BKT-[A-Z0-9]{6}$/)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid bracketId format' 
      });
    }

    // Load current brackets
    const brackets = await loadBracketsFromGitHub();

    // Check if team exists
    if (!brackets[bracketId]) {
      return res.status(404).json({ 
        success: false, 
        error: 'Team not found' 
      });
    }

    // Store team info for logging before removal
    const teamInfo = brackets[bracketId];
    console.log(`Removing team ${bracketId}: ${teamInfo.player1.roblox} & ${teamInfo.player2.roblox} (${teamInfo.rank})`);

    // Remove the team
    delete brackets[bracketId];

    // Save updated brackets back to GitHub
    const saveSuccess = await saveBracketsToGitHub(brackets);

    if (!saveSuccess) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to save updated brackets data' 
      });
    }

    // Success response
    res.status(200).json({ 
      success: true, 
      message: `Team ${bracketId} has been successfully removed from the tournament`,
      removedTeam: {
        bracketId: teamInfo.bracketId,
        rank: teamInfo.rank,
        player1: teamInfo.player1.roblox,
        player2: teamInfo.player2.roblox,
        removedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error removing team:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error: ' + error.message 
    });
  }
}
