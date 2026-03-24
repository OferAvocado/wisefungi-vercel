import React from 'react';
import { Settings, X, Palette, Type, Layout, Image as ImageIcon } from 'lucide-react';

export default function ThemeEditor({ theme, setTheme, onSave, onClose }) {
  
  const updateTheme = (key, value) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  const IconPicker = ({ label, iconKey, colorKey }) => (
    <div style={{ marginBottom: '1.2rem', padding: '0.8rem', background: '#252526', borderRadius: '4px', border: '1px solid #3e3e42' }}>
      <label style={labelStyle}>{label}</label>
      
      <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '0.7rem', color: '#969696', display: 'block', marginBottom: '0.2rem' }}>Icon Shape</span>
          <select 
            value={theme[iconKey] || 'CheckCircle'} 
            onChange={e => updateTheme(iconKey, e.target.value)}
            style={inputStyle}
          >
            <option value="CheckCircle">Check (V)</option>
            <option value="Star">Star</option>
            <option value="Heart">Heart</option>
            <option value="Zap">Lightning</option>
            <option value="Shield">Shield</option>
            <option value="Droplet">Droplet</option>
            <option value="AlertTriangle">Warning</option>
            <option value="XCircle">X Circle</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: '#969696', display: 'block', marginBottom: '0.2rem' }}>Color</span>
          <input 
            type="color" 
            value={theme[colorKey] || '#22c55e'} 
            onChange={e => updateTheme(colorKey, e.target.value)}
            style={colorPickerStyle}
            title="Pick a color"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', left: '0', top: '0', bottom: '0', width: '320px',
      background: '#1e1e1e', // Photoshop/VSCode dark grey
      borderRight: '1px solid #333',
      padding: '0', zIndex: 999999, overflowY: 'auto', color: '#cccccc',
      boxShadow: '4px 0 20px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }} dir="ltr">
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#252526', borderBottom: '1px solid #333' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '0.9rem', color: '#fff', fontWeight: '600' }}>
          <Palette size={16} color="#007acc" /> Theme Builder Pro
        </h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#969696', cursor: 'pointer', padding: '0.2rem' }}><X size={16}/></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Colors Panel */}
        <div className="ps-panel">
          <div style={panelHeaderStyle}><Palette size={14} /> Global Colors</div>
          
          <div style={rowStyle}>
            <label style={labelStyle}>Global Background</label>
            <div style={flexCenter}>
              <input type="color" value={theme.bgPrimary || '#0a0a0a'} onChange={e => updateTheme('bgPrimary', e.target.value)} style={colorPickerStyle} />
              <input type="text" value={theme.bgPrimary || '#0a0a0a'} onChange={e => updateTheme('bgPrimary', e.target.value)} style={textInputStyle} />
            </div>
          </div>

          <div style={rowStyle}>
            <label style={labelStyle}>Primary Accent (Buttons)</label>
            <div style={flexCenter}>
              <input type="color" value={theme.accentPrimary || '#16a34a'} onChange={e => updateTheme('accentPrimary', e.target.value)} style={colorPickerStyle} />
              <input type="text" value={theme.accentPrimary || '#16a34a'} onChange={e => updateTheme('accentPrimary', e.target.value)} style={textInputStyle} />
            </div>
          </div>
        </div>

        {/* Typography Panel */}
        <div className="ps-panel">
          <div style={panelHeaderStyle}><Type size={14} /> Typography Colors</div>
          
          <div style={rowStyle}>
            <label style={labelStyle}>Titles & Highlights</label>
            <div style={flexCenter}>
              <input type="color" value={theme.textPrimary || '#ffffff'} onChange={e => updateTheme('textPrimary', e.target.value)} style={colorPickerStyle} />
            </div>
          </div>

          <div style={rowStyle}>
            <label style={labelStyle}>Paragraphs & Defaults</label>
            <div style={flexCenter}>
              <input type="color" value={theme.textSecondary || 'rgba(255,255,255,0.7)'} onChange={e => updateTheme('textSecondary', e.target.value)} style={colorPickerStyle} />
              <input type="text" value={theme.textSecondary || 'rgba(255,255,255,0.7)'} onChange={e => updateTheme('textSecondary', e.target.value)} style={{...textInputStyle, width: '90px'}} title="Supports Hex, RGB, RGBA" />
            </div>
          </div>
        </div>

        {/* Bento Cards Panel */}
        <div className="ps-panel">
          <div style={panelHeaderStyle}><Layout size={14} /> Component Cards</div>
          
          <div style={rowStyle}>
            <label style={labelStyle}>Card Background</label>
            <div style={flexCenter}>
               <input type="text" value={theme.bentoBg || 'rgba(255,255,255,0.05)'} onChange={e => updateTheme('bentoBg', e.target.value)} style={{...textInputStyle, width: '120px'}} placeholder="rgba/hex" />
            </div>
          </div>

          <div style={rowStyle}>
            <label style={labelStyle}>Card Border Color</label>
            <div style={flexCenter}>
              <input type="color" value={theme.bentoBorder || '#transparent'} onChange={e => updateTheme('bentoBorder', e.target.value)} style={colorPickerStyle} />
            </div>
          </div>

          <div style={rowStyle}>
            <label style={labelStyle}>Roundness (Radius) px</label>
            <input 
              type="range" min="0" max="40" 
              value={theme.bentoRadius || 24} 
              onChange={e => updateTheme('bentoRadius', parseInt(e.target.value))} 
              style={{ width: '100%' }}
            />
            <span style={{ fontSize: '0.7rem', display: 'block', textAlign: 'right' }}>{theme.bentoRadius || 24}px</span>
          </div>
        </div>

        {/* Dynamic Icons */}
        <div className="ps-panel">
          <div style={panelHeaderStyle}><ImageIcon size={14} /> Modal Vector Icons</div>
          <IconPicker label="Benefits Icon" iconKey="benefitIconShape" colorKey="benefitIconColor" />
          <IconPicker label="Doctor/Caution Icon" iconKey="doctorIconShape" colorKey="doctorIconColor" />
          <IconPicker label="Contraindications Icon" iconKey="contraIconShape" colorKey="contraIconColor" />
        </div>

      </div>

      <div style={{ padding: '1rem', background: '#252526', borderTop: '1px solid #333' }}>
        <button 
          onClick={onSave}
          style={{ 
            width: '100%', padding: '0.8rem', background: '#007acc', 
            color: 'white', border: '1px solid #005f9e', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <Settings size={16} /> Deploy Theme
        </button>
      </div>

    </div>
  );
}

// Photoshop-like styling constants
const panelHeaderStyle = { fontSize: '0.75rem', fontWeight: '600', color: '#cccccc', textTransform: 'uppercase', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' };
const labelStyle = { fontSize: '0.75rem', color: '#cccccc', flex: 1 };
const rowStyle = { display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1rem' };
const flexCenter = { display: 'flex', alignItems: 'center', gap: '0.5rem' };
const colorPickerStyle = { width: '28px', height: '28px', padding: '0', border: '1px solid #3e3e42', borderRadius: '4px', cursor: 'pointer', background: '#2d2d30' };
const inputStyle = { background: '#3c3c3c', color: '#cccccc', border: '1px solid #3e3e42', padding: '0.3rem 0.5rem', borderRadius: '2px', fontSize: '0.75rem', width: '100%' };
const textInputStyle = { ...inputStyle, width: '70px', fontFamily: 'monospace' };
