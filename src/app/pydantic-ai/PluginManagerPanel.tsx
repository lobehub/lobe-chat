import React, { useEffect, useState } from 'react';
import { Switch } from 'antd';

export default function PluginManagerPanel() {
  const [plugins, setPlugins] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/plugins')
      .then(res => res.json())
      .then(data => setPlugins(data.plugins));
  }, []);

  const togglePlugin = async (name: string, enabled: boolean) => {
    await fetch('/api/plugins/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, enabled }),
    });
    setPlugins(plugins => plugins.map(p => p.name === name ? { ...p, enabled } : p));
  };

  return (
    <div>
      <h3>Plugin Manager</h3>
      <ul>
        {plugins.map(plugin => (
          <li key={plugin.name} style={{ marginBottom: 16 }}>
            <b>{plugin.name}</b>: {plugin.description}
            <Switch
              checked={plugin.enabled}
              onChange={checked => togglePlugin(plugin.name, checked)}
              style={{ marginLeft: 16 }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
