let brackets = {}; // In-memory store (resets when function restarts)

function generateBracketId() {
  return 'BKT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

const webhookUrl = "https://discord.com/api/webhooks/1375287456756273272/NljLSelRMRXvSy4MF_ubS7jZ6QENU5P9HWiKJYxIp55ohFDKOxLGpVECvqybdcHGf9Sw";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const {
    discord, roblox, rank,
    duo_discord, duo_roblox, duo_rank,
    extra_field
  } = req.body;

  // Anti-spam honeypot
  if (extra_field && extra_field.trim() !== '') {
    return res.status(400).json({ error: 'Spam detected' });
  }

  // Validate input
  if (!discord || !roblox || !rank || !duo_discord || !duo_roblox || !duo_rank) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (rank !== duo_rank) {
    return res.status(400).json({ error: 'Both players must have the same rank' });
  }

  const bracketId = generateBracketId();

  // Save bracket
  brackets[bracketId] = {
    bracketId,
    rank,
    player1: { discord, roblox },
    player2: { discord: duo_discord, roblox: duo_roblox },
    timestamp: new Date().toISOString()
  };

  // Send Discord embed
  const embed = {
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
  };

  const bracketDump = {
    content: "**📊 Current Bracket State**",
    embeds: [embed],
    files: [
      {
        name: "brackets.json",
        content: Buffer.from(JSON.stringify(brackets, null, 2)),
        type: "application/json"
      }
    ]
  };

  try {
    await fetch(webhookUrl + "?wait=true", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: "✅ New team signed up! Here's the updated bracket:",
        embeds: [embed],
        files: []
      })
    });

    // Send full bracket JSON separately
    await fetch(webhookUrl + "?wait=true", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: "📎 brackets.json",
        files: [
          {
            attachment: Buffer.from(JSON.stringify(brackets, null, 2)).toString('base64'),
            name: "brackets.json"
          }
        ]
      })
    });
  } catch (err) {
    console.warn('Discord webhook failed:', err);
  }

  res.status(200).json({ success: true, bracketId });
}

// Export for access in brackets.js
export { brackets };
