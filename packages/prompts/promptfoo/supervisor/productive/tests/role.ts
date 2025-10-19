const assert = [
  { type: 'is-valid-openai-tools-call' },
  {
    type: 'javascript',
    value: `
          // Debug: log the actual output structure
          console.log('DEBUG output:', JSON.stringify(output, null, 2));

          // Ensure ONLY trigger_agent tool is called, no create_todo, finish_todo, etc.
          const toolCalls = Array.isArray(output) ? output : [];
          if (toolCalls.length === 0) {
            console.log('DEBUG: No tool calls found');
            return false;
          }

          for (const call of toolCalls) {
            const toolName = call.tool_name || call.function?.name || call.name;
            console.log('DEBUG tool name:', toolName);

            if (toolName !== 'trigger_agent') {
              console.log('DEBUG: Found non-trigger_agent tool:', toolName);
              return false;
            }
          }

          console.log('DEBUG: All', toolCalls.length, 'calls are trigger_agent');
          return true;
        `,
  },
  {
    provider: 'openai:gpt-5-mini',
    type: 'llm-rubric',
    value:
      'Should call trigger_agent tool to greet the user or ask how to help. Should NOT include any create_todo or finish_todo calls.',
  },
];
const vars = {
  availableAgents: [
    { id: 'agt_J34pj8igq5Hk', title: '全栈工程师' },
    { id: 'agt_5xSoLVNHOjQj', title: '产品经理' },
  ],
  conversationHistory: '<message author="user">hi</message>',
  role: 'user',
  userName: 'Rene Wang',
};

const testCases = [
  {
    assert,
    vars: { ...vars, role: 'user' },
  },
  {
    assert,
    vars: { ...vars, role: 'system' },
  },
];

export default testCases;
