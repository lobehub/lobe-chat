import { describe, expect, it } from 'vitest';

import { Tool, apiPrompt, toolPrompt, toolsPrompts } from './tools';

describe('Prompt Generation Utils', () => {
  // 测试 apiPrompt 函数
  describe('apiPrompt', () => {
    it('should generate correct api prompt', () => {
      const api = {
        name: 'testApi',
        desc: 'Test API Description',
      };

      expect(apiPrompt(api)).toBe(`<api name="testApi">Test API Description</api>`);
    });
  });

  // 测试 toolPrompt 函数
  describe('toolPrompt', () => {
    it('should generate tool prompt with system role', () => {
      const tool: Tool = {
        name: 'testTool',
        identifier: 'test-id',
        systemRole: 'Test System Role',
        apis: [
          {
            name: 'api1',
            desc: 'API 1 Description',
          },
        ],
      };

      const expected = `<tool name="testTool" identifier="test-id">
<tool_instructions>Test System Role</tool_instructions>
<api name="api1">API 1 Description</api>
</tool>`;

      expect(toolPrompt(tool)).toBe(expected);
    });

    it('should generate tool prompt without system role', () => {
      const tool: Tool = {
        name: 'testTool',
        identifier: 'test-id',
        apis: [
          {
            name: 'api1',
            desc: 'API 1 Description',
          },
        ],
      };

      const expected = `<tool name="testTool" identifier="test-id">

<api name="api1">API 1 Description</api>
</tool>`;

      expect(toolPrompt(tool)).toBe(expected);
    });
  });

  // 测试 toolsPrompts 函数
  describe('toolsPrompts', () => {
    it('should generate tools prompts with multiple tools', () => {
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
        {
          name: 'tool2',
          identifier: 'id2',
          apis: [
            {
              name: 'api2',
              desc: 'API 2',
            },
          ],
        },
      ];

      const expected = `<tools>
<description>The tools you can use below</description>
<tool name="tool1" identifier="id1">

<api name="api1">API 1</api>
</tool>
<tool name="tool2" identifier="id2">

<api name="api2">API 2</api>
</tool>
</tools>`;

      expect(toolsPrompts(tools)).toBe(expected);
    });

    it('should generate tools prompts with empty tools array', () => {
      const tools: Tool[] = [];

      expect(toolsPrompts(tools)).toBe('');
    });
  });
});
