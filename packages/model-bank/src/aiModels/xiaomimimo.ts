import { AIChatModelCard } from '../types/aiModel';

const xiaomimimoChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 262_144,
    description: 'MiMo-V2-Flash: 高效推理、代码与 Agent 基座模型。',
    displayName: 'MiMo V2 Flash',
    enabled: true,
    id: 'mimo-v2-flash',
    maxOutput: 131_072,
    settings: {
      extendParams: ['enableReasoning'],
    },
    type: 'chat',
  },
];

export const allModels = [...xiaomimimoChatModels];

export default allModels;
