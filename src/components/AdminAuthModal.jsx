import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function AdminAuthModal({ isOpen, onClose, onLoginSuccess, currentLang }) {
  const [step, setStep] = useState(1);
  const [googleToken, setGoogleToken] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '804914853701-0tvqff3iuu5g4jtqictun1b6m9ijd7is.apps.googleusercontent.com';

  if (!isOpen) return null;

  const handleGoogleSuccess = (credentialResponse) => {
    setGoogleToken(credentialResponse.credential);
    setStep(2);
    setError('');
  };

  const handleGoogleError = () => {
    setError(currentLang === 'he' ? 'התחברות לגוגל נכשלה' : 'Google login failed');
  };

  const handleVerifyTotp = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin_login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          googleToken,
          totpCode
        })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        onLoginSuccess(data.token);
      } else {
        setError(data.error || (currentLang === 'he' ? 'קוד אימות שגוי או פג תוקף' : 'Invalid or expired code'));
      }
    } catch (err) {
      console.error(err);
      setError(currentLang === 'he' ? 'שגיאת תקשורת עם השרת' : 'Server communication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay login-overlay" onClick={onClose}>
      <div className="modal-content glass-panel login-card" onClick={e => e.stopPropagation()}>
        <h2>{currentLang === 'he' ? 'כניסת אדמין מאובטחת' : 'Secure Admin Login'}</h2>
        
        {error && <div style={{ color: '#ff4d4f', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}

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
              disabled={loading}
              style={{ textAlign: 'center', letterSpacing: '2px', fontSize: '1.2rem', marginBottom: '15px' }}
            />
            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (currentLang === 'he' ? 'בודק...' : 'Verifying...') : (currentLang === 'he' ? 'אימות' : 'Verify')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
