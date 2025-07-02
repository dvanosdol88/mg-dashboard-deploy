// Express.js router for Google OAuth and Drive API
import express from 'express';
import { google } from 'googleapis';

const router = express.Router();

// OAuth2 client setup
function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BASE_URL}/api/auth/google/callback`
  );
}

// GET /api/auth/google - Start OAuth flow
router.get('/auth/google', (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Google OAuth credentials not configured' });
    }

    const oauth2Client = createOAuth2Client();
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/drive.readonly'
      ],
      include_granted_scopes: true
    });

    res.redirect(authUrl);
  } catch (error) {
    console.error('OAuth start error:', error);
    res.status(500).json({ error: 'Failed to start OAuth flow' });
  }
});

// GET /api/auth/google/callback - Handle OAuth callback
router.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code not provided' });
    }

    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens in session/database (for now, just return success)
    // In production, you'd store these securely
    res.json({ 
      message: 'OAuth successful',
      tokens: {
        access_token: tokens.access_token ? 'present' : 'missing',
        refresh_token: tokens.refresh_token ? 'present' : 'missing'
      }
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'OAuth callback failed' });
  }
});

// GET /api/google/whoami - Get current user info
router.get('/google/whoami', async (req, res) => {
  try {
    // For demo purposes, we'll create a new OAuth flow
    // In production, you'd use stored tokens
    res.json({ 
      message: 'User info endpoint',
      note: 'In production, this would return user email from stored OAuth tokens',
      instructions: 'Please complete OAuth flow at /api/auth/google first'
    });
  } catch (error) {
    console.error('Whoami error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

export default router;