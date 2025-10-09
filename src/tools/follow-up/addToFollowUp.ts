import { submitToGoogleSheet } from '@/utils/googleSheetSubmit';

export const addToFollowUpTool = {
  name: 'add_to_follow_up',
  description: 'Add a contact to the “Follow‑up” sheet.',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Contact full name' },
      company: { type: 'string' },
      linkedIn: { type: 'string' },
      notes: { type: 'string' },
      followUpDate: { type: 'string' },
      status: { type: 'string' }
    },
    required: ['name']
  },
  async execute(args: any) {
    return await submitToGoogleSheet('follow_up', args);
  }
};
