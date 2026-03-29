import { useTranslation } from 'react-i18next';
import { Brain, HeartPulse, Zap, Shield, Sparkles, Droplets, Trash2, Plus, Image as ImageIcon, Bold, Underline } from 'lucide-react';

export default function BentoGrid({ mushrooms, onSelect, isGlobalEditing, setMushroomsData }) {
  const handleUpdate = (id, field, value) => {
    setMushroomsData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this mushroom card permanently from the site?')) return;
    
    try {
      const response = await fetch('/api/admin/delete_fungi', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('adminToken')
        },
        body: JSON.stringify({ slug: id })
      });
      
      const res = await response.json();
      if (!response.ok) throw new Error(res.error || 'Delete failed');
      
      setMushroomsData(prev => {
        const { [id]: removed, ...rest } = prev;
        return rest;
      });
      alert('Mushroom deleted successfully.');
    } catch (err) {
      console.error(err);
      alert('Error deleting: ' + err.message);
    }
  };

  const handleRichUpdate = (id, field, value) => {
    handleUpdate(id, field, value);
  };

  const handleAddMushroom = () => {
    const id = `mushroom_${Date.now()}`;
    const newMushroom = {
      name: 'New Mushroom',
      subtitle: 'Scientific name here',
      image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&q=80',
      detailed_data: { 
        about: 'Tell something about this mushroom...', 
        benefits: ['Benefit 1'], 
        conditions: ['Condition 1'], 
        usage: '1-2 times daily', 
        dosage: '500mg', 
        contraindications: [], 
        doctor_consultation: '' 
      },
      keywords: []
    };
    
    setMushroomsData(prev => ({
      ...prev,
      [id]: newMushroom
    }));
  };

  const exec = (cmd) => {
    document.execCommand(cmd, false, null);
  };

  return (
    <section id="bento-grid" className="bento-container" data-editable="bento-grid-section">
      <div className="bento-grid" data-editable="bento-grid-wrapper">
        {mushrooms.map((m) => (
          <div 
            key={m.id} 
            className={`bento-card ${m.id}`}
            data-editable={`card-${m.id}`}
            onClick={(e) => {
              if (isGlobalEditing) return;
              onSelect(m);
            }}
            style={{ 
              cursor: isGlobalEditing ? 'default' : 'pointer',
              position: 'relative',
              overflow: 'visible'
            }}
          >
            {isGlobalEditing && (
              <button 
                onClick={(e) => handleDelete(e, m.id)}
                style={{ position: 'absolute', top: '-10px', left: '-10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                title="Delete Mushroom Permanently"
              >
                <Trash2 size={16} />
              </button>
            )}

            <div className="card-thumb-wrapper" data-editable={`card-img-${m.id}`}>
              <img src={m.image} alt={m.name} className="card-thumb" />
              {isGlobalEditing && (
                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'rgba(0,0,0,0.85)', padding: '6px', backdropFilter: 'blur(4px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <ImageIcon size={14} color="#16a34a" />
                    <input 
                       className="admin-edit-input"
                       style={{ fontSize: '0.7rem', padding: '2px 4px', background: 'transparent', border: 'none', color: '#eee', width: '100%' }}
                       value={m.image || ''}
                       onChange={(e) => handleUpdate(m.id, 'image', e.target.value)}
                       placeholder="Paste Image URL here..."
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="card-content" data-editable={`card-content-${m.id}`}>
              {isGlobalEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div 
                    contentEditable
                    className="admin-rich-editor card-title"
                    onBlur={(e) => handleRichUpdate(m.id, 'name', e.target.innerHTML)}
                    dangerouslySetInnerHTML={{ __html: m.name || '' }}
                    style={{ background: 'rgba(0,0,0,0.3)', minHeight: '1.5rem', outline: '1px solid #16a34a', borderRadius: '4px', padding: '4px' }}
                  />
                  <div 
                    contentEditable
                    className="admin-rich-editor card-subtitle"
                    onBlur={(e) => handleRichUpdate(m.id, 'subtitle', e.target.innerHTML)}
                    dangerouslySetInnerHTML={{ __html: m.subtitle || '' }}
                    style={{ background: 'rgba(0,0,0,0.3)', minHeight: '2rem', fontSize: '0.85rem', outline: '1px solid #16a34a', borderRadius: '4px', padding: '4px' }}
                  />
                  <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                    <button 
                      type="button" 
                      onMouseDown={(e) => { e.preventDefault(); exec('bold'); }} 
                      className="mini-edit-btn"
                      style={miniEditBtn}
                    >
                      <Bold size={12}/>
                    </button>
                    <button 
                      type="button" 
                      onMouseDown={(e) => { e.preventDefault(); exec('underline'); }} 
                      className="mini-edit-btn"
                      style={miniEditBtn}
                    >
                      <Underline size={12}/>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="card-title" dangerouslySetInnerHTML={{ __html: m.name || '' }} />
                  <p className="card-subtitle" dangerouslySetInnerHTML={{ __html: m.subtitle || '' }} />
                </>
              )}
            </div>
          </div>
        ))}

        {isGlobalEditing && (
          <div 
            className="bento-card add-new-card"
            onClick={handleAddMushroom}
            style={{ 
              border: '2px dashed rgba(22, 163, 74, 0.4)', 
              background: 'rgba(22, 163, 74, 0.05)',
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '1rem',
              cursor: 'pointer',
              minHeight: '250px',
              borderRadius: '24px'
            }}
          >
            <div style={{ background: 'rgba(22, 163, 74, 0.2)', borderRadius: '50%', padding: '1rem' }}>
              <Plus size={32} color="#16a34a" />
            </div>
            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Add New Mushroom</span>
          </div>
        )}
      </div>
    </section>
  );
}

const miniEditBtn = {
  background: 'rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.2)',
  color: 'white',
  padding: '6px',
  borderRadius: '4px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};
