import React, { useEffect, useState } from 'react';
import { Button, Input, Select } from 'antd';

const { Option } = Select;

export default function AutomationWorkflowPanel() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [form, setForm] = useState({ actions: '', event: '', name: '', schedule: '', trigger: 'schedule' });

  useEffect(() => {
    fetch('/api/automation/workflows')
      .then(res => res.json())
      .then(setWorkflows);
  }, []);

  const createWorkflow = async () => {
    await fetch('/api/automation/workflows', {
      body: JSON.stringify({ ...form, actions: form.actions.split(',').map(a => a.trim()) }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    setForm({ actions: '', event: '', name: '', schedule: '', trigger: 'schedule' });
    fetch('/api/automation/workflows').then(res => res.json()).then(setWorkflows);
  };

  return (
    <div>
      <h3>Automation Workflows</h3>
      <div style={{ marginBottom: 24 }}>
        <Input
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Workflow Name"
          style={{ marginBottom: 8 }}
          value={form.name}
        />
        <Select
          onChange={val => setForm(f => ({ ...f, trigger: val }))}
          style={{ marginBottom: 8, width: 160 }}
          value={form.trigger}
        >
          <Option value="schedule">Schedule</Option>
          <Option value="event">Event</Option>
        </Select>
        {form.trigger === 'schedule' ? (
          <Input
            onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))}
            placeholder="Cron Schedule (e.g. 0 8 * * *)"
            style={{ marginBottom: 8 }}
            value={form.schedule}
          />
        ) : (
          <Input
            onChange={e => setForm(f => ({ ...f, event: e.target.value }))}
            placeholder="Event Name (e.g. user.created)"
            style={{ marginBottom: 8 }}
            value={form.event}
          />
        )}
        <Input
          onChange={e => setForm(f => ({ ...f, actions: e.target.value }))}
          placeholder="Actions (comma separated)"
          style={{ marginBottom: 8 }}
          value={form.actions}
        />
        <Button onClick={createWorkflow} type="primary">Create Workflow</Button>
      </div>
      <ul>
        {workflows.map(wf => (
          <li key={wf.id} style={{ marginBottom: 16 }}>
            <b>{wf.name}</b> ({wf.status})<br />
            Trigger: {wf.trigger === 'schedule' ? `Schedule: ${wf.schedule}` : `Event: ${wf.event}`}<br />
            Actions: {wf.actions.join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
}
