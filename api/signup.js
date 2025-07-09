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
      console.log('Loaded brackets from GitHub:', Object.keys(parsed).length, 'entries');
      return parsed;
    } else if (response.status === 404) {
      console.log('Brackets file not found in GitHub, creating new one');
      await saveBracketsToGitHub({});
      return {};
    } else {
      console.error('Failed to load from GitHub:', response.status);
      return brackets;
    }
  } catch (error) {
    console.error('Error loading from GitHub:', error);
    return brackets;
  }
}

// Save brackets to GitHub
async function saveBracketsToGitHub(bracketsData) {
  if (!GITHUB_TOKEN) {
    console.log('No GitHub token, skipping save');
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
      message: `Update brackets data - ${new Date().toISOString()}`,
      content: content,
      branch: 'main' // or 'master' depending on your default branch
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
    } else {
      console.error('Failed to save to GitHub:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Error saving to GitHub:', error);
  }
}

function generateBracketId() {
  return 'BKT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Your webhook URLs
const signupWebhook = "https://discordapp.com/api/webhooks/1392260390393745408/GBtAXfUNCfr-ywRmGJM2zyZJVQ9yP828C2vpcd9En49t3KpMZ6QnA-Q04VowAGQTcFkn";
const bracketsWebhook = "https://discordapp.com/api/webhooks/1392260441547341876/BzjuPZhvsjRFZSkcptLKakK8GjFPUlX0obbsBHbHL5RzRzatyPNuLg6Jmgrj-f9-aBXz";

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  console.log('Received signup request:', req.body);

  const {
    discord, roblox, rank,
    duo_discord, duo_roblox, duo_rank,
    extra_field
  } = req.body;

  if (extra_field && extra_field.trim() !== '') {
    console.log('Spam detected, rejecting request');
    return res.status(400).json({ error: 'Spam detected' });
  }

  if (!discord || !roblox || !rank || !duo_discord || !duo_roblox || !duo_rank) {
    console.log('Missing required fields:', { discord, roblox, rank, duo_discord, duo_roblox, duo_rank });
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (rank !== duo_rank) {
    console.log('Rank mismatch:', { rank, duo_rank });
    return res.status(400).json({ error: 'Both players must have the same rank' });
  }

  try {
    const bracketId = generateBracketId();
    console.log('Generated bracket ID:', bracketId);

    // Load existing brackets from GitHub
    const currentBrackets = await loadBracketsFromGitHub();

    currentBrackets[bracketId] = {
      bracketId,
      rank,
      player1: { discord, roblox },
      player2: { discord: duo_discord, roblox: duo_roblox },
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
      await fetch(signupWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(embedPayload)
      });

      // Send bracket update link to second webhook
      const bracketDumpLink = "https://rivals-tournament.vercel.app/brackets";

      await fetch(bracketsWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `📎 [Click here to view updated brackets](${bracketDumpLink})`
        })
      });
    } catch (webhookError) {
      console.error('Webhook error (non-fatal):', webhookError);
      // Don't fail the signup if webhooks fail
    }

    console.log('Signup successful for bracket ID:', bracketId);
    res.status(200).json({ success: true, bracketId });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
}

// Export function to get brackets for api/brackets.js
export async function getBrackets() {
  // Try to load fresh data from GitHub
  const githubBrackets = await loadBracketsFromGitHub();
  return githubBrackets;
}
