// GitHub-based storage for brackets data
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // You'll need to set this in Vercel
const GITHUB_REPO = 'eman225511/Rivals-tournament-'; // Your GitHub repo
const GITHUB_FILE_PATH = 'data/brackets.json';

// Simple in-memory storage as fallback
let brackets = {};

// Initialize with some sample data for testing
if (Object.keys(brackets).length === 0) {
  brackets = {
    'BKT-SAMPLE1': {
      bracketId: 'BKT-SAMPLE1',
      rank: 'Gold',
      player1: { discord: 'SamplePlayer1#1234', roblox: 'SampleRoblox1' },
      player2: { discord: 'SamplePlayer2#5678', roblox: 'SampleRoblox2' },
      timestamp: new Date().toISOString()
    }
  };
}

// Load brackets from GitHub
async function loadBracketsFromGitHub() {
  if (!GITHUB_TOKEN) {
    console.log('No GitHub token, using in-memory storage');
    return brackets;
  }

  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Rivals-Tournament-App'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const content = Buffer.from(data.content, 'base64').toString('utf8');
      const parsed = JSON.parse(content);
      console.log('Loaded brackets from GitHub:', Object.keys(parsed).length, 'entries');
      return parsed;
    } else if (response.status === 404) {
      console.log('Brackets file not found in GitHub, creating new one');
      await saveBracketsToGitHub({});
      return {};
    } else {
      console.error('Failed to load from GitHub:', response.status, response.statusText);
      return brackets;
    }
  } catch (error) {
    console.error('Error loading from GitHub:', error.message);
    return brackets;
  }
}

// Save brackets to GitHub
async function saveBracketsToGitHub(bracketsData) {
  if (!GITHUB_TOKEN) {
    console.log('No GitHub token, skipping save');
    return false;
  }

  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;
    
    // First, get the current file SHA (required for updates)
    let sha = null;
    try {
      const getResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Rivals-Tournament-App'
        }
      });

      if (getResponse.ok) {
        const getData = await getResponse.json();
        sha = getData.sha;
        console.log('Found existing file, SHA:', sha);
      }
    } catch (getError) {
      console.log('File does not exist yet, will create new');
    }

    // Create or update the file
    const content = Buffer.from(JSON.stringify(bracketsData, null, 2)).toString('base64');
    
    const updateData = {
      message: `Update brackets data - ${new Date().toISOString()}`,
      content: content,
      branch: 'main'
    };

    if (sha) {
      updateData.sha = sha;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Rivals-Tournament-App'
      },
      body: JSON.stringify(updateData)
    });

    if (response.ok) {
      console.log('Successfully saved brackets to GitHub');
      return true;
    } else {
      const errorText = await response.text();
      console.error('Failed to save to GitHub:', response.status, response.statusText, errorText);
      return false;
    }
  } catch (error) {
    console.error('Error saving to GitHub:', error.message);
    return false;
  }
}

function generateBracketId() {
  return 'BKT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Your webhook URLs
const signupWebhook = "https://discordapp.com/api/webhooks/1392260390393745408/GBtAXfUNCfr-ywRmGJM2zyZJVQ9yP828C2vpcd9En49t3KpMZ6QnA-Q04VowAGQTcFkn";
const bracketsWebhook = "https://discordapp.com/api/webhooks/1392260441547341876/BzjuPZhvsjRFZSkcptLKakK8GjFPUlX0obbsBHbHL5RzRzatyPNuLg6Jmgrj-f9-aBXz";

export default async function handler(req, res) {
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);
  
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Only POST method allowed' });
  }

  console.log('Received signup request:', req.body);

  try {
    const {
      discord, roblox, rank,
      duo_discord, duo_roblox, duo_rank,
      extra_field
    } = req.body || {};

    // Anti-spam honeypot check
    if (extra_field && extra_field.trim() !== '') {
      console.log('Spam detected, rejecting request');
      return res.status(400).json({ error: 'Spam detected' });
    }

    // Validate required fields
    if (!discord || !roblox || !rank || !duo_discord || !duo_roblox || !duo_rank) {
      console.log('Missing required fields:', { discord: !!discord, roblox: !!roblox, rank: !!rank, duo_discord: !!duo_discord, duo_roblox: !!duo_roblox, duo_rank: !!duo_rank });
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate rank consistency
    if (rank !== duo_rank) {
      console.log('Rank mismatch:', { rank, duo_rank });
      return res.status(400).json({ error: 'Both players must have the same rank' });
    }

    // Validate players are different
    if (discord.toLowerCase().trim() === duo_discord.toLowerCase().trim() || 
        roblox.toLowerCase().trim() === duo_roblox.toLowerCase().trim()) {
      console.log('Same player detected');
      return res.status(400).json({ error: 'Players must be different people' });
    }

    try {
      const bracketId = generateBracketId();
      console.log('Generated bracket ID:', bracketId);

      // Load existing brackets from GitHub
      const currentBrackets = await loadBracketsFromGitHub();

      currentBrackets[bracketId] = {
        bracketId,
        rank,
        player1: { discord: discord.trim(), roblox: roblox.trim() },
        player2: { discord: duo_discord.trim(), roblox: duo_roblox.trim() },
        timestamp: new Date().toISOString()
      };

      console.log('Saving bracket data...');
      // Save updated brackets to GitHub
      await saveBracketsToGitHub(currentBrackets);

      // Also update in-memory for immediate access
      brackets = currentBrackets;

      console.log('Sending Discord webhooks...');
      // Send signup embed webhook
      const embedPayload = {
        embeds: [{
          title: "🎮 New Rivals Signup",
          color: 0xffce3d,
          description: `🆙 Bracket: **${rank}**\n🆔 Bracket ID: \`${bracketId}\``,
          fields: [
            {
              name: "👤 Player 1",
              value: `Discord: **${discord}**\nRoblox: **${roblox}**`,
              inline: true
            },
            {
              name: "👥 Player 2",
              value: `Discord: **${duo_discord}**\nRoblox: **${duo_roblox}**`,
              inline: true
            }
          ],
          footer: { text: "Rivals Bot" },
          timestamp: new Date().toISOString()
        }]
      };

      try {
        const webhookPromises = [];
        
        // Send signup webhook
        webhookPromises.push(
          fetch(signupWebhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(embedPayload)
          })
        );

        // Send bracket update link to second webhook
        const bracketDumpLink = "https://rivals-tournament.vercel.app/brackets";
        webhookPromises.push(
          fetch(bracketsWebhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: `📎 [Click here to view updated brackets](${bracketDumpLink})`
            })
          })
        );

        // Wait for both webhooks (but don't fail signup if they fail)
        await Promise.allSettled(webhookPromises);
        
      } catch (webhookError) {
        console.error('Webhook error (non-fatal):', webhookError);
        // Don't fail the signup if webhooks fail
      }

      console.log('Signup successful for bracket ID:', bracketId);
      return res.status(200).json({ 
        success: true, 
        bracketId,
        message: `Successfully registered! Your bracket ID is ${bracketId}` 
      });

    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ 
        error: 'Internal server error. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } catch (outerError) {
    console.error('Request handling error:', outerError);
    return res.status(500).json({ 
      error: 'Server error. Please try again.',
      details: process.env.NODE_ENV === 'development' ? outerError.message : undefined
    });
  }
}

// Export function to get brackets for api/brackets.js
export async function getBrackets() {
  // Try to load fresh data from GitHub
  const githubBrackets = await loadBracketsFromGitHub();
  return githubBrackets;
}
