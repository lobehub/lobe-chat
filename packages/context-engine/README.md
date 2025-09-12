# @lobehub/context-engine

<div align="center">

Context Pipeline Engine for LobeChat

[![NPM version](https://img.shields.io/npm/v/@lobehub/context-engine?color=a991f1&labelColor=black&logo=npm&logoColor=white&style=flat-square)](https://www.npmjs.com/package/@lobehub/context-engine)
[![NPM downloads](https://img.shields.io/npm/dm/@lobehub/context-engine?color=56a6f7&labelColor=black&logo=npm&logoColor=white&style=flat-square)](https://www.npmjs.com/package/@lobehub/context-engine)

![](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

</div>

## 📦 Installation

To install @lobehub/context-engine, run the following command:

```bash
npm install @lobehub/context-engine
```

## 🤯 Usage

### Basic Pipeline Setup

```typescript
import {
  ContextEngine,
  HistoryInjector,
  HistoryTruncator,
  SystemRoleInjector,
} from '@lobehub/context-engine';

// Create processors
const processors = [
  new SystemRoleInjector('你是一个乐于助人的助手。'),
  new HistoryInjector(),
  new HistoryTruncator(20),
];

// Create and run pipeline
const pipeline = new ContextEngine({
  pipeline: processors,
});
const result = await pipeline.process({
  initialState: agentState,
  messages: [],
  metadata: { model: 'gpt-4', maxTokens: 4096 },
  isAborted: false,
});
```

### Advanced Usage with Custom Processors

```typescript
import { ContextProcessor, PipelineContext } from '@lobehub/context-engine';

// Create custom processor
class CustomContentProcessor implements ContextProcessor {
  name = 'CustomContentProcessor';

  async process(context: PipelineContext): Promise<PipelineContext> {
    // Your custom logic here
    return context;
  }
}

const pipeline = new ContextEngine({
  pipeline: [
    new SystemRoleInjector('你是一个专业的AI助手'),
    new HistoryInjector(),
    new CustomContentProcessor(),
    new HistoryTruncator(15),
  ],
});
```

## 🏗️ Architecture

The Context Engine follows the Pipeline pattern with the following core components:

- **PipelineContext**: Rich data structure flowing through the pipeline
- **ContextProcessor**: Standardized interface for processing stations
- **ContextEngine**: Main orchestrator that executes processors sequentially

### Processor Types

#### Injector Processors

- `SystemRoleInjector` - Inject system role messages
- `HistoryInjector` - Inject historical messages
- `FilesContextInjector` - Inject file context information
- `RAGContextInjector` - Inject RAG retrieval context
- And more...

#### Transformer Processors

- `HistoryTruncator` - Truncate messages based on count/tokens
- `ImageContentProcessor` - Process image content transformation
- `MessageRoleTransformer` - Transform message roles and formats
- `ToolMessageReorder` - Reorder tool call messages
- And more...

#### Validator Processors

- `ModelCapabilityValidator` - Validate model capabilities
- `EmptyMessageValidator` - Validate message content
- `HistoryCountValidator` - Validate history count

#### Optimizer Processors

- `HistorySummaryProcessor` - Process and inject history summaries
- `TokenBasedTruncator` - Smart truncation based on token limits

## 📖 API Reference

### Core Interfaces

```typescript
interface PipelineContext {
  readonly initialState: AgentState;
  messages: ChatMessage[];
  metadata: {
    model: string;
    maxTokens: number;
    currentTokenCount?: number;
    [key: string]: any;
  };
  isAborted: boolean;
  abortReason?: string;
}

interface ContextProcessor {
  name: string;
  process: (context: PipelineContext) => Promise<PipelineContext>;
}
```

## 🧪 Testing

The package includes comprehensive test coverage:

```bash
npm test              # Run all tests
npm run test:coverage # Run with coverage report
npm run test:update   # Update test snapshots
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📄 License

Copyright © 2024 [LobeHub](https://github.com/lobehub). <br />
This project is [MIT](../../LICENSE) licensed.
