let brackets = {}; // memory only

function generateBracketId() {
  return 'BKT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

const webhookUrl = "https://discord.com/api/webhooks/1375287456756273272/NljLSelRMRXvSy4MF_ubS7jZ6QENU5P9HWiKJYxIp55ohFDKOxLGpVECvqybdcHGf9Sw";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const {
    discord, roblox, rank,
    duo_discord, duo_roblox, duo_rank,
    extra_field
  } = req.body;

  if (extra_field && extra_field.trim() !== '')
    return res.status(400).json({ error: 'Spam detected' });

  if (!discord || !roblox || !rank || !duo_discord || !duo_roblox || !duo_rank)
    return res.status(400).json({ error: 'Missing required fields' });

  if (rank !== duo_rank)
    return res.status(400).json({ error: 'Both players must have the same rank' });

  const bracketId = generateBracketId();

  brackets[bracketId] = {
    bracketId,
    rank,
    player1: { discord, roblox },
    player2: { discord: duo_discord, roblox: duo_roblox },
    timestamp: new Date().toISOString()
  };

  // 1. Send embed
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

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(embedPayload)
  });

  // 2. Send the updated brackets as a code block
  const bracketsText = "📎 Updated Brackets JSON:\n```json\n" +
    JSON.stringify(brackets, null, 2) + "\n```";

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: bracketsText })
  });

  return res.status(200).json({ success: true, bracketId });
}
