import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const N8nPage: React.FC = () => {
  const { data: workflows, error } = useSWR('/api/n8n/workflows', fetcher);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({ createdBy: 'User', name: '', steps: '' });

  // Workflow creation handler
  const handleCreateWorkflow = async () => {
    await fetch('/api/n8n/workflows', {
      body: JSON.stringify({
        createdBy: newWorkflow.createdBy,
        name: newWorkflow.name,
        steps: newWorkflow.steps.split(',').map(s => s.trim()),
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    setShowCreate(false);
    setNewWorkflow({ createdBy: 'User', name: '', steps: '' });
    mutate('/api/n8n/workflows');
  };

  // Workflow update handler
  const handleEditWorkflow = async () => {
    await fetch('/api/n8n/workflows', {
      body: JSON.stringify(selectedWorkflow),
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
    });
    setSelectedWorkflow(null);
    mutate('/api/n8n/workflows');
  };

  return (
    <div style={{ margin: '0 auto', maxWidth: 1200, padding: 24 }}>
      <h1>n8n Workflow Automation</h1>
      <button onClick={() => setShowCreate(true)} type="button">Create New Workflow</button>
      {error && <div style={{ color: 'red' }}>Failed to load workflows</div>}
      {!workflows ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {workflows.map((wf: any) => (
            <li key={wf.id} style={{ marginBottom: 16 }}>
              <strong>{wf.name}</strong> <span>({wf.status})</span> <span>by {wf.createdBy}</span>
              <a href={wf.mcpLink} rel="noopener noreferrer" style={{ color: '#0070f3', marginLeft: 8 }} target="_blank">MCP Details</a>
              <button onClick={() => setSelectedWorkflow(wf)} style={{ marginLeft: 8 }} type="button">Edit</button>
              <div style={{ marginTop: 8 }}>
                <span>Steps:</span>
                <ol>
                  {wf.steps.map((step: string, idx: number) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
              {/* Visualization placeholder */}
              <div style={{ background: '#f5f5f5', marginTop: 8, padding: 8 }}>
                <em>Workflow Visualization (to be implemented)</em>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Workflow Creation Modal */}
      {showCreate && (
        <div style={{ background: '#fff', border: '1px solid #ccc', left: '50%', padding: 24, position: 'fixed', top: 100, transform: 'translateX(-50%)', zIndex: 1000 }}>
          <h2>Create New Workflow</h2>
          <label>Name: <input onChange={e => setNewWorkflow({ ...newWorkflow, name: e.target.value })} value={newWorkflow.name} /></label>
          <br />
          <label>Steps (comma separated): <input onChange={e => setNewWorkflow({ ...newWorkflow, steps: e.target.value })} value={newWorkflow.steps} /></label>
          <br />
          <label>Created By: <select onChange={e => setNewWorkflow({ ...newWorkflow, createdBy: e.target.value })} value={newWorkflow.createdBy}><option value="User">User</option><option value="Supervisor">Supervisor</option></select></label>
          <br />
          <button onClick={handleCreateWorkflow} type="button">Create</button>
          <button onClick={() => setShowCreate(false)} style={{ marginLeft: 8 }} type="button">Cancel</button>
        </div>
      )}

      {/* Workflow Editor Modal */}
      {selectedWorkflow && (
        <div style={{ background: '#fff', border: '1px solid #ccc', left: '50%', padding: 24, position: 'fixed', top: 100, transform: 'translateX(-50%)', zIndex: 1000 }}>
          <h2>Edit Workflow: {selectedWorkflow.name}</h2>
          <label>Name: <input onChange={e => setSelectedWorkflow({ ...selectedWorkflow, name: e.target.value })} value={selectedWorkflow.name} /></label>
          <br />
          <label>Status: <input onChange={e => setSelectedWorkflow({ ...selectedWorkflow, status: e.target.value })} value={selectedWorkflow.status} /></label>
          <br />
          <label>Steps (comma separated): <input onChange={e => setSelectedWorkflow({ ...selectedWorkflow, steps: e.target.value.split(',').map((s: string) => s.trim()) })} value={selectedWorkflow.steps.join(', ')} /></label>
          <br />
          <button onClick={handleEditWorkflow} type="button">Save</button>
          <button onClick={() => setSelectedWorkflow(null)} style={{ marginLeft: 8 }} type="button">Cancel</button>
        </div>
      )}
    </div>
  );
};

export default N8nPage;
