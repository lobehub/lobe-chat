import OpenAI from 'openai';

import { LobeRuntimeAI } from '@/libs/agent-runtime';
import { ChatStreamPayload } from '@/types/openai/chat';

import { createChatCompletion } from './chat';
import { createBizOpenAI } from './createBizOpenAI';

export class LobeOpenAI implements LobeRuntimeAI {
  private _llm: OpenAI;

  constructor(req: Request, model: string) {
    this._llm = createBizOpenAI(req, model);
    this.baseURL = this._llm.baseURL;
  }

  baseURL: string;

  async chat(payload: ChatStreamPayload) {
    return createChatCompletion({ chatModel: this._llm, payload });
  }
}
