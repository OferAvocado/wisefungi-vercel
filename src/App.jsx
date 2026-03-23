import Header from './components/Header';
import Hero from './components/Hero';
import BentoGrid from './components/BentoGrid';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import searchDataJson from './assets/searchData.json';
import originalInteractions from './assets/original_interactions.json';
import './App.css';

function App() {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language || 'he';
  const [selectedMushroom, setSelectedMushroom] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [searchQuery, setSearchQuery] = useState('');
  const [interactionQuery, setInteractionQuery] = useState('');
  const [expandedCats, setExpandedCats] = useState({ do_not_combine: true, use_caution: true, potential_synergy: true, insufficient: true });
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;

    const handleScroll = () => {
      // Trigger sticky state after scrolling past 100px
      // Keep sticky if we've scrolled down at all and there's an active search
      const scrollY = window.scrollY;
      setIsSticky(scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [i18n.language]);

  const handleSelect = (m) => {
    setSelectedMushroom(m);
    setActiveTab('info');
  };

  const mushroomsObj = t('mushrooms', { returnObjects: true });
  const allMushrooms = Object.entries(mushroomsObj).map(([id, m]) => ({ id, ...m }));
  
  // Use the imported SearchIndex_export data
  const rawSearchIndex = searchDataJson.index;

  const query = searchQuery.toLowerCase();
  
  // Create a normalized map to align English names with our local IDs
  // Since we don't have a direct DB ID to local ID mapping, we match by English name
  const enMushroomMap = {
    "Reishi": "reishi",
    "Lion's Mane": "lions_mane",
    "Cordyceps": "cordyceps",
    "Chaga": "chaga",
    "Turkey Tail": "turkey_tail",
    "Tremella": "tremella"
  };

  const filteredMushrooms = allMushrooms.filter(m => {
    if (!query) return true;
    
    // Check if any row in the imported index matches this mushroom's english name AND the search query
    const dbMatch = Object.values(rawSearchIndex).some(row => 
      enMushroomMap[row.mushroom_name_en] === m.id &&
      (
        ((row.keyword || '').toLowerCase().includes(query)) ||
        ((row.mushroom_name_he || '').toLowerCase().includes(query)) ||
        ((row.mushroom_name_en || '').toLowerCase().includes(query))
      )
    );

    return (
      dbMatch ||
      m.name.toLowerCase().includes(query) ||
      m.subtitle.toLowerCase().includes(query) ||
      (m.scientific_name && m.scientific_name.toLowerCase().includes(query)) ||
      (m.detailed_data?.conditions && m.detailed_data.conditions.some(c => c.toLowerCase().includes(query)))
    );
  });

  // Unique suggestions with current language mapping based on DB index
  const suggestions = searchQuery.length > 0 
    ? [...new Map(
        Object.values(rawSearchIndex)
          .filter(row => (row.keyword || '').toLowerCase().includes(query) || (row.mushroom_name_he || '').toLowerCase().includes(query) || (row.mushroom_name_en || '').toLowerCase().includes(query))
          .map(row => {
            const localId = enMushroomMap[row.mushroom_name_en];
            const currentItem = mushroomsObj[localId];
            if (!currentItem) return null;

            // Ensure the suggestion text is appropriate for the current language
            let suggestionTerm = '';
            if (row.category === 'name' || row.category === 'scientific_name') {
              suggestionTerm = currentItem.name;
            } else {
              // It's a condition/benefit. The JSON has keyword. 
              // We'll just suggest the keyword that matched if it's the current language, or try to localize
              if (row.language === currentLang) {
                 suggestionTerm = row.keyword;
              } else {
                 return null; // Skip non-localized conditions to avoid showing hebrew conditions in english UI
              }
            }
            return [suggestionTerm, suggestionTerm];
          })
          .filter(Boolean)
      ).values()].slice(0, 3)
    : [];

  const mData = selectedMushroom?.detailed_data;

  return (
    <div className="app-container">
      <Header 
        isSticky={isSticky} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />
      
      <main className="main-content">
        <Hero 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          isSticky={isSticky} 
          suggestions={suggestions}
        />
        {filteredMushrooms.length > 0 ? (
          <BentoGrid mushrooms={filteredMushrooms} onSelect={handleSelect} />
        ) : (
          <div className="no-results-container">
            <h2 className="no-results-title">No results for "{searchQuery}"</h2>
            <p className="no-results-subtitle">Try searching for other properties like "immune" or "energy".</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer shadow-xl">
        <p>&copy; 2026 Wise Fungi. Premium UI for Science-Based Fungi Wisdom.</p>
        <p className="footer-sub">Curated data from the latest mycological research.</p>
      </footer>

      {/* Detailed Modal */}
      {selectedMushroom && (
        <div className="modal-overlay" onClick={() => setSelectedMushroom(null)}>
          <div className={`modal-content glass-panel animate-in ${selectedMushroom.id}`} onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedMushroom(null)}>×</button>
            
            <div className="modal-header">
              <div className="modal-header-top" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '110px', height: '110px', flexShrink: 0, background: 'var(--mush-top, rgba(255,255,255,0.05))', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={selectedMushroom.image} alt={selectedMushroom.name} style={{ width: '80%', height: '80%', objectFit: 'contain', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.3))' }} />
                </div>
                <div>
                  <h2 className="title-glow modal-title">{selectedMushroom.name}</h2>
                  <p className="modal-scientific">{selectedMushroom.subtitle}</p>
                </div>
              </div>
              
              <div className="modal-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  {t('labels.about')}
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'interactions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('interactions')}
                >
                  {t('labels.interactions')}
                </button>
              </div>
            </div>

            <div className="modal-body">
              {activeTab === 'info' ? (
                <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  
                  {/* About Section */}
                  <div className="detail-section">
                    <span className="detail-label">{t('labels.about')}</span>
                    <p className="modal-description">{mData.about}</p>
                  </div>

                  {/* Benefits Section */}
                  <div className="detail-section" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="detail-label" style={{ color: 'var(--mush-text)' }}>{t('labels.benefits')}</span>
                    <ul className="benefit-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.8rem' }}>
                      {mData.benefits.map((b, i) => (
                        <li key={i} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                          <CheckCircle size={20} color="#22c55e" style={{ flexShrink: 0 }} />
                          <span style={{ fontSize: '1.1rem', color: 'var(--mush-subtext)' }}>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Conditions Section */}
                  <div className="detail-section">
                    <span className="detail-label">{t('labels.conditions')}</span>
                    <div className="tag-container">
                      {mData.conditions.map((c, i) => (
                        <span key={i} className="condition-tag">{c}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {/* Usage & Dosage */}
                    <div className="detail-section" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px' }}>
                      <span className="detail-label">{t('labels.how_to_use')}</span>
                      <p style={{ color: 'var(--mush-subtext)', fontSize: '1.05rem', marginBottom: '1.5rem' }}>{mData.usage}</p>
                      
                      <span className="detail-label">{t('labels.dosage')}</span>
                      <p style={{ color: 'var(--mush-subtext)', fontSize: '1.05rem' }}>{mData.dosage}</p>
                    </div>

                    {/* Doctor Consultation */}
                    <div className="detail-section" style={{ background: 'rgba(224, 194, 59, 0.15)', border: '1px solid rgba(224, 194, 59, 0.3)', padding: '1.5rem', borderRadius: '16px' }}>
                      <span className="detail-label" style={{ color: '#E0C23B' }}>{t('labels.doctor_consultation')}</span>
                      <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.05rem', display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                        <AlertTriangle size={20} color="#E0C23B" style={{ flexShrink: 0, marginTop: '4px' }} />
                        <span>{Array.isArray(mData.doctor_consultation) ? mData.doctor_consultation.join(' ') : mData.doctor_consultation}</span>
                      </p>
                    </div>
                  </div>

                  {/* Contraindications */}
                  <div className="detail-section" style={{ background: 'rgba(229, 103, 103, 0.15)', border: '1px solid rgba(229, 103, 103, 0.3)', padding: '1.5rem', borderRadius: '16px' }}>
                    <span className="detail-label" style={{ color: '#E56767' }}>{t('labels.contraindications')}</span>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.8rem' }}>
                      {mData.contraindications.map((ci, i) => (
                        <li key={i} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                          <XCircle size={20} color="#E56767" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)' }}>{ci}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              ) : (
                <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '1rem' }}>
                  
                  {/* Interaction Search Bar */}
                  <div style={{ position: 'relative', width: '100%', marginBottom: '1rem' }}>
                    <Search color="rgba(255,255,255,0.5)" size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text" 
                      placeholder="Search for drugs, herbs, or supplements..."
                      value={interactionQuery}
                      onChange={(e) => setInteractionQuery(e.target.value)}
                      style={{ 
                        width: '100%', padding: '1.2rem 1.2rem 1.2rem 3rem', 
                        borderRadius: '16px', border: '2px solid rgba(255,255,255,0.1)', 
                        background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1.1rem', outline: 'none'
                      }} 
                    />
                  </div>

                  {(() => {
                    const mapIdToSubstance = {
                      reishi: 'Reishi',
                      cordyceps: 'Cordyceps',
                      lions_mane: "Lion's Mane",
                      chaga: 'Chaga',
                      turkey_tail: 'Turkey Tail',
                      tremella: 'Tremella'
                    };
                    const engName = mapIdToSubstance[selectedMushroom.id] || selectedMushroom.id;
                    const mushInts = originalInteractions[engName] || { do_not_combine: [], use_caution: [], potential_synergy: [], insufficient: [] };

                    const tf = (obj) => {
                      if (!obj) return '';
                      return obj[currentLang] || obj['en'] || obj['he'] || '';
                    };

                    const filterItems = (items) => {
                      if (!interactionQuery.trim()) return items || [];
                      const q = interactionQuery.toLowerCase();
                      return (items || []).filter(item => {
                        const n = tf(item.name).toLowerCase();
                        const m = tf(item.mechanism).toLowerCase();
                        return n.includes(q) || m.includes(q);
                      });
                    };

                    const categories = {
                      do_not_combine: filterItems(mushInts.do_not_combine),
                      use_caution: filterItems(mushInts.use_caution),
                      potential_synergy: filterItems(mushInts.potential_synergy),
                      insufficient: filterItems(mushInts.insufficient)
                    };

                    const getLabels = (key) => {
                      const labels = {
                        do_not_combine: { he: "אין לשלב — סיכון גבוה", en: "Do NOT combine — High Risk", ru: "НЕ комбинировать — Высокий риск", es: "NO combinar — Riesgo Alto" },
                        use_caution: { he: "יש לנקוט זהירות — אינטראקציה בינונית", en: "Use Caution — Moderate Interaction", ru: "Соблюдать осторожность", es: "Usar con Precaución" },
                        potential_synergy: { he: "סינרגיה פוטנציאלית — שילוב מועיל", en: "Potential Synergy — Helpful Combination", ru: "Потенциальная синергия", es: "Sinergia Potencial" },
                        insufficient: { he: "מחקר לא מספיק", en: "Unknown / Insufficient Research", ru: "Недостаточно исследований", es: "Desconocido / Investigación Insuficiente" }
                      };
                      return labels[key][currentLang] || labels[key]['en'];
                    };

                    const evidenceLabels = {
                      clinical: { he: 'ראיות קליניות', en: 'Clinical evidence' },
                      limited: { he: 'מחקר מוגבל', en: 'Limited research' },
                      theoretical: { he: 'תיאורטי', en: 'Theoretical' }
                    };

                    const EvidenceBadge = ({ type }) => {
                      if (!type) return null;
                      const lbl = evidenceLabels[type]?.[currentLang] || type;
                      let bg = 'rgba(255,255,255,0.1)', border = 'rgba(255,255,255,0.3)', text = 'rgba(255,255,255,0.6)';
                      if (type === 'clinical') { bg = 'rgba(255,255,255,0.2)'; text = 'white'; }
                      else if (type === 'limited') { text = 'rgba(255,255,255,0.8)'; }
                      return (
                        <span style={{ background: bg, border: `1px solid ${border}`, color: text, padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {lbl}
                        </span>
                      );
                    };

                    const renderCategory = (key, items, icon, colors) => {
                      if (items.length === 0 && interactionQuery.trim() === '') return null;
                      if (items.length === 0) return null;

                      const isExpanded = expandedCats[key];

                      return (
                        <div style={{ background: colors.bg, border: `2px solid ${colors.border}`, borderRadius: '16px', marginBottom: '1rem', overflow: 'hidden', textAlign: 'left' }} dir={currentLang==='he'?'rtl':'ltr'}>
                          <button 
                            onClick={() => setExpandedCats(prev => ({...prev, [key]: !prev[key]}))}
                            style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.1rem', fontWeight: '800', color: 'white' }}>
                              <span style={{ color: colors.iconCol }}>{icon}</span>
                              {getLabels(key)}
                            </div>
                            <ChevronDown size={20} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', color: 'rgba(255,255,255,0.6)' }} />
                          </button>

                          {isExpanded && (
                            <div style={{ padding: '0 1.2rem 1.2rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                              {items.map((item, idx) => (
                                <div key={idx} style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}`, borderRadius: '12px', overflow: 'hidden' }}>
                                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ color: colors.iconCol, flexShrink: 0 }}>{icon}</span>
                                        <span style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'white' }}>{tf(item.name)}</span>
                                      </div>
                                      <EvidenceBadge type={item.evidence} />
                                    </div>
                                    <div style={{ color: 'var(--mush-subtext)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                      {tf(item.why)}
                                    </div>
                                    {item.mechanism && (
                                      <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                                        <span style={{ fontWeight: 'bold' }}>Mechanism:</span> {tf(item.mechanism)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    };

                    const totalItems = Object.values(categories).flat().length;

                    return (
                      <div style={{ width: '100%', maxWidth: '850px', margin: '0 auto' }}>
                        {renderCategory('do_not_combine', categories.do_not_combine, <XCircle size={22} />, { bg: 'rgba(127,29,29,0.7)', border: '#ef4444', iconCol: '#fca5a5', cardBg: 'rgba(69,10,10,0.4)', cardBorder: 'rgba(252,165,165,0.6)' })}
                        {renderCategory('use_caution', categories.use_caution, <AlertTriangle size={22} />, { bg: 'rgba(78,63,0,0.8)', border: '#eab308', iconCol: '#fde047', cardBg: 'rgba(66,32,6,0.3)', cardBorder: 'rgba(253,224,71,0.6)' })}
                        {renderCategory('potential_synergy', categories.potential_synergy, <CheckCircle size={22} />, { bg: 'rgba(5,46,22,0.8)', border: '#22c55e', iconCol: '#86efac', cardBg: 'rgba(5,46,22,0.3)', cardBorder: 'rgba(134,239,172,0.6)' })}
                        {renderCategory('insufficient', categories.insufficient, <HelpCircle size={22} />, { bg: 'rgba(30,30,30,0.7)', border: '#6b7280', iconCol: '#d1d5db', cardBg: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.3)' })}
                        
                        {totalItems === 0 && (
                          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--mush-subtext)', fontSize: '1.1rem' }}>
                            We couldn't find a matching interaction for "{interactionQuery}".
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
