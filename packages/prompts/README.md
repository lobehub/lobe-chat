# @lobechat/prompts

This package contains prompt chains and templates for the LobeChat application, with comprehensive testing using promptfoo.

## Features

- **Prompt Chains**: Reusable prompt templates for various AI tasks
- **AI Testing**: Comprehensive testing using promptfoo for prompt quality assurance
- **Multi-language Support**: Prompts and tests for multiple languages
- **Type Safety**: Full TypeScript support with proper type definitions

## Available Prompt Chains

- `chainSummaryTitle` - Generate conversation titles
- `chainLangDetect` - Detect language of input text
- `chainTranslate` - Translate content between languages
- `chainPickEmoji` - Select appropriate emojis for content
- `chainAnswerWithContext` - Answer questions using knowledge base context

## Testing with promptfoo

This package uses [promptfoo](https://promptfoo.dev) for AI-powered testing of prompts. The testing suite evaluates prompt quality, consistency, and performance across different AI models.

### Prerequisites

Set up your API keys in your environment:

```bash
export OPENAI_API_KEY="your-openai-key"
export ANTHROPIC_API_KEY="your-anthropic-key" # optional
```

### Running Tests

```bash
# Run all prompt tests
pnpm test:prompts

# Run tests in watch mode for development
pnpm test:prompts:watch

# Generate summary report
pnpm test:prompts:summary

# Run tests for CI (no cache, structured output)
pnpm test:prompts:ci

# View test results in web UI
pnpm promptfoo:view
```

### Test Configuration

Tests are organized by prompt type in the `promptfoo/` directory:

- `summary-title.yaml` - Tests conversation title generation
- `language-detection.yaml` - Tests language detection accuracy
- `translation.yaml` - Tests translation quality between languages
- `emoji-picker.yaml` - Tests emoji selection for different contexts
- `knowledge-qa.yaml` - Tests Q\&A with knowledge base context

Each test configuration includes:

- Multiple test cases with different inputs
- Assertions for output validation (regex, JSON, custom logic)
- LLM-based rubric evaluation for semantic correctness
- Performance and cost monitoring

### Test Structure

Tests directly use the actual prompt chain functions from `src/chains/`. The TypeScript wrapper files in `promptfoo/prompts/` import and call the real chain functions, ensuring perfect synchronization.

```yaml
description: Test description
providers:
  - openai:gpt-4o-mini
  - openai:gpt-3.5-turbo
prompts:
  - file://prompts/summary-title.ts # Imports and uses src/chains/summaryTitle.ts
tests:
  - vars:
      messages: [...]
      locale: 'en-US'
    assert:
      - type: llm-rubric
        value: 'Expected behavior description'
      - type: contains
        value: 'expected text'
```

### Adding New Tests

1. Create a test configuration file in `promptfoo/`
2. Create a TypeScript wrapper in `promptfoo/prompts/` that imports and calls your chain function from `src/chains/`
3. Add the test to `promptfooconfig.yaml`
4. Run tests to validate

**Advantage**: The wrapper files automatically stay in sync with source code changes since they directly import and use the actual chain functions.

### Performance Monitoring

Tests include performance monitoring:

- Response time tracking
- Cost per request monitoring
- Quality score evaluation
- Cross-model consistency checks

### CI Integration

The `test:prompts:ci` script is designed for continuous integration:

- Structured JSON output for parsing
- No interactive prompts
- Clear pass/fail status codes
- Detailed error reporting

## Development

```bash
# Install dependencies
pnpm install

# Run unit tests
pnpm test

# Run prompt tests
pnpm test:prompts

# Run all tests
pnpm test && pnpm test:prompts
```

## Contributing

When adding new prompt chains:

1. Implement the prompt function in `src/chains/`
2. Add unit tests in `src/chains/__tests__/`
3. Create promptfoo tests in `promptfoo/`
4. Update this README with the new chain description

## Architecture

The package follows a layered architecture:

```
src/
├── chains/           # Prompt chain implementations
├── prompts/          # Prompt templates and utilities
└── index.ts          # Main exports

promptfoo/
├── prompts/          # Prompt implementations for testing
├── *.yaml           # Test configurations
└── results/          # Test output directory
```

## Best Practices

1. **Test Coverage**: Every prompt chain should have comprehensive promptfoo tests
2. **Multi-language**: Test prompts with multiple languages when applicable
3. **Edge Cases**: Include tests for edge cases and error conditions
4. **Performance**: Monitor cost and response time in tests
5. **Consistency**: Use consistent assertion patterns across tests
