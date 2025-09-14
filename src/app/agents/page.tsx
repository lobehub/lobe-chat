import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const AgentsPage: React.FC = () => {
  const { data: agents, error } = useSWR('/api/agents', fetcher);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1>Agents Overview</h1>
      {error && <div style={{ color: 'red' }}>Failed to load agents</div>}
      {!agents ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {agents.map((agent: any) => (
            <li key={agent.id}>{agent.name} ({agent.status})</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AgentsPage;
