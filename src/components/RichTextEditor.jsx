import React, { useRef, useEffect } from 'react';
import { Bold, Underline, Baseline } from 'lucide-react';

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);

  // Initialize the content only once or if it's strictly modified externally
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (cmd, arg = null) => {
    document.execCommand(cmd, false, arg);
    editorRef.current.focus();
    onChange(editorRef.current.innerHTML);
  };

  const handleChange = () => {
    onChange(editorRef.current.innerHTML);
  };

  return (
    <div className="rich-text-container" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', flexWrap: 'wrap' }}>
        
        <button type="button" onClick={() => exec('bold')} style={toolbarBtn} title="Bold">
          <Bold size={16} />
        </button>
        <button type="button" onClick={() => exec('underline')} style={toolbarBtn} title="Underline">
          <Underline size={16} />
        </button>
        
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }}></div>
        
        <button type="button" onClick={() => exec('fontSize', '4')} style={toolbarBtn} title="Increase Font Size">
          A+
        </button>
        <button type="button" onClick={() => exec('fontSize', '2')} style={toolbarBtn} title="Decrease Font Size">
          A-
        </button>

        <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Baseline size={16} color="rgba(255,255,255,0.7)" />
          <input 
             type="color" 
             title="Text Color (Pick from Wheel)" 
             onChange={e => exec('foreColor', e.target.value)} 
             style={{ width: '28px', height: '28px', cursor: 'pointer', border: 'none', background: 'transparent' }} 
          />
        </div>
      </div>

      {/* Editable Area */}
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleChange}
        onBlur={handleChange}
        style={{ 
          padding: '1rem', 
          minHeight: '120px', 
          outline: 'none', 
          color: 'white', 
          fontSize: '1.1rem',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap' // IMPORTANT: This preserves natural line breaks!
        }}
      />
    </div>
  );
}

const toolbarBtn = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  color: 'white',
  padding: '0.4rem 0.6rem',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.9rem',
  fontWeight: 'bold'
};
