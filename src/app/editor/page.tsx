import React, { useState } from 'react';

const actions = [
  { key: 'compose', label: 'Smart Compose' },
  { key: 'expand', label: 'Expand' },
  { key: 'tone', label: 'Tone Shift' },
  { key: 'grammar', label: 'Grammar Check' },
  { key: 'tldr', label: 'TL;DR' },
  { key: 'translate', label: 'Translate' },
];

const RichEditorPage: React.FC = () => {
  const [content, setContent] = useState('');
  const [action, setAction] = useState('');
  const [preview, setPreview] = useState('');

  const handleAction = (key: string) => {
    setAction(key);
    setPreview(`AI ${actions.find(a => a.key === key)?.label}: ${content}`);
  };

  return (
    <div style={{ margin: '0 auto', maxWidth: 900, padding: 48 }}>
      <h1 style={{ marginBottom: 32 }}>Rich Editor</h1>
      <div style={{ marginBottom: 24 }}>
        <textarea
          onChange={e => setContent(e.target.value)}
          placeholder="Write or paste your text..."
          style={{ border: '1px solid #ccc', borderRadius: 6, fontSize: 16, minHeight: 120, padding: 12, width: '100%' }}
          value={content}
        />
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {actions.map(a => (
          <button
            key={a.key}
            onClick={() => handleAction(a.key)}
            style={{ background: action === a.key ? '#eaf6ff' : '#fff', border: action === a.key ? '2px solid #0070f3' : '1px solid #ccc', borderRadius: 6, cursor: 'pointer', fontWeight: action === a.key ? 600 : 400, padding: '8px 24px' }}
            type="button"
          >
            {a.label}
          </button>
        ))}
      </div>
      {preview && (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', marginBottom: 32, padding: 32 }}>
          <h3 style={{ marginBottom: 8 }}>Preview</h3>
          <div style={{ color: '#222', fontSize: 15 }}>{preview}</div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 16 }}>
        <button onClick={() => setContent('')} style={{ background: '#0070f3', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500, padding: '10px 32px' }} type="button">Clear</button>
        <button onClick={() => navigator.clipboard.writeText(content)} style={{ background: '#fff', border: '1px solid #0070f3', borderRadius: 6, color: '#0070f3', fontWeight: 500, padding: '10px 32px' }} type="button">Copy</button>
      </div>
    </div>
  );
};

export default RichEditorPage;
