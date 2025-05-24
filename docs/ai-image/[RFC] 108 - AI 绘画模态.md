## 背景

- <https://github.com/lobehub/lobe-chat/discussions/4741>
- progress: <https://github.com/lobehub/lobe-chat/pull/7920>

## 一期目标

AI 绘画场景下基本的生图功能：根据用户的输入和配置生成图片。

同时：

- 支持多 providers 和 models，率先支持 fal.ai 和 openai gpt4o-image
- 可扩展通用的异步任务架构，已有可参考的是文件分块和向量化

后续计划：

- 绘图模型 pricing 显示
- 移动端界面
- 支持更多 provider
  - midjourney discord/TTAPI
  - etc
- prompt translate/enhance
- 绘画模态下实现 LLM 辅助生图
- 对比多个模型生成
- 图片语义化搜索
  - 一期不支持，主要考虑到图片向量化需要自部署 [clip](https://huggingface.co/openai/clip-vit-large-patch14) 模型或者引入[第三方模型服务](https://replicate.com/andreasjansson/clip-features)，但感觉基于 prompt 的搜索好像满足了大多数场景。简单来说就是成本比较高，但是需求感觉不强烈
  - 但需要了解的是，后序如果要支持，数据迁移是个问题

## 界面

### 桌面端

示意界面如下：\[[v0](https://v0.dev/chat/ai-painting-interface-3h7HmcJkb25)]\(<https://v0.dev/chat/ai-painting-interface-3h7HmcJkb25>)

<img width="1898" alt="image-20250416153219752" src="https://github.com/user-attachments/assets/376458fe-651a-4ec2-8f52-85c79d279b10" />

一期配置面板目标就是能用，后续可以做的更易用，图形化一些， 参考 <https://shots.so/。>

- 左边是配置面板，包括模型选择，生成配置参数。provider 设置直接在现有的 LLM provider 配置那新增 fal.ai 等
- 中间主体是生成列表
- 中间下方是 prompt 输入框
- 右边是 generation topics 列表。点击生成按钮时，如果当前没有生成记录会创建一个 generation topic，点开一个 topic 下方展示所有生成批次的缩略图，每个缩略图取批次内第一张图，类似 figma

<img width="269" alt="image" src="https://github.com/user-attachments/assets/4ba01663-05f6-4026-9038-63136335e1d3" />

### 移动端

参考了即梦 app 的设计：

<img width="814" alt="image" src="https://github.com/user-attachments/assets/c3bc1f71-d1ee-4ef6-a119-19f0d14752b8" />

## 数据库设计

### providers 管理

统一在现有的 AI 服务商设置那里管理：

<img width="1424" alt="image-20250518203608853" src="https://github.com/user-attachments/assets/947d38c9-7cf4-419d-a169-8a3c919dd6f9" />

### 多 providers 架构

项目中已经存在 AiProvider 和 AiModel 两张表。

#### AiProvider

```typescript
// src/database/schemas/aiInfra.ts
export const aiProviders = pgTable(
  'ai_providers',
  {
    id: varchar('id', { length: 64 }).notNull(),
    name: text('name'),

    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    sort: integer('sort'),
    enabled: boolean('enabled'),
    fetchOnClient: boolean('fetch_on_client'),
    checkModel: text('check_model'),
    logo: text('logo'),
    description: text('description'),

    // need to be encrypted
    keyVaults: text('key_vaults'),
    source: varchar('source', { enum: ['builtin', 'custom'], length: 20 }),
    // 1. 扩充 AiProviderSettings 字段
    // 2. baseSettings + type 字段 + 新类型，例如 AiLLMProviderSettings | AiImageProiderSettings
    settings: jsonb('settings')
      .$defaultFn(() => ({}))
      .$type<AiProviderSettings>(),

    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.id, table.userId] })],
);
```

- 目前看下来暂不需要调整 schema，现有的字段够用
- 一期暂不支持添加自定义 provider
- 不在 provider 层面区分模态，在 model 层面区分，model 表有个 type 字段可以区分

#### AiModel

```typescript
export const aiModels = pgTable(
  'ai_models',
  {
    id: varchar('id', { length: 150 }).notNull(),
    displayName: varchar('display_name', { length: 200 }),
    description: text('description'),
    organization: varchar('organization', { length: 100 }),
    enabled: boolean('enabled'),
    providerId: varchar('provider_id', { length: 64 }).notNull(),
    type: varchar('type', { length: 20 }).default('chat').notNull(),
    sort: integer('sort'),

    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    // 可能是动态的需要代码实现，扣费逻辑
    // 可以在 agentRuntime 中使用代码去实现
    pricing: jsonb('pricing'),
    // AI 绘画模型希望保存 schema
    parameters: jsonb('parameters').default({}),
    config: jsonb('config'),
    abilities: jsonb('abilities').default({}),
    contextWindowTokens: integer('context_window_tokens'),
    source: varchar('source', { enum: ['remote', 'custom', 'builtin'], length: 20 }),
    releasedAt: varchar('released_at', { length: 10 }),

    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.id, table.providerId, table.userId] })],
);

// LLM pricing
{
    pricing: {
      audioInput: 100,
      audioOutput: 200,
      cachedAudioInput: 20,
      cachedInput: 2.5,
      input: 5,
      output: 20,
    }
}
```

- 目前看下来一期也不需要调整 schema，现有的字段够用
- aiModel 的 type 字段现在只有 chat 这一个值，引入 ai 绘画针对 ai 绘画场景应该是 image， 更好的做法可能是使用 pg 枚举，考虑到这个字段可能会持续变化和迁移成本，还是决定使用 varchar
- parameters 我看目前其它 ai 模型都是没有用到这个字段， 对于 ai 绘画就很重要了，它是生成左侧配置面板的依据，目前是希望存储 JSON Schema，这样可以充分描述侧边栏支持的配置项，给用户提供更好的交互。例如对于 cfgScale，可以描述 step/min/max，使用 slider 渲染 cfgScale 参数就很有用
- pricing：目前 LLM 是一个对象，对 AI 绘画场景已有的字段都不适用，
  - 对于 LLM 原生支持出图的模型，例如 dalle, \[[gpt4o-image](https://platform.openai.com/docs/pricing#image-generation)]\(<https://platform.openai.com/docs/pricing#image-generation>) 这类是按 token 计算的，dalle 输入 text 和 image 不算 cost，gpt4o-image 输入 text 和 image 也参数 cost 计算。不同的尺寸也不是严格按像素大小算差价的，例如同样 low quality, 1024 x 1024 是 $0.011 $/1M token, 而 1024 x 1536 不是 0.011 x (1536 / 1024) 得到的 0.0165，而是 0.016，相对于折扣掉第三位小数后的价格。
  - 对于大多数类 diffusion 架构的模型，一般是按张数算钱的，但是根据配置的不同单张的价格可能，不同例如 <https://fal.ai/models/fal-ai/recraft-v3/playground，recraft> 模型 style 选择 vector 类的和别的价格不一样
  - 结论：
    - 可能还是得在 agentRuntime 暴露一个方法让用户根据生成参数计算当前 cost
    - 这个不影响用户使用，放二期实现

### 生成系统

其实就是中间这个生成列表的数据库设计。

- 一个 generationTopic 下有多个 generationBatch
- 一个 generationBatch 下有多个 generation
- 每个 generation 有它的 asset
  - generation 需要保存它自己推理相关的信息，例如用于 webhook 识别任务的 inferenceId，当前生成状态是 pending 还是 failed
  - generation 需要保存用户各种操作相关字段，例如收藏，发布状态
  - asset 存储生成的文件信息，例如图片模态下，存储 width/height/originImageUrl/imageUrl/thumbnailUrl。originImageUrl 指的是 apiProvider 它们返回得图片 cdn 地址，一般很快会过期，我们需要保存到我们自己的 oss。
    - 前端渲染图片时需要考虑 oss 加密场景下怎么获取完整 url
    - 因为不是所有 oss 都支持 url 参数 resize，需要自己实现生成缩略图
      - 生成缩略图策略：有一边超过 512，就裁到 512 x 512 范围内，并且转成 webp

#### GenerationBatch

抽象一个生成批次。

<img width="1098" alt="image-20250416180507201" src="https://github.com/user-attachments/assets/41594519-d9d1-400c-a246-78ef8bbf53f8" />

```typescript
export const generationBatches = pgTable(
  'generation_batches',
  {
    id: varchar('id', { length: 64 }).notNull(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    generationTopicId: varchar('generation_topic_id', { length: 64 }).notNull(),
    // 一期只做文生图这俩字段到需要用到的时候再加不迟
    // type: pgEnum('generation_type', ['image', 'video', 'upscale']).notNull(),
    // category: pgEnum('generation_type', ['textToImage', 'imageToImage',]).notNull(),

    // 下面这些也是模型配置，考虑到用户搜索过滤需求，放顶层字段方便加索引
    provider: text().notNull()
    model: text().notNull();
    prompt: text().notNull();
    // 一期先不做 prompt 翻译
    // translatedPrompt: text();
    width: integer();
    height: integer()；
    ratio: varchar64()

    // 存储这个生成批次的配置，大多数情况下，一个批次内所有生成的配置都是一样的
    config: jsonb('config'),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.id, table.userId] })],
);

```

图片的语义化搜索：

- elastic search 不考虑，自部署太麻烦
- postgress 自带的向量搜索
  - generation 增加一个 imageEmbedding 字段，vector 类型，图片生成之后生成向量（需要使用一个合适的图片转向量工具）

#### Generation

单张图的生成。

- 存储对 generation 的用户操作，例如收藏
- 推理相关使用额外的表 async task

重试逻辑：generation 保持不变，生成新的 async task

各种 prompt：

- prompt: 用户输入的 prompt
- translatedPrompt: 用户输英语以外的语言，翻译成英文的 prompt, 一个批次四张图都一样，存到 generationBatch 上
- enhancedPrompt: 一个批次四张图，每张图都要走 LLM enhance 一次，每次 enhance 结果不一样，存到 genration 上
- negativePrompt

```typescript
export const generations = pgTable(
  'generations',
  {
    id: varchar('id', { length: 64 }).notNull(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    generationBatchId: varchar('generation_batch_id', { length: 64 }).notNull(),

    // inference related
    // 复用已有的 async_tasks 表
    asyncTaskId: text('async_task_id')
      .references(() => asyncTasks.id, { onDelete: 'cascade' })
      .notNull(),

    // user actions
    // 收藏
    favorite: boolean().default(false).notNull(),
    // 发布到 gallery
    published: boolean().default(false).notNull(),

    // 每个 generation 独有的配置，比较少，暂时直接放顶层
    seed: text();
    // 后期做这个功能时再加
    // ehancedPrompt: text();

    // 直接对图片的 upscale 可以考虑把升级后的地址放 asset
    asset: jsonb('asset'),
      // { imageUrl: '', thumbnailUrl: '', image2x: '', width: 1024, height: 1024 }

		imageEmbedding: vector();
    ...timestamps,
  },
);


export const asyncTasks = pgTable('async_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: text('type'),

  status: text('status'),
  error: jsonb('error'),

  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  duration: integer('duration'),

  // 需要新增加
  inferenceId: varchar({ length: 128 }).notNull(), // webhook 需要用
  // 推理结束的时间，不论成功或失败
  finalizedAt: timestamp(),

  ...timestamps,
});
```

#### GenerationTopic

- 图片是根据用户已经生成的图片（例如第一张）裁剪到 128 x 128 的，不复用 generation 的，因为 generation 可能被删除
- 点开 topic 显示的 generationBatch 缩略图不需要生成，直接用 generationBatch 的第一张图的缩略图

```typescript
const generationTopics = pgTable(
  'generation_topics',
  {
    id: varchar('id', { length: 64 }).notNull(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    // 简要描述主题内容, LLM 生成，复用 chat 的 topic title 生成
    title: text('title').notNull(),
    imageUrl: text('image_url'),
    model: text('model'),
    provider: text('provider'),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.id, table.userId] })],
);
```

## Midjourney

目前调用 provider 的时候预期调用方式是 4 张图调用 4 次推理请求，webhook 回调的时候回调 4 次，绝大多数 AI 绘画 provider 都可以实现。

midjourney 它的生成和其它生成不一样，webhook 回调返回得是一张图包含四个缩略图，在这种情况下，希望 provider 在 agentRuntime 层自己做切成 4 张图的逻辑，或者我们自己提供一个切图服务给它们调用。

## 多 provider 适配

和 LLM 不太一样的是，图片生成和视频生成大多都比较耗时，一般走的是 webhook 回调，目前 agentRuntime 可能不足以满足需求。

### 方案一

在增加 provider 的时候增加一个对应的 webhook 路由，在其中处理对应 provider 的回调逻辑。

### 方案二

使用单一 webhook 路由，每个 providerRuntime 提供 match 方法和 handle 方法。match 方法返回 true 就调用对应 handle 方法处理生成回调。

结论：这块得结合异步任务架构一起讨论。

## AI 绘画入口

我觉得最方便最不和现有设计冲突的地方还是直接左侧侧边栏加一个 item，点击后打开新页面。或者暂时可以这样设计，后序引入 projects 概念后整合进 projects。

<img width="1424" alt="image-20250417105736776" src="https://github.com/user-attachments/assets/3e9bc2d6-bca0-4392-8427-b5d70e8498ab" />

## AI Image 参数标准化

不同的 ai image provider 的模型参数名称，case 都不一样，例如 [fal](https://fal.ai/models/fal-ai/flux/dev) 的 cfg 参数是 guidance_scale，但是 [runWare](https://my.runware.ai/playground?modelAIR=runware%3A100%401&modelArchitecture=flux1s) 的参数又是 CFGScale。
需要定制一套统一的标准化的参数名称。

好处:

- 希望给用户呈现在不同 provider 的不同 models 下能有一致的 UI，例如：选 fal 的 flux 和 runware 的 flux 对应 cfg 参数名都是 cfgScale，配置面板渲染配置 UI 的时候读到 cfgScale 参数显示的 label 就统一都是：Prompt Adherence (CFG）。如若不然，那就是根据 params schema 的 description 去渲染 label，description 不同，对应 label 就不同。用户就会有不一致的交互
- 前端可以针对标准化参数做 UI 优化，后端数据库针对参数建索引

一期支持的参数:

- prompt: string
- width/height: integer
- ratio: string
- cfg: number
- steps: number
- seed: number

考虑可以借鉴 comfyUI 官方节点的参数名称：

<img width="1103" alt="image" src="https://github.com/user-attachments/assets/2b23698f-c438-47c4-bbc0-cafed477b3f0" />

### 模型参数示例

新增一个模型支持需要到对应的文件夹新增 json 文件，例如 fal 新增 flux-schnell 支持需要新增 `src/config/paramsSchemas/fal/flux-schnell.json`：

```json
{
  "properties": {
    "prompt": {},
    "width": {
      "minimum": 512,
      "maximum": 1536,
      "step": 1,
      "default": 1024
    },
    "height": {
      "minimum": 512,
      "maximum": 1536,
      "step": 1,
      "default": 1024
    },
    "steps": {
      "minimum": 1,
      "maximum": 12,
      "default": 4
    },
    "seed": {}
  },
  "required": ["prompt"],
  "type": "object"
}
```

然后在 `src/config/aiModels/fal.ts` 中使用：

```typescript
import FluxSchnellParamsSchema from '../paramsSchemas/fal/flux-schnell.json';

const googleChatModels: AIImageModelCard[] = [
  {
    description: '...',
    displayName: 'FLUX.1 [schnell]',
    enabled: true,
    id: 'flux/schnell',
    parameters: FluxSchnellParamsSchema,
    releasedAt: '2024-08-01',
    type: 'image',
  },
];
```
