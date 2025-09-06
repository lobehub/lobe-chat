// @vitest-environment node
import { ModelProvider } from '@lobechat/model-runtime';

import { testProvider } from '../providerTestUtils';
import { LobeSearch1API } from './index';

const provider = ModelProvider.Search1API;
const defaultBaseURL = 'https://api.search1api.com/v1';

testProvider({
  Runtime: LobeSearch1API,
  provider,
  defaultBaseURL,
  chatDebugEnv: 'DEBUG_SEARCH1API_CHAT_COMPLETION',
  chatModel: 'gpt-4o-mini',
  test: {
    skipAPICall: true,
  },
});
