# Conversation API Implementation Logic

The implementation of LobeChat's large model AI mainly relies on OpenAI's API, including the core conversation API on the backend and the integrated API on the frontend. Next, we will introduce the implementation approach and code for the backend and frontend separately.

#### TOC

- [Backend Implementation](#backend-implementation)
  - [Core Conversation API](#core-conversation-api)
  - [Conversation Result Processing](#conversation-result-processing)
- [Frontend Implementation](#frontend-implementation)
  - [Frontend Integration](#frontend-integration)
  - [Using Streaming to Get Results](#using-streaming-to-get-results)

## Backend Implementation

The following code removes authentication, error handling, and other logic, retaining only the core functionality logic.

### Core Conversation API

In the file `src/app/api/openai/chat/handler.ts`, we define a `POST` method, which first parses the payload data from the request (i.e., the conversation content sent by the client), and then retrieves the authorization information from the request. Then, we create an `openai` object and call the `createChatCompletion` method, which is responsible for sending the conversation request to OpenAI and returning the result.

```ts
export const POST = async (req: Request) => {
  const payload = await req.json();

  const { apiKey, endpoint } = getOpenAIAuthFromRequest(req);

  const openai = createOpenai(apiKey, endpoint);

  return createChatCompletion({ openai, payload });
};
```

### Conversation Result Processing

In the file `src/app/api/openai/chat/createChatCompletion.ts`, we define the `createChatCompletion` method, which first preprocesses the payload data, then calls OpenAI's `chat.completions.create` method to send the request, and uses the `OpenAIStream` from the [Vercel AI SDK](https://sdk.vercel.ai/docs) to convert the returned result into a streaming response.

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

## Frontend Implementation

### Frontend Integration

In the `src/services/chatModel.ts` file, we define the `fetchChatModel` method, which first preprocesses the payload data, then sends a POST request to the `/chat` endpoint on the backend, and returns the request result.

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

### Using Streaming to Get Results

In the `src/utils/fetch.ts` file, we define the `fetchSSE` method, which uses a streaming approach to retrieve data. When a new data chunk is read, it calls the `onMessageHandle` callback function to process the data chunk, achieving a typewriter-like output effect.

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

The above is the core implementation of the LobeChat session API. With an understanding of these core codes, further expansion and optimization of LobeChat's AI functionality can be achieved.
