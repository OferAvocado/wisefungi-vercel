import Header from './components/Header';
import Hero from './components/Hero';
import BentoGrid from './components/BentoGrid';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, Search, ChevronDown, ChevronRight, Lock, Save, Edit3, Plus, Trash2, Palette, Layout, Zap, Shield, Droplets, ArrowLeft, Home } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import translationHE from './locales/he.json';
import translationEN from './locales/en.json';
import translationES from './locales/es.json';
import translationRU from './locales/ru.json';
import searchDataJson from './assets/searchData.json';
import originalInteractions from './assets/original_interactions.json';
import RichTextEditor from './components/RichTextEditor';
import ThemeEditor from './components/ThemeEditor';
import VisualEditor from './components/VisualEditor';
import './App.css';

function App() {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language || 'he';
  const [mushroomsData, setMushroomsData] = useState(null);
  const [interactionsData, setInteractionsData] = useState(null);
  const [selectedMushroom, setSelectedMushroom] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [searchQuery, setSearchQuery] = useState('');
  const [interactionQuery, setInteractionQuery] = useState('');
  const [expandedCats, setExpandedCats] = useState({ do_not_combine: true, use_caution: false, potential_synergy: false, insufficient: false });
  const [isSticky, setIsSticky] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGlobalEditing, setIsGlobalEditing] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isVisualEditorOpen, setIsVisualEditorOpen] = useState(false);
  const [visualSelectedId, setVisualSelectedId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [uiContent, setUiContent] = useState({});
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Logo click counter for secret admin access
  const [logoClicks, setLogoClicks] = useState(0);

  useEffect(() => {
    // Check if already an admin in this session
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken === 'wise-fungi-secret') setIsAdmin(true);

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch from API with cache busting
        const response = await fetch(`/api/fungi?t=${Date.now()}`, { cache: 'no-store' });
        const dbData = await response.json();
        
        // Fetch UI content
        const uiResp = await fetch(`/api/ui?lang=${currentLang}&t=${Date.now()}`, { cache: 'no-store' });
        const uiData = await uiResp.json();
        
        if (Object.keys(dbData).length > 0) {
          setMushroomsData(dbData);
        } else {
          // Fallback to local if DB is empty
          const dataMap = { 'he': translationHE, 'en': translationEN, 'es': translationES, 'ru': translationRU };
          const localData = dataMap[currentLang] || translationHE;
          setMushroomsData(localData.mushrooms);
        }
        
        setInteractionsData(originalInteractions);
        setUiContent(uiData || {});
        
      } catch (err) {
        console.error("Fetch error, falling back to local JSON:", err);
        const dataMap = { 'he': translationHE, 'en': translationEN, 'es': translationES, 'ru': translationRU };
        const localData = dataMap[currentLang] || translationHE;
        setMushroomsData(localData.mushrooms);
        setInteractionsData(originalInteractions);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentLang, t]);

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
    
    const mapIdToSubstance = {
      reishi: 'Reishi', cordyceps: 'Cordyceps', lions_mane: "Lion's Mane",
      chaga: 'Chaga', turkey_tail: 'Turkey Tail', tremella: 'Tremella'
    };
    const engName = mapIdToSubstance[m.id] || m.id;
    let initialInteractions = originalInteractions[engName] || { do_not_combine: [], use_caution: [], potential_synergy: [], insufficient: [] };
    if (uiContent && uiContent[`int_${m.id}`]) {
      try { initialInteractions = JSON.parse(uiContent[`int_${m.id}`]); } catch(e){}
    }

    setEditData({ ...m.detailed_data, interactions: initialInteractions, keywords: m.keywords || [] });
    setIsEditing(false);
    setActiveTab('info');
  };

  const handleSave = async () => {
    try {
      const resp = await fetch('/api/fungi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('adminToken') },
        body: JSON.stringify({ action: 'update', slug: selectedMushroom.id, lang: currentLang, data: { ...editData, name: selectedMushroom.name, subtitle: selectedMushroom.subtitle, image: selectedMushroom.image } })
      });
      if (resp.ok) {
        setMushroomsData(prev => ({ 
          ...prev, 
          [selectedMushroom.id]: { 
            ...prev[selectedMushroom.id], 
            name: selectedMushroom.name,
            subtitle: selectedMushroom.subtitle,
            keywords: editData.keywords,
            detailed_data: editData 
          } 
        }));
        setIsEditing(false);
        alert(currentLang === 'he' ? 'השינויים נשמרו בהצלחה!' : 'Changes saved successfully!');
      } else {
        alert('Error saving data');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGlobalSave = async () => {
    try {
      // 1. Save UI Content
      const uiResp = await fetch('/api/fungi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('adminToken') },
        body: JSON.stringify({ action: 'update_ui', lang: currentLang, data: uiContent })
      });

      // 2. Save Fungi tags/titles that were modified on the grid
      const promises = allMushrooms.map(m => 
        fetch('/api/fungi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('adminToken') },
          body: JSON.stringify({ action: 'update', slug: m.id, lang: currentLang, data: { ...m.detailed_data, name: m.name, subtitle: m.subtitle, keywords: m.keywords, image: m.image } })
        })
      );

      await Promise.all(promises);

      if (uiResp.ok) {
        setIsGlobalEditing(false);
        alert(currentLang === 'he' ? 'השינויים הכלליים נשמרו בהצלחה!' : 'Global changes saved!');
      } else {
        const errorData = await uiResp.text();
        console.error("Save error:", errorData);
        alert('Error saving global data');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogoClick = () => {
    setLogoClicks(prev => {
      if (prev + 1 >= 5) {
        setIsLoginModalOpen(true);
        return 0;
      }
      return prev + 1;
    });
    // Reset clicks after 3 seconds of inactivity
    setTimeout(() => setLogoClicks(0), 3000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple verification (in production this would call /api/admin/login)
    if (loginPassword === '-Ofer1q2w3e4r') { 
      setIsAdmin(true);
      setIsLoginModalOpen(false);
      localStorage.setItem('adminToken', 'wise-fungi-secret');
      alert(currentLang === 'he' ? 'ברוך הבא מנהל!' : 'Welcome Admin!');
    } else {
      alert(currentLang === 'he' ? 'סיסמה שגויה' : 'Wrong password');
    }
  };

  const mushroomsObj = mushroomsData || {};
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
      (m.keywords && m.keywords.some(k => k.toLowerCase().includes(query))) ||
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

  const defaultTheme = {
    bgPrimary: '#0a0a0a',
    bgSecondary: '#121212',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    accentPrimary: '#16a34a',
    bentoBg: 'rgba(255, 255, 255, 0.05)',
    bentoBorder: 'transparent',
    benefitIconShape: 'CheckCircle', benefitIconColor: '#22c55e',
    doctorIconShape: 'AlertTriangle', doctorIconColor: '#E0C23B',
    contraIconShape: 'XCircle', contraIconColor: '#E56767'
  };
  const theme = uiContent?.globalTheme || defaultTheme;

  const renderDynamicIcon = (shape, props) => {
    switch (shape) {
      case 'Star': return <svg width={props.size} height={props.size} fill={props.color} viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
      case 'Heart': return <svg width={props.size} height={props.size} fill={props.color} viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>;
      case 'Zap': return <Zap {...props} />;
      case 'Shield': return <Shield {...props} />;
      case 'Droplet': return <Droplets {...props} />;
      case 'AlertTriangle': return <AlertTriangle {...props} />;
      case 'XCircle': return <XCircle {...props} />;
      default: return <CheckCircle {...props} />;
    }
  };

  const generateCustomCSS = () => {
    if (!uiContent?.customStyles) return '';
    let css = '';
    Object.entries(uiContent.customStyles).forEach(([id, devices]) => {
      if (devices.desktop) css += `[data-editable="${id}"] { ${Object.entries(devices.desktop).map(([k,v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${v} !important;`).join(' ')} }\n`;
      if (devices.tablet) css += `@media (max-width: 1024px) { [data-editable="${id}"] { ${Object.entries(devices.tablet).map(([k,v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${v} !important;`).join(' ')} } }\n`;
      if (devices.mobile) css += `@media (max-width: 768px) { [data-editable="${id}"] { ${Object.entries(devices.mobile).map(([k,v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${v} !important;`).join(' ')} } }\n`;
    });
    return css;
  };

  const generateThemeCSS = () => {
    const t = uiContent?.globalTheme;
    if (!t) return '';
    return `
      :root {
        ${t.bgPrimary ? `--bg-primary: ${t.bgPrimary};` : ''}
        ${t.bgSecondary ? `--bg-secondary: ${t.bgSecondary};` : ''}
        ${t.accentPrimary ? `--accent-primary: ${t.accentPrimary};` : ''}
        ${t.textPrimary ? `--text-primary: ${t.textPrimary};` : ''}
        ${t.textSecondary ? `--text-secondary: ${t.textSecondary};` : ''}
        ${t.bgGlass ? `--bg-glass: ${t.bgGlass};` : ''}
        ${t.borderGlass ? `--border-glass: ${t.borderGlass};` : ''}
      }
      body {
        ${t.bgPrimary ? `background-color: var(--bg-primary) !important;` : ''}
      }
    `;
  };

  useEffect(() => {
    if (!isVisualEditorOpen) return;
    const handleClick = (e) => {
      if (e.target.closest('.ve-panel') || e.target.closest('.admin-status-bar')) return;
      e.preventDefault();
      e.stopPropagation();
      const el = e.target.closest('[data-editable]');
      if (el) {
        setVisualSelectedId(el.getAttribute('data-editable'));
      }
    };
    const handleMouseOver = (e) => {
      if (e.target.closest('.ve-panel') || e.target.closest('.admin-status-bar')) return;
      const el = e.target.closest('[data-editable]');
      if (el) el.style.outline = '2px dashed #007acc';
    };
    const handleMouseOut = (e) => {
      const el = e.target.closest('[data-editable]');
      if (el) el.style.outline = '';
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [isVisualEditorOpen]);

  return (
    <div className={`app-container ${isAdmin ? 'is-admin' : ''}`}>
      <style dangerouslySetInnerHTML={{__html: `
        ${generateCustomCSS()}
        ${generateThemeCSS()}
        .app-container { margin: 0 !important; border: none !important; }
      `}} />

      {isAdmin && !isVisualEditorOpen && (
        <div className="admin-status-bar">
          <Lock size={14} /> {currentLang === 'he' ? 'מצב מנהל פעיל' : 'Admin Mode Active'}
          
          <button 
            onClick={() => isGlobalEditing ? handleGlobalSave() : setIsGlobalEditing(true)} 
            className="admin-logout-btn" 
            style={{ marginLeft: '1rem', background: isGlobalEditing ? 'white' : 'rgba(255,255,255,0.2)', color: isGlobalEditing ? '#16a34a' : 'white', fontWeight: 'bold' }}
          >
            {isGlobalEditing ? 
              (currentLang === 'he' ? 'שמור דף הבית' : 'Save Homepage') : 
              (currentLang === 'he' ? 'ערוך דף הבית' : 'Edit Homepage')
            }
          </button>

          <button 
            onClick={() => { setIsThemeOpen(true); setIsVisualEditorOpen(false); }} 
            className="admin-logout-btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Palette size={14} /> עיצוב מותאם אישית
          </button>

          <button 
            onClick={() => { setIsVisualEditorOpen(true); setIsThemeOpen(false); }} 
            className="admin-logout-btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#007acc', color: 'white', fontWeight: 'bold', border: '1px solid #005f9e' }}
          >
            <Layout size={14} /> עורך סגנונות וצבעים מתקדם
          </button>

          <button onClick={() => { setIsAdmin(false); setIsGlobalEditing(false); localStorage.removeItem('adminToken'); }} className="admin-logout-btn">
            {currentLang === 'he' ? 'התנתק' : 'Logout'}
          </button>
        </div>
      )}

      {isVisualEditorOpen && (
        <VisualEditor 
          uiContent={uiContent} 
          setUiContent={setUiContent} 
          selectedId={visualSelectedId}
          setSelectedId={setVisualSelectedId}
          onSave={handleGlobalSave} 
          onClose={() => setIsVisualEditorOpen(false)} 
        />
      )}

      {isThemeOpen && !isVisualEditorOpen && (
        <ThemeEditor 
          theme={uiContent?.globalTheme || defaultTheme} 
          setTheme={(t) => setUiContent({ ...uiContent, globalTheme: t(uiContent?.globalTheme || defaultTheme) })} 
          onSave={() => handleGlobalSave()} 
          onClose={() => setIsThemeOpen(false)} 
        />
      )}

      {!selectedMushroom && (
        <Header 
          isSticky={isSticky} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onLogoClick={handleLogoClick}
        />
      )}
      
      <main className="main-content">
        {!selectedMushroom ? (
          <>
            <Hero 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              isSticky={isSticky} 
              suggestions={suggestions}
              uiContent={uiContent}
              setUiContent={setUiContent}
              isGlobalEditing={isGlobalEditing}
            />
            {filteredMushrooms.length > 0 ? (
              <BentoGrid 
                mushrooms={filteredMushrooms} 
                onSelect={handleSelect} 
                isGlobalEditing={isGlobalEditing}
                setMushroomsData={setMushroomsData}
              />
            ) : (
              <div className="no-results-container">
                <h2 className="no-results-title">{t('no_results') || `No results for "${searchQuery}"`}</h2>
                <p className="no-results-subtitle">{t('try_searching') || 'Try searching for other properties.'}</p>
              </div>
            )}
          </>
        ) : (
          <div className="modal-overlay" data-editable="modal-overlay">
            <div className={`modal-content glass-panel animate-in ${selectedMushroom.id}`} data-editable="modal-content">
              <div className="modal-nav-header" data-editable="modal-nav-header">
                <button className="back-home-btn" onClick={() => setSelectedMushroom(null)} data-editable="back-home-btn">
                  <ArrowLeft size={20} />
                  <span>{t('labels.back_to_home') || 'חזרה לעמוד הבית'}</span>
                </button>
                <button className="close-btn-new" onClick={() => setSelectedMushroom(null)}>
                  <XCircle size={24} />
                </button>
              </div>
            
            <div className="modal-header" data-editable="modal-header">
              <div className="modal-header-top" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }} data-editable="modal-header-top">
                <div style={{ width: '330px', height: '330px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} data-editable="modal-image-container">
                  <img src={selectedMushroom.detailed_data?.detail_image || selectedMushroom.image} alt={selectedMushroom.name} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }} data-editable="modal-image" />
                </div>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  {isEditing ? (
                    <>
                      <input 
                        className="admin-edit-input" 
                        style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '0.5rem' }}
                        value={selectedMushroom.name || ''} 
                        onChange={e => setSelectedMushroom({...selectedMushroom, name: e.target.value})} 
                      />
                      <div className="fade-line" style={{ height: '2px', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)', margin: '1rem 0', width: '100%' }}></div>
                      <input 
                        className="admin-edit-input" 
                        style={{ fontSize: '1rem', fontStyle: 'italic', marginTop: '0.5rem' }}
                        value={selectedMushroom.subtitle || ''} 
                        onChange={e => setSelectedMushroom({...selectedMushroom, subtitle: e.target.value})} 
                      />
                    </>
                  ) : (
                    <>
                      <h2 className="title-glow modal-title" data-editable="modal-title" style={{ marginBottom: '0.5rem' }}>{selectedMushroom.name}</h2>
                      <div className="fade-line" style={{ height: '2px', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)', margin: '1rem 0', width: '100%', maxWidth: '100%' }} data-editable="modal-divider"></div>
                      <p className="modal-scientific" data-editable="modal-subtitle" style={{ marginTop: '0.5rem' }}>{selectedMushroom.subtitle}</p>
                    </>
                  )}
                </div>
                {isAdmin && (
                  <div className="admin-edit-badge" onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
                    {isEditing ? <Save size={16} /> : <Edit3 size={16} />}
                    <span>{isEditing ? (currentLang === 'he' ? 'שמור' : 'Save') : (currentLang === 'he' ? 'ערוך' : 'Edit')}</span>
                  </div>
                )}
              </div>
              
              <div className="modal-tabs" data-editable="modal-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}
                  data-editable="tab-btn-info"
                >
                  {t('labels.about')}
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'interactions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('interactions')}
                  data-editable="tab-btn-interactions"
                >
                  {t('labels.interactions')}
                </button>
              </div>
            </div>

            <div className="modal-body" data-editable="modal-body">
              {activeTab === 'info' ? (
                <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  
                  {/* About Section */}
                  <div className="detail-section" data-editable="detail-section-about">
                    <span className="detail-label" data-editable="detail-label-about">{t('labels.about')}</span>
                    {isEditing ? (
                      <RichTextEditor 
                        value={editData?.about || ''} 
                        onChange={val => setEditData({...editData, about: val})}
                      />
                    ) : (
                      <div className="modal-description" data-editable="modal-description-about" dangerouslySetInnerHTML={{ __html: editData?.about || mData.about }}></div>
                    )}
                  </div>

                  {/* Benefits Section */}
                  <div className="detail-section" data-editable="detail-section-benefits">
                    <span className="detail-label" data-editable="detail-label-benefits">{t('labels.benefits')}</span>
                    {isEditing ? (
                      <div style={{ display: 'grid', gap: '0.8rem' }}>
                        {(editData?.benefits || []).map((b, i) => (
                          <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input 
                              className="admin-edit-input" 
                              value={b} 
                              onChange={e => {
                                const newList = [...editData.benefits];
                                newList[i] = e.target.value;
                                setEditData({...editData, benefits: newList});
                              }} 
                            />
                            <button className="admin-list-btn remove" onClick={() => {
                              const newList = editData.benefits.filter((_, idx) => idx !== i);
                              setEditData({...editData, benefits: newList});
                            }}><Trash2 size={16}/></button>
                          </div>
                        ))}
                        <button className="admin-list-btn add" onClick={() => setEditData({...editData, benefits: [...(editData.benefits || []), '']})}>
                          <Plus size={16}/> {currentLang === 'he' ? 'הוסף יתרון' : 'Add Benefit'}
                        </button>
                      </div>
                    ) : (
                      <ul className="benefit-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.8rem' }}>
                        {(editData?.benefits || mData.benefits).map((b, i) => (
                          <li key={i} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                            <CheckCircle size={20} color="#22c55e" style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: '1.1rem', color: 'var(--mush-subtext)' }}>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Conditions Section */}
                  <div className="detail-section">
                    <span className="detail-label">{t('labels.conditions')}</span>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {(editData?.conditions || []).map((c, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.2rem 0.5rem' }}>
                             <input 
                              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '80px' }}
                              value={c} 
                              onChange={e => {
                                const newList = [...editData.conditions];
                                newList[i] = e.target.value;
                                setEditData({...editData, conditions: newList});
                              }} 
                            />
                            <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 0.2rem' }} onClick={() => {
                              const newList = editData.conditions.filter((_, idx) => idx !== i);
                              setEditData({...editData, conditions: newList});
                            }}>×</button>
                          </div>
                        ))}
                        <button className="admin-list-btn add small" onClick={() => setEditData({...editData, conditions: [...(editData.conditions || []), '']})}>
                          <Plus size={14}/>
                        </button>
                      </div>
                    ) : (
                      <div className="tag-container">
                        {(editData?.conditions || mData.conditions).map((c, i) => (
                          <span key={i} className="condition-tag">{c}</span>
                        ))}
                      </div>
                    )}
                  </div>



                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {/* Usage & Dosage */}
                    <div className="detail-section">
                      <span className="detail-label">{t('labels.how_to_use')}</span>
                      {isEditing ? (
                        <RichTextEditor 
                           value={editData?.usage || ''} 
                           onChange={val => setEditData({...editData, usage: val})}
                        />
                      ) : (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: editData?.usage || mData.usage }}></div>
                      )}
                      
                      <span className="detail-label">{t('labels.dosage')}</span>
                      {isEditing ? (
                        <RichTextEditor 
                           value={editData?.dosage || ''} 
                           onChange={val => setEditData({...editData, dosage: val})}
                        />
                      ) : (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: editData?.dosage || mData.dosage }}></div>
                      )}
                    </div>

                    {/* Doctor Consultation */}
                    <div className="detail-section">
                      <span className="detail-label">{t('labels.doctor_consultation')}</span>
                      <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.05rem', display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                        {renderDynamicIcon(theme.doctorIconShape, { size: 20, color: theme.doctorIconColor, style: { flexShrink: 0, marginTop: '4px' } })}
                        <span>{Array.isArray(mData.doctor_consultation) ? mData.doctor_consultation.join(' ') : mData.doctor_consultation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contraindications */}
                  <div className="detail-section">
                    <span className="detail-label">{t('labels.contraindications')}</span>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.8rem' }}>
                      {mData.contraindications.map((ci, i) => (
                        <li key={i} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                          {renderDynamicIcon(theme.contraIconShape, { size: 20, color: theme.contraIconColor, style: { flexShrink: 0, marginTop: '2px' } })}
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
                    const defaultInts = originalInteractions[engName] || { do_not_combine: [], use_caution: [], potential_synergy: [], insufficient: [] };
                    const mushInts = editData && editData.interactions ? editData.interactions : defaultInts;

                    if (isEditing) {
                        return (
                          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.5)', borderRadius: '16px', display: 'flex', flexDirection: 'column' }} dir="ltr">
                            <span style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#16a34a' }}>Edit Interactions JSON Data</span>
                            <textarea
                              style={{ width: '100%', minHeight: '500px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px' }}
                              defaultValue={JSON.stringify(mushInts, null, 2)}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(e.target.value);
                                  setEditData({ ...editData, interactions: parsed });
                                } catch (err) {
                                  // keep editing, allow intermediate invalid states via uncontrolled component
                                }
                              }}
                            />
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '1rem' }}>Enter valid JSON to commit changes locally. Press "Save" at the top to commit to the server.</p>
                          </div>
                        );
                    }

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
                            onClick={() => setExpandedCats(prev => ({ [key]: !prev[key] }))}
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
      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="modal-overlay login-overlay" onClick={() => setIsLoginModalOpen(false)}>
          <div className="modal-content glass-panel login-card" onClick={e => e.stopPropagation()}>
            <h2>{currentLang === 'he' ? 'כניסת אדמין' : 'Admin Login'}</h2>
            <form onSubmit={handleLogin}>
              <input 
                type="password" 
                placeholder={currentLang === 'he' ? 'סיסמת ניהול' : 'Admin Password'} 
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                autoFocus
              />
              <button type="submit" className="login-submit">
                {currentLang === 'he' ? 'התחברות' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      )}
      </main>

      {/* Footer */}
      <footer className="footer shadow-xl">
        <p>&copy; 2026 Wise Fungi. Premium UI for Science-Based Fungi Wisdom.</p>
        <p className="footer-sub">Curated data from the latest mycological research.</p>
      </footer>
    </div>
  );
}

export default App;
