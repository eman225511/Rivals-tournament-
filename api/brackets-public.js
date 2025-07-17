import { getBrackets } from './signup.js';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET method allowed' });
  }

  try {
    console.log('Public brackets API called...');
    const brackets = await getBrackets();
    
    // Create public version without sensitive data (bracket IDs)
    const publicBrackets = {};
    
    Object.entries(brackets).forEach(([id, team], index) => {
      // Use a public ID instead of the real bracket ID
      const publicId = `team_${index + 1}`;
      
      publicBrackets[publicId] = {
        // Remove sensitive data
        rank: team.rank,
        player1: {
          discord: team.player1?.discord || 'Unknown',
          roblox: team.player1?.roblox || 'Unknown'
        },
        player2: {
          discord: team.player2?.discord || 'Unknown', 
          roblox: team.player2?.roblox || 'Unknown'
        },
        timestamp: team.timestamp
        // Deliberately exclude bracketId for security
      };
    });
    
    console.log('Public brackets API returning:', Object.keys(publicBrackets).length, 'entries');
    
    return res.status(200).json(publicBrackets);
  } catch (error) {
    console.error('Error in public brackets API:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch brackets',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
