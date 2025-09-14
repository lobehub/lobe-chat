import React, { useState } from 'react';

const SupervisorResearchPanel: React.FC = () => {
  const [concept, setConcept] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const handleResearch = async () => {
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const res = await fetch('/api/perplexity/search', {
        body: JSON.stringify({ query: concept }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const data = await res.json();
      setResults(data);
    } catch {
      setError('Failed to fetch research results.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '0 auto', maxWidth: 700, padding: 32 }}>
      <h2>Supervisor Agent: Business Research</h2>
      <div style={{ marginBottom: 24 }}>
        <textarea
          onChange={e => setConcept(e.target.value)}
          placeholder="Describe your business concept..."
          style={{ border: '1px solid #ccc', borderRadius: 6, fontSize: 16, minHeight: 80, padding: 12, width: '100%' }}
          value={concept}
        />
      </div>
      <button disabled={loading || !concept} onClick={handleResearch} style={{ background: '#0070f3', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500, padding: '10px 32px' }} type="button">
        {loading ? 'Researching...' : 'Research & Summarize'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      {results && (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', marginTop: 32, padding: 32 }}>
          <h3>Research Results</h3>
          <pre style={{ fontSize: 15, whiteSpace: 'pre-wrap' }}>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SupervisorResearchPanel;
