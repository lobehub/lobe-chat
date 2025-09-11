// @vitest-environment node
import { testProvider } from '../providerTestUtils';
import { ModelProvider } from '../types';
import { Lobe302AI } from './index';

testProvider({
  Runtime: Lobe302AI,
  provider: ModelProvider.Ai302,
  defaultBaseURL: 'https://api.302.ai/v1',
  chatDebugEnv: 'DEBUG_SILICONCLOUD_CHAT_COMPLETION',
  chatModel: 'gpt-3.5-turbo',
});
