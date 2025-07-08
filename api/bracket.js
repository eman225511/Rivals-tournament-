import { getBrackets } from './signup.js';

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const brackets = getBrackets();
  
  // Debug logging
  console.log('Brackets API called, returning:', Object.keys(brackets).length, 'entries');
  
  res.status(200).json(brackets);
}
