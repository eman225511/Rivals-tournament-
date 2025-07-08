import { getBrackets } from './signup.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const brackets = await getBrackets();
  res.status(200).json(brackets);
}
