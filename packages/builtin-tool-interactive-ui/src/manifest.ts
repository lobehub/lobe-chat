import type { BuiltinToolManifest } from '@lobechat/types';

import { INTERACTIVE_UI_LIMITS } from './schema';
import { systemPrompt } from './systemRole';
import { InteractiveUIApiName, InteractiveUIIdentifier } from './types';

export const InteractiveUIManifest: BuiltinToolManifest = {
  api: [
    {
      description:
        'Create a self-contained interactive calculator, comparison, or visual explanation in chat. Local controls do not call the model. Generated code cannot call host tools or send messages.',
      name: InteractiveUIApiName.renderUI,
      parameters: {
        additionalProperties: false,
        properties: {
          version: { enum: [1], type: 'number' },
          title: { maxLength: INTERACTIVE_UI_LIMITS.title, minLength: 1, type: 'string' },
          fallback: {
            description: 'Useful plain-text alternative if the widget cannot run.',
            maxLength: INTERACTIVE_UI_LIMITS.fallback,
            minLength: 1,
            type: 'string',
          },
          css: {
            description: 'Self-contained CSS. No external resources.',
            maxLength: INTERACTIVE_UI_LIMITS.css,
            type: 'string',
          },
          html: {
            description:
              'Accessible HTML body markup; no scripts, external resources, links, forms, or embedded frames.',
            maxLength: INTERACTIVE_UI_LIMITS.html,
            minLength: 1,
            type: 'string',
          },
          js: {
            description:
              'Worker JavaScript using lobeUI.on, setText, setValue, setStyle, and propose. No window/document/network/imports.',
            maxLength: INTERACTIVE_UI_LIMITS.js,
            type: 'string',
          },
        },
        required: ['version', 'title', 'fallback', 'css', 'html', 'js'],
        type: 'object',
      },
      renderDisplayControl: 'alwaysExpand',
    },
  ],
  identifier: InteractiveUIIdentifier,
  meta: {
    avatar: '🎛️',
    description:
      'Explore interactive calculators, comparisons, and visual explanations inside chat.',
    title: 'Interactive UI',
  },
  systemRole: systemPrompt,
  type: 'builtin',
};
