import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

export default function Hero({ searchQuery, setSearchQuery, isSticky, suggestions }) {
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

  return (
    <section className="hero">
      <div className="hero-content">
        <h2 className="hero-title title-glow">{t('hero_title')}</h2>
        <p className="hero-subtitle">{t('subtitle')}</p>
      </div>

      <div className="search-section animate-fade-in">
        <div className="search-container glass-panel hero-search-star">
          <Search size={22} className="search-icon" />
          <div className="input-wrapper">
            <input 
              type="text" 
              className="search-input"
              placeholder={t('labels.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {ghostText && (
              <span className="ghost-text">
                <span className="query-part">{searchQuery}</span>
                <span className="complete-part">{ghostText}</span>
              </span>
            )}
          </div>
        </div>

        <div className="completions-container">
          {suggestions.length > 0 && searchQuery.length > 0 && (
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
