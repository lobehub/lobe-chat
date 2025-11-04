# Test Fixtures

This directory contains realistic test data for the conversation flow parser.

## Available Fixtures

### `linear-conversation.json`
A simple question-answer conversation demonstrating basic linear flow.

**Structure:**
- User asks about writing a Python function
- Assistant provides code example with usage and performance metrics
- User requests test cases
- Assistant adds test cases

**Tests:** Basic message chaining, usage/performance data preservation

### `assistant-with-tools.json`
Demonstrates the Group pattern where an assistant message has multiple tool calls.

**Structure:**
- User asks about weather in two cities
- Assistant initiates tool calls for both locations
- Two tool messages return with results and plugin state

**Tests:** GroupNode creation, tool call aggregation

### `branched-conversation.json`
Shows multiple alternative responses (branches) from the same parent message.

**Structure:**
- User requests a haiku
- Three different haiku responses (branches)
- User selects one and continues conversation

**Tests:** BranchNode creation, branch navigation

### `compare-mode.json`
Demonstrates side-by-side comparison of different model responses.

**Structure:**
- User message with `metadata.presentation.mode = 'compare'`
- GPT-4 response analyzing bubble sort
- Claude response analyzing quicksort

**Tests:** CompareNode creation, metadata-driven rendering

### `thread-conversation.json`
Shows a conversation with nested sub-topics (threads).

**Structure:**
- Main topic: React hooks explanation
- Sub-thread: Detailed discussion about specific hooks (with threadId)
- Continuation in main flow

**Tests:** ThreadNode handling, thread isolation

### `complex-scenario.json`
Combines multiple patterns in a realistic debugging scenario.

**Structure:**
- User requests debugging help
- Assistant uses tools (linter, test runner)
- Tool error occurs with pluginError
- User provides code
- Multiple alternative solutions (branches)

**Tests:** Combined patterns, error handling

## Data Structure

All fixtures follow the `UIChatMessage` type from `@lobechat/types`:

```typescript
{
  id: string;                    // Unique message identifier
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: string;               // Message content
  parentId: string | null;       // Parent message for threading
  createdAt: number;            // Unix timestamp
  updatedAt: number;            // Unix timestamp
  meta: object;                 // Metadata object

  // Optional fields
  threadId?: string;            // For threaded conversations
  tool_call_id?: string;        // For tool response messages
  tools?: ChatToolPayload[];    // Tool calls made by assistant
  pluginState?: any;            // Tool execution state
  pluginError?: any;            // Tool execution errors

  // Separate usage and performance fields
  usage?: {                     // Token usage metrics
    totalInputTokens?: number;
    totalOutputTokens?: number;
    totalTokens?: number;
    cost?: number;              // Cost in dollars
    inputCachedTokens?: number;
    inputTextTokens?: number;
    inputImageTokens?: number;
    outputTextTokens?: number;
    outputReasoningTokens?: number;
    // ... other token breakdown fields
  };

  performance?: {               // Performance metrics
    tps?: number;               // Tokens per second
    ttft?: number;              // Time to first token (ms)
    duration?: number;          // Generation duration (ms)
    latency?: number;           // Total latency (ms)
  };

  metadata?: {                  // Additional metadata
    presentation?: {            // Rendering hints (typically on user messages)
      mode?: 'compare' | 'normal';
    };
  };

  model?: string;               // Model used (e.g., 'gpt-4')
  provider?: string;            // Provider (e.g., 'openai')
}
```

## Key Points

1. **Usage and Performance are Separate**: Unlike raw API responses, `UIChatMessage` separates token usage into `usage` field and performance metrics into `performance` field.

2. **Metadata for Rendering Hints**: The `metadata` field is used for rendering hints like `presentation.mode`, typically set on user messages to control how children are displayed.

3. **Tool Integration**: Tool calls use `tools` array on assistant messages, and responses use `tool_call_id` to link back.

## Usage in Tests

```typescript
import { fixtures } from './fixtures';

// Load a specific fixture
const messages = fixtures.linearConversation;
const result = parse(messages);

// Access usage data
const msg = result.messageMap.get('msg-002');
console.log(msg.usage?.totalTokens);        // 180
console.log(msg.performance?.tps);          // 52.0
```

## Adding New Fixtures

When adding new fixtures:

1. Create a new `.json` file in this directory
2. Follow the `UIChatMessage` structure with **separate** `usage` and `performance` fields
3. Include realistic data:
   - Actual message content (not "test message 1")
   - Proper timestamps
   - Realistic usage and performance values
   - Tool calls with proper structure
4. Add the import to `index.ts`
5. Document it in this README

## Design Principles

These fixtures are designed to be:

- **Realistic**: Based on actual conversation patterns
- **Complete**: Include all relevant fields (usage, performance, metadata)
- **Varied**: Cover different conversation styles and patterns
- **Maintainable**: Easy to understand and modify
- **Type-safe**: Compatible with `UIChatMessage` type
