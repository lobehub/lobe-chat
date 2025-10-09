import { submitToGoogleSheet } from '@/utils/googleSheetSubmit';

export const addToKeepWarmTool = {
  name: 'add_to_keep_warm',
  description: 'Add a contact to the “Keep warm” sheet.',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      company: { type: 'string' },
      linkedIn: { type: 'string' },
      notes: { type: 'string' },
      contactInterval: { type: 'string' },
      followUpDate: { type: 'string' },
      status: { type: 'string' }
    },
    required: ['name']
  },
  async execute(args: any) {
    return await submitToGoogleSheet('keep_warm', args);
  }
};
