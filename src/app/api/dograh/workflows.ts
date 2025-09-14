import { NextApiRequest, NextApiResponse } from 'next';

// Example in-memory Dograh workflow store
const dograhWorkflows = [
  { id: 1, name: 'Data Sync', status: 'Idle', steps: ['Fetch', 'Transform', 'Push'] },
  { id: 2, name: 'Report Generation', status: 'Running', steps: ['Collect', 'Analyze', 'Export'] },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      res.status(200).json(dograhWorkflows);
      break;
    }
    case 'POST': {
      // TODO: Add workflow trigger logic (integrate Dograh engine)
      res.status(201).json({ message: 'Dograh workflow triggered' });
      break;
    }
    default: {
      res.status(405).json({ message: 'Method not allowed' });
    }
  }
}
