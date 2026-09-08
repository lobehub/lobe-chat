import { type BuiltinToolManifest } from '@lobechat/types';

import { systemPrompt } from './systemRole';
import { AuvApiName, AuvIdentifier } from './types';

export const AuvManifest: BuiltinToolManifest = {
  executors: ['client', 'server'],
  api: [
    {
      defaultTimeoutMs: 120_000,
      description:
        'Use the computer by running a typed AUV CLI invoke command on the active desktop device. Pass arguments after the auv executable, for example ["invoke", "display.list"]. Use ["invoke", "--help"] or ["invoke", "display.capture", "--help"] to inspect available commands and options. Successful invocations return parsed JSON, including artifacts[].file_path for captured images.',
      humanIntervention: 'required',
      name: AuvApiName.runCommand,
      parameters: {
        properties: {
          reasoning: {
            description:
              'Briefly describe the purpose of this action for the user, in their language. This is displayed in the tool inspector and is not a CLI argument.',
            type: 'string',
          },
          argv: {
            description:
              'Arguments after the auv executable. The first argument must be "invoke". Do not include shell syntax or the executable name.',
            items: { type: 'string' },
            minItems: 2,
            type: 'array',
          },
        },
        required: ['argv'],
        type: 'object',
      },
    },
  ],
  identifier: AuvIdentifier,
  meta: {
    avatar: '🖱️',
    description: 'Use desktop applications, interact with controls, and capture the screen',
    readme:
      'Interact with desktop applications, use mouse and keyboard controls, enter text, and capture the screen on the active device. View captured images to inspect the result of each step.',
    title: 'Computer Use',
  },
  systemRole: systemPrompt,
  type: 'builtin',
};
