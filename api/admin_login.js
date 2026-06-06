import { TOTP } from 'totp-generator';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { googleToken, totpCode } = req.body || {};
  if (!totpCode) {
    return res.status(400).json({ error: 'TOTP code is required' });
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'eldar.ofer@gmail.com';
  const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || '804914853701-0tvqff3iuu5g4jtqictun1b6m9ijd7is.apps.googleusercontent.com';
  const TOTP_SECRET = process.env.VITE_TOTP_SECRET || 'WRGA25FIVKCVGYN3U4LR';
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'wise-fungi-secret';

  try {
    // 1. Google OAuth Verification
    let googleEmail = null;
    const isDevMode = process.env.NODE_ENV === 'development';
    
    if (isDevMode && googleToken === 'dev-bypass') {
      googleEmail = ADMIN_EMAIL;
      console.log('✓ Dev mode Google authentication bypass active.');
    } else {
      if (!googleToken) {
        return res.status(400).json({ error: 'Google login token is required' });
      }
      
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`);
      if (!googleRes.ok) {
        return res.status(401).json({ error: 'Google login verification failed' });
      }
      
      const googleData = await googleRes.json();
      if (googleData.email !== ADMIN_EMAIL) {
        return res.status(401).json({ error: 'Unauthorized email address' });
      }
      
      if (googleData.aud !== GOOGLE_CLIENT_ID) {
        return res.status(401).json({ error: 'Invalid client ID token' });
      }
      
      googleEmail = googleData.email;
    }

    // 2. TOTP Code Verification
    const { otp: currentOtp } = await TOTP.generate(TOTP_SECRET);
    const { otp: prevOtp } = await TOTP.generate(TOTP_SECRET, { timestamp: Date.now() - 30000 });

    if (totpCode !== currentOtp && totpCode !== prevOtp) {
      return res.status(401).json({ error: 'Invalid TOTP authenticator code' });
    }

    // 3. Return secure token
    return res.status(200).json({ token: ADMIN_TOKEN });
  } catch (error) {
    console.error('Admin login handler error:', error);
    return res.status(500).json({ error: 'Internal server login error', details: error.message });
  }
}
