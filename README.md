# Rivals Duo Tournament Signup

This repo hosts a simple signup page for a Roblox Rivals Duo Tournament.

## Features

- Frontend signup form with rules gating and mobile-friendly UI  
- Backend API hosted on Vercel that validates input, generates bracket IDs, and sends Discord webhook notifications  
- Inline error/success messaging  

## Deployment

1. Clone repo  
2. Replace `YOUR_DISCORD_WEBHOOK_URL_HERE` in `api/signup.js` with your actual Discord webhook URL  
3. Install dependencies:  
   ```bash
   npm install
   ```  
4. Run locally with:  
   ```bash
   vercel dev
   ```  
5. Deploy to Vercel:  
   ```bash
   vercel --prod
   ```  

---

## Customize

- Update frontend styles or add new rules  
- Expand backend to store signups in a database (MongoDB, Firebase, etc)  
- Add bracket management dashboard  

---

Feel free to ask if you want help extending it!
