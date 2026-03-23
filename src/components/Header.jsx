import { useTranslation } from 'react-i18next';
import { Globe, Search, ChevronDown, Share2, Link as LinkIcon, QrCode, X } from 'lucide-react';
import { useState } from 'react';

export default function Header({ isSticky, searchQuery, setSearchQuery, onLogoClick }) {
  const { t, i18n } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);

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

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert(t('labels.link_copied') || 'Link copied!');
    setIsShareOpen(false);
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
              onClick={() => setIsShareOpen(!isShareOpen)} 
              className="lang-btn" 
              aria-label="Share"
              style={{ width: '42px', height: '42px', padding: '0', justifyContent: 'center' }}
            >
              <Share2 size={18} />
            </button>

            {isShareOpen && (
              <div className="lang-dropdown animate-fade-in glass-panel" style={{ width: 'max-content', padding: '0.5rem', right: '0' }}>
                <button className="lang-option" onClick={copyLink} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start' }}>
                  <LinkIcon size={16} /> {t('labels.copy_link') || 'Copy Link'}
                </button>
                <button className="lang-option" onClick={() => { setShowQR(true); setIsShareOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start' }}>
                  <QrCode size={16} /> {t('labels.show_qr') || 'Show QR Code'}
                </button>
              </div>
            )}
          </div>

          <div className="lang-selector">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)} 
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

      {showQR && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowQR(false)}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#000', margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>Scan to Open</h3>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.href)}`} alt="QR Code" style={{ width: '200px', height: '200px' }} />
            <button onClick={() => setShowQR(false)} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '99px', cursor: 'pointer', fontWeight: 'bold', marginTop: '1rem' }}>Close</button>
          </div>
        </div>
      )}
    </header>
  );
}
