import { NextApiRequest, NextApiResponse } from 'next';

// Example in-memory automation workflow store
let automationWorkflows = [
  {
    actions: ['Generate Report', 'Send Email'],
    id: 1,
    name: 'Daily Report',
    schedule: '0 8 * * *',
    status: 'Active',
    trigger: 'schedule',
  },
  {
    actions: ['Send Welcome Email', 'Assign Onboarding'],
    event: 'user.created',
    id: 2,
    name: 'On New User',
    status: 'Active',
    trigger: 'event',
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      res.status(200).json(automationWorkflows);
      break;
    }
    case 'POST': {
      // Create new automation workflow
      const newWorkflow = { ...req.body, id: Date.now(), status: 'Active' };
      automationWorkflows.push(newWorkflow);
      res.status(201).json(newWorkflow);
      break;
    }
    case 'PUT': {
      // Update workflow
      const { id, ...rest } = req.body;
      automationWorkflows = automationWorkflows.map(wf => wf.id === id ? { ...wf, ...rest } : wf);
      res.status(200).json({ message: 'Workflow updated' });
      break;
    }
    default: {
      res.status(405).json({ message: 'Method not allowed' });
    }
  }
}
