# Context Engine 架构设计

## 概述

Context Engine 是一个灵活的消息处理管道系统，用于在 AI 对话中动态管理和处理上下文信息。它提供了一种可扩展的方式来注入、转换和验证消息流。

## 核心概念

### 1. 处理器（Processor）

处理器是 Context Engine 的基本单元，负责对消息进行特定的处理操作。

#### 处理器分类

根据功能职责，处理器分为以下几类：

1. **注入器（Injector）**
   - 职责：向消息流中添加新的上下文信息
   - 示例：SystemRoleInjector、HistoryInjector、RAGContextInjector

2. **转换器（Transformer）**
   - 职责：修改现有消息的内容或结构
   - 示例：MessageRoleTransformer、ImageContentProcessor

3. **截断器（Truncator）**
   - 职责：根据特定规则裁剪消息内容
   - 示例：HistoryTruncator、TokenBasedTruncator

4. **验证器（Validator）**
   - 职责：验证消息是否符合特定要求
   - 示例：ModelCapabilityValidator

5. **重排器（Reorderer）**
   - 职责：调整消息的顺序
   - 示例：ToolMessageReorder

### 2. 管道（Pipeline）

管道是一系列处理器的有序组合，消息流经管道时会被逐个处理器处理。

```typescript
interface Pipeline {
  // 添加处理器到管道
  add(processor: BaseProcessor): Pipeline;
  
  // 执行管道处理
  execute(context: ProcessorContext): Promise<ProcessorContext>;
  
  // 获取管道中的所有处理器
  getProcessors(): BaseProcessor[];
}
```

### 3. 上下文（Context）

上下文包含了处理器需要的所有信息：

```typescript
interface ProcessorContext {
  messages: Message[];           // 消息列表
  metadata?: ProcessorMetadata;  // 元数据
  variables?: Record<string, any>; // 变量
  abortSignal?: AbortSignal;    // 中止信号
}
```

## 架构设计

### 类层次结构

```
BaseProcessor (抽象基类)
├── BaseInjector (注入器基类)
│   ├── SystemRoleInjector
│   ├── HistoryInjector
│   ├── RAGContextInjector
│   └── ...
├── BaseTransformer (转换器基类)
│   ├── MessageRoleTransformer
│   └── ImageContentProcessor
├── BaseTruncator (截断器基类)
│   ├── HistoryTruncator
│   └── TokenBasedTruncator
├── BaseValidator (验证器基类)
│   └── ModelCapabilityValidator
└── BaseReorderer (重排器基类)
    └── ToolMessageReorder
```

### 核心接口设计

#### BaseProcessor

```typescript
abstract class BaseProcessor {
  // 处理器类型
  abstract readonly type: ProcessorType;
  
  // 处理器名称
  abstract readonly name: string;
  
  // 主处理方法
  async process(context: ProcessorContext): Promise<ProcessorContext> {
    // 1. 前置验证
    this.validateInput(context);
    
    // 2. 执行处理
    const result = await this.doProcess(context);
    
    // 3. 后置验证
    this.validateOutput(result);
    
    return result;
  }
  
  // 子类实现的核心处理逻辑
  protected abstract doProcess(context: ProcessorContext): Promise<ProcessorContext>;
  
  // 输入验证（可选覆盖）
  protected validateInput(context: ProcessorContext): void {}
  
  // 输出验证（可选覆盖）
  protected validateOutput(context: ProcessorContext): void {}
}
```

#### BaseInjector

```typescript
abstract class BaseInjector extends BaseProcessor {
  readonly type = ProcessorType.Injector;
  
  protected async doProcess(context: ProcessorContext): Promise<ProcessorContext> {
    // 1. 判断是否需要注入
    if (!this.shouldInject(context)) {
      return context;
    }
    
    // 2. 构建注入内容
    const content = await this.buildContent(context);
    
    // 3. 创建消息
    const message = this.createMessage(content, context);
    
    // 4. 确定注入位置
    const position = this.getInjectionPosition(context);
    
    // 5. 执行注入
    return this.inject(context, message, position);
  }
  
  // 子类需要实现的方法
  protected abstract shouldInject(context: ProcessorContext): boolean;
  protected abstract buildContent(context: ProcessorContext): Promise<string>;
  
  // 可选覆盖的方法
  protected getInjectionPosition(context: ProcessorContext): number {
    return 0; // 默认注入到开头
  }
  
  protected createMessage(content: string, context: ProcessorContext): Message {
    return {
      role: 'system',
      content,
      metadata: { injectedBy: this.name }
    };
  }
}
```

## 使用方式

### 1. 创建自定义处理器

```typescript
// 创建一个自定义注入器
class CustomContextInjector extends BaseInjector {
  readonly name = 'custom-context-injector';
  
  protected shouldInject(context: ProcessorContext): boolean {
    // 判断逻辑
    return !context.messages.some(msg => 
      msg.metadata?.injectedBy === this.name
    );
  }
  
  protected async buildContent(context: ProcessorContext): Promise<string> {
    // 构建内容逻辑
    return `Custom context: ${context.variables?.customValue}`;
  }
}
```

### 2. 构建处理管道

```typescript
// 使用工厂模式创建管道
const pipeline = createPipeline()
  .add(new SystemRoleInjector())
  .add(new HistoryInjector({ maxMessages: 10 }))
  .add(new CustomContextInjector())
  .add(new MessageRoleTransformer())
  .add(new TokenBasedTruncator({ maxTokens: 4000 }))
  .add(new ModelCapabilityValidator());

// 执行管道
const result = await pipeline.execute({
  messages: initialMessages,
  variables: { customValue: 'test' },
  metadata: { model: 'gpt-4' }
});
```

### 3. 条件处理

```typescript
// 基于条件的管道构建
const pipeline = createPipeline();

if (config.enableRAG) {
  pipeline.add(new RAGContextInjector());
}

if (config.enableSearch) {
  pipeline.add(new SearchContextInjector());
}

// 始终添加的处理器
pipeline
  .add(new HistoryTruncator())
  .add(new ModelCapabilityValidator());
```

### 4. 错误处理

```typescript
try {
  const result = await pipeline.execute(context);
} catch (error) {
  if (error instanceof ProcessorError) {
    console.error(`Processor ${error.processorName} failed:`, error.message);
  } else if (error instanceof PipelineError) {
    console.error('Pipeline execution failed:', error.message);
  }
}
```

## 配置管理

### 处理器配置

每个处理器可以接受特定的配置选项：

```typescript
interface ProcessorConfig {
  // 通用配置
  enabled?: boolean;
  priority?: number;
  
  // 处理器特定配置
  [key: string]: any;
}

// 示例：历史注入器配置
interface HistoryInjectorConfig extends ProcessorConfig {
  maxMessages?: number;
  includeSystemMessages?: boolean;
  preserveTools?: boolean;
}
```

### 管道配置

```typescript
interface PipelineConfig {
  processors: Array<{
    type: string;
    config?: ProcessorConfig;
  }>;
  
  // 全局配置
  abortOnError?: boolean;
  timeout?: number;
}

// 从配置创建管道
const pipeline = createPipelineFromConfig({
  processors: [
    { type: 'system-role', config: { enabled: true } },
    { type: 'history', config: { maxMessages: 20 } },
    { type: 'rag', config: { threshold: 0.7 } }
  ],
  abortOnError: false,
  timeout: 30000
});
```

## 最佳实践

### 1. 单一职责原则
每个处理器应该只负责一种特定的处理任务。

### 2. 可配置性
处理器应该通过配置参数来控制行为，而不是硬编码。

### 3. 错误处理
- 使用具体的错误类型
- 提供有意义的错误信息
- 考虑错误恢复策略

### 4. 性能优化
- 避免不必要的消息复制
- 使用流式处理处理大量数据
- 实现适当的缓存机制

### 5. 测试
- 为每个处理器编写单元测试
- 测试处理器组合的集成测试
- 边界条件和错误场景测试

## 扩展机制

### 1. 自定义处理器类型

```typescript
// 定义新的处理器类型
enum CustomProcessorType {
  Analyzer = 'analyzer',
  Enhancer = 'enhancer'
}

// 创建对应的基类
abstract class BaseAnalyzer extends BaseProcessor {
  readonly type = CustomProcessorType.Analyzer;
  
  // 分析器特定的方法
  protected abstract analyze(messages: Message[]): AnalysisResult;
}
```

### 2. 处理器组合

```typescript
// 创建复合处理器
class CompositeProcessor extends BaseProcessor {
  constructor(private processors: BaseProcessor[]) {
    super();
  }
  
  protected async doProcess(context: ProcessorContext): Promise<ProcessorContext> {
    let result = context;
    for (const processor of this.processors) {
      result = await processor.process(result);
    }
    return result;
  }
}
```

### 3. 插件系统

```typescript
interface ProcessorPlugin {
  name: string;
  version: string;
  processors: ProcessorDefinition[];
}

// 注册插件
registry.registerPlugin({
  name: 'custom-processors',
  version: '1.0.0',
  processors: [
    { type: 'custom-injector', factory: () => new CustomInjector() },
    { type: 'custom-validator', factory: () => new CustomValidator() }
  ]
});
```

## 迁移指南

### 从当前架构迁移

1. **BaseProvider 迁移到 BaseInjector**
   ```typescript
   // 旧代码
   class MyProvider extends BaseProvider {
     doProcess(context) {
       // 实现
     }
   }
   
   // 新代码
   class MyInjector extends BaseInjector {
     shouldInject(context) {
       // 判断逻辑
     }
     
     buildContent(context) {
       // 构建内容
     }
   }
   ```

2. **处理器分类**
   - 将现有处理器按功能分类
   - 继承对应的基类
   - 实现必要的抽象方法

3. **配置迁移**
   - 统一配置格式
   - 支持向后兼容
   - 提供迁移工具

## 总结

新的 Context Engine 架构提供了：

1. **清晰的分层结构**：基于功能的处理器分类
2. **灵活的扩展机制**：易于添加新的处理器类型
3. **强大的组合能力**：通过管道组合实现复杂功能
4. **完善的错误处理**：细粒度的错误类型和恢复策略
5. **优秀的可测试性**：模块化设计便于单元测试

这种设计使得 Context Engine 更加模块化、可维护和可扩展，能够更好地满足不同场景下的上下文处理需求。