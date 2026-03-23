import { useTranslation } from 'react-i18next';
import { Brain, HeartPulse, Zap, Shield, Sparkles, Droplets } from 'lucide-react';

export default function BentoGrid({ mushrooms, onSelect }) {
  return (
    <section id="bento-grid" className="bento-container">
      <div className="bento-grid">
        {mushrooms.map((m) => (
          <div 
            key={m.id} 
            className={`bento-card ${m.id}`}
            onClick={() => onSelect(m)}
          >
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
  );
}
