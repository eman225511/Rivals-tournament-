import { getBrackets } from './signup.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const brackets = await getBrackets();
  
  // Debug logging
  console.log('Brackets API called, returning:', Object.keys(brackets).length, 'entries');
  
  res.status(200).json(brackets);
}
