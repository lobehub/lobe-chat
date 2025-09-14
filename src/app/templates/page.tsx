import React, { useState } from 'react';

const templates = [
  { category: 'Blog', id: 1, name: 'Blog Post', preview: 'How to grow your business with AI...' },
  { category: 'Email', id: 2, name: 'Email Draft', preview: 'Dear [Name], Thank you for...' },
  { category: 'Social', id: 3, name: 'Social Post', preview: 'Excited to announce our new feature...' },
  { category: 'Code', id: 4, name: 'Code Snippet', preview: 'function greet(name) { return ... }' },
  { category: 'Business', id: 5, name: 'Business Plan', preview: 'Executive Summary: Our vision...' },
];

const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

const TemplatesPage: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? templates : templates.filter(t => t.category === filter);

  return (
    <div style={{ margin: '0 auto', maxWidth: 1200, padding: 48 }}>
      <h1 style={{ marginBottom: 32 }}>Template Gallery</h1>
      <div style={{ marginBottom: 24 }}>
        <label htmlFor="category" style={{ marginRight: 16 }}>Category:</label>
        <select id="category" onChange={e => setFilter(e.target.value)} style={{ borderRadius: 4, padding: '4px 12px' }} value={filter}>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'grid', gap: 32, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {filtered.map(t => (
          <div key={t.id} style={{ alignItems: 'flex-start', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', display: 'flex', flexDirection: 'column', padding: 32 }}>
            <h3 style={{ marginBottom: 8 }}>{t.name}</h3>
            <span style={{ color: '#888', fontSize: 14, marginBottom: 16 }}>{t.category}</span>
            <div style={{ color: '#444', fontSize: 13, marginBottom: 16 }}>{t.preview}</div>
            <button style={{ background: 'none', border: '1px solid #0070f3', borderRadius: 4, color: '#0070f3', cursor: 'pointer', fontWeight: 500, padding: '6px 18px' }} type="button">Create from template</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesPage;
