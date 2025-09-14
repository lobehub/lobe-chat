import React, { useEffect, useState } from 'react';
import { Button } from 'antd';

export default function RAGConfigPanel() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetch('/api/rag/retrieve/config')
      .then((res) => res.json())
      .then(setConfig);
  }, []);

  return (
    <div>
      <h3>RAG Pipeline Configuration</h3>
      {config ? (
        <ul>
          <li>Embedding Model: {config.embeddingModel}</li>
          <li>Vector DB: {config.vectorDb}</li>
          <li>System Prompt: {config.systemPrompt}</li>
        </ul>
      ) : (
        <div>Loading...</div>
      )}
      <Button type="primary" style={{ marginTop: 16 }}>
        Edit Config (coming soon)
      </Button>
    </div>
  );
}
