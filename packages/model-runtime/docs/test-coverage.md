# Model Runtime Testing Coverage

## Current Status

**Overall Coverage**: 85.74% (122 test files, 1899 tests)

## Coverage Status by Priority

### 🔴 Critical - Low Coverage (<50%)

current none

### 🟡 Medium - Moderate Coverage (50-80%)

| File                                           | Coverage | Priority | Action                        |
| ---------------------------------------------- | -------- | -------- | ----------------------------- |
| **Core Modules**                               |          |          |                               |
| core/streams/openai/responsesStream.ts         | 50.6%    | High     | Add edge cases                |
| core/usageConverters/utils/computeImageCost.ts | 64.47%   | High     | Add edge cases                |
| core/usageConverters/utils/computeChatCost.ts  | 79.78%   | Medium   | Add edge cases                |
| core/ModelRuntime.ts                           | 75%      | Medium   | Add edge cases                |
| **Providers**                                  |          |          |                               |
| providers/search1api                           | 52.08%   | Medium   | Add custom tests              |
| providers/openrouter                           | 52.83%   | Medium   | Add custom tests              |
| providers/sensenova                            | 53.01%   | Medium   | Add custom tests              |
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

51 providers with 80%+ coverage, including:

- **100% coverage**: vercelaigateway, cometapi, cerebras, ollamacloud, internlm, hunyuan, huggingface, groq, modelscope, nebius, stepfun, lmstudio, newapi, fireworksai, jina, tencentcloud, togetherai, and 24 others
- **90-99%**: github, vertexai, volcengine, siliconcloud, ppio, minimax, cloudflare, fal, anthropic
- **80-89%**: ai302, qwen, google, azureOpenai, azureai, infiniai, aihubmix, bfl

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

#### 2.1 OpenAI-Compatible Provider Pattern

For better testability, OpenAI-compatible providers should export a `params` object:

```typescript
import {
  OpenAICompatibleFactoryOptions,
  createOpenAICompatibleRuntime,
} from '../../core/openaiCompatibleFactory';

export const params = {
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
} satisfies OpenAICompatibleFactoryOptions;

export const LobeXxxAI = createOpenAICompatibleRuntime(params);
```

#### 2.2 Router Provider Pattern

Router providers (like NewAPI and AiHubMix) route different models to different API types. They should also export a `params` object:

```typescript
import { ModelProvider } from 'model-bank';

import { createRouterRuntime } from '../../core/RouterRuntime';
import { CreateRouterRuntimeOptions } from '../../core/RouterRuntime/createRuntime';

export const params = {
  id: ModelProvider.Xxx,
  debug: {
    chatCompletion: () => process.env.DEBUG_XXX_CHAT_COMPLETION === '1',
  },
  defaultHeaders: {
    'X-Custom-Header': 'value',
  },
  models: async ({ client }) => {
    // Fetch and process multi-provider model list
    const modelsPage = await client.models.list();
    return processMultiProviderModelList(modelsPage.data, 'xxx');
  },
  routers: [
    {
      apiType: 'anthropic',
      models: LOBE_DEFAULT_MODEL_LIST.filter((m) => detectModelProvider(m.id) === 'anthropic'),
      options: { baseURL: 'https://api.xxx.com' },
    },
    {
      apiType: 'google',
      models: LOBE_DEFAULT_MODEL_LIST.filter((m) => detectModelProvider(m.id) === 'google'),
      options: { baseURL: 'https://api.xxx.com/gemini' },
    },
    {
      apiType: 'openai',
      options: {
        baseURL: 'https://api.xxx.com/v1',
        chatCompletion: {
          handlePayload: (payload) => {
            // Custom payload transformation for OpenAI-compatible models
            return payload;
          },
        },
      },
    },
  ],
} satisfies CreateRouterRuntimeOptions;

export const LobeXxxAI = createRouterRuntime(params);
```

**Key Differences for Router Providers:**

- Use `createRouterRuntime` instead of `createOpenAICompatibleRuntime`
- Define `routers` array to specify how different models route to different API types
- Each router can have its own `apiType`, `models` filter, and `options`
- The `models` function should use `processMultiProviderModelList` to handle multi-provider model lists

### 3. Testing Checklist

#### 3.1 OpenAI-Compatible Provider Checklist

For each OpenAI-compatible provider, ensure:

- [ ] Basic initialization tests (via `testProvider`)
- [ ] Debug mode tests
- [ ] Payload transformation tests (if custom `handlePayload`)
- [ ] Error handling tests (if custom `handleError`)
- [ ] Models fetching tests (if custom `models`)
- [ ] Special features tests (web search, thinking, etc.)
- [ ] Edge cases and boundary conditions
- [ ] Export `params` object for better testability

#### 3.2 Router Provider Testing Checklist

For router providers (like NewAPI, AiHubMix), ensure:

- [ ] **Basic Runtime Tests**
  - Runtime instantiation with correct provider ID
  - Type definitions for provider-specific interfaces
- [ ] **Debug Configuration Tests**
  - Debug mode enabled (`DEBUG_XXX_CHAT_COMPLETION=1`)
  - Debug mode disabled (default)
- [ ] **Router Configuration Tests**
  - Dynamic routers generation (if using function form)
  - Correct baseURL extraction and processing
  - Per-router apiType and model filtering
  - Per-router options configuration
- [ ] **Models Function Tests**
  - Successful model list fetching
  - `processMultiProviderModelList` integration
  - Error handling (network errors, invalid API keys)
  - Empty or missing model data handling
- [ ] **Custom Logic Tests** (if applicable)
  - Custom payload transformations (e.g., `handlePayload` in OpenAI router)
  - Custom pricing calculation logic
  - Provider detection from model metadata
  - URL processing and normalization
- [ ] **Edge Cases**
  - Missing or invalid baseURL
  - Empty model lists
  - API errors and fallback behavior
  - Special model patterns (e.g., Responses API detection)
- [ ] **Export Requirements**
  - Export `params` object satisfying `CreateRouterRuntimeOptions`
  - Export custom types (ModelCard, Pricing, etc.)
  - Export utility functions for testing (e.g., `handlePayload`)

#### 3.3 Router Provider Testing Example

Reference: `newapi/index.test.ts`

```typescript
// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { LobeXxxAI, params } from './index';

describe('Xxx Router Runtime', () => {
  describe('Runtime Instantiation', () => {
    it('should create runtime instance', () => {
      const instance = new LobeXxxAI({ apiKey: 'test' });
      expect(instance).toBeDefined();
    });
  });

  describe('Debug Configuration', () => {
    it('should disable debug by default', () => {
      delete process.env.DEBUG_XXX_CHAT_COMPLETION;
      const result = params.debug.chatCompletion();
      expect(result).toBe(false);
    });

    it('should enable debug when env is set', () => {
      process.env.DEBUG_XXX_CHAT_COMPLETION = '1';
      const result = params.debug.chatCompletion();
      expect(result).toBe(true);
    });
  });

  describe('Routers Configuration', () => {
    it('should configure routers with correct apiTypes', () => {
      // Test static routers
      const routers = params.routers;
      expect(routers).toHaveLength(4);
      expect(routers[0].apiType).toBe('anthropic');
      expect(routers[1].apiType).toBe('google');
      expect(routers[2].apiType).toBe('xai');
      expect(routers[3].apiType).toBe('openai');
    });

    it('should configure dynamic routers with user baseURL', () => {
      // Test dynamic routers function
      const options = { apiKey: 'test', baseURL: 'https://custom.com/v1' };
      const routers = params.routers(options);
      expect(routers[0].options.baseURL).toContain('custom.com');
    });
  });

  describe('Models Function', () => {
    it('should fetch and process models', async () => {
      // Test models fetching logic
      const mockClient = {
        baseURL: 'https://api.xxx.com/v1',
        apiKey: 'test',
        models: {
          list: vi.fn().mockResolvedValue({
            data: [{ id: 'model-1', owned_by: 'openai' }],
          }),
        },
      };

      const models = await params.models({ client: mockClient });
      expect(models).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      // Test error handling
      const mockClient = {
        models: {
          list: vi.fn().mockRejectedValue(new Error('API Error')),
        },
      };

      const models = await params.models({ client: mockClient });
      expect(models).toEqual([]);
    });
  });
});
```

### 4. Complete Testing Workflow

**IMPORTANT**: Follow this complete workflow for every testing task. ALL steps are REQUIRED.

#### Step 0: Use Subagents for Parallel Execution (Recommended)

**For multiple providers**: Use subagents to parallelize test development and significantly speed up the process.

**Benefits of using subagents:**

- ⚡ **Speed**: 5 providers completed in parallel vs. sequential (\~5x faster)
- 🔄 **Isolation**: Each provider's tests developed independently
- 📊 **Progress tracking**: See all provider progress at once
- 🐛 **Early detection**: Identify common issues across providers

**How to create parallel subagents:**

When working on multiple providers, create one subagent per provider with a detailed prompt like:

```
根据 model-runtime 内部的测试文档，补充以下 5 个 provider 的测试，每个 provider 的测试用独立的 subagent 执行，这样可以并发加速。

请为以下 providers 分别创建 subagent：
- internlm (current: 39.13%, target: 80%+)
- hunyuan (current: 39.68%, target: 80%+)
- huggingface (current: 39.75%, target: 80%+)
- groq (current: 45.45%, target: 80%+)
- modelscope (current: 47.82%, target: 80%+)
```

Each subagent should be instructed to:

1. Read the test documentation (`packages/model-runtime/docs/test-coverage.md`)
2. Read the implementation file and test file
3. Analyze missing tests based on the testing checklist
4. Add tests and verify they pass
5. Return a summary of test results (do NOT run type check or coverage)

**After all subagents complete:**

- Review all test results
- Fix any failed tests (e.g., type errors, test failures)
- Proceed with Step 2 (Type Check) below

**For single provider**: Skip this step and proceed directly to Step 1.

---

#### Step 1: Development and Testing

```bash
# 1. Refactor provider and write tests
# 2. Run tests to verify they pass
bunx vitest run --silent='passed-only' 'src/providers/{provider}/index.test.ts'
```

#### Step 2: Type and Lint Checks

**CRITICAL**: Run type check and lint before proceeding. Failing these checks means the task is incomplete.

```bash
# Check TypeScript types (from project root)
cd ../../../ && bun run type-check

# Or run typecheck for model-runtime only
bunx tsc --noEmit

# Fix any linting issues
bunx eslint src/providers/{provider}/ --fix
```

**Common Type Errors to Watch For:**

- Missing or incorrect type annotations
- Unused variables or imports
- Incorrect generic type parameters
- Missing satisfies clauses for `params` objects

**Do NOT proceed to Step 3 if type/lint checks fail!**

#### Step 3: Run Coverage Report

```bash
# Run coverage to get updated metrics
bunx vitest run --coverage --silent='passed-only'
```

#### Step 4: Summarize Development Work

Before updating documentation, create a summary of what was accomplished:

**Summary Checklist:**

- [ ] What provider(s) were worked on?
- [ ] What was the coverage improvement? (before% → after%)
- [ ] How many new tests were added?
- [ ] What specific features/logic were tested?
- [ ] Were any bugs discovered and fixed?
- [ ] Any new patterns or best practices identified?
- [ ] Should the testing guide be updated based on learnings?

**Example Summary:**

```
Provider: newapi
Coverage: 13.28% → 100% (+86.72%)
Tests Added: 65 new tests
Features Tested:
  - handlePayload logic with Responses API detection
  - Complex pricing calculation (quota_type, model_price, model_ratio)
  - Provider detection from supported_endpoint_types and owned_by
  - Dynamic routers configuration with baseURL processing
  - Error handling for pricing API failures
Bugs Fixed: None
Guide Updates: Added router provider testing pattern to documentation
```

#### Step 5: Update This Document

Based on your development summary, update the following sections:

1. **Current Status** section:
   - Update overall coverage percentage
   - Update test file count and total test count

2. **Coverage Status by Priority** section:
   - Move completed providers from low/medium to high coverage section
   - Update coverage percentages for all modified providers
   - Remove completed items from critical/medium sections

3. **Completed Work** section:
   - Update "Recent Achievements" with new coverage delta
   - Add newly refactored providers to the list with their coverage improvement
   - Document any bugs fixed or improvements made

4. **Testing Strategy** section (if applicable):
   - Add new patterns discovered during development
   - Update examples with better practices
   - Document any provider-specific testing approaches

#### Step 6: Final Verification

```bash
# Verify all tests still pass
bunx vitest run --silent='passed-only' 'src/providers/{provider}/index.test.ts'

# Verify type check still passes
cd ../../../ && bun run type-check
```

#### Complete Workflow Example

```bash
# 1. Development Phase
# ... write code and tests ...
bunx vitest run --silent='passed-only' 'src/providers/example/index.test.ts'

# 2. Type/Lint Phase (REQUIRED)
cd ../../../ && bun run type-check # Must pass!
bunx eslint src/providers/example/ --fix

# 3. Coverage Phase
cd packages/model-runtime
bunx vitest run --coverage --silent='passed-only'

# 4. Summarization Phase
# Create summary following the checklist above

# 5. Documentation Phase
# Update this file with summary and metrics

# 6. Final Verification
bunx vitest run --silent='passed-only' 'src/providers/example/index.test.ts'
cd ../../../ && bun run type-check

# 7. Commit
git add .
git commit -m "✅ test: add comprehensive tests for example provider (13% → 100%)"
```

**Remember**: A testing task is only complete when:

1. ✅ Tests pass
2. ✅ Type check passes
3. ✅ Lint passes
4. ✅ Development work is summarized
5. ✅ Documentation is updated
6. ✅ Final verification passes

## Commands

### Testing Commands

```bash
# Run all tests with coverage
bunx vitest run --coverage

# Run specific provider tests
bunx vitest run --silent='passed-only' 'src/providers/{provider}/index.test.ts'

# Run tests for multiple providers
bunx vitest run --silent='passed-only' src/providers/higress/index.test.ts src/providers/ai360/index.test.ts

# Watch mode for development
bunx vitest watch 'src/providers/{provider}/index.test.ts'
```

### Type Check Commands

```bash
# Type check entire project (from project root)
cd ../../../ && bun run type-check

# Type check model-runtime only
bunx tsc --noEmit

# Type check with watch mode
bunx tsc --noEmit --watch
```

### Lint Commands

```bash
# Lint specific provider
bunx eslint src/providers/{provider}/ --fix

# Lint all providers
bunx eslint src/providers/ --fix

# Lint without auto-fix (check only)
bunx eslint src/providers/{provider}/
```

## Completed Work

### Recent Achievements ✅

**Latest Session (2025-10-13 - Part 2)**: 🚀 5 High-Priority Providers Completed!

- Overall coverage: 84.49% → 85.74% (+1.25%)
- Refactored 5 high-priority providers:
  - **vercelaigateway** (50% → 100%) - 43 tests, fixed verbosity bug
  - **github** (52.08% → 97.95%) - 32 tests
  - **cometapi** (55.26% → 100%) - 28 tests
  - **cerebras** (55.55% → 100%) - 28 tests
  - **ollamacloud** (55.55% → 100%) - 24 tests
- Added 155 comprehensive tests
- Fixed 1 bug: verbosity parameter initialization in vercelaigateway
- All providers now export `params` for better testability
- Used parallel subagent execution for faster development

**Previous Session (2025-10-13 - Part 1)**: 🎉 All Critical providers completed!

- Overall coverage: 82.9% → 84.49% (+1.59%)
- **Eliminated all critical (<50% coverage) providers!**
- Refactored 5 providers:
  - **internlm** (39.13% → 100%) - 30 tests, fixed null model bug
  - **hunyuan** (39.68% → 100%) - 33 tests, fixed null model bug
  - **huggingface** (39.75% → 100%) - 38 tests
  - **groq** (45.45% → 100%) - 35 tests
  - **modelscope** (47.82% → 100%) - 24 tests
- Added 160 comprehensive tests
- Fixed 2 bugs: null/undefined model handling in internlm and hunyuan
- All providers now export `params` for better testability
- Used parallel subagent execution for faster development

**Previous Session (2025-01-15)**:

- Overall coverage: 81.86% → 82.9% (+1.04%)
- Refactored 3 providers: **nebius** (32.3% → 100%), **stepfun** (34.92% → 100%), **lmstudio** (35.48% → 100%)
- Added 93 new tests
- All providers now export `params` for better testability

**Earlier Session (2025-01-15)**:

- Overall coverage: 80.81% → 81.86% (+1.05%)
- Refactored 4 providers: **fireworksai**, **jina**, **tencentcloud**, **togetherai** (all now at 100%)
- Added 65 new tests
- Fixed bugs in togetherai provider

## Notes

### General Testing Notes

- All providers should follow the same testing pattern for consistency
- Exporting `params` makes testing much easier by allowing direct testing of configuration
- `testProvider` utility provides basic test coverage for OpenAI-compatible providers
- Custom feature tests should be added based on provider-specific functionality
- Always mock API calls in tests (`skipAPICall: true`)
- Debug environment variables should be tested
- **Type check and lint must pass before committing**
- **Update this document after each testing task completion**

### Router Provider Specific Notes

- **Router providers use `createRouterRuntime` instead of `createOpenAICompatibleRuntime`**
- The `testProvider` utility does NOT work for router providers - write custom tests
- Router providers route different models to different API implementations (anthropic, google, xai, openai)
- Test both static and dynamic router configurations:
  - Static: `routers: [...]` - array of router configs
  - Dynamic: `routers: (options) => [...]` - function that generates routers based on user options
- Router providers typically have complex `models` functions that:
  - Fetch models from a unified API endpoint
  - Process multi-provider model lists with `processMultiProviderModelList`
  - Handle provider detection from model metadata
  - May include custom pricing calculation logic
- Test router-specific custom logic separately (e.g., `handlePayload`, pricing calculation)
- Pay attention to baseURL processing - routers may need to:
  - Strip version paths (`/v1`, `/v1beta`) from baseURL
  - Apply different baseURL patterns for different API types
  - Handle user-provided custom baseURLs
- Examples of router providers: `newapi`, `aihubmix`
- For comprehensive router provider testing patterns, refer to `newapi/index.test.ts`
