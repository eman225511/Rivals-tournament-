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
    console.log('Bracket API called...');
    const brackets = await getBrackets();
    
    // Debug logging
    console.log('Brackets API called, returning:', Object.keys(brackets).length, 'entries');
    
    return res.status(200).json(brackets);
  } catch (error) {
    console.error('Error in bracket API:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch brackets',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
