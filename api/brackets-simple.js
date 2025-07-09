import { getBrackets } from './signup-simple.js';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET method allowed' });
  }

  try {
    const brackets = getBrackets();
    console.log('Brackets requested, returning:', Object.keys(brackets).length, 'entries');
    return res.status(200).json(brackets);
  } catch (error) {
    console.error('Error fetching brackets:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch brackets',
      details: error.message
    });
  }
}
