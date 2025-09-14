import React, { useEffect, useState } from 'react';
import { Button } from 'antd';

async function triggerWorkflow(id: number) {
  await fetch('/api/dograh/workflows', {
    body: JSON.stringify({ id }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
  // Optionally refresh workflows or show notification
}

export default function DograhWorkflowPanel() {
  const [workflows, setWorkflows] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/dograh/workflows')
      .then(res => res.json())
      .then(setWorkflows);
  }, []);

  return (
    <div>
      <h3>Dograh Workflows</h3>
      <ul>
        {workflows.map(wf => (
          <li key={wf.id} style={{ marginBottom: 16 }}>
            <b>{wf.name}</b> ({wf.status})<br />
            Steps: {wf.steps.join(' → ')}<br />
            <Button onClick={() => triggerWorkflow(wf.id)} style={{ marginTop: 8 }} type="primary">
              Trigger
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
