import { getBrackets } from './signup.js';

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const brackets = getBrackets();
  res.status(200).json(brackets);
}
