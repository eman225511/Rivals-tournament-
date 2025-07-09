// Simple in-memory storage
let brackets = {};

function generateBracketId() {
  return 'BKT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method allowed' });
  }

  console.log('Signup request received:', req.body);

  try {
    const {
      discord, roblox, rank,
      duo_discord, duo_roblox, duo_rank,
      extra_field
    } = req.body || {};

    // Anti-spam honeypot check
    if (extra_field && extra_field.trim() !== '') {
      console.log('Spam detected');
      return res.status(400).json({ error: 'Spam detected' });
    }

    // Validate required fields
    if (!discord || !roblox || !rank || !duo_discord || !duo_roblox || !duo_rank) {
      console.log('Missing fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate rank consistency
    if (rank !== duo_rank) {
      console.log('Rank mismatch');
      return res.status(400).json({ error: 'Both players must have the same rank' });
    }

    // Validate players are different
    if (discord.toLowerCase().trim() === duo_discord.toLowerCase().trim() || 
        roblox.toLowerCase().trim() === duo_roblox.toLowerCase().trim()) {
      console.log('Same player detected');
      return res.status(400).json({ error: 'Players must be different people' });
    }

    // Generate bracket ID and store data
    const bracketId = generateBracketId();
    
    brackets[bracketId] = {
      bracketId,
      rank,
      player1: { discord: discord.trim(), roblox: roblox.trim() },
      player2: { discord: duo_discord.trim(), roblox: duo_roblox.trim() },
      timestamp: new Date().toISOString()
    };

    console.log('Team registered:', bracketId);

    // Try to send Discord webhooks (non-blocking)
    try {
      const webhookPayload = {
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

      await fetch("https://discordapp.com/api/webhooks/1392260390393745408/GBtAXfUNCfr-ywRmGJM2zyZJVQ9yP828C2vpcd9En49t3KpMZ6QnA-Q04VowAGQTcFkn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload)
      });
    } catch (webhookError) {
      console.error('Webhook failed (non-fatal):', webhookError);
    }

    return res.status(200).json({ 
      success: true, 
      bracketId,
      message: `Successfully registered! Your bracket ID is ${bracketId}` 
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ 
      error: 'Internal server error. Please try again.',
      details: error.message
    });
  }
}

// Export function to get brackets for other endpoints
export function getBrackets() {
  return brackets;
}
