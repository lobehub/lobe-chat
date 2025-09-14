import express from 'express';

const router = express.Router();

// Example plugin registry
const plugins = [
  { name: 'WebSearch', enabled: true, description: 'Search the web for information.' },
  { name: 'Calculator', enabled: false, description: 'Perform calculations.' },
  { name: 'Weather', enabled: false, description: 'Get current weather info.' },
];

// List plugins
router.get('/', (req, res) => {
  res.json({ plugins });
});

// Enable/disable plugin
router.post('/toggle', (req, res) => {
  const { name, enabled } = req.body;
  const plugin = plugins.find(p => p.name === name);
  if (plugin) plugin.enabled = enabled;
  res.json({ success: !!plugin, plugins });
});

// Invoke plugin (stub)
router.post('/invoke', (req, res) => {
  const { name, input } = req.body;
  // Simulate plugin invocation
  res.json({ result: `Plugin ${name} invoked with input: ${input}` });
});

export default router;
