import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

export default function Hero({ searchQuery, setSearchQuery, isSticky, suggestions, uiContent, setUiContent, isGlobalEditing }) {
  const { t } = useTranslation();

  // Find the first suggestion that starts with the current query for inline autocomplete
  const firstMatch = suggestions.find(s => s.toLowerCase().startsWith(searchQuery.toLowerCase()));
  const ghostText = firstMatch && searchQuery.length > 0 ? firstMatch.slice(searchQuery.length) : '';

  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && firstMatch) {
      e.preventDefault();
      setSearchQuery(firstMatch);
    }
  };

  const getT = (key) => uiContent && uiContent[key] ? uiContent[key] : t(key);

  return (
    <section className="hero">
      <div className="hero-content">
        {isGlobalEditing ? (
          <>
            <input 
              className="admin-edit-input hero-title title-glow"
              style={{ textAlign: 'center', width: '100%', maxWidth: '800px', marginBottom: '1rem', background: 'rgba(255,255,255,0.1)' }}
              value={uiContent?.hero_title || t('hero_title') || ''}
              onChange={(e) => setUiContent({ ...uiContent, hero_title: e.target.value })}
            />
            <textarea 
              className="admin-edit-textarea hero-subtitle"
              style={{ textAlign: 'center', width: '100%', maxWidth: '800px', minHeight: '80px', background: 'rgba(255,255,255,0.05)' }}
              value={uiContent?.hero_subtitle || t('subtitle') || ''}
              onChange={(e) => setUiContent({ ...uiContent, hero_subtitle: e.target.value })}
            />
          </>
        ) : (
          <>
            <h2 className="hero-title title-glow">{getT('hero_title')}</h2>
            <p className="hero-subtitle">{getT('hero_subtitle') === getT('hero_subtitle') /* wait wait, fallback is subtitle */ ? (uiContent?.hero_subtitle || t('subtitle')) : ''}</p>
          </>
        )}
      </div>

      <div className="search-section animate-fade-in">
        <div className="search-container glass-panel hero-search-star">
          <Search size={22} className="search-icon" />
          <div className="input-wrapper">
            {isGlobalEditing ? (
              <input 
                type="text" 
                className="search-input"
                style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                value={uiContent?.search_placeholder || t('labels.search_placeholder') || ''}
                onChange={(e) => setUiContent({ ...uiContent, search_placeholder: e.target.value })}
              />
            ) : (
              <input 
                type="text" 
                className="search-input"
                placeholder={uiContent?.search_placeholder || t('labels.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            )}
            {!isGlobalEditing && ghostText && (
              <span className="ghost-text">
                <span className="query-part">{searchQuery}</span>
                <span className="complete-part">{ghostText}</span>
              </span>
            )}
          </div>
        </div>

        <div className="completions-container">
          {!isGlobalEditing && suggestions.length > 0 && searchQuery.length > 0 && (
            <div className="suggestions-row">
              {suggestions.map((s, idx) => (
                <button 
                  key={idx} 
                  className="completion-tag"
                  onClick={() => setSearchQuery(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="ambient-glow"></div>
    </section>
  );
}
