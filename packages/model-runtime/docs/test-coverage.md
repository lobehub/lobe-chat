# Model Runtime Testing Coverage

## Current Status

**Overall Coverage**: 80.81% (118 test files, 1488 tests)

## Coverage Status by Priority

### 🔴 Critical - Low Coverage (<50%)

| File                   | Coverage | Priority    | Action                   |
| ---------------------- | -------- | ----------- | ------------------------ |
| providers/newapi       | 13.28%   | 🔥 Critical | Refactor + full tests    |
| providers/fireworksai  | 29.41%   | 🔥 Critical | Refactor + full tests    |
| providers/jina         | 29.41%   | 🔥 Critical | Refactor + full tests    |
| providers/tencentcloud | 29.41%   | 🔥 Critical | Refactor + full tests    |
| providers/togetherai   | 30.76%   | 🔥 Critical | Refactor + full tests    |
| providers/nebius       | 32.3%    | High        | Add custom feature tests |
| providers/stepfun      | 34.92%   | High        | Add custom feature tests |
| providers/lmstudio     | 35.48%   | High        | Add custom feature tests |
| providers/internlm     | 39.13%   | High        | Add custom feature tests |
| providers/hunyuan      | 39.68%   | High        | Add custom feature tests |
| providers/huggingface  | 39.75%   | High        | Add custom feature tests |
| providers/groq         | 45.45%   | High        | Add custom feature tests |
| providers/modelscope   | 47.82%   | High        | Add custom feature tests |

### 🟡 Medium - Moderate Coverage (50-80%)

| File                                           | Coverage | Priority | Action                        |
| ---------------------------------------------- | -------- | -------- | ----------------------------- |
| **Core Modules**                               |          |          |                               |
| core/streams/openai/responsesStream.ts         | 50.6%    | High     | Add edge cases                |
| core/usageConverters/utils/computeImageCost.ts | 64.47%   | High     | Add edge cases                |
| core/usageConverters/utils/computeChatCost.ts  | 79.78%   | Medium   | Add edge cases                |
| core/ModelRuntime.ts                           | 75%      | Medium   | Add edge cases                |
| **Providers**                                  |          |          |                               |
| providers/vercelaigateway                      | 50%      | High     | Add custom tests              |
| providers/github                               | 52.08%   | High     | Add custom tests              |
| providers/search1api                           | 52.08%   | Medium   | Add custom tests              |
| providers/openrouter                           | 52.83%   | Medium   | Add custom tests              |
| providers/sensenova                            | 53.01%   | Medium   | Add custom tests              |
| providers/cometapi                             | 55.26%   | High     | Add custom tests              |
| providers/cerebras                             | 55.55%   | High     | Add models tests (refactored) |
| providers/ollamacloud                          | 55.55%   | High     | Add models tests (refactored) |
| providers/zhipu                                | 55.83%   | Medium   | Add custom tests              |
| providers/ollama                               | 56.03%   | High     | Add custom tests              |
| providers/ai360                                | 56.14%   | High     | Add models tests (refactored) |
| providers/mistral                              | 57.14%   | High     | Add custom tests              |
| providers/cohere                               | 57.4%    | High     | Add custom tests              |
| providers/akashchat                            | 62.79%   | Medium   | Add payload tests             |
| providers/baichuan                             | 62.5%    | Medium   | Add models tests (refactored) |
| providers/moonshot                             | 66.66%   | Medium   | Add custom tests              |
| providers/spark                                | 70.58%   | Low      | Add custom tests              |
| providers/bedrock                              | 71.72%   | Medium   | Add model-specific tests      |
| providers/giteeai                              | 73.33%   | Medium   | Add error handling tests      |
| providers/v0                                   | 73.33%   | Medium   | Add custom tests              |
| providers/zeroone                              | 73.33%   | Low      | Add custom tests              |
| providers/openai                               | 73.78%   | Medium   | Add edge cases                |
| providers/qiniu                                | 75%      | Low      | Add custom tests              |
| providers/wenxin                               | 76%      | Low      | Add custom tests              |
| providers/deepseek                             | 77.77%   | Low      | Add edge cases                |
| providers/nvidia                               | 78.12%   | Medium   | Add edge cases                |

### ✅ Good - High Coverage (80%+)

Providers with good coverage: ai21 (100%), higress (100%), xai (100%), vllm (100%), novita (100%), sambanova (100%), upstage (100%), taichu (100%), perplexity (100%), xinference (100%), vertexai (92%), volcengine (96.63%), siliconcloud (93.42%), ppio (93.75%), minimax (93.75%), cloudflare (93.6%), fal (94.04%), anthropic (91.07%), ai302 (90%), qwen (88.07%), google (85.39%), azureOpenai (85.15%), azureai (84.31%), infiniai (84%), aihubmix (80.32%), bfl (86.3%).

## Testing Strategy

### 1. Provider Testing Pattern

All providers should follow this testing pattern:

```typescript
// @vitest-environment node
import { ModelProvider } from 'model-bank';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { testProvider } from '../../providerTestUtils';
import { LobeXxxAI, params } from './index';

// Basic provider tests
testProvider({
  Runtime: LobeXxxAI,
  provider: ModelProvider.Xxx,
  defaultBaseURL: 'https://api.xxx.com/v1',
  chatDebugEnv: 'DEBUG_XXX_CHAT_COMPLETION',
  chatModel: 'model-name',
  invalidErrorType: 'InvalidProviderAPIKey',
  bizErrorType: 'ProviderBizError',
  test: {
    skipAPICall: true,
    skipErrorHandle: true,
  },
});

// Custom feature tests
describe('LobeXxxAI - custom features', () => {
  let instance: InstanceType<typeof LobeXxxAI>;

  beforeEach(() => {
    instance = new LobeXxxAI({ apiKey: 'test_api_key' });
    vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
      new ReadableStream() as any,
    );
  });

  describe('handlePayload', () => {
    // Test custom payload transformations
  });

  describe('handleError', () => {
    // Test custom error handling
  });

  describe('models', () => {
    // Test models fetching and processing
  });
});
```

### 2. Code Refactoring Pattern

For better testability, providers should export a `params` object:

```typescript
import {
  OpenAICompatibleFactoryOptions,
  createOpenAICompatibleRuntime,
} from '../../core/openaiCompatibleFactory';

export const params: OpenAICompatibleFactoryOptions = {
  baseURL: 'https://api.example.com/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      // Custom payload transformation
      return transformedPayload;
    },
    handleError: (error) => {
      // Custom error handling
      return errorResponse;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_XXX_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    // Fetch and process models
    return modelList;
  },
  provider: ModelProvider.Xxx,
};

export const LobeXxxAI = createOpenAICompatibleRuntime(params);
```

### 3. Testing Checklist

For each provider, ensure:

- [ ] Basic initialization tests (via `testProvider`)
- [ ] Debug mode tests
- [ ] Payload transformation tests (if custom `handlePayload`)
- [ ] Error handling tests (if custom `handleError`)
- [ ] Models fetching tests (if custom `models`)
- [ ] Special features tests (web search, thinking, etc.)
- [ ] Edge cases and boundary conditions
- [ ] Export `params` object for better testability

### 4. Update Coverage Documentation

After completing each testing task:

1. Run coverage command:

   ```bash
   bunx vitest run --coverage
   ```

2. Update this document with:
   - New overall coverage percentage
   - Move completed items from low/medium to high coverage
   - Update priority levels based on current coverage
   - Add any new findings to the respective sections

## Commands

```bash
# Run all tests with coverage
bunx vitest run --coverage

# Run specific provider tests
bunx vitest run --silent='passed-only' 'src/providers/{provider}/index.test.ts'

# Run tests for multiple providers
bunx vitest run --silent='passed-only' src/providers/higress/index.test.ts src/providers/ai360/index.test.ts
```

## Completed Work

### Recent Achievements ✅

- Overall coverage: 79.08% → 80.81% (+1.73%)
- Refactored 4 providers to export `params`: higress, ai360, baichuan, ai302
- Created test for usageConverters/utils/index.ts (0% → 100%)

### Providers Refactored with `params` Export

- ✅ higress (34.69% → 100%)
- ✅ ai360 (39.28% → 56.14%)
- ✅ baichuan (43.63% → 62.5%)
- ✅ ai302 (48.71% → 90%)
- ✅ siliconcloud (reference implementation)

## Notes

- All providers should follow the same testing pattern for consistency
- Exporting `params` makes testing much easier by allowing direct testing of configuration
- `testProvider` utility provides basic test coverage for all providers
- Custom feature tests should be added based on provider-specific functionality
- Always mock API calls in tests (`skipAPICall: true`)
- Debug environment variables should be tested
- **Update this document after each testing task completion**
