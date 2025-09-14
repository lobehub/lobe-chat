import React from 'react';
import Link from 'next/link';

const widgets = [
  { link: '/text', recent: 'Last: Blog Post', status: 'Ready', title: 'Text Generation' },
  { link: '/image', recent: 'Last: Logo Design', status: 'Idle', title: 'Image Creation' },
  { link: '/code', recent: 'Last: API Script', status: 'Ready', title: 'Code Writing' },
  { link: '/speech', recent: 'Last: Meeting Notes', status: 'Idle', title: 'Speech-to-Text' },
  { link: '/analytics', recent: 'Last: Usage Report', status: 'Ready', title: 'Analytics' },
];

const DashboardPage: React.FC = () => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    {/* Sidebar */}
    <nav style={{ background: '#222', color: '#fff', display: 'flex', flexDirection: 'column', padding: 24, width: 220 }}>
      <h2 style={{ marginBottom: 32 }}>InQubatorAI</h2>
      <Link href="/dashboard" style={{ color: '#fff', marginBottom: 16 }}>Dashboard</Link>
      <Link href="/agents" style={{ color: '#fff', marginBottom: 16 }}>Agent Manager</Link>
      <Link href="/templates" style={{ color: '#fff', marginBottom: 16 }}>Templates</Link>
      <Link href="/insights" style={{ color: '#fff', marginBottom: 16 }}>Insights</Link>
      <Link href="/admin" style={{ color: '#fff', marginBottom: 16 }}>Admin</Link>
      <Link href="/settings" style={{ color: '#fff', marginBottom: 16 }}>Settings</Link>
      <Link href="/support" style={{ color: '#fff', marginBottom: 16 }}>Support</Link>
      <div style={{ flex: 1 }} />
      <div style={{ marginTop: 32 }}>
        <span style={{ fontSize: 14 }}>Tenant: <b>Default</b></span>
        <br />
  <button style={{ background: '#444', border: 'none', borderRadius: 4, color: '#fff', marginTop: 8, padding: '4px 12px' }} type="button">Switch Tenant</button>
      </div>
    </nav>
    {/* Main Dashboard */}
    <main style={{ background: '#f7f8fa', flex: 1, padding: 48 }}>
      <h1 style={{ marginBottom: 32 }}>Dashboard</h1>
      <div style={{ display: 'grid', gap: 32, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {widgets.map(widget => (
          <div key={widget.title} style={{ alignItems: 'flex-start', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', display: 'flex', flexDirection: 'column', padding: 32 }}>
            <h3 style={{ marginBottom: 8 }}>{widget.title}</h3>
            <span style={{ color: '#888', fontSize: 14, marginBottom: 16 }}>{widget.recent}</span>
            <span style={{ color: widget.status === 'Ready' ? '#0a0' : '#fa0', fontSize: 12, marginBottom: 16 }}>Status: {widget.status}</span>
            <Link href={widget.link} style={{ color: '#0070f3', fontWeight: 500 }}>Open</Link>
          </div>
        ))}
      </div>
      {/* Agent Orchestration and RAG Config Panels */}
      <div style={{ display: 'flex', gap: 32, marginTop: 48 }}>
        {/* Dynamically import to avoid SSR issues if needed */}
        {/* @ts-ignore */}
        {typeof window !== 'undefined' && (
          <>
            {require('../pydantic-ai/SupervisorOrchestrationPanel').default && (
              <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', flex: 1, padding: 32 }}>
                {React.createElement(require('../pydantic-ai/SupervisorOrchestrationPanel').default)}
              </div>
            )}
            {require('../pydantic-ai/RAGConfigPanel').default && (
              <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', flex: 1, padding: 32 }}>
                {React.createElement(require('../pydantic-ai/RAGConfigPanel').default)}
              </div>
            )}
            {require('../pydantic-ai/PluginManagerPanel').default && (
              <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', flex: 1, padding: 32 }}>
                {React.createElement(require('../pydantic-ai/PluginManagerPanel').default)}
              </div>
            )}
            {require('../pydantic-ai/DograhWorkflowPanel').default && (
              <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', flex: 1, padding: 32 }}>
                {React.createElement(require('../pydantic-ai/DograhWorkflowPanel').default)}
              </div>
            )}
            {require('../pydantic-ai/AutomationWorkflowPanel').default && (
              <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', flex: 1, padding: 32 }}>
                {React.createElement(require('../pydantic-ai/AutomationWorkflowPanel').default)}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  </div>
);

export default DashboardPage;
