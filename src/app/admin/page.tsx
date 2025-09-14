import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());


const AdminPage: React.FC = () => {
  const { data: agents, error: agentError } = useSWR('/api/agents', fetcher);
  const [showCreate, setShowCreate] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', type: '', status: 'active', config: {} });
  const [editAgent, setEditAgent] = useState<any>(null);

  // Agent creation
  const handleCreateAgent = async () => {
    await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAgent),
    });
    setShowCreate(false);
    setNewAgent({ name: '', type: '', status: 'active', config: {} });
    mutate('/api/agents');
  };

  // Agent editing
  const handleEditAgent = async () => {
    await fetch(`/api/agents/${editAgent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editAgent),
    });
    setEditAgent(null);
    mutate('/api/agents');
  };

  // Agent deletion
// Agent deletion
async function handleDeleteAgent(id: number) {
  await fetch(`/api/agents/${id}`, {
    method: 'DELETE',
  });
  mutate('/api/agents');
}

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1>Admin Dashboard</h1>
      {/* Agent Management */}
      <section style={{ marginBottom: 32 }}>
        <h2>Agent Management</h2>
        <button type="button" onClick={() => setShowCreate(true)}>Create New Agent</button>
        {agentError && <div style={{ color: 'red' }}>Failed to load agents</div>}
        {!agents ? (
          <div>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent: any) => (
                <tr key={agent.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td>{agent.name}</td>
                  <td>{agent.type}</td>
                  <td>{agent.status}</td>
                  <td>
                    <button type="button" onClick={() => setEditAgent(agent)} style={{ marginRight: 8 }}>Edit</button>
                    <button type="button" onClick={() => handleDeleteAgent(agent.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      {/* Agent Creation Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', top: 100, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid #ccc', padding: 24, zIndex: 1000 }}>
          <h2>Create New Agent</h2>
          <label>Name: <input value={newAgent.name} onChange={e => setNewAgent({ ...newAgent, name: e.target.value })} /></label>
          <br />
          <label>Type: <input value={newAgent.type} onChange={e => setNewAgent({ ...newAgent, type: e.target.value })} /></label>
          <br />
          <label>Status: <input value={newAgent.status} onChange={e => setNewAgent({ ...newAgent, status: e.target.value })} /></label>
          <br />
          <button type="button" onClick={handleCreateAgent}>Create</button>
          <button type="button" onClick={() => setShowCreate(false)} style={{ marginLeft: 8 }}>Cancel</button>
        </div>
      )}
      {/* Agent Editing Modal */}
      {editAgent && (
        <div style={{ position: 'fixed', top: 100, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid #ccc', padding: 24, zIndex: 1000 }}>
          <h2>Edit Agent</h2>
          <label>Name: <input value={editAgent.name} onChange={e => setEditAgent({ ...editAgent, name: e.target.value })} /></label>
          <br />
          <label>Type: <input value={editAgent.type} onChange={e => setEditAgent({ ...editAgent, type: e.target.value })} /></label>
          <br />
          <label>Status: <input value={editAgent.status} onChange={e => setEditAgent({ ...editAgent, status: e.target.value })} /></label>
          <br />
          <button type="button" onClick={handleEditAgent}>Save</button>
          <button type="button" onClick={() => setEditAgent(null)} style={{ marginLeft: 8 }}>Cancel</button>
        </div>
      )}
      {/* Tenant/Account Controls */}
      <section>
        <h2>Tenant & Account Controls</h2>
        <button type="button">Create New Tenant</button>
        <button type="button" style={{ marginLeft: 8 }}>Manage Tenants</button>
      </section>
    </div>
  );
};

export default AdminPage;
