import { NextApiRequest, NextApiResponse } from 'next';

// Example in-memory automation workflow store
let automationWorkflows = [
  {
    id: 1,
    name: 'Daily Report',
    trigger: 'schedule',
    schedule: '0 8 * * *',
    actions: ['Generate Report', 'Send Email'],
    status: 'Active',
  },
  {
    id: 2,
    name: 'On New User',
    trigger: 'event',
    event: 'user.created',
    actions: ['Send Welcome Email', 'Assign Onboarding'],
    status: 'Active',
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
