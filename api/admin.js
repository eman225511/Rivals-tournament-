// GitHub-based storage for admin operations
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'eman225511/Rivals-tournament-'; // Same as in signup.js
const GITHUB_FILE_PATH = 'data/brackets.json';

// Load brackets from GitHub (same function as in signup.js)
async function loadBracketsFromGitHub() {
  if (!GITHUB_TOKEN) {
    console.log('No GitHub token, using empty data');
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
      const content = Buffer.from(data.content, 'base64').toString('utf8');
      const parsed = JSON.parse(content);
      console.log('Admin: Loaded brackets from GitHub:', Object.keys(parsed).length, 'entries');
      return parsed;
    } else if (response.status === 404) {
      console.log('Admin: Brackets file not found in GitHub');
      return {};
    } else {
      console.error('Admin: Failed to load from GitHub:', response.status);
      return {};
    }
  } catch (error) {
    console.error('Admin: Error loading from GitHub:', error);
    return {};
  }
}

// Save brackets to GitHub (same function as in signup.js)
async function saveBracketsToGitHub(bracketsData) {
  if (!GITHUB_TOKEN) {
    console.log('Admin: No GitHub token, skipping save');
    return;
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

    // Create or update the file
    const content = Buffer.from(JSON.stringify(bracketsData, null, 2)).toString('base64');
    
    const updateData = {
      message: `Admin: Update brackets data - ${new Date().toISOString()}`,
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
      console.log('Admin: Successfully saved brackets to GitHub');
    } else {
      console.error('Admin: Failed to save to GitHub:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Admin: Error saving to GitHub:', error);
  }
}

// Admin API endpoint for data management
export default async function handler(req, res) {
  // Basic security check - you might want to add proper authentication
  const adminKey = req.headers['x-admin-key'] || req.query.key;
  const expectedKey = process.env.ADMIN_KEY || 'admin123'; // Set this in Vercel env vars
  
  if (adminKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // Authentication check - just verify the key is valid
    try {
      const brackets = await loadBracketsFromGitHub();
      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: brackets,
        count: Object.keys(brackets).length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to load data', details: error.message });
    }
  } 
  else if (req.method === 'DELETE') {
    // Clear all data
    try {
      await saveBracketsToGitHub({});
      res.status(200).json({ 
        success: true, 
        message: 'All tournament data cleared',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear data', details: error.message });
    }
  }
  else if (req.method === 'POST') {
    // Import/restore data
    try {
      const { data: importData } = req.body;
      if (!importData || typeof importData !== 'object') {
        return res.status(400).json({ error: 'Invalid data format' });
      }
      
      await saveBracketsToGitHub(importData);
      res.status(200).json({ 
        success: true, 
        message: 'Data imported successfully',
        count: Object.keys(importData).length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to import data', details: error.message });
    }
  }
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
