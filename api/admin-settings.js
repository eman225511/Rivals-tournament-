// Admin API for managing tournament settings and teams
import { loadSettingsFromGitHub, saveSettingsToGitHub, loadBracketsFromGitHub, saveBracketsToGitHub } from './signup.js';

const ADMIN_PASSWORD = process.env.ADMIN_KEY || process.env.ADMIN_PASSWORD || 'tournament2024';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Password, X-Admin-Key');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check admin password
  const adminPassword = req.headers['x-admin-key'] || req.headers['x-admin-password'] || req.body?.adminPassword;
  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin password' });
  }

  try {
    if (req.method === 'GET') {
      // Get current settings
      const settings = await loadSettingsFromGitHub();
      return res.status(200).json({
        success: true,
        settings: settings
      });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      // Update settings
      const { settings: newSettings } = req.body;
      
      if (!newSettings) {
        return res.status(400).json({ error: 'Settings object is required' });
      }

      // Validate settings structure
      if (newSettings.maxTeamsPerRank && typeof newSettings.maxTeamsPerRank !== 'object') {
        return res.status(400).json({ error: 'maxTeamsPerRank must be an object' });
      }

      // Load current settings and merge with new ones
      const currentSettings = await loadSettingsFromGitHub();
      const updatedSettings = { ...currentSettings, ...newSettings };

      // Save to GitHub
      const saveResult = await saveSettingsToGitHub(updatedSettings);
      
      if (saveResult) {
        console.log('Settings updated by admin:', updatedSettings);
        return res.status(200).json({
          success: true,
          message: 'Settings updated successfully',
          settings: updatedSettings
        });
      } else {
        return res.status(500).json({
          error: 'Failed to save settings to GitHub'
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
