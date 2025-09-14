import React, { useEffect, useState } from 'react';
import { Button, Input, Select } from 'antd';

const { Option } = Select;

export default function AutomationWorkflowPanel() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', trigger: 'schedule', schedule: '', event: '', actions: '' });

  useEffect(() => {
    fetch('/api/automation/workflows')
      .then(res => res.json())
      .then(setWorkflows);
  }, []);

  const createWorkflow = async () => {
    await fetch('/api/automation/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, actions: form.actions.split(',').map(a => a.trim()) }),
    });
    setForm({ name: '', trigger: 'schedule', schedule: '', event: '', actions: '' });
    fetch('/api/automation/workflows').then(res => res.json()).then(setWorkflows);
  };

  return (
    <div>
      <h3>Automation Workflows</h3>
      <div style={{ marginBottom: 24 }}>
        <Input
          placeholder="Workflow Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          style={{ marginBottom: 8 }}
        />
        <Select
          value={form.trigger}
          onChange={val => setForm(f => ({ ...f, trigger: val }))}
          style={{ width: 160, marginBottom: 8 }}
        >
          <Option value="schedule">Schedule</Option>
          <Option value="event">Event</Option>
        </Select>
        {form.trigger === 'schedule' ? (
          <Input
            placeholder="Cron Schedule (e.g. 0 8 * * *)"
            value={form.schedule}
            onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))}
            style={{ marginBottom: 8 }}
          />
        ) : (
          <Input
            placeholder="Event Name (e.g. user.created)"
            value={form.event}
            onChange={e => setForm(f => ({ ...f, event: e.target.value }))}
            style={{ marginBottom: 8 }}
          />
        )}
        <Input
          placeholder="Actions (comma separated)"
          value={form.actions}
          onChange={e => setForm(f => ({ ...f, actions: e.target.value }))}
          style={{ marginBottom: 8 }}
        />
        <Button type="primary" onClick={createWorkflow}>Create Workflow</Button>
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
