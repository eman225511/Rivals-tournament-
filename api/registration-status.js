// Simple registration status API that doesn't require authentication
// This is a simpler version that works without GitHub dependencies for basic status checking

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // For now, return safe default values that allow registration
    // This ensures the signup page works even if settings can't be loaded
    const defaultStatus = {
      registrationEnabled: true,
      tournamentStarted: false,
      tournamentName: "Rivals Duo Tournament",
      isRegistrationOpen: true,
      registrationCounts: {
        Bronze: 0, Silver: 0, Gold: 0, Platinum: 0,
        Diamond: 0, Onyx: 0, Nemesis: 0, Archnemesis: 0
      },
      rankStatus: {},
      totalTeams: 0,
      lastUpdated: new Date().toISOString(),
      note: "Using default safe values - registration is open"
    };

    // Try to load actual settings if possible
    try {
      // Attempt to get settings from the admin-settings endpoint
      // This is a fallback that may work if GitHub is accessible
      const settingsResponse = await fetch(`${process.env.VERCEL_URL || req.headers.host}/api/admin-settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (settingsResponse.ok) {
        const settingsResult = await settingsResponse.json();
        if (settingsResult.success && settingsResult.settings) {
          const settings = settingsResult.settings;
          
          // Update status with actual settings
          defaultStatus.registrationEnabled = settings.registrationEnabled !== false;
          defaultStatus.tournamentStarted = settings.tournamentStarted === true;
          defaultStatus.isRegistrationOpen = defaultStatus.registrationEnabled && !defaultStatus.tournamentStarted;
          defaultStatus.tournamentName = settings.tournamentName || defaultStatus.tournamentName;
          defaultStatus.note = "Loaded from settings";
        }
      }
    } catch (settingsError) {
      // Ignore settings loading errors and use defaults
      console.log('Could not load settings, using defaults:', settingsError.message);
    }

    res.status(200).json({
      success: true,
      status: defaultStatus
    });

  } catch (error) {
    console.error('Registration status error:', error);
    
    // Return safe defaults even on error to ensure signup page works
    res.status(200).json({
      success: true,
      status: {
        registrationEnabled: true,
        tournamentStarted: false,
        tournamentName: "Rivals Duo Tournament",
        isRegistrationOpen: true,
        registrationCounts: {
          Bronze: 0, Silver: 0, Gold: 0, Platinum: 0,
          Diamond: 0, Onyx: 0, Nemesis: 0, Archnemesis: 0
        },
        rankStatus: {},
        totalTeams: 0,
        lastUpdated: new Date().toISOString(),
        error: 'Could not load complete status information, using safe defaults'
      }
    });
  }
}
