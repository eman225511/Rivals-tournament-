export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Test API called:', req.method);
  console.log('Environment check...');

  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const hasToken = !!githubToken;
    const tokenLength = hasToken ? githubToken.length : 0;
    
    console.log('GitHub token present:', hasToken, 'Length:', tokenLength);

    // Test GitHub API access if token exists
    let githubTest = null;
    if (hasToken) {
      try {
        const testResponse = await fetch('https://api.github.com/repos/eman225511/Rivals-tournament-/contents/data', {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Rivals-Tournament-App'
          }
        });
        githubTest = {
          status: testResponse.status,
          ok: testResponse.ok,
          statusText: testResponse.statusText
        };
        console.log('GitHub API test:', githubTest);
      } catch (githubError) {
        githubTest = { error: githubError.message };
        console.error('GitHub API test failed:', githubError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "API is working correctly!",
      timestamp: new Date().toISOString(),
      method: req.method,
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        hasGitHubToken: hasToken,
        tokenLength: tokenLength,
        runtime: typeof Buffer !== 'undefined' ? 'node' : 'edge',
        githubApiTest: githubTest
      },
      postData: req.method === 'POST' ? req.body : null
    });
  } catch (error) {
    console.error('Test API error:', error);
    return res.status(500).json({
      error: 'Test API failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
