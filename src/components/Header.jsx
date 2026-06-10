import { useTranslation } from 'react-i18next';
import { Globe, Search, ChevronDown, Share2, Link as LinkIcon, QrCode, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function Header({ isSticky, searchQuery, setSearchQuery, onLogoClick, selectedMushroom }) {
  const { t, i18n } = useTranslation();
  const rawLang = i18n.language || 'he';
  const detectedLang = rawLang.split('-')[0].toLowerCase();
  const currentLang = ['he', 'en', 'es', 'ru'].includes(detectedLang) ? detectedLang : 'en';
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const langSelectorRef = useRef(null);

  useEffect(() => {
    // Preload QR Code
    const img = new Image();
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.href)}&bgcolor=ffffff&color=000000&ecc=H`;
  }, []);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'he', label: 'עברית' },
    { code: 'es', label: 'Español' },
    { code: 'ru', label: 'Русский' }
  ];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsLangOpen(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert(t('labels.link_copied') || 'Link copied!');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isLangOpen) return;
    const handler = (e) => {
      if (langSelectorRef.current && !langSelectorRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [isLangOpen]);

  return (
    <>
    <header 
      className={`header glass-panel ${isSticky ? 'sticky-header' : ''}`}
      style={selectedMushroom ? { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.1)' } : {}}
    >
      <div className="header-content" style={selectedMushroom ? { flexDirection: currentLang === 'he' ? 'row' : 'row-reverse' } : {}}>
        <div className="header-left">
          <h1 className="logo title-glow" onClick={() => { onLogoClick?.(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            {t('title')}
          </h1>
        </div>

        {!selectedMushroom && (
          <div className={`header-center sticky-search-wrap ${isSticky ? 'visible' : 'hidden'}`}>
            <div className="header-search">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                className="header-search-input"
                placeholder={currentLang === 'he' ? 'חיפוש מידע' : currentLang === 'es' ? 'Buscar' : currentLang === 'ru' ? 'Поиск' : 'Search'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="header-right nav-actions" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          
          {!selectedMushroom && (
            <div className="share-selector" style={{ position: 'relative' }}>
              <button 
                onClick={() => { setShowShareModal(true); setIsLangOpen(false); }} 
                className="lang-btn" 
                aria-label="Share"
                style={{ width: '42px', height: '42px', padding: '0', justifyContent: 'center' }}
              >
                <Share2 size={18} />
              </button>
            </div>
          )}

          <div className="lang-selector" ref={langSelectorRef}>
            <button 
              onClick={() => setIsLangOpen(prev => !prev)}
              className="lang-btn" 
              aria-label="Change Language"
              aria-expanded={isLangOpen}
              style={{ height: '42px' }}
            >
              <Globe size={18} />
              <span className="lang-text">{currentLang.toUpperCase()}</span>
              <ChevronDown size={14} className={`chevron ${isLangOpen ? 'rotate' : ''}`} />
            </button>

            {isLangOpen && (
              <div className="lang-dropdown animate-fade-in glass-panel">
                {languages.map((lang) => (
                  <button 
                    key={lang.code}
                    className={`lang-option ${currentLang === lang.code ? 'active' : ''}`}
                    onClick={() => changeLanguage(lang.code)}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </header>

      {showShareModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(4, 10, 6, 0.7)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowShareModal(false)}>
          <div style={{ background: '#0a140c', padding: '2.5rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', position: 'relative', minWidth: '320px', maxWidth: '90vw', border: '1px solid rgba(34, 197, 94, 0.3)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(34, 197, 94, 0.15)' }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowShareModal(false)} 
              style={{ 
                position: 'absolute', 
                top: '15px', 
                right: '15px', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                color: 'white', 
                borderRadius: '50%', 
                width: '32px', 
                height: '32px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.5)';
                e.currentTarget.style.color = '#4ade80';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = 'white';
              }}
            >
              <X size={18} />
            </button>
            
            <div style={{ position: 'relative', background: 'white', padding: '15px', borderRadius: '16px' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.href)}&bgcolor=ffffff&color=000000&ecc=H`} alt="QR Code" style={{ width: '200px', height: '200px', display: 'block' }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '44px',
                height: '44px',
                background: '#15803d',
                border: '3px solid white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
                  <path d="M12,2A8,8 0 0,0 4,10A1,1 0 0,0 5,11H19A1,1 0 0,0 20,10A8,8 0 0,0 12,2M10,12V20A2,2 0 0,0 12,22A2,2 0 0,0 14,20V12H10Z" />
                </svg>
              </div>
            </div>

            <button 
              onClick={copyLink} 
              style={{ 
                background: 'rgba(34, 197, 94, 0.15)', 
                color: '#4ade80', 
                border: '1px solid rgba(34, 197, 94, 0.4)', 
                padding: '0.8rem 1.5rem', 
                borderRadius: '99px', 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                width: '100%', 
                justifyContent: 'center', 
                transition: 'all 0.2s' 
              }} 
              onMouseOver={e => {
                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.25)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(34, 197, 94, 0.3)';
              }} 
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <LinkIcon size={18} /> {t('labels.copy_link') || 'Copy Link'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
