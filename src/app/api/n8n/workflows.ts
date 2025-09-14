import { NextApiRequest, NextApiResponse } from 'next';

// Example in-memory workflow store
const workflows = [
    {
        createdBy: 'User',
        id: 1,
        mcpLink: '/mcp/onboarding',
        name: 'Onboarding Workflow',
        status: 'Running',
        steps: ['Collect Info', 'Send Email', 'Create Account'],
    },
    {
        createdBy: 'Supervisor',
        id: 2,
        mcpLink: '/mcp/finance',
        name: 'Finance Approval',
        status: 'Idle',
        steps: ['Review Request', 'Approve', 'Notify'],
    },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET': {
            res.status(200).json(workflows);
            break;
        }
        case 'POST': {
            // TODO: Add workflow creation logic
            res.status(201).json({ message: 'Workflow created' });
            break;
        }
        case 'PUT': {
            // TODO: Add workflow update logic
            res.status(200).json({ message: 'Workflow updated' });
            break;
        }
        default: {
            res.status(405).json({ message: 'Method not allowed' });
            break;
        }
    }
}
