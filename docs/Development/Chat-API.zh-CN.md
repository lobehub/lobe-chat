# 会话 API 实现逻辑

LobeChat 的大模型 AI 实现主要依赖于 OpenAI 的 API，包括后端的核心会话 API 和前端的集成 API。接下来，我们将分别介绍后端和前端的实现思路和代码。

#### TOC

- [后端实现](#后端实现)
  - [核心会话 API](#核心会话-api)
  - [会话结果处理](#会话结果处理)
- [前端实现](#前端实现)
  - [前端集成](#前端集成)
  - [使用流式获取结果](#使用流式获取结果)

## 后端实现

以下代码中移除了鉴权、错误处理等逻辑，仅保留了核心的主要功能逻辑。

### 核心会话 API

在 `src/app/api/openai/chat/handler.ts` 文件中，我们定义了 `POST` 方法，该方法首先从请求中解析出 payload 数据（即客户端发送的会话内容），然后从请求中获取 OpenAI 的授权信息。之后，我们创建一个 `openai` 对象，并调用 `createChatCompletion` 方法，该方法负责发送会话请求到 OpenAI 并返回结果。

```ts
export const POST = async (req: Request) => {
  const payload = await req.json();

  const { apiKey, endpoint } = getOpenAIAuthFromRequest(req);

  const openai = createOpenai(apiKey, endpoint);

  return createChatCompletion({ openai, payload });
};
```

### 会话结果处理

在 `src/app/api/openai/chat/createChatCompletion.ts` 文件中，我们定义了 `createChatCompletion` 方法，该方法首先对 payload 数据进行预处理，然后调用 OpenAI 的 `chat.completions.create` 方法发送请求，并使用 [Vercel AI SDK](https://sdk.vercel.ai/docs) 中的 `OpenAIStream` 将返回的结果转化为流式响应。

```ts
import { OpenAIStream, StreamingTextResponse } from 'ai';

export const createChatCompletion = async ({ payload, openai }: CreateChatCompletionOptions) => {
  const { messages, ...params } = payload;

  const formatMessages = messages.map((m) => ({
    content: m.content,
    name: m.name,
    role: m.role,
  }));

  const response = await openai.chat.completions.create(
    {
      messages: formatMessages,
      ...params,
      stream: true,
    },
    { headers: { Accept: '*/*' } },
  );
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
};
```

## 前端实现

### 前端集成

在 `src/services/chatModel.ts` 文件中，我们定义了 `fetchChatModel` 方法，该方法首先对 payload 数据进行前置处理，然后发送 POST 请求到后端的 `/chat` 接口，并将请求结果返回。

```ts
export const fetchChatModel = (
  { plugins: enabledPlugins, ...params }: Partial<OpenAIStreamPayload>,
  options?: FetchChatModelOptions,
) => {
  const payload = merge(
    {
      model: initialLobeAgentConfig.model,
      stream: true,
      ...initialLobeAgentConfig.params,
    },
    params,
  );

  const filterFunctions: ChatCompletionFunctions[] = pluginSelectors.enabledSchema(enabledPlugins)(
    usePluginStore.getState(),
  );

  const functions = filterFunctions.length === 0 ? undefined : filterFunctions;

  return fetch(OPENAI_URLS.chat, {
    body: JSON.stringify({ ...payload, functions }),
    headers: createHeaderWithOpenAI({ 'Content-Type': 'application/json' }),
    method: 'POST',
    signal: options?.signal,
  });
};
```

### 使用流式获取结果

在 `src/utils/fetch.ts` 文件中，我们定义了 `fetchSSE` 方法，该方法使用流式方法获取数据，当读取到新的数据块时，会调用 `onMessageHandle` 回调函数处理数据块，进而实现打字机输出效果。

```ts
export const fetchSSE = async (fetchFn: () => Promise<Response>, options: FetchSSEOptions = {}) => {
  const response = await fetchFn();

  if (!response.ok) {
    const chatMessageError = await getMessageError(response);

    options.onErrorHandle?.(chatMessageError);
    return;
  }

  const returnRes = response.clone();

  const data = response.body;

  if (!data) return;

  const reader = data.getReader();
  const decoder = new TextDecoder();

  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value);

    options.onMessageHandle?.(chunkValue);
  }

  return returnRes;
};
```

以上就是 LobeChat 会话 API 的核心实现。在理解了这些核心代码的基础上，便可以进一步扩展和优化 LobeChat 的 AI 功能。
