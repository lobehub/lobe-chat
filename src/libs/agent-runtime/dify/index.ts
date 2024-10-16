import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload, ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { StreamingResponse } from '../utils/response';
import { DifyStream } from '../utils/streams/dify';
import urlJoin from 'url-join';

export interface DifyParams {
  baseUrl: string
  token?: string
  userId: string
  conversation_id?: string
}

export class LobeDify implements LobeRuntimeAI {
  difyParams: DifyParams

  constructor({ baseUrl, token, userId, conversation_id }: Partial<DifyParams>) {
    if (!(userId && token))
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);

    this.difyParams = {
      baseUrl: baseUrl ?? 'https://api.dify.ai/v1',
      conversation_id,
      userId,
      token,
    }
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    const { messages } = payload
    // Get the last message as query
    const query = messages.at(-1)
    if (!query) {
      throw new Error('[Dify]: No query')
    }
    let textQuery = ''
    if (typeof query.content === 'string')
      textQuery = query.content
    else
      throw new Error('[Dify]: Unsupport user message type')

    const response = await fetch(urlJoin(this.difyParams.baseUrl, '/chat-messages'), {
      method: 'POST',
      // signal: options?.signal,
      headers: {
        Authorization: `Bearer ${this.difyParams.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: textQuery,
        user: this.difyParams.userId,
        conversation_id: this.difyParams?.conversation_id ?? '',
        response_mode: 'streaming',
        inputs: [],
        files: [],
      }),
    })
    if (!response.body || !response.ok) {
      throw AgentRuntimeError.chat({
        error: {
          status: response.status,
          statusText: response.statusText,
        },
        errorType: AgentRuntimeErrorType.ProviderBizError,
        provider: ModelProvider.Dify,
      });
    }
    const [prod, _] = response.body.tee();
    return StreamingResponse(DifyStream(prod), { headers: options?.headers });
  }
}

export default LobeDify;
