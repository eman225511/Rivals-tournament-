import fetch from 'node-fetch';

const webhookUrl = "https://discord.com/api/webhooks/1375287456756273272/NljLSelRMRXvSy4MF_ubS7jZ6QENU5P9HWiKJYxIp55ohFDKOxLGpVECvqybdcHGf9Sw";

function generateBracketId() {
  return 'BKT-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const {
    discord, roblox, rank,
    duo_discord, duo_roblox, duo_rank,
    extra_field
  } = req.body;

  // Honeypot trap
  if (extra_field && extra_field.trim() !== "") {
    return res.status(400).json({ error: "Spam detected" });
  }

  // Basic validation
  if (!discord || !roblox || !rank || !duo_discord || !duo_roblox || !duo_rank) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (rank !== duo_rank) {
    return res.status(400).json({ error: "Both players must have the same rank" });
  }

  const bracketId = generateBracketId();

  const payload = {
    embeds: [{
      title: "🎮 New Rivals Duo Signup",
      description: `🆙 Bracket: **${rank}** | Bracket ID: **${bracketId}**`,
      color: 0xffce3d,
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
      footer: { text: "Rivals Tournament Bot" },
      timestamp: new Date().toISOString()
    }]
  };

  try {
    const discordRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!discordRes.ok) {
      const text = await discordRes.text();
      console.error("Discord webhook error:", text);
      return res.status(500).json({ error: "Failed to send Discord notification" });
    }

    return res.status(200).json({ success: true, bracketId });
  } catch (err) {
    console.error("Internal server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
