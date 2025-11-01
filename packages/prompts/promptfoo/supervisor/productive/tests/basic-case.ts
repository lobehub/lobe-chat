const testCases = [
  // Tool Calling Test 1: Basic trigger_agent usage
  {
    assert: [
      { type: 'is-valid-openai-tools-call' },
      {
        provider: 'openai:gpt-5-mini',
        type: 'llm-rubric',
        value:
          'Should call trigger_agent tool to ask coder or designer to help with the login page task',
      },
    ],
    vars: {
      availableAgents: [
        { id: 'coder', title: 'Code Wizard' },
        { id: 'designer', title: 'UI Designer' },
      ],
      conversationHistory: 'User: I need help building a login page',
      systemPrompt: 'You are coordinating a software development team',
      userName: 'Bobs',
    },
  },
  // just say hi - should only trigger_agent, no todo operations
  {
    assert: [
      { type: 'is-valid-openai-tools-call' },
      {
        type: 'javascript',
        value: `
          // Ensure ONLY trigger_agent tool is called, no create_todo, finish_todo, etc.
          const toolCalls = Array.isArray(output) ? output : [];
          return toolCalls.length > 0 && toolCalls.every(call => call.function?.name === 'trigger_agent');
        `,
      },
      {
        provider: 'openai:gpt-5-mini',
        type: 'llm-rubric',
        value:
          'Should call trigger_agent tool to greet the user or ask how to help. Should NOT include any create_todo or finish_todo calls.',
      },
    ],
    vars: {
      availableAgents: [
        { id: 'agt_J34pj8igq5Hk', title: '全栈工程师' },
        { id: 'agt_5xSoLVNHOjQj', title: '产品经理' },
      ],
      conversationHistory: '<message author="user">hi</message>',
      role: 'user',
      userName: 'Rene Wang',
    },
  },
];

export default testCases;
