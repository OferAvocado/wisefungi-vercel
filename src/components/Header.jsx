import { useTranslation } from 'react-i18next';
import { Globe, Search, ChevronDown, Share2, Link as LinkIcon, QrCode, X } from 'lucide-react';
import { useState } from 'react';

export default function Header({ isSticky, searchQuery, setSearchQuery, onLogoClick }) {
  const { t, i18n } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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

  return (
    <header className={`header glass-panel ${isSticky ? 'sticky-header' : ''}`}>
      <div className="header-content">
        <div className="header-left">
          <h1 className="logo title-glow" onClick={() => { onLogoClick?.(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            {t('title')}
          </h1>
        </div>

        <div className={`header-center sticky-search-wrap ${isSticky ? 'visible' : 'hidden'}`}>
          <div className="header-search">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              className="header-search-input"
              placeholder={t('labels.search_placeholder') || "Search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="header-right nav-actions" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          
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

          <div className="lang-selector">
            <button 
              onClick={() => { setIsLangOpen(!isLangOpen); setIsShareOpen(false); }} 
              className="lang-btn" 
              aria-label="Change Language"
              style={{ height: '42px' }}
            >
              <Globe size={18} />
              <span className="lang-text">{i18n.language.toUpperCase()}</span>
              <ChevronDown size={14} className={`chevron ${isLangOpen ? 'rotate' : ''}`} />
            </button>

            {isLangOpen && (
              <div className="lang-dropdown animate-fade-in glass-panel">
                {languages.map((lang) => (
                  <button 
                    key={lang.code}
                    className={`lang-option ${i18n.language === lang.code ? 'active' : ''}`}
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

      {showShareModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowShareModal(false)}>
          <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', position: 'relative', minWidth: '320px', maxWidth: '90vw', border: '1px solid rgba(255,255,255,0.15)' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowShareModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h3 className="title-glow" style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold' }}>{t('labels.share_title') || 'Share Website'}</h3>
            
            <div style={{ background: 'white', padding: '15px', borderRadius: '16px' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.href)}&bgcolor=ffffff&color=000000`} alt="QR Code" style={{ width: '200px', height: '200px', display: 'block' }} />
            </div>

            <button onClick={copyLink} style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '0.8rem 1.5rem', borderRadius: '99px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center', transition: 'all 0.2s' }} onMouseOver={e => e.target.style.background = 'rgba(59, 130, 246, 0.3)'} onMouseOut={e => e.target.style.background = 'rgba(59, 130, 246, 0.2)'}>
              <LinkIcon size={18} /> {t('labels.copy_link') || 'Copy Link'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
