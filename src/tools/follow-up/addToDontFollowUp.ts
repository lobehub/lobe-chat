import { submitToGoogleSheet } from '@/utils/googleSheetSubmit';

export const addToDontFollowUpTool = {
  name: 'add_to_dont_follow_up',
  description: 'Add a contact to the “Don’t follow‑up” sheet.',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      company: { type: 'string' },
      linkedIn: { type: 'string' },
      notes: { type: 'string' },
      status: { type: 'string' }
    },
    required: ['name']
  },
  async execute(args: any) {
    return await submitToGoogleSheet('dont_follow_up', args);
  }
};
