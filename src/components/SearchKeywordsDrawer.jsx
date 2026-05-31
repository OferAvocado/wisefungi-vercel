import React, { useState, useEffect } from 'react';
import { X, Plus, Search, Key, Save, Trash2, ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react';

export default function SearchKeywordsDrawer({
  isOpen,
  onClose,
  mushrooms,
  selectedMushroom,
  mushroomsData,
  setMushroomsData,
  currentLang,
  isAdmin,
  editData,
  setEditData
}) {
  const [localKeywords, setLocalKeywords] = useState({}); // Stores local edits for each mushroom slug
  const [newInputs, setNewInputs] = useState({}); // Stores the "add keyword" input value for each slug
  const [expandedSlug, setExpandedSlug] = useState(null); // Accordion control when no mushroom is selected
  const [saveStatus, setSaveStatus] = useState({}); // slug -> 'idle' | 'saving' | 'saved' | 'error'

  // Initialize keywords from state when drawer opens or updates
  useEffect(() => {
    if (!isOpen) return;

    const initialKeywords = {};
    if (selectedMushroom) {
      // In modal edit mode, use editData.keywords (which are local changes in the modal)
      initialKeywords[selectedMushroom.id] = [...(editData?.keywords || [])];
    } else {
      // On homepage, read keywords of all mushrooms from mushroomsData
      Object.entries(mushroomsData || {}).forEach(([slug, data]) => {
        initialKeywords[slug] = [...(data.keywords || data.search_keywords || [])];
      });
    }
    setLocalKeywords(initialKeywords);
  }, [isOpen, selectedMushroom, mushroomsData, editData]);

  if (!isOpen) return null;

  const handleAddKeyword = (slug) => {
    const val = (newInputs[slug] || '').trim();
    if (!val) return;

    const currentList = localKeywords[slug] || [];
    if (currentList.includes(val)) {
      setNewInputs({ ...newInputs, [slug]: '' });
      return; // Avoid duplicates
    }

    const updatedList = [...currentList, val];
    setLocalKeywords({
      ...localKeywords,
      [slug]: updatedList
    });

    // Update parent state in real time for immediate filtering feedback
    if (selectedMushroom && selectedMushroom.id === slug) {
      if (editData && setEditData) {
        setEditData({ ...editData, keywords: updatedList });
      }
    } else {
      if (setMushroomsData) {
        setMushroomsData(prev => ({
          ...prev,
          [slug]: {
            ...prev[slug],
            keywords: updatedList
          }
        }));
      }
    }

    setNewInputs({ ...newInputs, [slug]: '' });
  };

  const handleRemoveKeyword = (slug, index) => {
    const currentList = localKeywords[slug] || [];
    const updatedList = currentList.filter((_, idx) => idx !== index);

    setLocalKeywords({
      ...localKeywords,
      [slug]: updatedList
    });

    // Update parent state in real time for immediate filtering feedback
    if (selectedMushroom && selectedMushroom.id === slug) {
      if (editData && setEditData) {
        setEditData({ ...editData, keywords: updatedList });
      }
    } else {
      if (setMushroomsData) {
        setMushroomsData(prev => ({
          ...prev,
          [slug]: {
            ...prev[slug],
            keywords: updatedList
          }
        }));
      }
    }
  };

  const handleSave = async (slug) => {
    setSaveStatus({ ...saveStatus, [slug]: 'saving' });
    try {
      const updatedKeywords = localKeywords[slug] || [];
      const adminToken = localStorage.getItem('adminToken');

      // If we are editing the selected mushroom modal, we need its name, subtitle, etc.
      // Otherwise we fetch it from mushroomsData
      let m = null;
      if (selectedMushroom && selectedMushroom.id === slug) {
        m = {
          name: selectedMushroom.name,
          subtitle: selectedMushroom.subtitle,
          image: selectedMushroom.image,
          detailed_data: editData // Contains current edited values
        };
      } else {
        const rawM = mushroomsData[slug];
        m = {
          name: rawM.name,
          subtitle: rawM.subtitle || rawM.scientific_name,
          image: rawM.image,
          detailed_data: rawM.detailed_data || {}
        };
      }

      const bodyData = {
        action: 'update',
        slug: slug,
        lang: currentLang,
        data: {
          name: m.name,
          subtitle: m.subtitle,
          image: m.image,
          keywords: updatedKeywords,
          about: m.detailed_data?.about || '',
          usage: m.detailed_data?.usage || '',
          dosage: m.detailed_data?.dosage || '',
          benefits: m.detailed_data?.benefits || [],
          conditions: m.detailed_data?.conditions || [],
          contraindications: m.detailed_data?.contraindications || [],
          doctor_consultation: m.detailed_data?.doctor_consultation || []
        }
      };

      const response = await fetch('/api/fungi', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': adminToken || '' 
        },
        body: JSON.stringify(bodyData)
      });

      if (!response.ok) {
        throw new Error('Failed to update keywords on database');
      }

      // Also trigger auto_translate if language is Hebrew to populate other languages
      if (currentLang === 'he') {
        try {
          await fetch('/api/auto_translate', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json', 
              'Authorization': adminToken || '' 
            },
            body: JSON.stringify({ type: 'fungi', slug: slug })
          });
        } catch(e) {
          console.error("Auto translation error for keywords:", e);
        }
      }

      setSaveStatus({ ...saveStatus, [slug]: 'saved' });
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [slug]: 'idle' }));
      }, 3000);

    } catch (err) {
      console.error(err);
      setSaveStatus({ ...saveStatus, [slug]: 'error' });
    }
  };

  const isRtl = currentLang === 'he';

  const renderKeywordsList = (slug) => {
    const keywords = localKeywords[slug] || [];
    const status = saveStatus[slug] || 'idle';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.8rem' }}>
        {/* Keywords Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '12px', minHeight: '50px' }}>
          {keywords.length === 0 ? (
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', margin: 'auto 0' }}>
              {isRtl ? 'אין מילות מפתח כרגע...' : 'No keywords set...'}
            </span>
          ) : (
            keywords.map((kw, idx) => (
              <span 
                key={idx} 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.35rem', 
                  background: 'rgba(0, 242, 254, 0.1)', 
                  border: '1px solid rgba(0, 242, 254, 0.25)', 
                  borderRadius: '8px', 
                  padding: '0.3rem 0.6rem', 
                  color: '#00f2fe', 
                  fontSize: '0.85rem', 
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  direction: 'ltr'
                }}
              >
                {kw}
                <button 
                  onClick={() => handleRemoveKeyword(slug, idx)}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'rgba(0, 242, 254, 0.6)', 
                    cursor: 'pointer', 
                    padding: 0, 
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: '0.9rem',
                    lineHeight: '1'
                  }}
                  title={isRtl ? 'מחק מילת מפתח' : 'Remove keyword'}
                >
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Add Input */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text"
            className="admin-edit-input"
            value={newInputs[slug] || ''}
            onChange={e => setNewInputs({ ...newInputs, [slug]: e.target.value })}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddKeyword(slug);
              }
            }}
            placeholder={isRtl ? 'הוסף מילה (ולחץ אנטר)...' : 'Add term and hit Enter...'}
            style={{ 
              flex: 1, 
              padding: '0.6rem 0.8rem', 
              fontSize: '0.9rem', 
              background: 'rgba(255,255,255,0.04)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '8px', 
              color: 'white',
              outline: 'none'
            }}
          />
          <button 
            onClick={() => handleAddKeyword(slug)}
            style={{ 
              background: 'rgba(0, 242, 254, 0.2)', 
              border: '1px solid rgba(0, 242, 254, 0.3)', 
              color: '#00f2fe', 
              borderRadius: '8px', 
              padding: '0.6rem 0.8rem', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Save button and status feedback */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <button
            onClick={() => handleSave(slug)}
            disabled={status === 'saving'}
            style={{
              background: status === 'saved' ? '#16a34a' : 'var(--accent-primary, #16a34a)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.55rem 1.2rem',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              cursor: status === 'saving' ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <Save size={14} />
            {status === 'saving' ? (isRtl ? 'שומר...' : 'Saving...') : status === 'saved' ? (isRtl ? 'נשמר!' : 'Saved!') : (isRtl ? 'שמור מילות מפתח' : 'Save Keywords')}
          </button>

          {/* Status Text Indicator */}
          {status === 'saved' && (
            <span style={{ fontSize: '0.8rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Check size={14} /> {isRtl ? 'עודכן במסד הנתונים!' : 'Updated database!'}
            </span>
          )}
          {status === 'error' && (
            <span style={{ fontSize: '0.8rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <AlertCircle size={14} /> {isRtl ? 'שגיאה בשמירה!' : 'Save failed!'}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop overlay if the drawer is open to dim the homepage */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 999998,
          transition: 'opacity 0.3s'
        }}
      />
      
      {/* Sidebar Drawer Panel */}
      <div 
        className="ve-panel glass-panel"
        style={{
          position: 'fixed',
          top: 0,
          [isRtl ? 'left' : 'right']: 0,
          bottom: 0,
          width: '390px',
          maxWidth: '90vw',
          background: 'rgba(10, 10, 10, 0.85)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderLeft: isRtl ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
          borderRight: isRtl ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
          padding: '2rem 1.5rem',
          boxShadow: isRtl ? '5px 0 25px rgba(0,0,0,0.5)' : '-5px 0 25px rgba(0,0,0,0.5)',
          zIndex: 999999,
          overflowY: 'auto',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          direction: isRtl ? 'rtl' : 'ltr',
          textAlign: isRtl ? 'right' : 'left'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={20} color="#00f2fe" />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
              {isRtl ? 'מילות מפתח לחיפוש' : 'Search Keywords'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Info label */}
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '1.5rem' }}>
          {isRtl 
            ? 'מילים אלו משמשות את מנוע החיפוש בדף הבית למציאת הפטריות המתאימות, אך נשארות נסתרות מהמשתמשים באתר.' 
            : 'These keywords power the homepage search bar to match this mushroom, but remain hidden from regular users.'}
        </p>

        {/* Content Body */}
        {selectedMushroom ? (
          /* SINGLE FOCUSED MODE (Mushroom details modal edit mode) */
          <div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <img 
                src={selectedMushroom.image} 
                alt={selectedMushroom.name} 
                style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} 
              />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold' }}>{selectedMushroom.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                  {selectedMushroom.scientific_name}
                </span>
              </div>
            </div>

            {renderKeywordsList(selectedMushroom.id)}
          </div>
        ) : (
          /* HOMEPAGE LIST ACCORDION MODE */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {mushrooms.map(m => {
              const isOpen = expandedSlug === m.id;
              const count = (localKeywords[m.id] || []).length;
              return (
                <div 
                  key={m.id} 
                  style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.06)', 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    transition: 'all 0.2s'
                  }}
                >
                  <button
                    onClick={() => setExpandedSlug(isOpen ? null : m.id)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      color: 'white',
                      textAlign: isRtl ? 'right' : 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <img src={m.image} alt={m.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{m.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(0, 242, 254, 0.7)' }}>{count} {isRtl ? 'מילים' : 'keywords'}</div>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp size={16} color="rgba(255,255,255,0.5)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.5)" />}
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 1rem 1rem 1rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      {renderKeywordsList(m.id)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
