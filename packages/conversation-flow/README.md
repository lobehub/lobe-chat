# @lobechat/conversation-flow

A scalable, high-performance rendering engine for complex conversation flows.

## Features

- **Data-View Separation**: Clear separation between data storage and view representation
- **High Performance**: O(1) message lookups via messageMap
- **Deterministic Parsing**: Priority-based rule system eliminates ambiguity
- **Extensible**: Easy to add new display patterns
- **Type-safe**: Full TypeScript support

## Architecture

### Core Concepts

1. **messageMap**: Flat, normalized data source with O(1) access
2. **displayTree**: Semantic view model describing how to render
3. **parse**: The brain that transforms flat messages into displayTree

### Display Node Types

- **MessageNode**: Basic message display
- **GroupNode**: Aggregates assistant messages with their tool calls
- **CompareNode**: Side-by-side comparison of parallel outputs
- **BranchNode**: Multiple alternate conversation paths
- **ThreadNode**: Nested sub-conversations with their own context

## Usage

```typescript
import { parse, type DisplayNode } from '@lobechat/conversation-flow';
import type { UIChatMessage } from '@lobechat/types';

// Your messages from backend
const messages: UIChatMessage[] = [
  // ... your messages
];

// Parse into optimized structure
const { messageMap, displayTree } = parse(messages);

// Access any message in O(1)
const message = messageMap.get('message-id');

// Render using displayTree
function renderNode(node: DisplayNode) {
  switch (node.type) {
    case 'MESSAGE':
      return <MessageComponent messageId={node.messageId} />;
    case 'GROUP':
      return <GroupComponent assistant={node.assistantMessageId} tools={node.tools} />;
    case 'COMPARE':
      return <CompareView columns={node.columns} />;
    case 'BRANCH':
      return <BranchSelector branches={node.branches} active={node.activeBranchIndex} />;
    case 'THREAD':
      return <ThreadContainer threadId={node.threadId} children={node.children} />;
  }
}
```

## Parsing Phases

The parser works in three distinct phases:

1. **Indexing** - Builds helper maps (O(n) complexity)
   - messageMap: id → message
   - childrenMap: parentId → children ids
   - threadMap: threadId → thread messages

2. **Structuring** - Converts flat data to tree (O(n) complexity)
   - Filters main flow from threads
   - Builds idTree structure

3. **Transformation** - Applies business logic (O(n) complexity)
   - Priority-based pattern matching
   - Creates semantic DisplayNodes

## Testing

The package includes comprehensive test coverage with realistic test data:

```bash
# Run tests
pnpm test
```

### Test Fixtures

Test fixtures are located in `src/__tests__/fixtures/` and include:

- **Linear conversations** - Basic question-answer flows
- **Assistant with tools** - Tool call aggregation patterns
- **Branched conversations** - Multiple alternative responses
- **Compare mode** - Side-by-side model comparisons
- **Threaded conversations** - Nested sub-topics
- **Complex scenarios** - Combined patterns

All fixtures use realistic data structures matching production `UIChatMessage` format.

## License

MIT
