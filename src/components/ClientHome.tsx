// @ts-nocheck
/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, Search, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function ClientHome({ initialFungi }: { initialFungi: any[] }) {
  const [selectedMushroom, setSelectedMushroom] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [searchQuery, setSearchQuery] = useState('');
  const [interactionQuery, setInteractionQuery] = useState('');
  const [expandedCats, setExpandedCats] = useState({ do_not_combine: true, use_caution: true, potential_synergy: true, insufficient: true });
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    document.documentElement.dir = 'rtl';
    const handleScroll = () => setIsSticky(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const query = searchQuery.toLowerCase();
  
  // Search Filter Logic
  const filteredMushrooms = initialFungi.filter(m => {
    if (!query) return true;
    return (
      m.name.toLowerCase().includes(query) ||
      m.subtitle.toLowerCase().includes(query) ||
      (m.detailed_data?.conditions && m.detailed_data.conditions.some((c: string) => c.toLowerCase().includes(query))) ||
      (m.detailed_data?.benefits && m.detailed_data.benefits.some((b: string) => b.toLowerCase().includes(query)))
    );
  });

  // Extract suggestions based on query
  const suggestions = searchQuery.length > 0 
    ? [...new Set(initialFungi.flatMap(m => [m.name, ...(m.detailed_data?.conditions || [])]).filter(s => s.toLowerCase().includes(query)))].slice(0, 3)
    : [];

  const firstMatch = suggestions.find(s => s.toLowerCase().startsWith(query));
  const ghostText = firstMatch && searchQuery.length > 0 ? firstMatch.slice(searchQuery.length) : '';

  const handleKeyDown = (e: any) => {
    if (e.key === 'Tab' && firstMatch) {
      e.preventDefault();
      setSearchQuery(firstMatch);
    }
  };

  const mData = selectedMushroom?.detailed_data;

  return (
    <div className="app-container font-sans text-white">
      {/* HEADER */}
      <header className={`header ${isSticky ? 'glass-panel animate-slide-down' : ''}`} style={isSticky ? { top: '10px', width: 'calc(100% - 20px)', left: '10px' } : {}}>
        <div className="header-content">
          <div className="header-left">
            <h1 className="logo title-glow" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>Wise Fungi</h1>
          </div>
          <div className="header-center">
            <div className={`sticky-search-wrap ${isSticky ? 'visible' : 'hidden'}`}>
              <div className="header-search">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  className="header-search-input"
                  placeholder="חיפוש פטרייה, מחלה, סימפטום..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="header-right flex justify-end">
            <Link href="/admin/login" className="lang-btn">
              <span className="lang-text">כניסת מנהל</span>
            </Link>
          </div>
        </div>
      </header>
      
      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* HERO */}
        <section className="hero">
          <div className="hero-content">
            <h2 className="hero-title title-glow">פטריות מרפא מבוססות מחקר</h2>
            <p className="hero-subtitle">גלו את כוחן של פטריות המרפא — מידע מדעי, שימוש נכון ועצות בטיחות לכל מצב.</p>
          </div>

          <div className="search-section animate-fade-in">
            <div className="search-container glass-panel hero-search-star">
              <Search size={22} className="search-icon" />
              <div className="input-wrapper">
                <input 
                  type="text" 
                  className="search-input"
                  placeholder="חיפוש פטרייה, מחלה, סימפטום..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {ghostText && (
                  <span className="ghost-text" dir="rtl">
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
                    <button key={idx} className="completion-tag" onClick={() => setSearchQuery(s)}>{s}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* BENTO GRID */}
        {filteredMushrooms.length > 0 ? (
          <section id="bento-grid" className="bento-container">
            <div className="bento-grid">
              {filteredMushrooms.map((m) => (
                <div key={m.id} className={`bento-card ${m.slug.replace('-', '_')}`} onClick={() => { setSelectedMushroom(m); setActiveTab('info'); }}>
                  <div className="card-thumb-wrapper">
                    <img src={m.image} alt={m.name} className="card-thumb" />
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{m.name}</h3>
                    <p className="card-subtitle">{m.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div className="no-results-container">
            <h2 className="no-results-title">אין תוצאות עבור "{searchQuery}"</h2>
            <p className="no-results-subtitle">נסו לחפש תכונות אחרות כמו "חיסון" או "זיכרון".</p>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="footer shadow-xl">
        <p>&copy; 2026 Wise Fungi. Premium UI for Science-Based Fungi Wisdom.</p>
        <p className="footer-sub">Curated data from the latest mycological research.</p>
      </footer>

      {/* MODAL OVERLAY */}
      {selectedMushroom && (
        <div className="modal-overlay" onClick={() => setSelectedMushroom(null)}>
          <div className={`modal-content glass-panel animate-in ${selectedMushroom.slug.replace('-', '_')}`} onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedMushroom(null)}>×</button>
            
            <div className="modal-header">
              <div className="flex gap-6 items-center mb-6">
                <div className="w-[110px] h-[110px] shrink-0 bg-[var(--mush-top,rgba(255,255,255,0.05))] rounded-2xl flex items-center justify-center overflow-hidden">
                  <img src={selectedMushroom.image} alt={selectedMushroom.name} className="w-[80%] h-[80%] object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]" />
                </div>
                <div>
                  <h2 className="title-glow modal-title text-4xl font-black mb-2">{selectedMushroom.name}</h2>
                  <p className="modal-scientific text-xl opacity-80 italic font-medium">{selectedMushroom.subtitle}</p>
                </div>
              </div>
              
              <div className="modal-tabs">
                <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>מידע רפואי</button>
                <button className={`tab-btn ${activeTab === 'interactions' ? 'active' : ''}`} onClick={() => setActiveTab('interactions')}>אינטראקציות ותרופות</button>
              </div>
            </div>

            <div className="modal-body text-right" dir="rtl">
              {activeTab === 'info' ? (
                <div className="flex flex-col gap-10">
                  <div className="detail-section">
                    <span className="detail-label">על הפטרייה</span>
                    <p className="modal-description">{mData.about}</p>
                  </div>

                  {mData.benefits.length > 0 && (
                    <div className="detail-section bg-white/5 p-6 rounded-2xl border border-white/10">
                      <span className="detail-label text-[var(--mush-text)]">יתרונות עיקריים</span>
                      <ul className="benefit-list">
                        {mData.benefits.map((b: string, i: number) => (
                          <li key={i} className="benefit-item">
                            <CheckCircle size={20} className="text-green-500 shrink-0" />
                            <span className="text-lg text-[var(--mush-subtext)]">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {mData.conditions.length > 0 && (
                    <div className="detail-section">
                      <span className="detail-label">מחלות ומצבים</span>
                      <div className="tag-container">
                        {mData.conditions.map((c: string, i: number) => (
                          <span key={i} className="condition-tag">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="detail-section bg-white/5 p-6 rounded-2xl">
                      <span className="detail-label">הנחיות מימוש</span>
                      <p className="text-[var(--mush-subtext)] text-lg mb-6">{mData.usage || "אין מידע זמין."}</p>
                      <span className="detail-label">מינון</span>
                      <p className="text-[var(--mush-subtext)] text-lg">{mData.dosage || "אין מידע זמין."}</p>
                    </div>

                    {(mData.doctor_consultation && mData.doctor_consultation.length > 0) && (
                      <div className="detail-section bg-[#E0C23B]/10 border border-[#E0C23B]/30 p-6 rounded-2xl">
                        <span className="detail-label text-[#E0C23B]">חובת התייעצות רופא</span>
                        <p className="text-white/90 text-lg flex gap-3 items-start">
                          <AlertTriangle size={20} className="text-[#E0C23B] shrink-0 mt-1" />
                          <span>{mData.doctor_consultation.join(', ')}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {mData.contraindications.length > 0 && (
                    <div className="detail-section bg-[#E56767]/10 border border-[#E56767]/30 p-6 rounded-2xl">
                      <span className="detail-label text-[#E56767]">התוויות נגד</span>
                      <ul className="grid gap-3">
                        {mData.contraindications.map((ci: string, i: number) => (
                          <li key={i} className="flex gap-3 items-start">
                            <XCircle size={20} className="text-[#E56767] shrink-0 mt-1" />
                            <span className="text-lg text-white/90">{ci}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-6 pt-4">
                  {/* Interactions mapped directly from DB logic */}
                  {mData.interactions.length === 0 ? (
                    <p className="text-center text-white/60 py-10">לא קיימות אינטראקציות רשומות ל-{selectedMushroom.name}.</p>
                  ) : (
                    mData.interactions.map((interaction: any, i: number) => {
                      const isHighRisk = interaction.type === 'high_risk';
                      const isCaution = interaction.type === 'moderate_interaction';
                      return (
                        <div key={i} className={`bg-white/5 border ${isHighRisk ? 'border-red-500/50' : isCaution ? 'border-yellow-500/50' : 'border-white/20'} rounded-2xl p-5`}>
                           <div className="flex items-center gap-3 mb-2 font-bold text-lg">
                             {isHighRisk && <XCircle className="text-red-400" />}
                             {isCaution && <AlertTriangle className="text-yellow-400" />}
                             {!isHighRisk && !isCaution && <CheckCircle className="text-green-400" />}
                             <span>{interaction.name}</span>
                             <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-white/70 mr-auto capitalize">
                               {interaction.evidence.replace('_', ' ')}
                             </span>
                           </div>
                           <p className="text-white/70 text-[1.05rem] pr-9">{interaction.details}</p>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
