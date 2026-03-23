import { useTranslation } from 'react-i18next';
import { Brain, HeartPulse, Zap, Shield, Sparkles, Droplets } from 'lucide-react';

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

  return (
    <section id="bento-grid" className="bento-container">
      <div className="bento-grid">
        {mushrooms.map((m) => (
          <div 
            key={m.id} 
            className={`bento-card ${m.id}`}
            onClick={(e) => {
              if (isGlobalEditing) return;
              onSelect(m);
            }}
            style={{ cursor: isGlobalEditing ? 'default' : 'pointer' }}
          >
            <div className="card-thumb-wrapper">
              <img src={m.image} alt={m.name} className="card-thumb" />
            </div>
            <div className="card-content">
              {isGlobalEditing ? (
                <>
                  <input 
                    className="admin-edit-input card-title"
                    style={{ background: 'rgba(0,0,0,0.4)', textAlign: 'center', marginBottom: '0.2rem', color: 'white' }}
                    value={m.name || ''}
                    onChange={(e) => handleUpdate(m.id, 'name', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <textarea 
                    className="admin-edit-textarea card-subtitle"
                    style={{ background: 'rgba(0,0,0,0.4)', textAlign: 'center', minHeight: '60px', color: 'white' }}
                    value={m.subtitle || ''}
                    onChange={(e) => handleUpdate(m.id, 'subtitle', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </>
              ) : (
                <>
                  <h3 className="card-title">{m.name}</h3>
                  <p className="card-subtitle">{m.subtitle}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
