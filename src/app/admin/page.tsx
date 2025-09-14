import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';


// Agent creation (top-level scope)
async function handleCreateAgent(newAgent: any, setShowCreate: (v: boolean) => void, setNewAgent: (v: any) => void) {
  await fetch('/api/agents', {
    body: JSON.stringify(newAgent),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
  setShowCreate(false);
  setNewAgent({ config: {}, name: '', status: 'active', type: '' });
  mutate('/api/agents');
}

// Agent editing (top-level scope)
async function handleEditAgent(editAgent: any, setEditAgent: (v: any) => void) {
  await fetch(`/api/agents/${editAgent.id}`, {
    body: JSON.stringify(editAgent),
    headers: { 'Content-Type': 'application/json' },
    method: 'PUT',
  });
  setEditAgent(null);
  mutate('/api/agents');
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Agent deletion (top-level scope)
async function handleDeleteAgent(id: number) {
  await fetch(`/api/agents/${id}`, {
    method: 'DELETE',
  });
  mutate('/api/agents');
}

const AdminPage: React.FC = () => {
  const { data: agents, error: agentError } = useSWR('/api/agents', fetcher);
  const [showCreate, setShowCreate] = useState(false);
  const [newAgent, setNewAgent] = useState({ config: {}, name: '', status: 'active', type: '' });
  const [editAgent, setEditAgent] = useState<any>(null);

  return (
    <div style={{ margin: '0 auto', maxWidth: 1200, padding: 24 }}>
      <h1>Admin Dashboard</h1>
      {/* Agent Management */}
      <section style={{ marginBottom: 32 }}>
        <h2>Agent Management</h2>
        <button onClick={() => setShowCreate(true)} type="button">Create New Agent</button>
        {agentError && <div style={{ color: 'red' }}>Failed to load agents</div>}
        {!agents ? (
          <div>Loading...</div>
        ) : (
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
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
                    <button onClick={() => setEditAgent(agent)} style={{ marginRight: 8 }} type="button">Edit</button>
                    <button onClick={() => handleDeleteAgent(agent.id)} type="button">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      {/* Agent Creation Modal */}
      {showCreate && (
        <div style={{ background: '#fff', border: '1px solid #ccc', left: '50%', padding: 24, position: 'fixed', top: 100, transform: 'translateX(-50%)', zIndex: 1000 }}>
          <h2>Create New Agent</h2>
          <label>Name: <input onChange={e => setNewAgent({ ...newAgent, name: e.target.value })} value={newAgent.name} /></label>
          <br />
          <label>Type: <input onChange={e => setNewAgent({ ...newAgent, type: e.target.value })} value={newAgent.type} /></label>
          <br />
          <label>Status: <input onChange={e => setNewAgent({ ...newAgent, status: e.target.value })} value={newAgent.status} /></label>
          <br />
          <button onClick={() => handleCreateAgent(newAgent, setShowCreate, setNewAgent)} type="button">Create</button>
          <button onClick={() => setShowCreate(false)} style={{ marginLeft: 8 }} type="button">Cancel</button>
        </div>
      )}
      {/* Agent Editing Modal */}
      {editAgent && (
        <div style={{ background: '#fff', border: '1px solid #ccc', left: '50%', padding: 24, position: 'fixed', top: 100, transform: 'translateX(-50%)', zIndex: 1000 }}>
          <h2>Edit Agent</h2>
          <label>Name: <input onChange={e => setEditAgent({ ...editAgent, name: e.target.value })} value={editAgent.name} /></label>
          <br />
          <label>Type: <input onChange={e => setEditAgent({ ...editAgent, type: e.target.value })} value={editAgent.type} /></label>
          <br />
          <label>Status: <input onChange={e => setEditAgent({ ...editAgent, status: e.target.value })} value={editAgent.status} /></label>
          <br />
          <button onClick={() => handleEditAgent(editAgent, setEditAgent)} type="button">Save</button>
          <button onClick={() => setEditAgent(null)} style={{ marginLeft: 8 }} type="button">Cancel</button>
        </div>
      )}
      {/* Tenant/Account Controls */}
      <section>
        <h2>Tenant & Account Controls</h2>
        <button type="button">Create New Tenant</button>
        <button style={{ marginLeft: 8 }} type="button">Manage Tenants</button>
      </section>
    </div>
  );
};

export default AdminPage;
