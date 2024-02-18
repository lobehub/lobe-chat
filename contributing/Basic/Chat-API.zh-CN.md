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

在 `src/app/api/openai/chat/route.ts` 中，定义了一个处理 POST 请求的方法，主要负责从请求体中提取 `OpenAIChatStreamPayload` 类型的 payload，并使用 `createBizOpenAI` 函数根据请求和模型信息创建 OpenAI 实例。随后，该方法调用 `createChatCompletion` 来处理实际的会话，并返回响应结果。如果创建 OpenAI 实例过程中出现错误，则直接返回错误响应。

```ts
export const POST = async (req: Request) => {
  const payload = (await req.json()) as OpenAIChatStreamPayload;

  const openaiOrErrResponse = createBizOpenAI(req, payload.model);

  // if resOrOpenAI is a Response, it means there is an error,just return it
  if (openaiOrErrResponse instanceof Response) return openaiOrErrResponse;

  return createChatCompletion({ openai: openaiOrErrResponse, payload });
};
```

### 会话结果处理

而在 `src/app/api/openai/chat/createChatCompletion.ts` 文件中，`createChatCompletion` 方法主要负责与 OpenAI API 进行交互，处理会话请求。它首先对 payload 中的消息进行预处理，然后通过 `openai.chat.completions.create` 方法发送 API 请求，并使用 `OpenAIStream` 将返回的响应转换为流式格式。如果在 API 调用过程中出现错误，方法将生成并处理相应的错误响应。

```ts
import { OpenAIStream, StreamingTextResponse } from 'ai';

export const createChatCompletion = async ({ payload, openai }: CreateChatCompletionOptions) => {
  // 预处理消息
  const { messages, ...params } = payload;
  // 发送 API 请求
  try {
    const response = await openai.chat.completions.create(
      {
        messages,
        ...params,
        stream: true,
      } as unknown as OpenAI.ChatCompletionCreateParamsStreaming,
      { headers: { Accept: '*/*' } },
    );
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    // 检查错误是否为 OpenAI APIError
    if (error instanceof OpenAI.APIError) {
      let errorResult: any;
      // 如果错误是 OpenAI APIError，那么会有一个 error 对象
      if (error.error) {
        errorResult = error.error;
      } else if (error.cause) {
        errorResult = error.cause;
      }
      // 如果没有其他请求错误，错误对象是一个类似 Response 的对象
      else {
        errorResult = { headers: error.headers, stack: error.stack, status: error.status };
      }
      console.error(errorResult);
      // 返回错误响应
      return createErrorResponse(ChatErrorType.OpenAIBizError, {
        endpoint: openai.baseURL,
        error: errorResult,
      });
    }
    console.error(error);
    return createErrorResponse(ChatErrorType.InternalServerError, {
      endpoint: openai.baseURL,
      error: JSON.stringify(error),
    });
  }
};
```

## 前端实现

### 前端集成

在 `src/services/chat.ts` 文件中，我们定义了 `ChatService` 类。这个类提供了一些方法来处理与 OpenAI 聊天 API 的交互。

`createAssistantMessage` 方法用于创建一个新的助手消息。它接收一个包含插件、消息和其他参数的对象，以及一个可选的 `FetchOptions` 对象。这个方法会合并默认的代理配置和传入的参数，预处理消息和工具，然后调用 `getChatCompletion` 方法获取聊天完成任务。

`getChatCompletion` 方法用于获取聊天完成任务。它接收一个 `OpenAIChatStreamPayload` 对象和一个可选的 `FetchOptions` 对象。这个方法会合并默认的代理配置和传入的参数，然后发送 POST 请求到 OpenAI 的聊天 API。

`runPluginApi` 方法用于运行插件 API 并获取结果。它接收一个 `PluginRequestPayload` 对象和一个可选的 `FetchOptions` 对象。这个方法会从工具存储中获取状态，通过插件标识符获取插件设置和清单，然后发送 POST 请求到插件的网关 URL。

`fetchPresetTaskResult` 方法用于获取预设任务的结果。它使用 `fetchAIFactory` 工厂函数创建一个新的函数，这个函数接收一个聊天完成任务的参数，并返回一个 Promise。当 Promise 解析时，返回的结果是聊天完成任务的结果。

`processMessages` 方法用于处理聊天消息。它接收一个聊天消息数组，一个可选的模型名称，和一个可选的工具数组。这个方法会处理消息内容，将输入的 `messages` 数组映射为 `OpenAIChatMessage` 类型的数组，如果存在启用的工具，将工具的系统角色添加到系统消息中。

```ts
class ChatService {
  // 创建一个新的助手消息
  createAssistantMessage(params: object, fetchOptions?: FetchOptions) {
    // 实现细节...
  }

  // 获取聊天完成任务
  getChatCompletion(payload: OpenAIChatStreamPayload, fetchOptions?: FetchOptions) {
    // 实现细节...
  }

  // 运行插件 API 并获取结果
  runPluginApi(payload: PluginRequestPayload, fetchOptions?: FetchOptions) {
    // 实现细节...
  }

  // 获取预设任务的结果
  fetchPresetTaskResult() {
    // 实现细节...
  }

  // 处理聊天消息
  processMessages(messages: ChatMessage[], modelName?: string, tools?: Tool[]) {
    // 实现细节...
  }
}
```

### 使用流式获取结果

在 `src/utils/fetch.ts` 文件中，我们定义了 `fetchSSE` 方法，该方法使用流式方法获取数据，当读取到新的数据块时，会调用 `onMessageHandle` 回调函数处理数据块，进而实现打字机输出效果。

```ts
export const fetchSSE = async (fetchFn: () => Promise<Response>, options: FetchSSEOptions = {}) => {
  const response = await fetchFn();

  // 如果不 ok 说明有请求错误
  if (!response.ok) {
    const chatMessageError = await getMessageError(response);

    options.onErrorHandle?.(chatMessageError);
    return;
  }

  const returnRes = response.clone();

  const data = response.body;

  if (!data) return;
  let output = '';
  const reader = data.getReader();
  const decoder = new TextDecoder();

  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value, { stream: true });

    output += chunkValue;
    options.onMessageHandle?.(chunkValue);
  }

  await options?.onFinish?.(output);

  return returnRes;
};
```

以上就是 LobeChat 会话 API 的核心实现。在理解了这些核心代码的基础上，便可以进一步扩展和优化 LobeChat 的 AI 功能。
