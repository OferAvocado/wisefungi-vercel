import React, { useState, useEffect } from 'react';
import { Type, Image as ImageIcon, Layout, Square, Columns, Move, Copy, Trash2, Undo, Redo, Monitor, Tablet, Smartphone, Save, Eye, EyeOff } from 'lucide-react';

export default function VisualEditor({ 
  uiContent, 
  setUiContent, 
  onSave, 
  onClose,
  selectedId,
  setSelectedId 
}) {
  const [activeTab, setActiveTab] = useState('properties'); // elements, properties, structure
  const [device, setDevice] = useState('desktop');

  const customStyles = uiContent?.customStyles || {};

  const handleStyleChange = (property, value) => {
    if (!selectedId) return;
    const elementStyles = { ...(customStyles[selectedId] || {}) };
    if (!elementStyles[device]) elementStyles[device] = {};
    
    elementStyles[device][property] = value;
    
    setUiContent({
      ...uiContent,
      customStyles: {
        ...customStyles,
        [selectedId]: elementStyles
      }
    });
  };

  const currentStyles = selectedId && customStyles[selectedId] && customStyles[selectedId][device] 
    ? customStyles[selectedId][device] 
    : {};

  return (
    <>
      {/* Top Bar Floating */}
      <div style={topBarStyle} className="ve-panel" dir="ltr">
         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: '#252526', padding: '0.3rem', borderRadius: '4px', display: 'flex', gap: '0.2rem' }}>
               <button style={device === 'desktop' ? activeDeviceBtn : deviceBtn} onClick={() => setDevice('desktop')}><Monitor size={16} /></button>
               <button style={device === 'tablet' ? activeDeviceBtn : deviceBtn} onClick={() => setDevice('tablet')}><Tablet size={16} /></button>
               <button style={device === 'mobile' ? activeDeviceBtn : deviceBtn} onClick={() => setDevice('mobile')}><Smartphone size={16} /></button>
            </div>
            <div style={{ background: '#333', width: '1px', height: '20px' }} />
            <button style={toolbarBtn} title="Undo (Coming Soon)"><Undo size={16} /></button>
            <button style={toolbarBtn} title="Redo (Coming Soon)"><Redo size={16} /></button>
         </div>

         <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#888', marginRight: '1rem' }}>Admin Visual Editor</span>
            <button style={{ ...actionBtn, background: 'transparent', border: '1px solid #555' }} onClick={onClose}>Exit Editor</button>
            <button style={actionBtn} onClick={onSave}><Save size={16} /> Publish Changes</button>
         </div>
      </div>

      {/* Left Toolbar (Photoshop Tools style) */}
      <div style={leftToolbarStyle} className="ve-panel" dir="ltr">
        <button style={toolBtn} className={activeTab === 'elements' ? 'active' : ''} onClick={() => setActiveTab('elements')} title="Add Elements">
          <PlusCircle size={20} />
          <span style={{fontSize: '0.6rem', marginTop: '4px'}}>ADD</span>
        </button>
        <button style={toolBtn} className={activeTab === 'structure' ? 'active' : ''} onClick={() => setActiveTab('structure')} title="Layers/Structure">
          <Layers size={20} />
          <span style={{fontSize: '0.6rem', marginTop: '4px'}}>LAYERS</span>
        </button>
        <div style={{ height: '1px', background: '#333', margin: '0.5rem 0' }} />
        <button style={toolBtn} title="Move Mode"><Move size={20} /></button>
        {selectedId && (
          <>
            <button style={toolBtn} title="Duplicate Selected"><Copy size={20} /></button>
            <button style={{...toolBtn, color: '#ff4444'}} title="Delete Selected"><Trash2 size={20} /></button>
          </>
        )}
      </div>

      {/* Right Properties Panel */}
      <div style={rightPanelStyle} className="ve-panel" dir="ltr">
        {activeTab === 'properties' && (
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
              {selectedId ? `Editing: ${selectedId}` : '(No Element Selected)'}
            </h3>

            {!selectedId && (
              <p style={{ color: '#888', fontSize: '0.8rem', textAlign: 'center', marginTop: '2rem' }}>
                Hover and click any element on the page to edit its styles directly.
              </p>
            )}

            {selectedId && (
              <>
                <InspectorGroup title="Typography">
                  <InspectorRow label="Font Size">
                    <input type="text" value={currentStyles.fontSize || ''} onChange={e => handleStyleChange('fontSize', e.target.value)} placeholder="e.g. 24px" style={inputStyle} />
                  </InspectorRow>
                  <InspectorRow label="Color">
                    <input type="color" value={currentStyles.color || '#ffffff'} onChange={e => handleStyleChange('color', e.target.value)} style={colorInputStyle} />
                  </InspectorRow>
                  <InspectorRow label="Font Weight">
                    <select value={currentStyles.fontWeight || ''} onChange={e => handleStyleChange('fontWeight', e.target.value)} style={selectStyle}>
                      <option value="">Default</option>
                      <option value="400">Regular (400)</option>
                      <option value="600">Semi Bold (600)</option>
                      <option value="800">Extra Bold (800)</option>
                    </select>
                  </InspectorRow>
                  <InspectorRow label="Text Align">
                    <select value={currentStyles.textAlign || ''} onChange={e => handleStyleChange('textAlign', e.target.value)} style={selectStyle}>
                      <option value="">Default</option>
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </InspectorRow>
                </InspectorGroup>

                <InspectorGroup title="Spacing (Padding / Margin)">
                   <InspectorRow label="Padding">
                     <input type="text" value={currentStyles.padding || ''} onChange={e => handleStyleChange('padding', e.target.value)} placeholder="10px 20px" style={inputStyle} />
                   </InspectorRow>
                   <InspectorRow label="Margin">
                     <input type="text" value={currentStyles.margin || ''} onChange={e => handleStyleChange('margin', e.target.value)} placeholder="0 auto" style={inputStyle} />
                   </InspectorRow>
                </InspectorGroup>

                <InspectorGroup title="Layout & Size">
                  <InspectorRow label="Width">
                     <input type="text" value={currentStyles.width || ''} onChange={e => handleStyleChange('width', e.target.value)} placeholder="100%" style={inputStyle} />
                   </InspectorRow>
                   <InspectorRow label="Max Width">
                     <input type="text" value={currentStyles.maxWidth || ''} onChange={e => handleStyleChange('maxWidth', e.target.value)} placeholder="1200px" style={inputStyle} />
                   </InspectorRow>
                   <InspectorRow label="Height">
                     <input type="text" value={currentStyles.height || ''} onChange={e => handleStyleChange('height', e.target.value)} placeholder="auto" style={inputStyle} />
                   </InspectorRow>
                   <InspectorRow label="Display">
                    <select value={currentStyles.display || ''} onChange={e => handleStyleChange('display', e.target.value)} style={selectStyle}>
                      <option value="">Default</option>
                      <option value="block">Block</option>
                      <option value="flex">Flexbox</option>
                      <option value="grid">Grid</option>
                      <option value="none">Hidden</option>
                    </select>
                  </InspectorRow>
                </InspectorGroup>

                <InspectorGroup title="Background & Border">
                  <InspectorRow label="Background">
                    <input type="text" value={currentStyles.backgroundColor || ''} onChange={e => handleStyleChange('backgroundColor', e.target.value)} placeholder="rgba, hex..." style={inputStyle} />
                  </InspectorRow>
                  <InspectorRow label="Border Radius">
                    <input type="text" value={currentStyles.borderRadius || ''} onChange={e => handleStyleChange('borderRadius', e.target.value)} placeholder="16px" style={inputStyle} />
                  </InspectorRow>
                  <InspectorRow label="Border">
                    <input type="text" value={currentStyles.border || ''} onChange={e => handleStyleChange('border', e.target.value)} placeholder="1px solid red" style={inputStyle} />
                  </InspectorRow>
                  <InspectorRow label="Opacity">
                    <input type="range" min="0" max="1" step="0.05" value={currentStyles.opacity || 1} onChange={e => handleStyleChange('opacity', e.target.value)} style={{width: '100%'}} />
                  </InspectorRow>
                </InspectorGroup>
              </>
            )}
          </div>
        )}

        {/* Other Tabs (Add Elements, Structure) */}
        {activeTab === 'elements' && (
           <div style={{ padding: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#fff' }}>Add New Element</h3>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>Drag and drop coming soon. (Select a container and click to insert).</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
                 <button style={addElementBtn}><Type size={16}/> Text Block</button>
                 <button style={addElementBtn}><ImageIcon size={16}/> Image</button>
                 <button style={addElementBtn}><Square size={16}/> Button</button>
                 <button style={addElementBtn}><Layout size={16}/> Section</button>
                 <button style={addElementBtn}><Columns size={16}/> Columns</button>
              </div>
           </div>
        )}
      </div>
    </>
  );
}

// Helpers
import { PlusCircle, Layers } from 'lucide-react';

const InspectorGroup = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ background: '#252526', borderRadius: '4px', overflow: 'hidden' }}>
      <button 
        style={{ width: '100%', padding: '0.6rem 0.8rem', background: '#2d2d2d', border: 'none', color: '#ccc', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', textTransform: 'uppercase' }}
        onClick={() => setOpen(!open)}
      >
        {title} <span>{open ? '▼' : '▶'}</span>
      </button>
      {open && <div style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>{children}</div>}
    </div>
  );
}

const InspectorRow = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: '0.75rem', color: '#999', width: '35%' }}>{label}</span>
    <div style={{ width: '65%' }}>{children}</div>
  </div>
);

// Styles
const topBarStyle = { position: 'fixed', top: 0, left: 0, right: 0, height: '48px', background: '#1e1e1e', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem', zIndex: 999999 };
const leftToolbarStyle = { position: 'fixed', top: '48px', left: 0, bottom: 0, width: '56px', background: '#1e1e1e', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem 0', zIndex: 999999, gap: '0.2rem' };
const rightPanelStyle = { position: 'fixed', top: '48px', right: 0, bottom: 0, width: '280px', background: '#1e1e1e', borderLeft: '1px solid #333', zIndex: 999999, overflowY: 'auto' };

const toolBtn = { width: '44px', height: '44px', background: 'transparent', border: 'none', color: '#ccc', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
const actionBtn = { background: '#007acc', color: '#white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'white', fontWeight: 'bold' };
const deviceBtn = { background: 'transparent', border: 'none', color: '#888', padding: '0.2rem', cursor: 'pointer', borderRadius: '2px' };
const activeDeviceBtn = { ...deviceBtn, color: '#fff', background: '#444' };
const toolbarBtn = { background: 'transparent', border: 'none', color: '#ccc', padding: '0.3rem', cursor: 'pointer', borderRadius: '4px' };

const inputStyle = { width: '100%', background: '#3c3c3c', color: '#ccc', border: '1px solid #444', padding: '4px 6px', borderRadius: '3px', fontSize: '0.75rem', outline: 'none' };
const selectStyle = { ...inputStyle, appearance: 'menulist' };
const colorInputStyle = { width: '100%', height: '24px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' };
const addElementBtn = { background: '#2d2d2d', border: '1px solid #444', color: '#ccc', padding: '0.8rem 0.4rem', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', cursor: 'pointer' };
