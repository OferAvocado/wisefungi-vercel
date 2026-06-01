import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { TOTP } from 'totp-generator';

export default function AdminAuthModal({ isOpen, onClose, onLoginSuccess, currentLang }) {
  const [step, setStep] = useState(1);
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');

  // We need the client ID.
  // In production, this should be in .env (e.g. import.meta.env.VITE_GOOGLE_CLIENT_ID)
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '804914853701-0tvqff3iuu5g4jtqictun1b6m9ijd7is.apps.googleusercontent.com';
  const TOTP_SECRET = import.meta.env.VITE_TOTP_SECRET || 'WRGA25FIVKCVGYN3U4LR';
  const ADMIN_EMAIL = 'eldar.ofer@gmail.com';

  if (!isOpen) return null;

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      if (decoded.email === ADMIN_EMAIL) {
        setStep(2);
        setError('');
      } else {
        setError(currentLang === 'he' ? 'אימייל לא מורשה.' : 'Unauthorized email.');
      }
    } catch (err) {
      setError(currentLang === 'he' ? 'שגיאה באימות' : 'Auth error');
    }
  };

  const handleGoogleError = () => {
    setError(currentLang === 'he' ? 'התחברות לגוגל נכשלה' : 'Google login failed');
  };

  const handleVerifyTotp = async (e) => {
    e.preventDefault();
    try {
      // Check current window and previous window to allow for slight delays
      const { otp: currentOtp } = await TOTP.generate(TOTP_SECRET);
      const { otp: prevOtp } = await TOTP.generate(TOTP_SECRET, { timestamp: Date.now() - 30000 });
      
      if (totpCode === currentOtp || totpCode === prevOtp) {
        onLoginSuccess();
      } else {
        setError(currentLang === 'he' ? 'קוד שגוי' : 'Invalid code');
      }
    } catch(err) {
      console.error(err);
      setError(currentLang === 'he' ? 'שגיאה באימות הקוד' : 'Error verifying code');
    }
  };

  return (
    <div className="modal-overlay login-overlay" onClick={onClose}>
      <div className="modal-content glass-panel login-card" onClick={e => e.stopPropagation()}>
        <h2>{currentLang === 'he' ? 'כניסת אדמין' : 'Admin Login'}</h2>
        
        {error && <div style={{ color: '#ff4d4f', marginBottom: '10px', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}

        {step === 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
              />
            </GoogleOAuthProvider>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyTotp} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <p style={{marginBottom: '15px'}}>{currentLang === 'he' ? 'הכנס קוד מאפליקציית Authenticator' : 'Enter Authenticator Code'}</p>
            <input 
              type="text" 
              placeholder={currentLang === 'he' ? 'קוד 6 ספרות' : '6-digit code'} 
              value={totpCode}
              onChange={e => setTotpCode(e.target.value)}
              autoFocus
              maxLength={6}
              style={{ textAlign: 'center', letterSpacing: '2px', fontSize: '1.2rem', marginBottom: '15px' }}
            />
            <button type="submit" className="login-submit">
              {currentLang === 'he' ? 'אימות' : 'Verify'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
