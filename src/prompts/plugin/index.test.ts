import { Tool } from '@/prompts/plugin/tools';

import { pluginPrompts } from './index';

describe('pluginPrompts', () => {
  it('should generate plugin prompts with tools', () => {
    const tools: Tool[] = [
      {
        name: 'tool1',
        identifier: 'id1',
        apis: [
          {
            name: 'api1',
            desc: 'API 1',
          },
        ],
      },
    ];

    const expected = `<plugins_info>
<tools>
<description>The tools you can use below</description>
<tool name="tool1" identifier="id1">

<api name="api1">API 1</api>
</tool>
</tools>
</plugins_info>`;

    expect(pluginPrompts({ tools })).toBe(expected);
  });

  it('should generate plugin prompts without tools', () => {
    const tools: Tool[] = [];

    const expected = `<plugins_info>

</plugins_info>`;

    expect(pluginPrompts({ tools })).toBe(expected);
  });
});
