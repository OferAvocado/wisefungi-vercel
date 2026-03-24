import React from 'react';
import { Settings, X } from 'lucide-react';

export default function ThemeEditor({ theme, setTheme, onSave, onClose }) {
  
  const updateTheme = (key, value) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  const IconPicker = ({ label, iconKey, colorKey }) => (
    <div style={{ marginBottom: '1.2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
      <label style={labelStyle}>{label}</label>
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.2rem' }}>Icon Shape</span>
          <select 
            value={theme[iconKey] || 'CheckCircle'} 
            onChange={e => updateTheme(iconKey, e.target.value)}
            style={inputStyle}
          >
            <option value="CheckCircle">Check (V)</option>
            <option value="Star">Star</option>
            <option value="Heart">Heart</option>
            <option value="Zap">Lightning (Zap)</option>
            <option value="Shield">Shield</option>
            <option value="Droplet">Droplet</option>
            <option value="AlertTriangle">Warning Triangle</option>
            <option value="XCircle">X Circle</option>
          </select>
        </div>
        
        <div>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.2rem' }}>Icon Color</span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              type="color" 
              value={theme[colorKey] || '#22c55e'} 
              onChange={e => updateTheme(colorKey, e.target.value)}
              style={colorPickerStyle}
              title="Click to open Color Wheel / Hex Input"
            />
            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace' }}>{theme[colorKey] || '#22c55e'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', right: '2rem', top: '5rem', width: '360px', maxHeight: '80vh',
      background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
      padding: '1.5rem', zIndex: 99999, overflowY: 'auto', color: 'white',
      boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
    }} className="glass-panel" dir="ltr">
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Settings size={20} color="#16a34a" /> Site Theme Colors
        </h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20}/></button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div>
          <label style={labelStyle}>Main Background Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
            <input type="color" value={theme.bgPrimary || '#0a0a0a'} onChange={e => updateTheme('bgPrimary', e.target.value)} style={colorPickerStyle} />
            <input type="text" value={theme.bgPrimary || '#0a0a0a'} onChange={e => updateTheme('bgPrimary', e.target.value)} style={textInputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Primary Accent / Buttons Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
            <input type="color" value={theme.accentPrimary || '#16a34a'} onChange={e => updateTheme('accentPrimary', e.target.value)} style={colorPickerStyle} />
            <input type="text" value={theme.accentPrimary || '#16a34a'} onChange={e => updateTheme('accentPrimary', e.target.value)} style={textInputStyle} />
          </div>
        </div>

        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '1rem 0' }} />

        <h4 style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.8)' }}>Home Screen Cards (Bento)</h4>
        
        <div>
          <label style={labelStyle}>Cards Background Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
            <input type="color" value={theme.bentoBg || '#1a1a1a'} onChange={e => updateTheme('bentoBg', e.target.value)} style={colorPickerStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Cards Border Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
            <input type="color" value={theme.bentoBorder || '#000000'} onChange={e => updateTheme('bentoBorder', e.target.value)} style={colorPickerStyle} />
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>(Set same as bg to hide)</span>
          </div>
        </div>

        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '1rem 0' }} />

        <h4 style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.8)' }}>Modal Icons & Bullet Points</h4>
        
        <IconPicker label="Benefits Icon" iconKey="benefitIconShape" colorKey="benefitIconColor" />
        <IconPicker label="Doctor Consultation Icon" iconKey="doctorIconShape" colorKey="doctorIconColor" />
        <IconPicker label="Contraindications Icon" iconKey="contraIconShape" colorKey="contraIconColor" />

      </div>

      <button 
        onClick={onSave}
        style={{ 
          marginTop: '2rem', width: '100%', padding: '0.8rem', background: '#16a34a', 
          color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' 
        }}
      >
        Save Theme to Server
      </button>

      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '1rem', textAlign: 'center' }}>
        Tip: The color pickers provide full color wheels and hex inputs natively!
      </p>

    </div>
  );
}

const labelStyle = { fontSize: '0.85rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.8)' };
const colorPickerStyle = { width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' };
const inputStyle = { background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.4rem 0.6rem', borderRadius: '6px' };
const textInputStyle = { ...inputStyle, width: '100px', fontSize: '0.9rem', fontFamily: 'monospace' };
