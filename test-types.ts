import { ExtendParamsType } from './packages/model-bank/src/types/aiModel';
import { LobeAgentChatConfig } from './packages/types/src/agent/chatConfig';

// Test that our new types compile correctly
const testExtendParam: ExtendParamsType = 'searchContextSize';
const testConfig: LobeAgentChatConfig = {
  autoCreateTopicThreshold: 2,
  searchContextSize: 'medium'
};

console.log('Types compiled successfully!', testExtendParam, testConfig);