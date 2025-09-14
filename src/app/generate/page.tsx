import React, { useState } from 'react';

const tabs = [
  { key: 'text', label: 'Text' },
  { key: 'image', label: 'Image' },
  { key: 'code', label: 'Code' },
  { key: 'chat', label: 'Chat' },
  { key: 'voice', label: 'Voice' },
];

const UnifiedGeneratePage: React.FC = () => {
  const [active, setActive] = useState('text');
  const [result, setResult] = useState('');
  const [input, setInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = () => {
    setResult(`Generated ${active}: ${input}`);
    setShowPreview(true);
  };

  return (
    <div style={{ margin: '0 auto', maxWidth: 900, padding: 48 }}>
      <h1 style={{ marginBottom: 32 }}>Unified Generation</h1>
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            style={{ background: active === tab.key ? '#eaf6ff' : '#fff', border: active === tab.key ? '2px solid #0070f3' : '1px solid #ccc', borderRadius: 6, cursor: 'pointer', fontWeight: active === tab.key ? 600 : 400, padding: '8px 24px' }}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ marginBottom: 24 }}>
        <textarea
          onChange={e => setInput(e.target.value)}
          placeholder={`Enter ${active} prompt...`}
          style={{ border: '1px solid #ccc', borderRadius: 6, fontSize: 16, minHeight: 80, padding: 12, width: '100%' }}
          value={input}
        />
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <button onClick={handleGenerate} style={{ background: '#0070f3', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500, padding: '10px 32px' }} type="button">Generate</button>
        <button onClick={() => setInput('')} style={{ background: '#fff', border: '1px solid #0070f3', borderRadius: 6, color: '#0070f3', fontWeight: 500, padding: '10px 32px' }} type="button">Clear</button>
        <button onClick={() => navigator.clipboard.writeText(result)} style={{ background: '#fff', border: '1px solid #0070f3', borderRadius: 6, color: '#0070f3', fontWeight: 500, padding: '10px 32px' }} type="button">Copy</button>
        <button onClick={() => setShowPreview(true)} style={{ background: '#fff', border: '1px solid #0070f3', borderRadius: 6, color: '#0070f3', fontWeight: 500, padding: '10px 32px' }} type="button">Preview</button>
      </div>
      {showPreview && (
        <div style={{ alignItems: 'center', background: '#0008', display: 'flex', height: '100vh', justifyContent: 'center', left: 0, position: 'fixed', top: 0, width: '100vw', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0002', minWidth: 400, padding: 48, position: 'relative' }}>
            <h2 style={{ marginBottom: 24 }}>Preview</h2>
            <div style={{ color: '#222', fontSize: 16, marginBottom: 32 }}>{result}</div>
            <button onClick={() => setShowPreview(false)} style={{ background: '#eee', border: 'none', borderRadius: 6, cursor: 'pointer', padding: '6px 18px', position: 'absolute', right: 16, top: 16 }} type="button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedGeneratePage;
