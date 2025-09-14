import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const N8nPage: React.FC = () => {
  const { data: workflows, error } = useSWR('/api/n8n/workflows', fetcher);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({ name: '', steps: '', createdBy: 'User' });

  // Workflow creation handler
  const handleCreateWorkflow = async () => {
    await fetch('/api/n8n/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newWorkflow.name,
        steps: newWorkflow.steps.split(',').map(s => s.trim()),
        createdBy: newWorkflow.createdBy,
      }),
    });
    setShowCreate(false);
    setNewWorkflow({ name: '', steps: '', createdBy: 'User' });
    mutate('/api/n8n/workflows');
  };

  // Workflow update handler
  const handleEditWorkflow = async () => {
    await fetch('/api/n8n/workflows', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedWorkflow),
    });
    setSelectedWorkflow(null);
    mutate('/api/n8n/workflows');
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1>n8n Workflow Automation</h1>
      <button type="button" onClick={() => setShowCreate(true)}>Create New Workflow</button>
      {error && <div style={{ color: 'red' }}>Failed to load workflows</div>}
      {!workflows ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {workflows.map((wf: any) => (
            <li key={wf.id} style={{ marginBottom: 16 }}>
              <strong>{wf.name}</strong> <span>({wf.status})</span> <span>by {wf.createdBy}</span>
              <a href={wf.mcpLink} style={{ marginLeft: 8, color: '#0070f3' }} target="_blank" rel="noopener noreferrer">MCP Details</a>
              <button type="button" style={{ marginLeft: 8 }} onClick={() => setSelectedWorkflow(wf)}>Edit</button>
              <div style={{ marginTop: 8 }}>
                <span>Steps:</span>
                <ol>
                  {wf.steps.map((step: string, idx: number) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
              {/* Visualization placeholder */}
              <div style={{ marginTop: 8, background: '#f5f5f5', padding: 8 }}>
                <em>Workflow Visualization (to be implemented)</em>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Workflow Creation Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', top: 100, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid #ccc', padding: 24, zIndex: 1000 }}>
          <h2>Create New Workflow</h2>
          <label>Name: <input value={newWorkflow.name} onChange={e => setNewWorkflow({ ...newWorkflow, name: e.target.value })} /></label>
          <br />
          <label>Steps (comma separated): <input value={newWorkflow.steps} onChange={e => setNewWorkflow({ ...newWorkflow, steps: e.target.value })} /></label>
          <br />
          <label>Created By: <select value={newWorkflow.createdBy} onChange={e => setNewWorkflow({ ...newWorkflow, createdBy: e.target.value })}><option value="User">User</option><option value="Supervisor">Supervisor</option></select></label>
          <br />
          <button type="button" onClick={handleCreateWorkflow}>Create</button>
          <button type="button" onClick={() => setShowCreate(false)} style={{ marginLeft: 8 }}>Cancel</button>
        </div>
      )}

      {/* Workflow Editor Modal */}
      {selectedWorkflow && (
        <div style={{ position: 'fixed', top: 100, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid #ccc', padding: 24, zIndex: 1000 }}>
          <h2>Edit Workflow: {selectedWorkflow.name}</h2>
          <label>Name: <input value={selectedWorkflow.name} onChange={e => setSelectedWorkflow({ ...selectedWorkflow, name: e.target.value })} /></label>
          <br />
          <label>Status: <input value={selectedWorkflow.status} onChange={e => setSelectedWorkflow({ ...selectedWorkflow, status: e.target.value })} /></label>
          <br />
          <label>Steps (comma separated): <input value={selectedWorkflow.steps.join(', ')} onChange={e => setSelectedWorkflow({ ...selectedWorkflow, steps: e.target.value.split(',').map((s: string) => s.trim()) })} /></label>
          <br />
          <button type="button" onClick={handleEditWorkflow}>Save</button>
          <button type="button" onClick={() => setSelectedWorkflow(null)} style={{ marginLeft: 8 }}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default N8nPage;
